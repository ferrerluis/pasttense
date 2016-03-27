var original_colors = [
    '#F79F79', 
    '#F7D08A', 
    '#E3F09B', 
    '#419D78',
    '#419D78', 
    '#4E598C',
    '#FF8C42',
    '#5B5941',
    '#70A9A1',
    '#C6878F'
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
            padding: remToPixel(1)
        });
    });
}

function getAllMessages(callback){
	$.get("/start", callback);
}

function addToGrid(gridster, msg, color) {
    var item = $('<li>').addClass('message-card').css('background-color', color).html(urlify(msg));
        
    gridster.add_widget(item, 1, 1);
    
    setClickListener(item);
}

function pickRandomColor(colors) {
    
    if (colors.length == 0) {
        colors = original_colors;
    }
    
    var index = Math.floor(Math.random() * colors.length);
    
    return colors.splice(index, 1);
}

function setupGridster() {
    var toolbarWidth = $('#toolbar').width();
    
    console.log(toolbarWidth);
    
    var widgetWidth = toolbarWidth/4 - 10;
    var maxCols = 4;
    
    console.log(window.innerWidth);
    
    if (window.innerWidth <= 460) {
        
        widgetWidth = toolbarWidth;
        maxCols = 1;
    }

    widgetWidth -= parseInt($('.message-card').css('padding'))*2;
    
    var gridster = $(".gridster ul").gridster({
        widget_margins: [15, 15],
        widget_base_dimensions: [widgetWidth, 80],
        max_cols: maxCols
    }).data('gridster');
    
    gridster.disable();
    
    return gridster;
}

// function fixateTime(timeElement) {
//     timeElement.
// }

$(function(){ //DOM Ready

    var colors = original_colors;
    var socket = io();
    
    var gridster = setupGridster();
    
    socket.on('new msg', function(msg) {
        
        addToGrid(gridster, msg, pickRandomColor(colors));
    });
    
    getAllMessages(function(msgs) {
        for (var msg in msgs) {
            addToGrid(gridster, msgs[msg], pickRandomColor(colors));
        }
    });
    
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