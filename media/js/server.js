$(function() {
    var change = function() {};

    /* local event handlers */
    $('#clients').on('submit', 'form', function() {
        var number = $(this).find('input[type=text]').val();
        var channel = $(this).parents('.client').attr('data-client-id');
        change({'channel': channel, 'property': 'number', 'value': number});
        $(this).find('input[type=text]').val('');
        return false;
    });

    $('#clients').on('click', '.swatch', function() {
        var color = $(this).attr('data-color');
        var channel = $(this).parents('.client').attr('data-client-id');
        change({'channel': channel, 'property': 'color', 'value': color});
    })

    $('#clients').on('click', '.blink-button', function() {
        var state = ($(this).attr('value') == 'on');
        var channel = $(this).parents('.client').attr('data-client-id');
        change({'channel': channel, 'property': 'blink', 'value': state});
    })
    
    $('#clients').on('click', '.screen-button', function() {
        var state = ($(this).attr('value') == 'on');
        var channel = $(this).parents('.client').attr('data-client-id');
        change({'channel': channel, 'property': 'screen', 'value': state});
    })
    
    $('#clients').on('click', '.refresh-button', function() {
        var channel = $(this).parents('.client').attr('data-client-id');
        change({'channel': channel, 'property': 'refresh', 'value': 1});
    })

    /* remote handlers */
    var socket = io.connect("/servers");
    socket.on('connect', function() {
        socket.on('status', function(data) {
            var status = JSON.parse(data);
            if (!$.isEmptyObject(status)) {
                status['*'] = 1;
            }

            $('#clients .client').hide();
            _.each(status, function(info, channel) {
                var existing = $('#clients .client[data-client-id="' + channel +'"]');
                if (existing.length) {
                    existing.appendTo($('#clients')).show();
                } else {
                    $('#clients').append(_.template(
                        $('#client-tpl').html(),
                        {'id': channel}
                    ));
                }
            })
            $('#clients .client:hidden').remove();
        })

        change = function(data) {
            socket.emit('change', JSON.stringify(data));
        }
    })
});