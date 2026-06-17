(function () {
  var storage = window.HeirsPropertyStorage;
  if (!storage) { return; }

  var form = document.querySelector("[data-notes-form]");
  if (!form) { return; }

  var status = document.querySelector("[data-notes-status]");
  var fields = Array.prototype.slice.call(form.querySelectorAll("[data-notes-field]"));
  var hasStorage = storage.canUseLocalStorage();

  function readNotes() {
    return storage.readJson(storage.keys.notes, {});
  }

  function writeNotes(notes) {
    var ok = storage.writeJson(storage.keys.notes, notes);
    if (status) {
      status.textContent = ok
        ? "Saved in this browser on this device at " + new Date().toLocaleTimeString([], { hour: "numeric", minute: "2-digit" }) + "."
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

  function getFieldMeta(field) {
    var label = form.querySelector('label[for="' + field.id + '"]');
    var help = field.closest(".field-group") ? field.closest(".field-group").querySelector(".help-text") : null;
    return {
      key: field.name,
      label: label ? label.textContent.trim() : field.name,
      help: help ? help.textContent.trim() : ""
    };
  }

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>\"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function formatPrintDate(date) {
    return date.toLocaleString([], {
      year: "numeric",
      month: "long",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    });
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
      var meta = getFieldMeta(field);
      lines.push(meta.label + ":");
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

  function buildPrintReport(notes) {
    var existing = document.querySelector("[data-notes-print-report]");
    if (existing) { existing.remove(); }

    var now = new Date();
    var sections = fields.map(function (field) {
      var meta = getFieldMeta(field);
      var value = String(notes[field.name] || "").trim();
      return "<section class=\"notes-print-section\">" +
        "<h2>" + escapeHtml(meta.label) + "</h2>" +
        (meta.help ? "<p class=\"notes-print-help\">" + escapeHtml(meta.help) + "</p>" : "") +
        "<div class=\"notes-print-value\">" + escapeHtml(value || "No notes entered.") + "</div>" +
      "</section>";
    }).join("");

    var report = document.createElement("article");
    report.className = "notes-print-report";
    report.setAttribute("data-notes-print-report", "");
    report.setAttribute("aria-label", "Printable private notes report");
    report.innerHTML =
      "<header class=\"notes-print-header\">" +
        "<p class=\"notes-print-kicker\">Heirs’ Property Guide</p>" +
        "<h1>Private Notes</h1>" +
        "<p class=\"notes-print-meta\">Printed/Saved on " + escapeHtml(formatPrintDate(now)) + "</p>" +
        "<p class=\"notes-print-disclaimer\">These notes are saved only in this browser on this device. They are for personal organization and are not legal advice.</p>" +
      "</header>" +
      "<div class=\"notes-print-grid\">" + sections + "</div>";
    document.body.appendChild(report);
    return report;
  }

  function printNotesReport() {
    var notes = collectNotes();
    writeNotes(notes);
    buildPrintReport(notes);
    document.body.classList.add("print-notes-report-mode");
    window.print();
  }

  function cleanupPrintReport() {
    document.body.classList.remove("print-notes-report-mode");
    var report = document.querySelector("[data-notes-print-report]");
    if (report) { report.remove(); }
  }

  populate(readNotes());
  if (status && !hasStorage) {
    status.textContent = "Local saving is unavailable in this browser right now.";
  }

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

  var printButton = document.querySelector("[data-print]");
  if (printButton) {
    printButton.addEventListener("click", function (event) {
      event.preventDefault();
      event.stopImmediatePropagation();
      printNotesReport();
    }, true);
  }

  window.addEventListener("afterprint", cleanupPrintReport);
}());
