(function () {
  'use strict';

  if (window.HFFeedback) return;

  var SCRIPT = document.currentScript || document.querySelector('script[data-key][src*="hf-feedback"]');
  var DEFAULT_API = 'https://api.dashboard.honest-family.com/api/public/feedback-pins';
  var MOBILE_MAX = 640;
  var LONG_PRESS_MS = 520;
  var MOVE_TOLERANCE = 10;

  var KIND = {
    a: '링크', button: '버튼', input: '입력칸', textarea: '입력칸', select: '선택칸', label: '글자',
    img: '그림', picture: '그림', svg: '그림', canvas: '그림', video: '영상', figure: '그림',
    h1: '제목', h2: '제목', h3: '제목', h4: '제목', h5: '제목', h6: '제목',
    p: '글', li: '글', blockquote: '글', span: '글자', strong: '글자', em: '글자', b: '글자'
  };
  var MEANINGFUL = 'a,button,[role="button"],label,input,select,textarea,img,video,picture,svg,canvas,h1,h2,h3,h4,h5,h6,p,li,figure,blockquote';
  var DEVICE_KO = { pc: 'PC', mobile: '휴대폰', tablet: '태블릿' };
  var LAYOUT_KO = { pc: 'PC 화면', mobile: '모바일 화면', tablet: '태블릿 화면' };
  var BROWSER_KO = {
    'Chrome': '크롬', 'Safari': '사파리', 'Samsung Internet': '삼성 인터넷', 'Edge': '엣지', 'Whale': '웨일',
    'Firefox': '파이어폭스', 'Opera': '오페라', 'KakaoTalk': '카카오톡 안 브라우저', 'Naver App': '네이버 앱',
    'Instagram': '인스타그램 앱', 'Facebook': '페이스북 앱', 'LINE': '라인 앱', 'Daum App': '다음 앱'
  };
  var OS_KO = { 'Windows': '윈도우', 'macOS': '맥', 'Android': '안드로이드', 'iOS': 'iOS', 'iPadOS': 'iPadOS', 'Linux': '리눅스', 'ChromeOS': '크롬OS' };
  var STATUS_KO = { open: '남은 것', done: '완료', confirmed: '확인 끝' };

  var ICON_PIN = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2h7A2.5 2.5 0 0 1 16 4.5v6A2.5 2.5 0 0 1 13.5 13H9l-3.6 3.1a.6.6 0 0 1-1-.45V13.2A2.5 2.5 0 0 1 4 10.5z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/><path d="M7.5 7.5h5M10 5v5" stroke="currentColor" stroke-width="1.6" stroke-linecap="round"/></svg>';
  var ICON_LIST = '<svg viewBox="0 0 20 20" width="18" height="18" aria-hidden="true"><path d="M7 5.5h9M7 10h9M7 14.5h9" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/><circle cx="3.8" cy="5.5" r="1.1" fill="currentColor"/><circle cx="3.8" cy="10" r="1.1" fill="currentColor"/><circle cx="3.8" cy="14.5" r="1.1" fill="currentColor"/></svg>';
  var ICON_X = '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true"><path d="M4 4l8 8M12 4l-8 8" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"/></svg>';
  var ICON_CHECK = '<svg viewBox="0 0 16 16" width="12" height="12" aria-hidden="true"><path d="M3.5 8.3l2.8 2.7L12.5 5" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"/></svg>';
  var CURSOR = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='28' height='28' viewBox='0 0 28 28'%3E%3Cpath d='M3 3h17a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-7l-5 4v-4H6a3 3 0 0 1-3-3z' fill='%232f6bff' stroke='white' stroke-width='1.6' stroke-linejoin='round'/%3E%3Cpath d='M9 10.5h8M13 6.5v8' stroke='white' stroke-width='1.8' stroke-linecap='round'/%3E%3C/svg%3E\") 3 3, crosshair";

  var CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box}',
    '.root{position:fixed;inset:0;pointer-events:none;font-family:"Pretendard Variable",Pretendard,-apple-system,BlinkMacSystemFont,system-ui,"Apple SD Gothic Neo","Noto Sans KR",sans-serif;font-size:14px;line-height:1.55;color:#111827;letter-spacing:-0.01em;word-break:keep-all;-webkit-font-smoothing:antialiased;--c:#2f6bff;--c2:#1f56e6;--soft:rgba(47,107,255,.10);--ok:#16a34a;--muted:#6b7280}',
    'button{font:inherit;color:inherit;border:0;background:none;cursor:pointer;padding:0;margin:0}',
    'button:focus-visible,textarea:focus-visible,input:focus-visible{outline:2px solid var(--c);outline-offset:2px}',
    '.bar{position:absolute;right:16px;top:var(--top,16px);display:flex;gap:8px;pointer-events:auto;z-index:6}',
    '.tg{display:inline-flex;align-items:center;gap:9px;height:42px;padding:0 14px 0 12px;border-radius:999px;background:#fff;color:#111827;font-weight:700;font-size:14px;box-shadow:0 8px 24px -8px rgba(15,23,42,.35),0 0 0 1px rgba(15,23,42,.08);transition:background-color .2s,color .2s,box-shadow .2s}',
    '.tg .sw{position:relative;width:34px;height:20px;border-radius:999px;background:#d1d5db;transition:background-color .2s;flex:none}',
    '.tg .sw:after{content:"";position:absolute;top:2px;left:2px;width:16px;height:16px;border-radius:50%;background:#fff;box-shadow:0 1px 3px rgba(0,0,0,.25);transition:transform .22s cubic-bezier(.2,.8,.2,1)}',
    '.tg.on{background:var(--c);color:#fff;box-shadow:0 10px 26px -8px rgba(47,107,255,.65),0 0 0 3px rgba(47,107,255,.22)}',
    '.tg.on .sw{background:rgba(255,255,255,.35)}',
    '.tg.on .sw:after{transform:translateX(14px)}',
    '.ls{position:relative;display:inline-flex;align-items:center;gap:6px;height:42px;padding:0 14px;border-radius:999px;background:#fff;font-weight:700;font-size:14px;box-shadow:0 8px 24px -8px rgba(15,23,42,.35),0 0 0 1px rgba(15,23,42,.08)}',
    '.ls .n{min-width:20px;height:20px;padding:0 6px;border-radius:999px;background:#eef2ff;color:var(--c);font-size:12px;line-height:20px;text-align:center}',
    '.ls .n.done{background:var(--ok);color:#fff}',
    '.nudge{position:absolute;right:16px;top:calc(var(--top,16px) + 52px);max-width:260px;padding:10px 12px;border-radius:12px;background:#111827;color:#fff;font-size:13px;line-height:1.5;box-shadow:0 12px 30px -10px rgba(0,0,0,.5);pointer-events:auto;animation:in .3s ease both;z-index:6}',
    '.nudge:before{content:"";position:absolute;right:64px;top:-6px;width:12px;height:12px;background:#111827;transform:rotate(45deg)}',
    '.frame{position:absolute;inset:0;border:3px solid var(--c);box-shadow:inset 0 0 0 1px rgba(255,255,255,.6);opacity:0;transition:opacity .2s;pointer-events:none;z-index:1}',
    '.on-mode .frame{opacity:1}',
    '.hint{position:absolute;left:50%;top:14px;transform:translate(-50%,-8px);display:flex;align-items:center;gap:10px;max-width:calc(100% - 24px);padding:8px 8px 8px 14px;border-radius:999px;background:#111827;color:#fff;font-size:13px;font-weight:600;box-shadow:0 10px 24px -8px rgba(0,0,0,.5);opacity:0;pointer-events:none;transition:opacity .2s,transform .2s;z-index:5}',
    '.hint b{color:#9ec0ff;font-weight:700}',
    '.hint button{width:24px;height:24px;border-radius:999px;display:inline-grid;place-items:center;color:#cbd5e1}',
    '.on-mode .hint.show{opacity:1;transform:translate(-50%,0);pointer-events:auto}',
    '.hover{position:absolute;left:0;top:0;width:0;height:0;border:2px solid var(--c);background:var(--soft);border-radius:6px;opacity:0;pointer-events:none;transition:left .08s,top .08s,width .08s,height .08s,opacity .12s;z-index:2}',
    '.hover.show{opacity:1}',
    '.tag{position:absolute;left:0;top:0;max-width:280px;padding:3px 8px;border-radius:6px;background:var(--c);color:#fff;font-size:12px;font-weight:700;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;opacity:0;pointer-events:none;transition:opacity .12s;z-index:2}',
    '.tag.show{opacity:1}',
    '.tag i{font-style:normal;font-weight:500;opacity:.85}',
    '.press{position:absolute;width:56px;height:56px;margin:-28px 0 0 -28px;pointer-events:none;opacity:0;z-index:4}',
    '.press.show{opacity:1}',
    '.press circle{fill:none;stroke-width:4}',
    '.press .bg{stroke:rgba(255,255,255,.85)}',
    '.press .fg{stroke:var(--c);stroke-dasharray:151;stroke-dashoffset:151;transform:rotate(-90deg);transform-origin:28px 28px}',
    '.press.run .fg{transition:stroke-dashoffset linear;stroke-dashoffset:0}',
    '.pins{position:absolute;inset:0;pointer-events:none;z-index:3}',
    '.pin{position:absolute;left:0;top:0;width:30px;height:30px;margin:-30px 0 0 0;border-radius:15px 15px 15px 3px;background:var(--c);color:#fff;font-size:13px;font-weight:800;display:grid;place-items:center;box-shadow:0 6px 14px -4px rgba(15,23,42,.55),0 0 0 2px #fff;pointer-events:auto;transition:transform .15s,opacity .2s;transform-origin:0 100%}',
    '.pin:hover,.pin.act{transform:scale(1.15)}',
    '.pin.done{background:var(--ok)}',
    '.pin.confirmed{background:#9ca3af}',
    '.pin .ck{position:absolute;right:-5px;top:-5px;width:16px;height:16px;border-radius:50%;background:#fff;color:var(--ok);display:grid;place-items:center;box-shadow:0 1px 3px rgba(0,0,0,.3)}',
    '.pin.confirmed .ck{color:#6b7280}',
    '.pin.hide{opacity:0;pointer-events:none}',
    '.pin.draft{background:#111827;animation:pulse 1.4s ease-out infinite}',
    '.card,.composer{position:absolute;width:320px;max-width:calc(100% - 24px);border-radius:16px;background:#fff;box-shadow:0 22px 50px -14px rgba(15,23,42,.45),0 0 0 1px rgba(15,23,42,.08);pointer-events:auto;z-index:7;animation:in .18s cubic-bezier(.2,.8,.2,1) both}',
    '.composer{padding:14px}',
    '.hd{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
    '.hd .t{flex:1;min-width:0;font-weight:800;font-size:14px;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.hd .t small{font-weight:600;color:var(--muted);font-size:12.5px;margin-left:4px}',
    '.x{width:28px;height:28px;border-radius:8px;display:grid;place-items:center;color:#9ca3af;flex:none}',
    '.x:hover{background:#f3f4f6;color:#111827}',
    'textarea,input{width:100%;font:inherit;font-size:14px;color:#111827;border:1px solid #d6dcea;border-radius:10px;padding:9px 11px;background:#fff;-webkit-user-select:text;user-select:text;cursor:text}',
    'textarea{min-height:92px;resize:vertical;line-height:1.55}',
    'input{margin-top:8px;height:38px}',
    '.env{display:flex;flex-wrap:wrap;gap:4px;margin-top:10px}',
    '.chip{display:inline-flex;align-items:center;height:22px;padding:0 8px;border-radius:999px;background:#f3f4f6;color:#4b5563;font-size:11.5px;font-weight:600}',
    '.envnote{margin:6px 0 0;color:#9ca3af;font-size:11.5px}',
    '.acts{display:flex;justify-content:flex-end;gap:6px;margin-top:12px}',
    '.btn{height:36px;padding:0 14px;border-radius:10px;font-weight:700;font-size:13.5px;border:1px solid #d6dcea;background:#fff;color:#374151}',
    '.btn:hover{background:#f6f8fc}',
    '.btn.pri{background:var(--c);border-color:var(--c);color:#fff}',
    '.btn.pri:hover{background:var(--c2)}',
    '.btn.okb{background:var(--ok);border-color:var(--ok);color:#fff}',
    '.btn[disabled]{opacity:.6;cursor:default}',
    '.card{padding:14px 14px 12px}',
    '.st{display:inline-flex;align-items:center;gap:4px;height:22px;padding:0 8px;border-radius:999px;font-size:11.5px;font-weight:800}',
    '.st.open{background:#eef2ff;color:var(--c)}',
    '.st.done{background:#dcfce7;color:#15803d}',
    '.st.confirmed{background:#f3f4f6;color:#6b7280}',
    '.body{margin:2px 0 0;white-space:pre-wrap;color:#111827;font-size:14px}',
    '.meta{margin-top:6px;color:var(--muted);font-size:12px}',
    '.reply{margin-top:10px;padding:9px 11px;border-radius:10px;background:#f0fdf4;color:#14532d;font-size:13px;white-space:pre-wrap}',
    '.reply b{display:block;font-size:11.5px;color:#15803d;margin-bottom:2px}',
    '.wait{margin-top:10px;font-size:12.5px;color:var(--muted)}',
    '.panel{position:absolute;right:12px;top:calc(var(--top,16px) + 54px);bottom:12px;width:380px;max-width:calc(100% - 24px);display:flex;flex-direction:column;border-radius:18px;background:#fff;box-shadow:0 24px 60px -18px rgba(15,23,42,.5),0 0 0 1px rgba(15,23,42,.08);pointer-events:auto;z-index:8;animation:in .2s cubic-bezier(.2,.8,.2,1) both;overflow:hidden}',
    '.panel .ph{display:flex;align-items:center;gap:8px;padding:14px 14px 8px}',
    '.panel .ph .t{flex:1;font-weight:800;font-size:16px}',
    '.tabs{display:flex;gap:4px;padding:0 10px 10px;border-bottom:1px solid #eef0f4;overflow-x:auto}',
    '.tab{flex:none;height:32px;padding:0 11px;border-radius:999px;font-weight:700;font-size:13px;color:#4b5563;background:#f3f4f6}',
    '.tab.on{background:#111827;color:#fff}',
    '.tab.done-tab.on{background:var(--ok)}',
    '.tab em{font-style:normal;opacity:.75;margin-left:3px}',
    '.list{flex:1;overflow-y:auto;padding:8px;overscroll-behavior:contain}',
    '.item{display:flex;gap:10px;width:100%;text-align:left;padding:10px;border-radius:12px;align-items:flex-start}',
    '.item:hover{background:#f6f8fc}',
    '.item .no{flex:none;width:28px;height:28px;border-radius:14px 14px 14px 3px;background:var(--c);color:#fff;font-size:12.5px;font-weight:800;display:grid;place-items:center}',
    '.item .no.done{background:var(--ok)}',
    '.item .no.confirmed{background:#9ca3af}',
    '.item .tx{flex:1;min-width:0}',
    '.item .bd{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;overflow:hidden;font-size:13.5px;color:#111827}',
    '.item .mt{margin-top:3px;font-size:11.5px;color:var(--muted)}',
    '.item .go{flex:none;align-self:center;font-size:12px;font-weight:700;color:var(--c)}',
    '.empty{padding:28px 16px;text-align:center;color:var(--muted);font-size:13px}',
    '.pf{padding:10px 14px;border-top:1px solid #eef0f4;color:#9ca3af;font-size:11.5px}',
    '.spot{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;opacity:0;transition:opacity .25s;z-index:4}',
    '.spot.show{opacity:1}',
    '.spot .sh{fill:rgba(15,23,42,.5)}',
    '.spot .rg{fill:none;stroke:var(--ok);stroke-width:3}',
    '.toast{position:absolute;left:50%;bottom:24px;transform:translate(-50%,10px);padding:10px 16px;border-radius:999px;background:#111827;color:#fff;font-size:13.5px;font-weight:600;opacity:0;transition:opacity .2s,transform .2s;pointer-events:none;z-index:9;white-space:nowrap}',
    '.toast.show{opacity:1;transform:translate(-50%,0)}',
    '.sheet{left:0!important;right:0;bottom:0;top:auto!important;width:auto;max-width:none;border-radius:18px 18px 0 0;padding-bottom:calc(14px + env(safe-area-inset-bottom,0px))}',
    '.panel.sheet{top:auto!important;height:min(78vh,620px);bottom:0;right:0;left:0;width:auto;max-width:none;border-radius:18px 18px 0 0}',
    '@keyframes in{from{opacity:0;transform:translateY(6px)}to{opacity:1;transform:none}}',
    '@keyframes pulse{0%{box-shadow:0 0 0 0 rgba(17,24,39,.45),0 0 0 2px #fff}100%{box-shadow:0 0 0 14px rgba(17,24,39,0),0 0 0 2px #fff}}',
    '@media (max-width:640px){.toast{bottom:84px}.bar{right:10px}.tg{height:40px;padding:0 12px 0 10px;font-size:13px}.ls{height:40px;padding:0 12px;font-size:13px}.hint{top:auto;bottom:16px;transform:translate(-50%,8px)}.on-mode .hint.show{transform:translate(-50%,0)}.nudge{right:10px}}',
    '@media (prefers-reduced-motion:reduce){*{animation:none!important;transition:none!important}}'
  ].join('\n');

  function el(tag, cls, html) {
    var n = document.createElement(tag);
    if (cls) n.className = cls;
    if (html != null) n.innerHTML = html;
    return n;
  }

  function esc(s) {
    return String(s == null ? '' : s).replace(/[&<>"']/g, function (c) {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c];
    });
  }

  function clamp(v, a, b) { return Math.max(a, Math.min(b, v)); }

  function store(kind, key, value) {
    try {
      var s = kind === 'local' ? window.localStorage : window.sessionStorage;
      if (value === undefined) return s.getItem(key);
      if (value === null) s.removeItem(key); else s.setItem(key, value);
    } catch (e) {}
    return null;
  }

  function normPath(p) {
    p = String(p || '/').split('#')[0].split('?')[0];
    p = p.replace(/index\.html?$/i, '');
    if (p.length > 1) p = p.replace(/\/+$/, '');
    return p || '/';
  }

  function isMobileWidth() { return window.innerWidth <= MOBILE_MAX; }
  function viewW() { return document.documentElement.clientWidth || window.innerWidth; }

  function textOf(n) {
    var t = (n.getAttribute && (n.getAttribute('aria-label') || n.getAttribute('alt') || n.getAttribute('placeholder') || n.getAttribute('title'))) || n.innerText || n.textContent || '';
    return t.replace(/\s+/g, ' ').trim();
  }

  function describe(n) {
    var tag = n.tagName.toLowerCase();
    var kind = KIND[tag] || (n.getAttribute('role') === 'button' ? '버튼' : '영역');
    var t = textOf(n);
    if (t.length > 18) t = t.slice(0, 18) + '…';
    return t && kind !== '그림' && kind !== '영상' ? kind + " '" + t + "'" : kind;
  }

  function selectorFor(n) {
    var esc2 = window.CSS && CSS.escape ? CSS.escape : function (s) { return s.replace(/[^a-zA-Z0-9_-]/g, '\\$&'); };
    if (n.id && document.querySelectorAll('#' + esc2(n.id)).length === 1) return '#' + esc2(n.id);
    var parts = [];
    for (var c = n; c && c.nodeType === 1 && c !== document.body && c !== document.documentElement; c = c.parentElement) {
      if (c.id && document.querySelectorAll('#' + esc2(c.id)).length === 1) {
        parts.unshift('#' + esc2(c.id));
        return parts.join(' > ');
      }
      var idx = 1;
      for (var s = c.previousElementSibling; s; s = s.previousElementSibling) if (s.tagName === c.tagName) idx++;
      parts.unshift(c.tagName.toLowerCase() + ':nth-of-type(' + idx + ')');
    }
    parts.unshift('body');
    return parts.join(' > ');
  }

  function similar(a, b) {
    a = (a || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    b = (b || '').replace(/\s+/g, ' ').trim().slice(0, 40);
    if (!a || !b) return true;
    return a === b || a.indexOf(b.slice(0, 12)) === 0 || b.indexOf(a.slice(0, 12)) === 0;
  }

  function findAnchor(item) {
    var hit = null;
    if (item.selector) {
      try { hit = document.querySelector(item.selector); } catch (e) { hit = null; }
      if (hit && item.anchor_tag && hit.tagName.toLowerCase() !== item.anchor_tag) hit = null;
      if (hit && item.anchor_text && !similar(textOf(hit), item.anchor_text)) hit = null;
    }
    if (!hit && item.anchor_tag && item.anchor_text) {
      var all = document.getElementsByTagName(item.anchor_tag);
      var best = null;
      var bestD = Infinity;
      for (var i = 0; i < all.length; i++) {
        if (textOf(all[i]).slice(0, 40) !== String(item.anchor_text).slice(0, 40)) continue;
        var r = all[i].getBoundingClientRect();
        var d = item.doc_y != null ? Math.abs(r.top + window.scrollY - item.doc_y) : 0;
        if (d < bestD) { bestD = d; best = all[i]; }
      }
      hit = best;
    }
    return hit;
  }

  function detectEnv() {
    var ua = navigator.userAgent || '';
    var touch = (navigator.maxTouchPoints || 0) > 0 || 'ontouchstart' in window;
    var os = '';
    var osv = '';
    var m;
    if (/iPhone|iPod/.test(ua)) { os = 'iOS'; m = ua.match(/OS (\d+)[_.](\d+)/); if (m) osv = m[1] + '.' + m[2]; }
    else if (/iPad/.test(ua) || (/Macintosh/.test(ua) && touch)) { os = 'iPadOS'; m = ua.match(/OS (\d+)[_.](\d+)/) || ua.match(/Version\/(\d+)\.(\d+)/); if (m) osv = m[1] + '.' + m[2]; }
    else if (/Android/.test(ua)) { os = 'Android'; m = ua.match(/Android (\d+(?:\.\d+)?)/); if (m) osv = m[1]; }
    else if (/Windows NT/.test(ua)) { os = 'Windows'; osv = /Windows NT 10/.test(ua) ? '10' : ''; }
    else if (/CrOS/.test(ua)) os = 'ChromeOS';
    else if (/Mac OS X/.test(ua)) { os = 'macOS'; m = ua.match(/Mac OS X (\d+)[_.](\d+)/); if (m) osv = m[1] + '.' + m[2]; }
    else if (/Linux/.test(ua)) os = 'Linux';

    var browser = '';
    var bv = '';
    var inApp = '';
    var rules = [
      [/KAKAOTALK\/?\s?([\d.]+)?/i, 'KakaoTalk', true],
      [/NAVER\(inapp[^)]*\)|NAVER\/([\d.]+)/i, 'Naver App', true],
      [/Instagram\s?([\d.]+)?/i, 'Instagram', true],
      [/FBAN|FBAV\/([\d.]+)/i, 'Facebook', true],
      [/Line\/([\d.]+)/, 'LINE', true],
      [/DaumApps\/([\d.]+)/i, 'Daum App', true],
      [/SamsungBrowser\/([\d.]+)/, 'Samsung Internet'],
      [/Whale\/([\d.]+)/, 'Whale'],
      [/(?:Edg|EdgA|EdgiOS)\/([\d.]+)/, 'Edge'],
      [/(?:OPR|OPiOS)\/([\d.]+)/, 'Opera'],
      [/(?:Firefox|FxiOS)\/([\d.]+)/, 'Firefox'],
      [/CriOS\/([\d.]+)/, 'Chrome'],
      [/Chrome\/([\d.]+)/, 'Chrome'],
      [/Version\/([\d.]+).*Safari/, 'Safari']
    ];
    for (var i = 0; i < rules.length; i++) {
      m = ua.match(rules[i][0]);
      if (m) {
        browser = rules[i][1];
        bv = m[1] ? String(m[1]).split('.').slice(0, 2).join('.') : '';
        if (rules[i][2]) inApp = browser;
        break;
      }
    }
    if (!browser && /Safari/.test(ua)) browser = 'Safari';

    var uad = navigator.userAgentData;
    var device = 'pc';
    if (os === 'iPadOS' || (os === 'Android' && !/Mobile/.test(ua))) device = 'tablet';
    else if (/Mobi|iPhone|iPod/.test(ua) || (uad && uad.mobile)) device = 'mobile';

    var vw = window.innerWidth;
    return {
      device: device,
      layout: vw <= MOBILE_MAX ? 'mobile' : vw <= 1024 ? 'tablet' : 'pc',
      os: os,
      os_version: osv,
      browser: browser,
      browser_version: bv,
      in_app: inApp || null,
      viewport_w: vw,
      viewport_h: window.innerHeight,
      screen_w: screen.width,
      screen_h: screen.height,
      dpr: Math.round((window.devicePixelRatio || 1) * 100) / 100,
      lang: (navigator.language || '').slice(0, 20),
      tz: (Intl.DateTimeFormat && Intl.DateTimeFormat().resolvedOptions().timeZone) || '',
      touch: !!touch
    };
  }

  function envChips(env) {
    if (!env) return [];
    var out = [];
    if (env.device) out.push(DEVICE_KO[env.device] || env.device);
    if (env.os) out.push((OS_KO[env.os] || env.os) + (env.os_version ? ' ' + env.os_version : ''));
    if (env.browser) out.push((BROWSER_KO[env.browser] || env.browser) + (env.browser_version && !env.in_app ? ' ' + env.browser_version.split('.')[0] : ''));
    if (env.viewport_w) out.push(env.viewport_w + '×' + env.viewport_h + ' · ' + (LAYOUT_KO[env.layout] || ''));
    return out;
  }

  function when(s) {
    if (!s) return '';
    var d = new Date(String(s).replace(' ', 'T'));
    if (isNaN(d.getTime())) return s;
    var diff = (Date.now() - d.getTime()) / 1000;
    if (diff < 60) return '방금';
    if (diff < 3600) return Math.floor(diff / 60) + '분 전';
    if (diff < 86400) return Math.floor(diff / 3600) + '시간 전';
    return (d.getMonth() + 1) + '월 ' + d.getDate() + '일';
  }

  function Feedback(opts) {
    this.api = (opts.api || DEFAULT_API).replace(/\/+$/, '');
    this.key = opts.key;
    this.top = parseInt(opts.top, 10) || 16;
    this.hideSel = opts.hide || '';
    this.items = [];
    this.on = store('session', 'hffb-on') === '1';
    this.tab = null;
    this.env = detectEnv();
    this.hoverEl = null;
    this.press = null;
    this.suppressClickUntil = 0;
    this.openCard = null;
    this.composing = null;
    this.raf = 0;
    this.build();
    this.bind();
    this.applyMode();
    this.load();
    this.refineOs();
  }

  Feedback.prototype.refineOs = function () {
    var self = this;
    var uad = navigator.userAgentData;
    if (!uad || !uad.getHighEntropyValues || self.env.os !== 'Windows') return;
    uad.getHighEntropyValues(['platformVersion']).then(function (v) {
      var major = parseInt(String(v.platformVersion || '0').split('.')[0], 10);
      self.env.os_version = major >= 13 ? '11' : '10';
    }).catch(function () {});
  };

  Feedback.prototype.build = function () {
    var host = el('div');
    host.id = 'hffb-host';
    host.setAttribute('style', 'position:fixed;inset:0;pointer-events:none;z-index:2147483000;');
    var shadow = host.attachShadow ? host.attachShadow({ mode: 'open' }) : host;
    var style = el('style');
    style.textContent = CSS;
    shadow.appendChild(style);
    var root = el('div', 'root');
    root.style.setProperty('--top', this.top + 'px');
    shadow.appendChild(root);

    var global = el('style');
    global.id = 'hffb-global';
    global.textContent = 'html.hffb-on body,html.hffb-on body *{cursor:' + CURSOR + '!important}' +
      'html.hffb-on input,html.hffb-on textarea{cursor:text!important}' +
      'html.hffb-on body{-webkit-touch-callout:none!important;-webkit-user-select:none!important;user-select:none!important}' +
      (this.hideSel ? 'html.hffb-on ' + this.hideSel.split(',').join(',html.hffb-on ') + '{display:none!important}' : '');
    document.head.appendChild(global);

    root.innerHTML =
      '<div class="frame"></div>' +
      '<div class="hint"><span></span><button type="button" aria-label="안내 닫기">' + ICON_X + '</button></div>' +
      '<div class="hover"></div><div class="tag"></div>' +
      '<svg class="spot" aria-hidden="true"><path class="sh" fill-rule="evenodd"></path><path class="rg"></path></svg>' +
      '<div class="pins"></div>' +
      '<svg class="press" viewBox="0 0 56 56" aria-hidden="true"><circle class="bg" cx="28" cy="28" r="24"></circle><circle class="fg" cx="28" cy="28" r="24"></circle></svg>' +
      '<div class="bar"><button type="button" class="tg" aria-pressed="false"><span class="ic">' + ICON_PIN + '</span><span class="lb">피드백 남기기</span><span class="sw" aria-hidden="true"></span></button>' +
      '<button type="button" class="ls" aria-label="피드백 목록">' + ICON_LIST + '<span>목록</span><span class="n" hidden>0</span></button></div>' +
      '<div class="toast" role="status" aria-live="polite"></div>';

    document.body.appendChild(host);
    this.host = host;
    this.shadow = shadow;
    this.root = root;
    this.q = function (s) { return root.querySelector(s); };
    this.ui = {
      hint: this.q('.hint'), hintText: this.q('.hint span'), hover: this.q('.hover'), tag: this.q('.tag'),
      pins: this.q('.pins'), press: this.q('.press'), tg: this.q('.tg'), tgLabel: this.q('.tg .lb'),
      bar: this.q('.bar'), ls: this.q('.ls'), lsN: this.q('.ls .n'), toast: this.q('.toast'), spot: this.q('.spot'),
      spotSh: this.q('.spot .sh'), spotRg: this.q('.spot .rg')
    };
  };

  Feedback.prototype.isOurs = function (e) {
    var path = e.composedPath ? e.composedPath() : [];
    return path.indexOf(this.host) !== -1 || e.target === this.host;
  };

  Feedback.prototype.bind = function () {
    var self = this;
    var ui = this.ui;
    ui.tg.addEventListener('click', function () { self.setMode(!self.on); });
    ui.ls.addEventListener('click', function () { self.openPanel(); });
    this.q('.hint button').addEventListener('click', function () {
      ui.hint.classList.remove('show');
      store('session', 'hffb-hint', 'off');
    });

    document.addEventListener('pointermove', function (e) {
      if (!self.on || e.pointerType !== 'mouse' || self.composing) return;
      if (self.isOurs(e)) { self.showHover(null); return; }
      self.showHover(self.pick(e.clientX, e.clientY));
    }, true);

    document.addEventListener('mouseleave', function () { if (!self.composing) self.showHover(null); });

    document.addEventListener('contextmenu', function (e) {
      if (!self.on || self.isOurs(e)) return;
      e.preventDefault();
      if (self.press) {
        if (self.press.fired) return;
        clearTimeout(self.press.timer);
        self.press.fired = true;
        self.ui.press.classList.remove('show', 'run');
        self.suppressClickUntil = Date.now() + 900;
      }
      var target = self.pick(e.clientX, e.clientY);
      if (target) self.compose(target, e.clientX, e.clientY);
    }, true);

    document.addEventListener('pointerdown', function (e) {
      if (!self.on || e.pointerType === 'mouse' || self.isOurs(e)) return;
      self.startPress(e);
    }, true);
    document.addEventListener('pointermove', function (e) {
      if (!self.press) return;
      if (Math.hypot(e.clientX - self.press.x, e.clientY - self.press.y) > MOVE_TOLERANCE) self.cancelPress();
    }, true);
    ['pointerup', 'pointercancel'].forEach(function (t) {
      document.addEventListener(t, function () { if (self.press && !self.press.fired) self.cancelPress(); }, true);
    });
    window.addEventListener('click', function (e) {
      if (Date.now() < self.suppressClickUntil && !self.isOurs(e)) {
        e.preventDefault();
        e.stopPropagation();
      }
    }, true);
    document.addEventListener('selectstart', function (e) {
      if (self.on && !self.isOurs(e) && !/INPUT|TEXTAREA/.test((e.target && e.target.tagName) || '')) e.preventDefault();
    }, true);

    document.addEventListener('keydown', function (e) {
      if (e.key !== 'Escape') return;
      if (self.composing) self.closeComposer();
      else if (self.openCard) self.closeCard();
      else if (self.panel) self.closePanel();
    });

    window.addEventListener('scroll', function () { self.schedule(); }, true);
    window.addEventListener('resize', function () {
      self.env.viewport_w = window.innerWidth;
      self.env.viewport_h = window.innerHeight;
      self.env.layout = window.innerWidth <= MOBILE_MAX ? 'mobile' : window.innerWidth <= 1024 ? 'tablet' : 'pc';
      self.schedule();
    });
    setInterval(function () { if (self.on || self.spotEl) self.schedule(); }, 400);
    window.addEventListener('hashchange', function () { self.focusFromHash(); });
  };

  Feedback.prototype.pick = function (x, y) {
    var stack = document.elementsFromPoint ? document.elementsFromPoint(x, y) : [document.elementFromPoint(x, y)];
    var n = null;
    for (var i = 0; i < stack.length; i++) {
      if (stack[i] === this.host) return null;
      if (stack[i] && stack[i].nodeType === 1) { n = stack[i]; break; }
    }
    if (!n || n === document.body || n === document.documentElement) return null;
    var best = n.closest ? n.closest(MEANINGFUL) : null;
    if (best && best !== document.body) {
      var r = best.getBoundingClientRect();
      if (r.width * r.height < window.innerWidth * window.innerHeight * 0.7) n = best;
    }
    if (n.tagName && n.tagName.toLowerCase() === 'svg' && n.parentElement && n.parentElement.closest('a,button')) n = n.parentElement.closest('a,button');
    return n;
  };

  Feedback.prototype.showHover = function (n) {
    var ui = this.ui;
    this.hoverEl = n;
    if (!n) {
      ui.hover.classList.remove('show');
      ui.tag.classList.remove('show');
      return;
    }
    var r = n.getBoundingClientRect();
    ui.hover.style.left = (r.left - 3) + 'px';
    ui.hover.style.top = (r.top - 3) + 'px';
    ui.hover.style.width = (r.width + 6) + 'px';
    ui.hover.style.height = (r.height + 6) + 'px';
    ui.hover.classList.add('show');
    var mobile = isMobileWidth() || this.env.touch && !matchMedia('(hover:hover)').matches;
    ui.tag.innerHTML = esc(describe(n)) + ' <i>· ' + (mobile ? '꾹 눌러서 피드백' : '우클릭해서 피드백') + '</i>';
    var tagTop = r.top - 26;
    if (tagTop < 4) tagTop = r.bottom + 6 < window.innerHeight - 30 && r.height < 120 ? r.bottom + 6 : Math.max(r.top + 6, 6);
    var tw = ui.tag.offsetWidth;
    var tagLeft = r.left - 3 + tw > viewW() - 4 ? r.right + 3 - tw : r.left - 3;
    ui.tag.style.left = clamp(tagLeft, 4, Math.max(4, viewW() - tw - 4)) + 'px';
    ui.tag.style.top = clamp(tagTop, 4, window.innerHeight - 30) + 'px';
    ui.tag.classList.add('show');
  };

  Feedback.prototype.startPress = function (e) {
    var self = this;
    var target = this.pick(e.clientX, e.clientY);
    if (!target) return;
    this.cancelPress();
    this.showHover(target);
    var press = { x: e.clientX, y: e.clientY, target: target, fired: false };
    var ring = this.ui.press;
    ring.style.left = e.clientX + 'px';
    ring.style.top = e.clientY + 'px';
    ring.classList.remove('run');
    ring.classList.add('show');
    var fg = ring.querySelector('.fg');
    fg.style.transitionDuration = LONG_PRESS_MS + 'ms';
    void ring.getBoundingClientRect();
    ring.classList.add('run');
    press.timer = setTimeout(function () {
      press.fired = true;
      ring.classList.remove('show', 'run');
      if (navigator.vibrate) navigator.vibrate(12);
      self.suppressClickUntil = Date.now() + 900;
      self.compose(press.target, press.x, press.y);
      setTimeout(function () { if (self.press === press) self.press = null; }, 900);
    }, LONG_PRESS_MS);
    this.press = press;
  };

  Feedback.prototype.cancelPress = function () {
    if (!this.press) return;
    clearTimeout(this.press.timer);
    this.ui.press.classList.remove('show', 'run');
    if (!this.press.fired && !this.composing) this.showHover(null);
    this.press = null;
  };

  Feedback.prototype.setMode = function (on) {
    this.on = !!on;
    store('session', 'hffb-on', this.on ? '1' : null);
    this.applyMode();
    if (!this.on) {
      this.closeComposer();
      this.closeCard();
      this.showHover(null);
    } else {
      this.hideNudge();
    }
  };

  Feedback.prototype.applyMode = function () {
    var ui = this.ui;
    document.documentElement.classList.toggle('hffb-on', this.on);
    this.root.classList.toggle('on-mode', this.on);
    ui.tg.classList.toggle('on', this.on);
    ui.tg.setAttribute('aria-pressed', this.on ? 'true' : 'false');
    ui.tgLabel.textContent = this.on ? '피드백 모드 켜짐' : '피드백 남기기';
    var touchFirst = isMobileWidth() || (this.env.touch && !matchMedia('(hover:hover)').matches);
    ui.hintText.innerHTML = touchFirst
      ? '<b>꾹 누르면</b> 그 자리에 피드백을 남겨요 · 탭은 평소처럼 돼요'
      : '<b>우클릭하면</b> 그 자리에 피드백을 남겨요 · 클릭은 평소처럼 돼요';
    ui.hint.classList.toggle('show', this.on && store('session', 'hffb-hint') !== 'off');
    this.renderPins();
  };

  Feedback.prototype.load = function () {
    var self = this;
    return fetch(this.api + '/' + encodeURIComponent(this.key), { headers: { Accept: 'application/json' } })
      .then(function (r) {
        if (r.status === 403 || r.status === 404) self.disable(r.status);
        return r.ok ? r.json() : Promise.reject(r);
      })
      .then(function (j) {
        self.items = (j.data && j.data.items) || [];
        self.siteName = j.data && j.data.site && j.data.site.name;
        self.renderCount();
        self.renderPins();
        if (self.panel) self.renderPanel();
        self.focusFromHash();
        self.showNudge();
      })
      .catch(function () {});
  };

  Feedback.prototype.disable = function (status) {
    this.on = false;
    document.documentElement.classList.remove('hffb-on');
    if (this.host.parentNode) this.host.parentNode.removeChild(this.host);
    var global = document.getElementById('hffb-global');
    if (global && global.parentNode) global.parentNode.removeChild(global);
    if (window.console && console.warn) {
      console.warn('[hf-feedback] ' + (status === 403
        ? '이 주소(' + location.origin + ')는 피드백 사이트에 등록되지 않았어요.'
        : '피드백 사이트 키를 찾을 수 없어요.') + ' 대시보드 > 고객 피드백에서 확인해 주세요.');
    }
  };

  Feedback.prototype.request = function (method, path, body) {
    return fetch(this.api + '/' + encodeURIComponent(this.key) + path, {
      method: method,
      headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
      body: body ? JSON.stringify(body) : undefined
    }).then(function (r) {
      return r.json().catch(function () { return {}; }).then(function (j) {
        if (!r.ok) return Promise.reject(j);
        return j.data;
      });
    });
  };

  Feedback.prototype.showNudge = function () {
    var self = this;
    if (this.on || this.nudge || store('local', 'hffb-nudged')) return;
    var n = el('div', 'nudge', '이 화면에 바로 <b>피드백</b>을 남길 수 있어요. 오른쪽 위 단추를 켜 보세요.');
    n.addEventListener('click', function () { self.hideNudge(); });
    this.root.appendChild(n);
    this.nudge = n;
    setTimeout(function () { self.hideNudge(); }, 7000);
  };

  Feedback.prototype.hideNudge = function () {
    if (!this.nudge) return;
    store('local', 'hffb-nudged', '1');
    if (this.nudge.parentNode) this.nudge.parentNode.removeChild(this.nudge);
    this.nudge = null;
  };

  Feedback.prototype.renderCount = function () {
    var open = 0;
    var done = 0;
    this.items.forEach(function (i) { if (i.status === 'open') open++; else if (i.status === 'done') done++; });
    var n = this.ui.lsN;
    n.hidden = !(open || done);
    n.classList.toggle('done', done > 0);
    n.textContent = done > 0 ? '완료 ' + done : String(open);
  };

  Feedback.prototype.here = function (item) {
    return normPath(item.page_path) === normPath(location.pathname);
  };

  Feedback.prototype.renderPins = function () {
    var self = this;
    var wrap = this.ui.pins;
    var keep = {};
    if (!this.on && !this.spotEl) {
      wrap.innerHTML = '';
      this.pinEls = {};
      return;
    }
    this.pinEls = this.pinEls || {};
    this.items.forEach(function (item) {
      if (!self.here(item)) return;
      if (item.status === 'confirmed' && self.openCard !== item.id) return;
      keep[item.id] = true;
      var p = self.pinEls[item.id];
      if (!p) {
        p = el('button', 'pin');
        p.type = 'button';
        p.addEventListener('click', function (e) {
          e.stopPropagation();
          self.showCard(item.id);
        });
        wrap.appendChild(p);
        self.pinEls[item.id] = p;
      }
      p.className = 'pin ' + item.status + (self.openCard === item.id ? ' act' : '');
      p.setAttribute('aria-label', '피드백 ' + item.number + '번 · ' + STATUS_KO[item.status]);
      p.innerHTML = String(item.number) + (item.status !== 'open' ? '<span class="ck">' + ICON_CHECK + '</span>' : '');
    });
    Object.keys(this.pinEls).forEach(function (id) {
      if (!keep[id]) {
        wrap.removeChild(self.pinEls[id]);
        delete self.pinEls[id];
      }
    });
    this.place();
  };

  Feedback.prototype.pointOf = function (item) {
    var a = item._el && item._el.isConnected ? item._el : null;
    if (!a) {
      a = findAnchor(item);
      item._el = a;
    }
    if (a) {
      var r = a.getBoundingClientRect();
      if (r.width === 0 && r.height === 0) return null;
      return { x: r.left + (item.rel_x != null ? item.rel_x : 0.5) * r.width, y: r.top + (item.rel_y != null ? item.rel_y : 0.5) * r.height, el: a, rect: r };
    }
    if (item.doc_x != null && item.doc_y != null) return { x: item.doc_x - window.scrollX, y: item.doc_y - window.scrollY, el: null };
    return null;
  };

  Feedback.prototype.occluded = function (pt) {
    if (!pt.el || !document.elementsFromPoint) return false;
    if (pt.x < 0 || pt.y < 0 || pt.x > window.innerWidth || pt.y > window.innerHeight) return true;
    var stack = document.elementsFromPoint(pt.x, pt.y);
    for (var i = 0; i < stack.length; i++) {
      if (stack[i] === this.host) continue;
      return !(stack[i] === pt.el || pt.el.contains(stack[i]) || stack[i].contains(pt.el));
    }
    return false;
  };

  Feedback.prototype.place = function () {
    var self = this;
    var pins = this.pinEls || {};
    this.items.forEach(function (item) {
      var p = pins[item.id];
      if (!p) return;
      var pt = self.pointOf(item);
      if (!pt) { p.classList.add('hide'); return; }
      p.style.left = Math.round(pt.x) + 'px';
      p.style.top = Math.round(pt.y) + 'px';
      p.classList.toggle('hide', self.occluded(pt));
    });
    if (this.composing) {
      var c = this.composing;
      if (c.el && c.draft) {
        var r = c.el.getBoundingClientRect();
        c.draft.style.left = Math.round(r.left + c.rx * r.width) + 'px';
        c.draft.style.top = Math.round(r.top + c.ry * r.height) + 'px';
      }
    }
    if (this.openCard != null) this.positionCard();
    if (this.spotEl) this.drawSpot();
  };

  Feedback.prototype.schedule = function () {
    var self = this;
    if (this.raf) return;
    this.raf = requestAnimationFrame(function () {
      self.raf = 0;
      if (self.on && self.hoverEl && !self.composing && !self.press) self.showHover(self.hoverEl);
      if (self.on || self.spotEl) self.place();
    });
  };

  Feedback.prototype.anchorCard = function (card, x, y) {
    if (isMobileWidth()) {
      card.classList.add('sheet');
      this.fitSheet(card);
      return;
    }
    card.classList.remove('sheet');
    var w = card.offsetWidth;
    var h = card.offsetHeight;
    var left = x + 14;
    var top = y + 10;
    if (left + w > viewW() - 12) left = x - w - 14;
    if (top + h > window.innerHeight - 12) top = y - h - 10;
    left = clamp(left, 12, viewW() - w - 12);
    top = clamp(top, 12, Math.max(12, window.innerHeight - h - 12));
    var b = this.ui.bar.getBoundingClientRect();
    if (left < b.right + 8 && left + w > b.left - 8 && top < b.bottom + 8 && top + h > b.top - 8) {
      if (b.bottom + 10 + h <= window.innerHeight - 12) top = b.bottom + 10;
      else left = Math.max(12, b.left - w - 10);
    }
    card.style.left = left + 'px';
    card.style.top = top + 'px';
  };

  Feedback.prototype.fitSheet = function (card) {
    var vv = window.visualViewport;
    var gap = vv ? Math.max(0, window.innerHeight - vv.height - vv.offsetTop) : 0;
    card.style.bottom = gap + 'px';
  };

  Feedback.prototype.compose = function (target, x, y) {
    var self = this;
    this.closeComposer();
    this.closeCard();
    this.showHover(target);
    var r = target.getBoundingClientRect();
    var rx = r.width ? clamp((x - r.left) / r.width, 0, 1) : 0.5;
    var ry = r.height ? clamp((y - r.top) / r.height, 0, 1) : 0.5;
    var draft = el('div', 'pin draft', '+');
    draft.style.left = Math.round(x) + 'px';
    draft.style.top = Math.round(y) + 'px';
    this.ui.pins.appendChild(draft);

    var name = store('local', 'hffb-name') || '';
    var chips = envChips(this.env).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
    var card = el('form', 'composer');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', '피드백 남기기');
    card.innerHTML =
      '<div class="hd"><div class="t">새 피드백<small>' + esc(describe(target)) + '</small></div><button type="button" class="x" aria-label="닫기">' + ICON_X + '</button></div>' +
      '<textarea name="body" maxlength="2000" placeholder="무엇이 달라지면 좋을지 적어 주세요" required></textarea>' +
      (name ? '' : '<input name="author" maxlength="40" placeholder="이름 (선택)" autocomplete="name">') +
      '<div class="env">' + chips + '</div>' +
      '<p class="envnote">보고 계신 기기·브라우저·화면 크기가 함께 저장돼요.</p>' +
      '<div class="acts"><button type="button" class="btn cancel">취소</button><button type="submit" class="btn pri">남기기</button></div>';
    this.root.appendChild(card);
    this.anchorCard(card, x, y);
    var ta = card.querySelector('textarea');
    setTimeout(function () { try { ta.focus({ preventScroll: true }); } catch (e) { ta.focus(); } }, 30);

    var onVV = function () { if (card.classList.contains('sheet')) self.fitSheet(card); };
    if (window.visualViewport) window.visualViewport.addEventListener('resize', onVV);

    this.composing = { card: card, draft: draft, el: target, rx: rx, ry: ry, x: x, y: y, onVV: onVV };

    card.querySelector('.x').addEventListener('click', function () { self.closeComposer(); });
    card.querySelector('.cancel').addEventListener('click', function () { self.closeComposer(); });
    ta.addEventListener('keydown', function (e) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') { e.preventDefault(); submit(); }
    });
    card.addEventListener('submit', function (e) { e.preventDefault(); submit(); });

    function submit() {
      var body = ta.value.trim();
      if (!body) { ta.focus(); return; }
      var authorInput = card.querySelector('input[name=author]');
      var author = authorInput ? authorInput.value.trim() : name;
      if (authorInput && author) store('local', 'hffb-name', author);
      var btn = card.querySelector('.btn.pri');
      btn.disabled = true;
      btn.textContent = '남기는 중…';
      var rect = target.getBoundingClientRect();
      var payload = {
        body: body,
        author_name: author || null,
        page_url: location.href.split('#')[0],
        page_path: location.pathname,
        selector: selectorFor(target),
        anchor_tag: target.tagName.toLowerCase(),
        anchor_text: textOf(target).slice(0, 200) || null,
        anchor_label: describe(target).slice(0, 80),
        rel_x: Math.round(rx * 10000) / 10000,
        rel_y: Math.round(ry * 10000) / 10000,
        doc_x: Math.round(rect.left + rx * rect.width + window.scrollX),
        doc_y: Math.round(rect.top + ry * rect.height + window.scrollY),
        env: self.env
      };
      self.request('POST', '', payload).then(function (item) {
        self.items.push(item);
        self.closeComposer();
        self.showHover(null);
        self.renderCount();
        self.renderPins();
        if (self.panel) self.renderPanel();
        self.toast('피드백 #' + item.number + '을 남겼어요');
      }).catch(function () {
        btn.disabled = false;
        btn.textContent = '남기기';
        self.toast('저장하지 못했어요. 잠시 뒤 다시 눌러 주세요');
      });
    }
  };

  Feedback.prototype.closeComposer = function () {
    var c = this.composing;
    if (!c) return;
    if (c.card.parentNode) c.card.parentNode.removeChild(c.card);
    if (c.draft.parentNode) c.draft.parentNode.removeChild(c.draft);
    if (window.visualViewport) window.visualViewport.removeEventListener('resize', c.onVV);
    this.composing = null;
  };

  Feedback.prototype.byId = function (id) {
    for (var i = 0; i < this.items.length; i++) if (String(this.items[i].id) === String(id)) return this.items[i];
    return null;
  };

  Feedback.prototype.showCard = function (id) {
    var self = this;
    var item = this.byId(id);
    if (!item) return;
    this.closeComposer();
    this.closeCard();
    this.openCard = item.id;
    var chips = envChips(item.env).map(function (c) { return '<span class="chip">' + esc(c) + '</span>'; }).join('');
    var actions = '';
    if (item.status === 'done') actions = '<div class="acts"><button type="button" class="btn again">아직 안 됐어요</button><button type="button" class="btn okb ok">확인했어요</button></div>';
    else if (item.status === 'confirmed') actions = '<div class="acts"><button type="button" class="btn again">다시 열기</button></div>';
    var card = el('div', 'card');
    card.setAttribute('role', 'dialog');
    card.setAttribute('aria-label', '피드백 ' + item.number + '번');
    card.innerHTML =
      '<div class="hd"><div class="t">#' + item.number + ' <span class="st ' + item.status + '">' + STATUS_KO[item.status] + '</span></div><button type="button" class="x" aria-label="닫기">' + ICON_X + '</button></div>' +
      '<p class="body">' + esc(item.body) + '</p>' +
      '<div class="meta">' + esc([item.author_name, when(item.created_at), item.anchor_label].filter(Boolean).join(' · ')) + '</div>' +
      '<div class="env">' + chips + '</div>' +
      (item.reply ? '<div class="reply"><b>어니스트패밀리 답변</b>' + esc(item.reply) + '</div>' : '') +
      (item.status === 'open' ? '<p class="wait">팀이 보고 고치는 중이에요. 고치면 초록색으로 바뀌어요.</p>' : '') +
      actions;
    this.root.appendChild(card);
    this.card = card;
    this.positionCard();
    this.renderPins();
    card.querySelector('.x').addEventListener('click', function () { self.closeCard(); });
    var ok = card.querySelector('.ok');
    var again = card.querySelector('.again');
    if (ok) ok.addEventListener('click', function () { self.changeStatus(item, 'confirm'); });
    if (again) again.addEventListener('click', function () { self.changeStatus(item, 'reopen'); });
  };

  Feedback.prototype.positionCard = function () {
    if (!this.card) return;
    var item = this.byId(this.openCard);
    var pt = item && this.pointOf(item);
    if (!pt) {
      this.anchorCard(this.card, viewW() / 2 - 160, window.innerHeight / 2 - 80);
      return;
    }
    this.anchorCard(this.card, pt.x + 22, pt.y - 30);
  };

  Feedback.prototype.closeCard = function () {
    if (this.card && this.card.parentNode) this.card.parentNode.removeChild(this.card);
    this.card = null;
    if (this.openCard != null) {
      this.openCard = null;
      this.renderPins();
    }
  };

  Feedback.prototype.changeStatus = function (item, action) {
    var self = this;
    this.request('POST', '/' + item.id + '/' + action).then(function (fresh) {
      for (var i = 0; i < self.items.length; i++) if (self.items[i].id === fresh.id) self.items[i] = fresh;
      self.renderCount();
      self.showCard(fresh.id);
      if (self.panel) self.renderPanel();
      self.toast(action === 'confirm' ? '확인해 주셔서 고마워요' : '다시 고쳐 달라고 전했어요');
    }).catch(function () { self.toast('처리하지 못했어요. 잠시 뒤 다시 눌러 주세요'); });
  };

  Feedback.prototype.openPanel = function () {
    var self = this;
    if (this.panel) { this.closePanel(); return; }
    this.hideNudge();
    var panel = el('div', 'panel' + (isMobileWidth() ? ' sheet' : ''));
    panel.setAttribute('role', 'dialog');
    panel.setAttribute('aria-label', '피드백 목록');
    this.root.appendChild(panel);
    this.panel = panel;
    if (!this.tabChosen) this.tab = this.defaultTab();
    this.renderPanel();
    this.load();
  };

  Feedback.prototype.defaultTab = function () {
    return this.items.some(function (i) { return i.status === 'done'; }) ? 'done' : 'open';
  };

  Feedback.prototype.closePanel = function () {
    if (this.panel && this.panel.parentNode) this.panel.parentNode.removeChild(this.panel);
    this.panel = null;
  };

  Feedback.prototype.renderPanel = function () {
    var self = this;
    var panel = this.panel;
    if (!panel) return;
    if (!this.tabChosen) this.tab = this.defaultTab();
    var counts = { open: 0, done: 0, confirmed: 0, all: this.items.length };
    this.items.forEach(function (i) { counts[i.status] = (counts[i.status] || 0) + 1; });
    var tabs = [['open', '남은 것'], ['done', '완료 · 확인해 주세요'], ['confirmed', '확인 끝'], ['all', '전체']];
    var list = this.items.filter(function (i) { return self.tab === 'all' || i.status === self.tab; })
      .slice().sort(function (a, b) { return b.number - a.number; });
    var here = normPath(location.pathname);
    panel.innerHTML =
      '<div class="ph"><div class="t">피드백 ' + counts.all + '</div><button type="button" class="x" aria-label="닫기">' + ICON_X + '</button></div>' +
      '<div class="tabs">' + tabs.map(function (t) {
        return '<button type="button" class="tab' + (t[0] === 'done' ? ' done-tab' : '') + (self.tab === t[0] ? ' on' : '') + '" data-tab="' + t[0] + '">' + t[1] + '<em>' + (counts[t[0]] || 0) + '</em></button>';
      }).join('') + '</div>' +
      '<div class="list">' + (list.length ? list.map(function (i) {
        var other = normPath(i.page_path) !== here;
        var meta = [i.author_name, when(i.created_at), envChips(i.env).slice(0, 2).join(' · '), other ? '다른 화면' : ''].filter(Boolean).join(' · ');
        return '<button type="button" class="item" data-id="' + i.id + '"><span class="no ' + i.status + '">' + i.number + '</span>' +
          '<span class="tx"><span class="bd">' + esc(i.body) + '</span><span class="mt">' + esc(meta) + '</span></span>' +
          '<span class="go">' + (i.status === 'done' ? '확인하기' : '보기') + '</span></button>';
      }).join('') : '<div class="empty">' + (self.tab === 'done' ? '아직 완료된 피드백이 없어요.' : self.tab === 'open' ? '남은 피드백이 없어요.' : '피드백이 없어요.') + '</div>') + '</div>' +
      '<div class="pf">' + (self.tab === 'confirmed' ? '확인 끝난 피드백은 화면에서 숨겨 둬요. 누르면 그 자리에 다시 보여요.' : '누르면 그 피드백을 남긴 자리로 바로 이동해요.') + '</div>';
    panel.querySelector('.x').addEventListener('click', function () { self.closePanel(); });
    Array.prototype.forEach.call(panel.querySelectorAll('.tab'), function (b) {
      b.addEventListener('click', function () { self.tab = b.getAttribute('data-tab'); self.tabChosen = true; self.renderPanel(); });
    });
    Array.prototype.forEach.call(panel.querySelectorAll('.item'), function (b) {
      b.addEventListener('click', function () { self.focus(self.byId(b.getAttribute('data-id'))); });
    });
  };

  Feedback.prototype.focusFromHash = function () {
    var m = location.hash.match(/hffb=(\d+)/);
    if (!m || !this.items.length) return;
    var item = this.byId(m[1]);
    if (!item) return;
    history.replaceState(null, '', location.href.replace(/#?hffb=\d+/, '').replace(/#$/, ''));
    this.focus(item);
  };

  Feedback.prototype.focus = function (item) {
    var self = this;
    if (!item) return;
    if (!this.here(item)) {
      location.href = item.page_url.split('#')[0] + '#hffb=' + item.id;
      return;
    }
    this.closePanel();
    if (!this.on) this.setMode(true);
    var pt = this.pointOf(item);
    var target = pt && pt.el;
    var go = function () {
      self.spot(target || null, item);
      self.showCard(item.id);
    };
    if (target) {
      this.reveal(target).then(go);
    } else if (item.doc_y != null) {
      window.scrollTo({ top: Math.max(0, item.doc_y - window.innerHeight / 2), behavior: 'smooth' });
      setTimeout(go, 700);
    } else {
      go();
    }
  };

  Feedback.prototype.reveal = function (target) {
    var smooth = !(window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches);
    var r = target.getBoundingClientRect();
    var top = r.top;
    for (var n = target.parentElement; n && n !== document.body && n !== document.documentElement; n = n.parentElement) {
      var cs = getComputedStyle(n);
      if (!/(auto|scroll|overlay)/.test(cs.overflowY) || n.scrollHeight <= n.clientHeight + 1) continue;
      var c = n.getBoundingClientRect();
      if (top < c.top || top + r.height > c.bottom) {
        var want = c.top + Math.max(0, (n.clientHeight - r.height) / 2);
        var next = clamp(n.scrollTop + (top - want), 0, n.scrollHeight - n.clientHeight);
        var dy = next - n.scrollTop;
        n.scrollTo({ top: next, behavior: smooth ? 'smooth' : 'auto' });
        top -= dy;
      }
    }
    var vh = window.innerHeight;
    var pinned = false;
    for (var f = target; f && f.nodeType === 1; f = f.parentElement) {
      var pos = getComputedStyle(f).position;
      if (pos === 'fixed' || pos === 'sticky') { pinned = true; break; }
    }
    if (!pinned && (top < 80 || top + r.height > vh - 80)) {
      var desired = r.height < vh - 160 ? (vh - r.height) / 2 : 80;
      window.scrollTo({ top: Math.max(0, window.scrollY + top - desired), behavior: smooth ? 'smooth' : 'auto' });
    }
    return new Promise(function (resolve) {
      var last = null;
      var still = 0;
      var t0 = performance.now();
      (function tick() {
        var rr = target.getBoundingClientRect();
        var k = Math.round(rr.top) + ':' + Math.round(rr.left);
        still = k === last ? still + 1 : 0;
        last = k;
        if (still >= 3 || performance.now() - t0 > 1600) { resolve(); return; }
        requestAnimationFrame(tick);
      })();
    });
  };

  Feedback.prototype.spot = function (target, item) {
    var self = this;
    this.spotEl = target;
    this.spotItem = item;
    this.ui.spot.classList.add('show');
    this.drawSpot();
    clearTimeout(this.spotTimer);
    var off = function () {
      document.removeEventListener('pointerdown', off, true);
      self.spotOff();
    };
    setTimeout(function () { document.addEventListener('pointerdown', off, true); }, 50);
    this.spotTimer = setTimeout(off, 2600);
  };

  Feedback.prototype.spotOff = function () {
    this.ui.spot.classList.remove('show');
    this.spotEl = null;
  };

  Feedback.prototype.drawSpot = function () {
    var w = this.root.getBoundingClientRect().width || window.innerWidth;
    var h = this.root.getBoundingClientRect().height || window.innerHeight;
    var outer = 'M-2 -2H' + (w + 2) + 'V' + (h + 2) + 'H-2Z';
    var hole = '';
    if (this.spotEl && this.spotEl.getBoundingClientRect) {
      var r = this.spotEl.getBoundingClientRect();
      var x = r.left - 8;
      var y = r.top - 8;
      var ww = r.width + 16;
      var hh = r.height + 16;
      var rad = Math.min(12, ww / 2, hh / 2);
      hole = 'M' + (x + rad) + ' ' + y + 'H' + (x + ww - rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + ww) + ' ' + (y + rad) +
        'V' + (y + hh - rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + ww - rad) + ' ' + (y + hh) +
        'H' + (x + rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + x + ' ' + (y + hh - rad) +
        'V' + (y + rad) + 'A' + rad + ' ' + rad + ' 0 0 1 ' + (x + rad) + ' ' + y + 'Z';
    }
    this.ui.spotSh.setAttribute('d', outer + hole);
    this.ui.spotRg.setAttribute('d', hole);
  };

  Feedback.prototype.toast = function (msg) {
    var t = this.ui.toast;
    t.textContent = msg;
    t.classList.add('show');
    clearTimeout(this.toastTimer);
    this.toastTimer = setTimeout(function () { t.classList.remove('show'); }, 2600);
  };

  var instance = null;
  var waitingForInvite = false;

  function invited(opts) {
    if (!opts.invite) return true;
    var m = (location.search + '&' + location.hash).match(/hffb=(on|off|\d+)/);
    if (m && m[1] === 'off') {
      store('local', 'hffb-invited', null);
      return false;
    }
    if (m) {
      store('local', 'hffb-invited', '1');
      return true;
    }
    return store('local', 'hffb-invited') === '1';
  }

  window.HFFeedback = {
    init: function (opts) {
      if (instance || !opts || !opts.key) return instance;
      var start = function () {
        if (instance) return;
        if (!invited(opts)) {
          if (!waitingForInvite) {
            waitingForInvite = true;
            window.addEventListener('hashchange', start);
          }
          return;
        }
        instance = new Feedback(opts);
      };
      if (document.body) start(); else document.addEventListener('DOMContentLoaded', start);
      return instance;
    },
    instance: function () { return instance; },
    detectEnv: detectEnv,
    version: '1.1.0'
  };

  if (SCRIPT && SCRIPT.dataset && SCRIPT.dataset.key) {
    window.HFFeedback.init({
      key: SCRIPT.dataset.key,
      api: SCRIPT.dataset.api,
      top: SCRIPT.dataset.top,
      hide: SCRIPT.dataset.hide,
      invite: SCRIPT.hasAttribute('data-invite') && !/^(false|0|off)$/i.test(SCRIPT.dataset.invite)
    });
  }
})();
