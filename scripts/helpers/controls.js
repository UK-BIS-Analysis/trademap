/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert*/


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


define(function() {
  //return an object to define the "my/shirt" module.
  return {
    setup: function() {

      'use strict';

      // Setup loader overlay
      // Init spinner
      var $loading = $('#loadingDiv').hide();
      $(document)
        .ajaxStart(function () {
          $loading.show();
        })
        .ajaxStop(function () {
          $loading.hide();
        });

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

      // Add clearFilters button behavior
      $("#clearFilters").click(function (evt) {
        $('#selectCommodity').val(null).trigger("change");
        $('#selectReporter').val(null).trigger("change");
        $('#selectPartner').val(null).trigger("change");
      });
    }
  }
});







