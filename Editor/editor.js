var map;
var core;
var sprite_manager = new SpriteManager();
var mouse = new Mouse(0,50);
var touch = new Touch();
var game_level = new CGameLevel();

var layers_num = 0;
var layers_names = {};
var layers_visibility = {};

var snap_grid_check = false;
var snap_tile_check = false;

var static_sprite_brush_selected = false;
var brush_sprite_w = 1;
var brush_sprite_h = 1;
var brush_sprite_id = -1;

var anim_sprite_brush_selected = false;
var brush_anim_sprite_w = 1;
var brush_anim_sprite_h = 1;
var brush_anim_sprite_id = -1;

var block_brush_selected = false;
var selected_cover_height = 0;

var selected_sprite_array = [];

var is_dlg_show = false;


var canvas_left_position = 0;
var canvas_top_position = 50;
var canvas_width = window.innerWidth - 300;
var canvas_height = window.innerHeight - 50;



function set_block_brush(){
    block_brush_selected = true;
    selected_cover_height = 0;
}

function set_cover_brush(height){
    block_brush_selected = true;
    selected_cover_height = height;
}



function add_layer(name){
    layers_num++;
    var _name = name;
    if(_name === ''){
        _name = 'Layer '+layers_num;
    }
    var option = document.createElement("option");
    option.value = layers_num-1;
    option.innerHTML = _name;
    document.getElementById('layers_select_id').appendChild(option);
    document.getElementById('layers_select_id').value = layers_num-1;
    layers_names[layers_num-1] = _name;
    game_level.AddLayer();
    game_level.SetCurrentLayer(layers_num-1);
    layers_visibility[layers_num-1] = true;
};

function editor_save(){
    //alert(JSON.stringify(data));
    var data = game_level.getLevelJSONData(layers_num,layers_names,layers_visibility);
    socket.emit("save_level",data);
    alert('Saved!');
}

function load_level(data,callback){
    //alert(JSON.stringify(data));
    callback();
    layers_num = 0;
    layers_names = {};
    layers_visibility = {};
    
    for(var i=0;i<data.layers.length;i++){
        add_layer(data.layers[i].name);
        layers_visibility[i] = data.layers[i].visibility;
    }
    game_level.load(data,function(){});
    
}


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
    InitEvents();

});


var mouse_move_x_tmp = 0;
var mouse_move_y_tmp = 0;


