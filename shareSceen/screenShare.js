
(function () {
      var lastPeerId = null;
      var peer = null; 
      var peerId = null;
      var conn = null;
      var recvId = document.getElementById("receiver-id");
      var status = document.getElementById("status");
      var sendMessageBox = document.getElementById("sendMessageBox");
      var sendButton = document.getElementById("sendButton");

      var screenStream;
      var destPeerID;
    
      function initialize() {
        peer = new Peer();
    
        peer.on("open",async function (id) {
          // Workaround for peer.reconnect deleting previous id
          if (peer.id === null) {
            console.log("Received null id from peer open");
            peer.id = lastPeerId;
          } else {
            lastPeerId = peer.id;
          }
          peerId = peer.id;
          window.id1 = peerId;

          console.log("Screen Share ID: " + peer.id);
          recvId.innerHTML += "<br>Screen Share ID: " + peer.id;
          status.innerHTML += "<br>Screen Share Awaiting connection...";
    
          var screenShareButton = document.createElement("button");
          screenShareButton.innerHTML += "<br>Share Screen";
          screenShareButton.addEventListener("click", function () {
            startScreenShare();
          });
          document.body.appendChild(screenShareButton);
        });
    
        peer.on("connection", async function (c) {
          if (conn && conn.open) {
            c.on("open", function () {
              c.send("Screen Share Already connected to another client");
              setTimeout(function () {
                c.close();
              }, 500);
            });
            return;
          }
    
          conn = c;
          destPeerID = conn.peer;
          console.log("Screen Share Connected to: " + conn.peer);
    
          status.innerHTML += "<br>Screen Share Connected";

          conn.on("data", function (data) {
            console.log("data: " + data)
          });
        });



        peer.on("disconnected",async function () {
            status.innerHTML += "<br>Screen Share Connection lost. Please reconnect";
            console.log("Screen Share Connection lost. Please reconnect");
      
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
          });
      
          peer.on("close",async function () {
            conn = null;
            status.innerHTML += "<br>Screen Share Connection destroyed. Please refresh";
            console.log("Screen Share Connection destroyed");
          });
      
          peer.on("error", function (err) {
            console.log(err);
            alert("" + err);
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
                console.log("starting screen share stream");
                call.answer(screenStream);
              });
              console.log("sharing screen share streaming");
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
                track.stop();
              });
              screenStream = null;
              console.log('Screen sharing stopped');
            }
          }
    
      function displayScreenShare(stream) {
        var videoElement = document.getElementById("videoItem");
        videoElement.srcObject = stream;
        videoElement.controls = false;
        videoElement.setAttribute("autoplay", "true");

        var stopAudioShareButton = document.createElement("button");
    stopAudioShareButton.innerHTML = "Stop Screen Share";
    stopAudioShareButton.addEventListener("click", function () {
        stopScreenSharing();
    });
    document.body.appendChild(stopAudioShareButton);
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
          console.log("Screen Share Connection is closed");
        }
      });
    
      
    
      initialize();
    })();
    