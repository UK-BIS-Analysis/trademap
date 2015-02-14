/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP EACH OF THE CHARTS
 * */


define(['./charts/choropleth', './charts/topExportCommodities', './charts/topExportDestinations', './charts/topImportCommodities', './charts/topImportSources'], function(choropleth, topExportCommodities, topExportDestinations, topImportCommodities, topImportSources) {
  'use strict';

  var charts = {
    setup: function () {
      // Hide all charts except choropleth on load
      $('#yearChart, #topImportSources, #topImportCommodities, #topExportDestinations, #topExportCommodities').slideUp(0);

      // Setup charts
      choropleth.setup();
      topExportCommodities.setup();
      topExportDestinations.setup();
      topImportCommodities.setup();
      topImportSources.setup();
    }

  };

  return charts;
});
