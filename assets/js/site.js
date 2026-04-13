(function () {
  document.documentElement.classList.add("js");
  var rawPath = window.location.pathname;
  var pageKey = rawPath.split("/").pop() || "index.html";
  var primaryLinks = [
    { href: "index.html", label: "Home" },
    { href: "start-here.html", label: "Start here" },
    { href: "what-is-heirs-property.html", label: "What is heirs’ property?" },
    { href: "how-families-lose-land.html", label: "How families lose land" },
    { href: "south-carolina-legal-protections.html", label: "SC legal protections" },
    { href: "what-to-do-first.html", label: "What to do first" },
    { href: "resources-get-help.html", label: "Get help" },
    { href: "protecting-preserving-family-land.html", label: "Protecting family land" },
    { href: "economic-opportunities.html", label: "Economic opportunities" },
    { href: "history-culture-legacy.html", label: "History, culture, legacy" },
    { href: "notes.html", label: "Notes" },
    { href: "printable-guide.html", label: "Printable guide" },
    { href: "about-this-guide.html", label: "About" },
    { href: "accessibility.html", label: "Accessibility" }
  ];
  var knownPages = primaryLinks.reduce(function (acc, link) {
    acc[link.href] = true;
    return acc;
  }, {
    "404.html": true
  });

  var legacyPathMap = {
    "how-families-lose-land": "how-families-lose-land.html",
    "what-is-heirs-property": "what-is-heirs-property.html",
    "south-carolina-legal-protections": "south-carolina-legal-protections.html",
    "protecting-preserving-family-land": "protecting-preserving-family-land.html",
    "economic-opportunities": "economic-opportunities.html",
    "history-culture-legacy": "history-culture-legacy.html",
    "what-to-do-first": "what-to-do-first.html",
    "resources-get-help": "resources-get-help.html",
    "start-here": "start-here.html",
    "printable-guide": "printable-guide.html",
    "about-this-guide": "about-this-guide.html",
    "accessibility": "accessibility.html",
    "notes": "notes.html"
  };

  function maybeRedirectLegacyPath() {
    var cleanPath = rawPath.replace(/\/+$/, "");
    var segment = cleanPath.split("/").pop() || "";
    var target = legacyPathMap[segment];

    if (!target && segment && segment.indexOf(".") === -1) {
      var extensionCandidate = segment + ".html";
      if (knownPages[extensionCandidate]) {
        target = extensionCandidate;
      }
    }

    if (!target || target === pageKey) {
      return;
    }

    var base = cleanPath.slice(0, cleanPath.length - segment.length);
    window.location.replace(base + target + window.location.search + window.location.hash);
  }

  maybeRedirectLegacyPath();

  var footer = document.querySelector("[data-shared-footer]");
  if (footer) {
    var footerNav = primaryLinks.map(function (link) {
      var current = link.href === pageKey ? ' aria-current="page"' : "";
      return '<li><a href="' + link.href + '"' + current + ">" + link.label + "</a></li>";
    }).join("");

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<p class="footer-brand">Heirs’ Property Guide</p>' +
        '<p>This is an educational resource, not legal advice.</p>' +
        '<p>Center for Heirs’ Property: <a href="tel:+18437457055">(843) 745-7055</a> / <a href="tel:+18666572676">(866) 657-2676</a></p>' +
        '<p>South Carolina Legal Services: <a href="tel:+18883465592">(888) 346-5592</a></p>' +
        '<nav aria-label="Footer links"><ul class="footer-links">' + footerNav + "</ul></nav>" +
        '<p><a href="#">↑ Back to top</a></p>' +
        '<p class="footer-meta">© 2026 Heirs’ Property Guide. Educational use only.</p>' +
      "</div>";
  }

  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  var mobileQuery = window.matchMedia("(max-width: 767px)");
  var sectionToPrint = null;
  var navLinks = [];

  if (primaryNav) {
    var navList = primaryNav.querySelector("ul");
    if (navList) {
      navList.innerHTML = primaryLinks.map(function (link) {
        var current = link.href === pageKey ? ' aria-current="page"' : "";
        return '<li><a href="' + link.href + '"' + current + ">" + link.label + "</a></li>";
      }).join("");
    }
    navLinks = Array.prototype.slice.call(primaryNav.querySelectorAll("a"));
  }

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === pageKey) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  function openNav() {
    primaryNav.classList.add("nav-open");
    navToggle.setAttribute("aria-expanded", "true");
    var firstLink = primaryNav.querySelector("a");
    if (firstLink) {
      firstLink.focus();
    }
  }

  function closeNav() {
    primaryNav.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function syncNavigationMode() {
    if (!navToggle || !primaryNav) {
      return;
    }

    if (mobileQuery.matches) {
      closeNav();
      return;
    }

    primaryNav.classList.remove("nav-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  if (navToggle && primaryNav) {
    syncNavigationMode();

    navToggle.addEventListener("click", function () {
      var isOpen = primaryNav.classList.contains("nav-open");
      if (isOpen) {
        closeNav();
        navToggle.focus();
      } else {
        openNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var shouldReturnFocus = mobileQuery.matches && primaryNav.classList.contains("nav-open") && primaryNav.contains(document.activeElement);
        closeNav();
        if (shouldReturnFocus) {
          navToggle.focus();
        }
      }
    });

    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) {
          closeNav();
        }
      });
    });

    document.addEventListener("click", function (event) {
      if (!mobileQuery.matches || !primaryNav.classList.contains("nav-open")) {
        return;
      }
      if (primaryNav.contains(event.target) || navToggle.contains(event.target)) {
        return;
      }
      closeNav();
    });

    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncNavigationMode);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncNavigationMode);
    }
  }

  var previousPageMap = {
    "start-here.html": { href: "index.html", label: "Home" },
    "what-is-heirs-property.html": { href: "start-here.html", label: "Start here" },
    "how-families-lose-land.html": { href: "what-is-heirs-property.html", label: "Learn the basics" },
    "south-carolina-legal-protections.html": { href: "how-families-lose-land.html", label: "How families lose land" },
    "protecting-preserving-family-land.html": { href: "south-carolina-legal-protections.html", label: "South Carolina legal protections" },
    "economic-opportunities.html": { href: "protecting-preserving-family-land.html", label: "Protecting family land" },
    "history-culture-legacy.html": { href: "economic-opportunities.html", label: "Economic opportunities" },
    "what-to-do-first.html": { href: "what-is-heirs-property.html", label: "Learn the basics" },
    "resources-get-help.html": { href: "what-to-do-first.html", label: "What to do first" },
    "printable-guide.html": { href: "resources-get-help.html", label: "Get help" },
    "notes.html": { href: "printable-guide.html", label: "Printable guide" },
    "accessibility.html": { href: "about-this-guide.html", label: "About this guide" },
    "about-this-guide.html": { href: "index.html", label: "Home" },
    "404.html": { href: "index.html", label: "Home" }
  };

  var breadcrumbNode = document.querySelector(".breadcrumbs");
  if (breadcrumbNode && !document.querySelector(".breadcrumb-tools") && previousPageMap[pageKey]) {
    var toolWrap = document.createElement("div");
    toolWrap.className = "breadcrumb-tools no-print";
    toolWrap.innerHTML =
      '<a class="utility-link" href="' + previousPageMap[pageKey].href + '">← ' + previousPageMap[pageKey].label + "</a>" +
      '<button class="utility-link utility-button" type="button" data-print>🖨 Print this page</button>';
    breadcrumbNode.insertAdjacentElement("afterend", toolWrap);
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

  var nextStepMap = {
    "start-here.html": [
      { href: "what-to-do-first.html", label: "Build your staged action timeline" },
      { href: "resources-get-help.html", label: "Prepare for legal/community support calls" }
    ],
    "what-is-heirs-property.html": [
      { href: "how-families-lose-land.html", label: "Review common land-loss pathways" },
      { href: "south-carolina-legal-protections.html", label: "See South Carolina protections" }
    ],
    "how-families-lose-land.html": [
      { href: "what-to-do-first.html", label: "Use immediate action steps" },
      { href: "notes.html", label: "Track your warning signs privately" }
    ],
    "south-carolina-legal-protections.html": [
      { href: "what-to-do-first.html", label: "Apply protections in your next actions" },
      { href: "resources-get-help.html", label: "Contact support with focused questions" }
    ],
    "what-to-do-first.html": [
      { href: "notes.html", label: "Document facts, deadlines, and questions" },
      { href: "resources-get-help.html", label: "Get legal and community help" }
    ],
    "economic-opportunities.html": [
      { href: "protecting-preserving-family-land.html", label: "Return to preservation strategy choices" },
      { href: "history-culture-legacy.html", label: "Ground decisions in family legacy" }
    ],
    "history-culture-legacy.html": [
      { href: "protecting-preserving-family-land.html", label: "Move from history to stewardship planning" },
      { href: "notes.html", label: "Capture family goals and concerns" }
    ],
    "resources-get-help.html": [
      { href: "notes.html", label: "Prepare your call notes and questions" },
      { href: "printable-guide.html", label: "Bring a print companion to appointments" }
    ],
    "printable-guide.html": [
      { href: "notes.html", label: "Continue tracking updates in Notes" },
      { href: "resources-get-help.html", label: "Use support contacts for next actions" }
    ]
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

  if (nextStepMap[pageKey] && !document.querySelector(".next-step-panel")) {
    var pageMain = document.querySelector(".page-main");
    if (pageMain) {
      var nextLinks = nextStepMap[pageKey].map(function (link) {
        return '<a class="card" href="' + link.href + '"><strong>Next step:</strong><br>' + link.label + "</a>";
      }).join("");
      var nextPanel = document.createElement("nav");
      nextPanel.className = "section next-step-panel";
      nextPanel.setAttribute("aria-label", "Next steps");
      nextPanel.innerHTML =
        '<div class="section-header"><h2>Where to go next</h2><p>Continue with the most relevant pathway.</p></div>' +
        '<div class="card-grid">' + nextLinks + "</div>";
      pageMain.appendChild(nextPanel);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
    button.addEventListener("click", function () {
      window.print();
    });
  });

  function clearSectionPrintMode() {
    document.body.classList.remove("print-section-mode");
    Array.prototype.forEach.call(document.querySelectorAll(".print-target"), function (target) {
      target.classList.remove("print-target");
    });
    sectionToPrint = null;
  }

  window.addEventListener("afterprint", clearSectionPrintMode);

  Array.prototype.forEach.call(document.querySelectorAll("[data-print-section]"), function (button) {
    button.addEventListener("click", function () {
      var section = button.closest("section");
      if (section && section.scrollIntoView) {
        section.scrollIntoView({ behavior: "smooth", block: "start" });
      }
      sectionToPrint = section;
      if (sectionToPrint) {
        document.body.classList.add("print-section-mode");
        sectionToPrint.classList.add("print-target");
      }
      window.setTimeout(function () {
        window.print();
        if (!window.matchMedia("print").matches) {
          clearSectionPrintMode();
        }
      }, 150);
    });
  });

  var initializedChecklists = {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-checklist]"), function (list) {
    if (!window.HeirsPropertyStorage) {
      return;
    }

    var key = list.getAttribute("data-checklist");
    if (initializedChecklists[key]) {
      return;
    }
    initializedChecklists[key] = true;

    var storage = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
    var savedState = storage[key] || {};
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-checklist="' + key + '"] input[type="checkbox"]'));
    var status = document.querySelector('[data-checklist-status="' + key + '"]');
    if (status && !window.HeirsPropertyStorage.canUseLocalStorage()) {
      status.textContent = "Checklist progress cannot be saved in this browser right now.";
    }

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
