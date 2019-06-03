
function CTown(){
    "use strict";
    this.m_iCellWidth = 0;
    this.m_iCellHeight = 0;
    this.m_iHalfCellWidth = 0;
    this.m_iHalfCellHeight = 0;
    this.m_iQuaterCellWidth = 0;
    this.m_iQuaterCellHeight = 0;
    this.m_iWidthCellsCount = 0;
    this.m_iHeightCellsCount = 0;
    this.m_iSelectedCellX = -1;
    this.m_iSelectedCellY = -1;

    this.m_pBuildingsIds = {};
    this.m_pBuildingsTime = {};
    this.m_pBuildingsTimers = {};

    this.m_pResources = {};
    this.m_pProductionResources = {};
    this.m_pResourcesInterval = null;
    
    //Items
    this.m_pItems = {};
    this.m_pItemsProduction = {};
    
    this.DrawGrid = function(){
        for(var i=0;i<Math.abs(map.m_iMinMapY);i+=this.m_iCellHeight){
            DrawLine(core.m_pCanvasContext2d,0,i,Math.abs(map.m_iMinMapX),i,'#0f0');
        }
        
        for(var i=0;i<Math.abs(map.m_iMinMapX);i+=this.m_iCellWidth){
            DrawLine(core.m_pCanvasContext2d,i,0,i,Math.abs(map.m_iMinMapY),'#0f0');
        }
    };

    this.onTownLoad = function(){};

    this.getCellByCoords = function(x,y){
        this.m_iSelectedCellX = Math.ceil(((x-this.m_iCellWidth)-map.m_iMapX)/this.m_iCellWidth);
        this.m_iSelectedCellY = Math.ceil(((y-this.m_iCellHeight)-map.m_iMapY)/this.m_iCellHeight);
    };

    this.isCellInBounds = function(){
        if (this.m_iSelectedCellX >= 0 && this.m_iSelectedCellY >= 0 &&
            this.m_iSelectedCellX < this.m_iWidthCellsCount && this.m_iSelectedCellY < this.m_iHeightCellsCount){
            return true;
        }
        return false;
    };
    
    this.getMaxCountItemsAvailToBuild = function(resources_obj){
        var ret = 999;
        for(var key in resources_obj){
            if(this.m_pResources.hasOwnProperty(key)){
                if(this.m_pResources[key] >= resources_obj[key]){
                    var count = Math.floor(this.m_pResources[key] / resources_obj[key]);
                    if(count < ret){
                        ret = count;
                    }
                }
            }else{
                return 0;
            }
        }
        return ret;
    }
    
    this.isResourcesAvailable = function(resources_obj){
        for(var key in resources_obj){
            if(this.m_pResources.hasOwnProperty(key)){
                if(this.m_pResources[key] < resources_obj[key]){
                    return false;
                }
            }else{
                return false;
            }
        }
        return true;
    }
    
    this.isResourceAvailable = function(name,value){
        if(this.m_pResources.hasOwnProperty(name)){
            if(this.m_pResources[name] < value){
                return false;
            }
        }else{
            return false;
        }
        return true;
    }

    this.setResources = function(resources_str,resources_production_str){
        this.m_pResources = JSON.parse(resources_str);
        this.m_pResourcesProduction = JSON.parse(resources_production_str);
    };
    this.clearResourcesInterval = function(){
        clearInterval(this.m_pResourcesInterval);
    };
    this.setResourcesInterval = function(){
        clearInterval(this.m_pResourcesInterval);
        this.m_pResourcesInterval = setInterval(function(){
            for(var key in this.m_pProductionResources){
                if(this.m_pResources.hasOwnProperty(key)){
                    this.m_pResources[key] += parseFloat(this.m_pProductionResources[key])/parseFloat(3600);
                }else{
                    this.m_pResources[key] = parseFloat(this.m_pProductionResources[key])/parseFloat(3600);
                }
            }
        }.bind(this),1000);
    };
    this.addToResources = function(resources_obj){
        for(var key in resources_obj){
            if(this.m_pResources.hasOwnProperty(key)){
                this.m_pResources[key] += resources_obj[key];
            }else{
                this.m_pResources[key] = resources_obj[key];
            }
        }
    };
    this.subFromResources = function(resources_obj){
        for(var key in resources_obj){
            if(this.m_pResources.hasOwnProperty(key)){
                if(this.m_pResources[key] >= resources_obj[key]){
                    this.m_pResources[key] -= resources_obj[key];
                }else{
                    this.m_pResources[key] = 0;
                }
            }else{
                this.m_pResources[key] = 0;
            }
        }
    };

    this.loadTownMap = function(map_name,tiles_count,width_tiles_count,tile_width,tile_height){
        var x = 0;
        var y = 0;
        this.m_iCellWidth = Number(tile_width);
        this.m_iCellHeight = Number(tile_height);
        this.m_iHalfCellWidth = this.m_iCellWidth/2;
        this.m_iHalfCellHeight = this.m_iCellHeight/2;
        this.m_iQuaterCellWidth = this.m_iCellWidth/4;
        this.m_iQuaterCellHeight = this.m_iCellHeight/4;
        this.m_iWidthCellsCount = Number(width_tiles_count);
        this.m_iHeightCellsCount = Number(tiles_count/width_tiles_count);

        map.ClearMap();
        map.SetMinMaxMapPos(0,0,width_tiles_count*tile_width,(tiles_count/width_tiles_count)*tile_height);
        map.SetCurLevel(0);
        for(var i=0;i<tiles_count;i++){
            var key = map_name+'_'+i;
            var img = sprite_manager.getStaticSpriteImage(key);
            map.AddTileFromImg(img,x*img.width,y*img.height,img.width,img.height);

            x++;
            if(x >= width_tiles_count){
                x = 0;
                y++;
            }
        }
        this.updateResourcesAndBuildingsData(true);
        this.onTownLoad();

    };

    this.updateResourcesAndBuildingsData = function(is_async){
        $.ajaxSetup({async: is_async});
        $.post(server_address+"/pvb_processing.php",
            {
                action:"update_town_resources_buildings"
            },function(data,status){
                var data_obj = JSON.parse(data);
                this.m_pResources = JSON.parse(JSON.stringify(data_obj['resources']));
                this.m_pProductionResources = JSON.parse(JSON.stringify(data_obj['resources_production']));
            }.bind(this));

    };

    this.setBuildingLevel = function(name,cell_x,cell_y,offset_position_x,offset_position_y,level){
        SyncGet(server_address+"/gimg.php?anim&cat=buildings&type="+name+"&name="+name+"_"+level,
            function(data,status){
                (function(name,data,x,y){
                    sprite_manager.addAnimatedSprite(name+"_"+level,data,function(key){
                        var sprite = sprite_manager.getSprite(key);
                        map.SetCurLevel(1);
                        map.SetAnimTileFromImg(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y],
                                            sprite.getImage(),
                                            x-offset_position_x+this.m_iQuaterCellWidth,
                                            y-offset_position_y+this.m_iQuaterCellHeight,
                                            sprite.getWidth(),
                                            sprite.getHeight(),
                                            0,
                                            sprite.getFramesCount(),
                                            [0,sprite.getFramesCount()],
                                            0,
                                            sprite.getAnimationTimeout(),
                                            true);
                    }.bind(this));
                }.bind(this))(name,data,cell_x*this.m_iCellWidth,cell_y*this.m_iCellHeight);
            }.bind(this));
    };

    this.addBuilding = function(name,cell_x,cell_y,level,offset_position_x,offset_position_y,time_to_finish,callback){
        SyncGet(server_address+"/gimg.php?anim&cat=buildings&type="+name+"&name="+name+"_"+level,
            function(data,status){
                (function(name,data,x,y,offset_position_x,offset_position_y){
                    map.SetCurLevel(1);
                    sprite_manager.addAnimatedSprite(name+"_"+level,data,function(key){
                        var sprite = sprite_manager.getSprite(key);
                        this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y] = map.AddAnimTileFromImg(
                                sprite.getImage(),
                                x-offset_position_x+this.m_iQuaterCellWidth,
                                y-offset_position_y+this.m_iQuaterCellHeight,
                                sprite.getWidth(),
                                sprite.getHeight(),
                                0,
                                sprite.getFramesCount(),
                                [0,sprite.getFramesCount()],
                                0,
                                sprite.getAnimationTimeout(),
                                true);

                        this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'] = 
                                map.AddText(ui_language['Building'+name]+" ["+level+"]",
                                            x+this.m_iQuaterCellWidth,
                                            y+this.m_iQuaterCellHeight-20,
                                            20);
                        map.SetTextStyleById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],"bold");
                        map.SetTextColorById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],"white");
                        map.SetTextBackgroundById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],"black",0.5);
                        map.SetTextBackgroundBorderById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],"white");
                        if(time_to_finish > 0){
                            this.setBuildingCountDownTimers(name,cell_x,cell_y,offset_position_x,offset_position_y,level,time_to_finish);
                        }
                        callback();
                    }.bind(this));
                }.bind(this))(name,data,cell_x*this.m_iCellWidth,cell_y*this.m_iCellHeight,offset_position_x,offset_position_y);
            }.bind(this));
    };
    
    this.cancelBuilding = function(building_name,cell_x,cell_y,offset_position_x,offset_position_y,target_level){
        this.setBuildingLevel(building_name,cell_x,cell_y,offset_position_x,offset_position_y,target_level);
        this.clearBuildingCountDownTimers(building_name,cell_x,cell_y);
        this.setBuildingTime(building_name,cell_x,cell_y,0);
        this.updateBuildingText(building_name,cell_x,cell_y,target_level);
    };
    
    this.removeBuilding = function(name,cell_x,cell_y){
        map.RemAnimTile(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y]);
        delete this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y];
        
        map.RemTextTile(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text']);
        delete this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'];
    };

    this.setBuildingTime = function(name,cell_x,cell_y,time){
        this.m_pBuildingsTime[name+'_'+cell_x+'_'+cell_y] = time;
    };
    this.updateBuildingText = function(name,cell_x,cell_y,target_level){
        if(this.m_pBuildingsTime[name+'_'+cell_x+'_'+cell_y] > 0){
            map.SetTextById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],ui_language['Left']+": "+secondsToHHMMSS(this.m_pBuildingsTime[name+'_'+cell_x+'_'+cell_y]));
        }else{
            map.SetTextById(this.m_pBuildingsIds[name+'_'+cell_x+'_'+cell_y+'_text'],ui_language['Building'+name]+" ["+target_level+"]");
        }

    };
    
    this.clearBuildingCountDownTimers = function(building_name,cell_x,cell_y){
        clearInterval(this.m_pBuildingsTimers[building_name+'_'+cell_x+'_'+cell_y+'_interval']);
        clearTimeout(this.m_pBuildingsTimers[building_name+'_'+cell_x+'_'+cell_y+'_final_timeout']);
    }
    
    this.setBuildingCountDownTimers = function(building_name,cell_x,cell_y,offset_position_x,offset_position_y,target_level,time_to_finish){
        (function(building_name,cell_x,cell_y,target_level,time_to_finish){
            this.setBuildingLevel(building_name,cell_x,cell_y,offset_position_x,offset_position_y,0);
            this.setBuildingTime(building_name,cell_x,cell_y,time_to_finish);
            this.m_pBuildingsTimers[building_name+'_'+cell_x+'_'+cell_y+'_interval'] = setInterval(
                function(){
                    this.m_pBuildingsTime[building_name+'_'+cell_x+'_'+cell_y]--;

                    this.updateBuildingText(building_name,cell_x,cell_y,target_level);
                    if(this.m_pBuildingsTime[building_name+'_'+cell_x+'_'+cell_y] <= 0){
                        clearInterval(this.m_pBuildingsTimers[building_name+'_'+cell_x+'_'+cell_y+'_interval']);
                    }
                }.bind(this),1000);                        

            this.m_pBuildingsTimers[building_name+'_'+cell_x+'_'+cell_y+'_final_timeout'] = setTimeout(
                function(){
                    this.updateResourcesAndBuildingsData(true);
                    this.setBuildingLevel(building_name,cell_x,cell_y,offset_position_x,offset_position_y,target_level);

                }.bind(this),this.m_pBuildingsTime[building_name+'_'+cell_x+'_'+cell_y]*1000+1000);

        }.bind(this)(building_name,cell_x,cell_y,target_level,time_to_finish));
    };
    
    this.selectBuilding = function(cell_x,cell_y){
        for(var key in this.m_pBuildingsIds){
            var pos = key.search('_'+cell_x+'_'+cell_y);
            if(pos > 0){
                return true;
            }
        }
        return false;
    };
    
    //ITEMS FUNCTIONS
    this.loadItems = function(items_obj,items_production_obj){
        this.m_pItems = JSON.parse(JSON.stringify(items_obj));
        this.m_pItemsProduction = JSON.parse(JSON.stringify(items_production_obj));
        
    };
    //END ITEMS FUNCTIONS
    
}
