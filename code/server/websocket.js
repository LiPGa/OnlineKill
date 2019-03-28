function createWebSocket(port) {
    var WebSocketServer = require('ws').Server;
    var wss = new WebSocketServer({
        port: port,
        verifyClient: socketVerify});
    return wss;

}
module.exports = {
    start: function (port) {
        var socket = createWebSocket(port);
        bindMessage(socket);
        console.log('web socket start.');
    }
};

var host = "lm.cmlin.me";
function socketVerify(info) {
    return true; 
    var origin = info.origin.match(/^(:?.+\:\/\/)([^\/]+)/);
    if(origin.length >= 3 && origin[2] == host) {
        return true;
    }
    return false;
}
var controller = require('./app/controller');


function bindMessage(wss) {
    wss.on('connection', function(client) {
        client.on('message', function(message) {
            console.log('received: %s', message);
            controller.init(message, client);
        });

        client.on('close', function(close){

        });
    });
}

