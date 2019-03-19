var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

var redis = require('redis');
var redisClient;
var redisClient = redis.createClient(6379, process.env.PARAM1);

// set the view engine to ejs
app.set('view engine', 'ejs');

// serve static content from 'public'
app.use(express.static(__dirname + '/public'));

// serve the globe page
app.get('/globe', function(req, res) {
	res.render('pages/globe');
});

//serve the heatmap page
app.get('/heatmap-basic', function(req, res) {
	res.render('pages/heatmap-basic');
});

//serve the heatmap-detailed page
app.get('/heatmap-detailed', function(req, res) {
	res.render('pages/heatmap-detailed');
});

//serve the heatmap page
app.get('/chart', function(req, res) {
	res.render('pages/chart');
});

app.get('/', function(req, res) {
	res.render('pages/globe');
});

// log that we have subscribed to a channel
redisClient.on('subscribe', function(channel, count) {
	console.log('redis client subscribed');
});

// When we get a message from redis, we send the message down the socket to the client
redisClient.on('message', function(channel, message) {	
	var coord = JSON.parse(message);
	io.emit('message', coord);
});

// subscribe to listen to events from redis
redisClient.on("ready", function () {		
	redisClient.subscribe("loc2");
});

// log that someone has connected via sockets (they are now listening for redis events)
io.on('connection', function(socket) {
	console.log('a user connected');
});

// start, either on the Beanstalk port, or 3000 for local development
var port = process.env.PORT || 3000;
http.listen(port, function() {
	console.log('server listening on port ' + port);
});