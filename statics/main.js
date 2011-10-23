//API
function centerMe(){
    // 初始化地图，设置中心点坐标和地图级别
    map.centerAndZoom(new BMap.Point(myPoint.lng, myPoint.lat), 17);
}
function panMe(){
    //map.centerAndZoom(new BMap.Point(myPoint.lng, myPoint.lat), 17);
    map.panBy(new BMap.Point(myPoint.lng, myPoint.lat));

}
function moving(lng, lat){
    sec++;
    if(window.myPoint){
        myPoint.lng += lng;
        myPoint.lat += lat;
        //myAjax.add('M','111');
        panMe();
    }
}

function changeType(a){
    if(myPoint){
        myPoint.type = a;
        changeStatus('matching');
    }
}
function changeStatus(a){
    status = a;
}
function watching () {
    changeStatus('watching');
    clearInterval(timer);
    timer = setInterval(callOtherDomain, 3000);
}
sec = 0;
timer = 0
status = 'watching';

//geo
function getPositionSuccess( position ){
    myPoint = {
        lng: position.coords.longitude,
        lat: position.coords.latitude,
//        type : 'M'
    }
    watching();
    centerMe();
    //markAll();
    
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
function markPoint(point, me){
    if(me){
        var z;
        if(point.type=='taxi'){
            if(status=='watching'){
                z = 'M';
            }else if(status=='matching'){
                z = 'T';
            }else if(status=='booked'){
                z = 'BT';
            }else{
                z = 'M';
            }   
        }else{
            if(status=='watching'){
                z = 'M';
            }else if(status=='matching'){
                z = 'C';
            }else if(status=='booked'){
                z = 'BC';
            }else{
                z = 'M';
            }    
        }
    }else{
        var z;
        if(point.type=='taxi'){
            if(status=='booked'){
                z = 'BT';
            }else{
                z = 'T';
            }
        }else{
            if(status=='booked'){
                z = 'BC';
            }else{
                z = 'C';
            }     
        }
    }
    var marker = new BMap.Marker(point, {icon: icon[z]});        // 创建标注 
    marker.setTitle(point.userId);
    map.addOverlay(marker);  
}
var initMap = function () {
    geolocation = navigator.geolocation;
    if (geolocation) {
        map = new BMap.Map("map"); // 创建地图实例
        map.addControl(new BMap.NavigationControl()); 
        icon = {
            M:  new BMap.Icon("assets/me.png"         , new BMap.Size( 33, 32)),
            C:  new BMap.Icon("assets/people_idle.png", new BMap.Size( 58, 78)),
            T:  new BMap.Icon("assets/taxi_idle.png"  , new BMap.Size( 58, 79)),
            MT: new BMap.Icon("assets/taxi_busy.png"  , new BMap.Size( 58, 79)),
            MC: new BMap.Icon("assets/people_busy.png", new BMap.Size( 58, 79)),
            BT: new BMap.Icon("assets/taxi_busy.png"  , new BMap.Size( 58, 79)),
            BC: new BMap.Icon("assets/people_busy.png", new BMap.Size( 58, 79)),
        };
        geolocation.getCurrentPosition(getPositionSuccess, getPositionError);
        //geolocation.watchPosition(     getPositionSuccess, getPositionError);
        points = [];
    }
    else {
        alert("你的浏览器不支持geolocation哦~");
    }
};


function showMsg(a){
    document.title = a;
}
function $(a){
    return document.getElementById(a);
}

var invocation = new XMLHttpRequest();
var url = 'http://hitaxi.cnodejs.net/index/';

function callOtherDomain(){
    if(invocation){    
        invocation.open('POST', url+status, true);
        myPoint.userId = $('id').value;         
        myPoint.username = '';     
        invocation.onreadystatechange = handler;
        invocation.send(JSON.stringify(myPoint)); 
    }
}
function handler(evtXHR){
    if (invocation.readyState == 4){
        if (invocation.status == 200){
            //[{"_id":"4ea38552117cc74927956768","lng":121.4255913,"lat":31.2441757,"userId":"t11","username":"1111","type":"taxi"}]
            
            var response = invocation.responseText;
            if(response != 'null'){
                result = JSON.parse(invocation.responseText || '{}');
                switch (status) {
                    case "watching":
                        peoples = result;
                        break;
                    case "matching":
                        if(result.matched){
                            changeStatus('booked');
                            peoples = [result.matched];
                        }else{
                            peoples = result.collection;
                        }
                        break;
                    case 'booked':
                        peoples = [result];
                        break;
                    case 'success':
                        clearInterval(timer);
                        peoples = [];
                        break;
                    default:
                        break;
                }

                //peoples = [
                //    { "lng" : 121.42700910000005, "lat" : 31.2456280, "type" : "taxi", "userId" : "fadfa", "username" : "Jackson Tian" },
                //    { "lng" : 121.42800910000005, "lat" : 31.2466280, "type" : "taxi", "userId" : "fadfadsfa", "username" : "Roger Huang" },
                //    { "lng" : 121.42500910000005, "lat" : 31.2476280, "type" : "customer", "userId" : "erewq", "username" : "Sam Shi" }
                //];

                map.clearOverlays();
                for (var i = 0, len = peoples.length; i < len; i++) {
                   markPoint(peoples[i]);                     // 将标注添加到地图中  
                }
            }
            markPoint(myPoint, 'M');


            //if (response) {
            //    getAll(JSON.parse(response));
            //}
        }
    }
}
function getAll(a){
    //_ongetting = 0;
    //showMsg(sec);
    //points = [
    //    {type: "C", lng: myPoint.lng + 0.001*Math.random(), lat: myPoint.lat + 0.002*Math.random()},
    //    {type: "T", lng: myPoint.lng + 0.003*Math.random(), lat: myPoint.lat + 0.004*Math.random()}
    //]
    //centerMe();
    //markAll();
    points = a;
    console.log(points);
    centerMe();
    markAll();
}