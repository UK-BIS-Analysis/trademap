/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, Date */

/*
 * THIS FILE MANAGES API QUERIES AND CROSSFILTER SETUP
 * */


define(function(require) {
  'use strict';

  // Using require above we are making data a singleton which is created only once. Each module requiring data will be using the same object.
  var singleton = function () {
    var data = {

      /*
       * PROPERTIES
       * Some basic properties that we store and persist throughout the application
       */

      // Base query url
      baseQueryUrl: 'http://comtrade.un.org/api/get?fmt=csv&max=50000&type=C&freq=A&px=HS&rg=1%2C2',

      // Query history will be an array of query urls that we will consult before running each query
      queryHistory: [],
      queryQueue: [],

      // We store the time we fire every call here in order to delay calls to fire no more than one per second.
      timestamp: 0,

      // reporter, partner and classification arrays for select2 widgets
      reporterAreasSelect: [],
      partnerAreasSelect: [],
      classificationCodesSelect: [],
      // reporter, partner and classification lookup objects. These are populated during controls creation with data from the reporterAreas.json, partnerAreas.json and clasificationsHS_AG2.json
      reporterAreas: {},
      partnerAreas: {},
      classificationCodes: {},









      /*
       * METHODS
       * */


      /*
       * Initial setup function.
       * Query static JSON files and populate variables. This is an asynchronous function that makes AJAX request and therefore uses a callback
       */
      setup : function (callback) {
        $.when($.ajax('data/reporterAreas.min.json'), $.ajax('data/partnerAreas.min.json'), $.ajax('data/classificationHS_AG2.min.json'))
         .then(function success (reporterAreas, partnerAreas, classificationCodes) {
           // Add results to the data object for use in the app.
           data.reporterAreasSelect       = reporterAreas[0].results;
           data.partnerAreasSelect        = partnerAreas[0].results;
           data.classificationCodesSelect = classificationCodes[0].results;
           reporterAreas[0].results.forEach(function (v) { data.reporterAreas[v.id] = v.text; });
           partnerAreas[0].results.forEach(function (v) { data.partnerAreas[v.id] = v.text; });
           classificationCodes[0].results.forEach(function (v) { data.classificationCodes[v.id] = v.text; });
           // Call the callback
           callback();
         }, function failure (err1, err2, err3) {
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
        var requestUrl = data.baseQueryUrl,
            time = new Date();
        if (options.reporter) { requestUrl += '&r=' +options.reporter; } else { requestUrl += '&r=0'; }
        if (options.partner)  { requestUrl += '&p=' +options.partner;  } else { requestUrl += '&p=all'; }
        if (options.period)   { requestUrl += '&ps='+options.period;   } else { requestUrl += '&ps=now'; }
        if (options.hsCode)   { requestUrl += '&cc='+options.hsCode;   } else { requestUrl += '&cc=AG2'; }

        // Check history to see if query was already run and skip the call if it was already run
        if(data.queryHistory.indexOf(requestUrl) > -1) {
          if (DEBUG) { console.log(time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+': Skipping call:'+requestUrl); }
          callback(null, false);
          return;
        }

        // If the API was called less than a second ago, or if the query is in the queue then we need to postpone the call by (a little more than) a second.
        if (time.getTime() - data.timestamp < 1000 || data.queryQueue.indexOf(requestUrl) > -1) {
          if (DEBUG) { console.log(time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+': Delaying call: '+requestUrl); }
          var timeoutID = window.setTimeout(function () { data.query(options, callback); }, 1100);
          callback(null, false);
          return;
        }

        // Make call
        $.ajax({
          url: requestUrl,
          crossDomain: true,
          context: this,    // NOTE: This is imporant as it binds the callback to the data object we are creating. Otherwise we cannot access any of the properties in the callback.
          beforeSend: function (xhr, settings) {
            if (DEBUG) { console.log(time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+': Making call  : '+requestUrl); }
            // Set the timestamp so that other queries will queue and add the current query to the queue.
            data.timestamp = time.getTime();
            this.queryQueue.push(requestUrl);
          },
          success: function success (data, status, xhr) {
            // Add query to history
            this.queryHistory.push(requestUrl);
            // Remove query from queue if it was there:
            var queueItem = this.queryQueue.indexOf(requestUrl);
            if (queueItem > -1) { this.queryQueue.splice(queueItem, 1); }
            if (DEBUG) { console.log(time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+': Call success : '+requestUrl); }

            // TODO: Add data to crossfilter?

            callback(null, data);
          },
          error: function error (xhr, status, err) {
            if (DEBUG) { console.log(time.getHours()+':'+time.getMinutes()+':'+time.getSeconds()+': Request failed: '+requestUrl+' with status: '+status); }
            callback(err, null);
          }
        });
      }



    };
    return data;
  };

  return singleton();
});
