;(function ($) {

  var Page = function (router) {
    this.$ = {
      gameName  : $('#gameName'),
      gameRules : $('#gameRules'),
      gameNext  : $('#gameNext'),
      gameCats  : $('#gameCats')
    };

    this.current = {
      game : {
        name : this.$.gameName.text(),
        data : this.$.gameRules.html()
      },
      next : null
    };

    this.router = router;

    this.loadNext();
  };

  Page.prototype = {
    set : function (obj) {
      if(!obj || !obj.game) return;

      this.current = obj;

      this.$.gameName.text(obj.game.name);
      this.$.gameRules.html(obj.game.data);
      document.title = obj.game.name;
      this.appendCats();
      if(obj.next) {
        var url = obj.next.name.replace(/ /g, '_');
        this.$.gameNext.attr('href', '/game/'+url);
      } else {
        this.loadNext();
      }
    },

    loadNext : function () {
      $.get('/api/game/random', function (data) {
        if(data && data.name && data.name.length) {
          var url = data.name.replace(/ /g, '_');
          this.$.gameNext.attr('href', '/game/'+url).removeClass('disabled');

          this.current.next = data;
        }
      }.bind(this));
    },

    appendCats : function () {
      this.$.gameCats.empty();
      this.current.game.categories.forEach(function (el) {
        this.$.gameCats.append("<li><a href='/category/"+el.name.replace(/ /g, '_')+"'>"+el.name+"</a></li>");
      }.bind(this));
    },

    load : function (url) {
      if(!url) return false;


    },

    next : function (url, done) {
      if(!url) return false;

      var current = {
        game : this.current.next,
        next : null
      }

      this.set(current);
      this.router.goTo(url, current);

      if(typeof done === 'function') {
        setTimeout(1000, function () {
          done();
        });
      }
    }
  };

  window.onload = function () {

    var router = (function () {
      window.onpopstate = function (e) {
        if(window.location.pathname.indexOf('/game/') !== -1) {
          page.set(e.state);
        }
      };

      return {
        goTo : function (url, obj) {
          if(!url || !url.length) return false;
          obj || (obj = {});

          history.pushState(obj, null, url);
        }
      };

    })();

    var page = new Page(router);

    $('.rules a[ref="game"]').on('click', function (e) {
      e.preventDefault();

      page.load($(e.currentTarget).attr('href'));
    });

    $('#gameNext').on('click', function (e) {
      e.preventDefault();

      page.next($(e.currentTarget).attr('href'));
      $(this).removeAttr('href').addClass('disabled');
    });

  };

})(jQuery);
