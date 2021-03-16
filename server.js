var sslRedirect = require('heroku-ssl-redirect');
const express = require('express');
const helmet = require('helmet');
//const formidableMiddleware = require('express-formidable');
const bodyParser = require("body-parser");
//const axios = require('axios');
const request = require('request');
const fs = require('fs');
const AWS = require('aws-sdk');
const Async = require('async');
//const { ExpressPeerServer } = require('peer');
//require('newrelic');
const md5 = require('md5');

const fetch = require('node-fetch');
global.fetch = fetch;

const Unsplash = require('unsplash-js').default;
const toJson = require('unsplash-js').toJson;
const Pexels = require('node-pexels').Client;

const concat = require('./api/concat');
const signS3 = require('./api/sign-s3');
const uploadFile = require('./api/uploadFile');
const make = require('./api/make');
const convertToMp4 = require('./api/convertToMp4');
const extractFrame = require('./api/extractFrame');
const gifToMp4 = require('./api/gifToMp4');

const handleChargeSucceeded = require('./api/lib/stripe').handleChargeSucceeded;
const getSubscriptions = require('./api/lib/stripe').getSubscriptions;
const getTags = require('./api/tags').getTags;

//const authSeat = require('./api/authSeat');

const visualzLatest = '2.1.6';
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

var Mailchimp = require('mailchimp-api-v3')
var mailchimp = new Mailchimp(process.env.MAILCHIMP_API_KEY);

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

// Stripe
const stripe = require('stripe')(process.env.STRIPE_KEY);

const s3 = new AWS.S3({
    accessKeyId: process.env.AWS_ACCESS_KEY,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// List directories in a directory
function listDirectories(directory = 'video-library/', bucket = 'visualz-1') {
    return new Promise((resolve, reject) => {
        const s3params = {
            Bucket: bucket,
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

/**
 * 
 * 
 * Database.
 * 
 * 
 */
//const { Client } = require('pg');
const { Sequelize, DataTypes, Model } = require('sequelize');

const sequelize = new Sequelize(process.env.DB_URI, {
    dialectOptions: {
        ssl: {
            require: true,
            rejectUnauthorized: false,
        },
        keepAlive: true,
    },
    ssl: true,
    logging: false
});

dbConnect();

async function dbConnect() {
    try {
        await sequelize.authenticate();
        console.log('Connection has been established successfully.');
    } catch (error) {
        console.error('Unable to connect to the database:', error);
    }
};

// Models
//const marketplaceSet = require('./api/marketplaceSet');
class Set extends Model { }
class SetRawFile extends Model { }
class PackPurchase extends Model { }
class Tag extends Model { }
class SetTag extends Model { }
class ArtistTypeTag extends Model { }
class Artist extends Model { }
class ArtistTag extends Model { }

Artist.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    email: {
        type: DataTypes.STRING
    },
    name: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    authzero: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'Artist',
    tableName: 'artists'
});

Set.init({
    // Model attributes are defined here
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    ArtistId: {
        type: DataTypes.INTEGER,
        references: {
            model: Artist,
            key: 'id'
        }
    },
    name: {
        type: DataTypes.STRING
    },
    description: {
        type: DataTypes.STRING
    },
    price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    coverImage: {
        type: DataTypes.STRING
    },
    setFile: {
        type: DataTypes.STRING
    },
    stripeId: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    published: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    approved: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: false
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    // Other model options go here
    sequelize, // We need to pass the connection instance
    modelName: 'Set', // We need to choose the model name
    tableName: 'sets'
});

SetRawFile.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    SetId: {
        type: DataTypes.INTEGER,
        references: {
            // This is a reference to another model
            model: Set,
            key: 'id'
        }
    },
    file: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'SetRawFile',
    tableName: 'setrawfiles'
});

PackPurchase.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    SetId: {
        type: DataTypes.INTEGER,
        references: {
            // This is a reference to another model
            model: Set,
            key: 'id'
        }
    },
    email: {
        type: DataTypes.STRING
    },
    // ArtistId: {
    //     type: DataTypes.INTEGER,
    //     references: {
    //         // This is a reference to another model
    //         model: Artist,
    //         key: 'id'
    //     }
    // },
    price: {
        type: DataTypes.DECIMAL(10, 2)
    },
    stripeId: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'PackPurchase',
    tableName: 'packpurchases'
});

