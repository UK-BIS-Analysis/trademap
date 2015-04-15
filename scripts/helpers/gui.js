/*jslint browser: true*/
/*jslint white: true */
/*jslint vars: true */
/*global $, Modernizr, d3, dc, crossfilter, document, console, alert, define, DEBUG, queryObject, btoa */


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
      // If this is an IE brwoser then hide the download option since it will not be supported
      if (navigator.userAgent.indexOf('MSIE') !== -1 || navigator.appVersion.indexOf('Trident/') > -1) {
        $('a.downloadSvg').hide();
      }
      $('a.downloadSvg').on('click', function (e) {
        var svgId = $(this).attr('data-target'),
            cssPath = '#'+svgId+' .svgChart',
            $svg = $(cssPath),
            svg = d3.select(cssPath),
            svgText = svg.node().parentNode.innerHTML,
            $this = $(this)
              .attr('download',svgId+'.svg')
              .attr('title',svgId+'.svg')
              .attr('href','data:image/svg+xml;base64,'+ btoa(svgText));
        // Set cleanup
        setTimeout(function ($this) {
          $this
            .attr('download','')
            .attr('title','')
            .attr('href','');
        }, 1000)
      });

      // ADD EMBED GRAPH BUTTON BEHAVIOURS
      $('a.embedSvg').on('click', function (e) {
        e.preventDefault();
      })
    },



    showError: function (err) {
      $('#myModalLabel').html('<span class="glyphicon glyphicon-warning-sign"></span> There was an error in querying the COMTRADE API.');
      $('#myModal .modal-body').html(err);
      $('#myModal').modal({ show: true });
    }
  };

  return gui;
});
