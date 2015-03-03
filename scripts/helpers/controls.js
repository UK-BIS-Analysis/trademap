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
      // Setup the year selector
      this.$selectYear
        .select2({
          allowClear: false,
          minimumResultsForSearch: Infinity,
          disabled: true,
          data: [{ id: 2013, text: '2013' }, { id: 2012, text: '2012' }, { id: 2011, text: '2011' }, { id: 2010, text: '2010' }, { id: 2009, text: '2009' }]
        })
        .on('change', controls.onFilterChange);
      this.$selectYear.select2('data', { id: 2013, text: '2013' });
      this.$selectYear.select2('disable');


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
      var filters = {};
      if (controls.$selectReporter.val() !== '') { filters.reporter = controls.$selectReporter.val(); }
      if (controls.$selectPartner.val() !== '') { filters.partner = controls.$selectPartner.val(); }
      if (controls.$selectCommodity.val() !== '') { filters.commodity = controls.$selectCommodity.val(); }
      if ($('#flowButtons .btn-primary').attr('data-value') !== '') { filters.flow = $('#flowButtons .btn-primary').attr('data-value'); }
      if (controls.$selectYear.val() !== '') { filters.year = controls.$selectYear.val(); }

      // Activate/deactivate controls appropriately
      controls.fadeControls(filters);
      // Trigger refresh on each chart passing along the new filters
      $('.chart').trigger('refreshFilters', filters);
    },





    changeFilters: function (filters) {
      // If reporter is not currently selected nor being set, don't allow any other updates
      if (!filters.reporter && controls.$selectReporter.val() === "") {
        return;
      }

      // Update the other fields
      if (filters.reporter && filters.reporter !== controls.$selectReporter.val()) {
        controls.$selectReporter.val(filters.reporter).trigger("change");
      }
      if (filters.commodity && filters.commodity !== controls.$selectCommodity.val()) {
        controls.$selectCommodity.val(filters.commodity).trigger("change");
      }
      if (filters.partner && filters.partner !== controls.$selectPartner.val()) {
        controls.$selectPartner.val(filters.partner).trigger("change");
      }
      if (filters.year && filters.year !== controls.$selectYear.val()) {
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
        $("#selectYear").select2('disable');
      } else {
        $("#selectCommodity").select2('enable');
        $("#selectPartner").select2('enable');
        $("#selectYear").select2('enable');;
      }
    }

  };

  return controls;
});







