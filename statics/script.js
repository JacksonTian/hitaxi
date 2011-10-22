$(document).ready(function () {
    navigator.geolocation.getCurrentPosition(function (position) {
        $.post("/index/geo", JSON.stringify(position), function (data) {
            alert("地理位置上传成功！");
        });
        console.log(position);
    }, function () {
        console.log(arguments);
    }, {
        enableHighAccuracy: true
    });
});
