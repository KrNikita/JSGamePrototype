function SpriteSortParams(id,x,y,w,h)
{
	"use strict";
	this.id = id;
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
};

function SpritesGroup()
{
	this.m_pSprites = [];
	this.m_pDrawOrder = []; 
	this.m_iVisible = 1;
};

function TextSprite(text,x,y,size){
    "use strict"
    this.m_sType = "text";
    this.m_sText = text;
    this.m_iSize = size;
    this.m_sFont = "Arial";
    this.visible = true;
    this.drawing = 1;
    this.m_bStroke = false;
    this.m_sStrokeColor = "white";
    this.m_sColor = "black";
    this.m_bBackground = false;
    this.m_sBackgroundColor = "white";
    this.m_iBackgroundOpacity = 0.5;
    this.m_bBackgroundBorder = false;
    this.m_sBackgroundBorderColor = "black";
    this.m_sStyle = "";
    this.x = x;
    this.y = y;
    this.w = 100;
    this.h = size;
    this.tx = 0;
    this.ty = 0;
}
TextSprite.prototype.GetWidth = function(){return this.w;}
TextSprite.prototype.GetHeight = function(){return this.h;}
TextSprite.prototype.SetText = function(val){this.m_sText = val;}
TextSprite.prototype.SetStroke = function(){this.m_bStroke = true;}
TextSprite.prototype.SetFill = function(){this.m_bStroke = false;}
TextSprite.prototype.GetVisibility = function(val){return this.visible;};
TextSprite.prototype.SetVisibility = function(val){this.visible = val;};

TextSprite.prototype.SetBackground = function(val){this.m_bBackground = val;}
TextSprite.prototype.SetBackgroundColor = function(color){this.m_sBackgroundColor = color;}
TextSprite.prototype.SetBackgroundOpacity = function(color){this.m_iBackgroundOpacity = val;}
TextSprite.prototype.SetBackgroundBorder = function(val){this.m_bBackgroundBorder = val;}
TextSprite.prototype.SetBackgroundBorderColor = function(color){this.m_sBackgroundBorderColor = color;}

TextSprite.prototype.SetPosition = function(x,y)
{
    this.x = x;
    this.y = y;
};

TextSprite.prototype.SetTranslate = function(x,y)
{
    this.tx = x;
    this.ty = y;
};

TextSprite.prototype.DrawBackground = function(canvas,context,scale,nx,ny){
    if(this.m_bBackground){
        context.fillStyle = this.m_sBackgroundColor;
        var tmp = context.globalAlpha;
        context.globalAlpha = this.m_iBackgroundOpacity;
        context.fillRect(nx-5,ny-this.h,this.w+10,this.h+5);
        context.globalAlpha = tmp;
    }
    if(this.m_bBackgroundBorder){
        context.lineWidth = 1;
        context.strokeStyle = this.m_sBackgroundBorderColor;
        context.strokeRect(nx-5,ny-this.h,this.w+10,this.h+5);
    }
}

TextSprite.prototype.Draw = function(canvas,context,scale)
{
    if(this.visible == 0)return;

    context.save();
    context.font = this.m_sStyle+" "+this.m_iSize+"px "+this.m_sFont;

    this.w = context.measureText(this.m_sText).width;

    if(scale <= 1){
        var nx = this.x+this.tx;
        var ny = this.y+this.ty+this.m_iSize;
        if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h){
            this.drawing = 1;
            this.DrawBackground(canvas,context,scale,nx,ny);    
            if(this.m_bStroke){           
                context.strokeStyle = this.m_sStrokeColor;
                context.fillStyle = this.m_sColor;
                context.lineWidth = 1;
                context.fillText(this.m_sText,nx,ny);
                context.strokeText(this.m_sText,nx,ny);
            }else{
                context.fillStyle = this.m_sColor;
                context.lineWidth = 1;
                context.fillText(this.m_sText,nx,ny);
            }
        }
        else{
            this.drawing = 0;
        }
    }
    else{
        context.fond = Number(this.size/scale)+"px "+this.font;
        var cx = this.x/this.w;
        var cy = this.y/this.h;
        var nx = (cx*(this.w/scale))+this.tx;
        var ny = (cy*(this.h/scale))+this.ty+this.m_iSize;
        if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h){
            this.drawing = 1;
            this.DrawBackground(canvas,context,scale,nx,ny);    
            if(this.m_bStroke){
                context.strokeText(this.m_sText,nx,ny);
            }else{
                context.fillText(this.m_sText,nx,ny);
            }
        }
        else{
            this.drawing = 0;
        }
    }
    context.restore();
};

function StaticSprite(imgObj,x,y,w,h)
{
	"use strict";
        this.m_sType = "static";
	this.m_pImgObj = imgObj; 
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	if(w == 0)this.w = this.m_pImgObj.width;
	if(h == 0)this.h = this.m_pImgObj.height;
	this.visible = 1;
	this.drawing = 1;
	this.tx = 0;
	this.ty = 0;
}

