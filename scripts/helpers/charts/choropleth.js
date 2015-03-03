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
      colorScale = d3.scale.quantize().range(d3.range(9)),
      // Color schemes from http://colorbrewer2.org/
      blues = ['rgb(247,251,255)','rgb(222,235,247)','rgb(198,219,239)','rgb(158,202,225)','rgb(107,174,214)','rgb(66,146,198)','rgb(33,113,181)','rgb(8,81,156)','rgb(8,48,107)'],
      greens = ['rgb(247,252,245)','rgb(229,245,224)','rgb(199,233,192)','rgb(161,217,155)','rgb(116,196,118)','rgb(65,171,93)','rgb(35,139,69)','rgb(0,109,44)','rgb(0,68,27)'],
      oranges = ['rgb(255,245,235)','rgb(254,230,206)','rgb(253,208,162)','rgb(253,174,107)','rgb(253,141,60)','rgb(241,105,19)','rgb(217,72,1)','rgb(166,54,3)','rgb(127,39,4)'],
      colors = [blues, oranges, greens],




      chart = {




        setup: function () {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);

          // Some variables:
          var height = $chart.height(),
              width  = $chart.width(),
              projection = d3.geo.kavrayskiy7()
                .scale(210)
                .translate([(width / 2)+70, (height / 2)+40])
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
                .attr('id', function(d) { return 'iso'+d.id; })
                .on('mouseover', function (d,i) {
                  chart._clearInfo();
                  chart._displayInfo({ partner: localData.countryByISONum.get(d.id).unCode });
                });

            // Add behaviour to country: on click we set the reporter filter
            svg.selectAll('.country').on('click', function (d,i) {
                var unCode = localData.countryByISONum.get(d.id).unCode;
                controls.changeFilters({reporter: unCode});
              });

          }); // Close d3.json callback
        },




        refresh: function (event, filters) {
          // CASE 1: reporter = null    -->   Blank choropleth, no countries selected and no fills and no title
          if(!filters.reporter) {
            svg.selectAll('.country').style('fill', '#fff');
            $('#choroplethTitle').html('');
            return;
          }

          // CASE 2: reporter = selected    commodity = null
          if(filters.reporter && !filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all, commodity to total and ignoring flow)
            var dataFilter = {
              reporter:   +filters.reporter,
              partner:    'all',
              commodity:  'TOTAL',
              year:       +filters.year,
              flow:       filters.flow
            };
            data.query(dataFilter, function queryCallback (err, data) {
              // Redraw map and set title
              chart._redrawMap(dataFilter);
              $('#choroplethTitle p').html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and every other country in  ' + filters.year + '.');
            });
            return;
          }

          // CASE 3: reporter = selected    commodity = selected
          if(filters.reporter && filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all and commodity to total)
            var dataFilter = {
              reporter:   +filters.reporter,
              partner:    'all',
              commodity:  filters.commodity,
              year:       +filters.year,
              flow:       filters.flow
            };
            data.query(dataFilter, function queryCallback (err, data) {
              // Redraw map and set title
              chart._redrawMap(dataFilter);
              $('#choroplethTitle p').html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and every other country for ' + localData.commodityName(filters.commodity) + ' in ' + filters.year+'.');
            });
            return;
          }
        },




        _redrawMap: function (filters) {

          // Get the relevant data ignoring flow and then combine the data
          var newData = localData.getData({ reporter: filters.reporter, partner: filters.partner, commodity: filters.commodity, year: filters.year });
          newData = localData.combineData(newData);
          // Create map (lookup object) to access by partner
          var newDataByPartner = d3.map(newData, function (d) { return d.partner; });
          // Based on user selected flow predefine value accessor
          if (+filters.flow == 1) { var flow = 'importVal'; }
          else if (+filters.flow == 2) { var flow = 'exportVal'; }
          else { var flow = 'balanceVal'; }


          // Update scale with domain and redraw map
          colorScale.domain(d3.extent(newData, function (d) { return +d[flow]; }));
          svg.selectAll('.country')
            .on('mouseover', function (d,i) {
              var partner = localData.countryByISONum.get(d.id).unCode,
                  datum = newDataByPartner.get(partner);
              if (datum) { chart._displayInfo(datum); }
            })
            .transition()
            .duration(1000)
            .style('fill', function (d,i) {
              try {
                var unCode = localData.countryByISONum.get(d.id).unCode,
                    countryData  = newDataByPartner.get(unCode),
                    bucket = colorScale(countryData[flow]);
                return colors[filters.flow][bucket];
              } catch (exception) {
                return '#fff';
              }
            });

          // (Re)draw legend
          chart._drawLegend(colorScale, colors[filters.flow]);

          // Clear info
          $('#choroplethInfo .value').html('');

          // Highlight reporter on map
          svg.select('#iso'+filters.reporter).transition().style('fill','#2C699E', 'important');

        },




        _drawLegend: function (scale, currentColors) {
          var legend = svg.select('g.legend');
          // Remove legend if present
          svg.select('g.legend').remove()
          // Redraw legend
          legend = svg.append("g")
            .attr("class", "legend")
            .attr("x", 25)
            .attr("y", 35)
            .attr("height", 100)
            .attr("width", 100);
          // Add boxes
          legend.selectAll('rect')
            .data(d3.range(9))
            .enter()
            .append("rect")
            .attr("x", 0)
            .attr("y", function (d, i) { return i * 20; })
            .attr("width", 18)
            .attr("height", 18)
            .style("fill", function(d, i) { return currentColors[i]; });
          // Add text
          legend.selectAll('text')
            .data(d3.range(9))
            .enter()
            .append("text")
            .attr("x", 22)
            .attr("y", function (d, i) { return (i * 20)+15; })
            .text(function (d,i) {
              var domainExtent = scale.invertExtent(i);
              return localData.numFormat(Math.round(domainExtent[0]/1000000,1)) + 'm - ' + localData.numFormat(Math.round(domainExtent[1]/1000000,1))+'m';
            });

        },

        _displayInfo: function (info) {
          var $inf = $('#choroplethInfo');
          if (info.partner) {
            var partner = localData.countryByUnNum.get(info.partner).name;
            $inf.children('.countryName').html(partner);
          }
          if (info.partner && info.reporter) {
            var reporter = localData.countryByUnNum.get(info.reporter).name;
            $inf.children('.countryName').html(reporter+' - '+partner);
            if (info.commodity)    { $inf.children('.commodity').html(localData.commodityName(info.commodity)); }
            if (info.importVal)    { $inf.children('.imports').html('Imports from '+partner+': '+localData.numFormat(info.importVal)); }
            if (info.exportVal)    { $inf.children('.exports').html('Exports to '+partner+': '+localData.numFormat(info.exportVal)); }
            if (info.balanceVal)   { $inf.children('.balance').html('Trade balance: '+localData.numFormat(info.balanceVal)); }
            if (info.bilateralVal) { $inf.children('.bilateralTrade').html('Bilateral trade: '+localData.numFormat(info.bilateralVal)); }
            if (info.importRank && info.exportRank) { $inf.children('.ranking').html(partner+' is the '+localData.numOrdinal(info.exportRank)+' export destination and the '+localData.numOrdinal(info.importRank)+' import source for '+reporter); }
          }
        },

        _clearInfo: function () {
          $('#choroplethInfo .value').html('');
        }
  };

  return chart;
});