Tag.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'Tag',
    tableName: 'tags'
});

ArtistTypeTag.init({
    id: {
        type: DataTypes.INTEGER,
        autoIncrement: true,
        primaryKey: true
    },
    name: {
        type: DataTypes.STRING
    },
    active: {
        type: DataTypes.BOOLEAN,
        allowNull: false,
        defaultValue: true
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'ArtistTypeTag',
    tableName: 'artisttypetags'
});

SetTag.init({
    SetId: {
        type: DataTypes.INTEGER,
        references: {
            model: Set,
            key: 'id'
        }
    },
    TagId: {
        type: DataTypes.INTEGER,
        references: {
            model: Tag,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'SetTag',
    tableName: 'settags'
});

ArtistTag.init({
    ArtistTypeTagId: {
        type: DataTypes.INTEGER,
        references: {
            model: ArtistTypeTag,
            key: 'id'
        }
    },
    ArtistId: {
        type: DataTypes.INTEGER,
        references: {
            model: Artist,
            key: 'id'
        }
    },
    createdAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    },
    updatedAt: {
        type: DataTypes.DATE,
        allowNull: false,
        defaultValue: sequelize.literal('NOW()')
    }
}, {
    sequelize,
    modelName: 'ArtistTag',
    tableName: 'artisttags'
});


// Sync 
//syncModels({ force: false }); // dev - creates the tables, dropping them first
//syncModels({ alter: true }); // dev - make necessary schema changes match the model
syncModels(); // production

// Model Associations
Set.hasMany(SetRawFile);
SetRawFile.belongsTo(Set);

PackPurchase.belongsTo(Set); // User's get a pack purchase for each pack they own
//PackPurchase.belongsTo(Artist);
Set.hasMany(PackPurchase);

Set.belongsToMany(Tag, { through: SetTag });
Tag.belongsToMany(Set, { through: SetTag });

Artist.hasMany(Set);
Set.belongsTo(Artist);

ArtistTypeTag.belongsToMany(Artist, { through: ArtistTag });
Artist.belongsToMany(ArtistTypeTag, { through: ArtistTag });

async function syncModels() {
    await sequelize.sync({ alter: true }); // NEVER FORCE only ALTER on prod{ force: true } or { alter: true }
    console.log("All models were synchronized successfully.");
}

// const client = new Client({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//         rejectUnauthorized: false
//     }
// });

// client.connect();

// client.query('SELECT table_schema,table_name FROM information_schema.tables;', (err, res) => {
//     if (err) throw err;
//     for (let row of res.rows) {
//         console.log(JSON.stringify(row));
//     }
//     client.end();
// });

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
    };
}

