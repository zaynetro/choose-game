(function ($) {

  var $e = {
    run        : $('#run'),
    output     : $('#output'),
    loader     : $('#loader'),
    addingform : $('#addingform'),
    select     : $('#addingform select'),
    runlinkbtn : $('#runlinkbtn')
  };

  function outputData(data, level, $parent) {
    if(!data || !data.length) return '';
    level = parseInt(level, 10) || 1;

    function buildHTML(data, level) {
      level = level || 1;
      var res = '<ul>';
      data.forEach(function (el) {
        res += '<li data-level="' + level + '">' +
                '<div class="runlink">' +
                '<button id="runlinkbtn">run</button>' +
                '</div><div class="link">' +
                el + '</div></li>';
      });
      return res + '</ul>';
    }

    function addEvents() {
      $e.runlinkbtn.on('click', function () {
        $(this).attr('disabled', 'disabled');

        var send = $e.addingform.serialize();

        $.post('/1/add', send, function (data) {
          outputData(data, $e.select.val(), $(this));
         }.bind(this))
         .fail(function () {
          alert('Fail');
         })
         .always(function () {
           $e.loader.hide();
           $(this).removeAttr('disabled');
         }.bind(this));
      });
    }

    var handler = {
      1 : function () {
        $e.output.html(buildHTML(data));
      },
      2 : function () {
        if($parent) {
          $parent.append(buildHTML(data));
        }
      },
      3 : function () {

      }
    };

    try {
      handler[level]();
    } catch(e) {
      alert('Something went wrong');
    }
  }

  $e.run.on('click', function () {
    $e.run.attr('disabled', 'disabled');
    $e.loader.show();

    var send = $e.addingform.serialize();

    $.post('/1/add', send, function (data) {
      outputData(data, $e.select.val());
     })
     .fail(function () {
      alert('Fail');
     })
     .always(function () {
       $e.loader.hide();
       $e.run.removeAttr('disabled');
     });

  });

})(jQuery);
