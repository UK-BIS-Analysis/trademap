// Nodejs utility script to minimize json
// Usage: cat yourfile.json | node minimizer.js > output.json

var stdin = require('stdin'),
    _ = require('lodash');

stdin(function(str){
  var data = JSON.parse(str);
  console.log(JSON.stringify(data));
});
