(function() {
	var roomController = function($scope, webSocketService, userInfoModel, $location) {
        var prepare = {
            usernumber: 0,
            username: userInfoModel.name,
            roomnumber: userInfoModel.roomnumber,
            ready: false,
            show: true
        };

        var game = {
            show: false,
            period: '',
            periodInfo: '',
            role: -1,
            time: 0,
            lockSeatId: 0,
            waitShow: false,
            wolfShow: false,
            guardShow: false,
            witchRescueShow: false,
            witchPoisonShow: false,
            prophetShow: false,
            voteShow: false,
            chatShow: false,
            goodManShow: false,
            badManShow: false,
            wolfChoose1: [],
            wolfChoose2: [],
            wolfs: []
        };

        function userInfo() {
            return {
                id: -1,
                name: '',
                isDead: false,
                isChat: false,
                message: '',
                isChoose: false
            }
        }
        var users = userInfoModel.seat;
		var initializeRoom = function() {
			var data = {
				number: userInfoModel.roomnumber
			};
			webSocketService.sendAPI('join_room', data);
            $scope.prepare = prepare;
            $scope.game = game;
            $scope.users = users;
            $scope.seats = [1, 2, 3, 4, 5, 6, 7, 8, 9];
		};
		initializeRoom();

        $scope.startGame = function() {
            webSocketService.sendAPI('start_game', {game_started: true});
        };

        function getUserId(seatId) {
            return userInfoModel.seat[seatId].id;
        }

        function getSeatId(userId) {
            var seat = userInfoModel.seat;
            for(var seatId in seat) {
                if(seat[seatId].id == userId) {
                    return seatId;
                }
            }
        }
        function newGame() {
            prepare.show = false;
            game.show = true;
        }

        function hideAll() {
            game.waitShow = false;
            game.guardShow = false;
            game.wolfShow = false;
            game.witchPoisonShow = false;
            game.witchRescueShow = false;
            game.prophetShow = false;
            game.chatShow = false;
            game.voteShow = false;
            game.goodManShow = false;
            game.badManShow = false;
            users.forEach(function (user) {
                user.isChat = false;
            });
        }

        var timeId;
        function subTime() {
            if(game.time > 0) {
                game.time--;
                $scope.$apply();
            }
        }

        function startPeriod(period, time, me, ids) {
            if(timeId != undefined) {
                clearInterval(timeId);
            }
            game.period = period;
            game.time = time;
            hideAll();
            if(me) {
                switch (period) {
                    case 'guard':
                        game.guardShow = true;
                        break;
                    case 'werewolf':
                        game.wolfs = [];
                        ids.forEach(function (userId) {
                            game.wolfs.push(getSeatId(userId));
                        });
                        game.wolfShow = true;
                        break;
                    case 'witch_rescue':
                        game.witchRescueShow = true;
                        break;
                    case 'witch_poison':
                        game.witchPoisonShow = true;
                        break;
                    case 'prophet':
                        game.prophetShow = true;
                        break;
                    case 'prophet_check':
                        game.prophetShow = true;
                        break;
                    case 'last_words':
                        game.periodInfo = '遗言';
                        game.waitShow = true;
                        game.chatShow = true;
                        break;
                    case 'discuss':
                        game.periodInfo = '发言';
                        game.waitShow = true;
                        game.chatShow = true;
                        break;
                    case 'vote':
                        game.voteShow = true;
                        break;
                    }
            } else {
                game.waitShow = true;
                switch (period) {
                    case 'guard':
                        game.periodInfo = '守卫';
                        break;
                    case 'werewolf':
                        game.periodInfo = '狼人';
                        break;
                    case 'witch_rescue':
                        game.periodInfo = '女巫救人';
                        break;
                    case 'witch_poison':
                        game.periodInfo = '女巫毒人';
                        break;
                    case 'prophet':
                        game.periodInfo = '预言家验人';
                        break;
                    case 'prophet_check':
                        game.periodInfo = '预言家确认';
                        break;
                    case 'last_words':
                        game.periodInfo = '遗言';
                        break;
                    case 'discuss':
                        game.periodInfo = '发言';
                        break;
                    case 'vote':
                        game.periodInfo = '投票';
                        break;
                }
            }
            timeId = setInterval(subTime, 1000);

        }

        $scope.chooseTarget = function (seatId) {
            chooseTarget(seatId);
        };
        function chooseTarget(seatId) {
            console.log('seatId:', seatId);
            if(seatId == undefined) return;
            var userId = getUserId(seatId);
            if(!userInfoModel.seat[seatId].isDead) {
                if(game.period == 'witch_poison') {
                    chooseFunction(true);
                }
                webSocketService.sendAPI('choose_target', {target_id: userId});
                users.forEach(function (user) {
                    user.isChoose = false;
                });
                users[seatId].isChoose = true;
            }
        }

        $scope.chooseFunction = function (is_chosen) {
            chooseFunction(is_chosen);
        };
        function chooseFunction(is_chosen) {
            webSocketService.sendAPI('is_function_chosen', {is_chosen: is_chosen});
        }

        $scope.sendMSG = function() {
            var message = $scope.message;
            console.log(message);
            if(message) {
                sendMessage(message);
                $scope.message = '';
            }
        };
        function sendMessage(message) {
            webSocketService.sendAPI('text_message', {message: message});
        }
        webSocketService.onmessage(function (msg) {
            var api = JSON.parse(msg.data);
            console.log(api);
            var data = api.data;
            switch (api.type) {
                case 'room_info':  
                    prepare.usernumber = 0;
                    data.users.forEach(function(user) {
                        var seatId = user.seatId;
                        userInfoModel.seat[seatId] = userInfo();
                        userInfoModel.seat[seatId].id = user.id;
                        userInfoModel.seat[seatId].name = user.name;
                        prepare.usernumber++;
                    });
                    console.log(users);
                    break;
                case 'room_user_change':  
                    if(data.id == userInfoModel.id) {
                    } else {
                        var seatId = data.seatId;
                        if(data.enter) {
                            userInfoModel.seat[seatId] = userInfo();
                            userInfoModel.seat[seatId].id = data.id;
                            userInfoModel.seat[seatId].name = data.name;
                            prepare.usernumber++;
                        } else {
                            prepare.usernumber--;
                        }
                    }
                    break;
                case 'game_aviliable': 
                    prepare.ready = data.is_game_aviliable;
                    break;
                case 'send_id_card':    
                    userInfoModel.role = data.id_card_type;
                    game.role = userInfoModel.role;
                    newGame();
                    break;
                case 'announce_period_started': 
                    startPeriod(data.period, data.time, data.me, data.ids);
                    break;
                case 'text_message': 
                    var userId = data.id;
                    var message = data.message;
                    users.forEach(function (user) {
                       user.isChat = false;
                    });
                    var seatId = getSeatId(userId);
                    users[seatId].message = message;
                    users[seatId].isChat = true;
                    break;
                case 'user_is_chosen':
                    var ids = data.id;
                    game.wolfChoose1 = [];
                    game.wolfChoose2 = [];
                    ids.forEach(function (userId) {
                        var seatId = getSeatId(userId);
                        if(game.wolfChoose1.indexOf(seatId) == -1) {
                            game.wolfChoose1.push(seatId);
                        } else {
                            if(game.wolfChoose2.indexOf(seatId) == -1) {
                                game.wolfChoose2.push(seatId)
                            }
                        }
                    });
                    break;
                case 'user_is_locked':
                    var userId = data.id;
                    game.lockSeatId = getSeatId(userId);
                    break;
                case 'is_user_goodman': //预言家预测结果
                    var isgood = data.is_user_a_goodman;
                    if(isgood) {
                        game.goodManShow = true;
                    } else {
                        game.badManShow = true;
                    }
                    break;
                case 'user_dead':  
                    var id1 = data.id1;
                    var id2 = data.id2;
                    if(id1 >= 0) {
                        var seatId = getSeatId(id1);
                        users[seatId].isDead = true;
                    }
                    if(id2 >= 0) {
                        var seatId = getSeatId(id2);
                        users[seatId].isDead = true;
                    }
                    break;
                case 'user_out':  
                    var userId = data.id;
                    if(userId >= 0) {
                        var seatId = getSeatId(userId);
                        users[seatId].isDead = true;
                    }
                    break;
                case 'game_over':  
                    var ids = data.id;
                    break;
            }
            $scope.$apply();
        });
	};
	angular.module('lyingman').controller('roomController', roomController);
})();


