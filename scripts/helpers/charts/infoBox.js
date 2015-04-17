/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE information box
 * */


define(['../data', '../gui', '../controls'], function(data, gui, controls) {
  'use strict';

  var localData = data,
      $infoBox      = $('#infoBox'),
      $defaultPanel = $('#defaultPanel'),
      $hoverPanel   = $('#hoverPanel'),

      chart = {

        setup: function () {
          var bottomMargin = 10,
              getPositionFromTop = function () {
                return Math.min(
                  $('#infoBoxPlaceholder').offset().top,
                  $(window).height()-$infoBox.height() - bottomMargin + $(window).scrollTop()
                );
              }

          // Position the infoBox on load
          $infoBox.css({ top: getPositionFromTop() +'px' });

          // Bind to the scroll event and move the box
          $(window).scroll(function () { $infoBox.css({ "top": getPositionFromTop()+'px' }); });

          // Initialize the position of the hoverPanel
          $hoverPanel.css('left', $defaultPanel.width());

          // Bind to window.resize for responsive behaviour

          // Bind the refresh function to the refreshFilters event
          // $chart.on('refreshFilters', this.refresh);

        },




        refresh: function (event, filters) {
          // CASE 1: reporter = null
          if(!filters.reporter) {
            $infoBox.slideUp();
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
          }

          // CASE 5: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            $chartTitle.html('');
          }

          $chartTitle.html(title);
          data.query(queryFilter, function queryCallback (err, ready) {
            if (err) { gui.showError(err); }
            if (err || !ready) { return; }
            // Get the data, update title, display panel and update chart
            var newData = localData.getData(dataFilter);
          });
        },




        displayHover: function (something) {
          var width = $infoBox.width();
          $defaultPanel.stop().animate({left: -width, width: width-5}, 500);
          $hoverPanel.stop().animate({left: 0, width: width-5}, 500);
        },




        displayDefault: function () {
          var width = $infoBox.width()+5;
          $defaultPanel.stop().animate({ left: 0, width: width-5 }, 500);
          $hoverPanel.stop().animate({ left: width, width: width-5 }, 500);
        }




      };
  return chart;
});
