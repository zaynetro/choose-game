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
    level = +level || 1;

    function buildHTML(data, level) {
      level = level || 1;
      level += 1;
      var res = '<ul>';

      if(level == 3) {
        res += '<li><button id="runallgames">run all games</li>';
      }

      data.forEach(function (el) {
        res += '<li data-level="' + level + '">' +
                '<div class="runlink">' +
                '<button id="runlinkbtn">run</button>' +
                '</div><div class="link">' +
                el + '</div></li>';
      });
      return res + '</ul>';
    }

    function sendData(that) {
      $(that).attr('disabled', 'disabled');
      $e.loader.show();

      var type = $(that).parent().parent().attr('data-level'),
          url  = $(that).parent().parent().find('.link').text(),
          send = 'url=' + encodeURIComponent(url) +
                 '&type=' + encodeURIComponent(type);

      $.post('/1/add', send, function (data) {
        outputData(data, +type, $(that).parent().parent());
       }.bind(that))
       .fail(function () {
        alert('Fail');
       })
       .always(function () {
         $e.loader.hide();
         $(that).removeAttr('disabled');
       }.bind(that));
    }

    function runAllGames($el) {
      $el.find('li[data-level] #runlinkbtn').each(function () {
        sendData(this);
      });
    }

    function addEvents($parent) {
      var $el = $parent ? $parent : $e.output;

      $el.on('click', '#runlinkbtn', function () {
        sendData(this);
      });

      $el.find('#runallgames').on('click', function () {
        $(this).attr('disabled', 'disabled');
        runAllGames($el);
      });
    }

    var handler = {
      1 : function () {
        $e.output.html(buildHTML(data, 1));
      },
      2 : function () {
        if($parent) {
          $parent.append(buildHTML(data, 2));
        } else {
          $e.output.html(buildHTML(data, 2));
        }
      },
      3 : function () {
        if($parent) {
          $parent.addClass('parsed');
        }
      }
    };

    try {
      handler[level]();
      addEvents($parent);
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
