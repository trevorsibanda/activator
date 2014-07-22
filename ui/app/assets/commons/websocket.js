define([
  'commons/stream',
  'commons/types',
  'widgets/modals/modals'
], function(
  Stream,
  Types,
  modals
) {

  var WS = ('MozWebSocket' in window) ? window.MozWebSocket : window.WebSocket,
      websocket,
      isOpened = ko.observable(false);

  var SocketStream = Stream().map(function(evt) {
    return JSON.parse(evt.data);
  });

  // Pattern checking (optional), eg:
  // subscribe({ type: 'Log', subtype: String })
  // See commons/type.js -> is()
  function subscribe(pattern) {
    return SocketStream.fork().filter(Types.curry(pattern));
  }

  SocketStream.fork().filter(function() {
    return debug;
  }).filterNot(Types.curry({ response: 'Pong' })).log();

  function send(msg) {
    websocket.send(JSON.stringify(msg));
  }

  function onOpen(event) {
    debug && console.info("WS opened: ", event)
    isOpened(true);
    Ping();
  }

  function onClose(event) {
    debug && console.info("WS closed: " + event.code + ": " + event.reason, event)
    isOpened(false);
    modals.confirm({});
    // modals.confirm(reconnect,{
    //   title: "WebSocket is closed",
    //   body: noir.Template(function() {
    //     this.p(function(){ return "Click OK to try to re-connect." })
    //     this.p(function(){ return "You may have to refresh your this page in your browser." })
    //   })
    // });
  }

  function onError(event) {
    debug && console.error("WS error: ", event);
    isOpened(false);
    modals.confirm({});
    // modals.confirm(reconnect,{
    //   title: "WebSocket is closed",
    //   body: noir.Template(function() {
    //     this.p(function(){ return "Click OK to try to re-connect." })
    //     this.p(function(){ return "You may have to refresh your this page in your browser." })
    //   })
    // });
  }

  // ---------------------------
  // Keeping the websocket alive
  // ---------------------------
  var Ping = (function(){
    var pendingPing;
    function randomShort() {
      return Math.floor(Math.random() * 65536);
    }
    // We used to check if the cookie we receive is the one we expect
    // But since we didn't do anything about it, I just removed it
    function ping() {
      if (!isOpened()) return;
      pendingPing = { request: 'Ping', cookie: randomShort().toString() };
      send(pendingPing);
      setTimeout(ping, 5000);
    }

    return ping;
  }());

  function connect() {
    isOpened(false);
    debug && console.info("WS opening: " + window.wsUrl);
    websocket = new WS(window.wsUrl);
    websocket.addEventListener('open', onOpen);
    websocket.addEventListener('close', onClose);
    websocket.addEventListener('error', onError);
    websocket.addEventListener("message", SocketStream.push.bind(SocketStream));
  }
  function reconnect() {
    setTimeout(connect, 200);
  }

  return {
    isOpened: isOpened,
    connect: connect,
    send: send,
    subscribe: subscribe
  }

})
