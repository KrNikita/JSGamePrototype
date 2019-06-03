var map;
var core;
var sprite_manager = new SpriteManager();
var mouse = new Mouse(0,0);
var touch = new Touch();
var game_level = new CGameLevel();
var character = new CCharacter();
var players = {};

var ping = 0;
var ping_time = 0;

var scroll_timer = [];
scroll_timer['left'] = false;
scroll_timer['right'] = false;
scroll_timer['up'] = false;
scroll_timer['down'] = false;

var is_dlg_show = false;
var is_loading = true;

var canvas_left_position = 0;
var canvas_top_position = 0;
var canvas_width = window.innerWidth;
var canvas_height = window.innerHeight;

var loading_circle_sprite_id = -1

function setLoadingToCenter(){
    if(loading_circle_sprite_id > -1){
        var _loading_sprite = core.GetSprite(loading_circle_sprite_id);
        _loading_sprite.SetPosition((canvas_width*0.5)-(_loading_sprite.GetWidth()*0.5),(canvas_height*0.5)-(_loading_sprite.GetHeight()*0.5));
    }
};

window.addEventListener("load",function()
{
    "use strict";
    core = new Core('canvas');    
    map = new IsoMap(core,canvas_width,canvas_height);

    core.onScaleChanged = function(value){
        map.setScaleLevel(value);
    }

    map.useBounds = true;
    map.SetMinMaxMapPos(0,0,canvas_width,canvas_height);
    map.AddLevel();//1
    map.AddLevel();//2
    map.AddLevel();//3
    map.AddLevel();//4
    map.AddLevel();//5
    InitEvents();

    var img = new Image();
    img.onload = function(){
        loading_circle_sprite_id = core.AddAnimationSprite(this, 0,0,102,102,0,8,[0,8],0,100,true);
        setLoadingToCenter();
    }
    img.src = "Client/media/ui/LoadingCircle.png";

});


var mouse_move_x_tmp = 0;
var mouse_move_y_tmp = 0;

function StopScrolling(){
    clearInterval(scroll_timer['left']);
    scroll_timer['left'] = false;
    clearInterval(scroll_timer['right']);
    scroll_timer['right'] = false;
    clearInterval(scroll_timer['up']);
    scroll_timer['up'] = false;
    clearInterval(scroll_timer['down']);
    scroll_timer['down'] = false;
}
function InitEvents()
{
    map.Init();
    
    document.addEventListener('mouseleave',function(e){
        StopScrolling();
    }); 
    
    document.addEventListener('touchstart',function(e){
        touch.TouchStart(e);
        mouse_move_x_tmp = touch.touchX;
        mouse_move_y_tmp = touch.touchY;
    },false);
    document.onmousedown = function(e)
    {
        mouse.MouseDown(e);
        mouse_move_x_tmp = mouse.mouseX;
        mouse_move_y_tmp = mouse.mouseY;
    };
    document.addEventListener('touchend',function(e){
        touch.TouchEnd(e);
        if(mouse_move_x_tmp === touch.touchX && mouse_move_y_tmp === touch.touchY){
            if(touch.touchX-canvas_left_position >= 0 && touch.touchY-canvas_top_position >= 0){
                processMapClick(touch.touchX-canvas_left_position,touch.touchY-canvas_top_position);
            }
        }

    },false);
    
    document.onmouseup = function(e)
    {
        mouse.MouseUp(e);
        
        //if(mouse_move_x_tmp === mouse.mouseX && mouse_move_y_tmp === mouse.mouseY){
            if(mouse.mouseX-canvas_left_position >=0 && mouse.mouseY-canvas_top_position >= 0){
                if(e.button === 0){
                    processMapClick(mouse.mouseX-canvas_left_position,mouse.mouseY-canvas_top_position);
                }else if(e.button === 2){
                    processRightClick(mouse.mouseX-canvas_left_position,mouse.mouseY-canvas_top_position);
                }
            }
        //}
    };
    document.addEventListener('touchmove',function(e){
        if(is_dlg_show)return;

        touch.TouchMove(e);
        document.getElementById('debug').innerHTML = touch.touchX+'_'+touch.touchY;
    },false);
    document.onmousemove = function(e){
        if(is_dlg_show)return;
        
        var step = 10;
        if(mouse.mouseX < 20){
            if(scroll_timer['left'] === false){
                scroll_timer['left'] = setInterval(function(){
                    if(!map.isCheckMapBounds(step,"left"))map.m_iMapX+=step;
                },10);
            }
        }else{
            clearInterval(scroll_timer['left']);
            scroll_timer['left'] = false;
        }

        if(mouse.mouseX > canvas_width-20){
            if(scroll_timer['right'] === false){
                scroll_timer['right'] = setInterval(function(){
                    if(!map.isCheckMapBounds(step,"right"))map.m_iMapX-=step;
                },10);
            }
        }else{
            clearInterval(scroll_timer['right']);
            scroll_timer['right'] = false;
        }

        if(mouse.mouseY < 20){
            if(scroll_timer['up'] === false){
                scroll_timer['up'] = setInterval(function(){
                    if(!map.isCheckMapBounds(step,"up"))map.m_iMapY+=step;
                },10);
            }
        }else{
            clearInterval(scroll_timer['up']);
            scroll_timer['up'] = false;
        }

        if(mouse.mouseY > canvas_height-20){
            if(scroll_timer['down'] === false){
                scroll_timer['down'] = setInterval(function(){
                    if(!map.isCheckMapBounds(step,"down"))map.m_iMapY-=step;
                },10);
            }
        }else{
            clearInterval(scroll_timer['down']);
            scroll_timer['down'] = false;
        }

        mouse.MouseMove(e);
    };
    var target_fps = 10;
    setInterval(function() {MainLoop(1000/target_fps);},1000/target_fps);
    setInterval(function() {
        var fps = core.GetFps();
        document.getElementById('fps').innerHTML='fps: '+fps;
        var players_count = 0;
        for(var k in players){
            players_count++;
        }
        document.getElementById('ping').innerHTML='ping: '+ping+' players_count: '+players_count;
    },1000);

    InitCanvas('canvas');
    core.InitCanvasSize();

    map.ClearMap();
    map.AddLevel();//ground
    map.AddLevel();//buildings
    map.SetCurLevel(0);
};

