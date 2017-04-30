// ==UserScript==
// @name         Auto gift farming
// @version      5.3
// @author       Sir TE5T
// @updateURL    https://raw.githubusercontent.com/g1v/3/master/v.meta.js
// @downloadURL  https://raw.githubusercontent.com/g1v/3/master/u.user.js
// @require      http://code.jquery.com/jquery-3.2.1.min.js
// @match        http*://www.steamgifts.com/*
// @match        http*://www.indiegala.com/*
// ==/UserScript==

var pq = {
    steamgift: {
        regex:    /\.com\/$|giveaways\/.+\d+$/,
        point:    {
            get: function( ) {return parseInt($('.nav__points').text());},
            set: function(a) {$('.nav__points').text(a);}
        },
        remove:   function() {
            $('.giveaway__row-outer-wrap').each(function () {
                if ($('.giveaway__column--contributor-level.giveaway__column--contributor-level--negative', this)[0]) {
                    this.remove();
                } else if ($('.giveaway__row-inner-wrap.is-faded', this)[0]) {
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
                    if (c.type == 'success') {
                        pq.point.set(c.points);
                        pq.remove();
                    } else if (c.type == 'error') {
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
                }, 'json');
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
        regex:    /giveaways/,
        coins:    {
            get: function( ) {return parseInt($('.account-row.account-galamoney').text().match(/\d+/));},
            set: function(a) {$('.account-row.account-galamoney').text(a);}
        },
        level:    {
            get: function() {return 0;}
        },
        ticket:   {
            price: function(a) {return parseInt($('.left.ticket-price', a).text().match(/\d+(?=iC)/));},
            level: function(a) {return parseInt($('.type-level-cont', a).text().match(/\d+(?=\+)/));},
            id:    function(a) {return $('.ticket-right', a).children().attr('rel');}
        },
        remove:   function() {
            $('.col-xs-6').each(function() {
                if (pq.ticket.level($(this)) > pq.level.get()) {
                    this.remove();
                } else if (pq.ticket.price($(this)) > pq.coins.get()) {
                    this.remove();
                } else if (!$('.giv-coupon.relative', this)[0]) {
                    this.remove();
                }
            });
        },
        join:     function() {
            var a = $('.col-xs-6')[0];
            if (a) {
                var b = JSON.stringify({
                    giv_id:       pq.ticket.id(a),
                    ticket_price: pq.ticket.price(a)
                });
                $.post('/giveaways/new_entry', b, function(z) {
                    if (z.status == 'ok') {
                        pq.coins.set(z.new_amount);
                    }
                    a.remove();
                    pq.remove();
                    setTimeout(pq.join, 200);
                }, 'json');
            }
        },
        ref:      function() {
            location.reload();
        },
        startup:  function() {
            $('.cover-cont')[1].remove();
            setTimeout(pq.remove, 2000  );
            setTimeout(pq.join  , 2100  );
            setTimeout(pq.ref   , 120000);
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
