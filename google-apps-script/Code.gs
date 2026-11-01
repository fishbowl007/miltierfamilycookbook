function doGet() {
  return HtmlService.createHtmlOutputFromFile("Gate")
    .setTitle("Miltier Family Recipes")
    .setFaviconUrl("https://raw.githubusercontent.com/fishbowl007/miltierfamilycookbook/main/assets/miltier-icon.png")
    .addMetaTag("viewport", "width=device-width, initial-scale=1");
}

// The code stays in Google Script Properties and is never sent to the browser.
function unlockCookbook(code) {
  var expected = PropertiesService.getScriptProperties().getProperty('FAMILY_PASSCODE');
  if (!expected) return { ok: false, message: 'The cookbook passcode is being set up. Please try again later.' };
  if (typeof code !== 'string' || code.length > 128) return { ok: false, message: 'That passcode did not match. Please try again.' };
  var lock = LockService.getScriptLock();
  if (!lock.tryLock(5000)) return { ok: false, message: 'Please wait a moment and try again.' };
  try {
    var cache = CacheService.getScriptCache();
    var failures = Number(cache.get('cookbook-failed-attempts') || 0);
    if (failures >= 30) return { ok: false, message: 'Too many attempts. Please try again in a minute.' };
    var matches = code === expected;
    if (!matches) {
      cache.put('cookbook-failed-attempts', String(failures + 1), 60);
      return { ok: false, message: 'That passcode did not match. Please try again.' };
    }
    return { ok: true, html: HtmlService.createHtmlOutputFromFile('Index').getContent() };
  } finally {
    lock.releaseLock();
  }
}
