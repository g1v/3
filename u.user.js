// ==UserScript==
// @name         Auto gift farming
// @version      3.5
// @author       Sir TE5T
// @updateURL    https://raw.githubusercontent.com/g1v/3/master/v.meta.js
// @downloadURL  https://raw.githubusercontent.com/g1v/3/master/u.user.js
// @require      http://code.jquery.com/jquery-3.2.1.min.js
// @match        http*://www.steamgifts.com/*
// @match        http*://www.indiegala.com/*
// ==/UserScript==

var pq = {
    steamgift: {
        regex:    /steamgifts\.com\/$|giveaways\/.+\d+$/,
        point:    {
            get: function( ) {return parseInt($('.nav__points').html());},
            set: function(a) {$('.nav__points').html(a);}
        },
        remove:   function() {
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
        },
        join:     function() {
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
                        pq.remove();
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
                    setTimeout(pq.join, 200);
                });
            }
        },
        ref:      function() {
            location.reload();
        },
        startup:  function() {
            pq.remove();
            setTimeout(pq.join, 1000  );
            setTimeout(pq.ref , 120000);
        }
    },
    indiegala: {
        regex:   /giveaways/,
        startup: function() {
            console.log('no');
        }
    }
};

function main() {
    var a = window.location.href;
    for (var b in pq) {
        if (a.match(b) && a.match(pq[b].regex)) {
            pq = pq[b];
            pq.startup();
            break;
        }
    }
}

$(document).ready(main);
