


function Mouse(canvas_x,canvas_y)
{
	"use strict";
        this.canvasX = canvas_x;
        this.canvasY = canvas_y;
	this.mouseX = 0;
	this.mouseY = 0;
	this.dragStartMouseX = 0;
	this.dragStartMouseY = 0;
	this.dragPositionX = 0;
	this.dragPositionY = 0;
	this.tmpDragPositionX = 0;
	this.tmpDragPositionY = 0;
	
	this.m_iSecondMouse = 0;
	this.m_iSecondDragSizeX = 0;
	this.m_iSecondDragSizeY = 0;
	
	this.m_iFirstMouse = 0;
	this.m_iFirstDragSizeX = 0;
	this.m_iFirstDragSizeY = 0;
	
	this.GetRightMouse = function()
	{
		return this.m_iSecondMouse;
	};
	
	this.GetLeftMouse = function()
	{
		return this.m_iFirstMouse;
	};
	
	this.MouseDown = function(event)
	{
		if(event.button == 0)
		{
			this.m_iFirstMouse = 1;
			this.m_iFirstDragSizeX = 0;
			this.m_iFirstDragSizeY = 0;
		}
		if(event.button == 2)
		{
			this.m_iSecondMouse = 1;
			this.m_iSecondDragSizeX = 0;
			this.m_iSecondDragSizeY = 0;
		}
		//if(event.button!=2)return false;
		this.dragStartMouseX = this.mouseX;
		this.dragStartMouseY = this.mouseY;
		return false;
	};
	
	this.MouseUp = function(event)
	{
		if(event.button == 0)
		{
			this.m_iFirstMouse = 0;
			this.m_iFirstDragSizeX = 0;
			this.m_iFirstDragSizeY = 0;
		}
		if(event.button == 2)
		{
			this.m_iSecondMouse = 0;
			this.m_iSecondDragSizeX = 0;
			this.m_iSecondDragSizeY = 0;
		}
		this.dragPositionX += this.tmpDragPositionX;
		this.dragPositionY += this.tmpDragPositionY;
		this.tmpDragPositionX = 0;
		this.tmpDragPositionY = 0;
		this.dragStartMouseX = 0;
		this.dragStartMouseY = 0;
		return false;
	};
	this.MouseMove = function(event)
	{
		var IE = document.all?true:false;
		if (!IE) document.captureEvents(Event.MOUSEMOVE)
		if (IE)
		{ // grab the x-y pos.s if browser is IE
			this.mouseX = event.clientX + document.body.scrollLeft - this.canvasX;
			this.mouseY = event.clientY + document.body.scrollTop - this.canvasY;
		}
		else
		{  // grab the x-y pos.s if browser is NS
			this.mouseX = event.pageX - this.canvasX;
			this.mouseY = event.pageY - this.canvasY;
		}  
		if (this.mouseX < 0){this.mouseX = 0;}
		if (this.mouseY < 0){this.mouseY = 0;}
		
		if(this.dragStartMouseX != 0)this.tmpDragPositionX = this.mouseX - this.dragStartMouseX;
		if(this.dragStartMouseY != 0)this.tmpDragPositionY =this. mouseY - this.dragStartMouseY;
		
		if(this.m_iFirstMouse == 1)
		{
			this.m_iFirstDragSizeX = this.mouseX - this.dragStartMouseX;
			this.m_iFirstDragSizeY = this.mouseY - this.dragStartMouseY;
		}
		if(this.m_iSecondMouse == 1)
		{
			this.m_iSecondDragSizeX = this.mouseX - this.dragStartMouseX;
			this.m_iSecondDragSizeY = this.mouseY - this.dragStartMouseY;
		}
		return true;
	};
	
	this.ClearDragSizes = function()
	{
		this.m_iFirstDragSizeX = 0;
		this.m_iFirstDragSizeY = 0;
		this.m_iSecondDragSizeX = 0;
		this.m_iSecondDragSizeY = 0;
	};
	
}



