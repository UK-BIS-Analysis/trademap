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
          if (d.commodity !== 'TOTAL') {
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
          // Setup scales & axises
          var xScale = d3.scale.linear()
                .range([0, innerWidth])
                .domain([0, newData.length])
                .clamp(true),
              yScale = d3.scale.linear()
                .range([innerHeight,0])
                .domain([0, d3.max(newData, function (d) { return d.value; })]),
              xAxis = d3.svg.axis()
                .scale(xScale)
                .orient('bottom')
                .tickValues(d3.range(0, newData.length))
                .tickSize(0, 0)
                .tickFormat(''),
              yAxis = d3.svg.axis()
                .scale(yScale)
                .orient('left')
                .ticks(6)
                .tickSize(6, 0)
                .tickFormat(localData.numFormat),
              barPadding = 6,
              barWidth = (innerWidth / newData.length) - barPadding;

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

          // Enter groups and bars
          var groups = svg.select('.bars').selectAll('g.item')
                .data(newData);
          groups.enter()
                .append('g')
                .append('rect')
                .attr('width', '0')
                .attr('height', '0');
          groups.attr('class', 'item')
                .attr('transform', function (d,i) {
                  return 'translate('+xScale(i)+',0)';
                });
          groups.selectAll('g.item text').remove();
          var rects = groups.selectAll('rect')
                .on('mouseenter', function (d) {
                  d3.select(this).interrupt().transition().style('opacity','0.6');
                  tip.show(d);
                })
                .on('mouseout', function (d) {
                  d3.select(this).interrupt().transition().style('opacity','0.8');
                  tip.hide(d);
                })
                .on('click', function (d) {
                  if (d.commodity !== 'TOTAL') { // top commodities chart: select commodity
                    controls.changeFilters({ commodity: d.commodity });
                  } else { // top partner chart: select partner
                    controls.changeFilters({ partner: d.partner });
                  }
                }),
              texts = groups.append('text');

          // Update groups and bars
          rects.transition()
            .attr('x', barPadding)
            .attr('y',      function (d,i) { return yScale(+d.value); })
            .attr('height', function (d,i) { return innerHeight-yScale(+d.value); })
            .attr('width',  function (d,i) { return barWidth; });
          texts
            .attr('x', function (d,i) { return barPadding-innerHeight; })
            .attr('y', function (d,i) { return barPadding+(barPadding/2)+(barWidth/2); })
            .attr('class', 'label')
            .attr('transform','rotate(-90)')
            .text(function (d) {
              if (d.commodity !== 'TOTAL') {
                // top commodities chart: return commodity
                return localData.commodityName(d.commodity);
              } else {
                // top partner chart: return partner
                return localData.countryByUnNum.get(d.partner).name;
              }
            });

          // Exit groups
          groups.exit().remove();

          // Add tooltip functions
          groups.call(tip);

        }

      };

  return barchart;
});
