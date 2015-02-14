/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP EACH OF THE CHARTS
 * */


define(['./charts/choropleth', './charts/yearChart', './charts/topExportCommodities', './charts/topExportDestinations', './charts/topImportCommodities', './charts/topImportSources'], function(choropleth, yearChart, topExportCommodities, topExportDestinations, topImportCommodities, topImportSources) {
  'use strict';

  var charts = {
    setup: function () {
      // Setup charts
      choropleth.setup();
      yearChart.setup();
      topExportCommodities.setup();
      topExportDestinations.setup();
      topImportCommodities.setup();
      topImportSources.setup();
    }

  };

  return charts;
});
