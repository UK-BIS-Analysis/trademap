/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, require, window, DEBUG */

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
      $('#userAlert').removeClass('hidden');
      $('#userAlert .message').html('Error: it looks like your browser does not support SVG which is required for this visualization. Please consider updating to a more recent browser.');
    } else {

      // Setup data by calling the initial JSON files
      data.setup(function (err) {
        // If the setup fails display an error and stop.
        if (err) {
          if (DEBUG) { console.log(err); }
          $('#userAlert').removeClass('hidden');
          $('#userAlert .message').html('Error: Failed to load required files for startup.');
          return;
        }

        // Otherwise continue
        // Setup the controls
        controls.setup();

        // Setup charts
        charts.setup();

      }); // Close data.setup()
    }     // Close Modernizr conditional
  });     // Close $(document).ready
});       // Close require
