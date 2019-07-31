//Install express server
var sslRedirect = require('heroku-ssl-redirect');
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

//var enforce = require('express-sslify');
//console.log('env', process.env.STRIPE_TEST_KEY);

// ENV VARS
const dotenv = require('dotenv');
dotenv.config();

console.log('env', process.env);
//console.log('Environment', process.env.ENVIRONMENT);

// Twilio
const accountSid = process.env.TWILIO_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const twilioClient = require('twilio')(accountSid, authToken);
const MessagingResponse = require('twilio').twiml.MessagingResponse;
let crowdScreenUrl = process.env.CROWD_SCREEN_URL; //'https://b1ee5978.ngrok.io'; // https://www.visualzstudio.com

// Send a test msg real quick
/*
twilioClient.messages
  .create({
     body: 'This is the ship that made the Kessel Run in fourteen parsecs?',
     from: '+12248777729',
     to: '+16302175813'
   })
  .then(message => console.log(message.sid));
*/

// Stripe
const stripe = require('stripe')(process.env.STRIPE_KEY);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const app = express();

// enable ssl redirect
if (process.env.ENVIRONMENT == 'production') {
    app.use(sslRedirect());
}

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

let crowdScreenKeyMap = {};
let remoteQueKeyMap = {};


//const io = socketIO(server);

var io = require('socket.io')(server);

io.on('connection', (socket) => {

    let mid = socket.handshake.query.mid;
    let remoteQueKey = socket.handshake.query.remoteQueKey;
    if(remoteQueKey) {
        if(!remoteQueKeyMap[remoteQueKey]) {
            remoteQueKeyMap[remoteQueKey] = mid;
        }
    }

    // clean up rooms @TODO

    socket.join(String(mid));
    console.log('Client connected', mid);

    socket.on('disconnect', () => console.log('Client disconnected'));

    // ping/pong every 4 sec
    setInterval(()=> {
        for (let key in crowdScreenKeyMap) {
            let roomMid = crowdScreenKeyMap[key];
            socket.broadcast.to(String(mid)).emit('ping');
        }
    }, 4000);

    socket.on("pong", () => {
        console.log('server received pong');
    });

    socket.on("test", value => {
        console.log('server received test', value);
        socket.emit("testclient", value);
    });

    // receive the remote que request from VISUALZ
    // and pass it on to the website
    socket.on("sendRemoteQue", async data => {
        console.log('server received sendRemoteQue');
        socket.broadcast.to(String(mid)).emit('getRemoteQue', data);
    });

    // receive a refresh que request from the QUE / website
    // and pass it on to the VISUALZ APP
    socket.on("refreshQue", async data => {
        console.log('server received refreshQue');
        socket.broadcast.to(String(mid)).emit('refreshQueRequest', data);
    });

    socket.on("play", async data => {
        console.log('server received play');
        socket.broadcast.to(String(mid)).emit('playRequest', data);
    });

    socket.on("stop", async data => {
        console.log('server received stop');
        socket.broadcast.to(String(mid)).emit('stopRequest', data);
    });

    socket.on("nextTrack", async data => {
        console.log('server received nextTrack');
        socket.broadcast.to(String(mid)).emit('nextTrackRequest', data);
    });

    socket.on("changeTrack", async data => {
        console.log('server received changeTrack');
        socket.broadcast.to(String(mid)).emit('changeTrackRequest', data);
    });

    // Get the crowd screen from VISUALZ 
    // and send it the web server
    socket.on("sendCrowdScreen", async data => {
        console.log('server received sendCrowdScreen', console.log(crowdScreenKeyMap));
        let crowdScreenKey = data.key;
        if(crowdScreenKey) {
            if(!crowdScreenKeyMap[crowdScreenKey]) {
                crowdScreenKeyMap[crowdScreenKey] = data.mid;
            }
        }
        socket.broadcast.to(String(mid)).emit('getCrowdScreen', data);
    });
    
    // receive a refresh crowd screen request from the web server
    // and pass it on to the VISUALZ APP
    socket.on("refreshCrowdScreen", async data => {
        console.log('server received refreshCrowdScreen');
        socket.broadcast.to(String(mid)).emit('refreshCrowdScreenRequest', data);
    });

    // receive an auth request from the remote que 
    // and pass it on to the visualz app
    socket.on("remoteQueAuthorize", async data => {
        console.log('server received authorization request');
        socket.broadcast.to(String(mid)).emit('remoteQueAuthorizationRequest', data);
    });

    socket.on("remoteQueAuthorizationConfirmation", async data => {
        console.log('server received authorization confirmation');
        socket.broadcast.to(String(mid)).emit('getRemoteQueAuthorizationConfirmation', data);
    });

    socket.on("remoteQueAuthorizationDenied", async data => {
        console.log('server received authorization deinied');
        socket.broadcast.to(String(mid)).emit('getRemoteQueAuthorizationDenied', data);
    });

    // get the data uri from the phone and send it to visualz
    socket.on("sendCrowdScreenImage", async data => {
        console.log('server received data Uri Image');
        socket.broadcast.to(String(mid)).emit('getCrowdScreenImage', data);
    });

    /*
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
    */
});


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

