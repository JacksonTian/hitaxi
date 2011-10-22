var GaussSphere = exports.GaussSphere = {
        WGS84: 6378137.0,
        Xian80: 6378140.0,
        Beijing54: 6378245.0
    };

var rad = exports.rad = function (d) {
        return d * Math.PI / 180.0;
    };

exports.distance = function (lng1, lat1, lng2, lat2, gs) {
        gs = gs || GaussSphere.WGS84;
        var radLat1 = rad(lat1);
        var radLat2 = rad(lat2);
        var a = radLat1 - radLat2; 
        var b = rad(lng1) - rad(lng2);
        var s = 2 * Math.asin(Math.sqrt(Math.pow(Math.sin(a / 2), 2) + Math.cos(radLat1) * Math.cos(radLat2) * Math.pow(Math.sin(b / 2), 2))); 
        s = s * gs; 
        s = Math.round(s * 10000) / 10000; 
        return s;
    };
