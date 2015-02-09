## Trade Map Visualization

Tech notes

* bower.io is a quick command line tool to download dependencies. Third party libraries (jquery, d3 etc.) are placed in the scripts/libs folder as they are from github.
* Normally libraries would be excluded from the repository and be retrieved upon install using bower. However to make the visualization more portable, even on systems that do not have npm and bower installed they will be included in the git repo.
* The __old folder contains the initial visualization by ONS

Code style

* variables are preferably named using camelCase
* indenting is 2 spaces (no tabs)