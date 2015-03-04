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
      colorScale = d3.scale.quantize().range(d3.range(5)),
      // Color schemes from http://colorbrewer2.org/
      blues = ['rgb(239,243,255)','rgb(189,215,231)','rgb(107,174,214)','rgb(49,130,189)','rgb(8,81,156)'],
      greens = ['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)'],
      oranges = ['rgb(254,237,222)','rgb(253,190,133)','rgb(253,141,60)','rgb(230,85,13)','rgb(166,54,3)'],
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
              .attr("class", "countries")
              // Bind country data to path.country
              .selectAll(".country")
              .data(countries)
              .enter()
                .append("path")
                .attr("class", "country")
                .attr("d", path)
                .attr('id', function(d) { return 'iso'+d.id; })
                .on('mouseover', function (d,i) {
                  // Update infobox
                  chart._clearInfo();
                  chart._displayInfo({ partner: localData.countryByISONum.get(d.id).unCode });
                  // Bring country path node to the front (to display border highlighting better)
                  svg.selectAll('.country').sort(function(a,b) { var s = d.id; return (a.id == s) - (b.id == s);})
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
              $('#choroplethTitle p').html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and the World in  ' + filters.year + '.');
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
              $('#choroplethTitle p').html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and the World for ' + localData.commodityName(filters.commodity) + ' in ' + filters.year+'.');
            });
            return;
          }
        },




        _redrawMap: function (filters) {

          // Get the relevant data for both flows and then combine the data
          var newData = localData.getData({ reporter: filters.reporter, commodity: filters.commodity, year: filters.year });
          newData = localData.combineData(newData);

          // Create a lookup object to access by partner
          var newDataByPartner = d3.map(newData, function (d) { return d.partner; });

          // Based on user selected flow predefine value accessor
          if (+filters.flow == 1) { var flow = 'importVal'; }
          else if (+filters.flow == 2) { var flow = 'exportVal'; }
          else { var flow = 'balanceVal'; }

          // TODO if flow == 0 then treat the colorscale differently (one color for positive and one for negative)
          // Update scale with domain and redraw map
          colorScale.domain(d3.extent(newData, function (d) { return +d[flow]; }));
          svg.selectAll('.country')
            .on('mouseover', function (d,i) {
              chart._clearInfo();
              var partner = localData.countryByISONum.get(d.id).unCode,
                  datum = newDataByPartner.get(partner);
              if (datum) { chart._displayInfo(datum); }
              // Bring country path node to the front (to display border highlighting better)
              svg.selectAll('.country').sort(function(a,b) { var s = d.id; return (a.id == s) - (b.id == s);})
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
                return '#818181';
              }
            });

          // (Re)draw legend
          chart._drawLegend(colorScale, filters.flow);

          // Clear info
          $('#choroplethInfo .value').html('');

          // Highlight reporter on map
          svg.select('#iso'+filters.reporter).transition().style('fill','#2C699E', 'important');

        },




        _drawLegend: function (scale, flow) {
          var currentColors = colors[flow],
              flowName = ['Balance', 'Imports', 'Exports'][flow];
          // Remove legend if present
          svg.select('g.legend').remove()
          // Redraw legend
          var legend = svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(5,20)');
          // Add legend title
          legend.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 0)
            .style('font-weight','bold')
            .text(flowName);
          // Add no-data box & label
          legend.append('rect')
            .attr('class', 'noData')
            .attr('x', 0)
            .attr('y', 12)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', '#818181');
          legend.append('text')
            .attr('class', 'noData')
            .attr('x', 22)
            .attr('y', 25)
            .text('No data available')
          // Add scale boxes
          legend = legend.append('g')
            .attr('class', 'scale')
            .attr('transform', 'translate(0,33)');
          legend.selectAll('rect')
            .data(d3.range(currentColors.length))
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', function (d, i) { return i * 20; })
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', function(d, i) { return currentColors[i]; });
          // Add text
          legend.selectAll('text')
            .data(d3.range(currentColors.length))
            .enter()
            .append('text')
            .attr('x', 22)
            .attr('y', function (d, i) { return i * 20 +15; })
            .text(function (d,i) {
              var domainExtent = scale.invertExtent(i);
              return localData.numFormat(domainExtent[0]) + ' - ' + localData.numFormat(domainExtent[1]);
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
            if (info.importVal) {
              var text = '<dl class="dl-horizontal"><dt>Imports from '+partner+':</dt><dd>'+localData.numFormat(info.importVal);
              if (info.importPc) { text = text + ' ('+info.importPc.toPrecision(2)+'% of '+reporter+' imports)' }
              text = text+'</dd></dl>';
              $inf.children('.imports').html(text);
            }
            if (info.exportVal) {
              var text = '<dl class="dl-horizontal"><dt>Exports to '+partner+':</dt><dd>'+localData.numFormat(info.exportVal);
              if (info.exportPc) { text = text + ' ('+info.exportPc.toPrecision(2)+'% of '+reporter+' exports)' }
              text = text + '</dd></dl>';
              $inf.children('.exports').html(text);
            }
            if (info.balanceVal)   { $inf.children('.balance').html('<dl class="dl-horizontal"><dt>Trade balance:</dt><dd>'+localData.numFormat(info.balanceVal)+'</dd></dl>'); }
            if (info.bilateralVal) { $inf.children('.bilateralTrade').html('<dl class="dl-horizontal"><dt>Bilateral trade:</dt><dd>'+localData.numFormat(info.bilateralVal)+'</dd></dl>'); }
            if (info.importRank && info.exportRank) {
              var text = partner+' is the '+localData.numOrdinal(info.exportRank)+' export destination and the '+localData.numOrdinal(info.importRank)+' import source for '+reporter;
              if (info.commodity != 'TOTAL') { text = text + ' in ' + localData.commodityName(info.commodity); }
              $inf.children('.ranking').html(text);
            }
          }
        },

        _clearInfo: function () {
          $('#choroplethInfo .value').html('');
        }
  };

  return chart;
});
