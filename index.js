var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var orm = require('orm');

app.use(orm.express("sqlite://database.db", {
    define: function (db, models) {
        models.messages = db.define("messages", {
			"private": Boolean,
			"toNumber": Number,
			"fromNumber": Number,
			"likes": Number,
			"contentType": String,
			"content": String
		 });
    }
}));

app.use(express.static('public'));

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
});

app.get("/start", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	req.models.messages.find(function(err, messages) {
		res.send(JSON.stringify(messages));
	});
});

io.on('connection', function(socket){
    socket.on('new msg', function(msg){ 
		if(!msg.hasOwnProperty("private") 
		|| !msg.hasOwnProperty("toNumber") 
		|| !msg.hasOwnProperty("contentType") 
		|| !msg.hasOwnProperty("content")){
			// something went wrong
		}
		
		req.models.messages.create([{
			"private": msg.private,
			"toNumber": msg.private,
			"fromNumber": msg.private,
			"likes": 0,
			"contentType": msg.private,
			"content": msg.private,
		}], function(err, items) {
			// if(!err){
			// 	res.send(JSON.stringify(items));	
			// }else{
			// 	res.send(JSON.stringify(err));
			// }
		})
    });
});

// for testing
app.get("/create", function(req, res) {
	req.models.messages.create([{
		"private": 0,
		"toNumber": 7708810074,
		"fromNumber": 7708810074,
		"likes": 0,
		"contentType": "text",
		"content": "contents",
	}], function(err, items) {
		res.setHeader('Content-Type', 'application/json');
		if(!err){
			res.send(JSON.stringify(items));	
		}else{
			res.send(JSON.stringify(err));
		}
	})
});



http.listen(3000, function(){
	console.log("listening on 3000");
});