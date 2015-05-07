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

  var localData     = data,
      $infoBox      = $('#infoBox'),
      $defaultPanel = $('#defaultPanel'),
      $hoverPanel   = $('#hoverPanel'),



      bottomMargin  = 10,
      getPositionFromTop = function () {
        if ($(document).width() > 992) {
         return Math.min(
            $('#infoBoxPlaceholder').offset().top,
            $(window).height()-$infoBox.height() - bottomMargin + $(window).scrollTop()
          )+'px';
        } else {
          return $('#infoBoxPlaceholder').offset().top;
        }
      },
      getWidth = function () {
        return ($('#infoBoxPlaceholder').width()-20)+'px';
      },
      repositionBox = function () {
        $infoBox
          .css({
            top: getPositionFromTop(),
            width: getWidth()
          });
      },



      box = {

        setup: function () {
          // Position the infoBox on load
          $infoBox.css({
            top: getPositionFromTop(),
            width: getWidth()
          });

          // Bind to the scroll event and move the box
          $(window).scroll(repositionBox);

          // Initialize the position of the hoverPanel
          $hoverPanel.slideUp();

          // Bind to window.resize for responsive behaviour
          $(window).on('resize', repositionBox);

          // Bind the refresh function to the refreshFilters event
          $infoBox.on('refreshFilters', this.refresh);

        },




        refresh: function (event, filters) {

          // CASE 1: reporter = null
          if(!filters.reporter) {
            $infoBox.slideUp();
            return;
          } else {
            $infoBox.slideDown();
          }

          // We build a queryFilter and a dataFilter object to make API queries more generic than data queries
          var queryFilter = {
                reporter: +filters.reporter,
                partner:  0,
                year:   +filters.year,
                commodity:   'AG2',
                initiator: 'infoBox'
              },
              dataFilter = {
                reporter: +filters.reporter,
                year:   +filters.year,
                commodity:   'TOTAL'
              };

          // NOTE that we leave dataFilter.partner undefined when a partner is selected
          // rather than equal to 'all' or to the specific partner so that the returned
          // dataset will include also world as partner which we need for calculations.
          if (!filters.partner || filters.partner === 0) {
            dataFilter.partner = 0;
          }

          // CASE 2: reporter = selected    commodity = null        partner = null
          if(filters.reporter && !filters.commodity && !filters.partner) {
            queryFilter.commodity = 'TOTAL';
            queryFilter.year  = 'all';
          }

          // CASE 3: reporter = selected    commodity = null        partner = selected
          if(filters.reporter && !filters.commodity && filters.partner) {
            queryFilter.partner = 'all';
            queryFilter.commodity = 'TOTAL';
            queryFilter.year = +filters.year;
          }

          // CASE 4: reporter = selected    commodity = selected    partner = selected
          if(filters.reporter && filters.commodity && filters.partner) {
            queryFilter.partner = 'all';
            queryFilter.commodity = filters.commodity;
            dataFilter.commodity = filters.commodity;
          }

          // CASE 5: reporter = selected    commodity = selected    partner = null
          if(filters.reporter && filters.commodity && !filters.partner) {
            queryFilter.partner = 'all';
            queryFilter.commodity = filters.commodity;
            dataFilter.commodity = filters.commodity;
          }


          // Run query if necessary
          data.query(queryFilter, function queryCallback (err, ready) {
            if (err) { gui.showError(err); }
            if (err || !ready) { return; }

            // Query xFilter and then use the combineData to get single object per partner.
            var newData = localData.getData(dataFilter),
                newDataCombined = localData.combineData(newData),
                newDataByPartner = d3.map(newDataCombined, function (d) { return d.partner; });
            box.populateBox($defaultPanel, newDataByPartner.get(filters.partner || 0), filters.partner);
          });
        },




        populateBox: function ($panel, details, countryUnNum) {

          // Clear data previously in box
          $panel.find('.subtitle').html('');
          $panel.find('.value').html('');
          $panel.find('.ranking').html('');
          $panel.find('dt').show();

          // If no details then display no data and stop.
          if (!details) {
            $panel.find('.subtitle').html('<p class="text-center"><strong>No data available for ' + localData.lookup(countryUnNum, 'countryByUnNum', 'name') + '.</strong></p>');
            $panel.find('.value, .ranking').html('');
            $panel.find('dt').hide();
            return;
          }

          var reporterName = localData.lookup(details.reporter, 'reporterAreas', 'text'),
              partnerName = localData.lookup(details.partner, 'partnerAreas', 'text'),
              subtitle = '<strong>' +
                         reporterName +
                         '</strong> trade in goods with <strong>' +
                         partnerName +
                         '</strong> in <strong>' + details.year + '</strong><br />';
          if (details.commodity && details.commodity !== 'TOTAL') {
            subtitle += '<strong>' + localData.commodityName(details.commodity) + '</strong>';
          }
          $panel.find('.subtitle').html(subtitle);

          // Populate panel
          $panel.find('.value.exports').html(localData.numFormat(details.exportVal, null, 1));
          $panel.find('.value.imports').html(localData.numFormat(details.importVal, null, 1));
          $panel.find('.value.balance').html(localData.numFormat(details.balanceVal, null, 1));
          $panel.find('.value.bilateral').html(localData.numFormat(details.bilateralVal, null, 1));

          // Show ranking only if partner and rankings are given
          if (details.partner && details.partner !== 0 && details.importRank && details.exportRank) {
            var ranking = partnerName + ' was the ' + localData.numOrdinal(details.exportRank) + ' largest export market for ' +
                          reporterName + ' (' + details.exportPc.toFixed(1) + '% of ' + reporterName + ' exports) and the ' +
                          localData.numOrdinal(details.importRank) + ' largest import market for ' + reporterName +
                          ' (' + details.importPc.toFixed(1) + '% of ' + reporterName + ' imports)';
            if (details.commodity && details.commodity !== 'TOTAL') {
              ranking += ' for '+ localData.commodityName(details.commodity);
            }
            ranking += ' in ' + details.year + '.';
            $panel.find('.ranking').html(ranking);
          }
        },



        /*
         * The hover display is coupled with the choropleth
         * The data to be displayed comes from the choropleth which
         * in turn gets it from the data module and processes with the combine
         * function.
         * This is different from the default panel generated on filter change
         * by the populateDefault function above
         */
        displayHover: function (partnerDetails, countryUnNum) {
          box.populateBox($hoverPanel, partnerDetails, countryUnNum);
          // Animate display of hover panel
          $defaultPanel.stop().slideUp();
          $hoverPanel.stop().slideDown();
        },




        hideHover: function () {
          // Animate display of default panel
          $hoverPanel.stop().slideUp();
          $defaultPanel.stop().slideDown();
        }




      };
  return box;
});
