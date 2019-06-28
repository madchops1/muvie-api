//Install express server
const express = require('express');
const formidableMiddleware = require('express-formidable');
const bodyParser = require("body-parser");
const concat = require('./api/concat');
const signS3 = require('./api/sign-s3');
const make = require('./api/make');
//const authSeat = require('./api/authSeat');
//const axios = require('axios');
const request = require('request');
const fs = require('fs');
const AWS = require('aws-sdk');

//console.log('env', process.env.STRIPE_TEST_KEY);

// ENV VARS
//const dotenv = require('dotenv');
//dotenv.config();

//console.log('env', process.env.STRIPE_TEST_KEY);
//if (process.env.ENVIRONMENT == 'development') {
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);
//} else {
//    const stripe = require('stripe')(process.env.STRIPE_KEY);
//}
const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const app = express();
//var http = require('http').Server(app);
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//    extended: true
//}));

// make a comment on this.. lol
//app.use(formidableMiddleware());
app.use(bodyParser({ extended: false }));

// Create link to Angular build directory
app.use(express.static(__dirname + '/dist/muvie'));
app.use(express.static(__dirname + '/src/assets'));

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

/*
//const io = socketIO(server);
var io = require('socket.io')(server);

io.on('connection', (socket) => {
    console.log('Client connected');
    socket.on('disconnect', () => console.log('Client disconnected'));

    socket.on("test", value => {
        console.log('server recieved test', value);
        //safeJoin(docId);
        socket.emit("testclient", value);
    });

    socket.on("make", async data => {
        try {
            console.log('calling api make', data);
            let req = { fields: false };
            req.fields = data;
            let makeVideo = await make.Make(req);
            socket.emit('made', makeVideo);
            //res.write(JSON.stringify(makeVideo));
            //res.end();
        } catch (err) {
            console.log(err);
            //handleError(res, err, 'nope');
        }
    });
});*/

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({ "error": message });
}

/*
// Serve only the static files form the dist directory
app.use(express.static(__dirname + '/dist/muvie'));

app.get('/*', function(req,res) {
    res.sendFile(path.join(__dirname+'/dist/muvie/index.html'));
});

// Start the app by listening on the default Heroku port
app.listen(process.env.PORT || 8080);
*/

/*
app.all('*', function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    //res.header("Access-Control-Allow-Headers", "X-Requested-With");
    //res.header('Access-Control-Allow-Headers', 'Content-Type');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.send(200);
    }
    else {
        next();
    }
    next();
});

app.use(function (req, res, next) {
    //var err = new Error('Not Found');
    //err.status = 404;
    //next(err);
});

app.get("/api/sign-s3", async function (req, res) {
    try {
        let sign = await signS3.signS3(req);
        res.write(JSON.stringify(sign));
        res.end();
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/make", async function (req, res) {
    try {
        console.log('calling api make', req.fields);
        let makeVideo = await make.Make(req);
        res.write(JSON.stringify(makeVideo));
        res.end();
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.get("/api/concat", function (req, res) {
    try {
        let concatVideo = concat.Concat();
        concatVideo.then(function (result) {
            console.log(result);
            res.status(200).json();
        },
            function (err) {
                console.log(err);
                handleError(res, err);
            });
    } catch (err) {

    }
});


// Create Seat
// creates a seat by uploading a file to s3
app.post("/api/createSeat", async function (req, res) {
    let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';
    let email = req.body.email;
    let plan = 0;
    try {
        //console.log('request', req);

        // check stripe for payment
        stripe.customers.list({ limit: 1, email: email },
            function (err, customers) {
                if (err) {
                    handleError(res, err, 'nope');
                }

                //if (customers.data.length == 0) {
                //    throw err;
                //}

                if (customers.data.length && customers.data[0].subscriptions.data.length) {
                    for (i = 0; i < customers.data[0].subscriptions.data.length; i++) {
                        console.log(customers.data[0].subscriptions.data[i]);
                        if (customers.data[0].subscriptions.data[i].status == 'active') {
                            let nickName = customers.data[0].subscriptions.data[i].plan.nickname;
                            if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Popular') !== -1) {
                                plan = 1;
                            }

                            if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Pro') !== -1) {
                                plan = 2;
                            }
                        }
                    }


                    // create the key
                    const params = {
                        Bucket: process.env.KEYSTORE, // pass your bucket name
                        Key: key + '.json', // file will be saved as testBucket/contacts.csv
                        Body: JSON.stringify({ plan: plan, email: email }, null, 2)
                    };

                    s3.upload(params, function (s3Err, data) {
                        if (s3Err) throw s3Err
                        console.log(`File uploaded successfully at ${data.Location}`)

                        request('https://' + process.env.KEYSTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
                            if (!error && response.statusCode == 200) {
                                console.log('success', body);
                                res.status(200).json(JSON.parse(body));
                                //console.log(body) // Show the HTML for the Google homepage.
                            } else {
                                res.status(200).json({ plan: 0, email: '' });
                            }
                        });

                        //res.write(JSON.stringify(params));
                        //res.end();
                    });


                } else {
                    handleError(res, err, 'nope');
                }

            });



    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/authSeat", async function (req, res) {

    //console.log(req.body);
    //try {


    let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';
    await request('https://' + process.env.KEYSTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
        if (!error && response.statusCode == 200) {
            console.log('success', body);
            res.status(200).json(JSON.parse(body));
            //console.log(body) // Show the HTML for the Google homepage.
        } else {
            res.status(200).json({ plan: 0, email: '' });
        }
    });

    //} catch (err) {
    //    handleError(res, err, 'nope');
    //}
});

app.post("/api/removeSeat", async function (req, res) {
    let key = req.body.mid;
    try {
        var params = { Bucket: process.env.KEYSTORE, Key: key + '.json' };
        await s3.deleteObject(params, function (err, data) {
            if (err) {
                throw err;
            } else {
                console.log('remove seat success');
                res.status(200).json();
            }
        });
    } catch (err) {
        handleError(res, err, 'nope');
    }
});
*/