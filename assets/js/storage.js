
(function () {
  var StorageKeys = { notes: "heirsProperty.notes.v1", checklists: "heirsProperty.checklists.v1", lastPage: "heirsProperty.lastPage.v1" };
  function canUseLocalStorage() { try { var testKey = "__heirsPropertyTest__"; localStorage.setItem(testKey, "1"); localStorage.removeItem(testKey); return true; } catch (error) { return false; } }
  function readJson(key, fallback) { if (!canUseLocalStorage()) { return fallback; } try { var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch (error) { return fallback; } }
  function writeJson(key, value) { if (!canUseLocalStorage()) { return false; } try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch (error) { return false; } }
  function remove(key) { if (!canUseLocalStorage()) { return false; } try { localStorage.removeItem(key); return true; } catch (error) { return false; } }
  window.HeirsPropertyStorage = { keys: StorageKeys, canUseLocalStorage: canUseLocalStorage, readJson: readJson, writeJson: writeJson, remove: remove };
}());
