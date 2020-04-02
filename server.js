//Install express server
var sslRedirect = require('heroku-ssl-redirect');
const express = require('express');
const helmet = require('helmet');
const formidableMiddleware = require('express-formidable');
const bodyParser = require("body-parser");
const concat = require('./api/concat');
const signS3 = require('./api/sign-s3');
const uploadFile = require('./api/uploadFile');
const make = require('./api/make');
const convertToMp4 = require('./api/convertToMp4');
const extractFrame = require('./api/extractFrame');
const gifToMp4 = require('./api/gifToMp4');
//const authSeat = require('./api/authSeat');
//const axios = require('axios');
const request = require('request');
const fs = require('fs');
const AWS = require('aws-sdk');
const Async = require('async');
const { ExpressPeerServer } = require('peer');

const fetch = require('node-fetch');
global.fetch = fetch;

const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;

const Pexels = require('node-pexels').Client;

const visualzLatest = '2.0.0';
const kill = []; // array of versions eg. ['2.0.0']
const killMsg = 'This version is dead.';

const baseUrl = 'https://visualz-1.s3.us-east-2.amazonaws.com';

// video library holder
const videoLibrary = [
    // Beeple
    {
        name: 'beeple',
        link: 'http://beeple-crap.com',
        imageUrl: 'https://static.wixstatic.com/media/a64726_ce7a64e6ade34b549d0b3d06963bead9~mv2.jpg/v1/fill/w_263,h_292,al_c,q_80,usm_0.66_1.00_0.01/a64726_ce7a64e6ade34b549d0b3d06963bead9~mv2.webp',
        collections: [
            {
                name: 'manifest',
                downloadUrl: '',
                videos: []
            },
            {
                name: 'ubersketch',
                downloadUrl: '',
                videos: []
            },
            {
                name: 'brainfeeder',
                downloadUrl: '',
                videos: []
            }
            // {
            //     name: 'resolume',
            //     downloadUrl: '',
            //     videos: []
            // },
            // {
            //     name: 'four-color-process',
            //     downloadUrl: '',
            //     videos: []
            // },
            // {
            //     name: 'other',
            //     downloadUrl: '',
            //     videos: []
            // }
        ]
    },
    {
        name: 'random clips',
        link: '',
        imageUrl: '',
        collections: [
            {
                name: 'other',
                downloadUrl: '',
                videos: []
            },
            {
                name: 'soul train',
                downloadUrl: '',
                videos: []
            }
        ]
    }
    // // Catmac
    // {
    //     name: 'Catmac',
    //     link: 'https://vimeo.com/channels/vjfree',
    //     collections: [
    //         {
    //             name: 'All Videos',
    //             videos: []
    //         }
    //     ]
    // },
    // // Switzon
    // {
    //     name: 'Switzon S. Wigfall III',
    //     collections: [
    //         {
    //             name: 'Supreme Cyphers vol.1',
    //             videos: []
    //         },
    //         {
    //             name: 'Supreme Cyphers vol.2',
    //             menu: []
    //         }
    //     ]
    // },
    // // RPTV
    // {
    //     name: 'RPTV',
    //     link: '',
    //     collections: [
    //         {

    //         }
    //     ]
    // }
];

//var enforce = require('express-sslify');
//console.log('env', process.env.STRIPE_TEST_KEY);

// ENV VARS
const dotenv = require('dotenv');
dotenv.config();

console.log('env', process.env);
//console.log('Environment', process.env.ENVIRONMENT);

// Unsplash
const unsplash = new Unsplash({
    accessKey: process.env.UNSPLASH_ACCESS_KEY,
    secretKey: process.env.UNSPLASH_SECRET_KEY
});

const pexels = new Pexels(process.env.PEXELS_API_KEY);

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

