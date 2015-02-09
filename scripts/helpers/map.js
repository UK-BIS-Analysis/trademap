/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert*/

// This jQuery callback makes sure that all code is run after the document and scripts have all loaded properly
$(document).ready(function () {

  'use strict';

  // Use Modernizr to check for SVG support and only draw if we have SVG support
  if (Modernizr.svg) {

    console.log('Draw SVG');

  }     // Close Modernizr conditional
});     // Close $(document).ready
