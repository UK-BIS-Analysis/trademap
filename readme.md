# Trade Map Visualization

## Quick details

* **Production URL**: [http://comtrade.un.org/labs/BIS-trade-in-goods/](http://comtrade.un.org/labs/BIS-trade-in-goods/)
* **Development URL**: [http://play.fm.to.it/trademap](http://play.fm.to.it/trademap)
* **Private git repository URL**: [https://bitbucket.org/fmerletti/dbis_trademap](https://bitbucket.org/fmerletti/dbis_trademap)
* **Public git repository**: [https://github.com/UK-BIS-Analysis/trademap](https://github.com/UK-BIS-Analysis/trademap)
* **Licence**: [GPL](https://www.gnu.org/licenses/gpl-2.0.txt)

### Libraries, frameworks and tools used:

Frontend:

* [Bootstrap](http://getbootstrap.com/): General look, UI, responsiveness
* [RequireJS](http://requirejs.org/): Packaging and modularization of the app
* [D3js](http://d3js.org/): Graphing and map
* [Topojson](https://github.com/mbostock/topojson/wiki): For loading and processing map data.
* [d3-geo-projection](https://github.com/mbostock/d3/wiki/Geo-Projections): For drawing the map
* [Crossfilter](https://github.com/square/crossfilter): Used as an in-browser database
* [jQuery](https://jquery.com/): UI management
* [Modernizr](http://modernizr.com/): For checking feature support in browsers
* [select2](https://select2.github.io/): For the drop-down select controls
* [history.js](https://github.com/balupton/History.js/): For persistent URL management in HTML5 browsers and HTML4 browsers
* [file-saver-saveas-js](https://github.com/eligrey/FileSaver.js/): For saving SVG and PNGs
* [d3-tip](https://github.com/Caged/d3-tip)
* [intro.js](https://github.com/usablica/intro.js/#attributes)
* And to deal with older Internet Explorer versions: [aight](https://github.com/shawnbot/aight) and [jQuery.XDomainRequest](https://github.com/MoonScript/jQuery-ajaxTransport-XDomainRequest)

Development tools:

* [Bower.io](http://bower.io/): To manage library dependencies
* [Grunt](http://gruntjs.com/): To package and minify the application

Both are command line tools and depend on NodeJS and NPM being installed on a system. See [nodejs.org](https://nodejs.org/) for installation instructions.

## Technical overview

The application is a single page HTML5, CSS, JS application. The entire app logic is in Javascript and therefore run in the browser.
There is no server backend required. Data is pulled by the browser from the [Comtrade API](http://comtrade.un.org/data/).

The point of entry for the application is the ```index.html``` file which includes all necessary CSS and JS assets.

[RequireJS](http://requirejs.org/) allows breaking up an application into modules and defining dependencies of each module on 
other modules (AKA dependency injection). The ```scripts/main.js``` file is the main file that boots the application and includes
all the different modules, initializing them.

The ```scripts/helpers``` folder contains modules for different components of the visualization:

* ```data.js```: This module handles interaction with the Comtrade API as well as managing 
  [Crossfilter](https://github.com/square/crossfilter) which we use as a local database.
  The _setup_ function of the module loads all necessary JSON and CSV data (see the 
  [data/sources/sources.md](data/sources/sources.md) file). The _query_ function runs API queries
  ensuring throttling (no more than 1 query fired per second) as well as avoiding duplicate queries.
  It also stores the retrieved data into crossfilter avoiding duplicate records.
  The _getData_ function queries the crossfilter and the _combineData_ function merges import and 
  export records adding balance and bilateral trade info.
* ```controls.js```: Sets up and handles the behaviours associated with the main controls (reporter, partner, commodity, flow, year).
  It also fires events, alerting charts if filters are changed so that they can update accordingly. The file also manages the changes
  to the URL location bar ensuring that a persistent URL is used, enabling users to copy links to specific views of the data.
* ```gui.js```: Sets up and manages the behaviours of other GUI components (drop down menus, page scrolling, PNG, SVG and CSV downloading etc.)
* ```charts.js```: Triggers the setup of each of the charts on the page, defines some common properties like colours and also injects
  CSS code into the SVG elements to make the SVG exports behave better.
* ```embed.js```: The module is used instead of the charts one and only triggers the rendering of one chart hiding all other markup.
  It is used to render the embedded chart view and is triggered by having an ```&embed=yearChart``` query parameter.
* ```charts/*.js```: Each file contains specific logic for each of the different charts.
* ```rowchart.js```: Contains re-usable logic to draw each of the row charts and is invoked from the modules inside the ```charts``` folder.
* ```intro.js```: Contains the logic and steps for the introduction slideshow.

### Build process: packaging and optimization

The source code of the application is optimized and minified for production use unsing [Grunt](http://gruntjs.com/) based on the ```Gruntfile.js```
script. To run the optimization and generate production code make sure you have all dependencies installed by running (you only need to do
this once on your system):

    npm install
    
You can then generate production code simply by running:

    grunt

The following files are generated:

* ```index.html``` is generated from ```index.dev.html``` replacing javascript dependencies with the compiled and minified versions.
* ```assets/libs.min.css``` is generated from all the CSS files of the libraries used (Bootstrap, Select2...)
* ```assets/libs.min.js``` is generated compiling and minifying all JS files of library dependencies (d3, crossfileter, jquery, bootstrap...)
* ```assets/main.min.css``` is a minified version of styles/main.css which contain custom style information for the app.
* ```assets/main.min.js``` is generated compiling the custom scripts or specific app logic. It uses requirejs to compile.

### Sources and API information:

More details about the sources and the API can be found in the [data/sources/sources.md](data/sources/sources.md) file.

### Code style, notes & other practices

* Normally external libraries would be excluded from the repository and be retrieved upon install using bower. However to make the 
  visualization more portable, even on systems that do not have npm and bower installed they are included in this git repo.
* Remember to modify the index.dev.html file instead of the index.html file in development.
* Variables are preferably named using camelCase
* Indenting is 2 spaces (no tabs)

### Credits

Coding by [Francesco Merletti](http://fm.to.it).

Contacts:

* Email: [me@fm.to.it](mailto:me@fm.to.it)
* Twitter: [@mjs2020](http://fm.to.it/tw)
* Github: [@mjs2020](http://fm.to.it/gh)