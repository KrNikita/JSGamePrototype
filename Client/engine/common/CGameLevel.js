var DEFAULT_CELL_WIDTH = 64;
var DEFAULT_CELL_HEIGHT = 32
var media_path = 'http://46.101.203.11:2000/Client/media/'

/**Class contains basic paremeters for block in game level
 * blocks need for mark now walkable cells for path finding,covers etc..
 * @class CBlock
 * @returns {CBlock}
 */
function CBlock(){
    this.m_iCellX = 0;
    this.m_iCellY = 0;
    this.m_iCoverHeight = 0;//Can be 0 for no cover (default), 1 for prone,2 for crouch, 3 for stand
}

/** Seting block cell position by x and y axis
 * @memberOf CBlock
 * @param {int} cell_x - Cell index by X axis
 * @param {int} cell_y - Cell index by Y axis
 * @returns {undefined}
 */
CBlock.prototype.setPosition = function(cell_x,cell_y){
    this.m_iCellX = cell_x;
    this.m_iCellY = cell_y;
}
/** Seting is show block can be used as cover and what height on thi cover
 * @memberOf CBlock
 * @param {tint} cover_height - Can be 0 for no cover (default), 1 for prone,2 for crouch, 3 for stand
 * @returns {undefined}
 */
CBlock.prototype.setCoverHeight = function(cover_height){
    this.m_iCoverHeight = cover_height;
}

/** geting cover height value
 * @memberOf CBlock
 * @returns {int} - cover height value
 */
CBlock.prototype.getCoverHeight = function(){
    return this.m_iCoverHeight;
}

/** get cell coord by x axis
 * @memberOf CBlock
 * @returns {int} - cell coord by x axis
 */
CBlock.prototype.getCellX = function(){
    return this.m_iCellX;
}

/** get cell coord by y axis
 * @memberOf CBlock
 * @returns {int} - cell coord by y axis
 */
CBlock.prototype.getCellY = function(){
    return this.m_iCellY;
}

/** Class for creating and managing game level
 * @class CGameLevel
 * @returns {CGameLevel}
 */
