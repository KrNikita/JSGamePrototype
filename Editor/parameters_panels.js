/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */

function remove_selected(){
    if(selected_sprite_array === -1)return;
    var tile_type = selected_sprite_array[0];
    var group_id = selected_sprite_array[1];
    var tile_id = selected_sprite_array[2];
    selected_sprite_array = [];
    selected_sprite_array = -1;
    if(tile_type === 1){
        map.RemStaticTileByGroupIdAndId(group_id,tile_id);
    }else if(tile_type === 2){
        map.RemAnimTileByGroupIdAndId(group_id,tile_id);
    }else if(tile_type === 3){
        delete game_level.RemoveBlockByCellCoords(group_id,tile_id);
    }
}

function set_block_parameters(cover_height){
    if(selected_sprite_array === -1)return;
    var tile_type = selected_sprite_array[0];
    if(tile_type === 3){
        game_level.setBlockCoverHeightByKey(selected_sprite_array[1]+'_'+selected_sprite_array[2],cover_height);
    }
}


function set_static_sprites_parameters(visibility){
    if(selected_sprite_array === -1)return;
    
    var tile_type = selected_sprite_array[0];
    if(tile_type === 1){
        var group_id = selected_sprite_array[1];
        var tile_id = selected_sprite_array[2];
        map.GetTileByLevelIdAndId(group_id,tile_id).SetVisibility(visibility);
    }
}

function set_animation_sprites_parameters(visibility,loop,anim_id,timeout){
    if(selected_sprite_array === -1)return;
    
    var tile_type = selected_sprite_array[0];
    if(tile_type === 2){
        var group_id = selected_sprite_array[1];
        var tile_id = selected_sprite_array[2];
        map.GetAnimTileByLevelIdAndId(group_id,tile_id).SetVisibility(visibility);
        if(loop){
            map.GetAnimTileByLevelIdAndId(group_id,tile_id).SetLoopAnimation();
        }else{
            map.GetAnimTileByLevelIdAndId(group_id,tile_id).SetOneTimeAnimation();
        }
        map.GetAnimTileByLevelIdAndId(group_id,tile_id).SetAnimationId(anim_id);
        map.GetAnimTileByLevelIdAndId(group_id,tile_id).SetTimeout(timeout);
        map.GetAnimTileByLevelIdAndId(group_id,tile_id).RunAnimation();
    }
}

function toggle_block_parameters(show,block_obj){
    var div = document.getElementById('blocks_parameters_id');
    if(show){
        div.style.visibility = 'visible';
        div.style.height = 'auto';
        document.getElementById('select_cover_height_id').value = block_obj.getCoverHeight();
    }else{
        div.style.visibility = 'hidden';
        div.style.height = '0px';
    }
}


function toggle_static_sprite_parameters(show,sprite){
    var div = document.getElementById('static_sprites_parameters_id');
    if(show){
        div.style.visibility = 'visible';
        div.style.height = 'auto';
        document.getElementById('static_sprite_parameter_visibility_id').checked = sprite.GetVisibility();
    }else{
        div.style.visibility = 'hidden';
        div.style.height = '0px';
    }
}
function toggle_animation_sprite_parameters(show,sprite){
    var div = document.getElementById('animation_sprites_parameters_id');
    if(show){
        div.style.visibility = 'visible';
        div.style.height = 'auto';
        document.getElementById('animation_sprite_parameter_visibility_id').checked = sprite.GetVisibility();
        document.getElementById('animation_sprite_parameter_loop_id').checked = sprite.GetAnimationType() === 0?true:false;

        document.getElementById('animation_sprite_parameter_anim_num_id').min = 0;
        document.getElementById('animation_sprite_parameter_anim_num_id').max = sprite.GetAnimationsCount()-2;
        document.getElementById('animation_sprite_parameter_anim_num_id').value = sprite.GetAnimationId();
        document.getElementById('animation_sprite_parameter_anim_timeout_id').value = sprite.GetTimeout();
    }else{
        div.style.visibility = 'hidden';
        div.style.height = '0px';
    }
}