StaticSprite.prototype.GetWidth = function(){return this.w;}
StaticSprite.prototype.GetHeight = function(){return this.h;}

StaticSprite.prototype.UpdateSpriteData = function(imgObj,x,y,w,h)
{
        this.m_pImgObj = imgObj; 
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
        if(w == 0)this.w = this.m_pImgObj.width;
        if(h == 0)this.h = this.m_pImgObj.height;
};

StaticSprite.prototype.UpdateSpriteImg = function(imgObj)
{
        this.m_pImgObj = imgObj; 
};


StaticSprite.prototype.GetVisibility = function(val)
{
        return this.visible;
};

StaticSprite.prototype.SetVisibility = function(val)
{
        this.visible = val;
};

StaticSprite.prototype.SetPosition = function(x,y)
{
        this.x = x;
        this.y = y;
};

StaticSprite.prototype.SetTranslate = function(x,y)
{
        this.tx = x;
        this.ty = y;
};

StaticSprite.prototype.Draw = function(canvas,context,scale)
{
        if(this.visible == 0)return;
        if(scale <= 1)
        {
                var nx = this.x+this.tx;
                var ny = this.y+this.ty;
                if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h)
                {
                        this.drawing = 1;
                        context.drawImage(this.m_pImgObj,nx,ny,this.w,this.h);
                }
                else
                {
                        this.drawing = 0;
                }
        }
        else
        {
                var cx = this.x/this.w;
                var cy = this.y/this.h;
                var nx = (cx*(this.w/scale))+this.tx;
                var ny = (cy*(this.h/scale))+this.ty;
                if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h)
                {
                        this.drawing = 1;
                        context.drawImage(this.m_pImgObj,nx,ny,this.w/scale,this.h/scale);
                }
                else
                {
                        this.drawing = 0;
                }
        }
};
	

function AnimatedSprite(imgObjSheet,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
{
	"use strict";
        this.m_sType = "animation";
	this.m_pImgObjSheet = imgObjSheet;
	this.m_pAnimationsFrames = anim_frames;
	this.m_iAnimationId = 0;
	this.m_iFrameCur = start_frame;
	this.m_iFrameMax = max_frame;
	this.m_iTimeout = timeout;
	this.m_iAnimationId = anim_id;
	this.m_iPrevAnimationId = -1;
	this.m_iTimeoutIter = 0;
	this.m_iVisible = 1;
	this.m_iAnimationType = 0;
	this.drawing = 1;
	
	this.x = x;
	this.y = y;
	this.w = w;
	this.h = h;
	
	this.tx = 0;
	this.ty = 0;
	
	this.static_flag = 0;
}
AnimatedSprite.prototype.GetWidth = function(){return this.w;}
AnimatedSprite.prototype.GetHeight = function(){return this.h;}

AnimatedSprite.prototype.UpdateSpriteData = function(imgObjSheet,x,y,w,h,start_frame,max_frame,anim_frames,anim_id,timeout)
{
        this.m_pImgObjSheet = imgObjSheet;
        this.m_pAnimationsFrames = anim_frames;
        this.m_iAnimationId = 0;
        this.m_iFrameCur = start_frame;
        this.m_iFrameMax = max_frame;
        this.m_iTimeout = timeout;
        this.m_iAnimationId = anim_id;
        this.x = x;
        this.y = y;
        this.w = w;
        this.h = h;
};

AnimatedSprite.prototype.OnRunAnimationFinished = function(){};
AnimatedSprite.prototype.RunAnimation = function()
{
        this.m_iFrameCur = this.GetFirstFrameByAnimationId(this.m_iAnimationId);
        this.static_flag = 0;

};

AnimatedSprite.prototype.StopAnimation = function()
{
        this.static_flag = 1;
        this.OnRunAnimationFinished();
};

AnimatedSprite.prototype.SetFrame = function(id)
{
        if(id <= this.m_iFrameMax)this.m_iFrameMax = id;
};

AnimatedSprite.prototype.SetAnimationNewFrames = function(val)
{
        this.m_pAnimationsFrames.push(val);
};

AnimatedSprite.prototype.GetAnimationsCount = function()
{
        return this.m_pAnimationsFrames.length; 
};

AnimatedSprite.prototype.SetAnimationId = function(val)
{
        this.m_iAnimationId = val;
};

AnimatedSprite.prototype.GetAnimationId = function()
{
        return this.m_iAnimationId;
};

AnimatedSprite.prototype.GetVisibility = function()
{
    return this.m_iVisible;
};

AnimatedSprite.prototype.SetVisibility = function(val)
{
        this.m_iVisible = val;
};

AnimatedSprite.prototype.SetPosition = function(x,y)
{
        this.x = x;
        this.y = y;
};

AnimatedSprite.prototype.SetTranslate = function(x,y)
{
        this.tx = x;
        this.ty = y;
};

AnimatedSprite.prototype.GetTimeout = function(){
    return this.m_iTimeout;
};

AnimatedSprite.prototype.SetTimeout = function(val){
    this.m_iTimeout = val;
};

AnimatedSprite.prototype.GetAnimationType = function(){
    return this.m_iAnimationType;
};

AnimatedSprite.prototype.SetLoopAnimation = function()
{
        this.m_iAnimationType = 0;
};

AnimatedSprite.prototype.SetOneTimeAnimation = function()
{
        this.m_iAnimationType = 1;
};

AnimatedSprite.prototype.getImageShiftByFrameId = function(frame_id){
var full_image_w = this.m_pImgObjSheet.width;
var x = frame_id * this.w;
var y = 0;

if(x => full_image_w){
    var sprites_in_row = full_image_w / this.w;
    x = frame_id % sprites_in_row;
    y = frame_id / sprites_in_row;
}

return [Math.floor(x),Math.floor(y)];
};

AnimatedSprite.prototype.Draw = function(canvas,context,scale)
{
        if(this.m_iVisible == 0)return;
        if(scale <= 1)
        {
                var nx = this.x+this.tx;
                var ny = this.y+this.ty;
                if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h)
                {
                        this.drawing = 1;

                        var shift_pow = this.getImageShiftByFrameId(this.m_iFrameCur);
                        context.drawImage(this.m_pImgObjSheet,shift_pow[0]*this.w,shift_pow[1]*this.h,this.w,this.h,nx,ny,this.w,this.h);
                }
                else
                {
                        this.drawing = 0;
                }
        }
        else
        {
                var cx = this.x/this.w;
                var cy = this.y/this.h;
                var nx = (cx*(this.w/scale))+this.tx;
                var ny = (cy*(this.h/scale))+this.ty;
                if(nx < canvas.width && ny < canvas.height && nx > -this.w && ny > -this.h)
                {
                        this.drawing = 1;
                        var shift_pow = this.getImageShiftByFrameId(this.m_iFrameCur);
                        context.drawImage(this.m_pImgObjSheet,shift_pow[0]*this.w,shift_pow[1]*this.h,this.w,this.h,nx,ny,this.w/scale,this.h/scale);
                }
                else
                {
                        this.drawing = 0;
                }
        }
};

