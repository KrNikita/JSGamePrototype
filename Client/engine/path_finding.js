function PathFinding(map_size_x,map_size_y)
{
    this.fill_array = function(count){
        var ret = [];
        for(var i=0;i<count;i++){
            ret[i] = 0;
        }
        return ret;
    }
	this.MultiDimensionalArray = function(iRows,iCols) 
    {
    	var i;
    	var j;
    	var a = this.fill_array(iRows);
    	for (i=0; i < iRows; i++) 
    	{
    		a[i] = this.fill_array(iCols);
    		for (j=0; j < iCols; j++) 
    		{
    			a[i][j] = 0;
    		}
    	}
    	return(a);
    };

    this.mapsize_x = map_size_x;
	this.mapsize_y = map_size_y;
	var mapArray = this.MultiDimensionalArray(this.mapsize_x,this.mapsize_y);
	this.open_list_counter = 1; // Openlist_ID counter
	this.path_array_x = [];
	this.path_array_y = [];
	
	this.Init = function()
	{
		for (var x=0; x < this.mapsize_x; x++) 
		{
			for (var y=0; y < this.mapsize_y; y++) 
			{
				mapArray[x][y] = 0;
			}
		}
	};

    this.ClearBlocks = function(){
        for(var x = 0;x < this.mapsize_x;x++){
            for(var y = 0;y < this.mapsize_y;y++){
                mapArray[x][y] = false;
            }
        }
    }
	
	this.SetBlock = function(x,y,is_block)
	{
		if(x < this.mapsize_x && y < this.mapsize_y)mapArray[x][y] = is_block;
	};
	    
	this.GetPathBlocksCount = function()
	{
		return this.open_list_counter;
	};
	
	this.GetPathBlockX = function(pos)
	{
		if(pos < this.path_array_x.length)return this.path_array_x[pos];
	};
	
	this.GetPathBlockY = function(pos)
	{
		if(pos < this.path_array_y.length)return this.path_array_y[pos];
	};
	
	this.ClearPath = function()
	{
		while(this.path_array_x.length > 0)this.path_array_x.pop();
		while(this.path_array_y.length > 0)this.path_array_y.pop();
	};
	
	this.DrawPath = function(context,map_x,map_y)
	{
		for(var i =0;i<this.path_array_x.length;i++)
		{
                    DrawFillRect(context,this.path_array_x[i]*64+map_x,this.path_array_y[i]*32+map_y,64,32,'green',0.3);
		}
	};

    this.hex_accessible = function(x,y) 
    {
    	if(mapArray[x] == undefined) return false;
    	if(mapArray[x][y] == undefined) return false;
    	if(mapArray[x][y] == 1) return false;
    	return true;
    };

    this.hex_distance = function(x1,y1,x2,y2) 
    {
    	dx = Math.abs(x2-x1);
    	dy = Math.abs(y2-y1);
    	return Math.sqrt((dx*dx) + (dy*dy));
    };

    // A* Pathfinding with Manhatan Heuristics for Hexagons.
    this.FindPath = function(start_x, start_y, end_x, end_y) 
    {
    	// Check cases path is impossible from the start.
    	var error=0;
    	if(start_x == end_x && start_y == end_y) error=1;
    	if(!this.hex_accessible(start_x,start_y)) error=1;
    	if(!this.hex_accessible(end_x,end_y)) error=1;
    	if(error==1) 
    	{
    		//alert('Path is impossible to create.');
    		return false;
    	}
    	
    	// Init
    	var openlist = this.fill_array(this.mapsize_x*this.mapsize_y+2);
    	var openlist_x = this.fill_array(this.mapsize_x);
    	var openlist_y = this.fill_array(this.mapsize_y);
    	var statelist = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1); // current open or closed state
    	var openlist_g = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1);
    	var openlist_f = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1);
    	var openlist_h = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1);
    	var parent_x = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1);
    	var parent_y = this.MultiDimensionalArray(this.mapsize_x+1,this.mapsize_y+1);
    	var path = this.MultiDimensionalArray(this.mapsize_x*this.mapsize_y+2,2);

    	var select_x = 0;
    	var select_y = 0;
    	var node_x = 0;
    	var node_y = 0;
    	
    	this.open_list_counter = 1;
    	var selected_id = 0; // Actual Openlist ID
    	// Add start coordinates to openlist.
    	openlist[1] = true;
    	openlist_x[1] = start_x;
    	openlist_y[1] = start_y;
    	openlist_f[start_x][start_y] = 0;
    	openlist_h[start_x][start_y] = 0;
    	openlist_g[start_x][start_y] = 0;
    	statelist[start_x][start_y] = true; 
    	
    	// Try to find the path until the target coordinate is found
    	while (statelist[end_x][end_y] != true) 
    	{
    		set_first = true;
    		// Find lowest F in openlist
    		for (var i in openlist) 
    		{
    			if(openlist[i] == true)
    			{
    				select_x = openlist_x[i]; 
    				select_y = openlist_y[i]; 
    				if(set_first == true) 
    				{
    					lowest_found = openlist_f[select_x][select_y];
    					set_first = false;
    				}
    				if (openlist_f[select_x][select_y] <= lowest_found) 
    				{
    					lowest_found = openlist_f[select_x][select_y];
    					lowest_x = openlist_x[i];
    					lowest_y = openlist_y[i];
    					selected_id = i;
    				}
    			}
    		}
    		if(set_first==true) 
    		{
    			// open_list is empty
    			//alert('No possible route can be found.');
    			return false;
    		}
    	// add it lowest F as closed to the statelist and remove from openlist
    		statelist[lowest_x][lowest_y] = 2;
    		openlist[selected_id]= false;
    		// Add connected nodes to the openlist
    		for(i=1;i<7;i++) 
    		{
    			switch(i)// Run node update for 6 neighbouring tiles.
    			{
    				case 1:
    					node_x = lowest_x-1;
    					node_y = lowest_y;						
    				break;
    				case 2:
    					node_x = lowest_x;
    					node_y = lowest_y-1;						
    				break;
    			  case 3:
    					node_x = lowest_x+1;
    					node_y = lowest_y-1;						
    				break;
    				case 4:
    					node_x = lowest_x+1;
    					node_y = lowest_y;						
    				break;
    				case 5:
    					node_x = lowest_x;
    					node_y = lowest_y+1;
    				break;
    				case 6:
    					node_x = lowest_x-1;
    					node_y = lowest_y+1;
    				break;
    			}
    			if (this.hex_accessible([node_x],[node_y])) 
    			{
    				if(statelist[node_x][node_y] == true) 
    				{
    					if(openlist_g[node_x][node_y] < openlist_g[lowest_x][lowest_y]) 
    					{
    						parent_x[lowest_x][lowest_y] = node_x;
    						parent_y[lowest_x][lowest_y] = node_y;
    						openlist_g[lowest_x][lowest_y] = openlist_g[node_x][node_y] + 10;
    						openlist_f[lowest_x][lowest_y] = openlist_g[lowest_x][lowest_y] + openlist_h[lowest_x][lowest_y];
    					}
    				} 
    				else if (statelist[node_x][node_y] == 2) 
    				{
    					// its on closed list do nothing.
    				}
    				else 
    				{
    					this.open_list_counter++;
    					// add to open list
    					openlist[this.open_list_counter] = true;
    					openlist_x[this.open_list_counter] = node_x;
    					openlist_y[this.open_list_counter] = node_y;
    					statelist[node_x][node_y] = true;
    					// Set parent
    					parent_x[node_x][node_y] = lowest_x;
    					parent_y[node_x][node_y] = lowest_y;
    					// update H , G and F
    					var ydist = end_y - node_y;
    					if ( ydist < 0 ) ydist = ydist*-1;
    					var xdist = end_x - node_x;
    					if ( xdist < 0 ) xdist = xdist*-1;		
    					openlist_h[node_x][node_y] = this.hex_distance(node_x,node_y,end_x,end_y) * 10;
    					openlist_g[node_x][node_y] = openlist_g[lowest_x][lowest_y] + 10;
    					openlist_f[node_x][node_y] = openlist_g[node_x][node_y] + openlist_h[node_x][node_y];
    				}
    			}
    		}
    	}
    	
    	// Get Path
    	temp_x=end_x;
    	temp_y=end_y;
    	this.open_list_counter = 0;
    	while(temp_x != start_x || temp_y != start_y) 
    	{
    		this.open_list_counter++;
    		path[this.open_list_counter][1] = temp_x;
    		path[this.open_list_counter][2] = temp_y;
    		temp_x = parent_x[path[this.open_list_counter][1]][path[this.open_list_counter][2]];
    		temp_y = parent_y[path[this.open_list_counter][1]][path[this.open_list_counter][2]];
    	}
    	this.open_list_counter++;
    	path[this.open_list_counter][1] = start_x;
    	path[this.open_list_counter][2] = start_y;
    	
    	var tmp_list = 0;
    	// Draw path.
    	while(tmp_list<this.open_list_counter)
    	{
    		tmp_list++;

    		if(tmp_list < 2)
    		{
    			this.path_array_x.push(path[tmp_list][1]);
    			this.path_array_y.push(path[tmp_list][2]);
    		}
    		else
    		{
    			if(path[tmp_list][1] == path[tmp_list-1][1] &&
    					path[tmp_list][2] != path[tmp_list-1][2] &&
    					path[tmp_list-1][1] != path[tmp_list-2][1] &&
    					path[tmp_list-1][2] == path[tmp_list-2][2])
    			{
    				this.path_array_x.pop();
    				this.path_array_y.pop();
    				this.path_array_x.push(path[tmp_list][1]);
    				this.path_array_y.push(path[tmp_list][2]);
    			}
    			else
    			{
    				this.path_array_x.push(path[tmp_list][1]);
    				this.path_array_y.push(path[tmp_list][2]);
    			}
    		}
    	}
    	return true;
    };		
};