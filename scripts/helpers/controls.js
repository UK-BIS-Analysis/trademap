/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert*/


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


define(function() {
  var controls = {
    setup: function () {
      'use strict';

      // SETUP LOADER OVERLAY
      var $loading = $('#loadingDiv').hide();
      $(document).ajaxStart(function () { $loading.show(); }).ajaxStop(function () { $loading.hide(); });

      // SETUP SELECT2 DROPDOWNS SELECTORS
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
      'use strict';

      // Check what changed
      var reporter = $('#selectReporter').val(),
          partner = $('#selectPartner').val(),
          commodity = $('#selectCommodity').val();

      if(!reporter) {
        $('.select2control')
          .off('change', controls.onFilterChange)
          .val(null)
          .trigger("change")
          .on('change', controls.onFilterChange);
        $("#selectCommodity").select2('disable');
        $("#selectPartner").select2('disable');
      } else {
        $("#selectCommodity").select2('enable');
        $("#selectPartner").select2('enable');
      }


      console.log('Filters changed!');
    }

  }

  return controls;
});







