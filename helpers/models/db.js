/**
 * DB Models
 *
 */

var mongoose = require('mongoose'),
    Schema   = mongoose.Schema,
    crypto   = require('crypto');

/**
 * Categories
 *
 */

var categorySchema = new Schema({
  name      : { type : String, default : '', unique : true },
  parent    : { type : Schema.Types.ObjectId, ref : 'Category' },
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

categorySchema.index({ name : 1 });

mongoose.model('Category', categorySchema);

/**
 * Games
 *
 */

var gameSchema = new Schema({
  name       : { type : String, default : '', unique : true },
  categories : [{ type : Schema.Types.ObjectId, ref : 'Category' }],
  data       : { type : String, default : '' },
  createdAt  : { type : Date,   default : Date.now },
  ref        : { type : String, default : '' },
  random     : { type : Number, default : Math.random }
});

gameSchema.statics = {

  /**
   * Get random entry
   */
  random : function (options, cb) {
    var defaults = {
      fields : {
        name : 1
      },
      populate : {
        path : 'categories'
      }
    };

    if(typeof cb !== 'function') {
      cb = options;
      options = null;
    }

    options = options || defaults;

    var rand = Math.random();

    this.findOne({
        'random' : {
          '$gte' : rand
        }
      },
      options.fields
      )
      .populate(options.populate)
      .exec(function (err, result) {
        if(result) return cb(err, result);

        this.findOne({
          'random' : {
            '$lte' : rand
          }
        },
        options.fields
        )
        .populate(options.populate)
        .exec(cb);

      }.bind(this));
  }
};

gameSchema.index({ random : 1 });
gameSchema.index({ name : 1 });

mongoose.model('Game', gameSchema);

/**
 * Pass codes
 *
 */

var passSchema = new Schema({
  name      : { type : String, default : '', unique : true },
  code      : { type : String, default : '' },
  salt      : { type : String, default : '' },
  createdAt : { type : Date,   default : Date.now }
});

passSchema.pre('save', function (next, done) {
  this.salt = this.makeSalt();
  this.code = this.encryptPassword(this.code);
  next();
});

passSchema.methods = {

  authenticate : function (plainText) {
    return this.encryptPassword(plainText) === this.code;
  },

  makeSalt : function () {
    return Math.round((new Date().valueOf() * Math.random())) + '';
  },

  encryptPassword : function (password) {
    if (!password) return '';
    var encrypred;
    try {
      encrypred = crypto.createHmac('sha1', this.salt).update(password).digest('hex');
      return encrypred;
    }
    catch (err) {
      return '';
    }
  }
};

mongoose.model('Pass', passSchema);
