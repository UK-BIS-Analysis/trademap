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
      height = 1080,
      width  = 1920,
      svg = d3.select("#choropleth")
        .append("svg")
        .classed('choropleth', true)
        .classed('svgChart', true)
        .attr("version", 1.1)
        .attr("xmlns", "http://www.w3.org/2000/svg")
        .attr('id', 'choroplethSvg')
        .attr('viewBox', '0 0 '+width+' '+height)
        .attr('preserveAspectRatio', 'xMidYMid meet'),
      // Color schemes from http://colorbrewer2.org/
      // The number of colors will drive the scales below (e.g. if you put six colors there will be six shades in the scales)
      balanceColors = ['rgb(222, 98, 98)','rgb(116,196,118)'],// red/green
      importColors  = ['rgb(254,237,222)','rgb(253,190,133)','rgb(253,141,60)','rgb(230,85,13)','rgb(166,54,3)'],  // oranges
      exportColors  = ['rgb(237,248,233)','rgb(186,228,179)','rgb(116,196,118)','rgb(49,163,84)','rgb(0,109,44)'], // greens
      colors = [balanceColors, importColors, exportColors],




      chart = {




        setup: function (callback) {
          // Bind the refresh function to the refreshFilters event
          $chart.on('refreshFilters', this.refresh);

          // Some variables:
          var projection = d3.geo.kavrayskiy7()
                .scale(330)
                .translate([(width / 2)+50, (height / 2)])
                .precision(+'.1'),
              path = d3.geo.path()
                .projection(projection),
              resizeSvg = function () {
                svg.attr("width",  $chart.width())
                   .attr("height", $chart.height());
              };

          // Uncomment below and on line ~81 to have graticule
          // var graticule = d3.geo.graticule();

          // Sized the SVG and bind the resize function to the window resize event to make the map responsive
          resizeSvg();
          d3.select(window).on('resize', resizeSvg);

          // Define sphere boundary and graticule
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
          // Uncomment to have graticule
          // svg.append("path")
          //   .datum(graticule)
          //   .attr("class", "graticule")
          //   .attr("d", path);

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
            .on('mouseover', function (d,i) {
              // Update infobox
              chart._displayInfo({ partner: localData.countryByISONum.get(d.id).unCode });
//              chart._clearInfo();
//              try {
//                chart._displayInfo({ partner: localData.countryByISONum.get(d.id).unCode });
//              } catch (err) {
//                if (DEBUG) { console.log('No country in database by '+d.id+' isoCode.'); }
//              }
              // Bring country path node to the front (to display border highlighting better)
              svg.selectAll('.country').sort(function(a,b) { return (a.id === d.id) - (b.id === d.id); });
            })
            .on('mouseout', function (d,i) {
              chart._clearInfo();
            })
            .on('click', function (d,i) {
              d3.event.preventDefault();
              chart._displayInfo({ partner: localData.countryByISONum.get(d.id).unCode });
              $('#contextMenu .country').html(localData.countryByISONum.get(d.id).name);
              $('#contextMenu .setReporter a, #contextMenu .setPartner a').attr('data-uncode', localData.countryByISONum.get(d.id).unCode);
              $('#contextMenu').css({
                display: "block",
                left: d3.event.pageX,
                top: d3.event.pageY
              });
            });

          callback();

        },




        refresh: function (event, filters) {
          var dataFilter = {};

          // CASE 1: reporter = null    -->   Blank choropleth, no countries selected and no fills and no title
          if(!filters.reporter) {
            svg.selectAll('.country').style('fill', '#fff');
            $chartTitle.html('');
            return;
          }

          // CASE 2: reporter = selected    commodity = null
          if(filters.reporter && !filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all, commodity to total and ignoring flow)
            dataFilter = {
              reporter:   +filters.reporter,
              partner:    'all',
              commodity:  'TOTAL',
              year:       +filters.year,
              flow:       filters.flow
            };
            data.query(dataFilter, function queryCallback (err, ready) {
              if (err) { gui.showError(err); }
              if (err || !ready) { return; }
              // Redraw map and set title
              chart._redrawMap(dataFilter);
              $chartTitle.html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and the World in  ' + filters.year + '.');
            });
            return;
          }

          // CASE 3: reporter = selected    commodity = selected
          if(filters.reporter && filters.commodity) {
            // Set query and data retrieval filters (forcing partners to all and commodity to total)
            dataFilter = {
              reporter:   +filters.reporter,
              partner:    'all',
              commodity:  filters.commodity,
              year:       +filters.year,
              flow:       filters.flow
            };
            data.query(dataFilter, function queryCallback (err, ready) {
              if (err) { gui.showError(err); }
              if (err || !ready) { return; }
              // Redraw map and set title
              chart._redrawMap(dataFilter);
              $chartTitle.html('Value of ' + localData.flowByCode.get(filters.flow).text.toLowerCase() + ' between ' + localData.countryByUnNum.get(filters.reporter).name + ' and the World for ' + localData.commodityName(filters.commodity) + ' in ' + filters.year+'.');
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
          var flow = '';
          if (+filters.flow === 1) { flow = 'importVal'; }
          else if (+filters.flow === 2) { flow = 'exportVal'; }
          else { flow = 'balanceVal'; }

          // Create the colorScale depending on the flow: use a threshold scale for balance
          var colorScale;
          if (+filters.flow === 0) {
            colorScale = d3.scale.threshold()
              .domain([0])
              .range([0,1]);
          } else {
            colorScale = d3.scale.quantize()
              .domain(d3.extent(newData, function (d) { return +d[flow]; }))
              .range(d3.range(colors[+filters.flow].length));
          }

          // Color the paths on the choropleth
          svg.selectAll('.country')
            .classed('highlighted',false)
//            .on('mouseover', function (d,i) {
//              chart._clearInfo();
//              try {
//                var partner = localData.countryByISONum.get(d.id).unCode,
//                    datum = newDataByPartner.get(partner);
//                if (datum) { chart._displayInfo(datum); }
//                // Bring country path node to the front (to display border highlighting better)
//                svg.selectAll('.country').sort(function(a,b) { return (a.id === d.id) - (b.id === d.id);});
//              } catch (err) {}
//            })
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
          svg.select('#iso'+localData.countryByUnNum.get(filters.reporter).isoNumerical).classed('highlighted',true);

        },




        _drawLegend: function (scale, flow) {
          var $mapLegend = $('#mapLegend'),
              legendSvg = d3.select('#mapLegend svg'),
              currentColors = colors[flow],
              flowName = ['Balance', 'Imports', 'Exports'][flow];
          // Remove legend if present
          legendSvg.select('g.legend').remove();
          // Redraw legend
          var legend = legendSvg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate(0,20)');
          // Add legend title
          legend.append('text')
            .attr('class', 'title')
            .attr('x', 0)
            .attr('y', 0)
            .style('font-weight','bold')
            .text(flowName+' Legend');
          // Add no-data box & label
          legend.append('rect')
            .attr('class', 'noData')
            .attr('x', 0)
            .attr('y', 12)
            .attr('rx', 3)
            .attr('ry', 3)
            .attr('width', 18)
            .attr('height', 18)
            .style('fill', '#818181');
          legend.append('text')
            .attr('class', 'noData')
            .attr('x', 22)
            .attr('y', 25)
            .text('No data available');
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
            .attr('rx', 3)
            .attr('ry', 3)
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
              if (+flow === 0) {
                return ['Negative', 'Positive'][i];
              } else {
                var domainExtent = scale.invertExtent(i);
                return localData.numFormat(domainExtent[0]) + ' - ' + localData.numFormat(domainExtent[1]);
              }
            });

        },




        _displayInfo: function (info) {
          infoBox.displayHover();
//          var $infoBox = $('#choroplethInfo'),
//              partner = '',
//              reporter = '',
//              text = '';
//          if (info.partner) {
//            partner = localData.countryByUnNum.get(info.partner).name;
//            $infoBox.children('.countryName').html(partner);
//          }
//          if (info.partner && info.reporter) {
//            reporter = localData.countryByUnNum.get(info.reporter).name;
//            $infoBox.children('.countryName').html(reporter+' - '+partner);
//            if (info.commodity)    { $infoBox.children('.commodity').html(localData.commodityName(info.commodity)); }
//            if (info.importVal) {
//              text = '<dl class="dl-horizontal"><dt>Imports from '+partner+':</dt><dd>'+localData.numFormat(info.importVal);
//              if (info.importPc) { text = text + ' ('+info.importPc.toPrecision(2)+'% of '+reporter+' imports)'; }
//              text = text+'</dd></dl>';
//              $infoBox.children('.imports').html(text);
//            }
//            if (info.exportVal) {
//              text = '<dl class="dl-horizontal"><dt>Exports to '+partner+':</dt><dd>'+localData.numFormat(info.exportVal);
//              if (info.exportPc) { text = text + ' ('+info.exportPc.toPrecision(2)+'% of '+reporter+' exports)'; }
//              text = text + '</dd></dl>';
//              $infoBox.children('.exports').html(text);
//            }
//            if (info.balanceVal)   { $infoBox.children('.balance').html('<dl class="dl-horizontal"><dt>Trade balance:</dt><dd>'+localData.numFormat(info.balanceVal)+'</dd></dl>'); }
//            if (info.bilateralVal) { $infoBox.children('.bilateralTrade').html('<dl class="dl-horizontal"><dt>Bilateral trade:</dt><dd>'+localData.numFormat(info.bilateralVal)+'</dd></dl>'); }
//            if (info.importRank && info.exportRank) {
//              text = partner+' is the '+localData.numOrdinal(info.exportRank)+' export destination and the '+localData.numOrdinal(info.importRank)+' import source for '+reporter;
//              if (info.commodity !== 'TOTAL') { text = text + ' in ' + localData.commodityName(info.commodity); }
//              $infoBox.children('.ranking').html(text);
//            }
//          }
//          if (!info.reporter && !info.partner) {
//            $infoBox.children('.value').html('');
//          }
        },

        _clearInfo: function () {
          infoBox.displayDefault();
          //$('#choroplethInfo .value').html('');
        }
  };

  return chart;
});
