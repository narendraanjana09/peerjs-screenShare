(function () {
      var lastPeerId = null;
      var peer = null; 
      var conn = null;
      var recvIdInput = document.getElementById("audio-receiver-id");
      var status = document.getElementById("status");
      var connectButton = document.getElementById("connect-button-audio");
    
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
          status.innerHTML += "<br>Audio Audio Connection lost. Please reconnect";
          console.log("Audio Connection lost. Please reconnect");
    
          peer.id = lastPeerId;
          peer._lastServerId = lastPeerId;
          peer.reconnect();
        });
    
        peer.on("close", function () {
          conn = null;
          status.innerHTML += "<br>Audio Connection destroyed. Please refresh";
          console.log("Audio Connection destroyed");
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
          status.innerHTML += "<br>Audio Connected to: " + conn.peer;
          console.log("Audio Connected to: " + conn.peer);
        });
    
        conn.on("data", function (data) {
          console.log("Audio data: " + data)
        });
    
        conn.on("close", function () {
          status.innerHTML += "<br>Audio Connection closed";
        });
    
        peer.on("call", async (call) => {
          console.log('call receved');
          call.answer();
            call.on("stream", async (userAudioStream) => {
              console.log(
                'Audio call stream received'
              );
    
              setRemoteStream(userAudioStream);
            });
        });
      }
    
      function setRemoteStream(stream) {
        var audioItem = document.getElementById("audioItem");
        audioItem.srcObject = stream;
        audioItem.controls = false;
        audioItem.play();
      }
       
      connectButton.addEventListener("click", join);
    
      initialize();
    })();
    