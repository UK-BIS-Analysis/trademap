/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, queryObject */


/*
 * THIS FILE SETS UP GENERAL GUI FUNCTIONS THAT DO NOT BELONG TO CONTROLS SPECIFICALLY
 * */


define([], function() {
  'use strict';

  var gui = {

    setup: function () {

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

      // ADD SPECIFIC MENU BEHAVIOURS
      // Build links with http://www.sharelinkgenerator.com if needed
      $('#facebookShareLink').on('click', function (e) {
        e.preventDefault();
        var winTop = (screen.height / 2) - (520 / 2);
        var winLeft = (screen.width / 2) - (350 / 2);
        window.open('https://www.facebook.com/sharer/sharer.php?u='+window.location.href, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + 520 + ',height=' + 350);
      });
      $('#tweetLink').on('click', function (e) {
        e.preventDefault();
        var winTop = (screen.height / 2) - (520 / 2);
        var winLeft = (screen.width / 2) - (350 / 2);
        window.open('https://twitter.com/share?text=Check%20out%20the%20International%20Trade%20in%20Goods%20by%20Country%20and%20Commodity%20DataViz&url='+window.location.href, 'sharer', 'top=' + winTop + ',left=' + winLeft + ',toolbar=0,status=0,width=' + 520 + ',height=' + 350);
      });

      // ADD DOWNLOAD GRAPHS FUNCTIONS
      // Only add download behaviours if this is not an IE brwoser since it will not be supported
      var $downloadChartBtn = $('#downloadChartBtn').hide();
      if (navigator.userAgent.indexOf('MSIE') == -1 && navigator.appVersion.indexOf('Trident/') < 0) {
        var $svgs = $('svg.choropleth, svg.chart')
              .on('mouseover', function (e) {
                var $this = $(this);
                $downloadChartBtn
                  .css({
                    position: 'absolute',
                    top: $this.offset().top,
                    left: $this.offset().left + $this.width()-30
                  })
                  .show();
              })
              .on('mouseout', function (e) {
                $downloadChartBtn.hide();
              });
	  }


    },




    _getCssForSVG: function (svg) {
      // Get the svg id
      // Find main.css or main.min.css in document.styleSheets
      // Find all cssRules where d.selectorText contains 'svg.[id]'
      // Get the cssText of each of the rules and compile into a single string
    },




    _injectCSSintoSVG: function (css, svg) {
      // Inject a <defs> tag with the CSS text into the SVG like follows
      //  <defs>
      //    <style type="text/css"><![CDATA[
      //      .socIcon g {
      //        fill:red;
      //      }
      //    ]]></style>
      //  </defs>
    },



    _downloadSVG: function (svg) {
      // Get SVG id and text
      var svgId = svg.attr('id'),
          svgText = svg.node().parentNode.innerHTML;
      // Fill in data attributes on this link
      $(this)
        .attr('download',svgId+'.svg')
        .attr('title',svgId+'.svg')
        .attr('href','data:image/svg+xml;base64,'+ btoa(graph));
      // Trigger the click now
      $(this).get(0).click();
    },



    showError: function (err) {
      $('#myModalLabel').html('<span class="glyphicon glyphicon-warning-sign"></span> There was an error in querying the COMTRADE API.');
      $('#myModal .modal-body').html(err);
      $('#myModal').modal({ show: true });
    }
  };

  return gui;
});
