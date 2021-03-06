/**
 * Simple wiki syntax parser
 *
 */

var syntax = {

  handleList : function (lines, start, end) {
    // TO DO: Add numbered list support
    var res    = '',
        indent = 0;
    for(var j = start; j <= end; j += 1) {
      var l = lines[j],
          f = l.match(/^\*+|^\#+/);
      if(f && f[0]) {
        if(f[0].length > indent) {
          res += '<ul>';
          indent = f[0].length;
        } else if(f[0].length < indent) {
          res += '</ul>';
          indent = f[0].length;
        }
        res += '<li>' + syntax.handleLine(l.replace(/^\*+|^\#+/, '').trim()) + '</li>';
      }
    }

    for(var i = 0; i < indent; i += 1) {
      res += '</ul>';
    }

    return res;
  },

  handleDefList : function (lines, start, end) {
    // TO DO: Add multi-level support
    var res = '<dl>';

    for(var j = start; j <= end; j += 1) {
      var l = lines[j];

      if(l.match(/^\;{1}/) !== null) {
        l = '<dt>' + syntax.handleLine(l.slice(1).trim()) + '</dt>';
      } else if (l.match(/^\:{1}/) !== null) {
        l = '<dd>' + syntax.handleLine(l.slice(1).trim()) + '</dt>';
      }
      res += l;
    }

    return res + '</dl>';
  },

  handleLeadSpace : function (lines, start, end) {
    var res = '<pre>';

    for(var j = start; j <= end; j += 1) {
      res += syntax.handleLine(lines[j]) + '\n';
    }

    return res + '</pre>';
  },

  handleLine : function (line, paragraphed) {
    var r = line,
        t, t2;

    if(paragraphed) r = '<p>' + r;

    r = r.trim();

    // '''bold''' -> <b>bold</b>
    r = r.replace(/[']{3}(?=\w)+/g, '<b>').replace(/[']{3}(?!\w)/g, '</b>');

    // ''italics'' -> <i>italics</i>
    r = r.replace(/[']{2}(?=\w)+/g, '<i>').replace(/[']{2}(?!\')/g, '</i>');

    // '''bold and italics''' -> <i><b>bold and italics</b></i>
    r = r.replace(/[']{5}(?=\w)+/g, '<i><b>').replace(/[']{5}(?!\w)/g, '</b></i>');

    /**
     * Game link:
     *   [[long url]] -> <a href='/game/long_url' ref='game'>long url</a>
     */
    t = r.match(/[[]{2}([\w\s]+)[\]]{2}/g);
    if(t && t.length) {
      t.forEach(function (el) {
        t2 = el.replace(/[[]{2}|[\]]{2}/g, '');
        t2 = "<a href='/game/"+t2.replace(/ /g, '_')+"' ref='game'>"+t2+"</a>";
        r = r.replace(el, t2);
      });
    }

    /**
     * TO DO:
     * [http://url/ Name] -> <a href='http://url/' ref='external'>Name</a>
     * http://url/ -> <a href='http://url/' ref='external'>http://url/</a>
     */

    /**
     * Remove unused and unparsed:
     *   {text}, {{text}}, [text], [[text]]
     */
    r = r.replace(/((\[+)|(\{+))([^\]\}]*)((\]+)|(\}+))/g, '');

    if(paragraphed) r = r + '</p>';

    return r;
  },

  parse : function (text) {
    if(!text || !text.length) return false;

    // Encode html tags, if they exist
    text = text.replace(/</g, '&lt;').replace(/>/g, '&gt;');

    var lines = text.split(/\r?\n/),
        html  = '',
        start = 0;

    /**
     * Help pages:
     *   http://en.wikipedia.org/wiki/Help:Wiki_markup
     *   http://en.wikipedia.org/wiki/Help:Cheatsheet
     */

    for(var i = 0; i < lines.length; i += 1) {
      var line = lines[i];
      line = line.trim();

      if(line.match(/^[=]{3}/) !== null && line.match(/[=]{3}$/) !== null) {
        // === Level 3 === -> <h3>Level 3</h3>
        html += '<h3>' + line.substring(3, line.length - 3).trim() + '</h3>';
      } else if(line.match(/^[=]{2}/) !== null && line.match(/[=]{2}$/) !== null) {
        // == Level 2 == -> <h2>Level 2</h2>
        html += '<h2>' + line.substring(2, line.length - 2).trim() + '</h2>';
      } else if(line.match(/^[-]{4,}/)) {
        // ---- -> <hr />
        html += '<hr />';
      } else if(line.match(/^\*+|^\#+/) !== null) {
        // Lists (Bulleted and Numbered)
        // * -> Bulleted
        // # -> Numbered
        start = i;
        while(i < lines.length && lines[i].match(/^\*+|^\#+/) !== null) i += 1;
        i -= 1;
        html += syntax.handleList(lines, start, i);
      } else if(line.match(/^\;{1}|^\:{1}/) !== null) {
        // Definition lists
        // ; Text -> <dt>Text</dt>
        // : Text -> <dd>Text</dd>
        start = i;
        while(i < lines.length && lines[i].match(/^\;{1}|^\:{1}/) !== null) i += 1;
        i -= 1;
        html += syntax.handleDefList(lines, start, i);
      } else if(line.match(/^ {1}/) !== null) {
        // Leading spaces -> add <pre> block
        start = i;
        while(i < lines.length && lines[i].match(/^ {1}/) !== null) i += 1;
        i -= 1;
        html += syntax.handleLeadSpace(lines, start, i);
      } else {
        // Handle syntax within one line
        html += syntax.handleLine(line, true);
      }
    }

    return html;
  }

};

module.exports = syntax.parse;
