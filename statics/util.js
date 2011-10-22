/* 
 * hi taxi web应用
 * 司机与乘客之间的沟通的桥梁
 */

//设置地图容器的宽度与高度
function setContainerSize(){
    var offset=10;//定义偏移量
    
    //获取当前屏幕的宽度与高度
    var x = window.innerWidth;
    var y = window.innerHeight;
    var topHeight= document.getElementById("top").offsetHeight;
    //获取地图容器
    var container = document.getElementById("map");
    
    container.style.top    = offset + "px";               
    container.style.left   = offset + "px";               
    container.style.width  = x-offset-offset + "px";               
    container.style.height = y - topHeight-offset-offset +"px";
}

window.onload=function(){
    setContainerSize();
    initMap();
}