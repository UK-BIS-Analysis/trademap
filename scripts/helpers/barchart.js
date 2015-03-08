/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE PROVIDES LOGIC TO SETUP AND DRAW BAR CHARTS
 * (so that we don't have to repeat the code for each bar chart)
 * */


define([], function() {
  'use strict';

  var margin = {top: 25, right: 15, bottom: 30, left: 70},
      innerHeight = 0,
      innerWidth = 0,

      barchart = {

        setup: function (svg) {

          // Set internal graph dimensions
          innerHeight = svg.attr('height') - margin.top - margin.bottom;
          innerWidth = svg.attr('height') - margin.left - margin.right;

          // Setup and draw axises

        },

        draw: function (svg, data) {

          // Setup scales

          // Update axises

          // Enter-update-exit bars

        }

      };

  return barchart;
});
