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

    /* remote handlers */
    var socket = io.connect("/servers");
    socket.on('connect', function() {
        socket.on('status', function(data) {
            var status = JSON.parse(data);
            $('#clients .client').each(function() {
                var $this = $(this);
                var channel = $this.attr('data-client-id');
                if (typeof status[channel] == "undefined") {
                    $this.remove();
                } else {
                    delete status[channel];
                }
            });
            _.each(status, function(info, channel) {
                $('#clients').append(_.template(
                    $('#client-tpl').html(),
                    {'id': channel}
                ));
            })
        })

        change = function(data) {
            socket.emit('change', JSON.stringify(data));
        }
    })
});