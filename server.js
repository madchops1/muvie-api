//Install express server
const express = require('express');
const path = require('path');
const bodyParser = require("body-parser");


const app = express();
app.use(bodyParser.json());

// Create link to Angular build directory
app.use(express.static(__dirname + '/dist/muvie'));


// Initialize the app.
var server = app.listen(process.env.PORT || 8080, function () {
    var port = server.address().port;
    console.log("App now running on port", port);
});


// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
    console.log("ERROR: " + reason);
    res.status(code || 500).json({"error": message});
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

app.get("/api/make", function(req, res) {
    res.status(200).json();
});

