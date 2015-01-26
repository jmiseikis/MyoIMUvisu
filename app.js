var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');

var routes = require('./routes/index');
var users = require('./routes/users');

var app = express();

// Socket.io
var http = require('http').Server(app);
var io = require('socket.io')(http);

// Myo
var Myo = require('myo');
var myMyo = Myo.create();
Myo.on('connected', function(){
    console.log('Myo connected! ID: ', this.id)
});

// view engine setup
app.set('views', path.join(__dirname, 'views'));
//app.engine('html', require('ejs').renderFile);
app.set('view engine', 'jade');
//app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
    app.use(function(err, req, res, next) {
        res.status(err.status || 500);
        res.render('error', {
            message: err.message,
            error: err
        });
    });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
        message: err.message,
        error: {}
    });
});


module.exports = app;

// ### Myo DATA ###
var IMUdata = {
  orientation: {
    x: 0,
    y: 0,
    z: 0,
    w: 0
  },
  gyroscope: {
    x: 0,
    y: 0,
    z: 0
  },
  accelerometer: {
    x: 0,
    y: 0,
    z: 0
  }
};

// ### Myo ###
myMyo.on('imu', function(data){
	IMUdata = data;
	//recalcMyoOrientation();
	sendMyoData();
});

function recalcMyoOrientation()
{
	IMUdata.orientation.x = getRoll(IMUdata.orientation);
	IMUdata.orientation.y = getPitch(IMUdata.orientation);
	IMUdata.orientation.z = getYaw(IMUdata.orientation);
}

function getRoll(data){
	var roll = Math.atan2(2.0 * (data.w * data.x + data.y * data.z), 1.0 - 2.0 * (data.x * data.x + data.y * data.y));
	var roll_w = ((roll + Math.PI)/(Math.PI * 2.0) * 18);
	return roll_w;
}

function getPitch(data){
	var pitch = Math.asin(Math.max(-1.0, Math.min(1.0, 2.0 * (data.w * data.y - data.z * data.x))));
	var pitch_w = ((pitch + Math.PI/2.0)/Math.PI * 18);
	return pitch_w;
}

function getYaw(data){
	var yaw = Math.atan2(2.0 * (data.w * data.z + data.x * data.y), 1.0 - 2.0 * (data.y * data.y + data.z * data.z));
	var yaw_w = ((yaw + Math.PI/2.0)/Math.PI * 18);
	return yaw_w;
}

// ### SOCKET.IO ###
io.on('connection', function(socket){
  console.log('Socket.io: New connection established!');

  socket.on('disconnect', function(){
    console.log('Socket.io: A connection was terminated!');
  });

  socket.on('Zero orientation', function(){
  	resetOrientation();
  });
});

function resetOrientation(){
	myMyo.zeroOrientation();
  	console.log('Zeroed orientation!');
}

// ### REPEATED EXECUTION ###
//setInterval(resetOrientation, 5000);

// ### RENDER WEBPAGES ###
app.get('/', function (req, res) {})

// ### START SERVER ###
var server = http.listen(3000, function () {

  var host = server.address().address
  var port = server.address().port

  console.log('Example app listening at http://%s:%s', host, port)

});

function sendMyoData()
{
  io.sockets.emit('IMU Update', IMUdata);
}