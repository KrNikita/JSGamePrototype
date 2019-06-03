"use strict";

var math_module = require("./math_module.js");
var math = new math_module();
function CPlayer(){
  this.m_pSocket = null;
  this.m_sSessionId = '';
  this.m_pPackets = [];
  this.m_iLastPacketTS = 0;
  this.m_iPacketsCount = 0;
  this.m_iPing = 0;
  //Characteristics
  this.m_iHealth = 90;
  this.m_iViewDistance = 200;
  
  this.m_pVisibilityToPlayersArray = [];//TODO need to remove element when player is out
  this.m_pData = {
      cell_x:10,//TODO change default location, map specific
      cell_y:10,
      cell_w:64,
      cell_h:32
  };
}
CPlayer.prototype.setSocket = function(socket){this.m_pSocket = socket;}
CPlayer.prototype.setSessionId = function(session_id){this.m_sSessionId = session_id;}

CPlayer.prototype.setPing = function(val){this.m_iPing = val;}

CPlayer.prototype.checkAttack = function(target_x,target_y,player){
    if(target_x >= player.m_pData.cell_x*this.m_pData.cell_w &&
       target_y >= player.m_pData.cell_y*this.m_pData.cell_h &&
       target_x <= player.m_pData.cell_x*this.m_pData.cell_w+this.m_pData.cell_w &&
       target_y <= player.m_pData.cell_y*this.m_pData.cell_h+this.m_pData.cell_h)
  {
      player.m_iHealth--;
  }
}

CPlayer.prototype.sendPacketSelf = function(player){
    this.m_pSocket.emit("sdata",{
        session_id:player.m_sSessionId,
        health:player.m_iHealth
    });
};

CPlayer.prototype.sendPacket = function(target_player){
      if(this.m_pPackets.length === 0)return;      

      if(this.m_pPackets[0].type === 'send_attk'){
          this.checkAttack(this.m_pPackets[0].data.target_x,
                           this.m_pPackets[0].data.target_y,
                           target_player);
      }else if(this.m_pPackets[0].type === 'send_pos'){
          //if from player to visible to to player, dont send pos packet to this player
          if(!this.m_pVisibilityToPlayersArray[target_player.m_sSessionId]){
                this.m_pPackets.shift();
                this.m_iPacketsCount--;
                return;
          }
      }
      

      target_player.m_pSocket.emit("pdata",{
          session_id:this.m_sSessionId,
          type:this.m_pPackets[0].type,
          health:this.m_iHealth,
          data:this.m_pPackets[0].data
      });
      this.m_pPackets.shift();
      this.m_iPacketsCount--;
};

CPlayer.prototype.sendCurPosPacket = function(target_player){
    target_player.m_pSocket.emit("pdata",{
          session_id:this.m_sSessionId,
          type:'send_pos',
          data:{cell_x:this.m_pData.cell_x,cell_y:this.m_pData.cell_y}
      });
}

CPlayer.prototype.addPacket = function(type,data){
    this.m_iLastPacketTS = new Date().getTime();
    if(type === 'send_pos'){
        this.m_pData.cell_x = data.cell_x;
        this.m_pData.cell_y = data.cell_y;
    }
    this.m_pPackets.push({
        ts:this.m_iLastPacketTS,
        type:type,
        data:data
    });
    this.m_iPacketsCount++;
};

CPlayer.prototype.checkLineOfView = function(players){
    var MAP_CELL_WIDTH = 64;
    var MAP_CELL_HEIGHT = 32;
    var a = [this.m_pData.cell_x*MAP_CELL_WIDTH,this.m_pData.cell_y*MAP_CELL_HEIGHT];
    for(var p in players){
        if(players.hasOwnProperty(p)){
            if(this.m_sSessionId !== players[p].m_sSessionId){
                var b = [players[p].m_pData.cell_x*MAP_CELL_WIDTH,players[p].m_pData.cell_y*MAP_CELL_HEIGHT];
                var d = math.distance(a,b);
                if(d > 200){
                    this.m_pSocket.emit("vdata",{
                        session_id:this.m_sSessionId,
                        data:{tp_sess:p,vs:false}});
                        this.m_pVisibilityToPlayersArray[p] = false;
                }else{
                    this.m_pSocket.emit("vdata",{
                        session_id:this.m_sSessionId,
                        data:{tp_sess:p,vs:true,cell_x:players[p].m_pData.cell_x,cell_y:players[p].m_pData.cell_y}});
                    this.m_pVisibilityToPlayersArray[p] = true;
                }
            }
        }
    }
    
}

CPlayer.prototype.clearPackets = function(){
    if(this.m_iPacketsCount <= packet_min_count)return;
    while(this.m_iPacketsCount > packet_min_count){
        this.m_pPackets.shift();
        this.m_iPacketsCount--;
    }
    /*var ts = new Date().getTime();
    for(var p in this.m_pPackets){
        if(ts - this.m_pPackets[p].ts > packet_time_buffer){            
            if(this.m_iPacketsCount > packet_min_count && this.m_iPacketsCount > 0){
                  this.m_pPackets[p].splice(0,1);
                  this.m_iPacketsCount--;
            }
        }else{
            break;
        }
    }*/
}

CPlayer.prototype.setCellPosition = function(cell_x,cell_y){
      this.m_pData['cell_x'] = cell_x;
      this.m_pData['cell_y'] = cell_y;
};

module.exports = CPlayer;