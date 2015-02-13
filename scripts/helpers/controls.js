/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


define(function() {
  'use strict';

  var controls = {
    setup: function () {

      // SETUP LOADER OVERLAY
      var $loading = $('#loadingDiv').hide();
      $(document).ajaxStart(function () { $loading.show(); }).ajaxStop(function () { $loading.hide(); });

      // SETUP SELECT2 DROPDOWN SELECTORS
      // Load reporters list from JSON (from local JSON file currently)
      $.ajax('/data/reporterAreas.min.json', {
        error: function (xhr, status, error) {
          console.log('Request for partner list failed with status: '+status+' and error: '+error);
        },
        success: function (response, status, xhr) {
          $("#selectReporter").select2({
            placeholder: "Select a reporter",
            allowClear: true,
            data: response.results
          });
          $("#selectReporter").on('change', controls.onFilterChange);
        }
      });
      // Load reporters list from JSON (from local JSON file currently)
      $.ajax('/data/partnerAreas.min.json', {
        error: function (xhr, status, error) {
          console.log('Request for partner/reporter list failed with status: '+status+' and error: '+error);
        },
        success: function (response, status, xhr) {
          $("#selectPartner").select2({
            placeholder: "Select a partner",
            allowClear: true,
            disabled: true,
            data: response.results
          });
          $("#selectPartner").on('change', controls.onFilterChange);
          $("#selectPartner").select2('disable');
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
          $("#selectCommodity").on('change', controls.onFilterChange);
          $("#selectCommodity").select2('disable');
        }
      });
      // FIX: Add listener to the temporary select for year. Later on it will be controlled from the line chart
      $("#selectYear").on('change', controls.onFilterChange);
      $("#selectYear").attr('disabled','true');

      // ADD IMPORT/EXPORT/BALANCE BUTTON BEHAVIOURS
      $('#flowButtons').click(function (evt) {
        $('#flowButtons button').removeClass('btn-primary').addClass('btn-default');
        $(event.target).closest('button').removeClass('btn-default').addClass('btn-primary');
        console.log('Selected '+$(event.target).closest('button').html());
      });

      // ADD CLEARFILTERS BUTTON BEHAVIOR
      $("#clearFilters").click(function (evt) {
        $('.select2control')
          .off('change', controls.onFilterChange)
          .val(null)
          .trigger("change")
          .on('change', controls.onFilterChange);
        controls.onFilterChange();
      });
    },




    onFilterChange: function (evt) {
      // Get new values
      var filters = {
        reporter:   $('#selectReporter').val(),
        partner:    $('#selectPartner').val(),
        commodity:  $('#selectCommodity').val(),
        year:       $('#selectYear').val()
      };

      // Activate/deactivate controls appropriately
      controls.fadeControls(filters);
      // Trigger refresh on each chart passing along the new filters
      $('.chart').trigger('refreshFilters', { filters: filters });

      if (DEBUG) { console.log('Filters changed!'); }
    },




    fadeControls : function(filters) {
      if(!filters.reporter) {
        $('.select2control')
          .off('change', controls.onFilterChange)
          .val(null)
          .trigger("change")
          .on('change', controls.onFilterChange);
        $("#selectCommodity").select2('disable');
        $("#selectPartner").select2('disable');
        $("#selectYear").attr('disabled', true);
      } else {
        $("#selectCommodity").select2('enable');
        $("#selectPartner").select2('enable');
        $("#selectYear").removeAttr('disabled');
      }
    }

  };

  return controls;
});