function CGameLevel(){
    this.m_sName = '';
    this.m_iCellWidth = 0;
    this.m_iCellHeight = 0;
    this.m_iHalfCellWidth = 0;
    this.m_iHalfCellHeight = 0;
    this.m_iQuaterCellWidth = 0;
    this.m_iQuaterCellHeight = 0;
    this.m_iWidthCellsCount = 0;
    this.m_iHeightCellsCount = 0;
    this.m_iLevelWidth = 0;
    this.m_iSelectedCellX = 0;
    this.m_iSelectedCellY = 0;
    this.m_pPathFinding;
    this.m_pBlocksArray = {};
    
    /** Add block by absolute map coords
     * @memberOf CGameLevel
     * @param {int} x - Absolute coords by X axis
     * @param {int} y - Absolute coords by Y axis
     * @param {int} cover_height - Can be 0 for no cover (default), 1 for prone,2 for crouch, 3 for stand
     * @returns {undefined}
     */
    this.AddBlockByCoords = function(x,y,cover_height){
        this.getCellByCoords(x,y);
        var block = new CBlock();
        block.setPosition(this.m_iSelectedCellX,this.m_iSelectedCellY);
        block.setCoverHeight(cover_height);
        this.m_pBlocksArray[this.m_iSelectedCellX+'_'+this.m_iSelectedCellY] = block;
    }
    
    /** Add block by map cell coords
     * @memberOf CGameLevel
     * @param {int} x - Cell coords by X axis
     * @param {int} y - Cell coords by Y axis
     * @param {int} cover_height - Can be 0 for no cover (default), 1 for prone,2 for crouch, 3 for stand
     * @returns {undefined}
     */
    this.AddBlockByCellCoords = function(x,y,cover_height){
        var block = new CBlock();
        block.setPosition(x,y);
        block.setCoverHeight(cover_height);
        this.m_pBlocksArray[x+'_'+y] = block;
    }
    
    
    /** Remove block from map cell coords
     * @memberOf CGameLevel
     * @param {int} x - Cell coords by X axis
     * @param {int} y - Cell coords by Y axis
     * @returns {undefined}
     */
    this.RemoveBlockByCellCoords = function(x,y){
        delete this.m_pBlocksArray[x+'_'+y];
    }
    
    
    /**  Set Cell coords to m_iSelectedCellX,m_iSelectedCellY variables by absolute coords
     * @memberOf CGameLevel
     * @param {int} x - absolute coords in pixels by x axis
     * @param {int} y - absolute coords in pixels by y axis
     * @returns {none}
     */
    this.getCellByCoords = function(x,y){
        this.m_iSelectedCellX = Math.ceil(((x-this.m_iCellWidth)-map.m_iMapX)/this.m_iCellWidth);
        this.m_iSelectedCellY = Math.ceil(((y-this.m_iCellHeight)-map.m_iMapY)/this.m_iCellHeight);
    };
    
    this.createMap = function(map_name,width_tiles_count,height_tiles_count,tile_width,tile_height){
        this.m_sName = map_name;
        this.m_iCellWidth = Number(tile_width);
        this.m_iCellHeight = Number(tile_height);
        this.m_iHalfCellWidth = this.m_iCellWidth/2;
        this.m_iHalfCellHeight = this.m_iCellHeight/2;
        this.m_iQuaterCellWidth = this.m_iCellWidth/4;
        this.m_iQuaterCellHeight = this.m_iCellHeight/4;
        this.m_iWidthCellsCount = Number(width_tiles_count);
        this.m_iHeightCellsCount = Number(height_tiles_count);
        this.m_iLevelWidth = width_tiles_count*this.m_iCellWidth;
        this.m_iLevelHeight = height_tiles_count*this.m_iCellHeight;

        map.ClearMap();
        map.SetMinMaxMapPos(0,0,width_tiles_count*tile_width,height_tiles_count*tile_height);
        map.SetCurLevel(0);
        
        this.m_pBlocksArray = [];
    };
    
    this.AddLayer = function(){
        map.AddLevel();
    };
    this.SetCurrentLayer = function(layer_id){
        map.SetCurLevel(layer_id);  
    };
    
    
    /** Put all level data in one JSON object
     *  Put all level data in one JSON object wich can be used for saving or loading
     * @memberOf CGameLevel
     * @param {int} number of layers
     * @param {array} array of name of layers in string
     * @param {array} array of bool values responsible for layers visibility
     *
     * @return {Object} return json object with level data
     */
    this.getLevelJSONData = function(layers_num,layers_names,layers_visibility){
        var layers = [];
        var static_sprites = [];
        var animation_sprites = [];
        for(var i=0;i<layers_num;i++){

            for(var j = 0;j < map.GetTilesCountInLevel(i);j++){
                var tile = map.GetTileByLevelIdAndId(i,j);
                static_sprites.push({x:tile.x,
                                     y:tile.y,
                                     w:tile.w,
                                     h:tile.h,
                                     visible:tile.visible,
                                     img:tile.m_pImgObj.src.substr(media_path.length)});
            }

            for(var j = 0;j < map.GetAnimTilesCountInLevel(i);j++){
                var tile = map.GetAnimTileByLevelIdAndId(i,j);
                animation_sprites.push({x:tile.x,
                                        y:tile.y,
                                        w:tile.w,
                                        h:tile.h,
                                        visible:tile.visible,
                                        animation_id:tile.m_iAnimationId,
                                        animation_loop:(tile.m_iAnimationType === 0)?true:false,
                                        animation_timeout:tile.m_iTimeout,
                                        img:tile.m_pImgObjSheet.src.substr(media_path.length)});
            }

            layers.push({id:i,name:layers_names[i],visibility:layers_visibility[i],
                        staric_sprites:static_sprites,
                        animation_sprites:animation_sprites});
                    
                    static_sprites = [];
                    animation_sprites = [];
        }
        
        var blocks = {};
        for(var key in this.m_pBlocksArray){
            if(this.m_pBlocksArray.hasOwnProperty(key)){
                blocks[key] = { cell_x:this.m_pBlocksArray[key].m_iCellX,
                                cell_y:this.m_pBlocksArray[key].m_iCellY,
                                cover_height:this.m_pBlocksArray[key].m_iCoverHeight};
            }
        }

        var data = {
            _id:            game_level.m_sName,
            name:           game_level.m_sName,
            width_cells:    game_level.m_iWidthCellsCount,
            height_cells:   game_level.m_iHeightCellsCount,
            cell_width:     game_level.m_iCellWidth,
            cell_height:    game_level.m_iCellHeight,
            layers:         layers,
            blocks:         blocks
        }
        
        return data;
    }
    
    this.load = function(data,callback){
        game_level.createMap(data.name,
                        data.width_cells,
                        data.height_cells,
                        data.cell_width,
                        data.cell_height);               
        
        this.m_pPathFinding = new PathFinding(data.width_cells,data.height_cells);
                    
        //Add sprites
        sprite_manager.tilesetOnLoaded['map_'+data.name] = function(){
            var layers = data.layers;
            for(var i=0;i<layers.length;i++){
                map.SetCurLevel(i);
                //Static
                var static_sprites = layers[i].staric_sprites;
                for(var j=0;j<static_sprites.length;j++){
                    var sprite = sprite_manager.getSprite('layer_'+layers[i].name+'_static_'+j);
                    map.AddTileFromImg (sprite.getImage(),
                                        static_sprites[j].x,static_sprites[j].y,
                                        static_sprites[j].w,static_sprites[j].h);
                }
                //Animated
                var animation_sprites = layers[i].animation_sprites;
                for(var j=0;j<animation_sprites.length;j++){
                    var sprite = sprite_manager.getSprite('layer_'+layers[i].name+'_animation_'+j);
                    map.AddAnimTileFromImg(
                            sprite.getImage(),
                            animation_sprites[j].x,
                            animation_sprites[j].y,
                            sprite.getWidth(),
                            sprite.getHeight(),
                            0,
                            sprite.getFramesCount(),
                            [0,sprite.getFramesCount()],
                            0,
                            sprite.getAnimationTimeout(),
                            animation_sprites[j].animation_loop);
                }
            }
            if(data.hasOwnProperty('blocks')){
                var blocks = data.blocks;
                for(var key in blocks){
                    if(blocks.hasOwnProperty(key)){
                        game_level.AddBlockByCellCoords(blocks[key].cell_x,blocks[key].cell_y,blocks[key].cover_height);
                        game_level.m_pPathFinding.SetBlock(blocks[key].cell_x,blocks[key].cell_y,true);
                    }
                }
            }
            callback();
        }.bind(data);
        //Load sprites
        sprite_manager.startTileset('map_'+data.name);
        var layers = data.layers;
        for(var i=0;i<layers.length;i++){
            //Static
            var static_sprites = layers[i].staric_sprites;
            for(var j=0;j<static_sprites.length;j++){
                
                sprite_manager.addStaticSprite('layer_'+layers[i].name+'_static_'+j,media_path+static_sprites[j].img,function(key){});                    
            }
            //Animated
            var animation_sprites = layers[i].animation_sprites;
            for(var j=0;j<animation_sprites.length;j++){
                sprite_manager.addAnimatedSprite('layer_'+layers[i].name+'_animation_'+j,media_path+animation_sprites[j].img,function(key){});                    
            }
        }        
        sprite_manager.endTileset('map_'+data.name);
    }
    
    this.loadMap = function(map_name,tiles_count,width_tiles_count,tile_width,tile_height){
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
        this.m_iLevelWidth = 0;
        this.m_iLevelHeight = 0;

        map.ClearMap();
        map.SetMinMaxMapPos(0,0,width_tiles_count*tile_width,(tiles_count/width_tiles_count)*tile_height);
        map.SetCurLevel(0);
        for(var i=0;i<tiles_count;i++){
            var key = map_name+'_'+i;
            var img = sprite_manager.getStaticSpriteImage(key);
            map.AddTileFromImg(img,x*img.width,y*img.height,img.width,img.height);

            this.m_iLevelWidth += img.width;
            x++;
            if(x >= width_tiles_count){
                x = 0;
                y++;
                this.m_iLevelHeight += img.height;
            }
        }
        //this.m_pPathFinding = new PathFinding(Number(this.m_iLevelWidth/this.m_iCellWidth),Number(this.m_iLevelHeight/this.m_iCellHeight));
        this.m_pPathFinding = new PathFinding(50,50);
    };  
    
    /** Draw blocks as transparent (0.3) green filled rects
     * @memberOf CGameLevel
     * @returns {undefined}
     */
    this.DrawBlocks = function(){
        for(var key in this.m_pBlocksArray){
            DrawFillRect(core.m_pCanvasContext2d,
                (this.m_pBlocksArray[key].m_iCellX * DEFAULT_CELL_WIDTH)+map.m_iMapX,
                (this.m_pBlocksArray[key].m_iCellY * DEFAULT_CELL_HEIGHT)+map.m_iMapY,
                DEFAULT_CELL_WIDTH,DEFAULT_CELL_HEIGHT,
                '#0f0',0.3);
        }
    }
    
    /** Draw green grid on map cells
     * @memberOf CGameLevel
     * @returns {undefined}
     */
    this.DrawGrid = function(){
        //vertical
        if(this.m_iLevelWidth > 0){
            for(var i=0;i<=this.m_iLevelWidth;i+=this.m_iCellWidth){
                DrawLine(core.m_pCanvasContext2d,
                        i+map.m_iMapX,
                        0+map.m_iMapY,
                        i+map.m_iMapX,
                        this.m_iLevelHeight+map.m_iMapY,
                        '#0f0');
            }
        }
        //horizontal
        if(this.m_iLevelHeight > 0){
            for(var i=0;i<=this.m_iLevelHeight;i+=this.m_iCellHeight){
                DrawLine(core.m_pCanvasContext2d,
                        0+map.m_iMapX,
                        i+map.m_iMapY,
                        0+this.m_iLevelWidth+map.m_iMapX,
                        i+map.m_iMapY,
                        '#0f0');
            }
        }
    }
    
    /** Return object of blocks data
     * @memberOf CGameLevel
     * @returns {CGameLevel.m_pBlocksArray} - return object with blocks data (format {'1_2':CBlock class})
     */
    this.getBlocks = function(){
        return this.m_pBlocksArray;
    }
    
    /** get block class object by key from m_pBlocksArray
     * @memberOf CGameLevel
     * @param {string} key - key of blocks object in format [cell_x+'_'+cell_y]
     * @returns {CGameLevel.m_pBlocksArray} - return block class object (CBlock)
     */
    this.getBlockByKey = function(key){
        return this.m_pBlocksArray[key];
    }
    
    /** set cover height value for blocks in m_pBlocksArray by key
     * @memberOf CGameLevel
     * @param {string} key - key of blocks object in format [cell_x+'_'+cell_y]
     * @param {type} cover_height - Can be 0 for no cover (default), 1 for prone,2 for crouch, 3 for stand
     * @returns {undefined}
     */
    this.setBlockCoverHeightByKey = function(key,cover_height){
        this.m_pBlocksArray[key].setCoverHeight(cover_height);
    }
};

