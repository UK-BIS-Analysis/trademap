/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define */

/*
 * THIS FILE MANAGES API QUERIES AND CROSSFILTER SETUP
 * */


define(function(require) {
  'use strict';

  // Using require above we are making data a singleton which is created only once. Each module requiring data will be using the same object.
  var data = function () {
    return {

      /*
       * Some basic properties that we store and persist throughout the application
       */
      // Base query url
      baseQueryUrl: 'http://comtrade.un.org/api/get?fmt=csv&max=50000&type=C&freq=A&px=HS&rg=1%2C2&cc=AG2',
      // Query history will be an array of query objects that we will consult before running each query
      queryHistory: [],

      /*
       * Run an API query
       * options argument should be an object in the following form:
       * {
       *   reporter: 826,     // Reporter code (see )
       *   partner:  862,     // Partner code (see )
       *   period:   'all',   // Period can be 'all' or apecific year: 2012 (FUTURE: Multi-year queries are allowed for up to 5 years)
       *   hsCode:   72       // Can be a specific 2-digit HS code or 'TOTAL' or 'AG2'
       * }
       */
      query: function (options, callback) {
        // check istory to see if query was already run
        // add reporter if present
        // add partner if present
        // add period if present
        // add hsCode if present
        // run query
        // call the callback with the returned data
      }
    };
  };

  return data();
});
