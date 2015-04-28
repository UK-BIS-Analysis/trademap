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
        var css = charts._getCssForSVGs();
        charts._injectCSSintoSVG(css, d3.selectAll('svg'));
        callback();
      });
    },




    _getCssForSVGs: function () {
      var cssText  = '';
      // Iterate through stylesheets and look for main.svg.css
      for ( var i in document.styleSheets ) {
        if (document.styleSheets[i].href && document.styleSheets[i].href.indexOf('main.svg.css') >= 0) {
          // Add rules from stylesheet to our cssText
          for ( var j in document.styleSheets[i].cssRules ) {
            cssText += document.styleSheets[i].cssRules[j].cssText + ' ';
          };
        };
      };
      return cssText;
    },




    _injectCSSintoSVG: function (css, svg) {
      css = '<![CDATA[' + '\n' + css + '\n' + ']]>';
      svg
        .insert('defs', ':first-child')
        .append('style')
        .attr('type', 'text/css')
        .text(css);
    }

  };

  return charts;
});