function InitEvents()
{
    map.Init();
    
    document.addEventListener('mouseleave',function(e){
        
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
        
        if(mouse_move_x_tmp === mouse.mouseX && mouse_move_y_tmp === mouse.mouseY){
            if(mouse.mouseX >=0 && mouse.mouseY >= 0){
                if(e.button === 0){
                    processMapClick(mouse.mouseX,mouse.mouseY);
                }else if(e.button === 2){
                    processRightClick(mouse.mouseX,mouse.mouseY);
                }
            }
        }
    };
    document.addEventListener('touchmove',function(e){
        if(is_dlg_show)return;

        touch.TouchMove(e);
        document.getElementById('debug').innerHTML = touch.touchX+'_'+touch.touchY;
    },false);
    document.onmousemove = function(e){
        if(is_dlg_show)return;
        mouse.MouseMove(e);
        if(snap_grid_check){
            var posx = (Math.ceil(((mouse.mouseX)*core.m_iScaleLevel)/(game_level.m_iCellWidth*0.5))-2)*(game_level.m_iCellWidth*0.5);
            var posy = (Math.ceil(((mouse.mouseY)*core.m_iScaleLevel)/(game_level.m_iCellHeight*0.5))-2)*(game_level.m_iCellHeight*0.5);	   
            if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetPosition(posx,posy);
            if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetPosition(posx,posy);
        }else if(snap_tile_check){
            var posx = (Math.ceil(((mouse.mouseX)*core.m_iScaleLevel)/(brush_sprite_w*0.5))-2)*(brush_sprite_w*0.5);
            var posy = (Math.ceil(((mouse.mouseY)*core.m_iScaleLevel)/(brush_sprite_h*0.5))-2)*(brush_sprite_h*0.5);	   
            if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetPosition(posx,posy);
            if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetPosition(posx,posy);
        }else{
            if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetPosition(mouse.mouseX,mouse.mouseY);
            if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetPosition(mouse.mouseX,mouse.mouseY);
        }
    };
    var target_fps = 10;
    setInterval(function() {MainLoop(1000/target_fps);},1000/target_fps);
    setInterval(function() {
        var fps = core.GetFps();
        document.getElementById('fps').innerHTML='fps: '+fps;
        
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
            map.SetPrevMapPosition();
            map.AddToPrevMapPosition(mouse.m_iFirstDragSizeX,mouse.m_iFirstDragSizeY);
        }else{
            map.ClearPrevMapPosition();
        }
    }
    map.UpdateMapPosition();
    map.m_iSnapFlag = snap_grid_check?1:0;

    core.Clear();
    
    map.Draw();
    game_level.DrawGrid();
    game_level.DrawBlocks();

    core.Render(time);
    if(selected_sprite_array !== -1 && selected_sprite_array.length > 0){
        var tile_type = selected_sprite_array[0];
        var group_id = selected_sprite_array[1];
        var tile_id = selected_sprite_array[2];
        if(tile_type === 1){
            DrawRect(core.m_pCanvasContext2d,
                map.GetTileByLevelIdAndId(group_id,tile_id).x + map.m_iMapX,
                map.GetTileByLevelIdAndId(group_id,tile_id).y + map.m_iMapY,
                map.GetTileByLevelIdAndId(group_id,tile_id).w,
                map.GetTileByLevelIdAndId(group_id,tile_id).h,
                '#f00');
        }else if(tile_type === 2){
            DrawRect(core.m_pCanvasContext2d,
                map.GetAnimTileByLevelIdAndId(group_id,tile_id).x + map.m_iMapX,
                map.GetAnimTileByLevelIdAndId(group_id,tile_id).y + map.m_iMapY,
                map.GetAnimTileByLevelIdAndId(group_id,tile_id).w,
                map.GetAnimTileByLevelIdAndId(group_id,tile_id).h,
                '#f00');
        }else if(tile_type === 3){
            //Selected tile_type 3 is selected block, so in this case group_id is X cell coord by x axis and tile_id is Y cell coord by y axis
            DrawRect(core.m_pCanvasContext2d,
                group_id * DEFAULT_CELL_WIDTH + map.m_iMapX,
                tile_id * DEFAULT_CELL_HEIGHT + map.m_iMapY,
                DEFAULT_CELL_WIDTH,
                DEFAULT_CELL_HEIGHT,
                '#f00');
        }
    }
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
    document.getElementById(id).style.left = canvas_left_position+'px';
    document.getElementById(id).style.top = canvas_top_position+'px';

    document.getElementById('side_panel_id').style.margin = "0px";
    document.getElementById('side_panel_id').style.width = 300+"px";
    document.getElementById('side_panel_id').style.height = canvas_height;
    document.getElementById('side_panel_id').style.left = (canvas_left_position+canvas_width)+'px';
    document.getElementById('side_panel_id').style.top = '0px';
}

function processRightClick(x,y){
    if(isStaticSpriteBrushSelected() || isAnimationSpriteBrushSelected()){
        if(brush_sprite_id >= 0 || brush_anim_sprite_id >= 0){
            if(snap_grid_check === true){
                var posx = (Math.ceil(((mouse.mouseX)*core.m_iScaleLevel)/(game_level.m_iCellWidth*0.5))-2)*(game_level.m_iCellWidth*0.5);
                var posy = (Math.ceil(((mouse.mouseY)*core.m_iScaleLevel)/(game_level.m_iCellHeight*0.5))-2)*(game_level.m_iCellHeight*0.5);	   

                if(brush_sprite_id >= 0 && isStaticSpriteBrushSelected())map.AddTileById(brush_sprite_id,posx-map.m_iMapX,posy-map.m_iMapY);
                if(brush_anim_sprite_id >= 0 && isAnimationSpriteBrushSelected())map.AddAnimTileById(brush_anim_sprite_id,posx-map.m_iMapX,posy-map.m_iMapY);
            }else if(snap_tile_check === true){
                var posx = (Math.ceil(((mouse.mouseX)*core.m_iScaleLevel)/(brush_sprite_w*0.5))-2)*(brush_sprite_w*0.5);
                var posy = (Math.ceil(((mouse.mouseY)*core.m_iScaleLevel)/(brush_sprite_h*0.5))-2)*(brush_sprite_h*0.5);	   

                if(brush_sprite_id >= 0 && isStaticSpriteBrushSelected())map.AddTileById(brush_sprite_id,posx-map.m_iMapX,posy-map.m_iMapY);
                if(brush_anim_sprite_id >= 0 && isAnimationSpriteBrushSelected())map.AddAnimTileById(brush_anim_sprite_id,posx-map.m_iMapX,posy-map.m_iMapY);
            }else{
                if(brush_sprite_id >= 0 && isStaticSpriteBrushSelected())map.AddTileById(brush_sprite_id,mouse.mouseX-map.m_iMapX,mouse.mouseY-map.m_iMapY);
                if(brush_anim_sprite_id >= 0 && isAnimationSpriteBrushSelected())map.AddAnimTileById(brush_anim_sprite_id,mouse.mouseX-map.m_iMapX,mouse.mouseY-map.m_iMapY);
            }
        }
    }else if(block_brush_selected === true){
        game_level.AddBlockByCoords(x-map.m_iMapX,y-map.m_iMapY,selected_cover_height);
    }
}

function processMapClick(x,y){
    if(is_dlg_show)return;
    if(x <= canvas_left_position || y <= canvas_top_position ||
       x >= canvas_left_position + canvas_width || y >= canvas_top_position + canvas_height)return;
    
    game_level.getCellByCoords(x,y);
    selected_sprite_array = map.SelectSpriteByCoords(x-map.m_iMapX,y-map.m_iMapY);
    
    if(selected_sprite_array !== -1){
        var group_id = selected_sprite_array[1];
        var tile_id = selected_sprite_array[2];
        if(selected_sprite_array[0] == 1){    
            toggle_block_parameters(false,null);
            toggle_static_sprite_parameters(true,map.GetTileByLevelIdAndId(group_id,tile_id));
            toggle_animation_sprite_parameters(false,null);
        }else if(selected_sprite_array[0] == 2){
            toggle_block_parameters(false,null);
            toggle_static_sprite_parameters(false,null);
            toggle_animation_sprite_parameters(true,map.GetAnimTileByLevelIdAndId(group_id,tile_id));
        }
    }
    else{ // Try Select block
        //get selected cell by absolute coords
        game_level.getCellByCoords(x,y);
        var cell_x = parseInt(game_level.m_iSelectedCellX);
        var cell_y = parseInt(game_level.m_iSelectedCellY);
        for(var key in game_level.getBlocks()){
            var block_obj = game_level.getBlockByKey(key);
            
            if (block_obj.getCellX() === cell_x &&
                block_obj.getCellY() === cell_y){
                
                selected_sprite_array = [];
                selected_sprite_array[0] = 3;
                selected_sprite_array[1] = cell_x;
                selected_sprite_array[2] = cell_y;
                
                toggle_block_parameters(true,block_obj);
                toggle_static_sprite_parameters(false,null);
                toggle_animation_sprite_parameters(false,null);
                
                break;
            }
        }
    }
    
}

function isStaticSpriteBrushSelected(){
    return static_sprite_brush_selected;
}

function isAnimationSpriteBrushSelected(){
    return anim_sprite_brush_selected;
}

function setStaticSpriteBrush(){
    static_sprite_brush_selected = true;
    anim_sprite_brush_selected = false;
    block_brush_selected = false;
    
    if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetVisibility(true);
    if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetVisibility(false);
}
function setAnimationSpriteBrush(){
    static_sprite_brush_selected = false;
    anim_sprite_brush_selected = true;
    block_brush_selected = false;
    
    if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetVisibility(false);
    if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetVisibility(true);
}

function hideBrushes(){
    static_sprite_brush_selected = false;
    anim_sprite_brush_selected = false;
    block_brush_selected = false;
    if(brush_sprite_id >= 0)core.GetSprite(brush_sprite_id).SetVisibility(false);
    if(brush_anim_sprite_id >= 0)core.GetSprite(brush_anim_sprite_id).SetVisibility(false);
}