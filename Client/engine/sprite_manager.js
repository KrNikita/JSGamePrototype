
function SpriteImg(src,is_animation,callback){
    "use strict";
    this.m_bIsAnimation = is_animation;

    var sprites_dim_array = [1,1];
    if(this.m_bIsAnimation){
        var tmp_array = src.substr(0,src.length-4).split('_');
        sprites_dim_array =  tmp_array[tmp_array.length-1].split('x');
    }

    this.m_iSpriteWidth = 0;
    this.m_iSpriteHeight = 0;
    this.m_iSpritesDimX = sprites_dim_array[0];
    this.m_iSpritesDimY = sprites_dim_array[1];
    this.m_iAnimationTimeout = 100;


    this.m_pImage = new Image();
    this.m_pImage.onload = function(){
        this.m_iSpriteWidth = this.m_pImage.width/this.m_iSpritesDimX;
        this.m_iSpriteHeight = this.m_pImage.height/this.m_iSpritesDimY;
        
        callback();
    }.bind(this);
    this.m_pImage.src = src;

    this.getImage = function(){return this.m_pImage;}
    this.isAnimation = function(){return this.m_bIsAnimation;}
    this.getAnimationTimeout = function(){return this.m_iAnimationTimeout;}
    this.getWidth = function(){return this.m_iSpriteWidth;}
    this.getHeight = function(){return this.m_iSpriteHeight;}
    this.getFramesCount = function(){return this.m_iSpritesDimX*this.m_iSpritesDimY;}
    this.getFramesDimX = function(){return this.m_iSpritesDimX;}
    this.getFramesDimY = function(){return this.m_iSpritesDimY;}
}

/** Class for managing images
 * @class SpriteManager
 * 
 */
function SpriteManager(){
	"use strict";
	this.sprites_array = [];

    //Tileset function
    this.tilesetTotalCount = [];
    this.tilesetCurrentCount = [];
    this.tilesetOnLoaded = [];
    this.currentTilesetName = "";

    this.startTileset = function(name){
        this.currentTilesetName = name;
        this.tilesetTotalCount[name] = 0;
        this.tilesetCurrentCount[name] = 0;
    }
    this.endTileset = function(){
        this.currentTilesetName = "";
    }
    this.clearTileset = function(name){
        delete this.tilesetTotalCount[name];
        delete this.tilesetCurrentCount[name];
        delete this.tilesetOnLoaded[name];
    }
  
    this.isTilesetLoaded = function(name){
        if(this.tilesetCurrentCount[name] === this.tilesetTotalCount[name]){
            return true;
        }
        return false;
    }
    //End Tileset function

    this.isSpriteExist = function(key){
        if(this.sprites_array.hasOwnProperty(key))return true;
        return false;
    }
    this.getSprite = function(key){
        if(this.isSpriteExist(key))return this.sprites_array[key];
        return null;
    }

	this.addStaticSprite = function(key,src,callback){
        var tileset_name = this.currentTilesetName;

        if(tileset_name !== "")this.tilesetTotalCount[tileset_name]++;

        if(this.sprites_array.hasOwnProperty(key)){
            if(tileset_name !== "")this.tilesetCurrentCount[tileset_name]++;
            callback(key);
        }else{
            var sprite = new SpriteImg(src,false,function(){
                this.sprites_array[key] = sprite;
                callback(key);

                if(tileset_name !== ""){
                    this.tilesetCurrentCount[tileset_name]++;
                    if(this.isTilesetLoaded(tileset_name)){
                        this.tilesetOnLoaded[tileset_name]();
                        this.clearTileset[tileset_name];
                    }
                }
            }.bind(this,tileset_name));
        }
	};

	this.getStaticSpriteImage = function(key){
		//TODO: check if key exist else resurt specific image
		return this.sprites_array[key].m_pImage
	};

    this.addAnimatedSprite = function(key,src,callback){
        var tileset_name = this.currentTilesetName;

        if(tileset_name !== "")this.tilesetTotalCount[tileset_name]++;

        if(this.sprites_array.hasOwnProperty(key)){
            if(tileset_name !== "")this.tilesetCurrentCount[tileset_name]++;
            callback(key);
        }
        else{
            var sprite = new SpriteImg(src,true,function(){
                this.sprites_array[key] = sprite;
                callback(key);

                if(tileset_name !== ""){
                    this.tilesetCurrentCount[tileset_name]++;
                    if(this.isTilesetLoaded(tileset_name)){
                        this.tilesetOnLoaded[tileset_name]();
                        this.clearTileset[tileset_name];
                    }
                }
            }.bind(this,tileset_name));
        }
	};


    this.getAnimatedSpriteImage = function(key){
        //TODO: check if key exist else resurt specific image
        return this.sprites_array[key].m_pImage;
    };

    this.getSpriteWidth = function(key){
        var sprt = this.sprites_array[key];
        if(sprt.isAnimation()){
            return sprt.m_iSpriteWidth;
        }
        return sprt.m_pImage.width;
    }
    this.getSpriteHeight = function(key){
        var sprt = this.sprites_array[key];
        if(sprt.isAnimation()){
            return sprt.m_iSpriteHeight;
        }
        return sprt.m_pImage.height;
    }
}

