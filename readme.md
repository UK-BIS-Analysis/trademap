## Trade Map Visualization

### Libraries used:

* jQuery
* Bootstrap
* RequireJS
* d3js
* crossfilter
* Modernizr
* select2


### Sources and API information:

More details about the sources and the API can be found in the [data/sources/sources.md](data/sources/sources.md) file.

### Tech notes

* bower.io is a quick command line tool to download dependencies. Third party libraries (jquery, d3 etc.) are placed in the scripts/libs folder as they are from github.
* Normally libraries would be excluded from the repository and be retrieved upon install using bower. However to make the visualization more portable, even on systems that do not have npm and bower installed they will be included in the git repo.
* The __old folder contains the initial visualization by ONS
* Library JS and CSS files are minified using Grunt.


### Code style

* variables are preferably named using camelCase
* indenting is 2 spaces (no tabs)


### Accounts
 
 * Google account (for Analytics): username: analysis.bis.trade@gmail.com password: !X-S_?r,2j
 * SurveyMonkey: username: analysis.bis.trade@gmail.com password: !X-S_?r,2j


### Credits

Coding by [Francesco Merletti](http://fm.to.it)