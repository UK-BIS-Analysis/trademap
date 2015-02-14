/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE CHOROPLETH
 * */


define(['../data'], function(data) {
  'use strict';

  var choropleth = {

    setup: function () {
      // Initialize map state:
      $('#choropleth .placeholder').html('Blank map, no countries selected.');

      // Add filterUpdate listener
      $('#choropleth').on('refreshFilters', choropleth.refresh);
    },

    refresh: function (event, filters) {
      // If no reporter is selected clear map and stop
      if(!filters.reporter) {
        $('#choropleth .placeholder').html('Blank map, no countries selected.');
        return;
      } else {
        // Launch Query1
        data.query({
          reporter: filters.reporter,
          period:   filters.year
        }, function () {
          // Then depending on presence of commodity do something
          if(!filters.commodity) {
            $('#choropleth .placeholder').html('Total value of '+filters.flow+' between '+data.reporterAreas[filters.reporter]+' and every other country for '+filters.year+'. '+data.reporterAreas[filters.reporter]+' is highlightes on the map.');
          } else {
            $('#choropleth .placeholder').html('Value of '+filters.flow+' between '+data.reporterAreas[filters.reporter]+' and each other country for '+data.classificationCodes[filters.commodity]+' in '+filters.year);
          }
        });
      }
    }

  };

  return choropleth;
});
