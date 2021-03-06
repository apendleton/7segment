/* dependencies */
var express = require('express');
var sio = require('socket.io');
var _ = require('underscore');
var http = require('http');

/* app */
var app = express();
var server = http.createServer(app);
(function() {
    app.use("/media", express.static(__dirname + '/media'));
    app.set('views', __dirname + '/templates');
    app.set('view engine', 'ejs');
    app.set('view options', {layout: false})
})();

/* routes */
app.get('/', function(req, res) {
    res.send('Hello, World!');
});

app.get('/client/:id', function(req, res) {
    res.render('client', req.params);
})

app.get('/server', function(req, res) {
    res.render('server', req.params);
});

/* socket.io setup */
var io = sio.listen(server);
var channels = {}
var servers = []

var updateStatus = function(socket) {
    var status = [];
    _.each(channels, function(value, key) {
        status.push(key);
    });
    socket.emit('status', JSON.stringify(status.sort()))
}
var updateStatusAll = function() {
    _.each(servers, function(socket) {
        updateStatus(socket);
    });
}

io.of('/clients').on('connection', function(socket) {
    socket.on('subscribe', function(id) {
        socket.channel = id;
        console.log('connect', id);
        
        if (typeof channels[id] == 'undefined') {
            channels[id] = [socket];
        } else {
            channels[id].push(socket);
        }
        updateStatusAll();
    });
    socket.on('disconnect', function() {
        var id = socket.channel;
        console.log('disconnect', id);
        if (id && channels[id]) {
            channels[id] = _.filter(channels[id], function(s) { return s != socket; });
            if (channels[id].length == 0) {
                delete channels[id];
            }
        }
        updateStatusAll();
    });
});

io.of('/servers').on('connection', function(socket) {
    servers.push(socket);
    socket.on('disconnect', function() {
        servers = _.filter(servers, function(s) { return s != socket; });
    })
    socket.on('change', function(data) {
        var change = JSON.parse(data);
        var to_change = [];
        if (change.channel == '*') {
            to_change = channels;
        } else if (typeof channels[change.channel] != 'undefined') {
            to_change = [channels[change.channel]];
        }
        _.each(to_change, function(channel) {
            _.each(channel, function(clientSocket) {
                clientSocket.emit('change', data);
            });
        });
    });

    updateStatus(socket);
});

// module.exports = app;
server.listen(3000);
