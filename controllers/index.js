var http = require("http");
var controller = {};
controller.get = {
    index: function () {
        var self = this;
        var cookie = self.request.cookie;
        var userIdKey = "userId";
        var userId = cookie.getCookie(userIdKey);
        if (!userId) {
            var now = new Date().getTime();
            var YEAR = 365 * 24 * 60 * 60 * 1000;
            cookie.setCookie(userIdKey, Math.random().toString(32).substring(2), {expires: new Date(now + YEAR).toGMTString()});
        }
        console.log(userId);
        this.render("index");
    }
};
controller.post = {
    geo: function () {
        var that = this,
            res = that.response;
            req = that.request;

        var cookie = that.request.cookie;
        var userIdKey = "userId";
        var userId = cookie.getCookie(userIdKey);

        //生成collection对象
        var locations = req.db.collection("locations");
        console.log("locations");

        var location = JSON.parse(req.post);
        location.userId = userId;
        //mongoDB存数据
        locations.save(location, {upsert: true}, function (err) {
            if (err) {
                console.log(err.stack);
                res.end(err.toString());
            } else {
                console.log("saved location into db.");
                //查找数据库
                locations.findItems({"userId" : userId}, function(err, object) {
                    if (err) {
                        console.log(err.stack);
                    } else {
                        res.writeHeader(200, {'Content-Type':'text/plain'});
                        res.end(JSON.stringify(object));
                    }
                });
            }
        });
        
    }
};
exports.controller = controller;
