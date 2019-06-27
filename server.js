//Install express server
const express = require('express');
const formidableMiddleware = require('express-formidable');
const bodyParser = require("body-parser");
const concat = require('./api/concat');
const signS3 = require('./api/sign-s3');
const make = require('./api/make');
console.log('env', process.env.STRIPE_TEST_KEY);
const axios = require('axios');

// test key
const stripe = require('stripe')(process.env.STRIPE_TEST_KEY);


const app = express();
//var http = require('http').Server(app);
//app.use(bodyParser.json());
//app.use(bodyParser.urlencoded({
//    extended: true
//}));

// make a comment on this.. lol
app.use(formidableMiddleware());


// Create link to Angular build directory
app.use(express.static(__dirname + '/dist/muvie'));
app.use(express.static(__dirname + '/src/assets'));

// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});

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

app.post("/api/createSeat", async function (req, res) {
    try {
        console.log('request', req);

        //(async () => {
        // get the customer via their email
        stripe.customers.list(
            {
                limit: 3,
                email: ''
            },
            function (err, customers) {
                // async


            }
        );



    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/authSeat", async function (req, res) {
    try {
        console.log('request', req.fields);
        let key = req.fields.mid;
        // check s3 for a key file that is created when a seat is created
        // Make a request for a user with a given ID
        axios.get('https://visualzkeystore.s3.us-east-2.amazonaws.com/' + key + '.key')
            .then(function (response) {
                // handle success
                console.log(response.data);
                res.write(response.data);
                res.end();
                //res.status(200).json();
                //res.end();
            })
            .catch(function (error) {
                throw error.status;
                // handle error
                //console.log(error);
            })
            .finally(function () {
                // always executed

            });
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/removeSeat", async function (req, res) {
    try {

    } catch (err) {
        handleError(res, err, 'nope');
    }
});
