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
              year:   filters.year,
              commodity:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Bar chart with the top 20 export destinations in '+filters.year+' for '+localData.reporterAreas.get(filters.reporter).text);
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
          // This is already covered by the data in CASE 2 so we don't specify the commodity in the query to avoid duplicate data
          if(filters.reporter && filters.commodity && !filters.partner) {
            data.query({
              reporter: filters.reporter,
              partner:  'all',
              year:   filters.year,
              commodity:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Bar chart with the top 20 export destinations in '+filters.year+' of '+localData.commodityCodes.get(filters.commodity).text+' for '+localData.reporterAreas.get(filters.reporter).text);
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
