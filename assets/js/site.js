(function () {
  document.documentElement.classList.add("js");

  var pageKey = window.location.pathname.split("/").pop() || "index.html";
  var isHome = pageKey === "index.html";
  var ordinaryGuidePages = {
    "start-here.html": true,
    "what-is-heirs-property.html": true,
    "how-families-lose-land.html": true,
    "south-carolina-legal-protections.html": true,
    "what-to-do-first.html": true,
    "protecting-preserving-family-land.html": true,
    "economic-opportunities.html": true,
    "history-culture-legacy.html": true,
    "resources-get-help.html": true
  };

  if (!document.body.id) {
    document.body.id = "top";
  }

  function removeElements(selector) {
    Array.prototype.forEach.call(document.querySelectorAll(selector), function (node) {
      if (node && node.parentNode) {
        node.parentNode.removeChild(node);
      }
    });
  }

  function normalizePrintAndUtilityLinks() {
    Array.prototype.forEach.call(document.querySelectorAll("#primary-nav a[href='printable-guide.html']"), function (link) {
      var item = link.closest("li");
      if (item && item.parentNode) {
        item.parentNode.removeChild(item);
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll(".on-page-tools a[href='printable-guide.html']"), function (link) {
      link.textContent = "Printable handout";
      if (ordinaryGuidePages[pageKey] || pageKey === "notes.html") {
        link.remove();
      }
    });

    if (ordinaryGuidePages[pageKey] || pageKey === "notes.html") {
      removeElements(".page-utilities .print-link");
    }

    Array.prototype.forEach.call(document.querySelectorAll(".progress-steps li"), function (item) {
      if (/Printable guide/i.test(item.textContent)) {
        if (ordinaryGuidePages[pageKey] || pageKey === "notes.html") {
          item.remove();
        } else {
          item.textContent = "Printable handout";
        }
      }
    });

    Array.prototype.forEach.call(document.querySelectorAll("a[href='printable-guide.html']"), function (link) {
      if (/Printable guide|printed guide|print companion/i.test(link.textContent)) {
        link.textContent = "Printable handout";
      }
    });
  }

  var footer = document.querySelector("[data-shared-footer]");
  if (footer) {
    if (!isHome) {
      footer.classList.add("footer-compact");
    }
    var footerGroups = [
      {
        title: "Start",
        links: [
          { href: "index.html", label: "Home" },
          { href: "start-here.html", label: "Start here" },
          { href: "what-to-do-first.html", label: "What to do first" }
        ]
      },
      {
        title: "Learn",
        links: [
          { href: "what-is-heirs-property.html", label: "What is heirs’ property?" },
          { href: "how-families-lose-land.html", label: "How families can lose land" },
          { href: "south-carolina-legal-protections.html", label: "South Carolina legal protections" },
          { href: "protecting-preserving-family-land.html", label: "Protecting family land" },
          { href: "economic-opportunities.html", label: "Economic opportunities" },
          { href: "history-culture-legacy.html", label: "History, culture, and legacy" }
        ]
      },
      {
        title: "Tools & handouts",
        links: [
          { href: "resources-get-help.html", label: "Get help" },
          { href: "notes.html", label: "Notes" },
          { href: "printable-guide.html", label: "Printable handout" }
        ]
      },
      {
        title: "About & access",
        links: [
          { href: "accessibility.html", label: "Accessibility" },
          { href: "about-this-guide.html", label: "About this guide" }
        ]
      }
    ];

    var footerNav = footerGroups.map(function (group) {
      var links = group.links.map(function (link) {
        var current = link.href === pageKey ? ' aria-current="page"' : "";
        return '<li><a href="' + link.href + '"' + current + ">" + link.label + "</a></li>";
      }).join("");
      return "<section><h2>" + group.title + "</h2><ul>" + links + "</ul></section>";
    }).join("");

    footer.innerHTML =
      '<div class="footer-inner">' +
        '<section class="footer-emergency">' +
          "<h2>Need help now?</h2>" +
          '<p>For heirs’ property assistance in South Carolina, contact the Center for Heirs’ Property at <a href="tel:+18437457055">(843) 745-7055</a> or toll-free at <a href="tel:+18666572676">(866) 657-2676</a>. For civil legal-aid intake, contact South Carolina Legal Services at <a href="tel:+18883465592">(888) 346-5592</a>.</p>' +
          '<p class="small">This guide is educational information, not legal advice. Laws, court procedures, agency rules, and program eligibility can change. Confirm details with an attorney, legal aid office, or official agency before acting.</p>' +
          '<p class="small"><a href="#top">↑ Back to top</a> · © 2026 Heirs’ Property Guide. Educational use only.</p>' +
        "</section>" +
        '<nav class="footer-nav" aria-label="Footer sections">' + footerNav + "</nav>" +
      "</div>";
  }

  var navToggle = document.querySelector("[data-nav-toggle]");
  var primaryNav = document.querySelector("[data-primary-nav]");
  var headerActions = document.querySelector(".header-actions");
  var mobileQuery = window.matchMedia("(max-width: 899px)");
  var navLinks = primaryNav ? Array.prototype.slice.call(primaryNav.querySelectorAll("a")) : [];

  normalizePrintAndUtilityLinks();

  navLinks = primaryNav ? Array.prototype.slice.call(primaryNav.querySelectorAll("a")) : [];
  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === pageKey) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  function openNav() {
    if (!primaryNav || !navToggle) { return; }
    primaryNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    var firstLink = primaryNav.querySelector("a");
    if (firstLink) { firstLink.focus(); }
  }

  function closeNav() {
    if (!primaryNav || !navToggle) { return; }
    primaryNav.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  }

  function syncNavigationMode() {
    if (!navToggle || !primaryNav) { return; }
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
        navToggle.focus();
      } else {
        openNav();
      }
    });
    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var shouldReturnFocus = mobileQuery.matches && primaryNav.classList.contains("is-open") && primaryNav.contains(document.activeElement);
        closeNav();
        if (shouldReturnFocus) { navToggle.focus(); }
      }
    });
    navLinks.forEach(function (link) {
      link.addEventListener("click", function () {
        if (mobileQuery.matches) { closeNav(); }
      });
    });
    document.addEventListener("click", function (event) {
      if (!mobileQuery.matches || !primaryNav.classList.contains("is-open")) { return; }
      if (primaryNav.contains(event.target) || navToggle.contains(event.target)) { return; }
      closeNav();
    });
    if (typeof mobileQuery.addEventListener === "function") {
      mobileQuery.addEventListener("change", syncNavigationMode);
    } else if (typeof mobileQuery.addListener === "function") {
      mobileQuery.addListener(syncNavigationMode);
    }
  }

  function relocateMastheadTools() {
    if (isHome) { return; }
    var mastheadTools = document.querySelector(".page-head:not(.home-hero) .on-page-tools");
    var utilityRow = document.querySelector(".page-utilities");
    if (!mastheadTools || !utilityRow) { return; }
    var links = Array.prototype.slice.call(mastheadTools.querySelectorAll("a[href]"));
    links = links.filter(function (link) { return link.getAttribute("href") !== "printable-guide.html"; });
    if (!links.length) {
      mastheadTools.setAttribute("hidden", "");
      return;
    }
    var quickTools = document.createElement("div");
    quickTools.className = "utility-row page-quick-tools no-print";
    links.forEach(function (link) { quickTools.appendChild(link.cloneNode(true)); });
    utilityRow.appendChild(quickTools);
    mastheadTools.setAttribute("hidden", "");
  }

  relocateMastheadTools();

  var searchIndex = [
    {
      href: "index.html",
      title: "Understand heirs’ property before you sign, sell, or make land decisions.",
      description: "Plain-language, South Carolina-focused guidance for families dealing with heirs’ property, family land, records, and first steps.",
      headings: ["Before you sign", "Choose what you need", "Start here", "What to do first", "Learn the basics", "Get help", "What heirs’ property means", "Records to gather before you call", "Tools & handouts", "Private notes", "Printable handout", "Need support now?"],
      text: "South Carolina heirs’ property guide. Before you sign, pause and gather records. Start here, what to do first, learn the basics, and get help. Records to gather before you call include deed, probate, title, tax notice, parcel number, family and ownership information, deadlines, and questions. Tools and handouts include private notes, printable handout, and South Carolina support contacts. Center for Heirs’ Property and South Carolina Legal Services. Educational information only, not legal advice."
    },
    {
      href: "start-here.html",
      title: "Start here when the situation feels urgent or confusing.",
      description: "First steps before signing, selling, borrowing, or agreeing to family land terms.",
      headings: ["Before anything else", "If you only do three things today", "Questions to answer first", "When to move faster", "Good first records to collect"],
      text: "Start here if someone wants you to sign something, sell, transfer, borrow, or agree to property terms. Gather deed, tax notice, probate papers, wills, estate papers, parcel number, deadlines, and contact information before signing."
    },
    {
      href: "what-is-heirs-property.html",
      title: "What is heirs’ property?",
      description: "Plain-language definition, common misunderstandings, and key terms.",
      headings: ["Plain-language definition", "What people often misunderstand", "Short scenario", "Key terms", "What this means in practice"],
      text: "Heirs’ property, title, deed, probate, undivided interest, family land, shared ownership, unclear title, taxes, repairs, insurance, sales, leases, and family decision-making."
    },
    {
      href: "what-to-do-first.html",
      title: "What to do first",
      description: "A first-action checklist for today, this week, and this month.",
      headings: ["Today", "This week", "This month", "Checklist saving"],
      text: "Checklist for deeds, tax notices, probate papers, possible heirs, current occupants, deadlines, legal aid, county tax records, family contact list, notes, and questions. Checklist progress saves only in this browser on this device."
    },
    {
      href: "how-families-lose-land.html",
      title: "How families can lose land",
      description: "Common warning signs and practical ways to lower risk.",
      headings: ["Major risk pathways", "Short practical scenarios", "How to lower risk"],
      text: "Tax delinquency, pressure to sell quickly, family conflict, title confusion after death, warning signs, parcel numbers, notices, signatures, legal review, records, notes, and action planning."
    },
    {
      href: "resources-get-help.html",
      title: "Get help",
      description: "South Carolina support contacts and what to have ready before calling.",
      headings: ["Before you call", "Organizations and help types", "Helpful first questions"],
      text: "Get help in South Carolina. Center for Heirs’ Property, South Carolina Legal Services, legal aid, county records, tax offices, property address, parcel number, last known deed holder, deadlines, court dates, tax notices, buyer communications, and questions."
    },
    {
      href: "notes.html",
      title: "Private notes",
      description: "Save facts, questions, people, documents, and dates in this browser on this device.",
      headings: ["How this notes page works", "Case overview", "People involved", "Property details", "Important dates and deadlines", "Documents found", "Questions for lawyer or legal aid"],
      text: "Private notes save only in this browser on this device. Notes are not sent to a server. Save notes, download as text, download as JSON, print notes, and clear notes."
    },
    {
      href: "printable-guide.html",
      title: "Printable handout",
      description: "Temporary public print handout for family meetings, calls, and appointments.",
      headings: ["Printable handout", "What heirs’ property means", "Common risks and land-loss pathways", "First-action checklist", "Documents and records checklist"],
      text: "Printable handout for heirs’ property, shared family land, title after a death, first records, deed, tax bill, probate, estate papers, family meeting questions, South Carolina caution, and notes space."
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"]/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[char];
    });
  }

  function findSearchMatches(term) {
    var normalized = term.trim().toLowerCase();
    if (!normalized) { return []; }
    return searchIndex.map(function (item) {
      var haystack = [item.title, item.description, item.text].concat(item.headings || []).join(" ").toLowerCase();
      if (haystack.indexOf(normalized) === -1) { return null; }
      var snippet = item.description || item.title;
      return { item: item, snippet: snippet };
    }).filter(Boolean).slice(0, 8);
  }

  if (headerActions) {
    var searchForm = document.createElement("form");
    searchForm.className = "site-search no-print";
    searchForm.setAttribute("role", "search");
    searchForm.setAttribute("aria-label", "Site search");
    searchForm.innerHTML = '<label class="sr-only" for="site-search-input">Search this guide</label><div class="site-search-control"><input id="site-search-input" data-site-search type="search" autocomplete="off" placeholder="Search topics like deed, probate, tax…" aria-label="Search this guide" aria-controls="site-search-results" aria-expanded="false"><div id="site-search-panel" class="site-search-panel" data-search-panel hidden><div id="site-search-status" class="sr-only" role="status" aria-live="polite"></div><div id="site-search-results" class="site-search-results" data-search-results></div></div></div>';
    headerActions.insertBefore(searchForm, headerActions.firstChild);

    var searchField = searchForm.querySelector("[data-site-search]");
    var searchPanel = searchForm.querySelector("[data-search-panel]");
    var searchResults = searchForm.querySelector("[data-search-results]");
    var searchStatus = searchForm.querySelector("#site-search-status");

    function closeSearchPanel() {
      if (!searchPanel || !searchField) { return; }
      searchPanel.hidden = true;
      searchField.setAttribute("aria-expanded", "false");
    }

    function openSearchPanel() {
      if (!searchPanel || !searchField) { return; }
      searchPanel.hidden = false;
      searchField.setAttribute("aria-expanded", "true");
    }

    function renderSearchResults(value) {
      var term = value.trim();
      if (!term) {
        if (searchResults) { searchResults.innerHTML = ""; }
        if (searchStatus) { searchStatus.textContent = ""; }
        closeSearchPanel();
        return;
      }
      var matches = findSearchMatches(term);
      openSearchPanel();
      if (!matches.length) {
        searchResults.innerHTML = '<p class="search-empty">No results found. Try broader terms like “tax”, “deed”, or “family land”.</p>';
        searchStatus.textContent = "No search results found.";
        return;
      }
      searchStatus.textContent = matches.length + " search result" + (matches.length === 1 ? "" : "s") + " found.";
      searchResults.innerHTML = '<ul class="search-result-list">' + matches.map(function (match) {
        return '<li class="search-result-item"><a class="search-result-link" href="' + escapeHtml(match.item.href) + '"><span class="search-result-title">' + escapeHtml(match.item.title) + '</span><span class="search-result-snippet">' + escapeHtml(match.snippet) + '</span><span class="search-result-url">' + escapeHtml(match.item.href) + '</span></a></li>';
      }).join("") + "</ul>";
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstResult = searchResults ? searchResults.querySelector("a[href]") : null;
      if (firstResult) { window.location.href = firstResult.getAttribute("href"); }
    });
    searchField.addEventListener("input", function (event) { renderSearchResults(event.target.value); });
    searchField.addEventListener("focus", function (event) { if (event.target.value.trim()) { renderSearchResults(event.target.value); } });
    searchField.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        searchField.value = "";
        renderSearchResults("");
      }
    });
    document.addEventListener("click", function (event) {
      if (!searchForm.contains(event.target)) { closeSearchPanel(); }
    });
  }

  var nextStepMap = {
    "start-here.html": [
      { href: "what-to-do-first.html", label: "See what to do first" },
      { href: "resources-get-help.html", label: "Get help in South Carolina" }
    ],
    "what-is-heirs-property.html": [
      { href: "how-families-lose-land.html", label: "Learn how families can lose land" },
      { href: "what-to-do-first.html", label: "See what to do first" }
    ],
    "how-families-lose-land.html": [
      { href: "what-to-do-first.html", label: "Use the first-action checklist" },
      { href: "notes.html", label: "Write down warning signs in notes" }
    ],
    "what-to-do-first.html": [
      { href: "notes.html", label: "Organize facts and questions in notes" },
      { href: "resources-get-help.html", label: "Get help" }
    ],
    "resources-get-help.html": [
      { href: "notes.html", label: "Prepare your call notes" },
      { href: "printable-guide.html", label: "Open the printable handout" }
    ],
    "printable-guide.html": [
      { href: "notes.html", label: "Continue tracking updates in notes" },
      { href: "resources-get-help.html", label: "Use support contacts for next steps" }
    ]
  };

  if (nextStepMap[pageKey] && !document.querySelector(".next-step-panel")) {
    var pageMain = document.querySelector(".page-main");
    if (pageMain) {
      var nextLinks = nextStepMap[pageKey].map(function (link) {
        return '<a class="card" href="' + link.href + '"><strong>Next step:</strong><br>' + link.label + "</a>";
      }).join("");
      var nextPanel = document.createElement("nav");
      nextPanel.className = "section next-step-panel";
      nextPanel.setAttribute("aria-label", "Next steps");
      nextPanel.innerHTML = '<div class="section-header"><h2>Where to go next</h2><p>Choose the next page that fits your situation.</p></div><div class="card-grid">' + nextLinks + "</div>";
      pageMain.appendChild(nextPanel);
    }
  }

  Array.prototype.forEach.call(document.querySelectorAll("[data-print]"), function (button) {
    button.addEventListener("click", function () { window.print(); });
  });

  function setupResponsiveTables() {
    Array.prototype.forEach.call(document.querySelectorAll(".table-wrap table"), function (table) {
      var headerCells = Array.prototype.slice.call(table.querySelectorAll("thead th"));
      if (!headerCells.length) { return; }
      Array.prototype.forEach.call(table.querySelectorAll("tbody tr"), function (row) {
        var cells = Array.prototype.slice.call(row.children);
        cells.forEach(function (cell, index) {
          if (cell.tagName !== "TD") { return; }
          var header = headerCells[index];
          if (!header) { return; }
          cell.setAttribute("data-label", header.textContent.trim());
        });
      });
      table.setAttribute("data-responsive", "stack");
    });
  }

  setupResponsiveTables();

  var initializedChecklists = {};
  Array.prototype.forEach.call(document.querySelectorAll("[data-checklist]"), function (list) {
    if (!window.HeirsPropertyStorage) { return; }
    var key = list.getAttribute("data-checklist");
    if (initializedChecklists[key]) { return; }
    initializedChecklists[key] = true;
    var storage = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
    var savedState = storage[key] || {};
    var boxes = Array.prototype.slice.call(document.querySelectorAll('[data-checklist="' + key + '"] input[type="checkbox"]'));
    var status = document.querySelector('[data-checklist-status="' + key + '"]');
    if (status && !window.HeirsPropertyStorage.canUseLocalStorage()) {
      status.textContent = "Checklist progress cannot be saved in this browser right now.";
    }
    boxes.forEach(function (box) {
      var id = box.getAttribute("data-item-id") || box.id;
      box.checked = !!savedState[id];
      box.addEventListener("change", function () {
        var allStorage = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
        allStorage[key] = allStorage[key] || {};
        allStorage[key][id] = box.checked;
        var ok = window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.checklists, allStorage);
        if (status) {
          status.textContent = ok ? "Checklist progress is saved only in this browser on this device." : "Checklist progress could not be saved in this browser right now.";
        }
      });
    });
  });

  Array.prototype.forEach.call(document.querySelectorAll("[data-reset-checklist]"), function (button) {
    button.addEventListener("click", function () {
      if (!window.HeirsPropertyStorage) { return; }
      var key = button.getAttribute("data-reset-checklist");
      var allStorage = window.HeirsPropertyStorage.readJson(window.HeirsPropertyStorage.keys.checklists, {});
      delete allStorage[key];
      window.HeirsPropertyStorage.writeJson(window.HeirsPropertyStorage.keys.checklists, allStorage);
      Array.prototype.forEach.call(document.querySelectorAll('[data-checklist="' + key + '"] input[type="checkbox"]'), function (box) { box.checked = false; });
      var status = document.querySelector('[data-checklist-status="' + key + '"]');
      if (status) { status.textContent = "Checklist progress was reset in this browser on this device."; }
    });
  });
}());
