/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, topojson */


/*
 * THIS FILE MANAGES THE CHOROPLETH
 * */


define(['../data', '../gui', './infoBox', '../controls'], function(data, gui, infoBox, controls) {
  'use strict';
  var localData = data,
      $chart = $('#choropleth'),
      $chartTitle = $('#choroplethTitle .chartTitle'),

      // A holder for current filters
      currentFilters = {},

      // SVG main properties
      height = 720,
      width  = 1280,
      svg = d3.select("#choropleth .chart")
        .append("svg")
        .classed('choropleth', true)
        .classed('svgChart', true)
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr('id', 'choroplethSvg')
        .attr('viewBox', '0 0 '+width+' '+height)
        .attr('preserveAspectRatio', 'xMidYMid meet'),

      chart = {




        setup: function (callback) {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);

          // Some utility functions:
          var projection = d3.geo.kavrayskiy7()
                .scale(230)
                .translate([(width / 2)+50, (height / 2)])
                .precision(+'.1'),
              path = d3.geo.path()
                .projection(projection),
              resizeSvg = function () {
                svg.attr("width",  $chart.width())
                   .attr("height", $chart.height());
              };

          // Sized the SVG and bind the resize function to the window resize event to make the map responsive
          resizeSvg();
          d3.select(window).on('resize', resizeSvg);

          // Define sphere boundary
          svg.append("defs").append("path")
            .datum({type: "Sphere"})
            .attr("id", "sphere")
            .attr("d", path)
            .attr('stroke', '#054D82')
            .attr('stroke-width', '1.5px')
            .attr('fill', 'none');
          svg.append("use")
            .attr("class", "stroke")
            .attr("xlink:href", "#sphere");
          svg.append("use")
            .attr("class", "fill")
            .attr("xlink:href", "#sphere");

          // Genereate an array of countries with geometry and IDs (IDs are according to ISO_3166-1_numeric numbering)
          var countries = topojson.feature(data.worldJson, data.worldJson.objects.countries).features;

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
            .on('click', function (d,i) {
              // Show context menu
              d3.event.preventDefault();
              $('#contextMenu .country').html(localData.lookup(d.id, 'countryByISONum', 'name'));
              $('#contextMenu .setReporter a, #contextMenu .setPartner a').attr('data-uncode', localData.lookup(d.id, 'countryByISONum', 'unCode'));
              $('#closeContextMenu').on('click', function (e) {
                e.preventDefault();
                infoBox.hideHover();
              });
              $('#contextMenu').css({
                display: "block",
                left: d3.event.pageX,
                top: d3.event.pageY
              });
            });

          callback();

        },




        refresh: function (event, filters) {
          var queryFilter = {
                reporter:   +filters.reporter,
                partner:    'all',
                year:       +filters.year,
                initiator: 'choropleth'
              },
              dataFilter = {
                reporter:   +filters.reporter,
                partner:    'all',
                year:       +filters.year,
                flow:       +filters.flow
              },
              title = '';

          // CASE 1: reporter = null    -->   Blank choropleth, no countries selected and no fills and no title
          if(!filters.reporter) {
            svg.selectAll('.country').style('fill', '#fff');
            svg.selectAll('.highlighted').classed('highlighted', false);
            $chartTitle.html('');
            return;
          }

          // CASE 2&3: reporter = selected    commodity = null
          if(filters.reporter && !filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all, commodity to total and ignoring flow)
            queryFilter.commodity = 'TOTAL';
            dataFilter.commodity =  'TOTAL';
            title = localData.lookup(filters.reporter, 'countryByUnNum', 'name') + [' trade in goods balance ', ' imports of goods ', ' exports of goods '][filters.flow] + ' in ' + filters.year;
          }

          // CASE 4&5: reporter = selected    commodity = selected
          if(filters.reporter && filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all and commodity to total)
            queryFilter.commodity = filters.commodity;
            dataFilter.commodity = filters.commodity;
            title = localData.lookup(filters.reporter, 'countryByUnNum', 'name') + [' trade in ' + localData.commodityName(filters.commodity) + ' balance ', ' imports of ' + localData.commodityName(filters.commodity) + ' ', ' exports of ' + localData.commodityName(filters.commodity) + ' '][filters.flow] + ' in ' + filters.year;
          }

          data.query(queryFilter, function queryCallback (err, ready) {
              if (err) { gui.showError(err); }
              if (err || !ready) { return; }
              // Redraw map and set title
              chart._redrawMap(dataFilter);
              $chartTitle.html(title);
            });
        },




        _redrawMap: function (filters) {
          // Based on user selected flow predefine value accessor
          var flowRank, flowVal;
          if (+filters.flow === 1) { flowRank = 'importRank'; flowVal = 'importVal'; }
          if (+filters.flow === 2) { flowRank = 'exportRank'; flowVal = 'exportVal'; }
          if (+filters.flow === 0) { flowRank = 'balanceVal'; flowVal = 'balanceVal';}

          // Get the relevant data for both flows and then combine the data
          var newData = localData.getData({ reporter: filters.reporter, commodity: filters.commodity, year: +filters.year });
          newData = localData.combineData(newData);

          // Filter out records that relate to partner: 0 (world) which would distort the scale
          // as well as records that don't have data for the current flow
          newData = newData.filter(function (d) {
            return d[flowRank] && d[flowVal] && d.partner !== 0;
          });

          // Create a lookup object to access by partner and also store count
          var newDataByPartner = d3.map(newData, function (d) { return d.partner; }),
              count = newData.length;

          // Create the colorScale depending on the flow
          var colorScale = d3.scale.threshold(),
              domain, range;
          if (+filters.flow === 0) {
            // If flow is balance we create a threshold scale which has only two cases positive (above 0 threshold) and negative (below 0 threshold)
            colorScale.domain([0]).range([0,1]);
          } else {
            // For import and export e have slightly different scales depending on how many countries we have data for
            if (count > 25) { // Quartiles plus top 3
              domain = [4, count/4, count/2, count*3/4];
              range = [4,3,2,1,0];
            }
            if (count <= 25 && count > 4) { // Simple quartiles
              domain = [count/4, count/2, count*3/4];
              range = [3,2,1,0];
            }
            if (count <= 4) { // No scale, all countries in a single bucket
              domain = [count];
              range = [0];
            }
            colorScale = d3.scale.threshold().domain(domain).range(range);
          }

          // Color the paths on the choropleth
          svg.selectAll('.country')
            .classed('highlighted',false)
            // Assign behaviours to hover over country
            .on('mouseenter', function (d,i) {
              try {
                var partner = localData.countryByISONum.get(d.id).unCode,
                    partnerDetails = newDataByPartner.get(partner);
                if (partnerDetails) {
                  infoBox.displayHover(partnerDetails);
                } else {
                  // DisplayHover with no data but include country name
                  infoBox.displayHover(false, partner);
                }
                // Bring country path node to the front (to display border highlighting better)
                svg.selectAll('.country').sort(function(a,b) { return (a.id === d.id) - (b.id === d.id);});
              } catch (err) {
                // DisplayHover with no data
                infoBox.displayHover(false);
                if (DEBUG) { console.log('No country in database by '+d.id+' isoCode.'); }
              }
            })
            .on('mouseleave', function (d,i) {
              infoBox.hideHover();
            })
            // Apply coloring
            .transition()
            .duration(1000)
            .style('fill', function (d,i) {
              var unCodes = localData.areasByISONum(d.id),
                  countryData = [],
                  bucket = 0;
              try {
                unCodes.forEach(function (el) {
                  var datum = newDataByPartner.get(el.unCode);
                  if (datum) countryData.push(newDataByPartner.get(el.unCode));
                });
                if (countryData.length === 0) { throw 'No data points for ' + localData.lookup(d.id, 'countryByUnNum', 'name'); }
                if (countryData.length > 1)   { throw 'Multiple data points for ' + localData.lookup(d.id, 'countryByUnNum', 'name'); }
                if (countryData[0][flowRank] === null) { throw 'Incomplete data for ' + localData.lookup(d.id, 'countryByUnNum', 'name'); }
                bucket = colorScale(countryData[0][flowRank]);
                return chart.colors[filters.flow][bucket];
              } catch (exception) {
                if (DEBUG) { console.log(exception); }
                return '#818181';
              }
            });

          // Prepare data for the legend and (Re)draw it
          var legendData = d3.nest()
                .key(function (d) {
                  return colorScale(d[flowRank]);
                })
                .rollup(function(values) {
                  return {
                    min: d3.min(values, function (v) { return v[flowVal]; }),
                    max: d3.max(values, function (v) { return v[flowVal]; }),
                    count: values.length
                  };
                })
                .entries(newData);
          chart._drawLegend(legendData, filters.flow);

          // Highlight reporter on map
          svg.select('#iso'+localData.lookup(filters.reporter, 'countryByUnNum', 'isoNumerical')).classed('highlighted',true);
        },




        _drawLegend: function (legendData, flow) {
          var legendSvg = d3.select('#mapLegend svg'),
              rectHeight = 30,
              padding = 5,
              // Cut the colors array to the length of out legend
              currentColors = chart.colors[flow].slice(0, legendData.length),
              flowName = ['Balance', 'Imports', 'Exports'][flow],
              totalPartners = legendData.reduce(function (prev, curr, i, arr) {
                return prev+curr.values.count;
              }, 0);

          legendSvg
            .attr('height', (legendData.length+1)*(rectHeight+padding)+25)
            .attr('width', 225);

          // Remove legend & title if present
          legendSvg.select('g.legend').remove();
          legendSvg.select('text.title').remove();

          // Make title
          legendSvg.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 18)
            .style('font-weight','bold')
            .text(flowName+' Legend');

          // Redraw legend
          var legend = legendSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(0,25)');
          // Add no-data box & label
          legend.append('rect')
            .attr('class', 'noData')
            .attr('x', 0).attr('y', 0)
            .attr('rx', 1).attr('ry', 1)
            .attr('width', 8).attr('height', 15)
            .style('fill', '#818181');
          legend.append('text')
            .attr('class', 'noData')
            .attr('x', 12).attr('y', 13)
            .text('No data available');
          // Add scale boxes
          legend = legend.append('g')
            .attr('class', 'scale')
            .attr('transform', 'translate(0,18)');
          legend.selectAll('rect')
            .data(d3.range(currentColors.length))
            .enter()
            .append('rect')
            .attr('x', 0)
            .attr('y', function (d, i) { return i * 33; })
            .attr('rx', 1)
            .attr('ry', 1)
            .attr('width', 8)
            .attr('height', 30)
            .style('fill', function(d, i) { return currentColors[i]; });
          // Add text
          var texts = legend.selectAll('text')
            .data(d3.range(currentColors.length))
            .enter()
            .append('text')
            .attr('y', function (d, i) { return i * 33 + 14; });
          texts.append('tspan')
            .attr('class', 'line1')
            .attr('x', 12)
            .text(function (d,i) {
              if (+flow > 0) {
                return localData.numFormat(legendData[i].values.min, null, 1) + ' - ' + localData.numFormat(legendData[i].values.max, null, 1) + ' (' + legendData[i].values.count + ' partners)';
              }
            });
          texts.append('tspan')
            .attr('class', 'line1')
            .attr('x', 12)
            .attr('dy', 15)
            .text(function (d,i) {
              if (+flow === 0) {
                return ['Deficit', 'Surplus'][i] + ' (' + legendData[i].values.count + ' partners)';
              } else {
                var returnTxt = '';
                switch (i) {
                  case 0:
                    if (totalPartners < 4) {
                      returnTxt = 'Not enough data to map';
                    } else {
                      returnTxt = 'Up to 25th percentile';
                    }
                    break;
                  case 1:
                    returnTxt = '25th to 50th percentile';
                    break;
                  case 2:
                    returnTxt = '50th to 75th percentile';
                    break;
                  case 3:
                    returnTxt = 'Above 75th percentile';
                    break;
                  case 4:
                    var topPercentile = (3/totalPartners)*100;
                    returnTxt = 'Top 3 - above ' + topPercentile.toFixed(1) + ' percentile';
                    break;
                }
                return returnTxt;
              }
            });

        }




  };

  return chart;
});
