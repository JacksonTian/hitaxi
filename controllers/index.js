var http = require("http");
var controller = {};
controller.get = {
    index: function () {
        this.render("index");
    }
};
controller.post = {
    geo: function () {
        var that = this,
            res = that.response;
            req = that.request;
        console.log(req.post);
        res.writeHeader(200, {'Content-Type':'text/plain'});
        res.end();
    }
};
exports.controller = controller;