module.exports = function() {
    var conf_module = require('./conf.js');
    var conf = new conf_module();
    this._MAPS_COLLECTION = 'maps';
    this._GAME_LEVELS_COLLECTION = 'game_levels';
    
    this.getMapInfo = function(db,map_name,callback){
        db.maps.find({"Name":map_name},function(err,res){
            if(res.length > 0){
                callback(res[0]);
            }
        });
    };
    this.getMapImages = function(map_info){
        var ret = map_info;
        ret.images = [];
        for (var i=0; i<map_info.tilesCount; i++) {
            ret.images[i] = conf.server_address+conf.media_maps_path+'/'+map_info.tilesetName+'/'+map_info.tilesetName+'_'+(i+1)+'.png';
        }
        
        return ret;
    };
    
    //Editor
    this.saveGameLevel = function(db,data){
        db.collection(this._GAME_LEVELS_COLLECTION).save(data);
    }
    
    this.getLevelData = function(db,level_name,callback){
        db.collection(this._GAME_LEVELS_COLLECTION).findOne({_id:level_name},function(err,doc){
            callback(doc); 
        });
    };
    
    this.getLevelsList = function(db,callback){
        
        db.collection(this._GAME_LEVELS_COLLECTION).find({}).toArray(function(err,docs){
            var ret = [];
            for(var i=0;i<docs.length;i++){
                ret.push(docs[i].name);
            }
            callback(ret);
        });
    }
};