/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE CHOROPLETH
 * */


define(['../data'], function(data) {
  'use strict';
  var localData = data,
      $chart = $('#choropleth'),
      chart = {

        setup: function () {
          $chart
            .on('refreshFilters', this.refresh)
            .children('.placeholder')
            .html('Blank map, no countries selected.');
        },

        refresh: function (event, filters) {

          // CASE 1: reporter = null
          if(!filters.reporter) {
            $('#choropleth .placeholder').html('Blank choropleth, no countries selected.');
            return;
          }

          // CASE 2: reprter = selected
          data.query({
            reporter: filters.reporter,
            period:   filters.year,
            hsCode:   'AG2'
          }, function queryCallback (err, data) {
            // TODO: handle the data back and (re)draw map
            // Depending on presence of commodity do something
            if(!filters.commodity) {
              $('#choropleth .placeholder').html('Choropleth with total value of '+filters.flow+' between '+localData.reporterAreas[filters.reporter]+' and every other country for '+filters.year+'. '+localData.reporterAreas[filters.reporter]+' is highlighted on the map.');
            } else {
              $('#choropleth .placeholder').html('Choropleth with value of '+filters.flow+' between '+localData.reporterAreas[filters.reporter]+' and each other country for '+localData.classificationCodes[filters.commodity]+' in '+filters.year);
            }
          });

        }

  };

  return chart;
});
