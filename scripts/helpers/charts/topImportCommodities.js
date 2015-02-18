/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topImportCommodities chart
 * */


define(['../data'], function(data) {
  'use strict';

  var localData = data,
      $chart = $('#topImportCommodities'),
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
                .html('Bar chart with top 20 import commodities in '+filters.year+' for '+localData.reporterAreas.get(filters.reporter).text+' from rest of the world.');
            });
            return;
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            data.query({
              reporter: filters.reporter,
              period:   'all',
              partner:  filters.partner,
              hsCode:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Bar chart with top 20 import commodities in '+filters.year+' for '+localData.reporterAreas.get(filters.reporter).text+' from '+localData.partnerAreas.get(filters.partner).text+'.');
            });
            return;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            $chart
              .slideUp()
              .children('.placeholder')
              .html('');
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
