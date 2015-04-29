/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE topExportDestinations chart
 * */


define(['../data', '../rowchart', '../gui', '../controls'], function(data, rowchart, gui, controls) {
  'use strict';

  var localData = data,
      $container = $('#topExportDestinations'),
      $chart = $container.children('.chart'),
      $chartTitle = $container.children('.chartTitle'),

      height = $chart.height(),
      width  = $chart.width(),
      svg = d3.select('#topExportDestinations .chart')
        .append('svg')
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr("version", 1.1)
        .classed('svgChart', true)
        .attr('height', height)
        .attr('width', width),
      numEntries = 10,

      chart = {

        setup: function () {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);
          // Bind the resize function to the window resize event
          $(window).on('resize', function () {
            rowchart.resizeSvg(svg, $chart.width());
          });
          // Setup the svg
          rowchart.setup(svg);
          // Hide on load
          $container.slideUp(0);
        },

        refresh: function (event, filters) {
          // CASE 1: reporter = null
          if(!filters.reporter) {
            $container.slideUp();
            return;
          }

          // We build a queryFilter and a dataFilter object to make API queries more generic than data queries
          var queryFilter = {
                reporter: +filters.reporter,
                partner:  'all',
                year:   filters.year,
                commodity:   'AG2',
                initiator: 'topExportDestinations'
              },
              dataFilter = {
                reporter: +filters.reporter,
                partner:  'all',
                year:   filters.year,
                commodity:   'AG2'
              },
              title = '';

          // Define flow
          dataFilter.flow = 2;

          // CASE 2: reporter = selected    commodity = null        partner = null
          if(filters.reporter && !filters.commodity && !filters.partner) {
            title = localData.lookup(filters.reporter, 'reporterAreas', 'text') + ' - Top-10 export markets for goods in ' + filters.year + '.';
            queryFilter.commodity = 'TOTAL';
            dataFilter.commodity = 'TOTAL';
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            $chartTitle.html('');
            $container.slideUp();
            return;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            $chartTitle.html('');
            $container.slideUp();
            return;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = null
          // This is already covered by the data in CASE 2 so we don't specify the commodity in the api query to avoid duplicate data and requests
          if(filters.reporter && filters.commodity && !filters.partner) {
            title = localData.lookup(filters.reporter, 'reporterAreas', 'text') + ' - Top-10 export markets for ' + localData.commodityName(filters.commodity) + ' in ' + filters.year + '.';
            queryFilter.commodity = filters.commodity;
            dataFilter.commodity = filters.commodity;
          }

          data.query(queryFilter, function queryCallback (err, ready) {
            if (err) { gui.showError(err); }
            if (err || !ready) { return; }
            // Get the data, update title, display panel and update chart
            var newData = localData.getData(dataFilter, numEntries);
            $chartTitle.html(title);
            $container.slideDown(400, function () {
              rowchart.draw(svg, newData, dataFilter, chart.colors[0][1]);
            });
          });
        }
      };
  return chart;
});
