/**
 * 用户处理模块
 */

//用户池
var users = [];

var u_id = 0;

var json = require('../utils/json');

function randomString(len) {
    len = len || 32;
    var $chars = 'ABCDEFGHJKMNPQRSTWXYZabcdefhijkmnprstwxyz2345678';
    var maxPos = $chars.length;
    var pwd = '';
    for (var i = 0; i < len; i++) {
        pwd += $chars.charAt(Math.floor(Math.random() * maxPos));
    }
    return pwd;
}
function send(id, str) {
    if(!users[id].online) {
        return true;
    }
    try {
        users[id].client.send(str);
        console.log('send: ' + id + ', ' + str);
    }catch (e) {
        deleteUser(id);
        return false;
    }
    return true;
}

function deleteUser(id) {
    users[id].online = false;
}

module.exports = {

    addUser: function (name, client) {
        var obj = {
            id: u_id,
            client: client,
            name: name,
            room: -1,
            data: {}, 
            token: randomString(16),
            online: true    
        };
        users[u_id] = obj;
        u_id++;
        return obj;
    },

    getUser: function(id) {
        return users[id];
    },

    getUserData: function (id) {
        return users[id].data;
    },

    setUserClient: function(id, client) {
        if(users[id] != undefined) {
            users[id].client = client;
        }
        return false;
    },

    setUserRoomId: function(id, number) {
        users[id].room = number;
    },

    setUserOnline: function(id, status) {
        users[id].online = status;
    },


    getUserRoomId: function(id) {
        return users[id].room;
    },

    getUserName: function(id) {
        return users[id].name;
    },

    sendJson: function(id, type, data) {
        var str = json.json_encode(type, data);
        var res = send(id, str);
        return res;
    }

};