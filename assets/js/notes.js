(function () {
  var storage = window.HeirsPropertyStorage;
  if (!storage) { return; }

  var form = document.querySelector("[data-notes-form]");
  if (!form) { return; }

  var status = document.querySelector("[data-notes-status]");
  var fields = Array.prototype.slice.call(form.querySelectorAll("[data-notes-field]"));

  function readNotes() {
    return storage.readJson(storage.keys.notes, {});
  }

  function writeNotes(notes) {
    var ok = storage.writeJson(storage.keys.notes, notes);
    if (status) {
      status.textContent = ok
        ? "Saved only in this browser on this device."
        : "This browser is not allowing local saving right now.";
    }
    return ok;
  }

  function collectNotes() {
    var payload = {};
    fields.forEach(function (field) {
      payload[field.name] = field.value;
    });
    payload.savedAt = new Date().toISOString();
    return payload;
  }

  function populate(notes) {
    fields.forEach(function (field) {
      field.value = notes[field.name] || "";
    });
  }

  function exportText(notes) {
    var lines = [
      "Heirs’ Property Notes",
      "",
      "Saved only in this browser on this device.",
      "Exported: " + new Date().toLocaleString(),
      ""
    ];

    fields.forEach(function (field) {
      var label = form.querySelector('label[for="' + field.id + '"]');
      lines.push((label ? label.textContent : field.name) + ":");
      lines.push(notes[field.name] || "");
      lines.push("");
    });

    return lines.join("\n");
  }

  function downloadBlob(content, fileName, type) {
    var blob = new Blob([content], { type: type });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = fileName;
    document.body.appendChild(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }

  populate(readNotes());

  form.addEventListener("input", function () {
    writeNotes(collectNotes());
  });

  var saveButton = document.querySelector("[data-save-notes]");
  if (saveButton) {
    saveButton.addEventListener("click", function () {
      writeNotes(collectNotes());
    });
  }

  var resetButton = document.querySelector("[data-reset-notes]");
  if (resetButton) {
    resetButton.addEventListener("click", function () {
      if (!window.confirm("Clear all notes saved in this browser on this device?")) {
        return;
      }
      fields.forEach(function (field) {
        field.value = "";
      });
      storage.remove(storage.keys.notes);
      if (status) {
        status.textContent = "Notes were cleared from this browser on this device.";
      }
    });
  }

  var exportTextButton = document.querySelector("[data-export-notes='text']");
  if (exportTextButton) {
    exportTextButton.addEventListener("click", function () {
      var notes = collectNotes();
      downloadBlob(exportText(notes), "heirs-property-notes.txt", "text/plain;charset=utf-8");
    });
  }

  var exportJsonButton = document.querySelector("[data-export-notes='json']");
  if (exportJsonButton) {
    exportJsonButton.addEventListener("click", function () {
      var notes = collectNotes();
      downloadBlob(JSON.stringify(notes, null, 2), "heirs-property-notes.json", "application/json;charset=utf-8");
    });
  }
}());
