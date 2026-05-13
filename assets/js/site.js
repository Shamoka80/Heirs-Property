(function () {
  document.documentElement.classList.add("js");
  var pageKey = window.location.pathname.split("/").pop() || "index.html";
  var isHome = pageKey === "index.html";
  if (!document.body.id) {
    document.body.id = "top";
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
          { href: "how-families-lose-land.html", label: "How families lose land" },
          { href: "south-carolina-legal-protections.html", label: "South Carolina legal protections" },
          { href: "protecting-preserving-family-land.html", label: "Protecting family land" },
          { href: "economic-opportunities.html", label: "Economic opportunities" },
          { href: "history-culture-legacy.html", label: "History, culture, and legacy" }
        ]
      },
      {
        title: "Action tools",
        links: [
          { href: "resources-get-help.html", label: "Get help" },
          { href: "notes.html", label: "Notes" },
          { href: "printable-guide.html", label: "Printable guide" }
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
  var sectionToPrint = null;
  var navLinks = primaryNav ? Array.prototype.slice.call(primaryNav.querySelectorAll("a")) : [];

  navLinks.forEach(function (link) {
    var href = link.getAttribute("href");
    if (href === pageKey) {
      link.setAttribute("aria-current", "page");
    } else {
      link.removeAttribute("aria-current");
    }
  });

  function openNav() {
    primaryNav.classList.add("is-open");
    navToggle.setAttribute("aria-expanded", "true");
    var firstLink = primaryNav.querySelector("a");
    if (firstLink) {
      firstLink.focus();
    }
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
        navToggle.focus();
      } else {
        openNav();
      }
    });

    document.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        var shouldReturnFocus = mobileQuery.matches && primaryNav.classList.contains("is-open") && primaryNav.contains(document.activeElement);
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
      if (!mobileQuery.matches || !primaryNav.classList.contains("is-open")) {
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

  function setupParallax() {
    if (!window.requestAnimationFrame || !window.matchMedia) {
      return;
    }

    var reduceMotionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    var layerConfig = [
      { selector: ".page-head", className: "parallax-bg", speed: 0.1 },
      { selector: ".page-head-inner", className: "parallax-data", speed: 0.06 },
      { selector: ".page-main", className: "parallax-foreground", speed: 0.03 }
    ];
    var parallaxLayers = [];
    var frameRequested = false;
    var deactivateTimer = null;
    var maxOffset = 120;

    function clearParallaxTransforms() {
      parallaxLayers.forEach(function (layer) {
        layer.node.style.setProperty("--parallax-offset", "0px");
        layer.node.classList.remove("parallax-active");
      });
    }

    function setParallaxActiveState(isActive) {
      parallaxLayers.forEach(function (layer) {
        layer.node.classList.toggle("parallax-active", isActive);
      });
    }

    function renderFrame() {
      frameRequested = false;
      if (reduceMotionQuery.matches || !parallaxLayers.length) {
        return;
      }

      var scrollTop = window.pageYOffset || document.documentElement.scrollTop || 0;
      var viewportHeight = window.innerHeight || document.documentElement.clientHeight || 0;
      var safeRange = viewportHeight ? viewportHeight * 0.5 : maxOffset;
      var clampLimit = Math.max(maxOffset, safeRange);

      parallaxLayers.forEach(function (layer) {
        var offset = Math.max(-clampLimit, Math.min(clampLimit, scrollTop * layer.speed));
        layer.node.style.setProperty("--parallax-offset", (offset * -1).toFixed(2) + "px");
      });
    }

    function requestRender() {
      if (!frameRequested) {
        frameRequested = true;
        window.requestAnimationFrame(renderFrame);
      }
    }

    function handleScroll() {
      if (reduceMotionQuery.matches || !parallaxLayers.length) {
        return;
      }
      if (deactivateTimer) {
        window.clearTimeout(deactivateTimer);
      }
      setParallaxActiveState(true);
      deactivateTimer = window.setTimeout(function () {
        setParallaxActiveState(false);
      }, 180);
      requestRender();
    }

    layerConfig.forEach(function (config) {
      Array.prototype.forEach.call(document.querySelectorAll(config.selector), function (node) {
        node.classList.add("parallax-layer", config.className);
        node.setAttribute("data-parallax-speed", String(config.speed));
        parallaxLayers.push({
          node: node,
          speed: config.speed
        });
      });
    });

    if (!parallaxLayers.length) {
      return;
    }

    function syncReducedMotionMode() {
      if (reduceMotionQuery.matches) {
        if (deactivateTimer) {
          window.clearTimeout(deactivateTimer);
          deactivateTimer = null;
        }
        clearParallaxTransforms();
        return;
      }
      requestRender();
    }

    window.addEventListener("scroll", handleScroll, { passive: true });
    window.addEventListener("resize", requestRender);
    syncReducedMotionMode();

    if (typeof reduceMotionQuery.addEventListener === "function") {
      reduceMotionQuery.addEventListener("change", syncReducedMotionMode);
    } else if (typeof reduceMotionQuery.addListener === "function") {
      reduceMotionQuery.addListener(syncReducedMotionMode);
    }
  }

  function relocateMastheadTools() {
    var mastheadTools = document.querySelector(".page-head:not(.home-hero) .on-page-tools");
    var utilityRow = document.querySelector(".page-utilities");
    if (!mastheadTools || !utilityRow) {
      return;
    }

    var links = Array.prototype.slice.call(mastheadTools.querySelectorAll("a[href]"));
    if (!links.length) {
      return;
    }

    var quickTools = document.createElement("div");
    quickTools.className = "utility-row page-quick-tools no-print";
    links.forEach(function (link) {
      quickTools.appendChild(link.cloneNode(true));
    });
    utilityRow.appendChild(quickTools);
    mastheadTools.setAttribute("hidden", "");
  }

  relocateMastheadTools();
  setupParallax();

  var searchIndex = [
    {
        "href": "index.html",
        "title": "Understand heirs’ property, reduce risk, and choose your next step with confidence.",
        "description": "Plain-language, South Carolina-focused educational guidance for families dealing with heirs’ property, family land, and first steps.",
        "headings": [
            "Understand heirs’ property, reduce risk, and choose your next step with confidence.",
            "What do you need right now?",
            "I need to understand the basics",
            "Someone wants me to sign something",
            "I received a tax notice or urgent letter",
            "A relative died and title is unclear",
            "I need to organize family/property information",
            "I need legal or community help",
            "Learn the basics and plan your approach",
            "Start here first",
            "Core education",
            "Long-term stewardship"
        ],
        "text": "What do you need right now? Choose the path that matches your current situation. 📘 I need to understand the basics Get a plain-language definition and key terms first. Learn what heirs’ property means ⚠️ Someone wants me to sign something Start with urgent do/do-not guidance before signing. See urgent first protections 🗂️ I received a tax notice or urgent letter Use the first-action checklist organized by timeline. See first actions to take 🧾 A relative died and title is unclear Review common title confusion and risk pathways. Review warning signs 📝 I need to organize family/property information Use the private workspace to collect names, documents, and deadlines. Open notes workspace ☎️ I need legal or community help Prepare for calls and find South Carolina support contacts. Find legal and community help Learn the basics and plan your approach Use the existing guide pages in a practical order. Start here first Review urgent risk reduction and immediate protections before signing, selling, or agreeing to terms. Go to Start here Core education Understand heirs’ property, legal context, and common land-loss pathways in plain language. Go to Learn the basics Long-term stewardship Explore preservation, economic opportunities, and intergenerational family land goals. Go to preserving family land What to do first: a staged timeline Keep momentum without rushing high-stakes decisions. Today Stabilize and document Pause before signing anything. Gather the most recent deed and tax notice. Capture immediate concerns in notes. This week Organize facts and family context List possible heirs and current occupants. Clarify known deadlines and hearing dates. Prepare concise questions for legal support. This month Get support and plan next decisions Contact a lawyer, legal aid, or trusted community partner. Use the printable guide in meetings. Confirm county- and case-specific next actions. Tools to stay organized Use practical utilities while you read and prepare. 🔒 Notes (private to this device) Track facts, people, documents, and meeting questions. Notes are saved locally in your browser. Open Notes 🖨️ Printable guide Bring a print-friendly companion to family meetings, legal intake, and support calls. Open printable guide 🤝 Get help Find South Carolina support pathways and prepare to speak with legal or community organizations. Open help resources Trust and scope This is an educational resource, not legal advice. It is designed to help families prepare, organize information, and understand next steps before talking with a lawyer, legal aid office, or trusted community organization. Need support now? Contact information for South Carolina assistance. Center for Heirs’ Property Direct support for heirs’ property and family land planning in South Carolina. (843) 745-7055 • (866) 657-2676 South Carolina Legal Services Civil legal-aid intake for qualifying residents with property-related legal needs. (888) 346-5592"
    },
    {
        "href": "start-here.html",
        "title": "Start here when the situation feels urgent or confusing.",
        "description": "A first-step triage page for families who think they may be dealing with heirs’ property or pressure around family land.",
        "headings": [
            "Start here when the situation feels urgent or confusing.",
            "Before anything else",
            "If you only do three things today",
            "Questions to answer first",
            "Who was the last known owner on the deed?",
            "Has that person died?",
            "Are taxes current?",
            "Is anyone pressuring the family?",
            "When to move faster",
            "Good first records to collect",
            "Use with notes",
            "Related pages"
        ],
        "text": "Start here Learn the basics What to do first Get help Printable guide ← Previous: Home 🖨 Print this page Before anything else Do not sign a deed, settlement, loan, or sale document just because someone says time is running out. If someone is pressuring you to act immediately, write down their name, company, phone number, and what they are asking you to do. If you only do three things today Find the most recent deed, tax notice, and any probate, will, or estate papers connected to the property. Write down who may have inherited an interest in the land, even if you are not sure yet. Call a lawyer, legal aid office, or heirs’ property organization before signing anything or agreeing to sell. Open the action checklist Open notes Questions to answer first Who was the last known owner on the deed? If you do not know this yet, that becomes one of your first research tasks. Ownership on the deed and family memory are not always the same thing. Has that person died? If so, ask whether there was a will, probate file, estate administration, or any deed that changed ownership after the death. Are taxes current? Tax trouble can create immediate risk. Confirm the parcel number, mailing address on file, and any delinquency notice dates. Is anyone pressuring the family? Buyers, investors, distant relatives, or even well-meaning neighbors can create confusion when a family has not agreed on a plan. When to move faster You received a tax sale notice, court papers, or a hearing date. A relative says they already signed something affecting the property. There is a dispute over who can live on, lease, improve, or sell the property. A lender, buyer, or developer wants a quick answer. Practical tip: Even when a family has urgent issues, it usually helps to pause long enough to organize names, dates, parcel numbers, and documents in one place. The notes page is built for that purpose. Good first records to collect Deeds and any recorded plats or surveys Tax bills, parcel numbers, and delinquency notices Wills, probate filings, estate papers, and death certificates Old family agreements, handwritten notes, or correspondence about the land Utility bills, insurance papers, and repair receipts if someone lives on the property Use with notes Open the notes page to record who owns what, which documents you found, and what questions you need to ask when you call for help. Go to notes Related pages What is heirs’ property? What to do first Get help"
    },
    {
        "href": "what-is-heirs-property.html",
        "title": "What is heirs’ property?",
        "description": "An explanation of heirs’ property in plain language, including common misunderstandings, key terms, and a practical example.",
        "headings": [
            "What is heirs’ property?",
            "Plain-language definition",
            "What people often misunderstand",
            "“I live there, so I own it.”",
            "“My parent left it to me verbally.”",
            "“Only close relatives count.”",
            "“If we pay taxes, title is fixed.”",
            "Short scenario",
            "Key terms",
            "Title",
            "Deed",
            "Probate"
        ],
        "text": "Start here Learn the basics What to do first Get help Printable guide ← Previous: Start here 🖨 Print this page Plain-language definition Heirs’ property usually means family land that passed from one generation to the next without a clear plan that placed title in the current owners’ names. Instead of one person holding clear title alone, multiple relatives may now own undivided interests in the same property. That does not always mean the family has lost the land. It means ownership may be shared, unclear, or hard to manage. What people often misunderstand “I live there, so I own it.” Living on the land may matter, but occupancy alone does not settle title. “My parent left it to me verbally.” Family understanding and legal title are not the same thing. A verbal promise can still lead to legal uncertainty. “Only close relatives count.” Distant relatives may also hold shares if title passed through multiple generations without being settled clearly. “If we pay taxes, title is fixed.” Paying taxes helps, but it does not automatically cure title problems or settle inheritance disputes. Short scenario A grandmother owned land in her own name. She died years ago. No one completed a title plan that moved the property into the names of the current family members. Today, several children and grandchildren may each hold a share, even though only one branch of the family lives on the property. That kind of situation can affect repairs, financing, insurance, taxes, sales, leases, and family decision-making. Key terms Title The legal record of ownership. Deed The recorded document used to transfer ownership interests. Probate The court-supervised process that may address a person’s estate after death. Undivided interest A shared ownership interest in the whole property rather than one separated corner or lot. What this means in practice When many relatives hold interests in one parcel, even routine decisions can become difficult. A lender may hesitate. An insurance company may ask questions. Repairs may be delayed because the family cannot agree on who should sign or pay. Outside buyers may see uncertainty as an opportunity to pressure the family. Next, review the most common ways families lose land. Record in your notes The name of the last known deed holder Which relatives may have inherited an interest Which documents you have already found Open notes"
    },
    {
        "href": "how-families-lose-land.html",
        "title": "How families lose land",
        "description": "Common land-loss pathways, warning signs, and practical examples for families dealing with heirs’ property.",
        "headings": [
            "How families lose land",
            "Major risk pathways",
            "Tax delinquency",
            "Pressure to sell quickly",
            "Family conflict or silence",
            "Title confusion after death",
            "Short practical scenarios",
            "How to lower risk",
            "Need help now?",
            "Guide links"
        ],
        "text": "Major risk pathways Tax delinquency Mail may go to the wrong address, notices may be missed, or no one may know who is responsible. Small problems can become large problems over time. Warning signs: returned mail, conflicting tax records, unpaid balances, or uncertainty about parcel numbers. Pressure to sell quickly Families may receive phone calls, letters, or informal offers that sound urgent and friendly but are designed to create a rushed decision. Warning signs: demands for immediate signatures, verbal-only promises, or offers that discourage legal review. Family conflict or silence When relatives do not agree, do not communicate, or do not know who holds ownership interests, basic management becomes harder. Warning signs: unclear authority, disagreements about occupancy, or no shared plan for taxes and repairs. Title confusion after death Each generation can add more owners if the family does not address title. That can make later solutions more expensive and time-consuming. Warning signs: several deceased relatives appear in the ownership story and no one has a complete timeline. Short practical scenarios Scenario: A tax notice arrives for a person who died years ago The family assumes someone else is handling it. No one updates the mailing address or confirms the balance. The risk grows because the notice does not reach the right decision-makers. Scenario: One relative wants to sell, but others do not Without a clear understanding of ownership shares, the family may argue from memory instead of records. That can create openings for outside pressure and legal conflict. Scenario: A buyer offers “easy cash” for a signature A quick offer can look helpful when taxes are overdue or repairs are expensive. Families often need time to confirm value, authority, and long-term consequences before responding. How to lower risk Keep tax records current and verify who receives notices. Put names, dates, parcel numbers, and known heirs in writing. Use one notes page or printed packet so information is not scattered. Do not rely on memory alone when legal documents are available. Ask for legal guidance before any sale, loan, or recorded agreement. Next step: Move from risk awareness to action planning on What to do first ."
    },
    {
        "href": "south-carolina-legal-protections.html",
        "title": "South Carolina legal protections and cautions",
        "description": "South Carolina-specific educational information about heirs’ property issues, legal protections, and questions to ask a lawyer or legal aid office.",
        "headings": [
            "South Carolina legal protections and cautions",
            "Important framing",
            "Why state-specific guidance matters",
            "Topics a lawyer or legal aid office may help you sort out",
            "Who currently holds title?",
            "Was there a probate or estate administration?",
            "Is the family facing a partition issue?",
            "Are there tax sale or notice problems?",
            "Questions to ask a lawyer or legal aid office",
            "Use measured language with relatives",
            "Need help now?",
            "Guide links"
        ],
        "text": "Important framing South Carolina law and procedure may affect partition, probate, tax issues, notice, and family land disputes, but the details depend on the facts of the property and the people involved. Use this page to prepare questions, not to assume a guaranteed result. Why state-specific guidance matters Families often hear general advice online that does not match local court practice, county records, or South Carolina-specific laws. Before acting, confirm whether your issue involves probate, title correction, tax delinquency, partition, or another process entirely. Topics a lawyer or legal aid office may help you sort out Who currently holds title? The first legal question is often whether the deed history and estate history support the ownership story the family believes is true. Was there a probate or estate administration? If someone died owning the property, a lawyer may ask whether an estate was opened and what documents were filed. Is the family facing a partition issue? Shared ownership can raise questions about whether land can be divided, sold, or managed under court supervision. Are there tax sale or notice problems? County tax records, mailing addresses, payment history, and redemption deadlines can matter a great deal. Questions to ask a lawyer or legal aid office What documents should I gather before you can evaluate the title situation? Do we need deed records, probate records, tax records, death certificates, or all of the above? Does this look like a partition issue, a probate issue, a tax issue, or more than one problem at once? What deadlines or risks should the family treat as urgent? What should no one in the family sign until we understand the case better? Are there lower-cost first steps we can take before pursuing more involved legal work? Use measured language with relatives When one family member believes they “own the property outright” and another believes “nobody can sell,” conflict rises quickly. A calmer starting point is this: “We need to confirm the records, identify the heirs, and understand the legal options before anyone acts.” Go to resources and help"
    },
    {
        "href": "what-to-do-first.html",
        "title": "What to do first",
        "description": "A step-by-step action page organized by time horizon with local-only checklist saving in this browser on this device.",
        "headings": [
            "What to do first",
            "Checklist saving",
            "Today",
            "This week",
            "This month",
            "Helpful companion pages",
            "Need help now?",
            "Guide links"
        ],
        "text": "Start here Learn the basics What to do first Get help Printable guide ← Previous: Learn the basics 🖨 Print this page Checklist saving This page can remember your checklist progress only in this browser on this device . It does not create an account and does not send your information anywhere. Checklist progress is saved only in this browser on this device. Today Write down the property address, parcel number if known, and the name of the last known owner on the deed. Gather the latest tax notice, deed copy, and any probate or will papers you can find. List the relatives who may have an ownership interest, even if the list is incomplete. Pause any pressure to sign, sell, borrow, or “fix the title” until the family understands the records better. This week Call a lawyer, legal aid office, or heirs’ property support organization. Confirm whether county tax notices are current and being sent to the correct address. Start a family contact list with phone numbers, mailing addresses, and email addresses if available. Use the notes page to organize open questions and missing documents. This month Hold a family meeting focused on facts, goals, and next steps instead of assumptions or blame. Ask a professional what title, probate, tax, or partition issues need the most attention first. Create one shared paper or printed packet so key records are easier to locate when needed. Discuss whether the family wants preservation, occupancy, repair, income use, or sale, and why. Reset this checklist Open notes Helpful companion pages Notes Printable guide Get help"
    },
    {
        "href": "protecting-preserving-family-land.html",
        "title": "Protecting and preserving family land",
        "description": "Preservation strategies, best-fit framing, and an accessible comparison table for families thinking about long-term stewardship.",
        "headings": [
            "Protecting and preserving family land",
            "Use strategy, not only urgency",
            "Questions that keep decisions grounded",
            "Who uses the property today?",
            "What is the family trying to preserve?",
            "What pressure is strongest right now?",
            "Ownership timeline visual",
            "Need help now?",
            "Guide links"
        ],
        "text": "Use strategy, not only urgency Preservation work can include legal, financial, relational, and recordkeeping decisions. The best path depends on who owns the property, who uses it, what condition it is in, and what the family wants the land to do in the future. Comparison of preservation approaches Approach Best fit when… Benefits Challenges Title clarification The family first needs to confirm who owns what and how decisions can legally be made. Supports more confident planning, communication, and professional advice. Can take time and may require records from several generations. Family agreement and regular meetings Many relatives care about the land but need better coordination. Can reduce conflict and improve tax, repair, and occupancy decisions. Works best when the family commits to consistent communication. Repair and maintenance planning A home or structure on the property is deteriorating or becoming unsafe. May reduce future costs and preserve use of the land. Funding, labor, and decision authority can be difficult to organize. Professional valuation or planning review The family is hearing offers or considering a major decision. Helps the family compare options more carefully. Requires time and trusted professional input. Questions that keep decisions grounded Who uses the property today? Occupancy, farming, gathering, burial access, family gatherings, and heritage uses all matter. What is the family trying to preserve? For some families it is housing. For others it is access, history, income potential, or future generations’ options. What pressure is strongest right now? Taxes, repair costs, title confusion, and conflict each point to different first steps. Ownership timeline visual A timeline can help families align on ownership history before making preservation decisions."
    },
    {
        "href": "economic-opportunities.html",
        "title": "Economic opportunities connected to family land",
        "description": "Cautious, practical information about land-based opportunities, prerequisites, barriers, and reasons not to rush into deals.",
        "headings": [
            "Economic opportunities connected to family land",
            "Do not let opportunity language rush the family",
            "Possible paths families sometimes explore",
            "Housing stabilization",
            "Leasing or limited land use",
            "Program-based support",
            "Structured long-term planning",
            "Prerequisites and barriers",
            "Questions before considering any deal",
            "Need help now?",
            "Guide links"
        ],
        "text": "Do not let opportunity language rush the family Income possibilities can be real, but so can risk. A proposal that sounds promising still needs clear records, careful review, and a shared understanding of who can legally agree to what. Possible paths families sometimes explore Housing stabilization Keeping a family home safe and habitable may be the first practical “economic” step because it protects use and prevents avoidable loss. Leasing or limited land use Some families explore agricultural, timber, or other site-specific uses, but only after reviewing authority, value, and long-term effects. Program-based support Certain grants, technical assistance programs, or planning help may be available, though eligibility and timing can change. Structured long-term planning Sometimes the biggest gain comes from reducing confusion and improving decision-making before any outside deal is considered. Prerequisites and barriers Clearer records about ownership and parcel identity Agreement about who speaks for the family, if anyone Realistic understanding of taxes, repairs, debt, and maintenance costs Time to compare offers instead of reacting to one fast proposal Questions before considering any deal Who has legal authority to sign? What happens to occupancy, access, or family use if we agree? What is the short-term gain and the long-term cost? Has an attorney or trusted advisor reviewed the documents? Compare opportunities against preservation goals."
    },
    {
        "href": "history-culture-legacy.html",
        "title": "History, culture, and legacy",
        "description": "Context on why family land matters, how history shapes present-day vulnerability, and prompts families may want to record in notes.",
        "headings": [
            "History, culture, and legacy",
            "Why the history matters now",
            "Land as safety and identity",
            "Shared ownership can increase vulnerability",
            "Recording the story is part of preservation",
            "Prompts to record in notes",
            "What memories are tied to this place?",
            "What does the family want future generations to inherit?",
            "What conflict should be handled with care?",
            "Need help now?",
            "Guide links"
        ],
        "text": "Why the history matters now Heirs’ property is not only a paperwork problem. For many families, especially in places with a long history of displacement, discrimination, and uneven access to legal services, title confusion can reflect generations of interrupted planning, migration, poverty, or exclusion from formal systems. Past Land as safety and identity Family land may hold homesites, gathering places, burial access, farming history, or a visible record of what earlier generations protected. Present Shared ownership can increase vulnerability When ownership is spread across many relatives, even families with strong emotional ties to the land may struggle to coordinate legally and financially. Future Recording the story is part of preservation Names, places, family memories, and why the land matters can guide better decisions and help future generations understand what is at stake. Prompts to record in notes What memories are tied to this place? Gatherings, stories, farming, fishing, church, caregiving, and burial traditions may all matter. What does the family want future generations to inherit? A home, access, a sense of belonging, income potential, or simply the choice to decide later. What conflict should be handled with care? Old disputes can shape today’s decisions. Writing them down may help the family prepare for a better conversation. Open notes to record family history"
    },
    {
        "href": "resources-get-help.html",
        "title": "Find legal and community help",
        "description": "Organized contact information, preparation guidance, and practical steps for calling lawyers, legal aid, and support organizations.",
        "headings": [
            "Find legal and community help",
            "Before you call",
            "Organizations and help types",
            "Heirs’ property support",
            "Civil legal aid",
            "County records and tax offices",
            "Helpful first questions",
            "Need help now?",
            "Guide links"
        ],
        "text": "Start here Learn the basics What to do first Get help Printable guide ← Previous: What to do first 🖨 Print this page Before you call Write down the property address and parcel number if known. Note the name of the last known deed holder and whether that person is deceased. List any deadlines, court dates, tax notices, or buyer communications. Keep your questions short and factual so the first conversation stays productive. Bring your notes page or printed guide with you. Organized information makes it easier for a lawyer or advocate to understand your situation quickly. Organizations and help types Heirs’ property support Center for Heirs’ Property Phone: (843) 745-7055 Toll-free: (866) 657-2676 Use this contact when you need heirs’ property education, planning support, or direction on what to gather next. Civil legal aid South Carolina Legal Services Intake: (888) 346-5592 Use this contact when you need legal-aid screening for a civil matter and want to explain the title, probate, tax, or land issue briefly. County records and tax offices Use county offices to confirm tax records, parcel information, and where public records are maintained. Before calling, have names, dates, and the property location ready. Helpful first questions What documents should I gather before the next conversation? Is this likely a title issue, probate issue, tax issue, or more than one problem? Are there deadlines I should treat as urgent? What should I avoid signing until I understand the situation better?"
    },
    {
        "href": "notes.html",
        "title": "Notes for your family land situation",
        "description": "A local-only notes page for recording family land details, documents, questions, deadlines, and family discussion notes.",
        "headings": [
            "Notes for your family land situation",
            "How this notes page works",
            "Need help now?",
            "Guide links"
        ],
        "text": "← Previous: Printable guide 🖨 Print this page How this notes page works Your notes are saved only in this browser on this device using local storage. They are not sent to a server and they are not available on another phone, computer, or browser unless you export them yourself. Saved only in this browser on this device. Case overview Case overview Write a short summary of the main problem or reason you opened this guide. People involved People involved List relatives, possible heirs, advocates, lawyers, or anyone else connected to the issue. Property details Property details Record the address, parcel number, deed holder, county, occupancy details, or other identifying information. Important dates and deadlines Important dates and deadlines Include hearing dates, tax notice dates, probate dates, appointment dates, or family meeting dates. Documents found Documents found List deeds, tax bills, wills, death certificates, surveys, letters, or missing records you still need to locate. Questions for lawyer or legal aid Questions for lawyer or legal aid Keep this list short and direct so the first call stays focused. Family discussion notes Family discussion notes Record goals, disagreements, decisions, and the names of people who still need to be contacted. Additional notes Additional notes Use this final section for anything else that may matter later. Save notes here Download as text Download as JSON Print notes Clear notes"
    },
    {
        "href": "printable-guide.html",
        "title": "Printable guide",
        "description": "An expanded print-friendly companion document covering definitions, risks, first actions, meeting questions, records, resources, and note space.",
        "headings": [
            "Printable guide",
            "Introduction",
            "What heirs’ property means",
            "Common risks and land-loss pathways",
            "First-action checklist",
            "Family meeting questions",
            "Documents and records checklist",
            "South Carolina-specific caution and help framing",
            "Resource preparation checklist",
            "Glossary",
            "Title",
            "Deed"
        ],
        "text": "Start here Learn the basics What to do first Get help Printable guide ← Previous: Get help 🖨 Print this page Introduction This guide is an educational companion for families dealing with heirs’ property, shared family land, or uncertainty about title after a death. It is designed to be printed, marked up, and carried into meetings or phone calls. Version date: April 10, 2026 What heirs’ property means Heirs’ property usually refers to family land that passed across generations without a title plan that clearly placed ownership into the names of the current owners. That can leave multiple relatives with shared interests in the same property. Common risks and land-loss pathways Taxes become overdue because notices go to the wrong address or no one knows who is responsible. Relatives disagree about who can live on, improve, lease, or sell the land. A buyer or investor pushes for a quick signature before the family understands the records. Ownership becomes harder to sort out after several generations without probate or title work. First-action checklist Find the deed, tax bill, and any probate or estate papers. Write down the names of possible heirs and current occupants. Confirm whether taxes are current and whether notices go to the correct address. Do not sign sale, loan, or transfer documents without legal review. Call a lawyer, legal aid office, or heirs’ property organization. Family meeting questions What does the family want this land to provide now? What does the family want future generations to inherit? Who may hold an ownership interest? What records do we have, and what records are still missing? What decisions should wait until we speak with a lawyer or advocate? Documents and records checklist Recorded deeds Tax bills and parcel records Wills and probate filings Death certificates Surveys or plats Insurance records Repair receipts, utility bills, or occupancy records South Carolina-specific caution and help framing South Carolina law, county records, and court procedures can affect partition, probate, taxes, and title questions. Families should avoid assuming that a general internet answer applies to their specific parcel or county. Use organized records and ask state-specific questions. Resource preparation checklist Property address and county Parcel number if known Last known deed holder Names of deceased owners and approximate dates Current deadlines, hearings, notices, or offers Main questions for a lawyer or advocate Glossary Title The legal record of ownership. Deed The document used to transfer an ownership interest. Probate A court process that may address a person’s estate after death. Undivided interest A shared ownership interest in the whole property. Note space for printing"
    },
    {
        "href": "accessibility.html",
        "title": "Accessibility statement for this guide",
        "description": "A factual description of the site’s accessibility features, device-local storage behavior, and print support without overstating conformance.",
        "headings": [
            "Accessibility statement for this guide",
            "How the site is designed",
            "Notes and checklist convenience features",
            "Print support",
            "Scope of this statement",
            "Need help now?",
            "Guide links"
        ],
        "text": "How the site is designed This site uses semantic HTML, one main heading per page, keyboard-accessible navigation, visible focus states, readable contrast, reduced-motion support, and print-specific styles. Core reading and page navigation are available without JavaScript. Notes and checklist convenience features The notes page and checklist page use local storage so information can remain available when a person returns to the same browser on the same device. Those features are optional convenience tools. If local storage is unavailable, the main reading experience still works. Print support The printable guide and notes page include print-focused styling that removes navigation and interactive-only controls, preserves headings, and keeps major sections together more reliably on paper. Scope of this statement This page describes the features implemented in this site. It does not make a blanket claim that every possible accessibility need or every success criterion is satisfied in all contexts. Feedback and further improvements may still be appropriate over time."
    },
    {
        "href": "about-this-guide.html",
        "title": "About this guide",
        "description": "Purpose, audience, scope, and revision information for this South Carolina-focused heirs’ property educational guide.",
        "headings": [
            "About this guide",
            "Purpose",
            "Audience",
            "Scope",
            "Revision information",
            "Need help now?",
            "Guide links"
        ],
        "text": "Purpose This guide is designed to help readers understand heirs’ property, identify urgent issues, organize records, and prepare for more informed conversations with lawyers, legal aid offices, or community organizations. Audience The intended audience includes families in South Carolina who may be dealing with heirs’ property, title confusion, tax notices, family conflict around land, or uncertainty after a relative’s death. Scope The guide emphasizes education, structure, and preparation. It is not legal advice, and it does not replace title review, probate review, or case-specific counseling. The site includes a notes page for device-local recordkeeping and a printable guide for offline use. Revision information Current revision date: April 10, 2026 Revision posture: This version emphasizes multi-page reading, stronger accessibility, calmer editorial structure, separated print styles, and local-only note-taking support."
    }
];

  var controlClasses = {
    tertiary: "button-tertiary"
  };
  var searchForm = null;
  var searchField = null;
  var searchResults = null;
  var searchStatus = null;
  var searchPanel = null;

  function escapeHtml(value) {
    return String(value || "").replace(/[&<>"']/g, function (character) {
      return {
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
      }[character];
    });
  }

  function normalizeSearchText(value) {
    return String(value || "").toLowerCase().replace(/[’']/g, "'");
  }

  function getSearchTerms(query) {
    return normalizeSearchText(query).split(/\s+/).filter(function (term) {
      return term.length > 1;
    });
  }

  function buildSearchHaystack(item) {
    return normalizeSearchText([
      item.title,
      item.description,
      (item.headings || []).join(" "),
      item.text
    ].join(" "));
  }

  function makeSearchSnippet(item, terms) {
    var source = item.text || item.description || (item.headings || []).join(" ");
    var normalized = normalizeSearchText(source);
    var firstIndex = -1;
    terms.some(function (term) {
      firstIndex = normalized.indexOf(term);
      return firstIndex !== -1;
    });

    if (firstIndex === -1) {
      return item.description || (item.headings || []).slice(0, 3).join(" · ") || "Open this guide page.";
    }

    var startIndex = Math.max(0, firstIndex - 70);
    var endIndex = Math.min(source.length, firstIndex + 150);
    var snippet = source.slice(startIndex, endIndex).trim();
    if (startIndex > 0) snippet = "…" + snippet;
    if (endIndex < source.length) snippet += "…";
    return snippet;
  }

  function findSearchMatches(query) {
    var terms = getSearchTerms(query);
    if (!terms.length) return [];

    return searchIndex.map(function (item) {
      var haystack = buildSearchHaystack(item);
      var title = normalizeSearchText(item.title);
      var headings = normalizeSearchText((item.headings || []).join(" "));
      var score = 0;
      var matched = terms.every(function (term) {
        var found = haystack.indexOf(term) !== -1;
        if (found) {
          score += 1;
          if (title.indexOf(term) !== -1) score += 6;
          if (headings.indexOf(term) !== -1) score += 3;
        }
        return found;
      });
      if (!matched) return null;
      return { item: item, score: score, snippet: makeSearchSnippet(item, terms) };
    }).filter(Boolean).sort(function (a, b) {
      return b.score - a.score || a.item.title.localeCompare(b.item.title);
    }).slice(0, 8);
  }

  function closeSearchPanel() {
    if (!searchPanel || !searchField) return;
    searchPanel.hidden = true;
    searchField.setAttribute("aria-expanded", "false");
  }

  function openSearchPanel() {
    if (!searchPanel || !searchField) return;
    searchPanel.hidden = false;
    searchField.setAttribute("aria-expanded", "true");
  }

  function renderSearchResults(query) {
    if (!searchResults || !searchStatus || !searchField) return;
    var term = (query || "").trim();
    if (!term) {
      searchResults.innerHTML = "";
      searchStatus.textContent = "";
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

  if (headerActions) {
    searchForm = document.createElement("form");
    searchForm.className = "site-search no-print";
    searchForm.setAttribute("role", "search");
    searchForm.setAttribute("aria-label", "Site search");
    searchForm.innerHTML = '<label class="sr-only" for="site-search-input">Search this guide</label><div class="site-search-control"><input id="site-search-input" data-site-search type="search" autocomplete="off" placeholder="Search topics like deed, probate, tax…" aria-label="Search this guide" aria-controls="site-search-results" aria-expanded="false"><div id="site-search-panel" class="site-search-panel" data-search-panel hidden><div id="site-search-status" class="sr-only" role="status" aria-live="polite"></div><div id="site-search-results" class="site-search-results" data-search-results></div></div></div>';
    headerActions.insertBefore(searchForm, headerActions.firstChild);

    searchField = searchForm.querySelector("[data-site-search]");
    searchPanel = searchForm.querySelector("[data-search-panel]");
    searchResults = searchForm.querySelector("[data-search-results]");
    searchStatus = searchForm.querySelector("#site-search-status");

    searchForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var firstResult = searchResults ? searchResults.querySelector("a[href]") : null;
      if (firstResult) {
        window.location.href = firstResult.getAttribute("href");
      }
    });

    searchField.addEventListener("input", function (event) {
      renderSearchResults(event.target.value);
    });

    searchField.addEventListener("focus", function (event) {
      if (event.target.value.trim()) {
        renderSearchResults(event.target.value);
      }
    });

    searchField.addEventListener("keydown", function (event) {
      if (event.key === "Escape") {
        event.preventDefault();
        searchField.value = "";
        renderSearchResults("");
      }
    });

    document.addEventListener("click", function (event) {
      if (!searchForm.contains(event.target)) {
        closeSearchPanel();
      }
    });
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
      printButton.className = controlClasses.tertiary;
      printButton.type = "button";
      printButton.setAttribute("data-print-section", "");
      printButton.textContent = "Print this section";

      var saveLink = document.createElement("a");
      saveLink.className = controlClasses.tertiary;
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

  function setupResponsiveTables() {
    Array.prototype.forEach.call(document.querySelectorAll(".table-wrap table"), function (table) {
      var headerCells = Array.prototype.slice.call(table.querySelectorAll("thead th"));
      if (!headerCells.length) {
        return;
      }

      Array.prototype.forEach.call(table.querySelectorAll("tbody tr"), function (row) {
        var cells = Array.prototype.slice.call(row.children);
        cells.forEach(function (cell, index) {
          if (cell.tagName !== "TD") {
            return;
          }
          var header = headerCells[index];
          if (!header) {
            return;
          }
          cell.setAttribute("data-label", header.textContent.trim());
        });
      });

      table.setAttribute("data-responsive", "stack");
    });
  }

  setupResponsiveTables();

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
