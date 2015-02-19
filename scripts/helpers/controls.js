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

    // Place some common jQuery objects so that we don't need to look for them each time.
    $selectReporter:  $("#selectReporter"),
    $selectPartner:   $("#selectPartner"),
    $selectCommodity: $("#selectCommodity"),
    $selectYear:      $("#selectYear"),
    $flowButtons:     $('#flowButtons'),
    $clearFilters:    $("#clearFilters"),

    setup: function () {

      // SETUP LOADER OVERLAY
      var $loading = $('#loadingDiv').hide();
      $(document).ajaxStart(function () { $loading.show(); }).ajaxStop(function () { $loading.hide(); });

      // SETUP SELECT2 DROPDOWN SELECTORS
      // Setup the reporters dropdown
      this.$selectReporter
        .select2({
          placeholder: "Select a reporter",
          allowClear: true,
          data: data.reporterAreasSelect
        })
        .on('change', controls.onFilterChange);
      // Setup the partners dropdown
      this.$selectPartner
        .select2({
          placeholder: "Select a partner",
          allowClear: true,
          disabled: true,
          data: data.partnerAreasSelect
        })
        .on('change', controls.onFilterChange)
        .select2('disable');
      // Setup the categories dropdown
      this.$selectCommodity
        .select2({
          placeholder: "Select a commodity",
          allowClear: true,
          data: data.commodityCodesSelect
        })
        .on('change', controls.onFilterChange)
        .select2('disable');


      // FIX: Add listener to the temporary select for year. Later on it will be controlled from the line chart
      this.$selectYear
        .attr('disabled','true')
        .on('change', controls.onFilterChange);

      // ADD IMPORT/EXPORT/BALANCE BUTTON BEHAVIOURS
      this.$flowButtons.on('click', function (event) {
        $('#flowButtons button').removeClass('btn-primary').addClass('btn-default');
        $(event.target).closest('button').removeClass('btn-default').addClass('btn-primary');
        controls.onFilterChange();
      });

      // ADD CLEARFILTERS BUTTON BEHAVIOR
      this.$clearFilters.on('click', function (event) {
        $('.select2control')
          .off('change', controls.onFilterChange)
          .val(null)
          .trigger("change")
          .on('change', controls.onFilterChange);
        controls.onFilterChange();
      });
    },




    onFilterChange: function (event) {
      // Get new values
      var filters = {
        reporter:   controls.$selectReporter.val(),
        partner:    controls.$selectPartner.val(),
        commodity:  controls.$selectCommodity.val(),
        flow:       $('#flowButtons .btn-primary').html(),
        year:       controls.$selectYear.val()
      };

      // Activate/deactivate controls appropriately
      controls.fadeControls(filters);
      // Trigger refresh on each chart passing along the new filters
      $('.chart').trigger('refreshFilters', filters);
    },





    changeFilters: function (filters) {
      // If reporter is not currently selected nor being set, don't allow any other updates
      if (!filters.reporter && controls.$selectReporter.val() == "") {
        return;
      }

      // Update the other fields
      if (filters.reporter && filters.reporter != controls.$selectReporter.val()) {
        controls.$selectReporter.val(filters.reporter).trigger("change");
      }
      if (filters.commodity && filters.commodity != controls.$selectCommodity.val()) {
        controls.$selectCommodity.val(filters.commodity).trigger("change");
      }
      if (filters.partner && filters.partner != controls.$selectPartner.val()) {
        controls.$selectPartner.val(filters.partner).trigger("change");
      }
      if (filters.year && filters.year != controls.$selectYear.val()) {
        controls.$selectYear.val(filters.year);
      }


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







