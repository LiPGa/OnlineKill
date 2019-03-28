var user = require('../models/user');
var room = require('../models/room');

function randomSwap(ids)
{
    var steps = 100;
    var length = ids.length;
    while(steps--) {
        var i = Math.floor(Math.random() * length);
        var j = Math.floor(Math.random() * length);
        var tmp = ids[i];
        ids[i] = ids[j];
        ids[j] = tmp;
    }
    return ids;
}

function get_roles()
{
    var roles = [1, 1, 1, 2, 2, 2, 3, 4, 5];
    return randomSwap(roles);
}
module.exports = {
    do: function (client, data) {
        var user_id = data.id;
        var room_id = user.getUserRoomId(user_id);
        var game_started = data.game_started;
        if(game_started) {
            if(room.getRoomSize(room_id) != 9) {
                return false;
            }
            var roles = get_roles();
            var userId = room.getRoomUserId(room_id);
            var index = 0;
            for(var k in userId) {
                var sdata = {
                    id_card_type: roles[index]
                };
                var status = user.sendJson(userId[k], 'send_id_card', sdata);
                var userData = user.getUserData(userId[k]);
                userData.role = roles[index];
                userData.isDead = false;
                switch (roles[index]) {
                    case 4:
                        userData.rescue = true;
                        userData.poison = true;
                        break;
                }
                index++;
            }
            room.startGame(room_id);
        }
    }

};