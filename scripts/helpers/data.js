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
      commodityCodesSelect: [],
      reporterAreas: {},
      partnerAreas: {},
      flowByCode: {},
      commodityCodes: {},
      countryByUnNum: {},
      countryByISONum: {},

      // Crossfilter data
      xFilter: {},
      xFilterByReporter:  {},
      xFilterByPartner:   {},
      xFilterByYear:      {},
      xFilterByCommodity: {},
      xFilterByFlow:      {},
      xFilterByAmount:    {},

      // Formatting functions
      commodityName: function (commodity) {
        var text = this.commodityCodes.get(commodity).text;
        return text.slice(text.indexOf(' - ')+3);
      },






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
        ).then(function success (reporterAreas, partnerAreas, commodityCodes, isoCodes) {
          // Add results to the data object for use in the app.
          data.reporterAreasSelect  = reporterAreas[0].results;
          data.partnerAreasSelect   = partnerAreas[0].results;
          data.commodityCodesSelect = commodityCodes[0].results;

          // Parse isoCodes csv
          var codes = d3.csv.parse(isoCodes[0]);

          // Create d3 maps (these are basically used as lookup tables thoughout the app)
          data.countryByUnNum  = d3.map(codes,                     function (d) { return d.unCode; });
          data.countryByISONum = d3.map(codes,                     function (d) { return d.isoNumerical; });
          data.reporterAreas   = d3.map(reporterAreas[0].results,  function (d) { return d.id; });
          data.flowByCode      = d3.map([{ id: '1', text: 'imports'}, { id: '2', text: 'exports'}, { id: '0', text: 'balance'}], function (d) { return d.id; });
          data.partnerAreas    = d3.map(partnerAreas[0].results,   function (d) { return d.id; });
          data.commodityCodes  = d3.map(commodityCodes[0].results, function (d) { return d.id; });

          // Call the callback
          callback();
        }, function failure (err1, err2, err3, err4) {
          callback('There was an error with one of the initial requests.');
        }); // Close when-then blocks

        // Setup crossfilter and dimensions
        this.xFilter            = crossfilter();
        this.xFilterByReporter  = this.xFilter.dimension(function(d){ return +d.reporter;  });
        this.xFilterByPartner   = this.xFilter.dimension(function(d){ return +d.partner;   });
        this.xFilterByYear      = this.xFilter.dimension(function(d){ return +d.year;      });
        this.xFilterByCommodity = this.xFilter.dimension(function(d){ return d.commodity;  });
        this.xFilterByFlow      = this.xFilter.dimension(function(d){ return +d.flow;      });
        this.xFilterByAmount    = this.xFilter.dimension(function(d){ return +d.value;     });
      },


      /*
       * Run an API query
       * filters argument should be an object in the following form:
       * {
       *   reporter: 826,     // Reporter code in UN format
       *   partner:  862,     // Partner code in UN format
       *   year:     'all',   // Year can be 'all' or apecific year: 2012 (FUTURE: Multi-year queries are allowed for up to 5 years)
       *   commodity:72       // Can be a specific 2-digit HS code or 'TOTAL' or 'AG2'
       * }
       * Callback is called with callback(error, newData)
       * newData will be true if new data was received and added to crossfilter or false otherwise.
       */
      query: function (filters, callback) {
        // Get current time and build URL
        var requestUrl = this._buildUrl(filters),
            time = new Date();

        // Check history to see if query was already run and skip the call if it was already run
        if(data.queryHistory.indexOf(requestUrl) > -1) {
          callback(null, false);
          return;
        }

        // If the API was called less than a second ago, or if the query is in the queue then we need to
        // postpone the call by (a little more than) a second.
        if (time.getTime() - data.timestamp < 1000 || data.queryQueue.indexOf(requestUrl) > -1) {
          window.setTimeout(function () { data.query(filters, callback); }, 1100);
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
            this._addData(data, filters);
            callback(null, data);
          },
          error: function error (xhr, status, err) {
            callback(err, null);
          }
        });
      },


      /*
       * Get a dataset for display
       * filters argument should be an object in the following form:
       * {
       *   reporter: 826,     // Reporter code
       *   partner:  862,     // Partner code
       *   year:     'all',   // Year
       *   commodity:72       // Can be a specific 2-digit HS code or 'TOTAL' or 'AG2'
       * }
       * limit will be used to return the top x number of records
       */
      getData: function (filters, limit) {
        // Clear all filters on the xFilter
        this.xFilterByReporter.filterAll();
        this.xFilterByPartner.filterAll();
        this.xFilterByYear.filterAll();
        this.xFilterByCommodity.filterAll();
        this.xFilterByFlow.filterAll();
        this.xFilterByAmount.filterAll();

        // Add filters by each dimension
        if (typeof filters.reporter !== 'undefined')                                 { this.xFilterByReporter.filter(+filters.reporter); }
        if (typeof filters.partner !== 'undefined')                                  { this.xFilterByPartner.filter(+filters.partner); }
        if (typeof filters.partner === 'undefined' || filters.partner === 'all')     { this.xFilterByPartner.filter(function (d) { return (+d !== 0); }); }
        if (typeof filters.year !== 'undefined' && filters.year !== 'all')           { this.xFilterByYear.filter(+filters.year); }
        if (typeof filters.commodity !== 'undefined' && filters.commodity !== 'AG2') { this.xFilterByCommodity.filter(filters.commodity); }
        if (typeof filters.commodity !== 'undefined' && filters.commodity === 'AG2') { this.xFilterByCommodity.filter(function (d) { return d !== 'TOTAL'; } ); }
        if (typeof filters.commodity === 'undefined')                                { this.xFilterByCommodity.filter(function (d) { return d === 'TOTAL'; } ); }
        if (typeof filters.flow !== 'undefined' && +filters.flow !== 0 )             { this.xFilterByFlow.filter(filters.flow); }

        // Return resulting records
        if (!limit) { limit = Infinity; }
        return this.xFilterByReporter.top(limit);
      },






      /*
       * PRIVATE METHODS
       * (methods that are only used internally in the data module)
       */
      _buildUrl: function (filters) {
        var requestUrl = data.baseQueryUrl;
        if (typeof filters.reporter !== 'undefined')    { requestUrl += '&r=' +filters.reporter; } else { requestUrl += '&r=0'; }
        if (typeof filters.partner !== 'undefined')     { requestUrl += '&p=' +filters.partner;  } else { requestUrl += '&p=all'; }
        if (typeof filters.year !== 'undefined')        { requestUrl += '&ps='+filters.year;     } else { requestUrl += '&ps=now'; }
        if (typeof filters.commodity !== 'undefined')   { requestUrl += '&cc='+filters.commodity;} else { requestUrl += '&cc=AG2'; }
        return requestUrl;
      },

      _addData: function (csvData, filters) {
        // Parse and select the fields from the response we want to store
        var newData = d3.csv.parse(csvData, function (d) {
          return {
            reporter:   +d['Reporter Code'],
            partner:    +d['Partner Code'],
            year:       +d.Year,
            commodity:   d['Commodity Code'],
            flow:       +d['Trade Flow Code'],
            value:      +d['Trade Value (US$)']
          };
        });

        // Run the filters on xFilter and extract the data we already may have
        var xFdata = this.getData(filters);

        // Filter out duplicate records in newData that are already in xFilter before adding newData
        var insertData = newData.filter(function (nd) {
          // Iterate over xFdata and check for duplicates
          var dup = false;
          xFdata.forEach(function (xd) {
            if (
              nd.reporter  === xd.reporter  &&
              nd.partner   === xd.partner   &&
              nd.commodity === xd.commodity &&
              nd.flow      === xd.flow      &&
              nd.year      === xd.year      &&
              nd.value     === xd.value
            ) {
              dup = true;
            }
          });
          return !dup;
        });

        // Add the new data to xFilter
        this.xFilter.add(insertData);

        if(DEBUG) {
          console.groupCollapsed('Added %d new records. Retrieved %d records. Discarded %d duplicates. New xFilter size: %d', insertData.length, newData.length, newData.length-insertData.length, this.xFilter.size());
          console.log('filters: %o', filters);
          console.log('newData: %o', newData);
          console.log('insertData: %o', insertData);
          console.log('xFdata: %o', xFdata);
          console.groupEnd();
        }
      }

    };
    return data;
  };

  return singleton();
});
