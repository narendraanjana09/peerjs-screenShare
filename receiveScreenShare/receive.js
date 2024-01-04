(function () {
      var lastPeerId = null;
      var peer = null; 
      var conn = null;
      var recvIdInput = document.getElementById("receiver-id");
      var status = document.getElementById("status");
      var message = document.getElementById("message");
      var goButton = document.getElementById("goButton");
      var resetButton = document.getElementById("resetButton");
      var sendMessageBox = document.getElementById("sendMessageBox");
      var sendButton = document.getElementById("sendButton");
      var clearMsgsButton = document.getElementById("clearMsgsButton");
      var connectButton = document.getElementById("connect-button");
      var cueString = '<span class="cueMsg">Cue: </span>';
      var audioStream;
    
      function initialize() {
        peer = new Peer(null, {
          debug: 2,
        });
    
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

        navigator.mediaDevices
            .getUserMedia({ audio: true })
            .then(function (stream) {
              audioStream = stream;

              audioStream.getAudioTracks()[0].addEventListener('ended', function () {
                  console.log('Audio sharing stopped');
                });
      
              console.log("listening audio stream");
              displayAudioSharing(audioStream);

            })
            .catch(function (error) {
              console.error("Error accessing audio: ", error);
            });
      }

      function displayAudioSharing(stream) {
            var audioItem = document.getElementById("audioItem");
            audioItem.srcObject = stream;
            audioItem.controls = false;
            audioItem.play();
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
          addMessage('<span class="peerMsg">Peer:</span> ' + data);
        });
    
        conn.on("close", function () {
          status.innerHTML = "Connection closed";
        });
    
        peer.on("call", async (call) => {
          console.log('call receved');
          call.answer(audioStream);
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
    
    
      function signal(sigName) {
        if (conn && conn.open) {
          conn.send(sigName);
          console.log(sigName + " signal sent");
          addMessage(cueString + sigName);
        } else {
          console.log("Connection is closed");
        }
      }
    
      goButton.addEventListener("click", function () {
        signal("Go");
      });
    
      resetButton.addEventListener("click", function () {
        signal("Reset");
      });
    
      function addMessage(msg) {
        var now = new Date();
        var h = now.getHours();
        var m = addZero(now.getMinutes());
        var s = addZero(now.getSeconds());
    
        if (h > 12) h -= 12;
        else if (h === 0) h = 12;
    
        function addZero(t) {
          if (t < 10) t = "0" + t;
          return t;
        }
    
        message.innerHTML =
          '<br><span class="msg-time">' +
          h +
          ":" +
          m +
          ":" +
          s +
          "</span>  -  " +
          msg +
          message.innerHTML;
      }
    
      function clearMessages() {
        message.innerHTML = "";
        addMessage("Msgs cleared");
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
          addMessage('<span class="selfMsg">Self: </span> ' + msg);
        } else {
          console.log("Connection is closed");
        }
      });
    
      clearMsgsButton.addEventListener("click", clearMessages);
    
      connectButton.addEventListener("click", join);
    
      initialize();
    })();
    