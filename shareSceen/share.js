
(function () {
      var lastPeerId = null;
      var peer = null; 
      var peerId = null;
      var conn = null;
      var recvId = document.getElementById("receiver-id");
      var status = document.getElementById("status");
      var message = document.getElementById("message");
      var sendMessageBox = document.getElementById("sendMessageBox");
      var sendButton = document.getElementById("sendButton");
      var clearMsgsButton = document.getElementById("clearMsgsButton");
    
      var screenStream;
      var destPeerID;
    
      function initialize() {
        peer = new Peer(null, {
          debug: 2,
        });
    
        peer.on("open", function (id) {
          // Workaround for peer.reconnect deleting previous id
          if (peer.id === null) {
            console.log("Received null id from peer open");
            peer.id = lastPeerId;
          } else {
            lastPeerId = peer.id;
          }
    
          console.log("ID: " + peer.id);
          recvId.innerHTML = "ID: " + peer.id;
          status.innerHTML = "Awaiting connection...";
    
          var screenShareButton = document.createElement("button");
          screenShareButton.innerHTML = "Share Screen";
          screenShareButton.addEventListener("click", function () {
            startScreenShare();
          });
          document.body.appendChild(screenShareButton);
        });
    
        peer.on("connection", function (c) {
          if (conn && conn.open) {
            c.on("open", function () {
              c.send("Already connected to another client");
              setTimeout(function () {
                c.close();
              }, 500);
            });
            return;
          }
    
          conn = c;
          destPeerID = conn.peer;
          console.log("Connected to: " + conn.peer);
    
          status.innerHTML = "Connected";
        });
      }
    
      function startScreenShare() {
        try {
            navigator.mediaDevices
            .getDisplayMedia({ video: true })
            .then(function (stream) {
              screenStream = stream;

              screenStream.getVideoTracks()[0].addEventListener('ended', function () {
                  console.log('Screen sharing stopped');
                });
      
              var call = peer.call(destPeerID, screenStream);
              peer.on("call", function (call) {
                console.log("starting stream");
                call.answer(screenStream);

                call.on("stream", async (audioStream) => {
                  console.log(
                    'audio stream received'
                  );
                });

              });
      
              console.log("sharing stream");
              displayScreenShare(screenStream);

            })
            .catch(function (error) {
              console.error("Error accessing screen: ", error);
            });
        }catch(exeption) {
            console.error("Error from screen share",exeption)
        }
      }

      function stopScreenSharing() {
            if (screenStream) {
              const tracks = screenStream.getTracks();
          
              tracks.forEach(track => {
                track.stop(); // Stop each track in the stream
              });
          
              // Perform any additional cleanup if needed
              screenStream = null;
              console.log('Screen sharing stopped');
            }
          }
    
      function displayScreenShare(stream) {
        var videoElement = document.createElement("video");
        videoElement.srcObject = stream;
        videoElement.controls = false;
        videoElement.setAttribute("autoplay", "true");
        document.body.appendChild(videoElement);
      }
    
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
          addMessage('<span class="selfMsg">Self: </span>' + msg);
        } else {
          console.log("Connection is closed");
        }
      });
    
      clearMsgsButton.addEventListener("click", clearMessages);
    
      initialize();
    })();
    