AnimatedSprite.prototype.GetMaxFramesByAnimationId = function(val)
{
        var i=0;
        for(i=0;i<this.m_pAnimationsFrames.length;i++){
                if(i == val)return this.m_pAnimationsFrames[i+1]-1;
        }
        return 0;
};

AnimatedSprite.prototype.GetFirstFrameByAnimationId = function(val)
{
        var i=0;
        for(i=0;i<this.m_pAnimationsFrames.length;i++){
                if(i == val){
        return this.m_pAnimationsFrames[i];
                }
        }
        return 0;
};

AnimatedSprite.prototype.Update = function(render_frame_time)
{
        if(this.static_flag == 1)return;
        this.m_iTimeoutIter += render_frame_time;


        if(this.m_iPrevAnimationId != this.m_iAnimationId)
        {
                this.m_iFrameCur = this.GetFirstFrameByAnimationId(this.m_iAnimationId);
                this.m_iPrevAnimationId = this.m_iAnimationId;
        }


        if(this.m_iTimeoutIter >= this.m_iTimeout)
        {
                this.m_iTimeoutIter = 0;

                if(this.m_iFrameCur < this.GetMaxFramesByAnimationId(this.m_iAnimationId))
                {
                        this.m_iFrameCur++;

                }
                else
                {
                        if(this.m_iAnimationType == 0)
                        {
                                this.m_iFrameCur = this.GetFirstFrameByAnimationId(this.m_iAnimationId);
                        }
                        else if(this.m_iAnimationType == 1)
                        {
                                this.StopAnimation();
                        }
                }
        }
};

function DrawLine(context,x1,y1,x2,y2,color)
{
    context.beginPath();
    context.moveTo(x1, y1);
    context.lineTo(x2, y2);
    context.lineWidth = 1;
    context.strokeStyle = color;
    context.stroke();
};

function DrawRect(context,x,y,w,h,color)
{
    context.beginPath();
    context.rect(x, y, w, h);
    context.strokeStyle = color;
    context.stroke();
};
function DrawFillRect(context,x,y,w,h,color,alpha)
{
    context.beginPath();
    context.globalAlpha = alpha;
    context.rect(x, y, w, h);
    context.strokeStyle = color;
    context.fillStyle = color;
    context.fill();
    context.stroke();
    context.globalAlpha = 1.0;
};