(function ($) {

  $('#parseAll').on('submit', function (e) {
    e.preventDefault();

    var data = {
      url : $('#allurl').val()
    };

    $('#loader').show();
    $.ajax({
      type : 'POST',
      url  : '/api/add/all',
      data : data,
      timeout : 0,
      success : function (data) {
        alert('Success');
      }
    })
     .fail(function () {
      alert('Fail');
     })
     .always(function () {
       $('#loader').hide();
     });

  });

})(jQuery);
