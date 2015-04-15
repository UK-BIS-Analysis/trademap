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

      // ADD CHEVRON BUTTON BEHAVIOURS
      $("#goToCharts a, #goToMap a").tooltip();
      $("#goToCharts a, #goToMap a").on('click', function(e) {
        e.preventDefault();
        var hash = this.hash;
        $('html, body').animate({
          scrollTop: $(hash).offset().top
        }, 1000, function(){
          // do something when done like adding hash to location
          // window.location.hash = hash;
        });
      });

      // ADD CONTEXTUAL MENU BEHAVIOURS
      $('#closeContextMenu').on('click', function (e) {
        e.preventDefault();
        $("#contextMenu").hide()
      });
      $('#contextMenu .setReporter').on('click', function (e) {
        e.preventDefault();
        if (!$(e.target.parentNode).hasClass('disabled')) {
          controls.changeFilters({reporter: $(e.target).attr('data-uncode')})
        }
        $("#contextMenu").hide()
      });
      $('#contextMenu .setPartner').on('click', function (e) {
        e.preventDefault();
        if (!$(e.target.parentNode).hasClass('disabled')) {
          controls.changeFilters({partner: $(e.target).attr('data-uncode')})
        }
        $("#contextMenu").hide()
      });

      // ADD SPECIFIC MENU BEHAVIOURS
      // Build links with http://www.sharelinkgenerator.com if needed
      $('#facebookShareLink').on('click', function (e) {
        e.preventDefault();
        var winTop = (screen.height / 2) - (520 / 2);
        var winLeft = (screen.width / 2) - (350 / 2);
        window.open('https://www.facebook.com/sharer/sharer.php?u=http://play.fm.to.it/trademap/'+window.location.search, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + 520 + ',height=' + 350);
      });
      $('#tweetLink').on('click', function (e) {
        e.preventDefault();
        var winTop = (screen.height / 2) - (520 / 2);
        var winLeft = (screen.width / 2) - (350 / 2);
        window.open('https://twitter.com/home?status=Check%20out%20the%20International%20Trade%20in%20Goods%20by%20Country%20and%20Commodity%20DataViz%20at%20http://play.fm.to.it/trademap', 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + 520 + ',height=' + 350);
      });
    },




    onFilterChange: function (event) {
      // Get new values
      var newfilters = {};
      if (controls.$selectReporter.val() !== '')  { newfilters.reporter = controls.$selectReporter.val(); }
      if (controls.$selectPartner.val() !== '')   { newfilters.partner = controls.$selectPartner.val(); }
      if (controls.$selectCommodity.val() !== '') { newfilters.commodity = controls.$selectCommodity.val(); }
      if (controls.$selectYear.val() !== '')      { newfilters.year = controls.$selectYear.val(); }
      if ($('#flowButtons .btn-primary').attr('data-value') !== '')
                                                  { newfilters.flow = $('#flowButtons .btn-primary').attr('data-value'); }

      // If there's no change from previous filters then do nothing
      if (controls.filters.reporter  == newfilters.reporter  &&
          controls.filters.partner   == newfilters.partner   &&
          controls.filters.commodity == newfilters.commodity &&
          controls.filters.year      == newfilters.year) {
        return;
      }

      if (DEBUG) { console.log('New filters selected: %o',newfilters); }

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
        controls.$selectYear.val(filters.year);
      }

      // And trigger a single change event
      controls.$selects.trigger("change")


    },




    initializeFilters: function () {
      var URLfilters = this.decodeURL();
      if (URLfilters && URLfilters.reporter) {
        // Set the filters from the URL
        this.changeFilters(URLfilters);
      } else {
        // Then initialize filters to reporter=UK
        controls.changeFilters({ reporter:  826 });
      }
    },




    decodeURL: function () {
      return queryObject.get(['reporter', 'partner', 'flow', 'commodity', 'year']);
    },




    updateURL: function (filters) {
      queryObject.useHistory = true;
      queryObject.set(filters);
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







