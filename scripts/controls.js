/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert*/


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


// This jQuery callback makes sure that all code is run after the document and scripts have all loaded properly
$(document).ready(function () {

  'use strict';

  // Use Modernizr to check for SVG support and if not present display an error and don't even start loading CSV and setting up charts
  if (!Modernizr.svg) {
    $('#browserAlert').removeClass('hidden');
  } else {

    // SETUP SELECT2 DROPDOWNS SELECTORS
    // Load reporters and partner lists from JSON (from local JSON file currently)
    $.ajax('/data/reporterAreas.min.json', {
      crossDomain: false,
      error: function (xhr, status, error) {
        console.log('Request for partner/reporter list failed with status: '+status+' and error: '+error);
      },
      success: function (response, status, xhr) {
        $("#selectReporter").select2({
          placeholder: "Select a reporter",
          allowClear: true,
          data: response.results
        });
        $("#selectPartner").select2({
          placeholder: "Select a partner",
          allowClear: true,
          data: response.results
        });
      }
    });

    // Load commodities list (from local JSON file currently)
    $.ajax('/data/classificationHS_AG2.min.json', {
      crossDomain: false,
      error: function (xhr, status, error) {
        console.log('Request for commodity list failed with status: '+status+' and error: '+error);
      },
      success: function (response, status, xhr) {
        $("#selectCommodity").select2({
          placeholder: "Select a commodity",
          allowClear: true,
          data: response.results
        });
      }
    });

    // Add import/export/balance button behaviours
    $('#flowButtons').click(function (evt) {
      $('#flowButtons button').removeClass('btn-primary').addClass('btn-default');
      $(event.target).closest('button').removeClass('btn-default').addClass('btn-primary');
      console.log('Selected '+$(event.target).closest('button').html());
    });


  }     // Close Modernizr conditional
});     // Close $(document).ready
