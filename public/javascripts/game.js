;(function ($) {

  $.get('/api/game/randomName', function (data) {
    if(data && data.name && data.name.length) {
      var url = data.name.replace(/ /g, '_');
      $('#next').attr('href', '/game/'+url);
    }
  });

  $('a:not([data-global])').on('click', function (e) {
    e.preventDefault();
  });

})(jQuery);
