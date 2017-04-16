
pq = {
  point: {
    get: function() {
        return parseInt($('.nav__points').html());
    },
    set: function(a) {
        $('.nav__points').html(a);
    }
  }
};
