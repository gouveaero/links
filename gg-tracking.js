/**
 * gg-tracking.js — Meta Pixel + GA4 + Google Ads + CAPI fan-out for Gabriel's static sites.
 *
 * Vanilla port of the tracking-pixels skill layer (src/lib/track.ts + PixelBootstrap.tsx in
 * gabrielgouvea.com.br). Identical copies live in: links, slides-hub, gouveagrowth.com.br.
 * Change one, change all.
 *
 * Every track() fires the browser pixel AND posts the same event_id to the sidecar
 * (gg-tracking on Coolify), which forwards to Meta CAPI (and GA4 MP once its secret exists).
 * Meta dedups browser + server by event_id.
 *
 * Usage:
 *   <script src="/gg-tracking.js" defer></script>
 *   Optional on the same tag:
 *     data-rules='{"#contact a": "Contact"}'   click rules: CSS selector → event name
 *     data-spa-pageview                         also fire PageView on pushState route changes
 *   Any element with data-track="EventName" fires that event on click.
 *   mailto:, tel: and wa.me links fire Contact automatically.
 *   window.ggTrack(name, params) is exposed for custom calls.
 */
(function () {
  if (window.ggTrack) return;

  var META_PIXEL_ID = '1169238995661563';
  var GA4_ID = 'G-MCGBF74NZ8';
  var GADS_ID = 'AW-18541724708';
  // Google Ads conversion labels, one per event. Empty until the conversion actions exist.
  var GADS_LABELS = {};
  var ENDPOINT = /(^|\.)gouveagrowth\.com\.br$/.test(location.hostname)
    ? 'https://track.gouveagrowth.com.br/api/track'
    : 'https://track.gabrielgouvea.com.br/api/track';

  var GA4_NAME = {
    PageView: 'page_view',
    ViewContent: 'view_item',
    Lead: 'generate_lead',
    CompleteRegistration: 'sign_up',
    InitiateCheckout: 'begin_checkout',
    Contact: 'contact',
    Schedule: 'schedule',
    SubmitApplication: 'submit_application',
    Search: 'search',
  };

  var script = document.currentScript;

  function getCookie(name) {
    var hit = document.cookie
      .split(';')
      .map(function (c) { return c.trim(); })
      .find(function (c) { return c.indexOf(name + '=') === 0; });
    return hit ? decodeURIComponent(hit.slice(name.length + 1)) : undefined;
  }

  function setCookie(name, value, days) {
    var expires = new Date(Date.now() + days * 864e5).toUTCString();
    var root = location.hostname.split('.').slice(-3).join('.'); // gabrielgouvea.com.br
    var domainAttr = location.hostname.indexOf('.') > -1 ? '; Domain=.' + root : '';
    var secureAttr = location.protocol === 'https:' ? '; Secure' : '';
    document.cookie = name + '=' + encodeURIComponent(value) + '; Expires=' + expires + '; Path=/' + domainAttr + '; SameSite=Lax' + secureAttr;
  }

  // _fbc only exists when the visit came from an ad click — never synthesize it otherwise.
  function captureAttribution() {
    var fbclid = new URLSearchParams(location.search).get('fbclid');
    if (fbclid && !getCookie('_fbc')) setCookie('_fbc', 'fb.1.' + Date.now() + '.' + fbclid, 90);
  }

  function gtagGet(field) {
    return new Promise(function (resolve) {
      var done = false;
      var finish = function (v) { if (!done) { done = true; resolve(v == null ? undefined : String(v)); } };
      window.gtag('get', GA4_ID, field, finish);
      setTimeout(function () { finish(undefined); }, 500);
    });
  }

  function uuid() {
    return window.crypto && crypto.randomUUID
      ? crypto.randomUUID()
      : Date.now() + '-' + Math.random().toString(36).slice(2);
  }

  function bootstrap() {
    /* eslint-disable */
    !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
    n.callMethod.apply(n,arguments):n.queue.push(arguments)};
    if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
    n.queue=[];t=b.createElement(e);t.async=!0;
    t.src=v;s=b.getElementsByTagName(e)[0];
    s.parentNode.insertBefore(t,s)}(window,document,'script',
    'https://connect.facebook.net/en_US/fbevents.js');
    /* eslint-enable */
    window.fbq('init', META_PIXEL_ID);

    var g = document.createElement('script');
    g.async = true;
    g.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA4_ID;
    document.head.appendChild(g);
    window.dataLayer = window.dataLayer || [];
    window.gtag = function () { window.dataLayer.push(arguments); };
    window.gtag('js', new Date());
    window.gtag('config', GA4_ID, { send_page_view: false });
    window.gtag('config', GADS_ID, { allow_enhanced_conversions: true });
  }

  function track(name, params) {
    params = params || {};
    var event_id = uuid();
    var event_time = Math.floor(Date.now() / 1000);

    window.fbq('track', name, { value: params.value, currency: params.currency }, { eventID: event_id });
    window.gtag('event', GA4_NAME[name] || name.toLowerCase(), {
      value: params.value,
      currency: params.currency,
      transaction_id: event_id,
      engagement_time_msec: 1,
    });
    if (GADS_LABELS[name]) {
      window.gtag('event', 'conversion', {
        send_to: GADS_ID + '/' + GADS_LABELS[name],
        value: params.value,
        currency: params.currency || 'BRL',
        transaction_id: event_id,
      });
    }

    return Promise.all([gtagGet('client_id'), gtagGet('session_id')]).then(function (ids) {
      return fetch(ENDPOINT, {
        method: 'POST',
        keepalive: true,
        mode: 'cors',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name,
          params: params,
          event_id: event_id,
          event_time: event_time,
          event_source_url: location.href,
          ga4_client_id: ids[0],
          ga4_session_id: ids[1],
        }),
      });
    }).catch(function () { /* silent */ });
  }

  function clickRules() {
    var rules = {};
    try { rules = JSON.parse((script && script.getAttribute('data-rules')) || '{}'); } catch (e) { /* ignore */ }
    document.addEventListener('click', function (ev) {
      var el = ev.target instanceof Element ? ev.target : null;
      if (!el) return;
      var tagged = el.closest('[data-track]');
      if (tagged) return void track(tagged.getAttribute('data-track'));
      for (var sel in rules) {
        if (el.closest(sel)) return void track(rules[sel]);
      }
      var a = el.closest('a[href]');
      if (a && /^(mailto:|tel:|https:\/\/(wa\.me|api\.whatsapp\.com)\/)/.test(a.getAttribute('href'))) {
        track('Contact');
      }
    }, true);
  }

  function spaPageViews() {
    var lastPath = location.pathname;
    var check = function () {
      if (location.pathname === lastPath) return;
      lastPath = location.pathname;
      track('PageView');
    };
    ['pushState', 'replaceState'].forEach(function (m) {
      var orig = history[m].bind(history);
      history[m] = function () { orig.apply(null, arguments); check(); };
    });
    window.addEventListener('popstate', check);
  }

  captureAttribution();
  bootstrap();
  window.ggTrack = track;
  track('PageView');
  clickRules();
  if (script && script.hasAttribute('data-spa-pageview')) spaPageViews();
})();
