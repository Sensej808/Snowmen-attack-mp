var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
 
app.use(express.static(__dirname + '/public'));

var players = {};

var waiting = null;
 
var rooms = {};
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log(`подключился пользователь ${socket.id}`);
  players[socket.id]={
	  playerId : socket.id,
	  room : null
  }
	  socket.emit('currentPlayers', players);
	  socket.broadcast.emit('newPlayer', players[socket.id]);
  
  socket.on('GameInit', function (none) {

	  console.log(`GameInit from  ${socket.id}`);
	if (waiting == null){
		console.log(`created lobby from ${socket.id}`);
		waiting = {
			id : socket.id
		}
	}
	else{
		
		rooms[waiting.id.toString() + socket.id.toString()]={
			roomId : waiting.id.toString() + socket.id.toString(),
			left : waiting.id,
			right : socket.id
		}
		players[waiting.id].room = waiting.id.toString() + socket.id.toString();
		players[socket.id].room = waiting.id.toString() + socket.id.toString();
		io.to(waiting.id).emit('InitSucess', {roomId : waiting.id.toString() + socket.id.toString()});
		socket.emit('InitSucess', {roomId : waiting.id.toString() + socket.id.toString()});
		console.log(`created room for ${socket.id} and ${waiting.id}`);
		waiting = null;
	}
  });
  
  socket.on('MoveUp', function (none) {
	  console.log(`Абоба`);
	  if (rooms[players[socket.id].room].left == socket.id){
		  io.to(rooms[players[socket.id].room].right).emit('MoveDown_enemy', {});
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('MoveDown_enemy', {});
	  }
  });
  
  socket.on('MoveDown', function (none) {
	  
	  if (rooms[players[socket.id].room].left == socket.id){
		  io.to(rooms[players[socket.id].room].right).emit('MoveDown_enemy', {});
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('MoveDown_enemy', {});
	  }
  });
  
  
  socket.on('Shoot', function (none) {
	  if (rooms[players[socket.id].room].left == socket.id){
		  io.to(rooms[players[socket.id].room].right).emit('Shoot_enemy', {});
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('Shoot_enemy', {});
	  }
  });
  
  socket.on('disconnect', function () {
    console.log(`пользователь отключился ${socket.id}`);
	if(players[socket.id].room != null){
		players[socket.id].room.left 
	}
	delete players[socket.id];
	io.emit('disconnect', socket.id);
  });
});
 
server.listen(80, function () {
  console.log(`Прослушиваю ${server.address().port}`);
});
