(function () {
      var lastPeerId = null;
      var peer = null; 
      var conn = null;
     
      var destPeerID;

    
      function initialize() {
        peer = new Peer();
    
        peer.on("open", function (id) {
          if (peer.id === null) {
            console.log("Received null id from peer open");
            peer.id = lastPeerId;
          } else {
            lastPeerId = peer.id;
          }
    
          console.log("Sceen Peer ID: " + peer.id);

          if(destPeerID){
            join();
          }else{
            console.error("destPeerID is null or empty");
          }
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
          console.log("Screen Connection lost. Please reconnect");
    
          peer.id = lastPeerId;
          peer._lastServerId = lastPeerId;
          peer.reconnect();
        });
    
        peer.on("close", function () {
          conn = null;
          console.log("Screen Connection destroyed");
        });
    
        peer.on("error", function (err) {
          console.log(err);
          alert("" + err);
        });
      }
    


      async function join() {
        if (conn) {
          conn.close();
        }
    
        conn = peer.connect(destPeerID, {
          reliable: true,
        });
    
        conn.on("open", function () {
          console.log("Screen Connected to: " + conn.peer);
        });
    
        conn.on("data", function (data) {
          console.log("Screen data: " + data)
        });
    
        conn.on("close", function () {
          console.log("Closed");
        });
    
        peer.on("call", async (call) => {
          console.log('call receved');
          document.getElementById("loading").style.display = "none";
          call.answer();
            call.on("stream", async (userVideoStream) => {
              console.log(
                'Screen call stream received'
              );
    
              setRemoteStream(userVideoStream);
            });
        });
      }
    
      function setRemoteStream(stream) {
        var screenShareVideo = document.getElementById("videoItem");
        screenShareVideo.style.display = "block";
        screenShareVideo.srcObject = stream;
        screenShareVideo.controls = false;
        screenShareVideo.play();
      }
    

      function logQueryParameters() {
  
        const url = new URL(window.location.href);

        destPeerID = url.searchParams.get('id1');
        console.log('destPeerID:', destPeerID);
    }

    window.addEventListener('load', logQueryParameters);    

      initialize();
    })();
    