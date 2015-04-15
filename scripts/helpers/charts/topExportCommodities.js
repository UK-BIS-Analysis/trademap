/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topExportCommodities chart
 * */


define(['../data', '../barchart', '../gui', '../controls'], function(data, barchart, gui, controls) {
  'use strict';

  var localData = data,
      $chart = $('#topExportCommodities'),
      $chartTitle = $chart.siblings('.chartTitle'),

      height = $chart.height(),
      width  = $chart.width(),
      svg = d3.select('#topExportCommodities')
        .append('svg')
        .attr('height', height)
        .attr('width', width),
      numEntries = 10,

      chart = {

        setup: function () {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);
          // Bind the resize function to the window resize event
          $(window).on('resize', function () {
            barchart.resizeSvg(svg, $chart.width());
          });
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
                partner:  0,
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
            title = 'Top commodities exported by '+localData.reporterAreas.get(filters.reporter).text+' to '+localData.partnerAreas.get(filters.partner).text+' in '+filters.year+'.';
            dataFilter.partner = +filters.partner;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            $chartTitle.html('');
            $chart.slideUp();
            return;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            $chartTitle.html('');
            $chart.slideUp();
            return;
          }

          $chartTitle.html(title);
          data.query(queryFilter, function queryCallback (err, ready) {
            if (err) { gui.showError(err); }
            if (err || !ready) { return; }
            // Get the data, update title, display panel and update chart
            var newData = localData.getData(dataFilter, numEntries);
            $chartTitle.html(title);
            $chart.slideDown(400, function () {
              barchart.draw(svg, newData, dataFilter);
            });
          });
        }
      };
  return chart;
});
