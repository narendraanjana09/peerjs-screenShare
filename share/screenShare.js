(function () {
      var lastPeerId = null;
      var peer = null; 
      var peerId = null;
      var conn = null;

      var screenStream;
      var destPeerID;
    
      function initialize() {
        document.getElementById("loading").style.display = "block";
        peer = new Peer();
    
        peer.on("open",async function (id) {
          if (peer.id === null) {
            console.log("Received null id from peer open");
            peer.id = lastPeerId;
          } else {
            lastPeerId = peer.id;
          }
          peerId = peer.id;
          window.id1 = peerId;

          console.log("Screen Share ID: " + peer.id);
          document.getElementById("loading").style.display = "none";
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
    
          conn.on("data", function (data) {
            console.log("data: " + data)
          });
          document.getElementById("shareScreenBtn").style.display = "block";
        });



        peer.on("disconnected",async function () {
            console.log("Screen Share Connection lost. Please reconnect");
      
            peer.id = lastPeerId;
            peer._lastServerId = lastPeerId;
            peer.reconnect();
          });
      
          peer.on("close",async function () {
            conn = null;
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
        document.getElementById("shareScreenBtn").style.display = "none";
        var videoElement = document.getElementById("videoItem");
        videoElement.style.display = "block";
        videoElement.srcObject = stream;
        videoElement.controls = false;
        videoElement.setAttribute("autoplay", "true");
      }
    
      initialize();

      document.getElementById("shareScreenBtn").addEventListener("click", function () {
        startScreenShare();
      });
    })();
    