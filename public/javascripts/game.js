;(function ($) {

  var Page = function (router) {
    this.$ = {
      gameName  : $('#gameName'),
      gameRules : $('#gameRules'),
      gameNext  : $('#gameNext'),
      gameCats  : $('#gameCats'),
      loader    : $('#loader')
    };

    this.current = {
      game : null,
      next : null
    };

    this.router = router;
    this.load();
  };

  Page.prototype = {
    set : function (obj) {
      if(!obj || !obj.game) {
        this.load();
        return;
      }

      this.current = obj;

      this.$.gameName.text(obj.game.name);
      this.$.gameRules.hide().html(obj.game.data).fadeIn('fast');
      document.title = obj.game.name;
      this.appendCats();
      if(obj.next) {
        var url = obj.next.name.replace(/ /g, '_');
        this.$.gameNext.attr('href', '/game/'+url);
      } else {
        this.loadNext();
      }
      this.$.loader.hide();
      this.events();
    },

    loadNext : function () {
      $.get('/api/game?t=random', function (data) {
        if(data && data.name && data.name.length) {
          var url = data.name.replace(/ /g, '_');
          this.$.gameNext.attr('href', '/game/'+url).removeClass('disabled');

          this.current.next = data;
        }
      }.bind(this));
    },

    appendCats : function () {
      this.$.gameCats.empty();
      this.current.game.categories && this.current.game.categories.forEach(function (el) {
        this.$.gameCats.append("<li><a href='/category/"+el.name.replace(/ /g, '_')+"'>"+el.name+"</a></li>");
      }.bind(this));
    },

    getCats : function () {
      var cats = [];
      this.$.gameCats.find('li').each(function () {
        cats.push({ name : $(this).text() });
      });
      return cats;
    },

    setError : function (url) {
      this.router.goTo('/game/' + url, {});
      document.title = 'Not found';
      this.$.gameName.text('Not found');
      this.$.gameRules.text("Nothing found :'-(");
      this.$.gameCats.empty();
      this.$.loader.hide();
    },

    events : function () {
      var that = this;
      this.$.gameRules.find('a[ref="game"]').on('click', function (e) {
        e.preventDefault();
        that.load($(this).attr('href'));
      });
    },

    load : function (url) {
      if(!url) {
        url = window.location.pathname;
      }

      url = url.replace('/game/', '');

      $.get('/api/game/'+encodeURIComponent(url), function (data) {
        if(data && data.name) {
          this.current.game = data;
          this.router.goTo('/game/' + url, this.current);

          this.set(this.current);
        }
      }.bind(this))
       .fail(function () {
         this.setError(url);
       }.bind(this));

      this.loadNext();
    },

    next : function (url) {
      if(!url) return false;

      var current = {
        game : this.current.next,
        next : null
      }

      this.router.goTo(url, current);
      this.set(current);
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

          if(window.location.pathname === url) return;

          if(history.pushState) {
            history.pushState(obj, null, url);
          } else {
            window.location.assign(url);
          }
        }
      };

    })();

    var page = new Page(router);

    $('#gameNext').on('click', function (e) {
      e.preventDefault();

      page.next($(this).attr('href'));
      $(this).removeAttr('href').addClass('disabled');
    });

  };

})(jQuery);
