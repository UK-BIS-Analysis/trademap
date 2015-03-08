/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE PROVIDES LOGIC TO SETUP AND DRAW BAR CHARTS
 * (so that we don't have to repeat the code for each bar chart)
 * */


define(['./data', './controls'], function(data, controls) {
  'use strict';

  var localData = data,
      margin = {top: 25, right: 15, bottom: 30, left: 70},
      innerHeight = 0,
      innerWidth = 0,
      tip = d3.tip()
        .attr('class', 'd3-tip')
        .offset([-10, 0])
        .html(function(d) {
          if (d.commodity !== 'TOTAL' && d.partner === 0) {
            // top commodities chart
            return localData.commodityName(d.commodity)+' '+['imports', 'exports'][d.flow-1]+': '+localData.numFormat(d.value)+' in '+d.year+': '+'.';
          } else {
            // top partner chart
            return localData.countryByUnNum.get(d.partner).name+' '+['imports', 'exports'][d.flow-1]+': '+localData.numFormat(d.value)+' in '+d.year+'.';
          }
        }),

      barchart = {

        setup: function (svg) {

          // Set internal graph dimensions
          innerHeight = svg.attr('height') - margin.top - margin.bottom;
          innerWidth = svg.attr('width') - margin.left - margin.right;

          // Setup initial scales and draw axises
          var xScale = d3.scale.linear()
                .range([0, innerWidth])
                .clamp(true),
              yScale = d3.scale.linear()
                .range([innerHeight, 0]),
              xAxis  = d3.svg.axis()
                .scale(xScale)
                .orient('bottom'),
              yAxis  = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(6)
                .tickFormat(localData.numFormat);
          svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+margin.left+',' + (margin.top+innerHeight) + ')')
            .call(xAxis);
          svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate('+margin.left+',' + margin.top + ')')
            .call(yAxis);
          svg.append('g')
            .attr('class', 'yGrid')
            .attr('transform', 'translate('+margin.left+',' + margin.top + ')');
          svg.append('g')
            .attr('class', 'bars')
            .attr('transform', 'translate('+margin.left+',' + margin.top + ')');

        },

        draw: function (svg, newData) {
          // Sort data descending
          newData.sort(function(a, b) { return a.value - b.value; });

          // Setup scales & axises
          var xScale = d3.scale.linear()
                .range([0, innerWidth])
                .domain([0, newData.length])
                .clamp(true),
              yScale = d3.scale.linear()
                .range([innerHeight, 0])
                .domain(d3.extent(newData, function (d) { return d.value; })),
              xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickValues(d3.range(0, newData.length))
                .tickSize(6, 0),
              yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(6)
                .tickSize(6, 0)
                .tickFormat(localData.numFormat),
              barWidth = innerWidth / newData.length;

          // Update axises & grids
          svg.select('.x.axis') // change the x axis
            .transition()
            .call(xAxis);
          svg.select('.y.axis') // change the y axis
            .transition()
            .call(yAxis);
          svg.select('.yGrid')
            .html('')
            .call(yAxis.tickSize(-innerWidth, 0, 0).tickFormat(''));

          // Enter-update-exit bars
          var bars = svg.select('.bars').selectAll('.bar')
            .data(newData);
          bars.enter()
            .append('rect')
            .attr('class', 'bar')
            .attr('width', function (d,i) { return 10; })
            .attr('height', function (d,i) { return 10; })
            .style("stroke-width", '0')
            .on('mouseover', function (d) {
              d3.select(this)
                .interrupt()
                .transition()
                .style('opacity','0.8');
              tip.show(d);
            })
            .on('mouseout', function (d) {
              d3.select(this)
                .interrupt()
                .transition()
                .style('opacity','1');
              tip.hide(d);
            })
            .on('click', function (d) {
              console.log('Update filters!');
              console.log(d);
              //controls.changeFilters({ year: d.year });
            });
          // Update bars
          bars.transition()
            .attr('x', function (d,i) { return xScale(i)+3; })
            .attr('y', function (d,i) { return innerHeight-yScale(+d.value); })
            .attr('width', function (d,i) { return barWidth-6; })
            .attr('height', function (d,i) { return yScale(+d.value); });
          // Remove unneeded bars
          bars.exit().remove();

          // Add tooltip functions
          bars.call(tip);

          // TODO append text

        }

      };

  return barchart;
});
