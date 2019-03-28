var json = require('./utils/json');
var middleware = require('./models/userCheck');
var mode = 'test';

module.exports = {
    init: function(message, client) {
        var msg = json.json_decode(message);
        if(msg.type != undefined) {
            try{
                switch (msg.type) {
                    case 'login':
                        var action = require('./service/login');
                        action.do(client, msg.data);
                        break;
                    default:
                        if(mode != 'test') {
                            middleware.userValidCheck(client, msg.data);
                        }
                        var action = require('./service/' + msg.type);
                        action.do(client, msg.data);
                }
            }catch (e) {
                console.log(e.stack);
            }
        }
    }
};