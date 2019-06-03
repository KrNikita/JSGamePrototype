function SyncPost(url,data_obj,callback){
  $.ajax({
    type: "POST",
    async: false,
    dataType: "json",
    url:  url,
    data: data_obj,
    success: function(data){callback(data)}
  });
};

function SyncGet(url,callback){
  $.ajax({
    type: "GET",
    async: false,
    url:  url,
    success: function(data){callback(data)}
  });
};

function AsyncPost(url,data_obj,callback){
  $.ajax({
    type: "POST",
    async: true,
    dataType: "json",
    url:  url,
    data: data_obj,
    success: function(data){callback(data)}
  });
};

function AsyncGet(url,callback){
  $.ajax({
    type: "GET",
    async: true,
    url:  url,
    success: function(data){callback(data)}
  });
};