
function remove() {
    $('.giveaway__row-outer-wrap').each(function () {
        if ($('.giveaway__column--contributor-level', this).hasClass('giveaway__column--contributor-level--negative')) {
            this.remove();
        } else if ($('.giveaway__row-inner-wrap', this).hasClass('is-faded')) {
            this.remove();
        } else {
            var a = this;
            $('.giveaway__heading__thin', this).each(function() {
                if (parseInt($(this).text().match(/\d+(?=P)/)) > pq.point.get()) {
                    a.remove();
                }
            });
        }
    });
}
function openlink() {
    var a = $('.giveaway__row-outer-wrap')[0];
    if (a) {
        var b = {
            xsrf_token: $('input[name=xsrf_token]').val(),
            do:           'entry_insert',
            code:       $('.giveaway__heading__name', a).attr('href').match(/\w+(?=\/[\w\-]+$)/)[0]
        };
        $.post('/ajax.php', b, function(c) {
            c = jQuery.parseJSON(c);
            if (c.type == 'success') {
                pq.point.set(c.points);
                remove();
            }
            if (c.type == 'error') {
                if (c.msg == 'Missing Base Game') {
                    $('.giveaway__icon', a).each(function() {
                        if ($(this).hasClass('giveaway__hide')){
                            $(this).click();
                        }
                    });
                    setTimeout(function() {$('.form__submit-button')[0].click();}, 100);
                }
            }
            a.remove();
            setTimeout(function() {openlink();}, 200);
        });
    }
}
function ref() {location.reload();}
function startup() {
    if (window.location.href.match(/steamgifts\.com\/$|giveaways\/\w+\?.+$/)) {
        remove();
        setTimeout(openlink, 1000);
        setTimeout(ref, 120000);
    }
}
