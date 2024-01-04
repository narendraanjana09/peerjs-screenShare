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
          console.log('*** "call" event received, calling call.answer(strem)');
          call.answer();
          try {
            call.on("stream", async (userVideoStream) => {
              console.log(
                '***"stream" event received, calling addVideoStream(UserVideoStream)'
              );
    
              setRemoteStream(userVideoStream);
            });
          } catch (err) {
            console.log("*** ERROR returning the stream: " + err);
          }
        });
      }
    
      function setRemoteStream(stream) {
        var screenShareVideo = document.getElementById("screenShareVideo");
        screenShareVideo.srcObject = stream;
        screenShareVideo.controls = false;
        screenShareVideo.play();
      }
    
      function getUrlParam(name) {
        name = name.replace(/[\[]/, "\\\[").replace(/[\]]/, "\\\]");
        var regexS = "[\\?&]" + name + "=([^&#]*)";
        var regex = new RegExp(regexS);
        var results = regex.exec(window.location.href);
        if (results == null) return null;
        else return results[1];
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
    