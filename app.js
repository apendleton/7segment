/* dependencies */
var express = require('express');
var sio = require('socket.io');

/* app */
var app = express.createServer();
app.configure(function() {
    app.use("/media", express.static(__dirname + '/media'));
});

/* routes */
app.get('/', function(req, res) {
    res.send('Hello, World!');
});

/* listen */
app.listen(3000);

/* socket.io setup */
var io = sio.listen(app);