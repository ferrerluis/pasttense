function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    var imgRegex = /(https?:\/\/[^\s]+)\.(jpg|png|gif)/g;
    
    if (text.match(imgRegex)) {
        
        return text.replace(imgRegex, function(url) {
            return '<a href="' + url + '">' +
                        '<img src="' + url + '">' +
                '</a>';
        });
    }
    
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function getAllMessages(callback){
	$.get("/start", callback);
}	

$(function(){ //DOM Ready

    var gridster = $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    }).data('gridster');
    
    gridster.disable();

    var socket = io();
        
    $('#msg-field').keypress(function(event){
        if(event.keyCode == 13) {
            $("form").submit();
        }
    });

    $('form').submit(function() {
        socket.emit('new msg', $('#msg-field').val());
        $('#msg-field').val('');
        return false;
    });

    socket.on('new msg', function(msg) {
        
        var display = urlify(msg);
        
        gridster.add_widget('<li class="message-card">' + display + '</li>', 2, 1, 1, 1);
	});
});