var NUM_DIGITS = 5;
var POSITION = 'top';
var PADDING = .05;
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
    if (!ratio) {
        var rect = digits[0].get(0).getBoundingClientRect();
        ratio = rect.height / rect.width;
    }
    var calibrate = function() {
        var $window = $(window);
        var window_width = $window.width();
        var width = ((1 - (2 * PADDING)) * window_width) / digits.length;
        var height = width * ratio;

        _.each(digits, function(digit) {
            digit.attr('width', width);
            digit.attr('height', height);
        });

        clock.css({'top': POSITION == "top" ? (PADDING * window_width) + "px" : (($window.height() - height) / 2) + 'px', 'margin-left': (PADDING * window_width) + 'px'})
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
    setColors(COLORS[0]);

    var numerals = {
        ' ': ['', 'abcdefg'],
        '0': ['abcdef', 'g'],
        '1': ['bc', 'adefg'],
        '2': ['abdeg', 'cf'],
        '3': ['abcdg', 'ef'],
        '4': ['bcfg', 'ade'],
        '5': ['acdfg', 'be'],
        '6': ['acdefg', 'b'],
        '7': ['abc', 'defg'],
        '8': ['abcdefg', ''],
        '9': ['abcdfg', 'e']
    }

    var setState = function(parent, letters, state) {
        var opposites = {'off': 'on', 'on': 'off'};
        var classes = _.map(letters.split(''), function(s) { return '.' + s; }).join(',');
        if (classes.length > 1) {
            var d = d3.selectAll(parent.find(classes).get());
            d.classed(state, true);
            d.classed(opposites[state], false);
        }
    }

    var _setNumber = function(number) {
        var sn = number.toString();
        if (sn.length < NUM_DIGITS) {
            sn = Array(NUM_DIGITS - sn.length + 1).join(' ') + sn;
        } else if (sn.length > NUM_DIGITS) {
            sn = sn.substr(sn.length - NUM_DIGITS, NUM_DIGITS);
        }

        var n;
        for (var i = 0; i < NUM_DIGITS; i++) {
            n = sn.charAt(i);
            if (typeof numerals[n] == 'undefined') n = " ";
            setState(digits[i], numerals[n][0], 'on');
            setState(digits[i], numerals[n][1], 'off');
        }
    }

    var setNumber = function(number) {
        var sn = number.toString();
        var i = 1;
        var next = function() {
            var sub = sn.substr(0, i);
            _setNumber(sub);
            if (sub != sn) {
                i++;
                setTimeout(next, 200);
            }
        };
        next();
    }
    
    /* set up client stuff */
    var socket = io.connect("/clients");
    socket.on('connect', function() {
        socket.emit('subscribe', CLIENT_ID)
        socket.on('change', function(data) {
            var change = JSON.parse(data);
            if (change.property == 'number') {
                clock.removeClass('blink');
                setNumber(change.value);
            } else if (change.property == 'color') {
                clock.removeClass('blink');
                setColors(COLORS[change.value]);
            } else if (change.property == 'blink') {
                d3.selectAll(clock.get()).classed('blink', change.value);
            } else if (change.property == 'refresh') {
                document.location.reload();
            } else if (change.property == 'screen') {
                d3.selectAll('body').classed('fadeIn', change.value).classed('fadeOut', !change.value);
                // hack to avoid weird animation interactions
                if (change.value) {
                    setTimeout(function() {
                        d3.selectAll('body').classed('fadeIn', false);
                    }, 2500);
                }
            }
        });
    })
})