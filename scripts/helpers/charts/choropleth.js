/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, topojson */


/*
 * THIS FILE MANAGES THE CHOROPLETH
 * */


define(['../data', '../controls'], function(data, controls) {
  'use strict';
  var localData = data,
      $chart = $('#choropleth'),
      svg = d3.select("#choropleth").append("svg"),
      colorScale = d3.scale.quantize()
        .range(d3.range(9).map(function(i) { return "q" + i + "-9"; })),




      chart = {




        setup: function () {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);

          // Some variables:
          var height = $chart.height(),
              width  = $chart.width(),
              projection = d3.geo.kavrayskiy7()
                .scale(210)
                .translate([(width / 2), (height / 2)+40])
                .precision(+'.1'),
              path = d3.geo.path()
                .projection(projection),
              graticule = d3.geo.graticule();

          svg.attr("width", width)
            .attr("height", height);

          // Define sphere boundary and graticule
          svg.append("defs").append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path);
          svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");
          svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");
          svg.append("path")
            .datum(graticule)
            .attr("class", "graticule")
            .attr("d", path);

          // Load the topojson data
          d3.json("data/world-50m.json", function(error, world) {
            // Genereate an array of countries with geometry and IDs (IDs are according to ISO_3166-1_numeric numbering)
            var countries = topojson.feature(world, world.objects.countries).features;

            // We place all countries inside a g.countries
            svg.append('g')
              .attr("class", "counties")
              // Bind country data to path.country
              .selectAll(".country")
              .data(countries)
              .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path)
                .attr('id', function(d) { return 'iso'+d.id; });

            // Add behaviour to country: on click we set the reporter filter
            svg.selectAll('.country').on('click', function (d,i) {
              var unCode = localData.countryByISONum.get(d.id).unCode;
              controls.changeFilters({reporter: unCode});
            });

          }); // Close d3.json callback
        },




        refresh: function (event, filters) {
          // CASE 1: reporter = null
          if(!filters.reporter) {
            // Blank choropleth, no countries selected and no fills and no title
            svg.selectAll('.country')
              .classed('selectedReporter selectedPartner', false)
              .style('fill', '#fff');
            $('#choroplethTitle').html('');
            return;
          }

          // CASE 2: reporter = selected
          data.query({
            reporter: +filters.reporter,
            period:   +filters.year,
            commodity:   'AG2'
          }, function queryCallback (err, data) {

            // Clear previous selections
            svg.selectAll('.country').classed('selectedReporter selectedPartner', false);

            // Highlight reporter and partner on map
            svg.select('#iso'+filters.reporter).classed('selectedReporter', true);
            if (filters.partner) { svg.select('#iso'+filters.partner).classed('selectedPartner', true); }

            // TODO Get the relevant data depending on presence of commodity
            if(!filters.commodity) {
              $('#choroplethTitle').html('Value of ' + filters.flow.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and every other country in  ' + filters.year + '.');
            } else {
              $('#choroplethTitle').html('Value of ' + filters.flow.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and every other country for ' + localData.commodityName(filters.commodity) + ' in ' + filters.year+'.');
            }

            // Update scale with range

            // Redraw map

            // (Re)draw legend

          });

        }

  };

  return chart;
});
