/* dependencies */
var express = require('express');
var sio = require('socket.io');

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

/* socket.io setup */
var io = sio.listen(app);

module.exports = app;