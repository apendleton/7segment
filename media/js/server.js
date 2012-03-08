$(function() {
    /* set up client stuff */
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

        $('#clients').off('submit', 'form').on('submit', 'form', function() {
            var number = $(this).find('input[type=text]').val();
            var channel = $(this).parents('.client').attr('data-client-id');
            socket.emit('changeNumber', JSON.stringify({'channel': channel, 'number': number}));
            $(this).find('input[type=text]').val('')
            return false;
        });

        $('#clients').off('click', '.swatch').on('click', '.swatch', function() {
            var color = $(this).attr('data-color');
            var channel = $(this).parents('.client').attr('data-client-id');
            socket.emit('changeColor', JSON.stringify({'channel': channel, 'color': color}));
        })
    })
});