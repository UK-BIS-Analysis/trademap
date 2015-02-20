/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE yearChart chart
 * */


define(['../data'], function(data) {
  'use strict';

  var localData = data,
      $chart = $('#yearChart'),
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
              reporter: +filters.reporter,
              year:   'all',
              partner:  0,
              commodity:   'TOTAL'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Line chart with total import, export and balance values between 1993-2013 between '+localData.reporterAreas.get(filters.reporter).text+' and the rest of the world.');
            });
            return;
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            data.query({
              reporter: +filters.reporter,
              year:   'all',
              partner:  +filters.partner,
              commodity:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Line chart with total import, export and balance values between 1993-2013 between '+localData.reporterAreas.get(filters.reporter).text+' and '+localData.partnerAreas.get(filters.partner).text+'.');
            });
            return;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            data.query({
              reporter: +filters.reporter,
              year:   'all',
              partner:  0,
              commodity:   filters.commodity
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Line chart with total import, export and balance values of '+localData.commodityCodes.get(filters.commodity).text+' between 1993-2013 between '+localData.reporterAreas.get(filters.reporter).text+' and the rest of the world.');
            });
            return;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = selected
          // This is already covered by the data in CASE 3 so we don't specify the commodity in the query to avoid duplicate data
          if(filters.reporter && filters.commodity && filters.partner) {
            data.query({
              reporter: +filters.reporter,
              year:   'all',
              partner:  +filters.partner,
              commodity:   'AG2'
            }, function queryCallback (err, data) {
              // TODO: do something here
              $chart
                .slideDown()
                .children('.placeholder')
                .html('Line chart with total import, export and balance values of '+localData.commodityCodes.get(filters.commodity).text+' between 1993-2013 between '+localData.reporterAreas.get(filters.reporter).text+' and '+localData.partnerAreas.get(filters.partner).text+'.');
            });
            return;
          }
        }

  };

  return chart;
});
