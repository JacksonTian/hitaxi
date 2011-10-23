jQuery(document).ready(function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        position.status = "waiting";
        position.type = "customer";
        position.username = "Sam Shi";
        jQuery.post("/index/matching", JSON.stringify(position), function (data) {
            alert("地理位置上传成功！");
        });
        console.log(position);
    }, function () {
        console.log(arguments);
    }, {
        enableHighAccuracy: true
    });
});
