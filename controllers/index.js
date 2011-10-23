var http = require("http"),
    latlng = require("../libraries/latlng.js");

var deflection = 0.001;

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
    },
    test: function () {
        var self = this;
        var res = self.response;
        var gets = self.request.get;
        res.writeHeader(200, {'Content-Type':'text/plain'});
        res.end(gets.M);
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
        locations.findAndModify({"userId": userId}, [['_id','asc']], location, {upsert: true}, function (err) {
            if (err) {
                console.log(err.stack);
                res.end(err.toString());
            } else {
                console.log("saved location into db.");
                //查找数据库
                var condition = {
                                "coords.latitude": {
                                    $gt: (location.lat - deflection),
                                    $lt: location.lat + deflection
                                },
                                "coords.longitude": {
                                    $gt: location.lng - deflection,
                                    $lt: location.lng + deflection
                                }
                            };
                console.log(condition);
                locations.findItems(condition, function(err, object) {
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
