(function () {
  document.documentElement.classList.add("js");

  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  var mobileQuery = window.matchMedia("(max-width: 899px)");

  function emitAnalytics(eventName, detail) {
    var payload = {
      event: eventName,
      detail: detail || {},
      page: window.location.pathname,
      ts: new Date().toISOString()
    };

    if (window.dataLayer && typeof window.dataLayer.push === "function") {
      window.dataLayer.push(payload);
    }

    document.dispatchEvent(new CustomEvent("heirsPropertyAnalytics", { detail: payload }));
  }

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
  var pageHeadInner = document.querySelector(".page-head-inner");
  var mainContent = document.querySelector(".page-main");

  function estimateReadTime() {
    if (!mainContent) {
      return 1;
    }
    var text = (mainContent.textContent || "").replace(/\s+/g, " ").trim();
    if (!text) {
      return 1;
    }
    var words = text.split(" ").length;
    return Math.max(1, Math.ceil(words / 200));
  }

  if (pageHeadInner && !pageHeadInner.querySelector(".page-meta")) {
    var pageMeta = document.createElement("p");
    pageMeta.className = "page-meta";

    var updated = document.createElement("span");
    updated.className = "meta-badge";
    updated.textContent = "Last updated: April 12, 2026";

    var readTime = document.createElement("span");
    readTime.className = "meta-badge";
    readTime.textContent = "Estimated read: " + estimateReadTime() + " min read";

    pageMeta.appendChild(updated);
    pageMeta.appendChild(readTime);
    pageHeadInner.appendChild(pageMeta);
  }

  function slugify(text) {
    return text.toLowerCase().replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").slice(0, 60);
  }

  function ensureSectionId(section, index) {
    if (section.id) {
      return section.id;
    }
    var heading = section.querySelector("h2, h3");
    var base = heading ? slugify(heading.textContent) : "section-" + (index + 1);
    if (!base) {
      base = "section-" + (index + 1);
    }
    var id = base;
    var i = 2;
    while (document.getElementById(id)) {
      id = base + "-" + i;
      i += 1;
    }
    section.id = id;
    return id;
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
    Array.prototype.forEach.call(document.querySelectorAll(".page-main > section.section"), function (section, index) {
      if (section.querySelector(".section-tools")) {
        return;
      }

      var sectionId = ensureSectionId(section, index);

      var tools = document.createElement("div");
      tools.className = "section-tools no-print";

      var printButton = document.createElement("button");
      printButton.className = "button-tertiary";
      printButton.type = "button";
      printButton.setAttribute("data-print-section", sectionId);
      printButton.textContent = "Print this section";

      var saveLink = document.createElement("a");
      saveLink.className = "button-tertiary";
      saveLink.href = "notes.html";
      saveLink.setAttribute("data-save-section", sectionId);
      saveLink.textContent = "Save notes for this section";

      var copyButton = document.createElement("button");
      copyButton.className = "button-tertiary";
      copyButton.type = "button";
      copyButton.setAttribute("data-copy-section-link", sectionId);
      copyButton.textContent = "Copy section link";

      tools.appendChild(printButton);
      tools.appendChild(saveLink);
      tools.appendChild(copyButton);
      section.appendChild(tools);
    });
  }

  function clearSectionPrintMode() {
    document.body.classList.remove("print-section-mode");
    Array.prototype.forEach.call(document.querySelectorAll(".print-target"), function (target) {
      target.classList.remove("print-target");
    });
  }

  window.addEventListener("afterprint", clearSectionPrintMode);

  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-print-section]"), function (button) {
    button.addEventListener("click", function () {
      clearSectionPrintMode();
      var targetId = button.getAttribute("data-print-section");
      var section = document.getElementById(targetId);
      if (!section) {
        window.print();
        return;
      }

      section.classList.add("print-target");
      document.body.classList.add("print-section-mode");

      emitAnalytics("section_print_clicked", { section_id: targetId });

      window.print();
      window.setTimeout(clearSectionPrintMode, 1200);
    });
  });

  function copyText(value) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      return navigator.clipboard.writeText(value);
    }

    return new Promise(function (resolve, reject) {
      try {
        var temp = document.createElement("textarea");
        temp.value = value;
        temp.setAttribute("readonly", "readonly");
        temp.style.position = "absolute";
        temp.style.left = "-9999px";
        document.body.appendChild(temp);
        temp.select();
        document.execCommand("copy");
        temp.remove();
        resolve();
      } catch (error) {
        reject(error);
      }
    });
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-section-link]"), function (button) {
    button.addEventListener("click", function () {
      var sectionId = button.getAttribute("data-copy-section-link");
      var sectionUrl = window.location.origin + window.location.pathname + "#" + sectionId;
      copyText(sectionUrl).then(function () {
        button.textContent = "Link copied";
        window.setTimeout(function () {
          button.textContent = "Copy section link";
        }, 1400);
      });
      emitAnalytics("section_link_copied", { section_id: sectionId });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-save-section]"), function (link) {
    link.addEventListener("click", function () {
      emitAnalytics("section_save_notes_clicked", { section_id: link.getAttribute("data-save-section") });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-mobile-help-action]"), function (link) {
    link.addEventListener("click", function () {
      emitAnalytics("mobile_help_tap", { action: link.getAttribute("data-mobile-help-action") });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-mobile-quick-link]"), function (link) {
    link.addEventListener("click", function () {
      emitAnalytics("mobile_quick_link_tap", { action: link.getAttribute("data-mobile-quick-link"), href: link.href });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-copy-support]"), function (button) {
    button.addEventListener("click", function () {
      var numbers = "Center for Heirs' Property: (843) 745-7055 | SC Legal Services: (888) 346-5592";
      copyText(numbers).then(function () {
        button.textContent = "Numbers copied";
        window.setTimeout(function () {
          button.textContent = "Copy support numbers";
        }, 1500);
      });
      emitAnalytics("mobile_support_numbers_copied", {});
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
