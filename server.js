// variable
var express = require('express'),
	app = express(),
    server = require('http').createServer(app),
    ent = require('ent'),
    io = require('socket.io').listen(server),
    crypto = require('crypto'),
    client = [],
    listSocket = [];


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
app.use('/js', express.static(__dirname + '/views/perso/js'));
app.use(express.bodyParser());

app.get("/", function (req, res) {
	res.render('home.ejs');
});

app.post("/game", function (req, res) {
	console.log("game");
	var pseudo = req.body.pseudo;
	var password = req.body.psw;
	var p = crypto.createHash('md5').update(password).digest("hex");

	if (verif(pseudo, password)) {
		res.render('game.ejs', {pseudo: pseudo, password: p});
	}
	else {
		res.render('home.ejs');
	}	
});

// io
io.sockets.on('connection', function (socket, pseudo, status) {
	listSocket.push(socket);
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
	socket.on('sendMessage', function(msg) {
		socket.get('pseudo', function (error, pseudo) {
			listSocket.forEach(function (val) {
				val.get('pseudo', function (error, destPseudo) {
					var dest = msg.dest.replace("#AUTO_CHATFORM_", "");
					if (destPseudo == dest) {
						console.log("passage dans le if");
						msg.author = pseudo;
						val.emit('msg', {msg: msg});
					}
				});
			});
		});
	});


	

	/* ... */

	// client game

	/* ... */
});

server.listen(8080);