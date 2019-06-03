"use strict"
function CCharacter(){
    "use strict"
    this.MOVE_UP = 0;
    this.MOVE_UP_RIGHT = 1;
    this.MOVE_RIGHT = 2;
    this.MOVE_DOWN_RIGHT = 3;
    this.MOVE_DOWN = 4;
    this.MOVE_DOWN_LEFT = 5;
    this.MOVE_LEFT = 6;
    this.MOVE_UP_LEFT = 7;
    
    this.m_pDirectionsLabels = ["U","UR","R","DR","D","DL","L","UL"];
    
    this.m_bInitialized = false;
    this.initializedCallback = function(){}
    this.m_iCellWidth = 0;
    this.m_iCellHeight = 0;
    this.m_sName = "";
    this.m_iPositionOffsetX = {};
    this.m_iPositionOffsetY = {};
    this.m_iSpriteIds = {};
    this.m_iSpriteIdForGetOpetarions = -1;
    this.m_sFirstVisibleAnimation = 'Stand';
    this.m_sFirstVisibleDirection = 'DR';
    
    this.m_sCurrentAnimation = 'Stand';
    this.m_sCurrentDirection = 'DR';
    
    this.m_iCellPosX = 0;
    this.m_iCellPosY = 0;
    this.m_iNextCellPosX = 0;
    this.m_iNextCellPosY = 0;
    
    this.m_iMoveSpeedX = 16;
    this.m_iMoveSpeedY = 8;
    this.m_iMoveTimeout = 100;
    
    this.m_iMoveIterations = 0;
    this.m_iMoveIterator = 0;
    
    this.m_bVisibilityFlag = true;
    
    this.m_bMovingFlag = false;
    this.m_bNewMoveFlag = false;
    this.newMoveFunction = function(){};
    this.sendPositionFunction = function(cell_x,cell_y){};
    this.m_pPathX = [];
    this.m_pPathY = [];
    
    this.m_iCurrentDirection = 3;
    
    this.m_sIdleInimation = 'Run';
    
    this.m_bAttackFlag = false;
    this.m_bAttackInProgressFlag = false;
    this.m_iTargetCellX = 0;
    this.m_iTargetCellY = 0;
    this.sendAttackFunction = function(target_x,target_y){};
    this.shots = [];
    
    this.m_pHeadText;
    this.m_iHealth = 100;
    
    this.setHealth = function(val){
        this.m_iHealth = val;
        map.GetTextTileById(this.m_pHeadText).SetText(this.m_iHealth+'');
    }
    
    this.getVisibility = function(){return this.m_bVisibilityFlag;}
    this.setVisibility = function(val){
        this.m_bVisibilityFlag = val;
        this.setCurrentAnimationAndDirection(this.m_sCurrentAnimation,this.m_pDirectionsLabels[this.m_iCurrentDirection]);
    }
    
    this.m_sAttackAction = '';
    this.m_iAttackTargetX = 0;
    this.m_iAttackTargetY = 0;
    
    this.SetAttack = function(action,target_x,target_y){
        if(this.m_bMovingFlag && !this.m_bAttackFlag){
            this.m_sAttackAction = action;
            this.m_sAttackTargetX = target_x;
            this.m_sAttackTargetY = target_y;
            this.m_bAttackFlag = true;
        }else if(!this.m_bAttackFlag){
            
            this.DoAttack(action,target_x,target_y,function(){
                this.setCurrentAnimationAndDirection('Stand',this.m_pDirectionsLabels[this.m_iCurrentDirection]);
                this.m_bAttackFlag = false;
            }.bind(this));
        }
    };
    
    this.DoAttack = function(action,target_x,target_y,after_callback){
        
        if(!this.m_bAttackInProgressFlag){
            this.m_bAttackInProgressFlag = true;
            this.sendAttackFunction(target_x,target_y);
            this.shots.push({x:this.GetPositionX(),y:this.GetPositionY(),tx:target_x,ty:target_y});
            var _sprite = map.GetAnimTileById(this.m_iSpriteIds['AttackRifleSingle'][this.m_pDirectionsLabels[this.m_iCurrentDirection]]);
            _sprite.SetOneTimeAnimation();           
            _sprite.RunAnimation();
            _sprite.OnRunAnimationFinished = function(){
                this.m_bAttackInProgressFlag = false;
                after_callback();
            }.bind(this);
            
            this.setCurrentAnimationAndDirection('AttackRifleSingle',this.m_pDirectionsLabels[this.m_iCurrentDirection]);
        }
    }
    
    
    this.DrawShootDir = function(){
        for(var i in this.shots){
            DrawLine(core.m_pCanvasContext2d,
                    this.shots[i].x + map.m_iMapX,
                    this.shots[i].y + map.m_iMapY,
                    this.shots[i].tx + map.m_iMapX,
                    this.shots[i].ty + map.m_iMapY,'#f00');
        }
        
    }
    
    this.DeInit = function(){
        for(var s in this.m_iSpriteIds){
            for(var d in this.m_iSpriteIds[s]){
                map.RemAnimTile(this.m_iSpriteIds[s][d]);
            }
        }
        map.RemTextTile(this.m_pHeadText);
    }
    this.Init = function(name,animations,cell_w,cell_h,cell_x,cell_y){
        this.m_iCellWidth = cell_w;
        this.m_iCellHeight = cell_h;
        this.m_sName = name;
        
        this.m_iMoveIterations = this.m_iCellWidth/this.m_iMoveSpeedX;
        
        map.SetCurLevel(1);
        //create text
        this.m_pHeadText = map.AddText(this.m_iHealth+'',10*this.m_iCellWidth,10*this.m_iCellHeight - 20,20);
        
        for(var a in animations){
            var anim = a;
            this.m_iSpriteIds[anim] = {};
            this.m_iPositionOffsetX[anim] = {};
            this.m_iPositionOffsetY[anim] = {};
            for(var d in this.m_pDirectionsLabels){
                var dir = this.m_pDirectionsLabels[d];
                //create animations
                sprite_manager.addAnimatedSprite('char_'+this.m_sName+'_'+anim+'_'+dir,
                        'http://46.101.203.11:2000/Client/media/characters/'+this.m_sName+'/'+this.m_sName+'_'+anim+'_'+dir+'_'+animations[a]+'x1.png',function(key){
                        var _anim_dir = key.substr(new String('char_'+this.m_sName+'_').length).split('_');
                        var _anim = _anim_dir[0];
                        var _dir = _anim_dir[1];

                        var sprite = sprite_manager.getSprite(key);

                        this.m_iSpriteIds[_anim][_dir] = map.AddAnimTileFromImg(
                                sprite.getImage(),
                                0,//x-offset_position_x+this.m_iQuaterCellWidth,
                                0,//y-offset_position_y+this.m_iQuaterCellHeight,
                                sprite.getWidth(),
                                sprite.getHeight(),
                                0,
                                sprite.getFramesCount(),
                                [0,sprite.getFramesCount()],
                                0,
                                sprite.getAnimationTimeout(),
                                true);

                                map.GetAnimTileById(this.m_iSpriteIds[_anim][_dir]).SetVisibility(false);
                                if(this.m_sFirstVisibleAnimation === _anim && this.m_sFirstVisibleDirection === _dir){
                                    map.GetAnimTileById(this.m_iSpriteIds[_anim][_dir]).SetVisibility(true);
                                }
                                //Set SpriteId for get operations
                                if(this.m_iSpriteIdForGetOpetarions < 0){
                                    this.m_iSpriteIdForGetOpetarions = this.m_iSpriteIds[_anim][_dir];
                                }

                                
                                if(this.m_iCellWidth > sprite.getWidth()){
                                    this.m_iPositionOffsetX[_anim][_dir] = (this.m_iCellWidth - sprite.getWidth())*0.5;
                                }else{
                                    this.m_iPositionOffsetX[_anim][_dir] = ((sprite.getWidth()-this.m_iCellWidth)*0.5)*-1;
                                }
                                this.m_iPositionOffsetY[_anim][_dir] = (sprite.getHeight()-this.m_iCellHeight)*-1;
                                
                                this.SetCellPosition(cell_x,cell_y);

                                this.m_bInitialized = true;

                                this.initializedCallback();
                            }.bind(this));
            }
        }
        
    };
    
    this.SetShootTarget = function(x,y){
        
    }
    this.SetCellValues = function(cell_x,cell_y){
        this.m_iCellPosX = cell_x;
        this.m_iCellPosY = cell_y;
        this.m_iNextCellPosX = this.m_iCellPosX;
        this.m_iNextCellPosY = this.m_iCellPosY;
    }
    this.SetCellPosition = function(cell_x,cell_y){
        this.m_iCellPosX = cell_x;
        this.m_iCellPosY = cell_y;
        this.m_iNextCellPosX = this.m_iCellPosX;
        this.m_iNextCellPosY = this.m_iCellPosY;
        
        
        for(var s in this.m_iSpriteIds){
            for(var d in this.m_iSpriteIds[s]){
                var _x = (cell_x * this.m_iCellWidth)+this.m_iPositionOffsetX[s][d];
                var _y = (cell_y * this.m_iCellHeight)+this.m_iPositionOffsetY[s][d];
                map.GetTextTileById(this.m_pHeadText).SetPosition(_x,_y-20);
                map.GetAnimTileById(this.m_iSpriteIds[s][d]).SetPosition(_x,_y);
            }
        }
    };
    
    this.GetPositionX = function(){return map.GetAnimTileById(this.m_iSpriteIdForGetOpetarions).x;}
    this.GetPositionY = function(){return map.GetAnimTileById(this.m_iSpriteIdForGetOpetarions).y;}
    
    this.SetPosition = function(x,y){
        
        map.GetTextTileById(this.m_pHeadText).SetPosition(x,y-20);
        for(var s in this.m_iSpriteIds){
            for(var d in this.m_iSpriteIds[s]){
                map.GetAnimTileById(this.m_iSpriteIds[s][d]).SetPosition(x,y);
            }
        }
    };
    
    this.setCurrentAnimationAndDirection = function(anim,dir){
        this.m_sCurrentAnimation = anim;
        for(var s in this.m_iSpriteIds){
            for(var d in this.m_iSpriteIds[s]){
                map.GetAnimTileById(this.m_iSpriteIds[s][d]).SetVisibility(false);
            }
        }
        if(this.m_bVisibilityFlag){
            map.GetAnimTileById(this.m_iSpriteIds[anim][dir]).SetVisibility(true);
        }
    }
    
    this.MoveInit = function(){
        this.m_bNewMoveFlag = true;
        this.m_pPathX.pop();
        this.m_pPathY.pop();
        
    };
    
    this.AddCellToPath = function(cell_x,cell_y){
        if(cell_x === this.m_iCellPosX && cell_y === this.m_iCellPosY)return;
        this.m_pPathX.unshift(cell_x);
        this.m_pPathY.unshift(cell_y);
    };
    
    this.isPathExist = function(){
        return (this.m_pPathX.length === 0)?false:true;
    };
    
    this.SetNewPath = function(path_cells_x,path_cells_y){
        this.m_pPathX = path_cells_x.slice();
        this.m_pPathY = path_cells_y.slice();
        
        if(this.m_bMovingFlag){
            this.m_bNewMoveFlag = true;
            this.newMoveFunction = function(){
                this.MoveInit();
                this.Move();
            };
        }else{
            this.MoveInit();
            this.Move();
        }
    }
    
    this.Move = function(){
        if(this.m_pPathX.length > 0){
            this.m_bMovingFlag = true;
            if(this.m_iMoveIterator === 0){
                this.m_bNewMoveFlag = false;
                this.m_iMoveIterator = this.m_iMoveIterations;
                if(this.isPathExist()){
                    this.m_iCurrentDirection = this.GetDirection(this.m_iCellPosX,this.m_iCellPosY,
                                                            this.m_pPathX[this.m_pPathX.length-1],
                                                            this.m_pPathY[this.m_pPathY.length-1]);
                }
                this.setCurrentAnimationAndDirection('Run',this.m_pDirectionsLabels[this.m_iCurrentDirection]);
            }
            
            this.m_iMoveIterator--;
            this.MoveInDirection(this.m_iCurrentDirection);
            //this.sendPositionFunction(this.GetPositionX(),this.GetPositionY());
            if(this.m_iMoveIterator === 0){
                                
                this.m_iCellPosX = this.m_pPathX[this.m_pPathX.length-1];
                this.m_iCellPosY = this.m_pPathY[this.m_pPathY.length-1];
                
                this.sendPositionFunction(this.m_iCellPosX,this.m_iCellPosY);
                
                if(this.m_pPathX.length > 1){
                    this.m_iNextCellPosX = this.m_pPathX[this.m_pPathX.length-2];
                    this.m_iNextCellPosY = this.m_pPathY[this.m_pPathY.length-2];
                }else{
                    this.m_iNextCellPosX = this.m_iCellPosX;
                    this.m_iNextCellPosY = this.m_iCellPosY;
                }                
                
                if(this.m_bNewMoveFlag){
                    this.newMoveFunction();
                    return;
                }
                
                this.m_pPathX.pop();
                this.m_pPathY.pop();
                if(this.isPathExist()){
                    this.m_iCurrentDirection = this.GetDirection(this.m_iCellPosX,this.m_iCellPosY,
                                                             this.m_pPathX[this.m_pPathX.length-1],
                                                             this.m_pPathY[this.m_pPathY.length-1]);
                }
                this.setCurrentAnimationAndDirection('Run',this.m_pDirectionsLabels[this.m_iCurrentDirection]);
            }
            
            if(this.m_bAttackFlag){
                this.DoAttack(this.m_sAttackAction,this.m_iAttackTargetX,this.m_iAttackTargetY,function(){
                    setTimeout(function(){
                        this.m_bAttackFlag = false;
                        this.Move();
                    }.bind(this),
                    (this.m_iCurrentDirection === this.MOVE_UP || this.m_iCurrentDirection === this.MOVE_DOWN)?this.m_iMoveTimeout*0.5:this.m_iMoveTimeout);
                }.bind(this));
            }
            else{
                setTimeout(function(){
                        this.Move();
                    }.bind(this),
                    (this.m_iCurrentDirection === this.MOVE_UP || this.m_iCurrentDirection === this.MOVE_DOWN)?this.m_iMoveTimeout*0.5:this.m_iMoveTimeout);
            }
        }else{
            this.m_bMovingFlag = false;
            this.setCurrentAnimationAndDirection('Stand',this.m_pDirectionsLabels[this.m_iCurrentDirection]);
        }
    };
    
    this.GetDirection = function(cell_x,cell_y,next_cell_x,next_cell_y){
        if(cell_x === next_cell_x && cell_y > next_cell_y){
            return this.MOVE_UP; 
        }else if(cell_x < next_cell_x && cell_y > next_cell_y){
            return this.MOVE_UP_RIGHT; 
        }else if(cell_x < next_cell_x && cell_y === next_cell_y){
            return this.MOVE_RIGHT; 
        }else if(cell_x < next_cell_x && cell_y < next_cell_y){
            return this.MOVE_DOWN_RIGHT; 
        }else if(cell_x === next_cell_x && cell_y < next_cell_y){
            return this.MOVE_DOWN; 
        }else if(cell_x > next_cell_x && cell_y < next_cell_y){
            return this.MOVE_DOWN_LEFT; 
        }else if(cell_x > next_cell_x && cell_y === next_cell_y){
            return this.MOVE_LEFT; 
        }else if(cell_x > next_cell_x && cell_y > next_cell_y){
            return this.MOVE_UP_LEFT; 
        }
        return this.m_iCurrentDirection;
    };
    
    this.MoveInDirection = function(direction){
        var _sprite_id = this.m_iSpriteIdForGetOpetarions;
        if(direction === this.MOVE_UP){
            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x,
                map.GetAnimTileById(_sprite_id).y - this.m_iMoveSpeedY);
        }else if(direction === this.MOVE_UP_RIGHT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x + this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y - this.m_iMoveSpeedY);
        }else if(direction === this.MOVE_RIGHT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x + this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y);
        }else if(direction === this.MOVE_DOWN_RIGHT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x + this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y + this.m_iMoveSpeedY);
        }else if(direction === this.MOVE_DOWN){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x,
                map.GetAnimTileById(_sprite_id).y + this.m_iMoveSpeedY);
        }else if(direction === this.MOVE_DOWN_LEFT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x - this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y + this.m_iMoveSpeedY);
        }else if(direction === this.MOVE_LEFT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x - this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y);
        }else if(direction === this.MOVE_UP_LEFT){

            this.SetPosition(
                map.GetAnimTileById(_sprite_id).x - this.m_iMoveSpeedX,
                map.GetAnimTileById(_sprite_id).y - this.m_iMoveSpeedY);
        }
    };
};