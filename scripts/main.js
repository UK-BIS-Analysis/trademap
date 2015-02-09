/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, require */

/*
 * THIS RUNS THE MAIN LOGIC OF THE VIZ
 * It wraps everything in the requirejs callback function.
 * */


require(['helpers/data', 'helpers/controls', 'helpers/map'], function(data, controls, map) {

  // This jQuery callback makes sure that all code is run after the document and scripts have all loaded properly
  $(document).ready(function () {
    'use strict';

    // Use Modernizr to check for SVG support and if not present display an error and don't even start loading CSV and setting up charts
    if (!Modernizr.svg) {
      $('#browserAlert').removeClass('hidden');
    } else {

      // Setup the controls
      controls.setup();


    }     // Close Modernizr conditional
  });     // Close $(document).ready

});
