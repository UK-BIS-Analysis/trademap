/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topExportDestinations chart
 * */


define(['../data', '../barchart'], function(data, barchart) {
  'use strict';

  var localData = data,
      $chart = $('#topExportDestinations'),

      height = $chart.height(),
      width  = $chart.width(),
      svg = d3.select('#topExportDestinations')
        .append('svg')
        .attr('height', height)
        .attr('width', width),

      chart = {

        setup: function () {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);
          // Setup the svg
          barchart.setup(svg);
          // Hide on load
          $chart.slideUp(0);
        },

        refresh: function (event, filters) {
          // CASE 1: reporter = null
          if(!filters.reporter) {
            $chart.slideUp();
            return;
          }

          // We build a queryFilter and a dataFilter object to make API queries more generic than data queries
          var queryFilter = {
                reporter: +filters.reporter,
                partner:  'all',
                year:   filters.year,
                commodity:   'AG2'
              },
              dataFilter = queryFilter,
              title = '';

          // Define flow
          dataFilter.flow = 2;

          // CASE 2: reporter = selected    commodity = null        partner = null
          if(filters.reporter && !filters.commodity && !filters.partner) {
            title = 'Top export destinations for '+localData.reporterAreas.get(filters.reporter).text+'in '+filters.year+';
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            $chart.slideUp();
            return;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          // This is already covered by the data in CASE 2 so we don't specify the commodity in the api query to avoid duplicate data and requests
          if(filters.reporter && filters.commodity && !filters.partner) {
            title = 'Top export destinations of '+localData.commodityCodes.get(filters.commodity).text+' for '+localData.reporterAreas.get(filters.reporter).text+'in '+filters.year;
            dataFilter.commodity = filters.commodity;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            $chart.slideUp();
            return;
          }

          data.query(queryFilter, function queryCallback (err, data) {
            if (err) { console.log(err); }
            if (err || !ready) { return; }
            // Get the data, update title, display panel and update chart
            var newData = localData.getData(dataFilter);
            $chart.children('.chartTitle').html(title);
            $chart.slideDown(400, function () {
              barchart.draw(svg, newData);
            });
          });
        }
      };
  return chart;
});
