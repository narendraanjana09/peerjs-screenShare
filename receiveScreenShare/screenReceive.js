(function () {
      var lastPeerId = null;
      var peer = null; 
      var conn = null;
      var recvIdInput = document.getElementById("receiver-id");
      var status = document.getElementById("status");
      var sendMessageBox = document.getElementById("sendMessageBox");
      var sendButton = document.getElementById("sendButton");
      var connectButton = document.getElementById("connect-button");
    
      function initialize() {
        peer = new Peer();
    
        peer.on("open", function (id) {
          if (peer.id === null) {
            console.log("Received null id from peer open");
            peer.id = lastPeerId;
          } else {
            lastPeerId = peer.id;
          }
    
          console.log("ID: " + peer.id);
        });
    
        peer.on("connection", function (c) {
          c.on("open", function () {
            c.send("Sender does not accept incoming connections");
            setTimeout(function () {
              c.close();
            }, 500);
          });
        });
    
        peer.on("disconnected", function () {
          status.innerHTML = "Connection lost. Please reconnect";
          console.log("Connection lost. Please reconnect");
    
          peer.id = lastPeerId;
          peer._lastServerId = lastPeerId;
          peer.reconnect();
        });
    
        peer.on("close", function () {
          conn = null;
          status.innerHTML = "Connection destroyed. Please refresh";
          console.log("Connection destroyed");
        });
    
        peer.on("error", function (err) {
          console.log(err);
          alert("" + err);
        });
      }
    
      function join() {
        if (conn) {
          conn.close();
        }
    
        conn = peer.connect(recvIdInput.value, {
          reliable: true,
        });
    
        conn.on("open", function () {
          status.innerHTML = "Connected to: " + conn.peer;
          console.log("Connected to: " + conn.peer);
        });
    
        conn.on("data", function (data) {
          console.log("data: " + data)
        });
    
        conn.on("close", function () {
          status.innerHTML = "Connection closed";
        });
    
        peer.on("call", async (call) => {
          console.log('call receved');
          call.answer();
            call.on("stream", async (userVideoStream) => {
              console.log(
                'call stream received'
              );
    
              setRemoteStream(userVideoStream);
            });
        });
      }
    
      function setRemoteStream(stream) {
        var screenShareVideo = document.getElementById("screenShareVideo");
        screenShareVideo.srcObject = stream;
        screenShareVideo.controls = false;
        screenShareVideo.play();
      }
    
      sendMessageBox.addEventListener("keypress", function (e) {
        var event = e || window.event;
        var char = event.which || event.keyCode;
        if (char == "13") sendButton.click();
      });
    
      sendButton.addEventListener("click", function () {
        if (conn && conn.open) {
          var msg = sendMessageBox.value;
          sendMessageBox.value = "";
          conn.send(msg);
          console.log("Sent: " + msg);
        } else {
          console.log("Connection is closed");
        }
      });
        
      connectButton.addEventListener("click", join);
    
      initialize();
    })();
    