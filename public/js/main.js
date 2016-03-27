var original_colors = [
    '#F79F79', 
    '#FFF272', 
    '#73EEDC', 
    '#3CF2AC', 
    '#A57FFF',
    '#90E0F3',
    '#FF82A9'
];

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

function remToPixel(length) {
 
    var rem = function rem() {
        var html = document.getElementsByTagName('html')[0];

        return function () {
            return parseInt(window.getComputedStyle(html)['fontSize']);
        }
    }();
 
    return length * rem();
}

function setClickListener(selector) {
    
    selector.click(function(html) {
        var content = html.currentTarget.innerHTML;
        console.log(content);
        swal({
            html: content,
            customClass: 'expandable-modal',
            width: window.innerWidth < 460 ? window.innerWidth * 0.85 : null,
            padding: remToPixel(1),
            confirmButtonText: 'Okie'
        });
    });
}

function getAllMessages(callback){
	$.get("/start", callback);
}

function switchWidgets(gridster, shift) {
    console.log(gridster);
    
    console.log(gridster.serialize());
}

// function shiftGrid(gridster, shift) {
//     console.log(gridster);
//     // for (var widget in gridster.$widgets) {
        
//     //     widget
//     // }
// }

function addToGrid(gridster, msg, color) {
	if (msg.length === 1) {
		var msg = msg[0].content;
	}
	
    var item = $('<li>').addClass('message-card').css('background-color', color).html(urlify(msg));
        
    gridster.add_widget(item, 1, 1, 1, 1);
    
    setClickListener(item);
}

function pickRandomColor(colors) {
    
    if (colors.length == 0) {
        colors = replenishColors();
    }
    
    var index = Math.floor(Math.random() * colors.length);
    
    return colors.splice(index, 1);
}

function setupGridster() {
    var toolbarWidth = $('#toolbar').width();
        
    var widgetWidth = toolbarWidth/4 - 10;
    var maxCols = 4;
        
    if (window.innerWidth <= 460) {
        
        widgetWidth = toolbarWidth;
        maxCols = 1;
    }

    widgetWidth -= 16;
    
    var gridster = $(".gridster ul").gridster({
        widget_margins: [15, 15],
        widget_base_dimensions: [widgetWidth, 80],
        max_cols: maxCols
    }).data('gridster');
    
    gridster.disable();
    
    return gridster;
}

function setEnableToListener() {
    var button = $('#enable_to');
    
    button.click(function() {
               
        var from = $('.from');

        if (from.css('visibility') === 'hidden') {
            
            from.css('visibility', 'visible');
            button.css('background-color', '#000');
            button.css('color', '#FFF');
        } else {
            
            from.css('visibility', 'hidden');
            button.css('background-color', '#FFF');
            button.css('color', '#000');
        }
    });
}

function setPrivateListener(isPrivate) {
    var button = $('#private');
    button.attr('checked', false);            
        console.log(button.is(":checked"));

    button.click(function() {
        
        if (button.is(":checked")) {
            
            button.attr('checked', false);            
            button.css('background-color', '#000');
            button.css('color', '#FFF');
        } else {
            
            button.attr('checked', true);
            button.css('background-color', '#FFF')
            button.css('color', '#000')
        }
    });
}

function setDatetimeToToday(datetime) {
    var now = new Date(Date.now());
    var min = now.getMinutes();
    now.setMinutes(5 - min%5 + min);
    datetime.val(now);
}

function replenishColors() {
    var colors = [];
    for (var i = 0; i < original_colors.length; i++) {
        
        colors.push(original_colors[i]);
    }
    return colors;
}

$(function(){ //DOM Ready

    setDatetimeToToday($('#time'));
	setEnableToListener();
    setPrivateListener();

    var colors = replenishColors();
    
    var socket = io();
    
    var gridster = setupGridster();
    // shiftGrid(gridster.$widgets);
    
    getAllMessages(function(msgs) {
        
        for (var i = 0; i < msgs.length; i++) {
            addToGrid(gridster, msgs[i], pickRandomColor(colors));
        }
    });
    
    $('#msg-field').keypress(function(event){
        if(event.keyCode == 13) {
            $("form").submit();
        }
    });

    $('form').submit(function(e) {
		e.preventDefault();        
        
        if (!$("#msg-field").val().match(/^\s*$/)) {
            
            var data = {
                "private": $("#private").is(":checked"),
                "toNumber": $("#to-phone").val(),
                "fromNumber": $("#from-phone").val() || null,
                "contentType": "text",
                "content": $("#msg-field").val(),
                "time": new Date($('#time').val()).getTime() / 1000
            };
            
            socket.emit('new msg', data);
        }
        
        // switchWidgets(gridster);
        
        return false;
    });
        
    socket.on('message-create-success', function(msg) {
        
        console.log(msg);
        addToGrid(gridster, msg, pickRandomColor(colors));
        
        swal({
            title: 'Done',
            text: "See you in the future!",
            type: 'success',
            confirmButtonText: 'Okie'
        });
        
        $('#private').attr('checked', false);
        $('#msg-field').val('');
        $("#to-phone").val('');
        $("#from-phone").val('');
        $('#send-time').val('');
    });
    
    socket.on('message-create-fail', function(msg) {
       swal({
            title: 'Oops!',
            text: "There was an error. Please try again later!",
            type: 'error',
            confirmButtonText: 'Okie'
       }); 
    });
    
	socket.on("like-fail", function(error){
		// do error stuff
	});
	
	socket.on("like-success", function(messageId){
		// update the UI
	});
	
	socket.on("forward-success", function(msg){
		// Update UI
	});
	
	socket.on("forward-fail", function(err){
		// error
	})
});