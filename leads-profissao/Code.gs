function doPost(e) {
  var lock = LockService.getScriptLock();
  lock.waitLock(10000);
  try {
    var d = JSON.parse(e.postData.contents);
    var sh = SpreadsheetApp.openById('1FcZx91r7MdM6eXdSnh-XxYkGFhri4bCstqfLTout3RQ').getSheetByName('Leads');
    sh.appendRow([d.timestamp || '', d.nome || '', d.email || '', d.whatsapp || '', d.area || '', d.origem || '', d.status || 'novo']);
    return ContentService.createTextOutput(JSON.stringify({ok: true})).setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ok: false, error: String(err)})).setMimeType(ContentService.MimeType.JSON);
  } finally {
    lock.releaseLock();
  }
}
function doGet() {
  return ContentService.createTextOutput(JSON.stringify({ok: true})).setMimeType(ContentService.MimeType.JSON);
}
