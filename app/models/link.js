var db = require('../config');
var crypto = require('crypto');
var mongoose = require('mongoose');


var LinkSchema = new mongoose.Schema({
  visits: Number,
  title: String,
  link: String,
  code: String,
  title: String,
  base_url: String
});


var createCode = function(url) {
  var shasum = crypto.createHash('sha1');
  shasum.update(url);
  model.set('code', shasum.digest('hex').slice(0, 5));
};

LinkSchema.pre('save', function(next) {
  var code = createCode(this.url);
  this.code = code;
  next();
})

var LinkModel = mongoose.model('Link', LinkSchema);


module.exports = LinkModel;