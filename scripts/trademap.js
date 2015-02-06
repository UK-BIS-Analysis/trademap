/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, alert*/

// This jQuery callback makes sure that all code is run after the document and scripts have all loaded properly
$(document).ready(function () {

  'use strict';

  // Use Modernizr to check for SVG support and if not present display an error and don't even start loading CSV and setting up charts
  if (!Modernizr.svg) {
    $('#browserAlert').removeClass('hidden');
  } else {



  }     // Close Modernizr conditional
});     // Close $(document).ready
