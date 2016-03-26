var gridster = null;

$(function(){ //DOM Ready

    gridster = $(".gridster ul").gridster({
        widget_margins: [10, 10],
        widget_base_dimensions: [140, 140]
    }).data('gridster');
    
    gridster.disable();
});