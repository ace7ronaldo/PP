
if(typeof window.jstag !== 'object'){
    // if jstag object doesnt exist we are loading sync
    // set master variable so we can block the outlio load
    window.liosetup = window.liosetup || {};
    window.liosetup.sync = true;

    // continue loading the main collection tag
    window.jstag = function() {
        var t = {
                _q: [],
                _c: {},
                ts: (new Date()).getTime()
            },
            l = false,
            w = window,
            d = document,
            src = "/static/io",
            ext = ".min.js",
            as = Array.prototype.slice,
            js = "//api.lytics.io" || "//c.lytics.io",
            url = "//api.lytics.io" || "//c.lytics.io",
            tag = "io",
            ver = "1.0";
        t.init = function(c) {
            url = c.url || url;
            ext = c.min === false ? ".js" : ext;
            tag = c.tag || tag;
            t._c = c;
            return this;
        };
        t.load = function() {
            var jsel, scriptEl = d.getElementsByTagName("script")[0];
            l = true;
            if (d.getElementById(src)) return this;
            jsel = d.createElement("script");
            src = js + "/static/" + tag + ext;
            jsel.id = src;
            jsel.src = src;
            scriptEl.parentNode.insertBefore(jsel, scriptEl);
            return this;
        };
        t.bind = function(e) {
            if (!l) this.load();
            this._q.push([e, as.call(arguments, 1)]);
        };
        t.ready = function() {
            if (!l) this.load();
            this._q.push(["ready", as.call(arguments)]);
        };
        t.send = function() {
            if (!l) this.load();
            this._q.push(["ready", "send", as.call(arguments)]);
            return this;
        };
        return t;
    }();

    var initObj = {
        "cid": "80fba4e2e8129c35be050ecf9b737bb7",
        "url": "//api.lytics.io" || "//c.lytics.io",
        "min": false
    };

    // check for the cross domain cookie setting param
    if(typeof window.liosetup !== 'undefined' && window.liosetup.loadid !== undefined){
        initObj.loadid = window.liosetup.loadid;
    }else{
        initObj.loadid = false;
    }

    // validate that we have url and cid or fail
    if( initObj.cid == "" || initObj.url == "" ){
        console.log("lytics javascript tag configured incorrectly, missing required url or cid")
    }else{
        window.jstag.init(initObj);
    }
}

window.jstag.ready(function(){
  if(typeof window.liosetup !== 'undefined' && window.liosetup.stream !== undefined){
      window.jstag.config.stream = window.liosetup.stream;
  }

  window.jstag.send();
})




var ly_cid = "80fba4e2e8129c35be050ecf9b737bb7";

