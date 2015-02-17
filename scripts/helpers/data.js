/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, Date */

/*
 * THIS FILE MANAGES API QUERIES AND CROSSFILTER SETUP
 * */


define(function(require) {
  'use strict';

  // Using require above we are making data a singleton which is created only once.
  // Each module requiring data will be using the same object.
  var singleton = function () {
    var data = {

      /*
       * PROPERTIES
       * Some basic properties that we store and persist throughout the application
       */
      // Base query url
      baseQueryUrl: 'http://comtrade.un.org/api/get?fmt=csv&max=50000&type=C&freq=A&px=HS&rg=1%2C2',

      // queryHistory, queryQueue and timestamp are used to throttle and debounce queries
      queryHistory: [],
      queryQueue: [],
      timestamp: 0,

      // Reporter, partner and classification arrays for select2 widgets and lookup objects
      // These are populated during controls setup with data from
      // reporterAreas.json, partnerAreas.json and clasificationsHS_AG2.json
      reporterAreasSelect: [],
      partnerAreasSelect: [],
      classificationCodesSelect: [],
      reporterAreas: {},
      partnerAreas: {},
      classificationCodes: {},
      isoCodes: {},

      // Crossfilter data
      ndx: crossfilter(),






      /*
       * PUBLIC METHODS
       * */


      /*
       * Initial setup function.
       * Query static JSON files and populate variables. This is an asynchronous function that makes AJAX request and therefore uses a callback
       */
      setup : function (callback) {
        $.when(
          $.ajax('data/reporterAreas.min.json'),
          $.ajax('data/partnerAreas.min.json'),
          $.ajax('data/classificationHS_AG2.min.json'),
          $.ajax('data/isoCodes.csv')
        ).then(function success (reporterAreas, partnerAreas, classificationCodes, isoCodes) {
          // Add results to the data object for use in the app.
          data.reporterAreasSelect       = reporterAreas[0].results;
          data.partnerAreasSelect        = partnerAreas[0].results;
          data.classificationCodesSelect = classificationCodes[0].results;
          d3.csv.parse(isoCodes[0]).forEach(function (d, i) {
            data.isoCodes[d.code] = d.iso;
          });


          reporterAreas[0].results.forEach(function (v) {
            data.reporterAreas[v.id] = {};
            data.reporterAreas[v.id].name = v.text;
            data.reporterAreas[v.id].iso = data.isoCodes[v.id];
          });
          partnerAreas[0].results.forEach(function (v) {
            data.partnerAreas[v.id] = {};
            data.partnerAreas[v.id].name = v.text;
            data.partnerAreas[v.id].iso = data.isoCodes[v.id];
          });
          classificationCodes[0].results.forEach(function (v) {
            data.classificationCodes[v.id] = v.text;
          });
          // Call the callback
          callback();
        }, function failure (err1, err2, err3, err4) {
          callback('There was an error with one of the initial requests.');
        });
      },


      /*
       * Run an API query
       * options argument should be an object in the following form:
       * {
       *   reporter: 826,     // Reporter code (see )
       *   partner:  862,     // Partner code (see )
       *   period:   'all',   // Period can be 'all' or apecific year: 2012 (FUTURE: Multi-year queries are allowed for up to 5 years)
       *   hsCode:   72       // Can be a specific 2-digit HS code or 'TOTAL' or 'AG2'
       * }
       * Callback is called with callback(error, newData)
       * newData will be true if new data was received and added to crossfilter or false otherwise.
       */
      query: function (options, callback) {
        // Get current time and build URL
        var requestUrl = this._buildUrl(options),
            time = new Date();

        // Check history to see if query was already run and skip the call if it was already run
        if(data.queryHistory.indexOf(requestUrl) > -1) {
          callback(null, false);
          return;
        }

        // If the API was called less than a second ago, or if the query is in the queue then we need to
        // postpone the call by (a little more than) a second.
        if (time.getTime() - data.timestamp < 1000 || data.queryQueue.indexOf(requestUrl) > -1) {
          window.setTimeout(function () { data.query(options, callback); }, 1100);
          callback(null, false);
          return;
        }

        // Make call
        $.ajax({
          url: requestUrl,
          crossDomain: true,
          // NOTE: context setting is imporant as it binds the callback to the data object we are creating.
          // Otherwise we cannot access any of the properties in the callback.
          context: this,
          beforeSend: function (xhr, settings) {
            // Set the timestamp so that other queries will queue and add the current query to the queue.
            this.timestamp = time.getTime();
            this.queryQueue.push(requestUrl);
          },
          success: function success (data, status, xhr) {
            // Add query to history and remove it from queryQueue if it was there
            this.queryHistory.push(requestUrl);
            var queueItem = this.queryQueue.indexOf(requestUrl);
            if (queueItem > -1) { this.queryQueue.splice(queueItem, 1); }
            // Add data to crossfilter and callback
            this._addData(data);
            callback(null, data);
          },
          error: function error (xhr, status, err) {
            callback(err, null);
          }
        });
      },







      /*
       * PRIVATE METHODS
       * (methods that are only used internally in the data module)
       * */
      _buildUrl: function (options) {
        var requestUrl = data.baseQueryUrl;
        if (options.reporter) { requestUrl += '&r=' +options.reporter; } else { requestUrl += '&r=0'; }
        if (options.partner)  { requestUrl += '&p=' +options.partner;  } else { requestUrl += '&p=all'; }
        if (options.period)   { requestUrl += '&ps='+options.period;   } else { requestUrl += '&ps=now'; }
        if (options.hsCode)   { requestUrl += '&cc='+options.hsCode;   } else { requestUrl += '&cc=AG2'; }
        return requestUrl;
      },

      _addData: function (csvData) {
        var newData = d3.csv.parse(csvData);
        this.ndx.add(newData);
      }

    };
    return data;
  };

  return singleton();
});
