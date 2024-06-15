var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);
 
 var players = {};

var waiting = null;
 
var rooms = {};
 
app.use(express.static(__dirname + '/public'));
 
app.get('/', function (req, res) {
  res.sendFile(__dirname + '/index.html');
});

io.on('connection', function (socket) {
  console.log('подключился пользователь');
  players[socket.id]={
	  playerId : socket.id,
	  room : null
  }
  
  
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
	  console.log(`Вверх двигается ${socket.id}`);
	  if (rooms[players[socket.id].room].left == socket.id){
		  console.log(`Передаём на ${rooms[players[socket.id].room].right}`);
		  io.to(rooms[players[socket.id].room].right).emit('MoveUp_enemy', {});
	  }
	  else{
		  console.log(`Передаём на ${rooms[players[socket.id].room].left}`);
		  socket.to(rooms[players[socket.id].room].left).emit('MoveUp_enemy', {});
	  }
  });
  
  socket.on('MoveDown', function (none) {
	  
	  if (rooms[players[socket.id].room].left == socket.id){
		  console.log(`Вниз двигается ${socket.id}`);
		  io.to(rooms[players[socket.id].room].right).emit('MoveDown_enemy', {});
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('MoveDown_enemy', {});
	  }
  });
  
  
  socket.on('Shoot', function (none) {
	  if (rooms[players[socket.id].room].left == socket.id){
		  console.log(`Стреляет ${socket.id}`);
		  io.to(rooms[players[socket.id].room].right).emit('Shoot_enemy', {});
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('Shoot_enemy', {});
	  }
  });
  
   socket.on('GameOver', function (none) {
	  if (rooms[players[socket.id].room].left == socket.id){
		  io.to(rooms[players[socket.id].room].right).emit('Win', {});
		  players[rooms[players[socket.id].room].right].room = null;
	  }
	  else{
		  socket.to(rooms[players[socket.id].room].left).emit('Win', {});
		  players[rooms[players[socket.id].room].left].room = null;
	  }
	  delete rooms[players[socket.id].room]
	  players[socket.id].room = null
  });
  
  socket.on('disconnect', function () {
    console.log('пользователь отключился');
	if(waiting != null && waiting.id == socket.id){
		socket.id == null;
	}
	if(players[socket.id].room != null){
		if (rooms[players[socket.id].room].left == socket.id){
		  io.to(rooms[players[socket.id].room].right).emit('Win', {});
		  players[rooms[players[socket.id].room].right].room = null;
		}
		else{
		  socket.to(rooms[players[socket.id].room].left).emit('Win', {});
		  players[rooms[players[socket.id].room].left].room = null;
		}
	}
	delete players[socket.id];
  });
});
 
server.listen(80, function () {
  console.log(`Прослушиваем ${server.address().port}`);
});

