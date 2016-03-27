var CronJob = require('cron').CronJob;
var fs = require('fs');
var orm = require('orm');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

var accountSid = 'ACef4516da75e401c1417f2d0836738524';
var authToken = "8a9ad7fa67f7d9b0bbcf144377b2fed4";
var twilio = require('twilio')(accountSid, authToken);

new CronJob('*/5 * * * *', function() {
db.serialize(function() {
	db.each("SELECT id,fromNumber, toNumber,content, destinationTime, sent FROM messages", function(err, row) {
		fs.appendFile('message.txt', 'evaluating \n', function(err) { });
		if (parseInt(row.destinationTime) < Date.now() && !row.sent) {
			twilio.messages.create({
				to:'+1' + row.toNumber,
				from:'+14703090394',
				body:row.content + "\nSent through PastTense"
			}, function(error, message) {
				if (error) {
					fs.appendFile('message.txt', 'not sent text', function(err) { });
				} else {
					db.run("update messages set sent=1 where id =" + row.id);
					fs.appendFile('message.txt', 'sent text', function(err) { });
				}
			});
		}
		
		// if (parseInt(row.destinationTime) < (Date.now() - 500) && !row.sent) {
			
		// 	twilio.messages.create({
		// 		to:'+1' + row.fromNumber,
		// 		from:'+14703090394',
		// 		body:"Your message \""  + row.content + "\" will be sent to +1" + row.toNumber + " in 5 minutes!\nSent through PastTense" 
		// 	}, function(error, message) {
		// 		if (error) {
		// 			console.log(error);
		// 		}
		// 	});	
		// }
	});
});
	
}, null, true, 'America/New_York');