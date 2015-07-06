/**
 * fontFaceCheck v0.2
 * Roel Nieskens, November 11, 2013
 *
 * Released under the MIT License. http://www.opensource.org/licenses/mit-license.php
 *
 * http://pixelambacht.nl/2013/font-face-render-check/
 *
 * Usage:
 * 1. If you call fontFaceCheck.support(), either a fontfacerender or a no-fontfacerender class
 *    will be added to the HTML tag.
 * 2. Or use a callback function to grab the test result:
 *    fontFaceCheck.support( function(isSupported) { alert(isSupported) } );
 *
 * For IE8 and below, also pass the path to the EOT font: fontFaceCheck.support('/my/font/');
 *
 * Should work on all JavaScript-enabled browsers, old or new
 *
 * Inspired by the work of Paul Irish: http://www.paulirish.com/2009/font-face-feature-detection/
 */
var fontFaceCheck = new function() {

    var doc = document,
        body = doc.body || doc.documentElement.appendChild(doc.createElement("fontface")),
        tempElm = doc.createElement("span"),
        tempStyle = doc.createElement("style"),
        delay = 5,
        runs = 20,
        supported,

        // Gratefully taken from https://gist.github.com/padolsey/527683
        ie = (function(){
            var undef,
                v = 3,
                div = doc.createElement("div"),
                all = div.getElementsByTagName("i");

            while (
                div.innerHTML = "<!--[if gt IE " + (++v) + "]><i></i><![endif]-->",
                all[0]
            );

            return v > 4 ? v : undef;
        }()),

        checkSupport = function(fontPathEOT, callback) {
        // Use timeout because Gecko and Webkit load data-uri font asynchronously :(
        // setTimeout(function(){
        supported = (tempElm.offsetWidth / Math.max(1, tempElm.offsetHeight)) >= 5;
        if(!supported && runs-- > 0)
        {
            setTimeout(function(){
                checkSupport(fontPathEOT, callback);
            }, delay);
            return;
        }
        body.removeChild(tempElm);
        // When font doesn't load, ratio will be less than or equal to 1. When loaded, it will
        // be 10. Check if it"s more than 5 to account for offsetWidth/offsetHeight wonkyness.
        if(callback) {
            callback(supported);
        } else  {
            doc.getElementsByTagName("html")[0].className += supported ? " fontfacerender" : " no-fontfacerender";
        }
    };

    // Check @font-face support by trying to render our test icon
    this.support = function(fontPathEOT, callback) {
        fontPathEOT = fontPathEOT || "./";

        tempElm.setAttribute("style", "font-family:pixelambacht !important;position:fixed;visibility:hidden");
        tempElm.innerHTML = "-";
        body.appendChild(tempElm);

        tempStyle.type = "text/css";
        doc.getElementsByTagName("head")[0].appendChild(tempStyle);

        if(ie <= 8)
        {
            // IE<8 doesn't support fonts via data-uri, so get external .eot file. To assure it's
            // present when the test is executed, download it to cache via a synchronous XHR call
            var request = new XMLHttpRequest();
            request.open("GET", fontPathEOT+"pixelambacht.eot", false);
            request.send(null);
            tempStyle.styleSheet.cssText = "@font-face{font-family:pixelambacht;src:url('"+fontPathEOT+"pixelambacht.eot');}";
        }
        else
        {
            // Load TTF via data-uri
            tempStyle.textContent = "@font-face{font-family:pixelambacht;src:url(data:font/truetype;base64,AAEAAAALAIAAAwAwT1MvMghABuMAAAC8AAAAYGNtYXAAlQDaAAABHAAAAGRnYXNw//8ABAAAAYAAAAAIZ2x5Zv8nt3kAAAGIAAAATGhlYWQQRDZ2AAAB1AAAADZoaGVhFeIT5AAAAgwAAAAkaG10eBUAAAAAAAIwAAAADGxvY2EAEAAmAAACPAAAAAhtYXhwAAUAEwAAAkQAAAAgbmFtZf0RHiMAAAJkAAAAwHBvc3QAAwAAAAADJAAAACAAAwIAAZAABQAAAUwBZgAAAEcBTAFmAAAA9QAZAIQAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAABAACAALQHg/+D/4AHgACAAAAAAAAAAAAAAAAAAAAAgAAAAAAACAAAAAwAAABQAAwABAAAAPAAEACgAAAAGAAQAAQACACAALf//AAAAIAAt////4f/VAAEAAAAAAAAABAAoAAAABgAEAAEAAgAgAC3//wAAACAALf///+H/1QABAAAAAAAAAAAAAf//AAMAAQAAAAAAAAAAAAIADLgAAI24AASNuAH/hTE5AQAAAAABAAD/4BQAAeAABAAMuAAAjbgABI24Af+FESERIREUAOwAAeD+AAIAAAAAAAEAAAABAAC9n9JNXw889QALAgAAAAAAzqbp9AAAAADOfgvFAAD/4BQAAeAAAAAIAAIAAAAAAAAAAQAAAeD/4AAAFAAAAAAAFAAAAQAAAAAAAAAAAAAAAAAAAAMAAAAAAQAAABQAAAAAAAAAABAAJgABAAAAAwAFAAEAAAAAAAIAAAAAAAAAAAAAAAwAAAAAAAAADgCwAAEAAAAAAAEAAAAAAAEAAAAAAAIAAAAAAAEAAAAAAAMAAAAAAAEAAAAAAAQAAAAAAAEAAAAAAAUAAAAAAAEAAAAAAAYAAAAAAAEAAAAAAAoAAAAAAAMAAQQJAAEAAgACAAMAAQQJAAIAAgAGAAMAAQQJAAMAAgAKAAMAAQQJAAQAAgAOAAMAAQQJAAUAAAAAAAMAAQQJAAYAAAAAAAMAAQQJAAoAAAAAAAD+/wBy/v8Ab/7/AGX+/wBsAAMAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA=)}";
        }

        checkSupport(fontPathEOT, callback);
    };
};