// List directories in a directory
function listDirectories(directory = 'video-library/') {
    return new Promise((resolve, reject) => {
        const s3params = {
            Bucket: 'visualz-1',
            MaxKeys: 20,
            Delimiter: '/',
            Prefix: directory
        };
        s3.listObjectsV2(s3params, (err, data) => {
            if (err) {
                reject(err);
            }
            resolve(data);
        });
    });
}

const app = express();

// enable ssl redirect
if (process.env.ENVIRONMENT == 'production') {
    app.use(sslRedirect());
}

app.use(helmet());

app.use(helmet.frameguard({
    action: 'allow-from',
    domain: 'file://'
}));

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

const peerServer = ExpressPeerServer(server, {
    debug: true,
    path: '/peer-server'
});

app.use('/peerjs', peerServer);

// guest uids are in their local storage
function newGuest() {
    return {
        uid: false,
        peerId: false
    };
}

function auth(uid, hostId) {
    if (uid == hostId) {
        return true;
    }
}

function newLiveStreamRoom() {
    return {
        id: '',
        started: Date.now(),
        live: false,
        host: false,
        hostPeer: false,
        name: '',
        label: '',
        description: '',
        email: '',
        guests: [],
        delete: false
    }
}

let crowdScreenKeyMap = {};
let remoteQueKeyMap = {};
let laserzKeyMap = {};
let phoneListHolder = [];
let liveStreamRooms = [];

//const io = socketIO(server);

