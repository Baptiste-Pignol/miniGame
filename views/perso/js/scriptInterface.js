var status = "online";
      var socket = io.connect('http://localhost:8080');
      socket.emit("connect_client", PSEUDO);
      // client connection
      socket.on('new_client_connected', function(client) {
        $( "#chatPanel" ).empty();
        client.forEach(function(val,idx) {
          if (val.pseudo != PSEUDO) {
            $("#chatPanel").append("<div class='row chatPanelRow'><div id=AUTO"+val.pseudo+" class='glyphicon glyphicon-user "+val.status+"'></div><div class='chatPanelDiv'>  "+val.pseudo+"</div></div>");
          }
        });
      });
      
      // client deconnection
      socket.on('client_disconnect', function(client) {
        $( "#chatPanel" ).empty();
        client.forEach(function(val,idx) {
          if (val.pseudo != PSEUDO) {
            $("#chatPanel").append("<div class='row chatPanelRow'><div id=AUTO"+val.pseudo+" class='glyphicon glyphicon-user "+val.status+"'></div><div class='chatPanelDiv'>"+val.pseudo+"</div></div>");
          }
        });
      });

      socket.on('status', function(data) {
        $("#AUTO"+data.pseudo).removeClass("absent busy online").addClass(data.status);
      });

      function changeStatus() {
        if (status === "online") {
          $('#titleChat').removeClass("text-success text-warning text-danger").addClass("text-warning");
          status = "busy";
          socket.emit('statusChanged', "busy");
        } else if (status === "busy") {
          $('#titleChat').removeClass("text-success text-warning text-danger").addClass("text-danger");
          status = "absent";
          socket.emit('statusChanged', "absent");
        } else {
          $('#titleChat').removeClass("text-success text-warning text-danger").addClass("text-success");
          status = "online";
          socket.emit('statusChanged', "online");
        }
      }