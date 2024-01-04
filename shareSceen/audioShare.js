
(function () {
  var lastPeerId = null;
  var peer = null; 
  var peerId = null;
  var conn = null;
  var recvId = document.getElementById("receiver-id");
  var status = document.getElementById("status");

  var audioStream;
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
      window.id2 = peerId;
      console.log("audio Share ID: " + peer.id);
      recvId.innerHTML += "<br>Audio ID: " + peer.id;
      status.innerHTML += "<br>Audio Awaiting connection...";

      var audioShareButton = document.createElement("button");
      audioShareButton.innerHTML += "<br>Share audio";
      audioShareButton.addEventListener("click", function () {
        startAudioShare();
      });
      document.body.appendChild(audioShareButton);
    });

    peer.on("connection",async function (c) {
      if (conn && conn.open) {
        c.on("open", function () {
          c.send("Audio Already connected to another client");
          setTimeout(function () {
            c.close();
          }, 500);
        });
        return;
      }

      conn = c;
      destPeerID = conn.peer;
      console.log("Audio Connected to: " + conn.peer);

      status.innerHTML += "<br>Audio Connected";

      conn.on("data", function (data) {
        console.log("data: " + data)
      });
    });



    peer.on("disconnected",async function () {
        status.innerHTML += "<br>Audio Connection lost. Please reconnect";
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
        alert("Audio " + err);
      });

  }

  function copyLink(){
    
    if (window.id1 !== undefined && window.id2 !== undefined) {
      var id1 = window.id1;
      var id2 = window.id2;
      var url = 'http://127.0.0.1:5500/receiveScreenShare/receive.html?id1=' + id1 + '&id2=' + id2;
      navigator.clipboard.writeText(url);
      console.log('URL copied to clipboard: ' + url);
  } else {
      alert('Please generate both id1 and id2 before copying the URL.');
  }
  }

  function startAudioShare() {
    try {
        navigator.mediaDevices
        .getUserMedia({ audio: true })
        .then(function (stream) {
          audioStream = stream;
          audioStream.getAudioTracks()[0].addEventListener('ended', function () {
              console.log('audio sharing stopped');
            });
  
          var call = peer.call(destPeerID, audioStream);

          call.on("stream", async (userAudioStream) => {
            console.log(
              'Audio call stream received'
            );
  
            displayAudioShare(userAudioStream);
          });
          console.log("sharing audio share streaming");
        })
        .catch(function (error) {
          console.error("Error accessing audio: ", error);
        });
    }catch(exeption) {
        console.error("Error from audio share",exeption)
    }
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

  function displayAudioShare(stream) {
    var audioElement = document.getElementById("audioItem");
    audioElement.srcObject = stream;
    audioElement.controls = false;
    audioElement.setAttribute("autoplay", "true");
  }
  document.getElementById("copyLinkBtn").addEventListener('click',copyLink);

  initialize();
})();
