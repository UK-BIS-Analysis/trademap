/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP EACH OF THE CHARTS
 * */


define(['./charts/choropleth', './charts/yearChart', './charts/infoBox', './charts/topExportCommodities', './charts/topExportDestinations', './charts/topImportCommodities', './charts/topImportSources'],
  function(choropleth, yearChart, infoBox, topExportCommodities, topExportDestinations, topImportCommodities, topImportSources) {
  'use strict';

  var charts = {

    // Color schemes from http://colorbrewer2.org/
    // http://colorbrewer2.org/?type=sequential&scheme=YlGn&n=5
    // The number of colors will drive the scales below (e.g. if you put six colors there will be six shades in the scales)
    balanceColors : ['rgb(8,104,172)','rgb(120,198,121)'],// import/export - blue/green
    importColors  : ['rgb(240,249,232)','rgb(186,228,188)','rgb(123,204,196)','rgb(67,162,202)','rgb(8,104,172)'],  // blues
    exportColors  : ['rgb(255,255,204)','rgb(194,230,153)','rgb(120,198,121)','rgb(49,163,84)','rgb(0,104,55)'], // greens

    setup: function (callback) {
      charts.colors = [charts.balanceColors, charts.importColors, charts.exportColors];

      // Apply colors
      choropleth.colors = charts.colors;
      yearChart.colors = charts.colors;
      topExportCommodities.colors = charts.colors;
      topExportDestinations.colors = charts.colors;
      topImportCommodities.colors = charts.colors;
      topImportSources.colors = charts.colors;

      // Setup charts
      yearChart.setup();
      infoBox.setup();
      topExportCommodities.setup();
      topExportDestinations.setup();
      topImportCommodities.setup();
      topImportSources.setup();
      choropleth.setup(function () {
        // TODO Inject CSS into SVGs
        callback();
      });
    },

    _getCssForSVG: function (svg) {
      // TODO
      // Get the svg id
      // Find main.css or main.min.css in document.styleSheets
      // Find all cssRules where d.selectorText contains 'svg.[id]'
      // Get the cssText of each of the rules and compile into a single string
    },




    _injectCSSintoSVG: function (css, svg) {
      // TODO
      // Inject a <defs> tag with the CSS text into the SVG like follows
      //  <defs>
      //    <style type="text/css"><![CDATA[
      //      .socIcon g {
      //        fill:red;
      //      }
      //    ]]></style>
      //  </defs>
    }

  };

  return charts;
});