var text_id = -1;
function MainLoop(time)
{
    "use strict";
    if(touch.isTouch() === true){
        if(touch.isTouched() === true){
            map.SetPrevMapPosition();
            map.AddToPrevMapPosition(touch.m_iFirstDragSizeX,touch.m_iFirstDragSizeY);
        }else{
            map.ClearPrevMapPosition();
        }
    }else{
        if(mouse.GetLeftMouse() === 1){
            //map.SetPrevMapPosition();
            //map.AddToPrevMapPosition(mouse.m_iFirstDragSizeX,mouse.m_iFirstDragSizeY);
        }else{
            //map.ClearPrevMapPosition();
        }
    }
    map.UpdateMapPosition();

    core.Clear();
    if (typeof characters != 'undefined'){
        characters.UpdatePosition();
    }

    if(is_loading){
        if(loading_circle_sprite_id > -1){
            var _loading_sprite = core.GetSprite(loading_circle_sprite_id);
            _loading_sprite.SetVisibility(true);
        }
    }else{
        core.GetSprite(loading_circle_sprite_id).SetVisibility(false);
        map.Draw();
        //game_level.DrawGrid();
        //game_level.m_pPathFinding.DrawPath(core.m_pCanvasContext2d,map.m_iMapX,map.m_iMapY);
        if(character.m_bInitialized){
            character.DrawShootDir();
        }
        for(var p in players){
            if(players[p].m_bInitialized){
                players[p].DrawShootDir();
            }
        }
    }
    core.Render(time);
}

window.onresize = function()
{
    "use strict";
    canvas_width = window.innerWidth;
    canvas_height = window.innerHeight;
    InitCanvas('canvas');
    core.InitCanvasSize();
};

function InitCanvas(id)
{
    "use strict";
    document.getElementById(id).style.margin = "0px";
    document.getElementById(id).width = canvas_width;
    document.getElementById(id).height = canvas_height;
    document.getElementById(id).style.width = "100%";
    document.getElementById(id).style.height = "100%";
    document.getElementById(id).style.left = canvas_left_position+'px';
    document.getElementById(id).style.top = canvas_top_position+'px';

    setLoadingToCenter();
}

function processRightClick(x,y){
    character.SetAttack('action',x - map.m_iMapX,y - map.m_iMapY);
}

function processMapClick(x,y){
    if(is_dlg_show)return;
    
    game_level.getCellByCoords(x,y);
    
    game_level.m_pPathFinding.ClearPath();
    game_level.m_pPathFinding.FindPath(character.m_iNextCellPosX,character.m_iNextCellPosY,
                                        game_level.m_iSelectedCellX,game_level.m_iSelectedCellY);
             
    character.SetNewPath(game_level.m_pPathFinding.path_array_x,game_level.m_pPathFinding.path_array_y);
}