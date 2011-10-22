//API
function centerMe(){
    // 初始化地图，设置中心点坐标和地图级别
    map.centerAndZoom(new BMap.Point(myPoint.lng, myPoint.lat), 17);
}
function markAll(){
    map.clearOverlays();
    for (var i = 0, len = points.length; i < len; i++) {
       markPoint(points[i]);                     // 将标注添加到地图中  
    }
    markPoint(myPoint);
}
function askAll(){
    sec++;
    if(window.myPoint){
        myPoint.lng += 0.0001;
        myPoint.lat += 0.0001;
        myAjax.add('M',myPoint);
    }
}
function getAll(a){
    //_ongetting = 0;
    showMsg(sec);
    points = [
        {type: "C", lng: myPoint.lng + 0.001*Math.random(), lat: myPoint.lat + 0.002*Math.random()},
        {type: "T", lng: myPoint.lng + 0.003*Math.random(), lat: myPoint.lat + 0.004*Math.random()}
    ]
    centerMe();
    markAll();
}
//_ongetting = 0;
sec = 0;
timer = setInterval(askAll, 2000);

//geo
function getPositionSuccess( position ){
    myPoint = {
        type: 'M',
        lng: position.coords.longitude,
        lat: position.coords.latitude
    }

    centerMe();
    markAll();
    
    //document.write( "您所在的位置： 经度" + lat + "，纬度" + lng );
}
function getPositionError(error){
    switch(error.code){
        case error.TIMEOUT :
            alert( " 连接超时，请重试 " );
            break;
        case error.PERMISSION_DENIED :
            alert( " 您拒绝了使用位置共享服务，查询已取消 " );
            break;
        case error.POSITION_UNAVAILABLE : 
            alert( " 非常抱歉，我们暂时无法为您所在的星球提供位置服务 " );
            break;
    }
}
function markPoint(point){
    var marker = new BMap.Marker(point, {icon: icon[point.type]});        // 创建标注  
    map.addOverlay(marker);  
}
var initMap = function () {
    geolocation = navigator.geolocation;
    if (geolocation) {
        map = new BMap.Map("map"); // 创建地图实例
        map.addControl(new BMap.NavigationControl()); 
        icon = {
            M: new BMap.Icon("assets/me.png"      , new BMap.Size( 74,  74)),
            C: new BMap.Icon("assets/customer.png", new BMap.Size( 89,  89)),
            T: new BMap.Icon("assets/texi.png"    , new BMap.Size(104, 104))
        };
        geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
        //geolocation.watchPosition(     getPositionSuccess, getPositionError);
        points = [];
    }
    else {
        alert("你的浏览器不支持geolocation哦~");
    }
};



// ajax
function Ajax(a){
    var _z = false; //xmlHTTP
    if(window.XMLHttpRequest){ // Mozilla, Safari,...
        _z = new XMLHttpRequest()
    }else if(window.ActiveXObject){ // IE
        try {
            _z = new ActiveXObject("Msxml2.XMLHTTP")
        } catch(e){
            try {
                _z = new ActiveXObject("Microsoft.XMLHTTP")
            } catch(e){}
        }
    }
    this.setRequest = function(url,fun,content,type){
        if(type!='post') type = "get";
        _z.open(type, type=='get' ? url+'?'+content : url, a==='syc' ? false : true);
        _z.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
        _z.onreadystatechange = function(){
            if(_z.readyState==4 && _z.status==200){
                fun(_z.responseText)
            }
        }
        _z.send(type=='get' ? 'NULL' : (content || 'NULL'))
    }
};
function myAj(a,b,c){// app, channel, ? Script : AJAX
    var _pool = {};
    var _state = {};
    var timer = 0;
    var _dir = '/index/';
    var btime = 0;

    var _app = _dir+a;    //calljs-无缓存；calljs2-有缓存，例如K，F10
    
    if(!c){    //calljs2采用Script，可以利用缓存减少请求，保留
        var _xmlhttp = new Ajax();
    }
    
    //公有
    this.add = function(a,b,c){
        _pool[a] = b||0;
        _state[a] = b||0;
        callAjax();
    };
    var callAjax = function(){
        // btime = getMS();
        var _gets = [];
        var out = {};
        var addJ = 0;

        for( var _key in _pool){
            _gets.push(_key + '=' + _pool[_key]);
        }
        _gets.push('R=' + Math.random());
        
        _pool = {};

        if(_gets.length>0){
            if(b!=2){ //
                //if(_ongetting){
                //    return;
                //}
                //_ongetting = 1;
            }

            if(!c){    // c ? Script : AJAX
                _xmlhttp.setRequest(_app, function(a){
                    getAll(a);
                }, _gets.join('&'), 'get');
            }
            else{        //Script
                var jsObj = this.id && $(this.id);
                if(jsObj){
                    var body = jsObj.parentNode;
                    body.removeChild(jsObj);
                    jsObj = null
                }else{
                    var body = document.body
                }
                var newJS = document.createElement('script');
                newJS.type = 'text/javascript';
                newJS.id = 'AJID_'+Math.round(Math.random()*100);
                this.id = newJS.id;
                newJS.src = _app + '?' + _gets.join('&');
                body.appendChild(newJS)
            }
        };
    }
}

myAjax = new myAj('test', 1);

function showMsg(a){
    document.title = a;
}
function $(a){
    return document.getElementById(a);
}
