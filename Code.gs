// ===== SETTINGS: edit these three lines =====
var SCHOLAR_USER     = "BVhofN0AAAAJ";      // Google Scholar profile id (from the profile link, user=...)
var SCOPUS_AUTHOR_ID = "56607283300";       // Scopus author id
var SCOPUS_API_KEY   = "";                  // free key from https://dev.elsevier.com/apikey/manage  (paste between the quotes)
var CACHE_HOURS      = 6;                   // live data is refreshed at most this often (max 6)
// ============================================

function doGet(e) {
  var p = (e && e.parameter) || {};
  return respond_(p.live ? getLive_() : getSheets_(), p.callback);
}

function respond_(data, cb) {
  var json = JSON.stringify(data);
  if (cb && /^[A-Za-z0-9_]+$/.test(cb)) {
    return ContentService.createTextOutput(cb + "(" + json + ")")
      .setMimeType(ContentService.MimeType.JAVASCRIPT);
  }
  return ContentService.createTextOutput(json).setMimeType(ContentService.MimeType.JSON);
}

// ---- every tab of the sheet ----
function getSheets_() {
  var out = {};
  SpreadsheetApp.getActiveSpreadsheet().getSheets().forEach(function (sh) {
    out[sh.getName()] = sh.getDataRange().getDisplayValues();
  });
  return out;
}

// ---- live metrics (Google Scholar + Scopus), cached ----
function getLive_() {
  var cache = CacheService.getScriptCache();
  var hit = cache.get("live_v2");
  if (hit) return JSON.parse(hit);
  var out = {
    scholar: safe_(fetchScholar_, "scholar"),
    scopus: safe_(fetchScopus_, "scopus"),
    fetched: new Date().toISOString()
  };
  if ((out.scholar && out.scholar.ok) || (out.scopus && out.scopus.ok)) {
    cache.put("live_v2", JSON.stringify(out), Math.min(CACHE_HOURS, 6) * 3600);
  }
  return out;
}

// run fn; on success remember the result, on failure fall back to the last good result
function safe_(fn, key) {
  var props = PropertiesService.getScriptProperties();
  try {
    var r = fn();
    props.setProperty("last_" + key, JSON.stringify(r));
    return r;
  } catch (err) {
    var last = props.getProperty("last_" + key);
    if (last) { var o = JSON.parse(last); o.stale = true; o.error = String(err.message || err); return o; }
    return { ok: false, error: String(err.message || err) };
  }
}

function fetchScholar_() {
  var base = "https://scholar.google.com/citations?hl=en&user=" + SCHOLAR_USER;
  var opts = {
    muteHttpExceptions: true,
    headers: {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
      "Accept-Language": "en"
    }
  };
  var years = {}, total = 0, stats = null;
  for (var start = 0; start < 800; start += 100) {
    var res = UrlFetchApp.fetch(base + "&cstart=" + start + "&pagesize=100", opts);
    if (res.getResponseCode() !== 200) throw new Error("Google Scholar returned HTTP " + res.getResponseCode());
    var html = res.getContentText();
    if (start === 0) {
      var nums = [], re = /class="gsc_rsb_std">([\d,]+)</g, m;
      while ((m = re.exec(html))) nums.push(parseInt(m[1].replace(/,/g, ""), 10));
      if (nums.length < 6) throw new Error("Could not read Scholar statistics (request blocked or page layout changed)");
      var sm = html.match(/Since (\d{4})/);
      stats = { ok: true, citations: nums[0], citationsSince: nums[1], h: nums[2], hSince: nums[3],
                i10: nums[4], i10Since: nums[5], sinceYear: sm ? sm[1] : "" };
    }
    var rowRe = /<tr class="gsc_a_tr">[\s\S]*?<\/tr>/g, rm, n = 0;
    while ((rm = rowRe.exec(html))) {
      n++; total++;
      var ym = rm[0].match(/class="gsc_a_h gsc_a_hc gs_ibl">(\d{4})</);
      if (ym) years[ym[1]] = (years[ym[1]] || 0) + 1;
    }
    if (n < 100) break;
    Utilities.sleep(700);
  }
  stats.docs = total;
  stats.byYear = years;
  return stats;
}

function fetchScopus_() {
  if (!SCOPUS_API_KEY) throw new Error("Scopus API key is not set in the Apps Script");
  var url = "https://api.elsevier.com/content/author/author_id/" + SCOPUS_AUTHOR_ID + "?view=METRICS";
  var res = UrlFetchApp.fetch(url, {
    muteHttpExceptions: true,
    headers: { "X-ELS-APIKey": SCOPUS_API_KEY, "Accept": "application/json" }
  });
  if (res.getResponseCode() !== 200) throw new Error("Scopus returned HTTP " + res.getResponseCode());
  var r = JSON.parse(res.getContentText())["author-retrieval-response"];
  r = (r && r.length) ? r[0] : r;
  var core = (r && r.coredata) || {};
  return {
    ok: true,
    docs: parseInt(core["document-count"], 10),
    citations: parseInt(core["citation-count"], 10),
    citedBy: parseInt(core["cited-by-count"], 10),
    h: parseInt(r["h-index"], 10)
  };
}

// Run this once from the editor (select testLive > Run). It asks for permission the first time,
// then prints what Google Scholar and Scopus returned in the Execution log.
function testLive() {
  CacheService.getScriptCache().remove("live_v2");
  var out = getLive_();
  Logger.log(JSON.stringify(out).slice(0, 1500));
}
