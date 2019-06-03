/** IsoMap class for create and manage Isometric 2d map for HTML5 Canvas
 * @class IsoMap
 * @param {CCore class} core
 * @param {int} canvas_width
 * @param {int} canvas_height
 * @returns {IsoMap}
 */
function IsoMap(core,canvas_width,canvas_height){
    "use strict";
    this.m_iCanvasWidth = canvas_width;
    this.m_iCanvasHeight = canvas_height;
    this.m_pLevelObstaclesArray = new Array();
    this.m_pLevelTriggersArray = new Array();
    this.m_iMapX = 0;
    this.m_iMapY = 0;
    this.m_iSnapFlag = 0;
    this.m_iPrevMapX = 0;
    this.m_iPrevMapY = 0;
    this.m_iPrevMapFlag = 0;
    this.m_bDrawAllLevels = true;

    this.useBounds = false;
    this.m_iMinMapX = 0;
    this.m_iMinMapY = 0;
    this.m_iMaxMapX = 0;
    this.m_iMaxMapY = 0;

    this.m_iOrigMinMapX = 0;
    this.m_iOrigMinMapY = 0;
	
    this.m_iLevelsCount = 0;
    this.m_pLevelsGroupIds = new Array();
    this.m_pLevelsTextGroupIds = new Array();
	
    this.m_iSelectedLevel = 0;
	
    this.Init = function()
    {
        this.m_iLevelsCount++;
        this.m_pLevelsGroupIds.push(core.AddSpritesGroup());
        this.m_pLevelsTextGroupIds.push(core.AddTextSpritesGroup());
    };

    this.setScaleLevel = function(value){
        this.m_iMinMapX = (this.m_iOrigMinMapX/value)+this.m_iCanvasWidth;
        this.m_iMinMapY = (this.m_iOrigMinMapY/value)+this.m_iCanvasHeight;
        this.checkMapBounds();
    }

    this.SetMinMaxMapPos = function(min_x,min_y,max_x,max_y){
        //function converts input values for more understading setup outside class
        this.m_iMinMapX = (max_x*-1)+this.m_iCanvasWidth;
        this.m_iMinMapY = (max_y*-1)+this.m_iCanvasHeight;
        this.m_iMaxMapX = min_x;
        this.m_iMaxMapY = min_y;
        this.m_iOrigMinMapX = max_x*-1;
        this.m_iOrigMinMapY = max_y*-1;
    };
	
	//Levels
	this.AddLevel = function()
	{
		this.m_iLevelsCount++;
		this.m_pLevelsGroupIds.push(core.AddSpritesGroup());
                this.m_pLevelsTextGroupIds.push(core.AddTextSpritesGroup());
		return this.m_iLevelsCount-1;
	};
	
	this.SetCurLevel = function(val){if(val < this.m_iLevelsCount)this.m_iSelectedLevel = val;};
	this.GetCurLevel = function(){return this.m_iSelectedLevel;};
	//Sprites
        /** Select sprite on current layer by absolute coords
         * @memberOf IsoMap
         * @param {int} x - coord by x axis
         * @param {int} y - coord by y axis
         * @returns {array} - Array of selected sprites ids
         */
	this.SelectSpriteByCoords = function(x,y){
            var ret = -1;
            ret = core.GetSpriteInGroupByCoords(this.m_pLevelsGroupIds[this.m_iSelectedLevel],x,y);
            return ret;
	};
	
	this.SetPrevMapPosition = function()
	{
		if(this.m_iPrevMapFlag == 0)
		{
			this.m_iPrevMapX = this.m_iMapX;
			this.m_iPrevMapY = this.m_iMapY;
			this.m_iPrevMapFlag = 1;
		}
	};

    this.checkMapBounds = function(){
        if(this.useBounds === false)return false;
        var ret = false;
        if(this.m_iMapX < this.m_iMinMapX){
            this.m_iMapX = this.m_iMinMapX;
            ret = true;
        }
        if(this.m_iMapY < this.m_iMinMapY){
            this.m_iMapY = this.m_iMinMapY;
            ret = true;
        }
        if(this.m_iMapX > this.m_iMaxMapX){
            this.m_iMapX = this.m_iMaxMapX;
            ret = true;
        }
        if(this.m_iMapY > this.m_iMaxMapY){
            this.m_iMapY = this.m_iMaxMapY;
            ret = true;
        }
        return ret;
    }

    this.isCheckMapBounds = function(step,direction){
        if(this.useBounds === false)return false;

        if(direction === "right" && this.m_iMapX - step < this.m_iMinMapX){return true;}
        if(direction === "left" && this.m_iMapX + step > this.m_iMaxMapX){return true;}
        if(direction === "down" && this.m_iMapY - step < this.m_iMinMapY){return true;}
        if(direction === "up" && this.m_iMapY + step > this.m_iMaxMapY){return true;}
        return false;
    }

	
	this.AddToPrevMapPosition = function(x,y)
	{
		this.m_iMapX = this.m_iPrevMapX+x;
		this.m_iMapY = this.m_iPrevMapY+y;

        this.checkMapBounds();
	};
	
	this.ClearPrevMapPosition = function()
	{
		this.m_iPrevMapX = 0;
		this.m_iPrevMapY = 0;
		this.m_iPrevMapFlag = 0;
	};
	
	this.SetMapPosition = function(x,y)
	{
		this.m_iMapX = x;
		this.m_iMapY = y;
	};
        
        this.setSelectedLevelVisibility = function(visibility){
            var _count = core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites.length;
            for(var i=0;i<_count;i++){
                core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites[i].SetVisibility(visibility);
            }
        };
	
        /** Get Static Sprite by id in current selected layer
         * @memberOf IsoMap
         * @param {int} id
         * @returns {StaticSprite class}
         */
	this.GetTileById = function(id){
            return core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites[id];
	};
        
        this.GetTileByLevelIdAndId = function(level_id,id){
		return core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[id];
	};
        
        this.GetTilesCountInLevel = function(level_id){
            var ret = 0;
            for(var key in core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites){
                if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites.hasOwnProperty(key)){
                    if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[key].m_sType === "static"){
                        ret++;
                    }
                }
            }
            return ret;
	};

        this.GetAnimTileById = function(id){
		return core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites[id];
	};
        
        this.GetAnimTileByLevelIdAndId = function(level_id,id){
		return core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[id];
	};
        
        this.GetAnimTilesCountInLevel = function(level_id){
            var ret = 0;
            for(var key in core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites){
                if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites.hasOwnProperty(key)){
                    if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[key].m_sType === "animation"){
                        ret++;
                    }
                }
            }
            return ret;
	};

        this.GetTextTileById = function(id){
            return core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[this.m_iSelectedLevel]].m_pSprites[id];
        };
        
        this.GetTextTileByLevelIdAndId = function(level_id,id){
            return core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[level_id]].m_pSprites[id];
        };
        
        this.GetTextTilesCountInLevel = function(level_id){
		return core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[level_id]].m_pSprites.length;
	};
	
	this.AddTileFromImg = function(img,x,y,w,h){
		return core.AddStaticSpriteToGroup(this.m_pLevelsGroupIds[this.m_iSelectedLevel],img,x,y,w,h);
	};
	
	this.AddTileFromImgFromSrc = function(img_src,x,y,w,h){
		return core.AddStaticSpriteToGroupFromSrc(this.m_pLevelsGroupIds[this.m_iSelectedLevel],img_src,x,y,w,h);
	};
	
	this.SetTileImgById = function(id,img_obj){
		core.SetStaticSpriteImgById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id,img_obj);
	};
	
	this.AddTileById = function(id,x,y){
            return core.AddStaticSpriteToGroupById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id,x,y);
	};
        
    this.RemStaticTileByGroupIdAndId = function(group_id,id){
        core.RemoveSpriteFromGroupById(group_id,id);
    };

    this.RemStaticTile = function(id){
        core.RemoveSpriteFromGroupById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id);
    };
    
    this.RemAnimTileByGroupIdAndId = function(group_id,id){
        core.RemoveSpriteFromGroupById(group_id,id);
	};

    this.RemAnimTile = function(id){
        core.RemoveSpriteFromGroupById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id);
	};

    this.RemTextTileByGroupIdAndId = function(group_id,id){
        core.RemoveTextSpriteFromGroupById(group_id,id);
    };
    
    this.RemTextTile = function(id){
        core.RemoveTextSpriteFromGroupById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id);
    };
	
    this.AddAnimTileFromImg = function(img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout,loop)
    {
        var id = core.AddAnimationSpriteToGroup(this.m_pLevelsGroupIds[this.m_iSelectedLevel],img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout);
        if(loop){
            core.GetSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).SetLoopAnimation();
        }else{
            core.GetSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).SetOneTimeAnimation();
        }
            core.GetSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).RunAnimation();
            return id;
	};

    this.SetAnimTileFromImg = function(id,img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout,loop){
        core.SetAnimationSpriteImgById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id,img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout);
        if(loop){
            core.GetAnimationSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).SetLoopAnimation();
        }else{
            core.GetAnimationSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).SetOneTimeAnimation();
        }
        core.GetAnimationSpriteById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id).RunAnimation();
		return id;
    }
	
    this.AddAnimTileById = function(id,x,y)
    {
        return core.AddAnimationSpriteToGroupById(this.m_pLevelsGroupIds[this.m_iSelectedLevel],id,x,y);
    };

    this.AddText = function(text,x,y,size){
        return core.AddTextSpriteToGroup(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],text,x,y,size);
    };

    this.SetTextById = function(id,text){
        core.SetTextSpriteTextById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id,text);
    };
    this.SetTextStyleById = function(id,style){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_bStyle = style;
    };
    this.SetTextStrokeById = function(id,value){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_bStroke = value;
    };
    this.SetTextColorById = function(id,color){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_sColor = color;
    };
    this.SetTextStrokeColorById = function(id,color){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_sStrokeColor = color;
    };
    this.SetTextBackgroundById = function(id,color,opacity){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_bBackground = true;
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_sBackgroundColor = color;
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_sBackgroundOpacity = opacity;
    };
    this.SetTextBackgroundBorderById = function(id,color){
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_bBackgroundBorder = true;
        core.GetTextSpriteById(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel],id).m_sBackgroundBorderColor = color;
    };
	
	this.ClearMap = function()
	{
		var i=0;
            //Sprites
            core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites = [];
            for(i=0;i<core.GetSpriteGroupCount(this.m_pLevelsGroupIds[this.m_iSelectedLevel]);i++)
            {
                    delete core.m_pSpritesGroups[this.m_pLevelsGroupIds[this.m_iSelectedLevel]].m_pSprites[i];
            }
            //Text
            core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[this.m_iSelectedLevel]].m_pSprites = [];
            for(i=0;i<core.GetTextSpriteGroupCount(this.m_pLevelsTextGroupIds[this.m_iSelectedLevel]);i++)
            {
                delete core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[this.m_iSelectedLevel]].m_pSprites[i];
            }
	};
        
        
	
	this.DrawLevel = function(level_id)
	{
            var i=0,id = 0;;		
            for(i=0;i<core.GetSpriteGroupCount(this.m_pLevelsGroupIds[level_id]);i++)
            {
                    if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_iVisible == 1)
                    {
                        id = core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pDrawOrder[i].id;
                        if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[id].m_sType === "animation"){
                            core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[id].Update(core.m_iLoopTime);
                        }
                        core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]].m_pSprites[id].Draw(core.m_pCanvasContext,core.m_pCanvasContext2d,core.m_iScaleLevel);
                    }
            }
            
            core.SortGroupDrawOrder(core.m_pSpritesGroups[this.m_pLevelsGroupIds[level_id]]);

            for(i=0;i<core.GetTextSpriteGroupCount(this.m_pLevelsTextGroupIds[level_id]);i++)
            {
                if(core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[level_id]].m_iVisible == 1)
                {
                    id = core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[level_id]].m_pDrawOrder[i].id;
                    core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[level_id]].m_pSprites[id].Draw(core.m_pCanvasContext,core.m_pCanvasContext2d,core.m_iScaleLevel);
                }
            }
	};
        
	this.Draw = function()
	{
		if(this.m_bDrawAllLevels)
		{
			var i=0;
			for(i=0;i<this.m_iLevelsCount;i++)
			{
				this.DrawLevel(i);
			}
		}
		else
		{
			this.DrawLevel(this.m_iSelectedLevel);
		}		
	};
	
	this.UpdateMapPosition = function(){
		var i=0,l=0;;
		if(this.m_iSnapFlag === 1)
		{
			var posx = Math.ceil(this.m_iMapX/64)*64;
			var posy = Math.ceil(this.m_iMapY/32)*32;
			this.m_iMapX = posx;
			this.m_iMapY = posy;
		}
		
		for(l=0;l<this.m_iLevelsCount;l++)
		{
			//code make level highter than selected invisible
			/*if(i <= this.m_iSelectedLevel)
			{
				core.m_pStaticSpritesGroups[this.m_pLevelsStaticGroupIds[i]].m_iVisible = 1;
				core.m_pAnimationSpritesGroups[this.m_pLevelsAnimationGroupIds[i]].m_iVisible = 1;
			}
			else
			{
				core.m_pStaticSpritesGroups[this.m_pLevelsStaticGroupIds[i]].m_iVisible = 0;
				core.m_pAnimationSpritesGroups[this.m_pLevelsAnimationGroupIds[i]].m_iVisible = 0;
			}*/
		
			for(i=0;i<core.GetSpriteGroupCount(this.m_pLevelsGroupIds[l]);i++)
			{
				if(core.m_pSpritesGroups[this.m_pLevelsGroupIds[l]].m_iVisible == 1)
				{
                                    core.m_pSpritesGroups[this.m_pLevelsGroupIds[l]].m_pSprites[i].SetTranslate(this.m_iMapX,this.m_iMapY);
				}
			}

                        for(i=0;i<core.GetTextSpriteGroupCount(this.m_pLevelsTextGroupIds[l]);i++)                        {
                            if(core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[l]].m_iVisible == 1){
                                core.m_pTextSpritesGroups[this.m_pLevelsTextGroupIds[l]].m_pSprites[i].SetTranslate(this.m_iMapX,this.m_iMapY);
                            }
                        }
                };

            };
	
}