var NUM_DIGITS = 4;
$(function() {
    var clock = $("<div>").css({'white-space': 'nowrap', 'position': 'absolute'});
    $("body").css({'margin': 0, 'padding': 0}).append(clock);

    var digit_tpl = $('#7seg-tpl').html(),
        digits = [];
    for (var i = 0; i < NUM_DIGITS; i++) {
        var digit = $(digit_tpl);
        clock.append(digit);
        digits.push(digit);
    }

    var ratio = digits[0].height() / digits[0].width();
    var calibrate = function() {
        var $window = $(window);
        var width = $window.width() / digits.length;
        var height = width * ratio;

        _.each(digits, function(digit) {
            digit.attr('width', width);
            digit.attr('height', height);
        });

        clock.css({'top': (($window.height() - height) / 2) + 'px'})
    }
    calibrate();
    $(window).resize(calibrate);

    var setColors = function(colors) {
        var $head = $('head');
        var colorSheet = $head.find('#colors');
        if (colorSheet.length == 0) {
            var colorSheet = $("<style>");
            colorSheet.attr('id', 'colors');
            $head.append(colorSheet);
        }
        colorSheet.get(0).innerHTML = _.template(
            $('#7seg-style').html(),
            colors
        );
    }
    setColors({'on': '#0000ff', 'off': '#000066', 'bg': '#000099'});
})