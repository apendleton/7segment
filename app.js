/* dependencies */
var express = require('express');
var sio = require('socket.io');
var _ = require('underscore');

/* app */
var app = express.createServer();
app.configure(function() {
    app.use("/media", express.static(__dirname + '/media'));
    app.set('views', __dirname + '/templates');
    app.set('view engine', 'ejs');
    app.set('view options', {layout: false})
});

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
var io = sio.listen(app);
var channels = {}
var servers = []

var updateStatus = function(socket) {
    var status = {};
    _.each(channels, function(value, key) {
        status[key] = true;
    });
    socket.emit('status', JSON.stringify(status))
}
var updateStatusAll = function() {
    _.each(servers, function(socket) {
        updateStatus(socket);
    });
}

io.of('/clients').on('connection', function(socket) {
    socket.on('subscribe', function(id) {
        socket.set('channel', id, function() {
            if (typeof channels[id] == 'undefined') {
                channels[id] = [socket];
            } else {
                channels[id].push(socket);
            }
            updateStatusAll();
        });
    });
    socket.on('disconnect', function() {
        socket.get('channel', function(err, id) {
            if (id && channels[id]) {
                channels[id] = _.filter(channels[id], function(s) { return s != socket; });
                if (channels[id].length == 0) {
                    delete channels[id];
                }
            }
        });
        updateStatusAll();
    })
});

io.of('/servers').on('connection', function(socket) {
    servers.push(socket);
    socket.on('disconnect', function() {
        servers = _.filter(servers, function(s) { return s != socket; });
    })
    socket.on('change', function(data) {
        var change = JSON.parse(data);
        if (typeof channels[change.channel] != 'undefined') {
            _.each(channels[change.channel], function(clientSocket) {
                clientSocket.emit('change', data);
            });
        }
    });

    updateStatus(socket);
});

// module.exports = app;
app.listen(3000);