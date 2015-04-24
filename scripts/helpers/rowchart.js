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
      margin = {top: 25, right: 45, bottom: 40, left: 12},
      innerHeight = 0,
      innerWidth = 0,
      xScale = d3.scale.linear(),
      yScale = d3.scale.linear(),
      xAxis  = d3.svg.axis()
                 .tickSize(0, 0)
                 .tickFormat(''),
      yAxis  = d3.svg.axis(),
      barHeight = 0,



      barchart = {




        setup: function (svg) {

          // Set internal graph dimensions
          innerHeight = svg.attr('height') - margin.top - margin.bottom;
          innerWidth = svg.attr('width') - margin.left - margin.right;

          // Setup initial scales and draw axises
          xScale.range([0, innerWidth]);
          yScale.range([0, innerHeight])
            .clamp(true);
          xAxis.scale(xScale)
            .orient('bottom')
            .tickFormat(localData.numFormat);
          yAxis.scale(yScale)
            .orient('left');
          svg.append('g')
            .attr('class', 'x axis')
            .attr('transform', 'translate('+margin.left+',' + (innerHeight+margin.top) + ')')
            .call(xAxis);
          svg.append('g')
            .attr('class', 'y axis')
            .attr('transform', 'translate('+margin.left+',' + margin.top + ')')
            .call(yAxis);
          svg.append('g')
            .attr('class', 'bars')
            .attr('transform', 'translate('+margin.left+',' + margin.top + ')');

        },




        draw: function (svg, newData, filters, color) {
          // Setup scales & axises
          xScale.domain([0, d3.max(newData, function (d) { return d.value; })])
                .nice();
          yScale.domain([0, newData.length])
                .clamp(true)
                .nice();
          xAxis.scale(xScale)
               .tickSize(6, 0)
               .tickFormat(localData.numFormat);
          yAxis.scale(yScale).ticks(0);
          barHeight = (yScale(1)-20);

          // Remove no data text
          svg.select('text.nodata').remove();

          // Update axises
          svg.select('.x.axis')
            .transition()
            .call(xAxis);
          svg.select('.y.axis')
            .transition()
            .call(yAxis);

          // Enter groups and bars
          var groups = svg.select('.bars').selectAll('g.item')
                .data(newData);
          groups.enter()
                .append('g')
                .append('rect')
                .attr('width', '0')
                .attr('height', '0');
          groups.classed('item',true)
                .attr('transform', function (d,i) {
                  return 'translate(0,'+yScale(i)+')';
                });
          groups.selectAll('g.item text').remove();
          var bars = groups.select('rect')
                .on('click', function (d) {
                  if (filters.partner === 'all') { // top partner chart: select partner
                    controls.changeFilters({ partner: d.partner });
                  } else { // top commodities chart: select commodity
                    controls.changeFilters({ commodity: d.commodity });
                  }
                }),
              labels = groups.append('text').classed('label', true),
              values = groups.append('text').classed('value', true);

          // Update groups and bars
          bars.transition()
            .attr('x', 0)
            .attr('y', yScale(1)-barHeight-5)
            .style('fill', color)
            .attr('height', barHeight)
            .attr('width', function (d,i) { return xScale(+d.value); });
          labels
            .attr('x', '3')
            .attr('y', yScale(1)-barHeight-8)
            .text(function (d) {
              if (filters.partner === 'all') {  // top partner chart: select partner
                return localData.lookup(d.partner, 'partnerAreas', 'text');
              } else {                          // top commodities chart: select commodity
                return localData.commodityName(d.commodity);
              }
            });
          values
            .attr('x', function (d,i) { return xScale(+d.value)+3; })
            .attr('y', yScale(1)-7)
            .text(function (d) {
              return localData.numFormat(d.value);
            });

          // Exit groups
          groups.exit().remove();

          if (groups.size() === 0) {
            // Display a "No data" text
            svg.append('text')
              .text('No data available for this chart.')
              .classed('nodata', true)
              .classed('label', true)
              .attr('x', innerWidth/2+margin.left-75)
              .attr('y', innerHeight/2+margin.top-75);
          }
        },



        resizeSvg: function (svg, newWidth) {
          svg.attr('width', newWidth);
          innerWidth = svg.attr('width') - margin.left - margin.right;
          // Update xScale and xAxis
          xScale.range([0, innerWidth]);
          xAxis.scale(xScale);
          svg.select('.x.axis') // change the x axis
            .transition()
            .call(xAxis);
          // Update bars & text
          var groups = svg.selectAll('g.item');
          groups.selectAll('rect')
            .attr('width', function (d,i) { return xScale(+d.value); });
          groups.selectAll('text.value')
            .attr('x', function (d,i) { return xScale(+d.value)+3; });
        }
      };

  return barchart;
});
