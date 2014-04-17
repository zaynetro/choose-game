/**
 * DB Models
 *
 */

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema;

/**
 * Categories
 *
 */

var categorySchema = new Schema({
  name      : { type : String, default : '', unique : true },
  createdAt : { type : Date,   default : Date.now }
});

categorySchema.statics = {

  /**
   * Get array of ObjectIDs from array of categories
   */
  getIDs : function (cats, cb) {
    if(!cats && !cats.length) return cb('Wrong array of categories');

    var Category = mongoose.model('Category');

    Category.find({
        'name' : {
          '$in' : cats
        }
      },
      '_id',
      function (err, found) {
        if(err) return cb(err);

        cb(null, found);
      }
    );
  }
};

mongoose.model('Category', categorySchema);

/**
 * Games
 *
 */

var gameSchema = new Schema({
  name       : { type : String, default : '', unique : true },
  categories : [{ type : Schema.Types.ObjectId, ref : 'Category'}],
  data       : { type : String, default : '' },
  createdAt  : { type : Date,   default : Date.now },
  random     : { type : Number, default : Math.random }
});

gameSchema.statics = {

  /**
   * Get random entry
   */
  random : function (cb) {
    var rand = Math.random();

    this.findOne({
        'random' : {
          '$gte' : rand
        }
      },
      {
        'name' : 1
      })
      .exec(function (err, result) {
        if(result) return cb(err, result);

        this.findOne({
          'random' : {
            '$lte' : rand
          }
        },
        {
          'name' : 1
        })
        .exec(cb);

      }.bind(this));
  }
};

gameSchema.index({ random : 1 });

mongoose.model('Game', gameSchema);
