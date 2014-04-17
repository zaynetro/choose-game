/**
 * Simple wiki syntax parser
 *
 */

module.exports = function (text) {
  if(!text || !text.length) return false;

  var r = text,
      t, t2; // temporary

  /**
   * '''text''' -> <b>text</b>
   */
  r = r.replace(/[']{3}(?=\w){1}/g, '<b>');
  r = r.replace(/[']{3}(?!\w){1}/g, '</b>');

  /**
   * \n== text ==\n -> <h2>text</h2>
   */
  r = r.replace(/\n+[=]{2} */g, '<h2>');
  r = r.replace(/ *[=]{2}\n+/g, '</h2>');

  /**
   * ''text'' -> <i>text</i>
   */
  r = r.replace(/[']{2}(?=\w)+/g, '<i>');
  r = r.replace(/[']{2}(?!\')/g, '</i>');

  /**
   * * text -> <ul><li>text</li></ul>
   */
  // TO DO

  /**
   * TEMPORARY!
   * \n -> <br>
   */
  r = r.replace(/\n/g, '<br>');

  /**
   * [[long text]] -> <a href='/game/long_text'>long text</a>
   */
  t = r.match(/[[]{2}([\w\s]+)[\]]{2}/g);
  if(t && t.length) {
    t.forEach(function (el) {
      t2 = el.replace(/[[]{2}|[\]]{2}/g, '');
      t2 = "<a href='/game/"+t2.replace(/ /g, '_')+"'>"+t2+"</a>";
      r = r.replace(el, t2);
    });
  }

  return r;
};
