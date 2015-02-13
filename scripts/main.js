/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, require, window */

/*
 * THIS RUNS THE MAIN LOGIC OF THE VIZ
 * It wraps everything in the requirejs callback function.
 * */


require(['helpers/data', 'helpers/controls', 'helpers/charts'], function(data, controls, charts) {
  'use strict';

  // FIX: We declare a global boolean DEBUG variable which we'll use to switch on or off console.log messages
  window.DEBUG = true;

  // This jQuery callback makes sure that all code is run after the document and scripts have all loaded properly
  $(document).ready(function () {

    // Use Modernizr to check for SVG support and if not present display an error and don't even start loading CSV and setting up charts
    if (!Modernizr.svg) {
      $('#browserAlert').removeClass('hidden');
    } else {

      // Setup the controls
      controls.setup();

      // Setup charts
      charts.setup();

    }     // Close Modernizr conditional
  });     // Close $(document).ready

});
