var express = require("express");
var app = express();
var http = require("http").Server(app);
var io = require('socket.io')(http);
var orm = require('orm');

app.use(express.static('public'));

app.use(orm.express("sqlite://database.db", {
    define: function (db, models) {
        models.messages = db.define("messages", {
			"private": Boolean,
			"toNumber": Number,
			"fromNumber": Number,
			"likes": Number,
			"contentType": String,
			"content": String,
			"destinationTime": Number
		 });
    }
}));

io.on('connection', function(socket){
  console.log('a user connected');
});

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
	
	io.on('connection', function(socket){
		socket.on('new msg', function(msg){ 
			if(!msg.hasOwnProperty("private") 
			|| !msg.hasOwnProperty("toNumber") 
			|| !msg.hasOwnProperty("contentType") 
			|| !msg.hasOwnProperty("content")
			|| !msg.hasOwnProperty("time")) {
				// something went wrong
				socket.emit("message-create-fail", {"error": "missing a field"});
				return;
			}
			
			req.models.messages.create([{
				"private": msg.private,
				"toNumber": msg.toNumber,
				"fromNumber": msg.fromNumber || null,
				"likes": 0,
				"contentType": msg.contentType,
				"content": msg.content,
				"destinationTime": msg['time']
			}], function(err, items) {
				if(!err){
					socket.emit("message-create-success", items);	
				}else{
					socket.emit("message-create-fail", err);
				}
			})
		});
		
		socket.on("like", function(messageId){
			req.models.messages.find(messageId, function(err, message){
				message.likes += 1;
				message.save(function(err) {
					if(err){
						socket.emit("like-fail", err);
					}else{
						socket.emit("like-success", messageId);	
					}
				});
			});
		});
		
		socket.on("forward", function(data){
			if(!data.hasOwnProperty("messageId") || !data.hasOwnProprty("toNumber") || !data.hasOwnProperty("private") || !data.hasOwnProperty("time")){
				socket.emit("forward-fail", {"error": "missing fields"});
				return;
			}
			
			req.models.messages.find({"id": data.messageId}, 50, function(err, message){
				var message = message[0]; 
				req.models.messages.create([{
					"private": data.private,
					"toNumber": data.toNumber,
					"fromNumber": null,
					"likes": 0,
					"contentType": message.contentType,
					"content": message.content,
					"destinationTime": data['time']
				}], function(err, m){
					if(err){
						socket.emit("forward-fail", err);
					}else{
						socket.emit("forward-success", m);
					}
				});
			});
		});
	});
});

app.get("/start", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	req.models.messages.find(function(err, messages) {
		res.send(JSON.stringify(messages));
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
		"destinationTime":"123456789"
	}], function(err, items) {
		res.setHeader('Content-Type', 'application/json');
		if(!err){
			res.send(JSON.stringify(items));	
		}else{
			res.send(JSON.stringify(err));
		}
	})
});

app.listen(3000);
console.log("Starting on port 3000");