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
    setup: function (callback) {
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