var io = require('socket.io')(server);
let mainSocket = false;
io.on('connection', (socket) => {
    mainSocket = socket;
    let mid = socket.handshake.query.mid;
    let remoteQueKey = socket.handshake.query.remoteQueKey;
    let roomName = socket.handshake.query.roomName;
    let userId = socket.handshake.query.userId;
    let peerId = socket.handshake.query.peerId;
    let label = socket.handshake.query.label;

    if (remoteQueKey) {
        if (!remoteQueKeyMap[remoteQueKey]) {
            remoteQueKeyMap[remoteQueKey] = mid;
        }
    }

    if (roomName) {

        // new room
        // - set the host
        // - set the peerId
        if (!liveStreamRooms[mid]) {

            // Create the room
            liveStreamRooms[mid] = newLiveStreamRoom();

            // Create the host
            liveStreamRooms[mid].host = userId;
            liveStreamRooms[mid].name = mid;
            liveStreamRooms[mid].hostPeer = peerId;
            if (label != '') {
                liveStreamRooms[mid].label = label;
            }

        }
        // room exists
        // - this is is the host coming back to the room, or opening a second window.......
        else if (userId == liveStreamRooms[mid].host) {
            //...

        }
        // room exists
        // - this is a guest coming to the room 
        else {

            // Add a guest to the room if they don't exist
            if (liveStreamRooms[mid] && !liveStreamRooms[mid].guests[userId]) {
                liveStreamRooms[mid].guests[userId] = newGuest();
                liveStreamRooms[mid].guests[userId].uid = userId;
                liveStreamRooms[mid].guests[userId].peerId = peerId;
            }
        }
    }

    // clean up rooms @TODO

    socket.join(String(mid));
    console.log('Client connected', mid);

    socket.on('disconnect', () => {

        console.log('Client disconnected', mid);
        // if there is a room and this is the host then not live
        if (liveStreamRooms[mid]) {
            if (userId == liveStreamRooms[mid].host) {
                liveStreamRooms[mid].live = false;
            }
        }
    });

    // ping/pong crowd screens, and laserz, every 4 sec to keep them connected
    setInterval(() => {
        //console.log('ping');

        //console.log('CrowdScreenMap:');
        for (let key in crowdScreenKeyMap) {
            let roomMid = crowdScreenKeyMap[key];
            //console.log(roomMid);
            //let clients = //''io.sockets.clients(String(mid)); // all users from room
            //socket.broadcast.to(String(mid)).emit('ping');
            socket.broadcast.to(String(roomMid)).emit('ping');
            //let clients = io.sockets.clients(String(mid)); // all users from room
            //console.log('CONNECTIONS', mid, clients);
        }

        //console.log('LiveStreamRooms:');
        Object.keys(liveStreamRooms).forEach(key => {
            let name = liveStreamRooms[key].name;
            let started = liveStreamRooms[key].started / 1000;
            let now = Date.now() / 1000;

            //console.log(name);
            socket.broadcast.to(String(name)).emit('ping');
            //let clients = //''io.sockets.clients(String(mid)); // all users from room
            io.of('/').adapter.clients([String(name)], (err, clients) => {
                //console.log('CONNECTIONS', name, clients);
                socket.broadcast.to(String(name)).emit('clientCount', clients.length);
            });

            // 6 hour limit room cleanup
            if (now - started > 86400) {
                // Mark for deletion, unecessary
                liveStreamRooms[key].delete = true;

                // delete
                delete liveStreamRooms[key];
            }
        });

    }, 4000);

    socket.on("pong", () => {
        console.log('server received pong');
    });

    socket.on("test", value => {
        console.log('server received test', value);
        socket.emit("testclient", value);
    });

    socket.on("peerId", value => {
        console.log('server received peerId', value);
        socket.broadcast.to(String(value.mid)).emit('peerIdUpdate', value);
    });

    socket.on("refreshSignal", value => {
        console.log('server received refreshSignal', value);
        socket.broadcast.to(String(value)).emit('refreshSignal');
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
    // Maps the key to the room mid
    // and send it the website
    socket.on("sendCrowdScreen", async data => {
        console.log('server received sendCrowdScreen', crowdScreenKeyMap, data);
        let crowdScreenKey = data.key;
        if (crowdScreenKey) {
            if (!crowdScreenKeyMap[crowdScreenKey]) {
                crowdScreenKeyMap[crowdScreenKey] = data.mid;
                phoneListHolder[data.mid] = [];
            }
        }
        socket.broadcast.to(String(mid)).emit('getCrowdScreen', data);

        //let clients = //''io.sockets.clients(String(mid)); // all users from room
        io.of('/').adapter.clients([String(mid)], (err, clients) => {
            console.log('CONNECTIONS', mid, clients);
            socket.broadcast.to(String(mid)).emit('clientCount', clients.length);
        });

    });

    // receive a refresh crowd screen request from the web server
    // and pass it on to the VISUALZ APP
    socket.on("refreshCrowdScreen", async data => {

        console.log('server received refreshCrowdScreen');

        io.of('/').adapter.clients([String(mid)], (err, clients) => {
            console.log('CONNECTIONS', mid, clients);
            socket.broadcast.to(String(mid)).emit('refreshCrowdScreenRequest', clients.length);
        });

        //socket.broadcast.to(String(mid)).emit('refreshCrowdScreenRequest', data);


        // let clients = io.sockets.clients(String(mid)); // all users from room
        // console.log('CONNECTIONS', mid, clients);
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

    //
    // Livestream Socket Stuff
    //
    // socket.on("hostCheck", async data => {
    //     console.log('server received host check');
    //     socket.broadcast.to(String(mid)).emit('getCrowdScreenImage', data);
    // });


    // // Twilio webhook
    // app.post('/api/sms/reply', (req, res) => {
    //     console.log('received an sms at twilio number', req.body.Body, req);

    //     const twiml = new MessagingResponse();
    //     let key = req.body.Body;

    //     if (crowdScreenKeyMap[key]) {

    //         // send the text to the user to connect
    //         twiml.message('Click the link to connect. ' + crowdScreenUrl + '/crowdscreen/' + crowdScreenKeyMap[key]);

    //         // send the number to the app


    //     } else if (remoteQueKeyMap[key]) {
    //         twiml.message('Click the link to connect. ' + crowdScreenUrl + '/remote-que/' + remoteQueKeyMap[key]);
    //     } else if (laserzKeyMap[key]) {
    //         twiml.message('Click the link to connect. ' + crowdScreenUrl + '/laserz/' + laserzKeyMap[key]);
    //     } else {
    //         twiml.message('Connection Error :(');
    //     }

    //     res.writeHead(200, { 'Content-Type': 'text/xml' });
    //     res.end(twiml.toString());
    // });

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

// Get the environment
app.get('/api/env', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    const { AUTH0_CLIENT_ID, AUTH0_DOMAIN } = process.env;
    if (!AUTH0_CLIENT_ID && !AUTH0_DOMAIN) {
        return res.status(400).json({ message: 'No env set.' });
    }
    res.json({ AUTH0_CLIENT_ID, AUTH0_DOMAIN });
});

// Get the latest version
app.get('/api/latest', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    //console.log('LATEST', 'DELTA');
    res.status(200).json({ "version": visualzLatest });
});

// Get the kill command
app.get('/api/kill', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    //console.log('LATEST', 'ECHO');
    res.status(200).json({
        "kill": kill,
        "killMsg": killMsg
    });
});

// Get the video library
app.get('/api/videos', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    videoLibrary.forEach((artist) => {
        artist.collections.forEach((collection) => {
            let path = 'video-library/' + artist.name + '/' + collection.name + '/'
            listDirectories(path).then((contents) => {
                console.log('CHUCKY', contents);
                contents.Contents.shift();
                collection.videos = contents.Contents;
            });
        });
    });

    setTimeout(() => {
        res.status(200).json(videoLibrary);
    }, 2000);
});

// Get photos from unsplash
app.get('/api/photos', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    console.log('REQ', req.query.tag);

    // PEXELS API
    pexels.search(req.query.tag, 1, Math.floor(Math.random() * 1000) + 1)
        .then((results) => {
            if (results.photos.length == 0) {

                throw 'err';
                //handleError(res, '', 'nope resultos');
                //return;
            }
            res.write(JSON.stringify(results.photos[0]));
            res.end();
        })
        .catch((error) => {
            // Something bad happened
            handleError(res, error, 'nope');
            console.error(error);
        });

    // UNSPLASH API
    // unsplash.photos.getRandomPhoto(String(req.query.tag))
    //     .then(toJson)
    //     .then(json => {
    //         res.write(JSON.stringify(json));
    //         res.end();
    //     })
    //     .catch(err => {
    //         console.log('err', err);
    //     });

});

// // Get directories
// app.get('/api/dirs', function (req, res) {
//     res.header('Access-Control-Allow-Origin', '*');
//     res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
//     res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

//     let dir;
//     if (req.query.dir) {
//         dir = req.query.dir;
//     } else {
//         dir = 'video-library/'
//     }

//     listDirectories(dir).then((dirs) => {
//         res.status(200).json(dirs);
//     });
// })

// Sign s3 visualz
app.get("/api/sign-s3-visualz", async function (req, res) {
    console.log('upload from visualz');
    try {
        let sign = await uploadFile.uploadFile(req);
        res.write(JSON.stringify(sign));
        res.end();
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

// Sign s3 muvie
app.get("/api/sign-s3", async function (req, res) {
    try {
        let sign = await signS3.signS3(req);
        res.write(JSON.stringify(sign));
        res.end();
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.get('/api/livestream/getrooms', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    console.log('received a get request to getrooms');
    try {
        console.log('liveStreamRooms', liveStreamRooms);
        let response = [];
        let keys = Object.keys(liveStreamRooms);
        keys.forEach(name => {
            response.push(liveStreamRooms[name]);
        });
        res.write(JSON.stringify({ rooms: response }));
    }
    catch (err) {
        handleError(res, err, 'nope');
    }
    res.end();
});

app.get('/api/livestream/room', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to room', req.query);
    try {
        let roomName = req.query.roomName;
        res.write(JSON.stringify({ data: liveStreamRooms[roomName] }));
        res.end();
    }
    catch (err) {
        handleError(res, err, 'nope');
    }
});

app.get('/api/livestream/toggleLive', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to togglelive', req.query);
    try {
        let uid = req.query.userId;
        let roomName = req.query.roomName;
        let live = req.query.live;
        if (auth(uid, liveStreamRooms[roomName].host)) {
            console.log('Live streaming', live);
            liveStreamRooms[roomName].live = live;
            res.write(JSON.stringify({ live: live }));
        } else {
            res.write(JSON.stringify({ msg: 'not the host' }));
        }
        res.end();
    }
    catch (err) {
        handleError(res, err, 'nope');
    }
});

// Am I host, for livestream
app.get('/api/livestream/amihost', async (req, res) => {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to amihost', req.query);
    try {
        let uid = req.query.userId;
        let roomName = req.query.roomName;
        let peerId = req.query.peerId;
        let label = req.query.label;

        // if the user is host
        if (liveStreamRooms[roomName] && liveStreamRooms[roomName].host == uid) {
            // update the host peerId
            liveStreamRooms[roomName].hostPeer = peerId;

            if (label != '') {
                liveStreamRooms[roomName].label = label;
            }

            //
            res.write(JSON.stringify({ host: true, label: label }));
        }
        // if the user is guest
        else {
            res.write(JSON.stringify({ host: false, hostPeer: liveStreamRooms[roomName].hostPeer, label: liveStreamRooms[roomName].label }));
        }
        res.end();
    }
    catch (err) {
        handleError(res, err, 'nope');
    }

});

// Website Entrypoint
app.get("*", (req, res) => {
    //console.log('ALPHA');
    res.sendFile(__dirname + '/dist/muvie/index.html');	//    res.sendFile(__dirname + '/dist/muvie/index.html');
});

// const server

// const peerServer = ExpressPeerServer({
//     port: 9000,
//     path: '/peer-server'
// });


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

app.post("/api/convertToMp4", async function (req, res) {
    try {
        console.log('calling api convertToMp4', req.fields);
        let convertVideo = await convertToMp4.ConvertToMp4(req);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.write(JSON.stringify(convertVideo));
        res.end();
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/gifToMp4", async function (req, res) {
    try {
        console.log('calling api gifToMp4', req.body);
        let convertGif = await gifToMp4.GifToMp4(req);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.status(200).json(convertGif);
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

app.post("/api/extractFrame", async function (req, res) {
    try {
        console.log('calling api extractFrame');
        let getFrame = await extractFrame.ExtractFrame(req);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.status(200).json(getFrame);
    } catch (err) {
        handleError(res, err, 'nope');
    }
});

// Twilio webhook
app.post('/api/sms/reply', (req, res) => {
    console.log('received an sms at twilio number', req.body.Body);
    const twiml = new MessagingResponse();
    let key = req.body.Body;
    // Crowdscreen connect
    if (crowdScreenKeyMap[key]) {
        // send the text to the user to connect
        twiml.message('Click the link to connect. ' + crowdScreenUrl + '/crowdscreen/' + crowdScreenKeyMap[key]);
        // send the number to the app
        //mainSocket.emit('newPhoneNumber', req.body.From);
        //phoneListHolder[String(crowdScreenKeyMap[key])].push = req.body.From;
        mainSocket.broadcast.to(String(crowdScreenKeyMap[key])).emit('newPhoneNumber', req.body.From);
    }
    // Remote Connect
    else if (remoteQueKeyMap[key]) {
        twiml.message('Click the link to connect. ' + crowdScreenUrl + '/remote-que/' + remoteQueKeyMap[key]);
    }
    // Laserz
    // else if (laserzKeyMap[key]) {
    //     twiml.message('Click the link to connect. ' + crowdScreenUrl + '/laserz/' + laserzKeyMap[key]);
    // } 
    // Error
    else {
        twiml.message('Connection Error :(');
    }
    res.writeHead(200, { 'Content-Type': 'text/xml' });
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
