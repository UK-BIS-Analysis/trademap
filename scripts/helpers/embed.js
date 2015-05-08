/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP a single chart for embed purposes
 * */


define(function(require) {
  'use strict';

  var embed = {

    // Color schemes from http://colorbrewer2.org/
    // http://colorbrewer2.org/?type=sequential&scheme=YlGn&n=5
    // The number of colors will drive the scales below (e.g. if you put six colors there will be six shades in the scales)
    balanceColors : ['rgb(8,104,172)','rgb(120,198,121)'],// import/export - blue/green
    importColors  : ['rgb(240,249,232)','rgb(186,228,188)','rgb(123,204,196)','rgb(67,162,202)','rgb(8,104,172)'],  // blues
    exportColors  : ['rgb(255,255,204)','rgb(194,230,153)','rgb(120,198,121)','rgb(49,163,84)','rgb(0,104,55)'], // greens

    setup: function (filters) {

      if (DEBUG) { console.log('This is an embed of '+filters.embed); }

      // Add a class to body to trigger CSS rules
      $('body')
        .addClass('embed')
        .addClass(filters.embed+'Embedded');

      require(['./charts/'+filters.embed], function(chart){
        chart.colors = [embed.balanceColors, embed.importColors, embed.exportColors];
        chart.setup();
        chart.refresh(null, filters);
      });
    },

    hide: function (chartNames) {
      // Hide all except for the chart we want to show
      chartNames.forEach(function (chartName) {
        $('#'+chartName).hide();
      });
      $('#loadingDiv').hide();
    }

  };

  return embed;
});
