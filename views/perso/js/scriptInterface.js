var status = "online";
      var socket = io.connect('http://localhost:8080');
      socket.emit("connect_client", PSEUDO);
      // client connection
      socket.on('new_client_connected', function(client) {
        $( "#chatPanel" ).empty();
        client.forEach(function(val,idx) {
          if (val.pseudo != PSEUDO) {
            $("#chatPanel").append("<div class='row chatPanelRow cursorPointer' onClick=\"addDiscussion('"+val.pseudo+"')\"><div id=AUTO"+val.pseudo+" class='glyphicon glyphicon-user "+val.status+" cursorPointer'></div><div class='chatPanelDiv cursorPointer'>  "+val.pseudo+"</div></div>");
          }
        });
        updateIHMDiscussion();
      });
      
      // client deconnection
      socket.on('client_disconnect', function(client) {
        $( "#chatPanel" ).empty();
        client.forEach(function(val,idx) {
          if (val.pseudo != PSEUDO) {
            $("#chatPanel").append("<div class='row chatPanelRow cursorPointer' onClick=\"addDiscussion('"+val.pseudo+"')\"><div id=AUTO"+val.pseudo+" class='glyphicon glyphicon-user "+val.status+" cursorPointer'></div><div class='chatPanelDiv cursorPointer'>"+val.pseudo+"</div></div>");
          }
        });
        updateIHMDiscussion();
      });

      socket.on('status', function(data) {
        $("#AUTO"+data.pseudo).removeClass("absent busy online").addClass(data.status);
        updateIHMDiscussion();
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

      var discussion = [];
      var scroll = 0;

      function indexOfDiscussion(pseudo) {
        var index = -1;
        discussion.forEach(function(val, idx) {
          if (val.pseudo === pseudo) {
            index=idx;
          }
        });
        return index;
      }

      function addDiscussion(pseudo) {
        if (indexOfDiscussion(pseudo) == -1) {
          discussion.push({pseudo:pseudo, message:[], collapse:false, unReadMessage:false});
        }
        else {
          toggleCollapseDiscussion(pseudo);
        }
        updateIHMDiscussion();
      }

      function removeDiscussion(pseudo) {
        var index = indexOfDiscussion(pseudo);
        if (index !== -1) {
          discussion.splice(index, 1);
        }
        updateIHMDiscussion();
      }

      function toggleCollapseDiscussion(pseudo) {
        var index = indexOfDiscussion(pseudo);
        discussion[index].collapse ? discussion[index].collapse = false : discussion[index].collapse = true;
        updateIHMDiscussion();
      }

      function updateIHMDiscussion() {
        $(".chatFen").remove();
        $(".chatFenCollapse").remove();
        console.log(discussion);
        if (discussion.length < 5) {
          scroll = 0;
          var chatWindow;
          var classe;
          discussion.forEach(function(val, idx) {
            chatWindow = "";
            if ($("#AUTO"+val.pseudo).length > 0) {
              if ($("#AUTO"+val.pseudo).is(".busy")) {
                classe = "warning";
              } else if ($("#AUTO"+val.pseudo).is(".absent")) {
                classe = "danger";
              } else {
                classe = "success";
              }
            }
            else {
              classe = "";
            }

            if (!val.collapse) {
              chatWindow += "<div class='panel panel-default chatFen discussion"+(idx+1)+"' id='AUTO_CHAT_'"+val.pseudo+">";
              chatWindow += "<div class='panel-heading'>";
              chatWindow += "<h2 class='panel-title text-center text-"+classe+"' style='font-weight : bold;'>"+val.pseudo+"</h2>";
              chatWindow += "<p class='glyphicon glyphicon-chevron-down baisserChatFen' onClick='toggleCollapseDiscussion(\""+val.pseudo+"\")'></p>";
              chatWindow += "<p class='glyphicon glyphicon-remove fermerChatFen' onClick='removeDiscussion(\""+val.pseudo+"\")'></p> </div>";
              chatWindow += "<div class='panel-body'>";
              chatWindow += "<div class=\"contentChatWindow\"></div>";
              chatWindow += "<input class=\"inputChatWindow\"type=\"text\" onKeydown=\"ListenKeyPressed();\"></input>";
              chatWindow += "</div> </div>";
            }
            else {
              chatWindow += "<div class='alert alert-"+classe+" chatFenCollapse discussion"+(idx+1)+"' id='AUTO_CHAT_'"+val.pseudo+">";
              chatWindow += "<h2 class='panel-title text-center text-"+classe+"' style='font-weight : bold;'>"+val.pseudo+"</h2>";
              chatWindow += "<p class='glyphicon glyphicon-chevron-up baisserChatFen' onClick='toggleCollapseDiscussion(\""+val.pseudo+"\")'></p>";
              chatWindow += "<p class='glyphicon glyphicon-remove fermerChatFen' '></p> </div>";
              chatWindow += "</div>";
            }
            $("#pageBody").append(chatWindow);
          });
        }
      }
      //onClick='removeDiscussion(\""+val.pseudo+"\")
      /*
      function ListenKeyPressed () {
        if(event.keyCode==13) {
          console.log("BUMP!!!");
        }
      }*/
