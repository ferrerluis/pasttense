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
			"destinationTime": Number,
			"sent": Boolean
		 }, {
			 methods: {
				 "get": function(){
					 return this.content;
				 }
			 }
		 });
    }
}));

io.on('connection', function(socket){
  console.log('a user connected');
});

app.get("/", function(req, res){
	res.sendFile(__dirname + "/index.html");
	
	io.on('connection', function(socket){
		socket.on('new msg', function(msg) {
			console.log(msg);
			if( !msg["toNumber"] 
			|| !msg["contentType"] 
			|| !msg["content"]
			|| !msg["time"]){
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
				if (!err) {
					if (!msg.private) {
						io.emit("message-create-success", items);
					}
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
						io.emit("like-success", messageId);	
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
						socket.emit("forward-success", m.content);
					}
				});
			});
		});
	});
});

app.get("/start", function(req, res) {
	res.setHeader('Content-Type', 'application/json');
	req.models.messages.find(null, 50, function(err, messages) {
		var m = [];
		for(var i = 0; i < messages.length; i++){
			m.push(messages[i].content);
		}
		
		res.send(JSON.stringify(m));
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

http.listen(3000, function(){
  console.log('listening on *:3000');
});