let crowdScreenKeyMap = {};
let remoteQueKeyMap = {};
let mobileVideoKeyMap = {};
let modulePeerMap = {};
let appPeerMap = {};
let phoneListHolder = [];
let liveStreamRooms = [];
let crowdScreenKey = '';

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
    let heartbeatInterval;

    heartbeatInterval = setInterval(() => {
        //socket.broadcast.in(String(mid)).emit('heart', { mid: String(mid) });
        //socket.broadcast.in(String(mid)).emit('heart', { mid: String(mid) });
        io.to(String(mid)).emit('heart');
        //console.log('heart', String(mid));
    }, 20000);

    //console.log('ROOMS ALPHA', socket.rooms);

    // Join the mid room
    socket.join(String(mid), (err) => {
        if (err) {
            console.log('err', err);
        } else {
            console.log('JOINED', String(mid));
        }
    });

    //console.log('Client connected', String(mid));
    //console.log('ROOMS BETA', socket.rooms);

    if (remoteQueKey) {
        if (!remoteQueKeyMap[remoteQueKey]) {
            remoteQueKeyMap[remoteQueKey] = mid;
        }
    }

    //console.log('roomName', roomName);

    if (roomName && roomName != 'false') {

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


    // ping/pong crowd screens, and laserz, every 4 sec to keep them connected
    //setInterval(() => {

    //console.log('ALPHA PING', mid);
    //console.log('crowdScreenKeyMap', Object.keys(crowdScreenKeyMap).length);
    // console.log('liveStreamRooms', Object.keys(liveStreamRooms).length);
    // console.log('remoteQueKeyMap', Object.keys(remoteQueKeyMap).length);
    // console.log('mobileVideoKeyMap', Object.keys(mobileVideoKeyMap).length);
    // console.log('modulePeerMap', Object.keys(modulePeerMap).length);
    //console.log('--------------------------');



    // //console.log('CrowdScreenMap:');
    //for (let key in crowdScreenKeyMap) {
    //let roomMid = crowdScreenKeyMap[key];
    //console.log(roomMid);
    //let clients = //''io.sockets.clients(String(mid)); // all users from room
    //socket.broadcast.to(String(mid)).emit('ping');



    //console.log('CROWD H', String(mid));
    //let clients = io.sockets.clients(String(mid)); // all users from room
    //console.log('CONNECTIONS', mid, clients);
    //}

    // //console.log('LiveStreamRooms:');
    // Object.keys(liveStreamRooms).forEach(key => {

    //     //console.log('', key, liveStreamRooms[key]);

    //     let name = liveStreamRooms[key].name;
    //     let started = liveStreamRooms[key].started / 1000;
    //     let now = Date.now() / 1000;

    //     //console.log(name);
    //     socket.broadcast.to(String(name)).emit('ping');
    //     //let clients = //''io.sockets.clients(String(mid)); // all users from room
    //     io.of('/').adapter.clients([String(name)], (err, clients) => {
    //         //console.log('CONNECTIONS', name, clients);
    //         socket.broadcast.to(String(name)).emit('clientCount', clients.length);
    //         console.log('ROOM PING', String(name));

    //     });

    //     // 6 hour limit room cleanup
    //     if (now - started > 86400) {
    //         // Mark for deletion, unecessary
    //         liveStreamRooms[key].delete = true;

    //         // delete
    //         delete liveStreamRooms[key];
    //     }
    // });
    //}, 4000);

    // clean up rooms @TODO
    socket.on('disconnect', () => {
        console.log('Client disconnected', mid);
        // if there is a room and this is the host then not live
        if (liveStreamRooms[mid]) {
            if (userId == liveStreamRooms[mid].host) {
                liveStreamRooms[mid].live = false;
            }
        }

        // Cleanup Crowdscreenkeys
        if (crowdScreenKeyMap[crowdScreenKey]) {
            delete crowdScreenKeyMap[crowdScreenKey];
        }

        // Stop heart
        clearTimeout(heartbeatInterval);
    });

    socket.on("beat", async value => {
        //console.log('beat', value);
        //socket.broadcast.in(String(mid)).emit('heart', value);
        //io.to(String(mid)).emit('heart');
    });

    socket.on("test", async value => {
        console.log('server received test', value);
        socket.emit('testclient', value);
    });

    socket.on("peerId", async value => {
        console.log('server received peerId', value);
        socket.broadcast.to(String(value.mid)).emit('peerIdUpdate', value);
    });

    socket.on("refreshSignal", async value => {
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

    socket.on("reloadCrowdScreen", async data => {
        console.log('server received reloadCrowdScreen');
        socket.broadcast.to(String(mid)).emit('reloadCrowdScreen', data);
    })

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

    socket.on("sendOnTheAir", async data => {
        console.log('server received sendOnTheAir');
        socket.broadcast.to(String(mid)).emit('getOnTheAir', data);
    });

    // Get the crowd screen from VISUALZ 
    // Maps the key to the room mid
    // and send it the website
    socket.on("sendCrowdScreen", async data => {
        console.log('server received sendCrowdScreen', crowdScreenKeyMap, data);
        crowdScreenKey = data.key;
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

    socket.on("mapModulePeer", async data => {
        console.log('server received map module peer', data);
        modulePeerMap[data.sid] = data.pid;
    });

    // Connect the movile video keymap for twilio
    socket.on("connectMobileVideo", async data => {
        console.log('server received connectMobileVideo', data);
        let mobileVideoKey = data.key;
        if (mobileVideoKey) {
            mobileVideoKeyMap[mobileVideoKey] = {
                mid: data.mid,
                pid: data.pid,
                opid: data.opid,
                sid: data.sid
            }
        }
    });

    // Get the mobile video from the mobile remote camera
    // theis gets and matches the proper peerid...
    socket.on("requestMobileVideoData", async data => {
        console.log('server received get MobileVideo', data);
        let match = false;
        Object.keys(mobileVideoKeyMap).forEach(key => {
            if (mobileVideoKeyMap[key].opid == data.opid) {
                match = mobileVideoKeyMap[key].pid;
            }
        });
        socket.broadcast.to(String(mid)).emit('getMobileVideoData', match);
    });

    // Get the peer id from the app and set it in the app peer map
    socket.on('sendPeerId', async data => {
        console.log('server received sendPeerId', data);
        appPeerMap[data.mid] = data;
        // TODO... maybe trigger the refresh here
    });

    socket.on('sendRemoteScreenRefresh', async data => {
        console.log('server received sendErmoteScreenRefresh');
        socket.broadcast.to(String(mid)).emit('sendRemoteScreenRefresh', data);
    });

    socket.on('requestPeerId', async data => {
        console.log('server received requestPeerId', data);
        let match = false;
        Object.keys(appPeerMap).forEach(key => {
            if (appPeerMap[key].opid == data.opid) {
                match = appPeerMap[key].pid;
            }
        })
        socket.broadcast.to(String(mid)).emit('getPeerId', match);
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

    socket.on("makeV2", async data => {
        console.log('calling api makeV2', data);
        let makeVideo;
        // Educational and Commercial licenses
        if (data.plan == 0) {
            makeVideo = await make.MakeV2(data);
        } else {
            console.log('COMMERCIAL');
            makeVideo = await make.MakeV2Commercial(data);
        }
        console.log('makeV2 Done, mid:', mid);
        io.in(String(mid)).emit('makeV2Complete', makeVideo);
    });


});

// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(code || 500).json({ "error": message });
}

// Generic success handler used by all endpoints.
function handleSuccess(res, obj) {
    //console.log("ERROR: " + reason);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(200).json(obj);
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

    const { AUTH0_CLIENT_ID, AUTH0_DOMAIN, XIRSYS_CHANNEL, XIRSYS_IDENTITY, XIRSYS_SECRET, PEERJS_SERVER } = process.env;
    if (!AUTH0_CLIENT_ID && !AUTH0_DOMAIN) {
        return res.status(400).json({ message: 'No env set.' });
    }
    res.json({ AUTH0_CLIENT_ID, AUTH0_DOMAIN, XIRSYS_CHANNEL, XIRSYS_IDENTITY, XIRSYS_SECRET, PEERJS_SERVER });
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

// Get the modulepeermap command
app.get('/api/modulepeermap', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(200).json({
        "map": modulePeerMap
    });
});

// Get the video library
app.get('/api/videos', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    videoLibrary.forEach((artist) => {
        artist.collections.forEach((collection) => {
            let path = 'video-library/' + artist.name + '/' + collection.name + '/';
            listDirectories(path).then((contents) => {
                //console.log('CHUCKY', contents);
                contents.Contents.shift();
                collection.videos = contents.Contents;
            });
        });
    });

    setTimeout(() => {
        res.status(200).json(videoLibrary);
    }, 2000);
});

// Get the marketplace
app.get('/api/marketplace', function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    let path = 'marketplace-packs/';
    listDirectories(path).then((contents) => {
        res.status(200).json(contents);
    });
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

/**
 * Search VJ packs 
 *      - Used on the marketplace page
 */
app.get("/api/sets", async function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to search', req.query);

    if (req.query.tags) {

    }

    Set.findAll({
        where: {
            active: true
        },
        include: [
            { model: SetRawFile },
            { model: Artist },
            {
                model: Tag,
                //where: {
                //    name: 'Glitch'
                //}
            }
        ]
    }).then((res2) => {
        res.write(JSON.stringify(res2));
        res.end();
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

/**
 * Get Set Tags
 *      - Used on the marketplace page
 */
app.get("/api/sets/tags", async function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to search', req.query);
    Tag.findAll({
        where: {
            active: true
        }
    }).then((res2) => {
        res.write(JSON.stringify(res2));
        res.end();
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

/**
 * Get Artists
 *      - Used on the marketplace page
 */
app.get("/api/artists", async function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to search', req.query);
    Artist.findAll({
        where: {
            active: true
        }
    }).then((res2) => {
        res.write(JSON.stringify(res2));
        res.end();
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

/**
 * Get Set Tags
 *      - Used on the marketplace page
 */
app.get("/api/artists/tags", async function (req, res) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    console.log('received a get request to search', req.query);
    ArtistTypeTag.findAll({
        where: {
            active: true
        }
    }).then((res2) => {
        res.write(JSON.stringify(res2));
        res.end();
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

// Website Entrypoint
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

// took too long so used socket
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

// Upload base-64 crownd/fan screen base64
app.post("/api/upload-base-64", async function (req, res) {
    console.log('upload base64 from visualz');
    try {
        let file = await uploadFile.uploadBase64(req);
        res.write(JSON.stringify(file));
        res.end();
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

// app.post("/api/makeVideo", async function (req, res) {
//     console.log('calling api makeVideo');
//     let getVideo = await ma
// });

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
    // Mobile Video connect
    else if (mobileVideoKeyMap[key]) {
        twiml.message('Click the link to connect. ' + crowdScreenUrl + '/mobile-video/' + mobileVideoKeyMap[key].mid + '/' + mobileVideoKeyMap[key].pid + '/' + mobileVideoKeyMap[key].sid);
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

// Stripe webhook
app.post('/api/stripe/webhook', bodyParser.raw({ type: 'application/json' }), (request, response) => {
    let event;

    console.log('CHARLIE', request.body);

    try {
        event = request.body;
        //event = JSON.parse(request.body);
        //event = JSON.parse(request.body.object);
    } catch (err) {
        response.status(400).send(`Webhook Error: ${err.message}`);
    }

    console.log('ALPHA', event);
    //console.log('BETA', event.data.object);

    // Handle the event
    switch (event.type) {
        case 'charge.succeeded':
            handleChargeSucceeded(event.data.object);
            break;
        default:
            console.log(`Unhandled event type ${event.type}`);
    }

    // Return a response to acknowledge receipt of the event
    response.json({ received: true });
});

/**
 * Stripe Customer Portal Session
 * - takes customer 
 */
app.post("/api/stripe/customerportal", async (req, res) => {

    console.log('DELTA', req.body);

    let session = await stripe.billingPortal.sessions.create({
        customer: req.body.customer,
        return_url: process.env.CROWD_SCREEN_URL + '/account'
    });

    console.log('SESSION', session);
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
    res.status(200).json({ url: session });
});

// Start Free Trial
app.post("/api/startFreeTrial", async function(req, res) {
    let key = req.body.mid;
    let timestamp = Date.now();

    if (!key) {
        alert('No machine id. Please restart the app and try again');
        handleError(res, 'err', 'no key');
    }

    try {

        // Check for a freestore
        request('https://' + process.env.FREESTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
            if (!error && response.statusCode == 200) {
                console.log('success', body);

                // Return the freestore timestamp
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                res.status(200).json(JSON.parse(body));
            } else {

                // Create the freestore timestamp
                // Create the key
                const params = {
                    Bucket: process.env.FREESTORE, // pass your bucket name
                    Key: key + '.json', // file will be saved as testBucket/contacts.csv
                    Body: JSON.stringify({ freeTrial: timestamp }, null, 2)
                };

                // Upload it...
                s3.upload(params, function (s3Err, data) {
                    if (s3Err) throw s3Err
                    console.log(`File uploaded successfully at ${data.Location}`)

                    // Check it...
                    request('https://' + process.env.FREESTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
                        if (!error && response.statusCode == 200) {
                            console.log('success', body);
                            res.header('Access-Control-Allow-Origin', '*');
                            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                            res.status(200).json(JSON.parse(body));
                        } else {
                            handleError(res, err, 'nope');
                        }
                    });
                });
            }
        });

    } catch (err) {
        handleError(res, err, 'nope');
    }
});

// Create Seat
// creates a seat by uploading a file to s3
app.post("/api/createSeat", async function (req, res) {
    let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';
    let email = req.body.email.toLowerCase();
    let plan = 0;

    console.log('key', key);
    console.log('email', email);

    if (!key) {
        alert('No machine id. Please restart the app and try again');
        handleError(res, 'err', 'no key');
    }
    try {

        //console.log('request', req);
        // check stripe for payment
        stripe.customers.list({ limit: 100, email: email },
            function (err, customers) {
                if (err) {
                    //alert('Issue verifying purchase with stripe.')
                    handleError(res, err, 'nope');
                }

                //console.log('CUSTOMERS', customers.data.length, customers.data);

                for(i=0; i<customers.data.length; i++) {
                    for(j=0; j<customers.data[i].subscriptions.data.length; j++) {
                        if (customers.data[i].subscriptions.data[j].status == 'active') {
                    
                            let nickName = customers.data[i].subscriptions.data[j].plan.nickname;
                            //console.log('plan', nickName);

                            if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Educational') !== -1) {
                                if (plan <= 1) {
                                    plan = 1;
                                }
                            }

                            if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Commercial') !== -1) {
                                plan = 2;
                            }
                        }
                    }
                }
                
                // A customer with a subscription was located
                if(plan > 0) {

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

app.post("/api/authSeat/email", async function (req, res) {

    let path = '/';
    listDirectories(path, 'viualzkeystore').then((contents) => {
        console.log('CHUCKY', contents);
        contents.Contents.shift();
        let keys = contents.Contents;
        console.log('DUCKY', keys);

        //keys.forEach(() => {
        //})

    });
});

app.post("/api/authSeat", async function (req, res) {
    console.log(req.body);
    let plan = 0;

    try {
        let key = req.body.mid; //'27540e6c-3929-4733-bc0b-314f657dec0b';

        // Check for a keystore
        await request('https://' + process.env.KEYSTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', async function (error, response, body) {
            if (!error && response.statusCode == 200) {
                
                console.log('BODY', JSON.parse(body));
                let json = JSON.parse(body);

                try {

                    //console.log('request', req);
                    // check stripe for payment
                    stripe.customers.list({ limit: 100, email: json.email },
                        function (err, customers) {
                            if (err) {
                                //alert('Issue verifying purchase with stripe.')
                                handleError(res, err, 'nope');
                            }
            
                            //console.log('CUSTOMERS', customers.data.length, customers.data);
            
                            for(i=0; i<customers.data.length; i++) {
                                for(j=0; j<customers.data[i].subscriptions.data.length; j++) {
                                    if (customers.data[i].subscriptions.data[j].status == 'active') {
                                
                                        let nickName = customers.data[i].subscriptions.data[j].plan.nickname;
                                        //console.log('plan', nickName);
            
                                        if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Educational') !== -1) {
                                            if (plan <= 1) {
                                                plan = 1;
                                            }
                                        }
            
                                        if (nickName.indexOf('Visualz') !== -1 && nickName.indexOf('Commercial') !== -1) {
                                            plan = 2;
                                        }
                                    }
                                }
                            }
                            
                            // A customer with a subscription was located
                            if(plan > 0) {
                                res.header('Access-Control-Allow-Origin', '*');
                                res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                                res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                                res.status(200).json(JSON.parse(body));
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

            } else {

                // Check for a freestore
                await request('https://' + process.env.FREESTORE + '.s3.us-east-2.amazonaws.com/' + key + '.json', function (error, response, body) {
                    if (!error && response.statusCode == 200) {
                        res.header('Access-Control-Allow-Origin', '*');
                        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                        res.status(200).json(JSON.parse(body));
                    } else {
                        res.header('Access-Control-Allow-Origin', '*');
                        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                        res.status(200).json({ plan: 0, email: '' });
                    }
                });

                // res.header('Access-Control-Allow-Origin', '*');
                // res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
                // res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
                // res.status(200).json({ plan: 0, email: '' });
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

app.post("/api/getSubscriptions", async function (req, res) {
    getSubscriptions(req, res).then((data) => {
        handleSuccess(res, data);
    }, (err) => {
        handleError(res, err, 'getSubscriptions');
    });
});

app.post("/api/getNewsletter", async function (req, res) {
    let email = req.body.email;
    //let response;
    //Promise style
    mailchimp.get({
        path: '/lists/ea72b92f29/members/' + md5(email.toLowerCase())
    })
        .then(function (result) {
            console.log('ALPHA', result);
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.status(200).json(result);
        })
        .catch(function (err) {
            console.log('ALPHA', err);
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.status(200).json(err);
        });
});

/**
 * Get tags
 */
app.post("/api/getTags", async function (req, res) {
    getTags(req, res).then((data) => {
        handleSuccess(res, data);
    }, (err) => {
        handleError(res, err, 'getTags');
    })
});

/**
 * Get user's created vj packs
 *      - Used on the account page
 */
app.post("/api/getCatalog", async function (req, res) {

    //console.log('BODY', req.body);

    Set.findAll({
        where: {
            active: true,
        },
        include: [{
            model: Artist,
            model: SetRawFile
        }]
    }).then((res2) => {
        //console.log('HOTEL', res2);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.status(200).json(res2);
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

/**
 * Delete a user's catalog item
 */
app.post("/api/deleteCatalog", async function (req, res) {

    Set.update(
        { active: false },
        { returning: true, where: { id: req.body.id } }
    )
        .then(([rowsUpdate, [updatedCatalog]]) => {
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.status(200).json(updatedCatalog);
        })
        .catch((err) => {
            handleError(res, err, 'nope');
        });

});

/**
 * Get user's purchased vj packs
 *      - Used on the account page
 */
app.post("/api/getlibrary", async function (req, res) {
    PackPurchase.findAll({
        where: {
            active: true,
            email: req.body.email
        },
        include: [{
            model: Set
        }]
    }).then((res2) => {
        //console.log('HOTEL', res2);
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
        res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
        res.status(200).json(res2);
    }, (err) => {
        handleError(res, err, 'nope');
    });
});

/**
 * Submit a vj pack as a user
 *      - Used on the marketplace page
 */
app.post("/api/submitVjPack", async function (req, res) {
    console.log('ALPHA', req.body.pack);
    let pack = JSON.parse(req.body.pack);
    //console.log('GOLF', pack);
    if (!pack.artistId) {
        handleError(res, 'No Artist Id', 'nope');
    } else {

        // Insert Pack
        const insertedPack = await Set.create({
            artistId: pack.artistId,
            name: pack.name,
            description: pack.description,
            price: pack.price,
            coverImage: pack.mp4File.url,
            setFile: pack.setFile.url
        }).then(async (res2) => {
            console.log('CHUCK', res2);
            // Insert Raw Files
            for (let i = 0; i < pack.rawFiles.length; i++) {
                const file = pack.rawFiles[i];
                const insert = await SetRawFile.create({
                    SetId: res2.id,
                    file: file.url
                }).then((res3) => {
                    console.log(res3);
                });
            }

            // Response
            res.header('Access-Control-Allow-Origin', '*');
            res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
            res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');
            res.status(200).json();
        }, (err) => {
            handleError(res, err, 'nope');
        });
    }
});

app.post("/api/profilecheck", async function (req, res) {
    console.log('TEST ALPHA', req.body);

    let email = req.body.email;
    if (!email) {
        handleError(res, 'No Email', 'nope');
    } else {

        // Check if user exists
        const user = await Artist.findOne({
            where: {
                email: email,
                active: true
            }
        });

        console.log('TEST BETA', user);

        // Update Auth0 status just in case

        handleSuccess(res, {});
    }
});