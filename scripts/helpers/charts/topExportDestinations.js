/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topExportDestinations chart
 * */


define(['../data'], function(data) {
  'use strict';

  var localData = data,
      $chart = $('#topExportDestinations'),
      chart = {

        setup: function () {
          $chart
            .on('refreshFilters', this.refresh)
            .slideUp(0)
            .children('.placeholder')
            .html('');
        },

        refresh: function (event, filters) {
          // CASE 1: reporter = null
          if(!filters.reporter) {
            $chart
              .slideUp()
              .children('.placeholder')
              .html('');
            return;
          }

          // CASE 2: reporter = selected    commodity = null        partner = null
          if(filters.reporter && !filters.commodity && !filters.partner) {
            data.query({
              reporter: filters.reporter,
              partner:  'all',
              period:   filters.year,
              hsCode:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Bar chart with the top 20 export destinations in '+filters.year+' for '+localData.reporterAreas[filters.reporter].name);
            });
            return;
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            $chart
              .slideUp()
              .children('.placeholder')
              .html('');
            return;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            data.query({
              reporter: filters.reporter,
              period:   filters.year,
              partner:  'all',
              hsCode:   filters.commodity
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Bar chart with the top 20 export destinations in '+filters.year+' of '+localData.classificationCodes[filters.commodity]+' for '+localData.reporterAreas[filters.reporter].name);
            });
            return;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            $chart
              .slideUp()
              .children('.placeholder')
              .html('');
            return;
          }
        }
      };
  return chart;
});
