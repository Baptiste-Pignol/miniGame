// variable
var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    ent = require('ent'),
    io = require('socket.io').listen(server),
    client = [];

// function
function verif(pseudo, password) {
	return ((pseudo!=undefined && pseudo!=null && pseudo!="") && (password!=undefined && password!=null && password!=""));
}

function indexOf(pseudo) {
	var index = -1;
	client.forEach( function (val, i) {
		if (pseudo === val.pseudo) {
			index = i;
		}
	});
	return index;
}

function remove(pseudo) {
	var index = indexOf(pseudo);
	if (index !== -1) {
		client.splice(index, 1);
	}
}


// app
app.use('/views', express.static(__dirname + '/views'));
app.use('/dist', express.static(__dirname + '/views/dist'));
app.use('/css', express.static(__dirname + '/views/perso/css'));
app.use(express.bodyParser());

app.get("/", function (req, res) {
	res.render('home.ejs');
});

app.post("/game", function (req, res) {
	console.log("game");
	var pseudo = req.body.pseudo;
	var password = req.body.psw;

	if (verif(pseudo, password)) {
		res.render('game.ejs', {pseudo: pseudo});
	}
	else {
		res.render('home.ejs');
	}	
});

// io
io.sockets.on('connection', function (socket, pseudo, status) {
	console.log("connection");

	// client chat interface
	// client connection
	socket.on('connect_client', function(pseudo) {
		var pseudo = ent.encode(pseudo);
    	socket.set('pseudo', pseudo);
    	client.push( {pseudo: pseudo, status: 'online'} );
    	socket.emit('new_client_connected', client);
    	socket.broadcast.emit('new_client_connected', client);
	});

	// client disconnection
	socket.on('disconnect', function() {
		socket.get('pseudo', function (error, pseudo) {
			remove(pseudo);
            socket.broadcast.emit('client_disconnect', client);
        });
	});

	// status changed
	socket.on('statusChanged', function(status) {
		socket.get('pseudo', function (error, pseudo) {
			client[indexOf(pseudo)].status = status;
			socket.emit('status', {pseudo: pseudo, status: status});
            socket.broadcast.emit('status', {pseudo: pseudo, status: status});
        });		
	})

	// client message chat

	/* ... */

	// client game

	/* ... */
});

server.listen(8080);