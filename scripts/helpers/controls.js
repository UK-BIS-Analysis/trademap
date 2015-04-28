/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, queryObject */


/*
 * THIS FILE SETS UP THE CONTROLS ON THE PAGE
 * */


define(['./data'], function(data) {
  'use strict';

  var controls = {

    // Place some common jQuery objects so that we don't need to look for them each time.
    $selectReporter:  $('#selectReporter'),
    $selectPartner:   $('#selectPartner'),
    $selectCommodity: $('#selectCommodity'),
    $selectYear:      $('#selectYear'),
    $selects:         $('#selectReporter, #selectPartner, #selectCommodity, #selectYear'),
    $flowButtons:     $('#flowButtons'),
    $clearFilters:    $("#clearFilters"),

    filters: {},

    setup: function () {

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
          disabled: true
        })
        .on('change', controls.onFilterChange);


      // ADD IMPORT/EXPORT/BALANCE BUTTON BEHAVIOURS
      this.$flowButtons.on('click', function (event) {
        $('#flowButtons button').removeClass('btn-primary').addClass('btn-default');
        $(event.target).closest('button').removeClass('btn-default').addClass('btn-primary');
        controls.onFilterChange();
      });

      // ADD CLEARFILTERS BUTTON BEHAVIOR
      this.$clearFilters.on('click', function (event) {
        $('#selectReporter, #selectPartner, #selectCommodity')
          .off('change', controls.onFilterChange)
          .val(null)
          .trigger("change")
          .on('change', controls.onFilterChange);
        controls.onFilterChange();
      });

      // ADD CONTEXTUAL MENU BEHAVIOURS
      $('#closeContextMenu').on('click', function (e) {
        e.preventDefault();
        $("#contextMenu").hide();
      });
      $('#contextMenu .setReporter').on('click', function (e) {
        e.preventDefault();
        if (!$(e.target.parentNode).hasClass('disabled')) {
          controls.changeFilters({reporter: $(e.target).attr('data-uncode')});
        }
        $("#contextMenu").hide();
      });
      $('#contextMenu .setPartner').on('click', function (e) {
        e.preventDefault();
        if (!$(e.target.parentNode).hasClass('disabled')) {
          controls.changeFilters({partner: $(e.target).attr('data-uncode')});
        }
        $("#contextMenu").hide();
      });

    },




    getFilters: function () {
      var newFilters = {};
      if (controls.$selectReporter.val() !== '')  { newFilters.reporter = controls.$selectReporter.val(); }
      if (controls.$selectPartner.val() !== '')   { newFilters.partner = controls.$selectPartner.val(); }
      if (controls.$selectCommodity.val() !== '') { newFilters.commodity = controls.$selectCommodity.val(); }
      if (controls.$selectYear.val() !== '')      { newFilters.year = controls.$selectYear.val(); }
      if ($('#flowButtons .btn-primary').attr('data-value') !== '')
                                                  { newFilters.flow = $('#flowButtons .btn-primary').attr('data-value'); }
      return newFilters;
    },




    onFilterChange: function (event) {
      // Get new values
      var newfilters = controls.getFilters();

      // If there's no change from previous filters then do nothing
      if (controls.filters.reporter  === newfilters.reporter  &&
          controls.filters.partner   === newfilters.partner   &&
          controls.filters.commodity === newfilters.commodity &&
          controls.filters.year      === newfilters.year      &&
          controls.filters.flow      === newfilters.flow ) {
        return;
      }

      if (DEBUG) { console.log('New filters: %s', JSON.stringify(newfilters)); }

      // Activate/deactivate controls appropriately
      controls.fadeControls(newfilters);

      // Show/hide elements on page according to filters
      controls.showElements(newfilters);

      // Trigger refresh on each chart passing along the new filters
      $('.chart').trigger('refreshFilters', newfilters);

      // Update URL
      controls.updateURL(newfilters);

      // And finally store the filters
      controls.filters = newfilters;
    },




    changeFilters: function (filters) {
      // If reporter is not currently selected nor being set, don't allow any other updates
      if (!filters.reporter && controls.$selectReporter.val() === "") {
        return;
      }

      // Update the other fields
      if (filters.reporter && filters.reporter !== controls.$selectReporter.val()) {
        controls.$selectReporter.val(filters.reporter);
      }
      if (filters.commodity && filters.commodity !== controls.$selectCommodity.val()) {
        controls.$selectCommodity.val(filters.commodity);
      }
      if (filters.partner && filters.partner !== controls.$selectPartner.val()) {
        controls.$selectPartner.val(filters.partner);
      }
      if (filters.year && filters.year !== controls.$selectYear.val()) {
        // Add the current and the requested years temporarily to the list
        controls.updateYears([+controls.$selectYear.val(), filters.year]);
        controls.$selectYear.val(filters.year);
      }

      // And trigger a single change event
      controls.$selects.trigger("change");


    },




    initializeFilters: function () {
      var URLfilters = this.decodeURL();
      if (URLfilters && URLfilters.reporter) {
        // Set the filters from the URL
        this.changeFilters(URLfilters);
      } else {
        // Then initialize filters to reporter=UK
        controls.changeFilters({ reporter:  826, year: 2014 });
      }
    },




    decodeURL: function () {
      var History = window.History;
	  try {
        var filters = {},
            state = History.getState();
        state.hash.split('?',2)[1].split('&').forEach(function (param) {
			param = param.replace(/%20|\+/g, ' ').split('=');
			filters[decodeURIComponent(param[0])] = (param[1] ? decodeURIComponent(param[1]) : undefined);
		});
        if (filters.year) { filters.year = +filters.year }
		return filters;
	  } catch (err) {
		return {};
	  }
    },




    updateURL: function (filters) {
      var History = window.History,
          query = '?',
          prop = '';
      for (prop in filters) {
        query += encodeURIComponent(prop);
        if (filters[prop]) {
          query += '=' + encodeURIComponent(filters[prop]);
        }
        query += '&';
      }
      query = query.slice(0, -1);
      History.replaceState(null,'International Trade in Goods by Country and Commodity',query)
    },




    updateYears: function (yearList) {
      if (yearList.length > 0) {
        var current = +controls.$selectYear.val();
        controls.$selectYear.html('');
        yearList
          .sort(function (a, b) { return b-a; })
          .forEach(function (d) {
            controls.$selectYear.append('<option value="'+d+'">'+d+'</option>');
          });
        if(yearList.indexOf(current)>=0) {
          controls.$selectYear.val(+current);
        } else {
          controls.$selectYear.val(d3.max(yearList)).trigger("change");
        }
      }
    },




    fadeControls: function (filters) {
      if(!filters.reporter) {
        $('#selectReporter, #selectPartner, #selectCommodity')
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
        $("#selectYear").select2('enable');
      }
    },




    showElements: function (filters) {
      if(!filters.reporter) {
        // Empty viz: hide switch, chevrons and graphs and charts container
        $('#goToCharts, #goToMap, #flowButtons').hide();
        $('#charts').slideUp();
        $('#contextMenu .setPartner').addClass('disabled');
      } else {
        // Show switch, chevrons and graphs
        $('#goToCharts, #goToMap, #flowButtons').show();
        $('#charts').slideDown();
        $('#contextMenu .setPartner').removeClass('disabled');
      }
    },




    showError: function (err) {
      $('#myModalLabel').html('<span class="glyphicon glyphicon-warning-sign"></span> There was an error in querying the COMTRADE API.');
      $('#myModal .modal-body').html(err);
      $('#myModal').modal({ show: true });
    }




  };

  return controls;
});
