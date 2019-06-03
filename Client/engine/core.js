/** Class for managing and rendering sprites on canvas
 * @class Core
 * @param {strind} html5 canvas id value
 * @returns {Core}
 */
function Core(canvas)
{
	"use strict";
	this.m_iFps = 0;
	this.m_pCanvasContext = document.getElementById(canvas);
	this.m_pCanvasContext2d = this.m_pCanvasContext.getContext("2d");
	
	this.m_pSprites = [];
	this.m_pSpritesGroups = [];

        this.m_pTextSprites = [];
        this.m_pTextSpritesGroups = [];
	
	this.m_iScaleLevel = 1;
	this.m_iLoopTime = 0;
	
	this.canvas_x = 0;
	this.canvas_y = 0;
	this.canvas_w = 0;
	this.canvas_h = 0;

    this.onScaleChanged = function(value){};

    this.setScaleLevel = function(value){
        this.m_iScaleLevel = value;
        this.onScaleChanged(this.m_iScaleLevel);
    };
	
	this.InitCanvasSize = function()
	{
		this.canvas_x = parseInt(document.getElementById(canvas).style.left,10);
		this.canvas_y = parseInt(document.getElementById(canvas).style.top,10);
		this.canvas_w = parseInt(document.getElementById(canvas).width,10);
		this.canvas_h = parseInt(document.getElementById(canvas).height,10);
	};
	
	this.CreateDrawOrderArray = function(sprite_array){
            var i = 0,ret = [];
            for(i=0;i<sprite_array.length;i+=1){
                    ret.push(new SpriteSortParams(i,sprite_array[i].x,sprite_array[i].y+sprite_array[i].h,
                                                    sprite_array[i].w,sprite_array[i].h));
            }
            return ret;
	};
	this.SortDrawOrder = function(draw_order_array){
		draw_order_array.sort(function(a,b){return a.x-b.x;});
		draw_order_array.sort(function(a,b){return a.y-b.y;});
		//old unchecked but maybe more correct way
		//this.m_pStaticSpritesGroups[group_id].m_pSprites.sort(function(a,b){return (a.x)-b.x;});
		//this.m_pStaticSpritesGroups[group_id].m_pSprites.sort(function(a,b){return (a.y+a.h)-(b.y+b.h);});
	};
	
	this.SortGroupDrawOrder = function(group_object)
	{
		group_object.m_pDrawOrder = this.CreateDrawOrderArray(group_object.m_pSprites);
		this.SortDrawOrder(group_object.m_pDrawOrder);
	};

	this.GetGroupsCount = function(){return this.m_pSpritesGroups.length;};
	this.GetSpriteGroupCount = function(group_id){return this.m_pSpritesGroups[group_id].m_pSprites.length;};
	this.AddSpritesGroup = function(){
		return this.m_pSpritesGroups.push(new SpritesGroup())-1;
	};
	this.RemoveSpritesGroupById = function(group_id){
		return this.m_pSpritesGroups.splice(group_id,1);
	};
        
        //Text Groups
        this.GetTextGroupsCount = function(){return this.m_pTextSpritesGroups.length;};
        this.GetTextSpriteGroupCount = function(group_id){return this.m_pTextSpritesGroups[group_id].m_pSprites.length;};
        this.AddTextSpritesGroup = function(){return this.m_pTextSpritesGroups.push(new SpritesGroup())-1;};
        this.RemoveTextSpritesGroupById = function(group_id){return this.m_pTextSpritesGroups.splice(group_id,1);};
        //End Text Groups

    //Static sprite function
	this.GetSpritesCount = function(){return this.m_pSprites.length;};
	this.AddStaticSpriteFromSrc = function(img_src,x,y,w,h)
	{
		var img = new Image();
		img.src = img_src;
		if(w === 0)w = img.width;
		if(h === 0)h = img.height;
		var ret = this.m_pSprites.push(new StaticSprite(img,x,y,w,h));
		//this.m_pSprites.sort(function(a,b){return a.x-b.x;});
		//this.m_pSprites.sort(function(a,b){return a.y-b.y;});
		return ret-1;
	};
	
	this.AddStaticSprite = function(img,x,y,w,h)
	{
		if(w === 0)w = img.width;
		if(h === 0)h = img.height;
		var ret = this.m_pSprites.push(new StaticSprite(img,x,y,w,h));
		//this.m_pSprites.sort(function(a,b){return a.x-b.x;});
		//this.m_pSprites.sort(function(a,b){return a.y-b.y;});
		return ret-1;
	};
	
	this.AddStaticSpriteToGroupFromSrc = function(group_id,img_src,x,y,w,h)
	{
		var img = new Image();
		img.src = img_src;
		if(w === 0){w = img.width;}
		if(h === 0){h = img.height;}
		var ret = parseInt(this.m_pSpritesGroups[group_id].m_pSprites.push(new StaticSprite(img,x,y,w,h)),10);
		this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
		return ret-1;
	};
	
	this.AddStaticSpriteToGroup = function(group_id,img_obj,x,y,w,h)
	{
		var img = new Image();
		img = img_obj;
		if(w === 0){w = img.width;}
		if(h === 0){h = img.height;}
		var ret = parseInt(this.m_pSpritesGroups[group_id].m_pSprites.push(new StaticSprite(img,x,y,w,h)),10);
		this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
		return ret-1;
	};
	this.AddStaticSpriteToGroupById = function(group_id,id,x,y)
	{
		var img = new Image();
		img.src = this.m_pSprites[id].m_pImgObj.src;
		var ret = parseInt(this.m_pSpritesGroups[group_id].m_pSprites.push(new StaticSprite(img,x,y,this.m_pSprites[id].w,this.m_pSprites[id].h)),10);
		this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
		return ret-1;
	};
	
	this.RemoveSpriteById = function(id)
	{
		this.m_pSprites.splice(id,1);
	};
	this.RemoveSpriteFromGroupById = function(group_id,id)
	{
            this.m_pSpritesGroups[group_id].m_pSprites.splice(id,1);
            this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
	};

    this.SetSpriteImgById = function(group_id,sprite_id,img_obj)
    {
        if(group_id < this.GetGroupsCount() && sprite_id < this.GetSpriteGroupCount(group_id))
        {
            this.m_pSpritesGroups[group_id].m_pSprites[sprite_id].UpdateSpriteImg(img_obj);
        }
    };
    
    this.SetSpriteImgById = function(sprite_id,img_obj)
    {
        if(sprite_id < this.GetSpritesCount())
        {
            this.m_pSprites[sprite_id].UpdateSpriteImg(img_obj);
        }
    };

    this.GetSpriteById = function(group_id,sprite_id)
    {
        var i=group_id,j=sprite_id;
        if(i < this.GetGroupsCount() && j < this.GetSpriteGroupCount(i))
        {
            return this.m_pSpritesGroups[i].m_pSprites[j];
        }
    };

    /** Get sprite info array by coords and group_id
     * @memberOf Core
     * @param {int} group_id
     * @param {int} x
     * @param {int} y
     * @returns {Number|Array} returns -1 if not selected or array of data [1,group_id,sprite_id]
     */
    this.GetSpriteInGroupByCoords = function(group_id,x,y)
    {
        for(var j=0;j<this.GetSpriteGroupCount(group_id);j++)
        {
            var sx = this.m_pSpritesGroups[group_id].m_pSprites[j].x;
            var sy = this.m_pSpritesGroups[group_id].m_pSprites[j].y;
            var sw = this.m_pSpritesGroups[group_id].m_pSprites[j].w;
            var sh = this.m_pSpritesGroups[group_id].m_pSprites[j].h;

            if(x > sx && y > sy && x < sx+sw && y < sy+sh)
            {
                var ret = new Array();
                ret[0] = 1;
                if(this.m_pSpritesGroups[group_id].m_pSprites[j].m_sType === "animation"){
                    ret[0] = 2;
                }
                ret[1] = group_id;
                ret[2] = j;
                return ret;

            }
        }
        return -1;
    };
    
    /** Get sprite info array by coords
     * 
     * @memberOf Core 
     * @param {int} x
     * @param {int} y
     * @returns {Number|Array} returns -1 if not selected or array of data [1,group_id,sprite_id]
     */
    this.GetSpriteByCoords = function(x,y){
        var ret = -1;
        for(var i=0;i<this.GetStaticGroupsCount();i++){
            ret = this.GetStaticSpriteInGroupByCoords(i,x,y);
            if(ret !== -1){
                break;
            }
        }
        return ret;
    };
    
    this.GetSprite = function(sprite_id){
        return this.m_pSprites[sprite_id];
    };
    //End Static sprite function

	//Animation sprite function
	this.AddAnimationSprite = function(img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
	{
		var ret = this.m_pSprites.push(new AnimatedSprite(img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout));
		//this.m_pSprites.sort(function(a,b){return a.x-b.x;});
		//this.m_pSprites.sort(function(a,b){return a.y-b.y;});
		return ret - 1;
	};
	this.AddAnimationSpriteToGroup = function(group_id,img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
	{
		var ret = this.m_pSpritesGroups[group_id].m_pSprites.push(new AnimatedSprite(img,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout))-1;
		this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
		return ret;
	};
	
	this.AddAnimationSpriteToGroupById = function(group_id,id,x,y)
	{
            var img = new Image(); 
            img.src = this.m_pSprites[id].m_pImgObjSheet.src;
            
            var sprt = new AnimatedSprite(img,x,y,
                                            this.m_pSprites[id].w,this.m_pSprites[id].h,
                                            this.m_pSprites[id].m_iFrameCur,this.m_pSprites[id].m_iFrameMax,
                                            this.m_pSprites[id].m_pAnimationsFrames,this.m_pSprites[id].m_iAnimationId,this.m_pSprites[id].m_iTimeout);
            var ret = this.m_pSpritesGroups[group_id].m_pSprites.push(sprt)-1;
            this.SortGroupDrawOrder(this.m_pSpritesGroups[group_id]);
            return ret;
	};
    
        this.SetAnimationSpriteImgById = function(group_id,sprite_id,imgs,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
	{
		if(group_id < this.GetGroupsCount() && sprite_id < this.GetSpriteGroupCount(group_id))
		{
			this.m_pSpritesGroups[group_id].m_pSprites[sprite_id].UpdateSpriteData(imgs,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout);
		}
	};
        this.SetAnimationSpriteImgById = function(sprite_id,imgs,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
	{
            if(sprite_id < this.GetSpritesCount())
            {
               this.m_pSprites[sprite_id].UpdateSpriteData(imgs,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout);
            }
	};
    //End Animation sprite function

    //Text sprite function
    this.GetTextSpriteCount = function(){return this.m_pTextSprites.length;};
    this.AddTextSprite = function(text,x,y,size){
        var ret = this.m_pTextSprites.push(new TextSprite(text,x,y,size));
        this.m_pTextSprites.sort(function(a,b){return a.x-b.x;});
        this.m_pTextSprites.sort(function(a,b){return a.y-b.y;});
        return ret-1;
    };

    this.AddTextSpriteToGroup = function(group_id,text,x,y,size){
        var ret = parseInt(this.m_pTextSpritesGroups[group_id].m_pSprites.push(new TextSprite(text,x,y,size)),10);
        this.SortGroupDrawOrder(this.m_pTextSpritesGroups[group_id]);
        return ret-1;
    };


    this.AddTextSpriteToGroupById = function(group_id,id,x,y,size){
        var text = this.m_pTextSprites[id].m_sText;
        var size = this.m_pTextSprites[id].m_iSize;
        var ret = parseInt(this.m_pTextSpritesGroups[group_id].m_pSprites.push(new TextSprite(text,x,y,size)),10);
        this.SortGroupDrawOrder(this.m_pTextSpritesGroups[group_id]);
        return ret-1;
    };

    this.RemoveTextSpriteFromGroupById = function(group_id,id){
        this.m_pTextSpritesGroups[group_id].m_pSprites.splice(id,1);
        this.SortGroupDrawOrder(this.m_pTextSpritesGroups[group_id]);
    };

    this.SetTextSpriteTextById = function(group_id,sprite_id,text){
        if(group_id < this.GetTextGroupsCount() && sprite_id < this.GetTextSpriteGroupCount(group_id)){
            this.m_pTextSpritesGroups[group_id].m_pSprites[sprite_id].m_sText = text;
        }
    };

    this.GetTextSpriteById = function(group_id,sprite_id){
        var i=group_id,j=sprite_id;
        if(i < this.GetTextGroupsCount() && j < this.GetTextSpriteGroupCount(i)){
            return this.m_pTextSpritesGroups[i].m_pSprites[j];
        }
    };

    this.GetTextSpriteInGroupByCoords = function(group_id,x,y){
        var j=0;
        for(j=0;j<this.GetTextSpriteGroupCount(group_id);j++){
            var sx = this.m_pTextSpritesGroups[group_id].m_pSprites[j].x;
            var sy = this.m_pTextSpritesGroups[group_id].m_pSprites[j].y;
            var sw = this.m_pTextSpritesGroups[group_id].m_pSprites[j].w;
            var sh = this.m_pTextSpritesGroups[group_id].m_pSprites[j].h;

            if(x > sx && y > sy && x < sx+sw && y < sy+sh){
                var ret = new Array();
                ret[0] = 1;
                ret[1] = group_id;
                ret[2] = j;
                return ret;

            }
        }
        return -1;
    };

    this.GetTextSprite = function(sprite_id)
    {
        return this.m_pTextSprites[sprite_id];
    };
    this.GetTextSpriteInGroupByCoords = function(group_id,x,y)
    {
        var j=0;
        for(j=0;j<this.GetTextSpriteGroupCount(group_id);j++){
            var sx = this.m_pTextSpritesGroups[group_id].m_pSprites[j].x;
            var sy = this.m_pTextSpritesGroups[group_id].m_pSprites[j].y;
            var sw = this.m_pTextSpritesGroups[group_id].m_pSprites[j].w;
            var sh = this.m_pTextSpritesGroups[group_id].m_pSprites[j].h;

            if(x > sx && y > sy && x < sx+sw && y < sy+sh){
                var ret = new Array();
                ret[0] = 2;
                ret[1] = group_id;
                ret[2] = j;
                return ret;
            }
        }
        return -1;
    };
    //End Text sprite function


	
	this.Clear = function()
	{
		this.m_pCanvasContext2d.clearRect(0, 0, this.canvas_w, this.canvas_h);
	};
	
	this.Render = function(time)
	{
		this.m_iLoopTime = time;
		var i=0;
		
		for(i=0;i<this.GetSpritesCount();i++)
		{
                    if(this.m_pSprites[i].m_sType === "animation"){
                        this.m_pSprites[i].Update(this.m_iLoopTime);
                    }
                    this.m_pSprites[i].Draw(this.m_pCanvasContext,this.m_pCanvasContext2d,this.m_iScaleLevel);
		}

        for(i=0;i<this.GetTextSpriteCount();i++)
        {
            this.m_pTextSprites[i].Draw(this.m_pCanvasContext,this.m_pCanvasContext2d,this.m_iScaleLevel);
        }
		
		this.m_iFps++;
	};
	
	this.GetFps = function()
	{
		var fps = this.m_iFps;
		this.m_iFps = 0;
		return fps;
		
	};
}