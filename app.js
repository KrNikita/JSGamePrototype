console.log("start");
var fs = require('fs');
var path = require('path');
var express = require('express');
var mongojs = require('mongojs');

var app = express();
var server = require('http').Server(app);
var db = mongojs('localhost/TSGProjectDB',['maps']);

var packet_time_buffer = 10*1000;
var packet_min_count = 500;
var min_session_length = 3;

var diretoryTreeToObj = function(dir, done) {
    var results = [];

    fs.readdir(dir, function(err, list) {
        if (err)
            return done(err);

        var pending = list.length;

        if (!pending)
            return done(null, {name: path.basename(dir), type: 'folder', children: results});

        list.forEach(function(file) {
            file = path.resolve(dir, file);
            fs.stat(file, function(err, stat) {
                if (stat && stat.isDirectory()) {
                    diretoryTreeToObj(file, function(err, res) {
                        results.push({
                            name: path.basename(file),
                            type: 'folder',
                            children: res
                        });
                        if (!--pending)
                            done(null, results);
                    });
                }
                else {
                    results.push({
                        type: 'file',
                        name: path.basename(file)
                    });
                    if (!--pending)
                        done(null, results);
                }
            });
        });
    });
};

app.get('/',function(req,res){
   res.sendFile(__dirname + '/Client/index.html'); 
});
app.use('/Client',express.static(__dirname+'/Client'));

app.get('/Editor',function(req,res){
   res.sendFile(__dirname + '/Editor/index.html'); 
});
app.use('/Editor',express.static(__dirname+'/Editor'));

console.log(new Date().getTime());

server.listen(2000);
console.log((new Date()) + ' Server start listen port 2000');


var players = {};
var CPlayer = require("./player.js");
var map_logic_module = require("./map_logic.js");
var map_logic = new map_logic_module();

var io = require('socket.io')(server,{});
io.sockets.on('connection',function(socket){
    console.log(new Date() + ' socket connection established');
    var session_id = 0;
    
    //Editor
    socket.on('save_level',function(data){
        map_logic.saveGameLevel(db,data);
    });
    
    socket.on('load_level',function(data){
        map_logic.getLevelData(db,data.name,function(data){
            socket.emit('load_level_data',data);
        }.bind(socket));
    });
    
    socket.on('get_levels_list',function(data){
        map_logic.getLevelsList(db,function(data){
            socket.emit('levels_list',{list:data});
        }.bind(socket));
    });
    
    socket.on('get_sprites_list',function(data){
        diretoryTreeToObj("Client/media/sprites", function(err, res){
            socket.emit('sprites',res);
        }.bind(socket));
    });
    socket.on('get_anim_sprites_list',function(data){
        diretoryTreeToObj("Client/media/animation_sprites", function(err, res){
            socket.emit('anim_sprites',res);
        }.bind(socket));
    });
    //End Editor
    
    socket.on('disconnect',function(){
        console.log(new Date() + ' socket connection closed');
        return;
        for(var p_to in players){
            if(players.hasOwnProperty(session_id)){
                if(players[session_id].m_sSessionId !== players[p_to].m_sSessionId){
                    players[p_to].m_pSocket.emit("logout",{session_id:players[session_id].m_sSessionId});
                }
            }
        }

       delete players[session_id];
    });
    
    socket.on('client_session_id',function(data){
        //var session_id = '';
        if(data.session_id.length < min_session_length){
            session_id = new Date().getTime()+'';
        }else{
            session_id = data.session_id;
        }
        
         
         
        if(!players.hasOwnProperty(session_id)){
            players[session_id] = new CPlayer();
            players[session_id].setSocket(socket);
            players[session_id].setSessionId(session_id);
        }else{
            players[session_id].setSocket(socket);
        }
        
        socket.emit('init_connection',{
            session_id:session_id,
            cell_x:players[session_id].m_pData.cell_x,
            cell_y:players[session_id].m_pData.cell_y
            }); 
    }.bind(session_id));
    
    //Send positions on all connected players
    socket.on('get_players_positions',function(data){
        if(!players.hasOwnProperty(data.session_id))return;
        for(var key in players){
            if(players.hasOwnProperty(key)){
                if(players[key].m_sSessionId != data.session_id){
                    players[key].sendCurPosPacket(players[data.session_id]);
                }
            }
        }
    });
    
    
    //Players
    socket.on('send_pos',function(data){
        if(players.hasOwnProperty(data.session_id)){
            players[data.session_id].addPacket('send_pos',data);
            for(var p in players){
                if(players.hasOwnProperty(p)){
                    players[p].checkLineOfView(players);
                }
            }
        }
    });
    socket.on('send_attk',function(data){
        if(players.hasOwnProperty(data.session_id)){
            players[data.session_id].addPacket('send_attk',data);
        }
    });
    
    //Global
    socket.on('get_map_info',function(data){
        map_logic.getMapInfo(db,data.name,function(data){
            socket.emit("get_map_info",data);
        });
    });
    
    socket.on('get_map_images',function(data){
        map_logic.getMapInfo(db,data.name,function(map_info){
            socket.emit("get_map_images",map_logic.getMapImages(map_info));
        });
    });
    
    //Utils
    socket.on('ping_calc',function(data){
        if(players.hasOwnProperty(data.session_id)){
            players[data.session_id].setPing(data.ping);
        }
        socket.emit("ping_calc",{});
    });
});

setInterval(function(){
    for(var p in players){
        if(players.hasOwnProperty(p)){
            //players[p].clearPackets();
        }
    }
},1000);

//Send packets about other players
setInterval(function(){    
    for(var p_from in players){
        if(players.hasOwnProperty(p_from)){
            for(var p_to in players){
                if(players.hasOwnProperty(p_to)){
                    if(players[p_from].m_sSessionId !== players[p_to].m_sSessionId){
                        players[p_from].sendPacket(players[p_to]);
                    }
                }
            }
        }
    }
},1000/10);

//Send packets to self player
setInterval(function(){
    for(var p in players){
        for(var p2 in players){
            if(players.hasOwnProperty(p) && players.hasOwnProperty(p2)){
                players[p].sendPacketSelf(players[p2]);
            }
        }
    }
},1000/10);