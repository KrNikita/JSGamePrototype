


function Touch()
{
	"use strict";
	this.touchX = 0;
	this.touchY = 0;
	this.dragStartTouchX = 0;
	this.dragStartTouchY = 0;
	this.dragPositionX = 0;
	this.dragPositionY = 0;
	this.tmpDragPositionX = 0;
	this.tmpDragPositionY = 0;

    this.m_iFirstDragSizeX = 0;
    this.m_iFirstDragSizeY = 0;

    this.is_touch = false;
    this.is_touched = false;


	this.TouchStart = function(event)
	{
        this.is_touched = true;
        this.is_touch = true;
        this.touchX = parseInt(event.changedTouches[0].pageX);
        this.touchY = parseInt(event.changedTouches[0].pageY);

		if (this.touchX < 0){this.touchX = 0;}
		if (this.touchY < 0){this.touchY = 0;}
        
		this.dragStartTouchX = this.touchX;
		this.dragStartTouchY = this.touchY;
		return false;
	};

	this.TouchEnd = function(event)
	{
        this.is_touched = false;
        this.is_touch = true;
        this.touchX = parseInt(event.changedTouches[0].pageX);
        this.touchY = parseInt(event.changedTouches[0].pageY);

		if (this.touchX < 0){this.touchX = 0;}
		if (this.touchY < 0){this.touchY = 0;}

		this.dragPositionX += this.tmpDragPositionX;
		this.dragPositionY += this.tmpDragPositionY;
		this.tmpDragPositionX = 0;
		this.tmpDragPositionY = 0;
		this.dragStartTouchX = 0;
		this.dragStartTouchY = 0;
		return false;
	};
	this.TouchMove = function(event)
	{
        this.is_touch = true;
        this.touchX = parseInt(event.changedTouches[0].pageX);
        this.touchY = parseInt(event.changedTouches[0].pageY);
		
		if (this.touchX < 0){this.touchX = 0;}
		if (this.touchY < 0){this.touchY = 0;}

		if(this.dragStartTouchX != 0)this.tmpDragPositionX = this.touchX - this.dragStartTouchX;
		if(this.dragStartTouchY != 0)this.tmpDragPositionY = this.touchY - this.dragStartTouchY;

        this.m_iFirstDragSizeX = this.touchX - this.dragStartTouchX;
		this.m_iFirstDragSizeY = this.touchY - this.dragStartTouchY;

		return true;
	};

	this.ClearDragSizes = function()
	{

	};

    this.isTouch = function(){
        return this.is_touch;
    }

    this.isTouched = function(){
        return this.is_touched;
    }

}




