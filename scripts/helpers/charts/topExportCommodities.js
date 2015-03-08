/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topExportCommodities chart
 * */


define(['../data', '../barchart'], function(data, barchart) {
  'use strict';

  var localData = data,
      $chart = $('#topExportCommodities'),

      height = $chart.height(),
      width  = $chart.width(),
      svg = d3.select('#topExportCommodities')
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
            title = 'Top commodities exported by '+localData.reporterAreas.get(filters.reporter).text + ' in '+filters.year;
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            title = 'Top commodities exported in '+filters.year+' by '+localData.reporterAreas.get(filters.reporter).text+' to '+localData.partnerAreas.get(filters.partner).text+'.';
            dataFilter.partner = +filters.partner;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            $chart.slideUp();
            return;
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
