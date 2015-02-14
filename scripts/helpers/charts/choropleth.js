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
      choropleth = {

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
      }

      // If reporter is selected then
      data.query({
        reporter: filters.reporter,
        period:   filters.year
      }, function queryCallback (err, data) {
        // TODO: handle the data back and (re)draw map
        // Depending on presence of commodity do something
        if(!filters.commodity) {
          $('#choropleth .placeholder').html('Total value of '+filters.flow+' between '+localData.reporterAreas[filters.reporter]+' and every other country for '+filters.year+'. '+localData.reporterAreas[filters.reporter]+' is highlighted on the map.');
        } else {
          $('#choropleth .placeholder').html('Value of '+filters.flow+' between '+localData.reporterAreas[filters.reporter]+' and each other country for '+localData.classificationCodes[filters.commodity]+' in '+filters.year);
        }
      });

    }

  };

  return choropleth;
});
