// Nodejs utility script to filter the commodities JSON file
// Usage: cat yourfile.json | node commodities_filter.js > output.json

var stdin = require('stdin'),
    _ = require('lodash');

stdin(function(str){
  var data = JSON.parse(str);
  data.results = _.filter(data.results, function (value, key, collection) {
    if (value.id=='TOTAL') return true;
    if (value.id=='AG2') return true;
    if (value.id=='ALL') return true;
    if (value.id.length == 2) return true;
    return false;
  });
  console.log(JSON.stringify(data));
});