(function(d, w) {
  if(w.liosetup && w.liosetup.dimension){
    w.liosetup.gaDimension = w.liosetup.dimension;
  }
  if(w.liosetup && w.liosetup.gaDimension){
    w.liosetup.gaSegmentDimension = w.liosetup.gaDimension;
  }

  w.lio = {
    loaded: false,
    lychunk: "",
    apiroot: "https://api.lytics.io" || "https//api.lytics.io",
    cdnroot: "https://c.lytics.io" || "https//c.lytics.io",
    cookie: d.cookie,
    sync: !!w.liosetup && w.liosetup.sync || false,
    fields: !!w.liosetup && w.liosetup.fields || "",
    stream: !!w.liosetup && w.liosetup.stream || "default",
    data: {},
    blacklist:[],
    isBlacklisted: function(suspect){
      return w.lio.blacklist.indexOf(suspect) !== -1;
    },
    segmentsCookie: {},
    segmentsHash: {},
    segmentsString: "",
    segmentsArray: [],
    integrations: { // monitor the status of integration responses [ 200:success, 201:validated (if necessary) 0:na, 500:failed, 400:missing]
      optimizely: 0,
      tealium: 0,
      gtm: 0,
      googleAdsIntegration: 0,
      googleAnalyticsDimension: 0,
      googleAnalyticsUserDimension: 0,
      googleAnalyticsUserid: 0,
      facebookAds: 0,
      addthis: 0,
      qubit: 0,
      googleDFP: 0,
      adroll: 0,
      customDataLayer: 0,
      cookieData: 0
    },
    integrationsConfig:{
      hasActiveCampaign: false,
      allowPathfora: false,
      googleAdsIntegration: null,
      customCookieKeys: []
    },
    integrationTicker: null,       // becomes the loop ticker
    integrationTickerPace: 100,    // try every 100ms
    integrationCounter: 0,         // counts loop iterations
    integrationCounterMax: 600,    // retry every 100 ms for 30 seconds
    debug: !!w.liosetup && w.liosetup.debug,
    debugMsgs: [],
    addDebugMessage: function(m) {
      w.lio.debugMsgs.push(m);
    },
    checkIntegrations: function() {
      w.lio.integrationCounter++;

      // optimizely: customTags must be pushed in prior to loading the optimizely tag, if tag already exists fail forever
      if(w.lio.integrations.optimizely === 0){
        if(w.optimizely){
          w.lio.addDebugMessage("Optimizely loaded before Lytics. Unable to push segments.");
          w.lio.integrations.optimizely = 501;
        }else{
          w.optimizely = w.optimizely || [];
          w.optimizely.push(["customTag", w.lio.segmentsCookie]);
          w.optimizely.push(["activate"]);
          w.lio.integrations.optimizely = 201;
        }
      }
      // optimizely is unique in that we have to push our audiences before their tag loads, the following will validate that they
      // have in fact received the audiences passed above for fail
      if(w.lio.integrations.optimizely === 201){
        if(w.optimizely && w.optimizely.data && w.optimizely.data.customTags){
          w.lio.integrations.optimizely = 200;
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          w.lio.addDebugMessage("Lytics segments failed to load in Optimizely.");
          w.lio.integrations.optimizely = 500;
        }
      }

      // facebook ads: the facebook ads tag must be initialized before our tag, try until it exists or we hit max fail count
      if(w.lio.integrations.facebookAds === 0 && w.lio.segmentsCookie){
        if(w._fbq){
          w._fbq = w._fbq || [];
          var lh = {};

          // facebook only accepts strings as the value so we must use string of true here
          for (var p in w.lio.segmentsCookie) { if(p !== "" && p !== "not_found"){lh[p] = "true";}}

          // only make the call if we have segments
          if(Object.keys(lh).length){
            w._fbq.push(["track", "Lytics Audiences", lh]);
          }

          w.lio.integrations.facebookAds = 200;
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          w.lio.addDebugMessage("Unable to add Facebook audience.");
          w.lio.integrations.facebookAds = 500;
        }
      }

      // google analytics: the google analtyics tag must be initialized before our tag, try until it exists or we hit max fail count
      if(w.lio.integrations.googleAnalyticsDimension === 0){
        if(w.ga && w.liosetup && w.liosetup.gaSegmentDimension){
          w.ga('set', w.liosetup.gaSegmentDimension, w.lio.segmentsString);
          w.lio.integrations.googleAnalyticsDimension = 200;
          w.ga('send', 'event', 'lytics', 'segments', {'nonInteraction': 1});
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          if(w.liosetup && w.liosetup.gaSegmentDimension){
            w.lio.addDebugMessage("Unable to process google analytics custom dimension.");
            w.lio.integrations.googleAnalyticsDimension = 500;
          }
        }
      }
      if(w.lio.integrations.googleAnalyticsUserDimension === 0){
        if(w.ga && w.liosetup && w.liosetup.gaUserDimension){
          w.ga('set', w.liosetup.gaUserDimension, w.lio._uid);
          w.lio.integrations.googleAnalyticsUserDimension = 200;
          w.ga('send', 'event', 'lytics', 'user_dimension', {'nonInteraction': 1});
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          if(w.liosetup && w.liosetup.gaUserDimension){
            w.lio.addDebugMessage("Unable to process google analytics custom user dimension.");
            w.lio.integrations.googleAnalyticsUserDimension = 500;
          }
        }
      }
      if(w.lio.integrations.googleAnalyticsUserid === 0){
        if(w.ga && w.liosetup && w.liosetup.gaUserId){
          w.ga('set', '&uid', w.lio.getCookie("seerid"));
          w.lio.integrations.googleAnalyticsUserid = 200;
          w.ga('send', 'event', 'lytics', 'user_id', {'nonInteraction': 1});
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          if(w.liosetup && w.liosetup.gaUserId){
            w.lio.addDebugMessage("Unable to process google analytics user id.");
            w.lio.integrations.googleAnalyticsUserid = 500;
          }
        }
      }

      // google adwords integration handler
      if(w.lio.integrations.googleAdsIntegration === 0){
        if(w.ga && w.lio.integrationsConfig && w.lio.integrationsConfig.googleAdsIntegration){
          // get the google web property
          ga(function() {
            var trackers = ga.getAll(),
                trackingIds = [];

            for (var i = 0, len = trackers.length; i < len; i++) {
              var id = trackers[i].get('trackingId'),
                  name = trackers[i].get('name');

              id && trackingIds.push({"name":name, "id":id});
            }

            for (i = 0; i < w.lio.integrationsConfig.googleAdsIntegration.length; i++) {
              var integrationsConfig = w.lio.integrationsConfig.googleAdsIntegration[i];

              for (var j = 0; j < trackingIds.length; j++) {
                if(integrationsConfig.web_property === trackingIds[j].id){
                  var name = trackingIds[j].name;
                  w.ga(name + '.require', 'displayfeatures');
                  w.ga(name + '.set', integrationsConfig.segments_dimension, w.lio.segmentsString);
                  w.ga(name + '.set', integrationsConfig.user_id_dimension, w.lio._uid);
                  w.ga(name + '.send', 'event', 'lytics', 'lytics_google_integration', {'nonInteraction': 1});
                }
              }
            }
          });
          w.lio.integrations.googleAdsIntegration = 200;
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          if(w.lio.integrationsConfig && w.lio.integrationsConfig.googleAdsIntegration){
            w.lio.addDebugMessage("Unable to process google ads integration.");
            w.lio.integrations.googleAdsIntegration = 500;
          }
        }
      }

      // google dfp integration handler: the lio.js script must be loaded in the <head></head> AFTER
      // the google dfp tags, so basically at the end of the document head
      if(w.lio.integrations.googleDFP === 0){
        if(w.googletag){
          w.googletag.cmd.push(function() {
            w.googletag.pubads().setTargeting("LyticsSegments", w.lio.segmentsArray);
          });

          if(!w.lio.sync){
            w.lio.addDebugMessage("Using Lytics async tag to integrate with DFP. No audiences passed.");
            w.lio.integrations.googleDFP = 201;
          }else{
            w.lio.integrations.googleDFP = 200;
          }
        }else{
          w.lio.addDebugMessage("GoogleDFP tags not loaded before Lytics. Unable to push segments.");
          w.lio.integrations.googleDFP = 501;
        }
      }

      // addthis: the addthis tag must be initialized before our tag, try until it exists or we hit max fail count
      if(w.lio.integrations.addthis === 0 && w.lio.segmentsCookie){
        if(w.addthis){
          var ckParts,
              ckNew = [];

          if(w.lio.getCookie('__attag')){
            ckParts = w.lio.getCookie('__attag').split(',');

            // remove the old segments from the cookie
            for (var i = 0; i < ckParts.length; i++) {
                if( ckParts[i].indexOf("lio:") > -1 ){
                  // do nothing, we are removing all of the lytics segment slugs
                }else{
                  ckNew.push(ckParts[i]);
                }
            }

            // add the current segments to the cookie in order to keep our tags updated without
            // disturbing other params passed outside of lytics we append lio: to each segment slug
            for (var lioKey in w.lio.segmentsCookie) {
              ckNew.push('lio:'+lioKey);
            }
            w.lio.setCookie('__attag', ckNew.join(), '43829'); // 4829 = one month
          }

          for (var s in w.lio.segmentsCookie) {
            if(s !== "" && s !== "not_found"){
              w.addthis.user.tag('lio:' + s);
            }
          }
          w.lio.integrations.addthis = 200;
        }else if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
          w.lio.addDebugMessage("Unable to add addthis segments.");
          w.lio.integrations.addthis = 500;
        }
      }

      // tealium data layer
      if(w.lio.integrations.tealium === 0 && w.jstag && w.utag_data && !w.lio.isBlacklisted("tealium")){
        w.jstag.send(w.lio.stream, w.utag_data);
        w.lio.integrations.tealium = 200;
      }

      // gtm data layer
      if(w.lio.integrations.gtm === 0 && w.jstag && (w.dataLayer || w.__dataLayer) && !w.lio.isBlacklisted("gtm")){
        if(typeof w.dataLayer !== 'undefined'){
          // for gtm we need to check the length of the object in the array. in all my testing it looks like the
          // default events are all less than 3 keys, in some cases good data is being passed as a single key so
          // we can't just kill anything less than 3. need to do a check for event, if its longer than 2 or does
          // not include an event key we include it. that should catch custom events as well as custom data.
          for(var dk = 0; dk < w.dataLayer.length; dk++) {
              if(Object.keys(w.dataLayer[dk]).length > 2 || !("event" in w.dataLayer[dk])){
                w.jstag.send(w.lio.stream, w.dataLayer[dk]);
                w.lio.integrations.gtm = 200;
              }
          }

          w.dataLayer.push({'lytics_segments': w.lio.segmentsHash});
        }

        if(typeof w.__dataLayer !== 'undefined'){
          // same as above just old naming
          for(var dk = 0; dk < w.__dataLayer.length; dk++) {
              if(Object.keys(w.__dataLayer[dk]).length > 2 || !("event" in w.__dataLayer[dk])){
                w.jstag.send(w.lio.stream, w.__dataLayer[dk]);
                w.lio.integrations.gtm = 200;
              }
          }

          w.__dataLayer.push({'lytics_segments': w.lio.segmentsHash});
        }
      }

      // qubit data layer
      if(w.lio.integrations.qubit === 0 && w.jstag && w.universal_variable && !w.lio.isBlacklisted("qubit")){
        w.jstag.send(w.lio.stream, w.universal_variable);
        w.lio.integrations.qubit = 200;
      }

      // adroll event integration
      if(w.lio.integrations.adroll === 0 && w.jstag && w.__adroll){
        for (var lioKey in w.lio.segmentsCookie) {
          var segfmt = "lytics_" + lioKey;
          w.__adroll.record_user({"adroll_segments": segfmt});
        }

        w.lio.integrations.adroll = 200;
      }

      // hidden by default but handy to make sure we aren't checking too often
      if(w.lio.debug && !(w.lio.integrationCounter % 10)){
        console.log("tick...");
      }

      // if debug is on then output each of the error messages
      if(w.lio.integrationCounter >= w.lio.integrationCounterMax){
        clearInterval(w.lio.integrationTicker);
        if(w.lio.debug){
          if(!w.lio.debugMsgs.length){
            console.log("lytics integration completed without errors.");
          }else{
            for(var i = 0; i < w.lio.debugMsgs.length; i++){
              console.log(w.lio.debugMsgs[i]);
            }
          }
        }
      }

      // has cookie whitelist
      if(w.lio.integrations.cookieData === 0 && w.lio.integrationsConfig.customCookieKeys){
        var val, payload = {};

        // iterate over keys and get cookie value
        for (var i = 0, n = w.lio.integrationsConfig.customCookieKeys; i < n.length; i++) {
          val = w.lio.getCookie(n[i]);
          if(val){
            payload[n[i]] = val;
          }
        }

        // if the object is empty pass the 201 response to signify no results
        if(Object.keys(payload).length !== 0){
          w.jstag.send(w.lio.stream, payload);
          w.lio.integrations.cookieData = 200;
        }else{
          w.lio.integrations.cookieData = 201;
        }
      }

      

    },
    setCookie: function(name, value, minutes) {
      var date = new Date();
      date.setTime(date.getTime() + (minutes * 60 * 1000));

      var expires = "expires=" + date.toUTCString();
      d.cookie = name + "=" + encodeURIComponent(JSON.stringify(value)) + "; " + expires;
    },
    getCookie: function(name){
      var re = new RegExp(name + "=([^;]+)");
      var value = re.exec(decodeURIComponent(w.lio.cookie));
      var output = (value !== null) ? unescape(value[1]) : undefined;

      return output;
    },
    getQueryParam: function(name){
      var url = window.location.search,
          regex = new RegExp("[?;&]" + name + "(=?)(.*?)([;&]|$)"),
          results = regex.exec(url);

      if (!results) return null;
      if (!results[1]) return true;

      return decodeURIComponent(results[2].replace(/\+/g, " "));
    },
    _uid: null,
    // helper method to determine if user is member of segment
    inSegment: function(seg){
      return !!window.lio.segmentsHash[seg];
    },
    addPathfora: function(){
      if(w.lio.integrationsConfig){
        var pfScript = d.createElement('script');
          pfScript.async = 1;
          pfScript.type = 'text/javascript';
          pfScript.src = '//c.lytics.io/static/pathfora.min.js';
          pfScript.onload = w.lio.initPathfora;
        d.getElementsByTagName('head')[0].appendChild(pfScript);
      }
    },
    isPathforaPreview: function(){
      return !!(w.lio.getQueryParam('lytics_variation_preview_id'));
    },
    initPathfora: function(){
      var previewId = w.lio.getQueryParam('lytics_variation_preview_id')

      if(previewId){
        // if there is a preview id override all other pathfora configs
        var pfConfig = d.createElement('script');
          pfConfig.async = 1;
          pfConfig.type = 'text/javascript';
          pfConfig.src = w.lio.apiroot + '/api/program/campaign/variation/preview/'+w.ly_cid+'/'+previewId+'/config.js';
        d.getElementsByTagName('body')[0].appendChild(pfConfig);
      }else{
        // there is no override, if we need pathfora load the production level details
        var pfConfig = d.createElement('script');
          pfConfig.async = 1;
          pfConfig.type = 'text/javascript';
          pfConfig.src = w.lio.cdnroot + '/api/program/campaign/config/'+w.ly_cid+'/config.js';
        d.getElementsByTagName('body')[0].appendChild(pfConfig);
      }
    },
    // prepares all the lio data elements for hiding / showing based on membership
    prepElements: function(attr){
      var lioDataElements = {},
        lioGroup,
        lioType,
        lioTrigger;

      if(!w.lio.lioElements){
        w.lio.lioElements = document.getElementsByTagName('*');
      }

      var lioElements = w.lio.lioElements;
      for (var i = 0, n = lioElements.length; i < n; i++) {
        if (lioElements[i].getAttribute(attr) !== null) {
          var theElement = lioElements[i];
          lioGroup = theElement.getAttribute('data-liogroup');
          lioType = theElement.getAttribute('data-liotype');
          lioTrigger = theElement.getAttribute('data-liotrigger');

          if(!lioGroup){
            lioGroup = "default";
          }

          if(!lioDataElements[lioGroup]){
            lioDataElements[lioGroup] = [];
          }

          lioDataElements[lioGroup].push({
            elem: theElement,
            displayType: theElement.style.display,
            group: lioGroup,
            type: lioType,
            trigger: lioTrigger
          });
        }
      }

      return lioDataElements;
    },
    // processes all elements with a lio attribute data-liotrigger
    procElements: function(){
      var elementObj = w.lio.prepElements('data-liotrigger');

      for (var key in elementObj) {
        var matched = false;
        var defaultEl = {};

        for (var i = 0, n = elementObj[key].length; i < n; i++){
          var singleElementObj = elementObj[key][i];

          // if we find a match show that and prevent others from showing in same group
          if(w.lio.inSegment(singleElementObj.trigger) && !matched){
            singleElementObj.elem.removeAttribute("data-liotrigger");
            singleElementObj.elem.setAttribute("data-liomodified", "true");

            if(key !== "default"){
              matched = true;
              continue;
            }
          }

          // if this is the default save it
          if(singleElementObj.trigger == "default"){
            defaultEl = singleElementObj;
          }
        }

        // if nothing matched show default
        if(!matched && key != "default" && defaultEl.elem){
          defaultEl.elem.removeAttribute("data-liotrigger");
          defaultEl.elem.setAttribute("data-liomodified", "true");
        }
      }

      w.lio.preppedElements = elementObj;
    },
    keysForObject: Object.keys || function(obj) {
      var keys = [];

      for (var i in obj) {
        if (obj.hasOwnProperty(i)) {
          keys.push(i);
        }
      }

      return keys;
    },
    hasDOMContentLoaded: false,
    DOMready: false,
    DOMreadyMethod: null,
    segmentscb: function(json) {
      if (json.data && json.data.segments) {
        var segList = json.data.segments;
        for (var i = segList.length - 1; i >= 0; i--) {
          w.lio.segmentsHash[segList[i]] = segList[i];
          w.lio.segmentsArray.push(segList[i]);
        }
        w.lio.segmentsCookie = w.lio.segmentsHash;
        w.lio.segmentsString = w.lio.keysForObject(w.lio.segmentsHash).toString().replace(/,+/g, ',');
        w.lio.setCookie("ly_segs", w.lio.segmentsHash, 15);
        w.lio.data = json.data;

        if(document.addEventListener){
          // Listen for "DOMContentLoaded"
          document.addEventListener("DOMContentLoaded", function(event) {
              w.lio.hasDOMContentLoaded = true;
              w.lio.initLioDOM("DOMContentLoaded", json.data);
          });

          // Listen for "load"
          document.addEventListener("load", function(event) { w.lio.initLioDOM("load", json.data); });
        }

        // Listen for "onreadystatechange"
        document.onreadystatechange = function () { w.lio.initLioDOM("onreadystatechange", json.data); }
      }

      w.lio.loaded = true;

      // start integration check, check immediately then every 100ms thereafter
      w.lio.checkIntegrations();
      w.lio.integrationTicker = setInterval(w.lio.checkIntegrations, w.lio.integrationTickerPace);

      // load pathfora if account says so
      if(w.lio.integrationsConfig && w.lio.integrationsConfig.allowPathfora && (w.lio.integrationsConfig.hasActiveCampaign || w.lio.isPathforaPreview())){
        w.lio.addPathfora();
      }
    },
    initLioDOM: function(method, data) {
      if(!w.lio.DOMready) {
        w.lio.DOMready = true;
        w.lio.DOMreadyMethod = method;

        w.lio.procElements();
        w.liosetup && w.liosetup.callback && w.liosetup.callback(data);
      }
    }
  };

  w.lio._uid = w.lio.getCookie("seerid");

  if (w.lio.getCookie("ly_segs")) {
    w.lio.segmentsCookie = JSON.parse(w.lio.getCookie("ly_segs"));
  }

  if(w.liosetup && w.liosetup.field && w.liosetup.value){
    if(!w.liosetup.field){
      w.lio.addDebugMessage("field is blank, Lytics audiences will not be loaded.");
    }

    if(!w.liosetup.value){
      w.lio.addDebugMessage("value is blank, Lytics audiences will not be loaded.");
    }

    w.lio.lychunk = w.ly_cid + "/" + w.liosetup.field + "/" + w.liosetup.value;
  } else {
    w.lio.lychunk = w.ly_cid + "/" + w.lio.getCookie("seerid");
  }

  // for our automatic element handling we need to ensure they are all hidden by default
  // so do that.
  var css = '[data-liotrigger]{ display: none; }';
  var style = d.createElement('style');
  style.type = 'text/css';

  if (style.styleSheet) { // handle ie
      style.styleSheet.cssText = css;
  } else {
      style.appendChild(d.createTextNode(css));
  }

  d.getElementsByTagName('head')[0].appendChild(style);

  var apiurl = w.lio.apiroot + "/api/me/" + w.lio.lychunk + "?fields=" + w.lio.fields + "&segments=true&callback=window.lio.segmentscb";

  // if the sync tag is used, block loading, otherwise load async
  if(w.lio.sync){
    if (document.readyState !== "complete" && document.readyState !== "loaded" && document.readyState !== "interactive") {
      try {
        d.write('\x3Cscript type="text/javascript" src="' + apiurl + '">\x3C/script>');
        return;
      }
      catch(err) {
        console.warn('Failed to initialize lytics synchronously: defaulting to asynchronous');
      }
    }else{
      console.warn('DOM already loaded, unable to load lytics synchronously: defaulting to asynchronous');
    }
  }

  var outlioScript = d.createElement('script');
  outlioScript.async = 1;
  outlioScript.type = 'text/javascript';
  outlioScript.src = apiurl;
  d.getElementsByTagName('head')[0].appendChild(outlioScript);

}(document, window));
