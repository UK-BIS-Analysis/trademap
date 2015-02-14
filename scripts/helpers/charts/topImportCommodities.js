/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topImportCommodities chart
 * */


define(function() {
  'use strict';

  var chart = {

    setup: function () {
      // Initialize chart state:
      $('#topImportCommodities .placeholder').html('');

      // Add filterUpdate listener
      $('#topImportCommodities').on('refreshFilters', chart.refresh);
    },

    refresh: function (event, filters) {

    }

  };

  return chart;
});
