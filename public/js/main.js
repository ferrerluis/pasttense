function urlify(text) {
    var urlRegex = /(https?:\/\/[^\s]+)/g;
    var imgRegex = /(https?:\/\/[^\s]+)\.(jpg|png|gif)/g;
    
    if (text.match(imgRegex)) {
        
        return text.replace(imgRegex, function(url) {
            return '<img src="' + url + '">';
        });
    }
    
    return text.replace(urlRegex, function(url) {
        return '<a href="' + url + '">' + url + '</a>';
    });
}

function setClickListener(selector) {
    
    selector.click(function(html) {
        var content = html.currentTarget.innerHTML;
        console.log(content);
        swal({
            html: content,
            customClass: 'expandable-modal',
            width: window.innerWidth * 0.85
        });
    });
}

function getAllMessages(callback){
	$.get("/start", callback);
}

$(function(){ //DOM Ready

    var socket = io();

    socket.on('new msg', function(msg) {
        
        var item = $('<li>').addClass('message-card').html(urlify(msg));
        
        gridster.add_widget(item, 1, 1, 1, 1);
        
        setClickListener(item);
    });
    
    var toolbarWidth = $('#toolbar').width();
    
    var widgetWidth = toolbarWidth/4 - 10;
    var maxCol = 4;
    
    if (toolbarWidth <= 460) {
        
        widgetWidth = toolbarWidth;
        maxCol = 1;
    }
    
    
    console.log(widgetWidth);

    widgetWidth -= parseInt($('.message-card').css('padding'))*2;

    var gridster = $(".gridster ul").gridster({
        widget_margins: [15, 15],
        widget_base_dimensions: [widgetWidth, 80]
    }).data('gridster');
    
    gridster.disable();
    
    $('#msg-field').keypress(function(event){
        if(event.keyCode == 13) {
            $("form").submit();
        }
    });

    $('form').submit(function() {
        if (!$("#msg-field").val().match(/^\s*$/)) {
            socket.emit('new msg', $('#msg-field').val());
            $('#msg-field').val('');
        }
        
        return false;
    });
    
    setClickListener($('.message-card'));
});