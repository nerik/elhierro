window.$ = require('jquery');


var Page = require('./Page');

var map = require('./map');

//load next page + dependencies + n+2 page intro
var page = new Page(3);
page.test(map)



