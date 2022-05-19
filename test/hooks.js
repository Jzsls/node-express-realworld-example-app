var mongoose = require('mongoose');


exports.mochaHooks = {
  beforeAll(done){
    var db = mongoose.createConnection('mongodb://localhost/test');
    db.collection('users')
    .deleteOne({}, function (res) { done(); }); 
}};