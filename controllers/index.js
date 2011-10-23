var http = require("http"),
    latlng = require("../libraries/latlng.js");
var deflection = 0.01;
var controller = exports.controller = {};
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
    // 如果数据中存在userId, 则表明用户切换回了watching状态，需要帮助清除掉db中的数据
    // 提交用户的地理位置，帮用户返回周围的等车的人和未载人的车
    watching: function () {
        var that = this,
            res = that.response,
            req = that.request;
        //生成collection对象
        var locations = req.db.collection("locations");
        var location = JSON.parse(req.post);
        if (location.userId) {
            locations.remove({userId: location.userId}, function () {
                console.log(arguments);
            });
        }
        //查询条件
        var condition = {
                "lat": {
                    $gt: (location.lat - deflection),
                    $lt: location.lat + deflection
                },
                "lng": {
                    $gt: location.lng - deflection,
                    $lt: location.lng + deflection
                }
            };
        locations.findItems(condition, function (err, object) {
            if (err) {
                console.log(err.stack);
                res.writeHeader(500, {'Content-Type':'text/plain', "Access-Control-Allow-Origin": "http://localhost"});
                res.end(err.stack);
            } else {
                res.writeHeader(200, {'Content-Type':'application/json', "Access-Control-Allow-Origin": "http://localhost"});
                res.end(JSON.stringify(object));
            }
        });
    },
    // 用户进入matching状态，会提交最新的地理位置
    matching: function () {
        var that = this,
            res = that.response,
            req = that.request;
        //生成collection对象
        var locations = req.db.collection("locations");
        var bookedUsers = req.db.collection("booked");
        var location = JSON.parse(req.post);
        if (location.userId) {
            locations.remove({userId: location.userId}, function () {
                console.log(arguments);
            });
        }
        
        //存储当前用户的信息到db中，以供被匹配
        locations.update({"userId": location.userId}, location, {upsert: true}, function (err) {
            if (err) {
                console.log(err.stack);
                res.end(err.stack);
            } else {
                console.log("saved location into db.");
            }
        });
        //查询条件
        var condition = {
                "lat": {
                    $gt: (location.lat - deflection),
                    $lt: location.lat + deflection
                },
                "lng": {
                    $gt: location.lng - deflection,
                    $lt: location.lng + deflection
                },
                "type": {
                    $ne: location.type
                }
            };
        console.log(condition);
        //查找数据库
        locations.findOne(condition, function(err, object) {
            console.log(arguments);
            if (err) {
                console.log(err.stack);
                res.writeHeader(500, {'Content-Type':'text/plain', "Access-Control-Allow-Origin": "*"});
                res.end(err.stack);
            } else {
                if (object) {
                    // 保存匹配到的两个用户到bookedUsers集合中，并从locations集合中移除掉
                    object.matched = location.userId;
                    bookedUsers.save(object);
                    location.matched = object.userId;
                    bookedUsers.save(location);
                    
                    //存储当前用户的信息到db中，以供被匹配
                    locations.remove({"userId": { $in: [location.userId, object.userId]}});
                }
                res.writeHeader(200, {'Content-Type':'application/json', "Access-Control-Allow-Origin": "http://localhost"});
                res.end(JSON.stringify(object));
            }
        });
    },
    booked: function () {
        //生成collection对象
        var bookedUsers = req.db.collection("booked");
        var location = JSON.parse(req.post);
        //存储当前用户的信息到db中，以供被匹配
        bookedUsers.findAndModify({"userId": location.userId}, [['_id','asc']], location, {upsert: true}, function (err, object) {
            if (err) {
                console.log(err.stack);
                res.end(err.stack);
            } else {
                console.log("update location into db.");
                //查找数据库
                //查询条件
                var condition = {"userId": { $in: [object.userId, object.matched]}};
                bookedUsers.findItems(condition, function(err, object) {
                    if (err) {
                        console.log(err.stack);
                        res.writeHeader(500, {'Content-Type':'text/plain', "Access-Control-Allow-Origin": "http://localhost"});
                        res.end(err.stack);
                    } else {
                        res.writeHeader(200, {'Content-Type':'application/json', "Access-Control-Allow-Origin": "*"});
                        res.end(JSON.stringify(object));
                    }
                });
            }
        });
    }
};
