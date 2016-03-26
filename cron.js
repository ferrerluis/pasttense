var CronJob = require('cron').CronJob;
var fs = require('fs');
var orm = require('orm');
var sqlite3 = require('sqlite3').verbose();
var db = new sqlite3.Database('database.db');

var accountSid = 'ACef4516da75e401c1417f2d0836738524';
var authToken = "8a9ad7fa67f7d9b0bbcf144377b2fed4";
var twilio = require('twilio')(accountSid, authToken);

new CronJob('* 5 * * * *', function() {
db.serialize(function() {
	db.each("SELECT toNumber,content, destinationTime FROM messages", function(err, row) {
		if(paraseInt(row.destinationTime) === Date.now()){
			// fs.appendFile('my_file.txt', 'data to append');
			twilio.messages.create({
				to:'+1' + row.toNumber,
				from:'+14703090394',
				body:row.content
			}, function(error, message) {
				if (error) {
					console.log(error);
				}
			});
		}
	});
});
	
db.close();
}, null, true, 'America/New_York');