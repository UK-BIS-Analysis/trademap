/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG */


/*
 * THIS FILE SETS UP the introduction
 * */


define(function(require) {
  'use strict';

  var intro = {

    setup: function () {

      // Listen for the "queryQueueUpdate" event and for the event to specify queryCount=0 to trigger the
      // start of the intro once the initial queries have completed
      var waitForLoad = function (event) {
        if (event.queryCount === 0) {
          console.log('Start the intro!!!');
          var intro = introJs();
          intro.setOptions({
            steps: [
              {
                intro: "Welcome to the BIS-COMTRADE Trade Visualization tool!"
              },
              {
                element: document.querySelector('#controls'),
                intro: "These are the controls of the viz."
              }
            ]
          });

          intro.start();
          window.removeEventListener('queryQueueUpdate', waitForLoad, false)
        }
      }
      window.addEventListener('queryQueueUpdate', waitForLoad, false)



      // set cookie: document.cookie = "introDone=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
      // delete cookie: document.cookie = "introDone=true; expires=Thu, 01 Jan 1970 00:00:00 GMT; path=/";
    }

  };

  return intro;
});
