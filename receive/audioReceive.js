(function () {
      var lastPeerId = null;
      var peer = null; 
      var conn = null;
    
      var audioStream;
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
    
          console.log("Audio ID: " + peer.id);

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
          document.getElementById("loading").style.display = "none";
        });
    
        peer.on("disconnected", function () {
          console.log("Audio Connection lost. Please reconnect");
    
          peer.id = lastPeerId;
          peer._lastServerId = lastPeerId;
          peer.reconnect();
        });
    
        peer.on("close", function () {
          conn = null;
          console.log("Audio Connection destroyed");
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
          console.log("Audio Connected to: " + conn.peer);
        });
    
        conn.on("data", function (data) {
          console.log("Audio data: " + data)
        });
    
        conn.on("close", function () {
          console.log("Closed");
          stopAudioSharing();
                });
    
        peer.on("call", async (call) => {
          console.log('Audio call receved');
          document.getElementById("loading").style.display = "none";

          navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          audioStream = stream;
          audioStream.getAudioTracks()[0].addEventListener('ended', function () {
              console.log('audio sharing stopped');
            });
  
            call.answer(audioStream); // Answer the call with an A/V stream.
    call.on('stream', function(remoteStream) {
      console.log(
        'Audio call stream received'
      );

      setRemoteAudioStream(remoteStream);
    });
        })
        .catch(function (error) {
          console.error("Error accessing audio: ", error);
        });
        });
      }
    

      

      function setRemoteAudioStream(stream) {
        var audioItem = document.getElementById("audioItem");
        audioItem.srcObject = stream;
        audioItem.controls = false;
        audioItem.play();
      }
      
      function stopAudioSharing() {
        if (audioStream) {
          const tracks = audioStream.getTracks();
          tracks.forEach(track => {
            track.stop();
          });
          audioStream = null;
          console.log('audio sharing stopped');
        }
      }


      function logQueryParameters() {
  
        const url = new URL(window.location.href);

        destPeerID = url.searchParams.get('id2');
       
        console.log('destPeerID:', destPeerID);
    }
    window.addEventListener('load', logQueryParameters);
    window.addEventListener('beforeunload', function (e) {
      conn.close();
  });
      initialize();

    
    })();
    