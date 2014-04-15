
/*
 * Pages
 */

exports.index = function (req, res) {
  res.render('index', {
    title : 'Balancing chairs'
  });
};

exports.addform = function (req, res) {
  res.render('addform', {
    title : 'Adding form'
  });
};

exports.addData = function (req, res) {
  res.send('done');
};
