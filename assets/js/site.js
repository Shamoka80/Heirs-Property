(function () {
  document.documentElement.classList.add("js");

  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  if (navToggle && primaryNav && window.matchMedia("(max-width: 899px)").matches) {
    primaryNav.classList.add("is-collapsible");
    navToggle.addEventListener("click", function () {
      var open = primaryNav.classList.toggle("is-open");
      navToggle.setAttribute("aria-expanded", String(open));
    });
  }

  if (window.HeirsPropertyStorage) {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.lastPage, currentPage);
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-checklist]"), function (list) {
    if (!window.HeirsPropertyStorage) {
      return;
    }

    var key = list.getAttribute("data-checklist");
    var storage = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
    var savedState = storage[key] || {};
    var boxes = Array.prototype.slice.call(list.querySelectorAll('input[type="checkbox"]'));
    var status = document.querySelector('[data-checklist-status="' + key + '"]');

    boxes.forEach(function (box) {
      var itemId = box.getAttribute("data-item-id");
      if (savedState[itemId]) {
        box.checked = true;
      }

      box.addEventListener("change", function () {
        var updated = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
        updated[key] = updated[key] || {};
        updated[key][itemId] = box.checked;
        var ok = window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.checklists, updated);
        if (status) {
          status.textContent = ok
            ? "Checklist progress is saved only in this browser on this device."
            : "Checklist progress could not be saved in this browser.";
        }
      });
    });

    var resetButton = document.querySelector('[data-reset-checklist="' + key + '"]');
    if (resetButton) {
      resetButton.addEventListener("click", function () {
        if (!window.confirm("Reset this checklist in this browser?")) {
          return;
        }

        boxes.forEach(function (box) {
          box.checked = false;
        });

        var updated = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
        delete updated[key];
        var ok = window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.checklists, updated);
        if (status) {
          status.textContent = ok
            ? "Checklist progress was cleared from this browser."
            : "Checklist progress could not be cleared in this browser.";
        }
      });
    }
  });
}());
