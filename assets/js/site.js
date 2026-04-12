(function () {
  document.documentElement.classList.add("js");

  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  var mobileQuery = window.matchMedia("(max-width: 899px)");

  function openNav() {
    primaryNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
  }

  function closeNav() {
    primaryNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function syncNavigationMode() {
    if (!navToggle || !primaryNav) {
      return;
    }

    if (mobileQuery.matches) {
      primaryNav.classList.add("is-collapsible");
      closeNav();
      return;
    }

    primaryNav.classList.remove("is-collapsible", "is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && primaryNav) {
    syncNavigationMode();

    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.contains("is-open");
      if (isOpen) {
        closeNav();
      } else {
        openNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        closeNav();
      }
    });

    Array.prototype.forEach.call(primaryNav.querySelectorAll("a"), function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) {
          closeNav();
        }
      });
    });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncNavigationMode);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncNavigationMode);
    }
  }

  if (window.HeirsPropertyStorage) {
    var currentPage = window.location.pathname.split("/").pop() || "index.html";
    window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.lastPage, currentPage);
  }

  var pageKey = window.location.pathname.split("/").pop() || "index.html";
  var pageMetaMap = {
    "index.html": "6 min read",
    "start-here.html": "8 min read",
    "what-is-heirs-property.html": "9 min read",
    "how-families-lose-land.html": "9 min read",
    "south-carolina-legal-protections.html": "8 min read",
    "what-to-do-first.html": "10 min read",
    "protecting-preserving-family-land.html": "8 min read",
    "economic-opportunities.html": "7 min read",
    "history-culture-legacy.html": "7 min read",
    "resources-get-help.html": "6 min read",
    "notes.html": "5 min read",
    "printable-guide.html": "12 min read",
    "about-this-guide.html": "5 min read",
    "accessibility.html": "4 min read",
    "404.html": "1 min read"
  };

  var pageHeadInner = document.querySelector(".page-head-inner");
  if (pageHeadInner && !pageHeadInner.querySelector(".page-meta")) {
    var pageMeta = document.createElement("p");
    pageMeta.className = "page-meta";
    var updated = document.createElement("span");
    updated.className = "meta-badge";
    updated.textContent = "Last updated: April 12, 2026";
    var readTime = document.createElement("span");
    readTime.className = "meta-badge";
    readTime.textContent = "Estimated read: " + (pageMetaMap[pageKey] || "6 min read");
    pageMeta.appendChild(updated);
    pageMeta.appendChild(readTime);
    pageHeadInner.appendChild(pageMeta);
  }

  var longPages = {
    "start-here.html": true,
    "what-is-heirs-property.html": true,
    "how-families-lose-land.html": true,
    "south-carolina-legal-protections.html": true,
    "what-to-do-first.html": true,
    "protecting-preserving-family-land.html": true,
    "economic-opportunities.html": true,
    "history-culture-legacy.html": true,
    "resources-get-help.html": true,
    "printable-guide.html": true
  };

  if (longPages[pageKey]) {
    Array.prototype.forEach.call(document.querySelectorAll(".page-main > section.section"), function (section) {
      if (section.querySelector(".section-tools")) {
        return;
      }
      var tools = document.createElement("div");
      tools.className = "section-tools no-print";
      var printButton = document.createElement("button");
      printButton.className = "button-tertiary";
      printButton.type = "button";
      printButton.setAttribute("data-print-section", "");
      printButton.textContent = "Print this section";

      var saveLink = document.createElement("a");
      saveLink.className = "button-tertiary";
      saveLink.href = "notes.html";
      saveLink.textContent = "Save notes for this section";

      tools.appendChild(printButton);
      tools.appendChild(saveLink);
      section.appendChild(tools);
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-print-section]"), function (button) {
    button.addEventListener("click", function () {
      var section = button.closest("section");
      if (section && section.scrollIntoView) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      window.setTimeout(function () {
        window.print();
      }, 150);
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
