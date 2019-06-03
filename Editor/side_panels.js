function InitSpritesPanel(files_struct){
    var sprites_panel = document.getElementById("static_sprites_id");
    var ul = document.createElement('ul');
    ul.id = 'sprites_collapsible_id';
    ul.className = "collapsible";
    ul.setAttribute("data-collapsible","accordion");
    
    for(var d in files_struct){
        
        if(files_struct[d]['type'] === 'folder'){
            var li = document.createElement('li');
            var header = document.createElement('div');
            header.className = "collapsible-header";
            header.innerText = files_struct[d]['name'];
            li.appendChild(header);
            var body = document.createElement('div');
            body.className = "collapsible-body";
            body.style.maxWidth = "280px";
            body.style.maxHeight = "500px";
            body.style.overflowY = "scroll";
            
            
            
            var dir_name = files_struct[d]['name'];
            for(var f in files_struct[d]['children']){
                if(files_struct[d]['children'][f]['type'] === 'file'){
                    var _path = media_path+'sprites/'+dir_name+'/'+files_struct[d]['children'][f]['name'];
                    
                    var img = document.createElement('img');
                    img.setAttribute("src",_path);
                    img.style.border = "1px solid #f00";
                    (function(path,img,body){
                        img.onclick = function(){
                            if(brush_sprite_id === -1){
                                var _img = new Image();
                                _img.src = path;
                                _img.onload = function(){
                                    brush_sprite_id = core.AddStaticSprite(_img,0,0,_img.width,_img.height);
                                    
                                    brush_sprite_w = _img.width;
                                    brush_sprite_h = _img.height;
                                }.bind(_img);
                                
                                setStaticSpriteBrush();
                            }else{
                                var _img = new Image();
                                _img.src = path;
                                _img.onload = function(){
                                    core.SetStaticSpriteImgById(brush_sprite_id,_img);
                                    core.GetStaticSprite(brush_sprite_id).w = _img.width;
                                    core.GetStaticSprite(brush_sprite_id).h = _img.height;
                                    brush_sprite_w = _img.width;
                                    brush_sprite_h = _img.height;
                                    
                                    setStaticSpriteBrush();
                                }.bind(_img);
                            }
                        }
                        body.appendChild(img);
                    }(_path,img,body))
                    
                }
            }
            li.appendChild(body);
            ul.appendChild(li);
        }
    }
    
    sprites_panel.appendChild(ul);
    
    $('#sprites_collapsible_id').collapsible();
};

function InitAnimSpritesPanel(files_struct){
    var sprites_panel = document.getElementById("anim_sprites_id");
    var ul = document.createElement('ul');
    ul.id = 'anim_sprites_collapsible_id';
    ul.className = "collapsible";
    ul.setAttribute("data-collapsible","accordion");
    
    for(var d in files_struct){
        
        if(files_struct[d]['type'] === 'folder'){
            var li = document.createElement('li');
            var header = document.createElement('div');
            header.className = "collapsible-header";
            header.innerText = files_struct[d]['name'];
            li.appendChild(header);
            var body = document.createElement('div');
            body.className = "collapsible-body";
            body.style.maxWidth = "280px";
            body.style.maxHeight = "500px";
            body.style.overflowY = "scroll";
            
            
            var dir_name = files_struct[d]['name'];
            for(var f in files_struct[d]['children']){
                if(files_struct[d]['children'][f]['type'] === 'file'){
                    var _path = media_path+'animation_sprites/'+dir_name+'/'+files_struct[d]['children'][f]['name'];
                    var img = document.createElement('img');
                    img.setAttribute("src",_path);
                    (function(path,img,body){
                        img.onclick = function(){
                            if(brush_anim_sprite_id === -1){
                                var _img = new Image();
                                _img.src = path;
                                _img.onload = function(){
                                    //create animations
                                    var timeout = 100;
                                    
                                    var tmp_array = path.substr(0,path.length-4).split('_');
                                    var sprites_dim_array =  tmp_array[tmp_array.length-1].split('x');
                                    var frames_count = sprites_dim_array[0]*sprites_dim_array[1];
                                    
                                    brush_anim_sprite_id = core.AddAnimationSprite(
                                            _img,
                                            0,//x-offset_position_x+this.m_iQuaterCellWidth,
                                            0,//y-offset_position_y+this.m_iQuaterCellHeight,
                                            _img.width/sprites_dim_array[0],
                                            _img.height/sprites_dim_array[1],
                                            0,
                                            frames_count,
                                            [0,frames_count],
                                            0,
                                            timeout);
                                        
                                        core.GetSprite(brush_anim_sprite_id).SetLoopAnimation();
                                        core.GetSprite(brush_anim_sprite_id).RunAnimation();
                                        
                                        brush_anim_sprite_w = _img.width/sprites_dim_array[0];
                                        brush_anim_sprite_h = _img.height/sprites_dim_array[1];
                                        
                                        setAnimationSpriteBrush();
                                }.bind(_img);
                            }else{
                                var _img = new Image();
                                _img.src = path;
                                _img.onload = function(){
                                    
                                    var timeout = 100;
                                    
                                    var tmp_array = path.substr(0,path.length-4).split('_');
                                    var sprites_dim_array =  tmp_array[tmp_array.length-1].split('x');
                                    var frames_count = sprites_dim_array[0]*sprites_dim_array[1];
                                    
                                    core.SetAnimationSpriteImgById(brush_anim_sprite_id,_img,
                                    0,0,
                                    _img.width/sprites_dim_array[0],
                                    _img.height/sprites_dim_array[1],
                                    0,
                                    frames_count,
                                    [0,frames_count],
                                    0,
                                    timeout);
                                    
                                    brush_anim_sprite_w = _img.width/sprites_dim_array[0];
                                    brush_anim_sprite_h = _img.height/sprites_dim_array[1];
                                }.bind(_img);
                                
                                setAnimationSpriteBrush();
                            }
                        }
                        
                        body.appendChild(img);
                    }(_path,img,body))
                    
                }
            }
            li.appendChild(body);
            ul.appendChild(li);
        }
    }
    
    sprites_panel.appendChild(ul);
    
    $('#anim_sprites_collapsible_id').collapsible();
};