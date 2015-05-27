/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*jslint nomen: true*/
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, introJs */


/*
 * THIS FILE SETS UP the introduction
 * */


define(function(require) {
  'use strict';

  var steps = [
    // Welcome & description
    {
      intro: '<h3>Welcome to the International Trade in Goods visualization.</h3>'+
             '<p style="font-size: 14px">This tool allows you to explore official trade data using live data from the UN COMTRADE database.</p>'+
             '<p style="font-size: 14px">The tool was developed by the Department for Business Innovation and Skills (UK).</p>'
    },
    // Controls (overview)
    {
      element: document.querySelector('#controls'),
      intro: "The controls at the top of the page allow you to filter the data and explore trade statistics.",
      position: 'bottom-middle-aligned'
    },
    // Map
    {
      element: document.querySelector('#choroplethTitle .chartTitle'),
      intro: "The map visualization shows at a glance the top trading partners for the selected reporter, optionally for a specific commodity if one is selected.",
      position: 'bottom-middle-aligned'
    },
    // Key facts box
    {
      element: document.querySelector('#infoBox'),
      intro: "The key facts box gives you a breakdown of the main trade statistics between your selected reporter and partner. If you hover your mouse on the map it will also give you quick insights into the areas hovered.",
      position: 'right'
    },
    // Charts
    {
      element: document.querySelector('#yearChart .chartTitle'),
      intro: "Below the map you have a few charts showing you details based on your filter selection. Please note that charts will be displayed and hidden based on your selections.",
      position: 'top'
    },
    // Controls (detail)
    {
      element: document.querySelector('#selectReporterContainer'),
      intro: "The reporter is your starting point. You can't select a partner or commodity without having selected a reporter first.",
      position: 'right'
    },
    {
      element: document.querySelector('#selectPartnerContainer'),
      intro: "Selecting a partner will allow you to see details of commodities and trade flows between your selected reporter and partner. The details will show in the Key facts box and on the graphs below the map.",
      position: 'bottom-middle-aligned'
    },
    {
      element: document.querySelector('#selectCommodityContainer'),
      intro: "The commodities list is a classification of goods that allows you to drill down on the trade data. Selecting a commodity will update the map and the graphs below.",
      position: 'left'
    },
    // Feeback
    {
      element: document.querySelector('#feedback-tab'),
      intro: "When you're done we'd really appreciate your impressions and ideas.",
      position: 'left'
    },
    // Goodbye
    {
      intro: "Now try it yourself!"
    }
  ];


  var intro = {

    setup: function (urlParameters) {
      // Setup intro and utility functions
      var intro = introJs(),
          introCookie = document.cookie.replace(/(?:(?:^|.*;\s*)introDone\s*\=\s*([^;]*).*$)|^.*$/, "$1"),
          preventScroll = function (event) {
            var code = event.keyCode || event.which;
            if (['wheel', 'mousewheel', 'DOMMouseScroll'].indexOf(event.type) > -1 || [32, 33, 34, 35, 36, 38, 40].indexOf(code) > -1) {
              event.preventDefault();
            }
          },
          disableScroll = function () {
            $(window).on('mousewheel.trademap DOMMouseScroll.trademap keydown.trademap', preventScroll);
          },
          enableScroll = function () {
            $(window).off('mousewheel.trademap DOMMouseScroll.trademap keydown.trademap');
          },
          scrollToElement = function (target) {
            var topOffset = Math.max(0, $(target).offset().top-$(window).height()/2);
            // Exceptions:
            if (target.id === 'selectReporterContainer') {
              topOffset = 0;
            }
            if (target.id === 'infoBox') {
              topOffset = 0;
              $('#infoBox').css('top', ($(window).height()-$('#infoBox').height() - 10) +'px');
            }
            $('html, body').animate({
              scrollTop: topOffset
            }, 500);
          },
          setCookie = function(){
            document.cookie = "introDone=true; expires=Fri, 31 Dec 9999 23:59:59 GMT; path=/";
          },
          startIntro = function () {
            $('html, body').animate({
              scrollTop: 0
            }, 500);
            disableScroll();
            intro.start();
          },
          startIntroAfterLoad = function (event) {
            if (event.queryCount === 0) {
              startIntro();
              window.removeEventListener('queryQueueUpdate', startIntroAfterLoad, false);
            }
          },
          finishIntro = function () {
            enableScroll();
            setCookie();
          };

      // Configure introjs
      intro.setOptions({
        skipLabel: '<span class="glyphicon glyphicon-remove"></span>',
        doneLabel: '<span class="glyphicon glyphicon-remove"></span>',
        nextLabel: '<span class="glyphicon glyphicon-arrow-right"></span>',
        prevLabel: '<span class="glyphicon glyphicon-arrow-left"></span>',
        showBullets: false,
        showStepNumbers: false,
        scrollToElement: false, // We are making our own function below for this
        steps: steps
      });
      intro.oncomplete(finishIntro);
      intro.onexit(finishIntro);
      intro.onbeforechange(scrollToElement);

      // Bind start to #startIntro menu option
      $('#startIntro').click(function (event) {
        event.preventDefault();
        startIntro();
      });

      // Start automatically if there is no cookie introDone=true
      // Or force the intro if we have a url parameter intro=true
      if((!introCookie || urlParameters.intro === 'true') && $(window).width() > 800) {
        // Listen for the "queryQueueUpdate" event and for the event to specify queryCount=0 to trigger the
        // start of the intro once the initial queries have completed
        window.addEventListener('queryQueueUpdate', startIntroAfterLoad, false);
      }

    }

  };

  return intro;
});
