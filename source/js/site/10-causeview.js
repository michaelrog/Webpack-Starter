SITE.causeview = SITE.causeview || {};
SITE.causeview.init = function init() {

    /**
     * Workaround to fake $.browser flags
     * so we can still use the latest version of jQuery and not have to rope in the jquery.migrate plugin...
     */

    jQuery.browser = {};
    jQuery.browser.mozilla = /mozilla/.test(navigator.userAgent.toLowerCase()) && !/webkit/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.webkit = /webkit/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.opera = /opera/.test(navigator.userAgent.toLowerCase());
    jQuery.browser.msie = /msie/.test(navigator.userAgent.toLowerCase());

    /**
     * Taken from: https://api.causeview.com/form/v2.1/scripts/crossdomain.js
     */

    (function($) {
        var g, d, j = 1,
            a, b = this,
            f = !1,
            h = "postMessage",
            e = "addEventListener",
            c, i = b[h] && !jQuery.browser.opera;
        jQuery[h] = function(k, l, m) {
            if (!l) {
                return
            }
            k = typeof k === "string" ? k : jQuery.param(k);
            m = m || parent;
            if (i) {
                m[h](k, l.replace(/([^:]+:\/\/[^\/]+).*/, "$1"))
            } else {
                if (l) {
                    m.location = l.replace(/#.*$/, "") + "#" + (+new Date) + (j++) + "&" + k
                }
            }
        };
        jQuery.receiveMessage = c = function(l, m, k) {
            if (i) {
                if (l) {
                    a && c();
                    a = function(n) {
                        if ((typeof m === "string" && n.origin !== m) || (jQuery.isFunction(m) && m(n.origin) === f)) {
                            return f
                        }
                        l(n)
                    }
                }
                if (b[e]) {
                    b[l ? e : "removeEventListener"]("message", a, f)
                } else {
                    b[l ? "attachEvent" : "detachEvent"]("onmessage", a)
                }
            } else {
                g && clearInterval(g);
                g = null;
                if (l) {
                    k = typeof m === "number" ? m : typeof k === "number" ? k : 100;
                    g = setInterval(function() {
                        var o = document.location.hash,
                            n = /^#?\d+&/;
                        if (o !== d && n.test(o)) {
                            d = o;
                            l({
                                data: o.replace(n, "")
                            })
                        }
                    }, k)
                }
            }
        }
    })(jQuery);

    (function ($) {
        jQuery.fn.loadCauseViewForm = function (options) {
            var options = jQuery.extend({ src: '', applyQueryStrings: false, api: 'https://api.causeview.com', frame_height: "250px", width: "100%" }, options);
            var origin = location.protocol + '//' + location.host + location.pathname;
            var queryString = '', frameSrc = options.src;
            if (options.applyQueryStrings && location.search) {
                queryString = location.search.replace('?', '');
                if (frameSrc.indexOf("?") > 0) frameSrc += "&" + queryString; else frameSrc += "?" + queryString;
                frameSrc += "&";
            }
            else {
                if (frameSrc.indexOf("?") > 0) frameSrc += "&"; else frameSrc += "?";
            }

            frameSrc += "hostUrl=" + encodeURIComponent(origin);

            var iframe = jQuery('<iframe src="' + frameSrc + '" width="' + options.width + '" height="' + options.frame_height + '" scrolling="no" frameborder="0"></iframe>').appendTo(jQuery(this));
            jQuery.receiveMessage(function (e) {
                if (e.data.indexOf('pheight=') >= 0) {
                    var h = Number(e.data.replace('pheight=', ''));
                    if (!isNaN(h) && h > 0) { if (h < 150) h = 150; iframe.height(h); iframe.attr("height", h); }
                }
                if (e.data.indexOf("predirect") >= 0) {
                    var redirect = e.data.replace(/.*predirect=(\S+)(?:&|$)/, '$1');
                    top.window.location = decodeURIComponent(redirect);
                    //top.window.location.replace(decodeURIComponent(redirect));
                }
                if (e.data.indexOf("pselfclose") >= 0) {
                    top.window.self.close();
                }
            }, options.api);

            return false;
        }
    })(jQuery);

};

