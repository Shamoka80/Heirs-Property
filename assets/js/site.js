(function () {
  document.documentElement.classList.add("js");

  var pageKey = window.location.pathname.split("/").pop() || "index.html";
  var isHome = pageKey === "index.html";
  var brochurePdf = "assets/downloads/heirs-property-trifold-brochure.pdf";
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

  function normalizeDownloadUtilityLinks() {
    Array.prototype.forEach.call(document.querySelectorAll(".on-page-tools a[href='" + brochurePdf + "']"), function (link) {
      if (ordinaryGuidePages[pageKey] || pageKey === "notes.html") {
        link.remove();
      }
    });

    if (ordinaryGuidePages[pageKey] || pageKey === "notes.html") {
      removeElements(".page-utilities .print-link");
    }
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
          { href: brochurePdf, label: "Download brochure", download: true }
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
        var download = link.download ? " download" : "";
        return '<li><a href="' + link.href + '"' + current + download + ">" + link.label + "</a></li>";
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

  normalizeDownloadUtilityLinks();

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
    links = links.filter(function (link) { return link.getAttribute("href") !== brochurePdf; });
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
      headings: ["Before you sign", "Choose what you need", "Start here", "What to do first", "Learn the basics", "Get help", "What heirs’ property means", "Records to gather before you call", "Tools & handouts", "Download printable brochure", "Need support now?"],
      keywords: ["home", "overview", "guide", "family land", "records", "contacts", "brochure", "support", "before signing"],
      text: "South Carolina heirs’ property guide. Before you sign, pause and gather records. Start here, what to do first, learn the basics, and get help. Tools and handouts include private notes, downloadable brochure, and South Carolina support contacts. Center for Heirs’ Property and South Carolina Legal Services. Educational information only, not legal advice."
    },
    {
      href: "start-here.html",
      title: "Start here when the situation feels urgent or confusing.",
      description: "First steps before signing, selling, borrowing, or agreeing to family land terms.",
      headings: ["Before anything else", "If you only do three things today", "Questions to answer first", "When to move faster", "Good first records to collect"],
      keywords: ["urgent", "emergency", "quick start", "first steps", "before signing", "sell", "borrow", "transfer", "agreement"],
      text: "Start here if someone wants you to sign something, sell, transfer, borrow, or agree to property terms. Gather deed, tax notice, probate papers, wills, estate papers, parcel number, deadlines, and contact information before signing."
    },
    {
      href: "what-is-heirs-property.html",
      title: "What is heirs’ property?",
      description: "Plain-language definition, common misunderstandings, and key terms.",
      headings: ["Plain-language definition", "What people often misunderstand", "Short scenario", "Key terms", "What this means in practice"],
      keywords: ["definition", "meaning", "shared ownership", "undivided interest", "title", "deed", "probate", "co-owner", "heir"],
      text: "Heirs’ property, title, deed, probate, undivided interest, family land, shared ownership, unclear title, taxes, repairs, insurance, sales, leases, and family decision-making."
    },
    {
      href: "how-families-lose-land.html",
      title: "How families can lose land",
      description: "Common warning signs and practical ways to lower risk.",
      headings: ["Major warning signs", "Short practical scenarios", "How to lower risk"],
      keywords: ["warning signs", "tax delinquency", "tax sale", "forced sale", "partition", "pressure", "conflict", "risk", "notices"],
      text: "Tax delinquency, pressure to sell quickly, family conflict, title confusion after death, warning signs, parcel numbers, notices, signatures, legal review, records, notes, and action planning."
    },
    {
      href: "south-carolina-legal-protections.html",
      title: "South Carolina legal protections",
      description: "Key South Carolina safeguards, court concepts, partition-sale protections, and legal-review points.",
      headings: ["Legal protections", "Partition actions", "Court notices", "Uniform Partition of Heirs Property Act", "Why legal review matters"],
      keywords: ["law", "legal", "attorney", "lawyer", "court", "partition", "UPHPA", "uniform partition", "notice", "rights", "protections"],
      text: "South Carolina heirs’ property legal protections can involve partition actions, court notices, family buyout rights, valuation, sale procedures, legal aid, attorney review, and official court deadlines."
    },
    {
      href: "what-to-do-first.html",
      title: "What to do first",
      description: "A first-action checklist for today, this week, and this month.",
      headings: ["Today", "This week", "This month", "Checklist saving"],
      keywords: ["checklist", "documents", "records", "deed", "tax notice", "probate", "deadline", "legal aid", "parcel", "heirs"],
      text: "Checklist for deeds, tax notices, probate papers, possible heirs, current occupants, deadlines, legal aid, county tax records, family contact list, notes, and questions."
    },
    {
      href: "protecting-preserving-family-land.html",
      title: "Protecting and preserving family land",
      description: "Practical steps for records, communication, agreements, stewardship, and long-term family land protection.",
      headings: ["Protecting family land", "Keep records organized", "Family communication", "Long-term preservation", "Stewardship options"],
      keywords: ["preserve", "protect", "stewardship", "agreement", "family meeting", "land management", "records", "ownership", "conservation"],
      text: "Protecting family land can involve organized records, written family agreements, communication, tax awareness, maintenance, stewardship planning, conservation options, and decisions before selling or signing."
    },
    {
      href: "economic-opportunities.html",
      title: "Economic opportunities",
      description: "Ways families may evaluate income, forestry, farming, housing, conservation, and land-use opportunities.",
      headings: ["Economic opportunities", "Forestry and farming", "Housing and leases", "Conservation", "Questions before committing"],
      keywords: ["money", "income", "forestry", "timber", "farm", "farming", "lease", "housing", "grant", "conservation", "business"],
      text: "Family land may support economic opportunities such as forestry, farming, leases, housing, conservation programs, grants, and business planning after ownership, title, tax, and legal questions are reviewed."
    },
    {
      href: "history-culture-legacy.html",
      title: "History, culture, and legacy",
      description: "Context for why family land matters and how legacy, culture, and ownership history affect decisions.",
      headings: ["History and legacy", "Cultural value", "Family stories", "Why land decisions matter"],
      keywords: ["history", "culture", "legacy", "heritage", "family story", "ancestors", "community", "land loss"],
      text: "Heirs’ property decisions often involve family history, cultural legacy, community ties, ancestral land, land loss, and preserving stories while making practical ownership decisions."
    },
    {
      href: "resources-get-help.html",
      title: "Get help",
      description: "South Carolina support contacts and what to have ready before calling.",
      headings: ["Before you call", "Organizations and help types", "Helpful first questions"],
      keywords: ["help", "contacts", "legal aid", "center for heirs property", "south carolina legal services", "phone", "call", "support", "attorney"],
      text: "Get help in South Carolina. Center for Heirs’ Property, South Carolina Legal Services, legal aid, county records, tax offices, property address, parcel number, last known deed holder, deadlines, court dates, tax notices, buyer communications, and questions."
    },
    {
      href: "notes.html",
      title: "Private notes",
      description: "Save facts, questions, people, documents, and dates in this browser on this device.",
      headings: ["How this notes page works", "Case overview", "People involved", "Property details", "Important dates and deadlines", "Documents found", "Questions for lawyer or legal aid"],
      keywords: ["notes", "save", "download", "export", "questions", "people", "documents", "deadlines", "browser", "private"],
      text: "Private notes save only in this browser on this device. Notes are not sent to a server. Save notes, download as text, download as JSON, print notes, and clear notes."
    },
    {
      href: "about-this-guide.html",
      title: "About this guide",
      description: "Purpose, educational scope, audience, and limits of the South Carolina heirs’ property guide.",
      headings: ["About this guide", "Educational use", "Not legal advice", "Who this guide is for"],
      keywords: ["about", "purpose", "scope", "educational", "not legal advice", "audience", "limitations"],
      text: "This guide explains educational information for South Carolina families dealing with heirs’ property. It is not legal advice and should be confirmed with an attorney, legal aid, or official agency before acting."
    },
    {
      href: "accessibility.html",
      title: "Accessibility",
      description: "Accessibility statement, usability support, keyboard access, and inclusive design commitments.",
      headings: ["Accessibility", "Keyboard access", "Readable design", "Support"],
      keywords: ["accessibility", "keyboard", "screen reader", "contrast", "inclusive", "usable", "support"],
      text: "Accessibility information for using this guide with keyboard navigation, assistive technology, readable design, contrast, and support needs."
    },
    {
      href: brochurePdf,
      title: "Download printable brochure",
      description: "Download the heirs’ property tri-fold brochure PDF for family meetings, calls, and appointments.",
      headings: ["Download brochure", "South Carolina heirs property", "Before you sign", "Warning signs", "Records to gather", "Questions to ask"],
      keywords: ["brochure", "pdf", "print", "download", "handout", "family meeting", "appointment"],
      text: "Download brochure PDF for heirs’ property, shared family land, title after a death, deed, tax bill, probate, estate papers, South Carolina caution, and resource contacts."
    }
  ];

  function escapeHtml(value) {
    return String(value).replace(/[&<>"']/g, function (char) {
      return ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[char];
    });
  }

  function normalizeSearchValue(value) {
    return String(value || "")
      .toLowerCase()
      .replace(/[’‘]/g, "'")
      .replace(/&/g, " and ")
      .replace(/[^a-z0-9'\s-]/g, " ")
      .replace(/[\s-]+/g, " ")
      .trim();
  }

  var searchStopWords = {
    a: true,
    an: true,
    and: true,
    are: true,
    can: true,
    do: true,
    for: true,
    get: true,
    how: true,
    if: true,
    in: true,
    is: true,
    my: true,
    of: true,
    on: true,
    or: true,
    the: true,
    this: true,
    to: true,
    what: true,
    when: true,
    with: true,
    you: true,
    your: true
  };

  function singularizeToken(token) {
    if (token.length > 4 && token.slice(-3) === "ies") { return token.slice(0, -3) + "y"; }
    if (token.length > 3 && token.slice(-1) === "s") { return token.slice(0, -1); }
    return token;
  }

  function getSearchTokens(value) {
    var normalized = normalizeSearchValue(value);
    if (!normalized) { return []; }
    var seen = {};
    return normalized.split(" ").map(singularizeToken).filter(function (token) {
      if (!token || token.length < 2 || searchStopWords[token] || seen[token]) { return false; }
      seen[token] = true;
      return true;
    });
  }

  function fieldText(item, field) {
    if (Array.isArray(item[field])) { return item[field].join(" "); }
    return item[field] || "";
  }

  function compactSnippet(value) {
    var text = String(value || "").replace(/\s+/g, " ").trim();
    if (text.length <= 150) { return text; }
    return text.slice(0, 147).replace(/\s+\S*$/, "") + "…";
  }

  function findSnippet(item, exactPhrase, tokens) {
    var sources = [item.description].concat(item.headings || [], item.keywords || [], item.text || "");
    for (var i = 0; i < sources.length; i += 1) {
      var source = sources[i];
      var normalized = normalizeSearchValue(source);
      if (exactPhrase && normalized.indexOf(exactPhrase) !== -1) { return compactSnippet(source); }
      for (var t = 0; t < tokens.length; t += 1) {
        if (normalized.indexOf(tokens[t]) !== -1) { return compactSnippet(source); }
      }
    }
    return item.description || item.title;
  }

  function scoreField(normalizedField, token, exactPhrase, weight) {
    var score = 0;
    if (exactPhrase && normalizedField.indexOf(exactPhrase) !== -1) { score += weight * 4; }
    if (normalizedField.indexOf(token) !== -1) { score += weight; }
    if (normalizedField.indexOf(token + " ") !== -1 || normalizedField.indexOf(" " + token) !== -1) { score += Math.ceil(weight / 2); }
    return score;
  }

  var searchableItems = searchIndex.map(function (item) {
    return {
      item: item,
      title: normalizeSearchValue(item.title),
      description: normalizeSearchValue(item.description),
      headings: normalizeSearchValue(fieldText(item, "headings")),
      keywords: normalizeSearchValue(fieldText(item, "keywords")),
      text: normalizeSearchValue(item.text)
    };
  });

  function findSearchMatches(term) {
    var exactPhrase = normalizeSearchValue(term);
    var tokens = getSearchTokens(term);
    if (!exactPhrase || !tokens.length) { return []; }

    return searchableItems.map(function (entry) {
      var score = 0;
      var matchedTokens = 0;
      tokens.forEach(function (token) {
        var tokenScore = 0;
        tokenScore += scoreField(entry.title, token, exactPhrase, 28);
        tokenScore += scoreField(entry.keywords, token, exactPhrase, 24);
        tokenScore += scoreField(entry.headings, token, exactPhrase, 18);
        tokenScore += scoreField(entry.description, token, exactPhrase, 16);
        tokenScore += scoreField(entry.text, token, exactPhrase, 8);
        if (tokenScore > 0) {
          matchedTokens += 1;
          score += tokenScore;
        }
      });

      var phraseFound = [entry.title, entry.description, entry.headings, entry.keywords, entry.text].join(" ").indexOf(exactPhrase) !== -1;
      if (phraseFound) { score += 75; }
      if (!phraseFound && tokens.length > 1 && matchedTokens < tokens.length) { return null; }
      if (!score) { return null; }
      if (entry.item.href === pageKey) { score -= 3; }
      return { item: entry.item, score: score, snippet: findSnippet(entry.item, exactPhrase, tokens) };
    }).filter(Boolean).sort(function (a, b) {
      if (b.score !== a.score) { return b.score - a.score; }
      return a.item.title.localeCompare(b.item.title);
    }).slice(0, 8);
  }

  function getSearchLinks(searchResults) {
    return searchResults ? Array.prototype.slice.call(searchResults.querySelectorAll("a[href]")) : [];
  }

  function focusSearchResult(searchResults, index) {
    var links = getSearchLinks(searchResults);
    if (!links.length) { return; }
    var nextIndex = Math.max(0, Math.min(index, links.length - 1));
    links[nextIndex].focus();
  }

  if (headerActions) {
    var searchForm = document.createElement("form");
    searchForm.className = "site-search no-print";
    searchForm.setAttribute("role", "search");
    searchForm.setAttribute("aria-label", "Site search");
    searchForm.innerHTML = '<label class="sr-only" for="site-search-input">Search this guide</label><div class="site-search-control"><input id="site-search-input" data-site-search type="search" autocomplete="off" placeholder="Search deed, probate, tax, partition…" aria-label="Search this guide" aria-controls="site-search-results" aria-expanded="false"><div id="site-search-panel" class="site-search-panel" data-search-panel hidden><div id="site-search-status" class="sr-only" role="status" aria-live="polite"></div><div id="site-search-results" class="site-search-results" data-search-results></div></div></div>';
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
        searchResults.innerHTML = '<p class="search-empty">No results found. Try broader terms like “tax”, “deed”, “partition”, “probate”, or “family land”.</p>';
        searchStatus.textContent = "No search results found.";
        return;
      }
      searchStatus.textContent = matches.length + " ranked search result" + (matches.length === 1 ? "" : "s") + " found.";
      searchResults.innerHTML = '<ul class="search-result-list">' + matches.map(function (match, index) {
        var download = match.item.href === brochurePdf ? ' download' : '';
        return '<li class="search-result-item"><a class="search-result-link" href="' + escapeHtml(match.item.href) + '"' + download + ' data-search-result-index="' + index + '"><span class="search-result-title">' + escapeHtml(match.item.title) + '</span><span class="search-result-snippet">' + escapeHtml(match.snippet) + '</span><span class="search-result-url">' + escapeHtml(match.item.href) + '</span></a></li>';
      }).join("") + "</ul>";
    }

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var active = searchResults && searchResults.contains(document.activeElement) ? document.activeElement : null;
      var firstResult = active && active.matches("a[href]") ? active : (searchResults ? searchResults.querySelector("a[href]") : null);
      if (firstResult) { window.location.href = firstResult.getAttribute("href"); }
    });
    searchField.addEventListener("input", function (event) { renderSearchResults(event.target.value); });
    searchField.addEventListener("focus", function (event) { if (event.target.value.trim()) { renderSearchResults(event.target.value); } });
    searchField.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        searchField.value = "";
        renderSearchResults("");
        return;
      }
      if (event.key === "ArrowDown") {
        event.preventDefault();
        if (searchField.value.trim()) { renderSearchResults(searchField.value); }
        focusSearchResult(searchResults, 0);
      }
    });
    if (searchResults) {
      searchResults.addEventListener("keydown", function (event) {
        var links = getSearchLinks(searchResults);
        var currentIndex = links.indexOf(document.activeElement);
        if (event.key === "ArrowDown") {
          event.preventDefault();
          focusSearchResult(searchResults, currentIndex + 1);
        } else if (event.key === "ArrowUp") {
          event.preventDefault();
          if (currentIndex <= 0) {
            searchField.focus();
          } else {
            focusSearchResult(searchResults, currentIndex - 1);
          }
        } else if (event.key === "Escape") {
          event.preventDefault();
          closeSearchPanel();
          searchField.focus();
        }
      });
    }
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
      { href: brochurePdf, label: "Download brochure", download: true }
    ]
  };

  if (nextStepMap[pageKey] && !document.querySelector(".next-step-panel")) {
    var pageMain = document.querySelector(".page-main");
    if (pageMain) {
      var nextLinks = nextStepMap[pageKey].map(function (link) {
        var download = link.download ? " download" : "";
        return '<a class="card" href="' + link.href + '"' + download + '><strong>Next step:</strong><br>' + link.label + "</a>";
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