app.get("*", (req, res) => {
    //console.log('ALPHA');
    res.sendFile(__dirname + '/dist/muvie/index.html');	//    res.sendFile(__dirname + '/dist/muvie/index.html');
});

/*
app.all('*', function (req, res, next) {
    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.send(200);
    }
    else {
        next();
    }
    next();
});
*/
//app.use(function (req, res, next) {
//var err = new Error('Not Found');
//err.status = 404;
//next(err);
//});

//app.use(function (req, res) {
//    if (!req.secure && process.env.ENVIRONMENT == 'production') {
//        res.redirect("https://" + req.headers.host + req.url);
//    }
//});

//if (process.env.ENVIRONMENT == 'production') {
//app.use(enforce.HTTPS({ trustProtoHeader: true }));
//app.use(function (req, res) {
//    if (!req.secure && process.env.ENVIRONMENT == 'production') {
//        res.redirect("https://" + req.headers.host + req.url);
//    }
//});

//}

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

        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

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
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

            res.status(200).json();
        },
            function (err) {
                console.log(err);
                handleError(res, err);
            });
    } catch (err) {

    }
});

// Twilio webhook
app.post('/api/sms/reply', (req, res) => {
    console.log('received an sms at twilio number', req.body.Body);

    const twiml = new MessagingResponse();
    let key = req.body.Body;

    if(crowdScreenKeyMap[key]) {
        twiml.message('Click the link to connect. ' + crowdScreenUrl + '/crowdscreen/' + crowdScreenKeyMap[key]);
    } else if(remoteQueKeyMap[key])  {
        twiml.message('Click the link to connect. ' + crowdScreenUrl + '/remote-que/' + remoteQueKeyMap[key]);
    } else {
        twiml.message('Could not find the VISUALZ :(');
    }
    
    res.writeHead(200, {'Content-Type': 'text/xml'});
    res.end(twiml.toString());
});

// Create Seat
// creates a seat by uploading a file to s3
app.post("/api/createSeat", async function (req, res) {
    let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';
    let email = req.body.email;
    let plan = 0;
    if (!key) {
        handleError(res, err, 'no key');
    }
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
                                res.header('Access-Control-Allow-Origin', '*');
                                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                                res.status(200).json(JSON.parse(body));
                            } else {
                                res.header('Access-Control-Allow-Origin', '*');
                                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                                res.status(200).json({ plan: 0, email: '', s3Error: error });
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

    console.log(req.body);
    try {


        let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';
        await request('https://' + process.env.KEYSTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                //console.log('success', body);
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                res.status(200).json(JSON.parse(body));
                //console.log(body) // Show the HTML for the Google homepage. 
            } else {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                res.status(200).json({ plan: 0, email: '' });
            }
        });

    } catch (err) {
        handleError(res, err, 'nope');
    }
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
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

                res.status(200).json();
            }
        });
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

