/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


define(['./data'], function(data) {
  'use strict';

  var controls = {
    setup: function () {

      // SETUP LOADER OVERLAY
      var $loading = $('#loadingDiv').hide();
      $(document).ajaxStart(function () { $loading.show(); }).ajaxStop(function () { $loading.hide(); });

      // SETUP SELECT2 DROPDOWN SELECTORS
      // Setup the reporters dropdown
      $("#selectReporter").select2({
        placeholder: "Select a reporter",
        allowClear: true,
        data: data.reporterAreasSelect
      });
      $("#selectReporter").on('change', controls.onFilterChange);
      // Setup the partners dropdown
      $("#selectPartner").select2({
        placeholder: "Select a partner",
        allowClear: true,
        disabled: true,
        data: data.partnerAreasSelect
      });
      $("#selectPartner").on('change', controls.onFilterChange);
      $("#selectPartner").select2('disable');
      // Setup the categories dropdown
      $("#selectCommodity").select2({
        placeholder: "Select a commodity",
        allowClear: true,
        data: data.classificationCodesSelect
      });
      $("#selectCommodity").on('change', controls.onFilterChange);
      $("#selectCommodity").select2('disable');


      // FIX: Add listener to the temporary select for year. Later on it will be controlled from the line chart
      $("#selectYear").on('change', controls.onFilterChange);
      $("#selectYear").attr('disabled','true');

      // ADD IMPORT/EXPORT/BALANCE BUTTON BEHAVIOURS
      $('#flowButtons').click(function (evt) {
        $('#flowButtons button').removeClass('btn-primary').addClass('btn-default');
        $(event.target).closest('button').removeClass('btn-default').addClass('btn-primary');
        controls.onFilterChange();
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
        flow:       $('#flowButtons .btn-primary').html(),
        year:       $('#selectYear').val()
      };

      // Activate/deactivate controls appropriately
      controls.fadeControls(filters);
      // Trigger refresh on each chart passing along the new filters
      $('.chart').trigger('refreshFilters', filters);
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







