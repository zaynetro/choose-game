(function ($) {

  $('#parseAll').on('submit', function (e) {
    e.preventDefault();

    var data = {
      url : $('#allurl').val()
    };

    $('#loader').show();
    $.post('/api/add/all', data, function (data) {
      alert('Success');
    })
     .fail(function () {
      alert('Fail');
     })
     .always(function () {
       $('#loader').hide();
     });

  });

})(jQuery);
