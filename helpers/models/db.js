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
  name      : { type : String, default : '' },
  createdAt : { type : Date,   default : Date.now }
});

mongoose.model('Category', categorySchema);

/**
 * Games
 *
 */

var gameSchema = new Schema({
  name       : { type : String, default : '' },
  categories : [{ type : Schema.Types.ObjectId, ref : 'Category'}],
  data       : { type : String, default : '' },
  createdAt  : { type : Date,   default : Date.now }
});

mongoose.model('Game', gameSchema);
