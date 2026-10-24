/*
 * Premium theme: a design-movement skin (glass, brutalist, clay, cyberpunk, ...) for GHL's
 * interface. The server sends one complete theme object ({ style, name, primary, secondary,
 * accent, bg, text, border, interfaceColors, texture, sidebarEffect, borderRadius }) and this
 * script turns it into one stylesheet: the movement's look, then the per-element color
 * overlay, text-contrast safety rules, sidebar effects, icons and scrollbars.
 *
 * Three things CSS alone cannot do are handled here too: the floating orb backdrop used by the
 * glass styles, payment status pills (told apart by their text), and keeping a few stubborn
 * buttons from flashing GHL's blue on hover.
 * Config: { theme }.
 */
(function (C) {
  if (!C) return;

  	const SELECTORS = {
  		// ── universal chrome (present on every GHL page) ──
  		header: ".hl_header .container-fluid",
  		sidebar: "#sidebar-v2",
  		// The Settings sub-nav (Company, Team, Billing, …) is a separate
  		// Vue-router component, not the same markup as the main nav — its
  		// links have no ".hl_nav-settings" wrapper class and no shared parent
  		// class at all; the only reliable hook is each link's own id, which
  		// GHL always prefixes "sb_" (e.g. #sb_agency-company-settings).
  		// Confirmed via a live DOM dump on /settings/profile — see the "sb_"
  		// selectors added alongside the old (non-matching) ".hl_nav-settings"
  		// ones below; kept for safety in case that wrapper exists elsewhere.
  		// ".custom_page_sidenav" covers app-injected custom menu links (e.g.
  		// this app's own "Customizer" entry in the location-level Business
  		// Settings sidebar, id "#setting_1") — confirmed via a live DOM dump
  		// that these sit alongside native "sb_*" items in the exact same
  		// "#sidebar-v2" sidebar but use a completely different id/class
  		// pattern, so the "sb_" prefix rule alone never reached them.
  		sidebarLinks: "#sidebar-v2 .hl_nav-header nav a, #sidebar-v2 .hl_nav-settings nav a, #sidebar-v2 nav a[id^='sb_'], #sidebar-v2 nav a.custom_page_sidenav",
  		sidebarActive: "#sidebar-v2 .hl_nav-header nav a.active, #sidebar-v2 .hl_nav-settings nav a.active, #sidebar-v2 nav a[id^='sb_'].active, #sidebar-v2 nav a.custom_page_sidenav.active",
  		// The visible label lives in a nested span with its own GHL-set color
  		// (near-white, for their default dark sidebar) — inheriting color on
  		// the parent <a> alone isn't enough to actually change what's shown.
  		// Confirmed via a live outerHTML dump that the Settings sub-nav links
  		// use this exact same "hl_text-overflow" span (just not reachable
  		// through the old ".hl_nav-header"/".hl_nav-settings" ancestor
  		// prefix), so it's targeted the same way, off the "sb_" id instead.
  		// Also covers ".custom_page_sidenav" text directly on the <a> itself
  		// (not just its ".hl_text-overflow" child) since custom-injected
  		// links aren't guaranteed to use that same inner span.
  		sidebarLinkText:
  			"#sidebar-v2 .hl_nav-header nav a .hl_text-overflow, #sidebar-v2 .hl_nav-settings nav a .hl_text-overflow, " +
  			"#sidebar-v2 nav a[id^='sb_'] .hl_text-overflow, #sidebar-v2 nav a.custom_page_sidenav, #sidebar-v2 nav a.custom_page_sidenav .hl_text-overflow",
  		sidebarActiveText:
  			"#sidebar-v2 .hl_nav-header nav a.active .hl_text-overflow, #sidebar-v2 .hl_nav-settings nav a.active .hl_text-overflow, " +
  			"#sidebar-v2 nav a[id^='sb_'].active .hl_text-overflow, #sidebar-v2 nav a.custom_page_sidenav.active, #sidebar-v2 nav a.custom_page_sidenav.active .hl_text-overflow",
  		// Native nav icons (Dashboard, Conversations, Calendars, …) render as
  		// <img src="...svg"> — see Start.js's injectCustomLinkIconNormalizer
  		// comment. An <img> never responds to CSS color/fill/currentColor, only
  		// `filter` — so these can only be flipped dark<->light to match the
  		// item's text tone, never recolored to an arbitrary hex.
  		// (Settings sub-nav items carry no icon, so no "sb_" entry needed here.)
  		sidebarLinkIconImg: "#sidebar-v2 .hl_nav-header nav a > img, #sidebar-v2 .hl_nav-settings nav a > img",
  		sidebarActiveIconImg: "#sidebar-v2 .hl_nav-header nav a.active > img, #sidebar-v2 .hl_nav-settings nav a.active > img",
  		// Custom-link icons (Help Library, System Status, …) are real
  		// Font Awesome glyphs — these DO follow `color`/currentColor normally.
  		sidebarLinkIconFont: "#sidebar-v2 nav a.custom-link span.h-5.w-5 > i",
  		// The "MY BUSINESS" / "BUSINESS SERVICES" / "OTHER SETTINGS" uppercase
  		// divider labels above each sidebar section — all identical markup
  		// (".divider > p > span.default-bg-color"), confirmed via a live DOM
  		// dump of the location Settings sidebar. No per-section id/class
  		// exists, so this targets every section label at once rather than
  		// just "MY BUSINESS" specifically.
  		sidebarSectionLabel: "#sidebar-v2 .divider .default-bg-color",
  		dashboardWrapper: "#dashboard-wrapper",
  		title: ".title",
  		notificationBanner: "#notification_banner-top_bar, .notification-banner-wrapper",
  		searchBar: "#globalSearchOpener",
  		locationSwitcher: "#location-switcher-sidbar-v2",
  		avatarButton: ".hl_header--avatar",
  		accountMenu: ".dropdown-menu.dropdown-menu-right",
  		feedbackButton: ".feedback-button",
  		subNavTabs: ".topmenu-nav",
  		genericButton: ".hr-button, .n-button",
  		inputWrapper: ".hr-input-wrapper, .n-input-wrapper",
  
  		// ── dashboard ──
  		cardContent: ".hr-card-content, .hl-card-content",
  		cardHeader: ".hr-card-header, .hl-card-header",
  		emptyStateTitle: ".hr-empty__title",
  		pipelineDropdown: ".hr-base-selection",
  
  		// ── conversations ──
  		conversationScrollArea: ".custom-scrollbar",
  		conversationListHeader: ".conversation-list-header",
  		bulkCheckbox: ".hr-checkbox-box",
  		messageBubble: ".message-item",
  		composerFooter: "#conv-composer-footer",
  		sendButton: "#conv-send-button-simple",
  		contactSidePanel: "#conversations-contact-details",
  		sidePanelTabs: ".hr-tabs-tab",
  		sidePanelTabActive: ".hr-tabs-tab--active",
  
  		// ── calendars ──
  		calendarToolbar: "#calendar-page-parent-container",
  		calendarGrid: "#fc-calendar-container-v2",
  		calendarHeaderCells: ".fc-col-header-cell",
  		calendarTodayColumn: ".fc-day-today",
  		calendarNowLine: ".fc-timegrid-now-indicator-line",
  		calendarFilterDrawer: "#calendar-view-filter-drawer",
  
  		// ── payments / invoices ──
  		invoicePageHeader: "header.hl-header",
  		invoicePageTitle: ".hl-title-container .title",
  		statTile: ".ui-statistic",
  		dataTable: ".hr-data-table-table",
  		dataTableHeader: ".hr-data-table-th",
  		dataTableCell: ".hr-data-table-td",
  		statusTag: ".hr-tag--round",
  		tableScrollbarRail: ".hr-scrollbar-rail",
  		pagination: ".hr-pagination-item",
  		pageSizeSelect: ".hr-select",
  
  		primaryButtons: [
  			"body .green-btn",
  			"body .n-button.n-button--primary-type.n-button--medium-type",
  			"body button.hl-btn.inline-flex.items-center.px-4.py-2.border.border-transparent.text-sm.font-medium.rounded.shadow-sm.text-white.bg-apple-500.hover\\:bg-apple-600.focus\\:outline-none.focus\\:ring-2.focus\\:ring-offset-2.focus\\:ring-apple-500",
  			"#today-button",
  			"#new-appointment-button",
  			"#location-dashboard_btn--edit-dashboard",
  			"#create-invoice-btn",
  			// Shared "+ New" button component GHL reuses across several list
  			// pages (confirmed on Payments > Documents & Contracts) — same id
  			// may appear on other list-style pages too since only one route's
  			// DOM is ever mounted at a time.
  			"#page-email-builder-template__btn-actions",
  		].join(",\n"),
  	};

  	/* ── 4a. Background orb layer — used by glass, liquidGlass, maximalist ── */
  	/*     Real depth needs a colorful backdrop to blur/refract against; a    */
  	/*     flat single-color panel is what made earlier attempts look washed  */
  	/*     out. This injects floating blurred color pools behind the portal.  */
  
  	let premiumBgLayer = null;
  
  	function clearPremiumBgLayer() {
  		if (premiumBgLayer) {
  			premiumBgLayer.remove();
  			premiumBgLayer = null;
  		}
  	}
  
  	function buildPremiumBgLayer(theme, animate) {
  		clearPremiumBgLayer();
  		premiumBgLayer = document.createElement("div");
  		premiumBgLayer.id = "ata-premium-bg-layer";
  		// This fixed, full-viewport layer is the last-resort backdrop for any
  		// route/wrapper we haven't explicitly styled (see the dashboardWrapper
  		// comment in the liquidGlass generator below) — it's expected to show
  		// through on unmapped pages. Every seeded theme's actual page panels
  		// render light regardless of how dark the theme's own top-level `bg`
  		// swatch is (that swatch is just the picker-card preview), so this
  		// layer needs to be light too, or any unmapped route leaks a jarring
  		// dark background (reported repeatedly on Payments sub-tabs).
  		const baseLight = (theme.interfaceColors && theme.interfaceColors.dashboardBg) || "#eff8ff";
  		Object.assign(premiumBgLayer.style, {
  			position: "fixed",
  			inset: "0",
  			zIndex: "-1",
  			overflow: "hidden",
  			background: baseLight,
  		});
  
  		// Only liquidGlass themes carry an orbGlow texture value today — a
  		// plain "glass" theme (which also uses this bg layer) has no such
  		// field, so it always falls back to 0.45, unchanged from before.
  		// Capped lower now that orbs sit on a light base instead of a dark
  		// one — full-strength saturated color at 0.45 opacity reads as a
  		// muddy dark patch on light, not a soft accent glow.
  		const orbGlow = Math.min((theme.texture && theme.texture.liquidGlass && theme.texture.liquidGlass.orbGlow) ?? 0.45, 0.18);
  
  		// Kept clear of the top ~90px header/toolbar band — that strip is a
  		// translucent, blurred glass panel (see SELECTORS.header below), so any
  		// orb sitting behind it bleeds through and visually merges with real
  		// header controls (reported: the Edit Dashboard pencil button appeared
  		// to be "floating"/drifting — it was actually this orb showing through
  		// the header, not the button itself moving).
  		const orbSpecs = [
  			{ top: "5%", left: "8%", size: "440px", color: theme.primary },
  			{ top: "55%", left: "72%", size: "480px", color: theme.secondary },
  			{ top: "75%", left: "10%", size: "340px", color: theme.accent },
  			{ top: "30%", left: "62%", size: "300px", color: theme.primary },
  		];
  		orbSpecs.forEach((o, i) => {
  			const orb = document.createElement("div");
  			Object.assign(orb.style, {
  				position: "absolute",
  				top: o.top,
  				left: o.left,
  				width: o.size,
  				height: o.size,
  				borderRadius: "50%",
  				background: o.color,
  				filter: "blur(100px)",
  				opacity: String(orbGlow),
  			});
  			if (animate) {
  				orb.style.animation = `ata-premium-float ${14 + i * 3}s ease-in-out infinite`;
  				orb.style.animationDelay = `${i * 1.5}s`;
  			}
  			premiumBgLayer.appendChild(orb);
  		});
  		document.body.appendChild(premiumBgLayer);
  	}
  
  	// Which movements get the animated/floating orb backdrop vs none at all.
  	const BG_LAYER_STYLE = {
  		glass: { enabled: true, animate: false },
  		// Static, like glass — an animated orb drifting behind a blurred
  		// (backdrop-filter) button reads as the button itself moving, which is
  		// what caused the Edit Dashboard button to appear to "float" around
  		// the header even after its own position/layout was no longer touched.
  		liquidGlass: { enabled: true, animate: false },
  		maximalist: { enabled: false }, // maximalist uses a flat busy pattern instead, added inline below
  	};
  
  	/* ── 4b. Per-movement CSS generators (refined to match the validated look) ── */
  
  	// Lets an admin choose the sidebar nav-item shape (sharp/soft/rounded/pill)
  	// via the theme's global Border Radius field instead of it being hardcoded
  	// per movement. Every movement's SELECTORS.sidebarLinks border-radius
  	// reads this — except Claymorphism, which already has its own
  	// texture-driven corner softness for this exact purpose (see `rad()` in
  	// that generator) and shouldn't be double-controlled.
  	const NAV_RADIUS_PX = { sharp: 0, soft: 8, rounded: 16, pill: 999 };
  	function navRadiusPx(theme) {
  		return NAV_RADIUS_PX[theme.borderRadius] ?? 16;
  	}
  
  	const MOVEMENT_CSS = {
  		glass: (t) => `
  		@keyframes ata-premium-float {
  			0%, 100% { transform: translate(0, 0) scale(1); }
  			33% { transform: translate(40px, -30px) scale(1.08); }
  			66% { transform: translate(-30px, 25px) scale(0.94); }
  		}
  		body, ${SELECTORS.dashboardWrapper} { background: transparent !important; }
  
  		${SELECTORS.header} {
  			background: rgba(255,255,255,0.08) !important;
  			backdrop-filter: blur(22px) saturate(200%) !important;
  			-webkit-backdrop-filter: blur(22px) saturate(200%) !important;
  			border-bottom: 1px solid rgba(255,255,255,0.18) !important;
  		}
  		${SELECTORS.sidebar} {
  			/* Was 0.5 opacity, relying on the fixed dark bg layer showing through
  			   the blur for contrast against its light nav text. That layer is now
  			   light (see buildPremiumBgLayer), which washed the sidebar out to a
  			   pale, "disabled-looking" gray. Near-opaque here makes the sidebar's
  			   own dark color the dominant one regardless of what's behind it. */
  			background: rgba(15,23,42,0.94) !important;
  			backdrop-filter: blur(26px) saturate(180%) !important;
  			-webkit-backdrop-filter: blur(26px) saturate(180%) !important;
  			border-right: 1px solid rgba(255,255,255,0.12) !important;
  			box-shadow: 8px 0 36px rgba(0,0,0,0.4) !important;
  		}
  		${SELECTORS.sidebarLinks} {
  			background: rgba(255,255,255,0.05) !important;
  			border: 1px solid rgba(255,255,255,0.1) !important;
  			border-radius: ${navRadiusPx(t)}px !important;
  			color: #e2e8f0 !important;
  			margin: 4px 18px 4px 10px !important;
  		}
  		${SELECTORS.sidebarActive} {
  			background: ${t.primary}33 !important;
  			border-color: ${t.primary}66 !important;
  			color: #ffffff !important;
  			box-shadow: 0 4px 18px ${t.primary}44 !important;
  		}
  		${SELECTORS.cardContent} {
  			/* Same fix as the sidebar above — was 0.45 opacity dark, relying on
  			   a dark backdrop for its light text to stay readable. Any page
  			   this selector reaches that ISN'T also covered by the theme's own
  			   light cardContentBg (interfaceColors overlay wins there anyway)
  			   needs to stay dark on its own now that the backdrop is light. */
  			background: rgba(30,41,59,0.92) !important;
  			backdrop-filter: blur(20px) saturate(180%) !important;
  			-webkit-backdrop-filter: blur(20px) saturate(180%) !important;
  			border: 1px solid rgba(148,163,184,0.18) !important;
  			border-radius: 18px !important;
  			box-shadow: 0 10px 36px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06) !important;
  			color: #e2e8f0 !important;
  		}
  		${SELECTORS.cardHeader} { background: rgba(255,255,255,0.04) !important; color: #f1f5f9 !important; }
  		${SELECTORS.title} { color: #f8fafc !important; text-shadow: 0 2px 10px ${t.primary}44 !important; }
  		${SELECTORS.primaryButtons} {
  			background: ${t.primary}33 !important;
  			backdrop-filter: blur(12px) !important;
  			border: 1px solid ${t.primary}66 !important;
  			border-radius: 10px !important;
  			color: ${(t.interfaceColors && t.interfaceColors.titleText) || "#0f172a"} !important;
  			box-shadow: 0 4px 18px ${t.primary}44 !important;
  		}
  		${SELECTORS.invoicePageHeader} {
  			background: ${(t.interfaceColors && t.interfaceColors.paymentsAlertBannerBg) || "#eff8ff"} !important;
  			border-bottom: 1px solid rgba(255,255,255,0.4) !important;
  			backdrop-filter: none !important;
  		}
  		/* .hl-title-container is invoicePageHeader's own wrapper (padding around
  		   the title/buttons); #invoice_listing is the route container holding
  		   the table; .hr-wrapper-container.invoicesApp is the outermost Invoices
  		   page shell (confirmed via live inspector — 32px padding around all of
  		   the above) — all three were left transparent, exposing the movement's
  		   dark atmospheric backdrop in the gutters around every card on this route. */
  		.hl-title-container, #invoice_listing, .hr-wrapper-container.invoicesApp {
  			background: ${(t.interfaceColors && t.interfaceColors.paymentsTableBg) || "#eff8ff"} !important;
  		}
  		${SELECTORS.invoicePageTitle} {
  			color: ${(t.interfaceColors && t.interfaceColors.titleText) || "#0f172a"} !important;
  			text-shadow: none !important;
  			font-weight: 700 !important;
  		}
  	`,
  
  		brutalist: (t) => {
  			// Defaults below match the literal values this generator used
  			// before texture became tunable — a theme with no texture data
  			// renders byte-identical to before.
  			const brutTex = (t.texture && t.texture.brutalist) || {};
  			const weight = brutTex.borderWeight ?? 3;
  			const weightThin = Math.max(weight - 1, 0);
  			const shadowX = brutTex.shadowOffsetX ?? 0;
  			const shadowY = brutTex.shadowOffsetY ?? 0;
  			// Brutalism never had a shadow before (box-shadow: none
  			// everywhere) — at the default (0,0) this stays exactly "none";
  			// dialed up, a hard flat offset shadow appears (no blur, matches
  			// the movement's harsh flat aesthetic).
  			const hardShadow = (shadowX > 0 || shadowY > 0) ? `${shadowX}px ${shadowY}px 0 #000000` : 'none';
  			return `
  		${SELECTORS.header} { background: ${t.accent} !important; border-bottom: ${weight}px solid #000000 !important; box-shadow: none !important; }
  		${SELECTORS.sidebar} { background: ${t.bg} !important; border-right: ${weight}px solid #000000 !important; box-shadow: none !important; }
  		${SELECTORS.sidebarLinks} {
  			background: ${t.bg} !important;
  			border: 1px solid ${t.primary} !important;
  			border-radius: ${navRadiusPx(t)}px !important;
  			box-shadow: none !important;
  			color: #000000 !important;
  			font-weight: 800 !important;
  			text-transform: uppercase !important;
  			transition: none !important;
  			margin-right: 18px !important;
  		}
  		${SELECTORS.sidebarLinkText} { color: #000000 !important; }
  		${SELECTORS.sidebarActive} {
  			background: #000000 !important;
  			border-color: #000000 !important;
  			color: #ffffff !important;
  		}
  		${SELECTORS.sidebarActiveText} { color: #ffffff !important; }
  		${SELECTORS.cardContent} {
  			background: #ffffff !important;
  			border: ${weightThin}px solid #000000 !important;
  			border-radius: 0 !important;
  			box-shadow: ${hardShadow} !important;
  			color: #000000 !important;
  		}
  		${SELECTORS.cardHeader} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; color: #000000 !important; font-weight: 800 !important; text-transform: uppercase !important; }
  		${SELECTORS.title} { color: #000000 !important; font-weight: 900 !important; text-transform: uppercase !important; text-shadow: none !important; }
  		${SELECTORS.primaryButtons} {
  			background: #000000 !important;
  			border: ${weightThin}px solid #000000 !important;
  			border-radius: 0 !important;
  			box-shadow: ${hardShadow} !important;
  			color: #ffffff !important;
  			font-weight: 800 !important;
  			text-transform: uppercase !important;
  			transition: none !important;
  		}
  		${SELECTORS.notificationBanner} { background: ${t.primary} !important; color: #000000 !important; border-bottom: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.searchBar} { background: #ffffff !important; border: 1px solid #000000 !important; border-radius: 0 !important; color: #000000 !important; }
  		${SELECTORS.locationSwitcher} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; color: #000000 !important; }
  		${SELECTORS.avatarButton} { border: ${weightThin}px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.accountMenu} { background: ${t.bg} !important; border: ${weightThin}px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.feedbackButton} { background: #000000 !important; color: #ffffff !important; border-radius: 0 !important; }
  		${SELECTORS.subNavTabs} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.genericButton} { border-radius: 0 !important; }
  		${SELECTORS.inputWrapper} { border: 1px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.emptyStateTitle} { color: #000000 !important; font-weight: 800 !important; text-transform: uppercase !important; }
  		${SELECTORS.pipelineDropdown} { border: 1px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.conversationScrollArea} { background: #ffffff !important; }
  		${SELECTORS.conversationListHeader} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; color: #000000 !important; font-weight: 800 !important; text-transform: uppercase !important; }
  		${SELECTORS.bulkCheckbox} { border: ${weightThin}px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.messageBubble} { border: 1px solid #000000 !important; border-radius: 0 !important; }
  		${SELECTORS.composerFooter} { background: ${t.bg} !important; border-top: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.sendButton} { background: #000000 !important; color: #ffffff !important; border-radius: 0 !important; }
  		${SELECTORS.contactSidePanel} { background: #ffffff !important; border-left: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.sidePanelTabs} { color: #000000 !important; font-weight: 700 !important; text-transform: uppercase !important; }
  		${SELECTORS.sidePanelTabActive} { border-bottom: ${weight}px solid #000000 !important; color: #000000 !important; }
  		${SELECTORS.calendarToolbar} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.calendarGrid} { border: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.calendarHeaderCells} { background: ${t.bg} !important; color: #000000 !important; font-weight: 800 !important; text-transform: uppercase !important; border-color: #000000 !important; }
  		${SELECTORS.calendarTodayColumn} { background: ${t.accent}22 !important; }
  		${SELECTORS.calendarNowLine} { border-color: #000000 !important; }
  		${SELECTORS.calendarFilterDrawer} { background: #ffffff !important; border-left: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.invoicePageHeader} { background: ${t.bg} !important; border-bottom: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.invoicePageTitle} { color: #000000 !important; font-weight: 900 !important; text-transform: uppercase !important; }
  		${SELECTORS.statTile} { border: ${weightThin}px solid #000000 !important; background: #ffffff !important; }
  		${SELECTORS.dataTable} { border: ${weightThin}px solid #000000 !important; }
  		${SELECTORS.dataTableHeader} { background: ${t.bg} !important; color: #000000 !important; font-weight: 800 !important; text-transform: uppercase !important; border-color: #000000 !important; }
  		${SELECTORS.dataTableCell} { border-color: #000000 !important; color: #000000 !important; }
  		${SELECTORS.statusTag} { border-radius: 0 !important; font-weight: 800 !important; text-transform: uppercase !important; }
  		${SELECTORS.tableScrollbarRail} { background: ${t.bg} !important; }
  		${SELECTORS.pagination} { border-radius: 0 !important; }
  		${SELECTORS.pageSizeSelect} { border: 1px solid #000000 !important; border-radius: 0 !important; }
  	`;
  		},
  
  		clay: (t) => {
  			// Defaults below match the literal values this generator used
  			// before texture became tunable — a theme with no texture data
  			// renders byte-identical to before.
  			const clayTex = (t.texture && t.texture.clay) || {};
  			const inner = clayTex.innerShadowDepth ?? 10;
  			const outer = clayTex.outerShadowDepth ?? 20;
  			const soft = clayTex.cornerSoftness ?? 26;
  			// Each element's own literal blur value shifts by the same delta
  			// the slider moved from its default, so relative puffiness
  			// between elements is preserved; floored at 0.
  			const bi = (base) => Math.max(base + (inner - 10), 0);
  			const bo = (base) => Math.max(base + (outer - 20), 0);
  			const rad = (base) => Math.max(base + (soft - 26), 0);
  			return `
  		${SELECTORS.header} { background: ${t.bg} !important; box-shadow: 0 6px 16px -6px ${t.primary}55 !important; border-bottom: none !important; }
  		${SELECTORS.sidebar} { background: ${t.bg} !important; box-shadow: inset -8px -8px ${bo(16)}px rgba(255,255,255,0.5), inset 8px 8px ${bo(16)}px ${t.secondary}55 !important; }
  		${SELECTORS.sidebarLinks} {
  			background: #ffffff !important;
  			border: none !important;
  			border-radius: ${rad(20)}px !important;
  			box-shadow: -4px -4px ${bi(10)}px rgba(255,255,255,0.8), 4px 4px ${bi(10)}px ${t.secondary}55 !important;
  			/* Was t.accent — clay themes' accent is a light pastel pink, near-
  			   invisible as text/icon color on the white pill background. A fixed
  			   dark pink keeps the pink identity while staying readable. */
  			color: #9d174d !important;
  			font-weight: 700 !important;
  			margin: 4px 18px 4px 10px !important;
  			transition: all 0.15s ease;
  		}
  		${SELECTORS.sidebarLinkText} { color: #9d174d !important; }
  		${SELECTORS.sidebarActive} {
  			background: ${t.primary} !important;
  			color: #9d174d !important;
  			box-shadow: inset -4px -4px ${bi(8)}px rgba(255,255,255,0.6), inset 4px 4px ${bi(10)}px ${t.secondary}66 !important;
  		}
  		${SELECTORS.sidebarActiveText} { color: #9d174d !important; }
  		${SELECTORS.cardContent} {
  			background: #ffffff !important;
  			border: none !important;
  			border-radius: ${rad(26)}px !important;
  			box-shadow: -6px -6px ${bi(14)}px rgba(255,255,255,0.7), 8px 8px ${bo(20)}px ${t.secondary}55 !important;
  			color: ${t.accent} !important;
  		}
  		${SELECTORS.cardHeader} { background: ${t.secondary}55 !important; border-radius: ${rad(26)}px ${rad(26)}px 0 0 !important; color: ${t.accent} !important; font-weight: 700 !important; }
  		${SELECTORS.title} { color: ${t.accent} !important; font-weight: 800 !important; text-shadow: 1px 1px 0 rgba(255,255,255,0.6) !important; }
  		${SELECTORS.primaryButtons} {
  			background: ${t.primary} !important;
  			border: none !important;
  			border-radius: 16px !important;
  			box-shadow: -4px -4px ${bi(10)}px rgba(255,255,255,0.6), 4px 4px ${bo(12)}px ${t.secondary}66 !important;
  			color: ${t.accent} !important;
  			font-weight: 700 !important;
  			transition: all 0.15s ease;
  		}
  		${SELECTORS.primaryButtons}:active { box-shadow: inset -3px -3px ${bi(8)}px rgba(255,255,255,0.5), inset 3px 3px ${bi(8)}px ${t.secondary}66 !important; }
  		${SELECTORS.notificationBanner} { background: ${t.secondary}55 !important; color: ${t.accent} !important; }
  		${SELECTORS.searchBar} { background: #ffffff !important; border-radius: 999px !important; color: ${t.accent} !important; box-shadow: -3px -3px ${bi(8)}px rgba(255,255,255,0.8), 3px 3px ${bi(8)}px ${t.secondary}44 !important; }
  		${SELECTORS.locationSwitcher} { background: ${t.bg} !important; color: ${t.accent} !important; }
  		${SELECTORS.avatarButton} { border-radius: 50% !important; box-shadow: -2px -2px ${bi(6)}px rgba(255,255,255,0.8), 2px 2px ${bi(6)}px ${t.secondary}55 !important; }
  		${SELECTORS.accountMenu} { background: #ffffff !important; border-radius: ${rad(24)}px !important; box-shadow: -6px -6px ${bi(14)}px rgba(255,255,255,0.7), 8px 8px ${bo(20)}px ${t.secondary}44 !important; }
  		${SELECTORS.feedbackButton} { background: ${t.primary} !important; color: ${t.accent} !important; border-radius: 999px !important; box-shadow: -3px -3px ${bi(8)}px rgba(255,255,255,0.6), 3px 3px ${bi(10)}px ${t.secondary}55 !important; }
  		${SELECTORS.subNavTabs} { background: #ffffff !important; box-shadow: 0 4px 12px -4px ${t.secondary}55 !important; }
  		${SELECTORS.genericButton} { border-radius: 16px !important; }
  		${SELECTORS.inputWrapper} { border-radius: 16px !important; box-shadow: inset -2px -2px ${bi(6)}px rgba(255,255,255,0.6), inset 2px 2px ${bi(6)}px ${t.secondary}44 !important; }
  		${SELECTORS.emptyStateTitle} { color: ${t.accent} !important; font-weight: 700 !important; }
  		${SELECTORS.pipelineDropdown} { border-radius: 999px !important; box-shadow: -2px -2px ${bi(6)}px rgba(255,255,255,0.7), 2px 2px ${bi(6)}px ${t.secondary}44 !important; }
  		${SELECTORS.conversationScrollArea} { background: #ffffff !important; }
  		${SELECTORS.conversationListHeader} { background: #ffffff !important; color: ${t.accent} !important; font-weight: 700 !important; box-shadow: 0 4px 10px -6px ${t.secondary}55 !important; }
  		${SELECTORS.bulkCheckbox} { border-radius: 8px !important; }
  		${SELECTORS.messageBubble} { border-radius: ${rad(22)}px !important; border: none !important; background: #ffffff !important; box-shadow: -4px -4px ${bi(10)}px rgba(255,255,255,0.7), 4px 4px ${bi(12)}px ${t.secondary}44 !important; }
  		${SELECTORS.composerFooter} { background: #ffffff !important; box-shadow: 0 -4px 10px -6px ${t.secondary}55 !important; }
  		${SELECTORS.sendButton} { background: ${t.primary} !important; color: ${t.accent} !important; border-radius: 999px !important; }
  		${SELECTORS.contactSidePanel} { background: #ffffff !important; }
  		${SELECTORS.sidePanelTabs} { color: ${t.accent} !important; font-weight: 600 !important; }
  		${SELECTORS.sidePanelTabActive} { color: ${t.accent} !important; font-weight: 800 !important; }
  		${SELECTORS.calendarToolbar} { background: #ffffff !important; }
  		${SELECTORS.calendarGrid} { border-radius: ${rad(26)}px !important; border: none !important; overflow: hidden !important; box-shadow: -6px -6px ${bi(14)}px rgba(255,255,255,0.7), 8px 8px ${bo(20)}px ${t.secondary}44 !important; }
  		${SELECTORS.calendarHeaderCells} { background: ${t.secondary}55 !important; color: ${t.accent} !important; font-weight: 700 !important; }
  		${SELECTORS.calendarTodayColumn} { background: ${t.primary}22 !important; }
  		${SELECTORS.calendarNowLine} { border-color: ${t.primary} !important; }
  		${SELECTORS.calendarFilterDrawer} { background: #ffffff !important; box-shadow: -6px 0 14px -8px ${t.secondary}55 !important; }
  		${SELECTORS.invoicePageHeader} { background: #ffffff !important; }
  		${SELECTORS.invoicePageTitle} { color: ${t.accent} !important; font-weight: 700 !important; }
  		${SELECTORS.statTile} { border-radius: ${rad(24)}px !important; border: none !important; background: #ffffff !important; box-shadow: -4px -4px ${bi(10)}px rgba(255,255,255,0.7), 4px 4px ${bi(12)}px ${t.secondary}44 !important; }
  		${SELECTORS.dataTable} { border-radius: ${rad(26)}px !important; overflow: hidden !important; border: none !important; box-shadow: -6px -6px ${bi(14)}px rgba(255,255,255,0.7), 8px 8px ${bo(20)}px ${t.secondary}44 !important; }
  		${SELECTORS.dataTableHeader} { background: ${t.secondary}55 !important; color: ${t.accent} !important; font-weight: 700 !important; }
  		${SELECTORS.dataTableCell} { color: ${t.accent} !important; }
  		${SELECTORS.statusTag} { font-weight: 700 !important; }
  		${SELECTORS.tableScrollbarRail} { background: #ffffff !important; }
  		${SELECTORS.pagination} { border-radius: 999px !important; }
  		${SELECTORS.pageSizeSelect} { border-radius: 999px !important; }
  	`;
  		},
  
  		maximalist: (t) => {
  			// Defaults below match the literal values this generator used
  			// before texture became tunable — a theme with no texture data
  			// renders byte-identical to before.
  			const maxTex = (t.texture && t.texture.maximalist) || {};
  			const depth = maxTex.boxDepth ?? 6;
  			const outline = maxTex.outlineWeight ?? 3;
  			const outlineThin = Math.max(outline - 1, 0);
  			const layers = Math.max(1, Math.round(maxTex.shadowLayers ?? 1));
  			const bevel = maxTex.bevelAngle ?? 0;
  			// Real "3D box" depth: stacks N offset flat shadows (each further
  			// out, each more transparent) instead of one flat layer. With the
  			// default layers=1 this returns exactly the original single
  			// `${baseDepth}px ${baseDepth}px 0 ${color}` string.
  			const boxShadow = (baseDepth, color) => {
  				const parts = [];
  				for (let i = 0; i < layers; i++) {
  					const d = baseDepth * (i + 1);
  					parts.push(`${d}px ${d}px 0 ${color}${i === 0 ? '' : '66'}`);
  				}
  				return parts.join(', ');
  			};
  			// bevelAngle only changes anything once tuned above 0 — at the
  			// default (0) this is a flat fill, identical to before.
  			const cardHeaderBg = bevel > 0 ? `linear-gradient(${bevel}deg, ${t.secondary}, ${t.secondary}dd)` : t.secondary;
  			return `
  		${SELECTORS.header} { background: #ef476f !important; border-bottom: none !important; box-shadow: none !important; }
  		${SELECTORS.sidebar} { background: ${t.primary} !important; border-right: none !important; box-shadow: none !important; }
  		${SELECTORS.sidebarLinks} {
  			background: ${t.bg} !important;
  			border: none !important;
  			border-radius: ${navRadiusPx(t)}px !important;
  			box-shadow: none !important;
  			color: ${t.primary} !important;
  			font-weight: 700 !important;
  			margin: 4px 18px 4px 10px !important;
  			transition: all 0.15s ease;
  		}
  		${SELECTORS.sidebarLinkText} { color: ${t.primary} !important; }
  		${SELECTORS.sidebarActive} {
  			background: ${t.secondary} !important;
  			color: #000000 !important;
  			font-weight: 800 !important;
  		}
  		${SELECTORS.sidebarActiveText} { color: #000000 !important; }
  		${SELECTORS.cardContent} {
  			background: ${t.bg} !important;
  			border: ${outline}px solid ${t.accent} !important;
  			border-radius: 16px !important;
  			box-shadow: ${boxShadow(depth, t.accent)} !important;
  			color: #1a1a1a !important;
  			transition: transform 0.15s ease, box-shadow 0.15s ease;
  		}
  		${SELECTORS.cardContent}:hover {
  			transform: translate(-2px, -2px) !important;
  			box-shadow: ${boxShadow(depth + 2, t.accent)} !important;
  		}
  		${SELECTORS.cardHeader} { background: ${cardHeaderBg} !important; border-bottom: ${outline}px solid ${t.accent} !important; color: #1a1a1a !important; font-weight: 700 !important; }
  		${SELECTORS.title} {
  			color: #f4b400 !important;
  			font-weight: 900 !important;
  			text-shadow: none !important;
  			text-decoration: underline wavy #ef476f !important;
  			text-decoration-thickness: 3px !important;
  			text-underline-offset: 6px !important;
  		}
  		${SELECTORS.primaryButtons} {
  			background: ${t.primary} !important;
  			border: none !important;
  			border-radius: 999px !important;
  			box-shadow: none !important;
  			color: #ffffff !important;
  			font-weight: 700 !important;
  			transition: all 0.15s ease;
  		}
  		${SELECTORS.primaryButtons}:hover { transform: translateY(-1px) scale(1.03) !important; }
  		${SELECTORS.notificationBanner} { background: #a8c8f5 !important; color: #000000 !important; }
  		${SELECTORS.searchBar} { background: #ffffff !important; border-radius: 999px !important; color: ${t.primary} !important; }
  		${SELECTORS.locationSwitcher} { background: ${t.primary} !important; color: #ffffff !important; }
  		${SELECTORS.avatarButton} { border-radius: 50% !important; }
  		${SELECTORS.accountMenu} { background: ${t.bg} !important; border-radius: 16px !important; border: ${outlineThin}px solid ${t.accent} !important; box-shadow: ${boxShadow(Math.max(depth - 2, 0), t.accent)} !important; }
  		${SELECTORS.feedbackButton} { background: ${t.primary} !important; color: #ffffff !important; border-radius: 999px !important; }
  		${SELECTORS.subNavTabs} { background: #ef476f !important; }
  		${SELECTORS.genericButton} { border-radius: 999px !important; }
  		${SELECTORS.inputWrapper} { border-radius: 999px !important; }
  		${SELECTORS.emptyStateTitle} { color: ${t.secondary} !important; font-weight: 800 !important; }
  		${SELECTORS.pipelineDropdown} { border-radius: 999px !important; border: ${outlineThin}px solid ${t.accent} !important; }
  		${SELECTORS.conversationScrollArea} { background: ${t.bg} !important; }
  		${SELECTORS.conversationListHeader} { background: ${t.secondary} !important; color: #1a1a1a !important; font-weight: 700 !important; }
  		${SELECTORS.bulkCheckbox} { border-radius: 6px !important; border-color: ${t.accent} !important; }
  		${SELECTORS.messageBubble} { border-radius: 16px !important; border: ${outlineThin}px solid ${t.accent} !important; background: ${t.bg} !important; box-shadow: ${boxShadow(Math.max(depth - 2, 0), t.accent)} !important; }
  		${SELECTORS.composerFooter} { background: ${t.bg} !important; border-top: ${outline}px solid ${t.accent} !important; }
  		${SELECTORS.sendButton} { background: ${t.primary} !important; color: #ffffff !important; border-radius: 999px !important; }
  		${SELECTORS.contactSidePanel} { background: ${t.bg} !important; }
  		${SELECTORS.sidePanelTabs} { color: ${t.primary} !important; font-weight: 600 !important; }
  		${SELECTORS.sidePanelTabActive} { color: ${t.secondary} !important; border-bottom: 3px solid ${t.secondary} !important; }
  		${SELECTORS.calendarToolbar} { background: ${t.bg} !important; }
  		${SELECTORS.calendarGrid} { border-radius: 16px !important; border: ${outline}px solid ${t.accent} !important; overflow: hidden !important; box-shadow: ${boxShadow(depth, t.accent)} !important; }
  		${SELECTORS.calendarHeaderCells} { background: ${t.secondary} !important; color: #1a1a1a !important; font-weight: 700 !important; }
  		${SELECTORS.calendarTodayColumn} { background: ${t.primary}22 !important; }
  		${SELECTORS.calendarNowLine} { border-color: #ef476f !important; }
  		${SELECTORS.calendarFilterDrawer} { background: ${t.bg} !important; border-left: ${outline}px solid ${t.accent} !important; }
  		${SELECTORS.invoicePageHeader} { background: ${t.bg} !important; }
  		${SELECTORS.invoicePageTitle} { color: ${t.secondary} !important; font-weight: 800 !important; }
  		${SELECTORS.statTile} { border-radius: 16px !important; border: ${outlineThin}px solid ${t.accent} !important; background: ${t.bg} !important; box-shadow: ${boxShadow(Math.max(depth - 1, 0), t.accent)} !important; }
  		${SELECTORS.dataTable} { border-radius: 16px !important; overflow: hidden !important; border: ${outline}px solid ${t.accent} !important; box-shadow: ${boxShadow(depth, t.accent)} !important; }
  		${SELECTORS.dataTableHeader} { background: ${t.secondary} !important; color: #1a1a1a !important; font-weight: 700 !important; }
  		${SELECTORS.dataTableCell} { color: #1a1a1a !important; }
  		${SELECTORS.statusTag} { font-weight: 700 !important; }
  		${SELECTORS.tableScrollbarRail} { background: ${t.bg} !important; }
  		${SELECTORS.pagination} { border-radius: 999px !important; }
  		${SELECTORS.pageSizeSelect} { border-radius: 999px !important; }
  	`;
  		},
  
  		liquidGlass: (t) => {
  			// Defaults below match the literal values this generator used
  			// before texture became tunable — a theme with no texture data
  			// (every theme created before this, or the local hardcoded
  			// PREMIUM_THEMES fallback) renders byte-identical to before.
  			const lgTex = (t.texture && t.texture.liquidGlass) || {};
  			const blur = lgTex.blurAmount ?? 28;
  			const refraction = lgTex.refractionOpacity ?? 0.08;
  			const edgeGlow = lgTex.edgeHighlightOpacity ?? 0.5;
  			// Avoids floating-point noise (e.g. 0.08 - 0.01 = 0.06999999999999999)
  			// leaking into the generated CSS.
  			const r2 = (n) => Math.round(n * 100) / 100;
  			// Every element kept its original relative blur offset from the
  			// header's base value (12/16/26/32px were always header-28 ± N),
  			// just now computed from the tunable base instead of hardcoded —
  			// floored at 0 so an extreme low slider can't produce a negative
  			// blur() value.
  			const b = (delta) => Math.max(blur + delta, 0);
  			return `
  		@keyframes ata-premium-float {
  			0%, 100% { transform: translate(0, 0) scale(1); }
  			33% { transform: translate(40px, -30px) scale(1.08); }
  			66% { transform: translate(-30px, 25px) scale(0.94); }
  		}
  		/* Only the known Dashboard wrapper goes transparent — NOT body itself.
  		   Body-wide transparency was hiding real content (pipeline cards, empty
  		   states) on pages we haven't explicitly mapped, like Opportunities and
  		   Payments sub-tabs, because their content sat on top of nothing instead
  		   of GHL's normal page background. The orb layer is already a fixed,
  		   full-viewport element behind everything, so it still shows through on
  		   pages that are otherwise empty — this just stops it from swallowing
  		   pages that have real content we haven't styled yet. */
  		${SELECTORS.dashboardWrapper} { background: transparent !important; }
  
  		${SELECTORS.header} {
  			background: rgba(255,255,255,${r2(refraction - 0.01)}) !important;
  			backdrop-filter: blur(${blur}px) saturate(220%) contrast(110%) !important;
  			-webkit-backdrop-filter: blur(${blur}px) saturate(220%) contrast(110%) !important;
  			border-bottom: 1px solid rgba(255,255,255,0.2) !important;
  		}
  		${SELECTORS.sidebar} {
  			background: rgba(255,255,255,${refraction}) !important;
  			backdrop-filter: blur(${blur + 4}px) saturate(220%) contrast(110%) !important;
  			-webkit-backdrop-filter: blur(${blur + 4}px) saturate(220%) contrast(110%) !important;
  			border-right: 1px solid rgba(255,255,255,0.2) !important;
  			box-shadow: 10px 0 40px rgba(0,0,0,0.3) !important;
  			/* Sit above the dimming backdrop GHL shows behind the location-switcher
  			   popup, so the sidebar itself doesn't get greyed out with it. Best-effort
  			   z-index guess (common modal-backdrop convention) — not a confirmed
  			   selector, may need a real one if this doesn't fully hold. */
  			position: relative !important;
  			z-index: 1045 !important;
  		}
  		${SELECTORS.sidebarLinks} {
  			position: relative !important;
  			background: rgba(255,255,255,0.1) !important;
  			backdrop-filter: blur(${b(-16)}px) saturate(180%) !important;
  			border: 1px solid rgba(255,255,255,0.28) !important;
  			border-radius: ${navRadiusPx(t)}px !important;
  			color: #ffffff !important;
  			margin: 4px 18px 4px 10px !important;
  			padding: 10px 16px !important;
  			box-sizing: border-box !important;
  			box-shadow: inset 0 1px 0 rgba(255,255,255,${edgeGlow}), 0 4px 14px rgba(0,0,0,0.2) !important;
  			transition: all 0.3s cubic-bezier(0.4,0,0.2,1);
  		}
  		${SELECTORS.sidebarLinkText} { color: #ffffff !important; }
  		${SELECTORS.sidebarActive} {
  			background: rgba(255,255,255,0.24) !important;
  			border-color: rgba(255,255,255,${edgeGlow}) !important;
  			box-shadow: inset 0 1px 0 rgba(255,255,255,${r2(edgeGlow + 0.2)}), 0 6px 20px ${t.primary}66 !important;
  			transform: scale(1.02);
  		}
  		${SELECTORS.sidebarActiveText} { color: #ffffff !important; }
  		${SELECTORS.cardContent} {
  			background: rgba(255,255,255,0.1) !important;
  			backdrop-filter: blur(${b(-2)}px) saturate(200%) contrast(105%) !important;
  			-webkit-backdrop-filter: blur(${b(-2)}px) saturate(200%) contrast(105%) !important;
  			border: 1px solid rgba(255,255,255,0.28) !important;
  			border-radius: 24px !important;
  			overflow: hidden !important;
  			box-shadow: inset 0 1px 0 rgba(255,255,255,${edgeGlow}), 0 12px 40px ${t.secondary}44 !important;
  			color: #ffffff !important;
  		}
  		${SELECTORS.cardHeader} { background: rgba(255,255,255,${refraction}) !important; color: #ffffff !important; }
  		${SELECTORS.title} { color: #ffffff !important; text-shadow: 0 2px 10px rgba(0,0,0,0.35) !important; }
  		/* Plain color/shape/shadow only, same as every other movement's
  		   primaryButtons rule below (brutalist/clay/cyberpunk/etc.) — no
  		   position/overflow override and no ::after sheen pseudo-element, so
  		   this can no longer fight a native button's own layout the way it did
  		   before (that's what made the Edit Dashboard pencil button visually
  		   detach from its spot). */
  		${SELECTORS.primaryButtons} {
  			background: rgba(20,20,32,0.55) !important;
  			backdrop-filter: blur(${b(-12)}px) saturate(200%) !important;
  			border: 1px solid rgba(255,255,255,0.35) !important;
  			border-radius: 999px !important;
  			color: #ffffff !important;
  			box-shadow: inset 0 1px 0 rgba(255,255,255,${r2(edgeGlow / 2)}), 0 6px 20px ${t.primary}55 !important;
  		}
  		${SELECTORS.notificationBanner} { background: rgba(255,255,255,0.1) !important; backdrop-filter: blur(20px) !important; color: #ffffff !important; }
  		${SELECTORS.searchBar} { background: rgba(255,255,255,0.12) !important; backdrop-filter: blur(14px) !important; border-radius: 999px !important; color: #ffffff !important; border: 1px solid rgba(255,255,255,0.3) !important; }
  		${SELECTORS.locationSwitcher} { background: rgba(255,255,255,0.08) !important; color: #ffffff !important; }
  		${SELECTORS.avatarButton} { border-radius: 50% !important; border: 1px solid rgba(255,255,255,0.4) !important; }
  		${SELECTORS.accountMenu} { background: rgba(30,30,40,0.7) !important; backdrop-filter: blur(24px) !important; border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.25) !important; color: #ffffff !important; }
  		${SELECTORS.subNavTabs} { background: rgba(255,255,255,0.07) !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.genericButton} { border-radius: 999px !important; }
  		${SELECTORS.inputWrapper} { background: rgba(255,255,255,0.1) !important; backdrop-filter: blur(12px) !important; border-radius: 999px !important; }
  		${SELECTORS.emptyStateTitle} { color: #ffffff !important; font-weight: 600 !important; }
  		${SELECTORS.pipelineDropdown} { background: rgba(255,255,255,0.1) !important; backdrop-filter: blur(12px) !important; border-radius: 999px !important; border: 1px solid rgba(255,255,255,0.28) !important; }
  		#conversations-workspace, #conversations-content, #conversations-panel, #conversations-central-panel-viewer, #conversations-wrapper { background: transparent !important; }
  		${SELECTORS.conversationScrollArea} { background: rgba(255,255,255,0.05) !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.conversationListHeader} { background: rgba(255,255,255,0.06) !important; backdrop-filter: blur(16px) !important; color: #ffffff !important; font-weight: 600 !important; }
  		${SELECTORS.bulkCheckbox} { border-radius: 6px !important; border-color: rgba(255,255,255,0.4) !important; }
  		${SELECTORS.messageBubble} { border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.28) !important; background: rgba(255,255,255,0.1) !important; backdrop-filter: blur(20px) !important; color: #ffffff !important; }
  		${SELECTORS.composerFooter} { background: rgba(255,255,255,0.08) !important; backdrop-filter: blur(20px) !important; border-top: 1px solid rgba(255,255,255,0.2) !important; }
  		${SELECTORS.sendButton} { background: rgba(255,255,255,0.18) !important; backdrop-filter: blur(14px) !important; color: #ffffff !important; border-radius: 999px !important; }
  		${SELECTORS.contactSidePanel} { background: rgba(255,255,255,0.06) !important; backdrop-filter: blur(24px) !important; }
  		${SELECTORS.sidePanelTabs} { color: rgba(255,255,255,0.7) !important; font-weight: 500 !important; }
  		${SELECTORS.sidePanelTabActive} { color: #ffffff !important; border-bottom: 2px solid #ffffff !important; }
  		${SELECTORS.calendarToolbar} { background: rgba(255,255,255,0.06) !important; backdrop-filter: blur(20px) !important; }
  		#CalendarPage, .fc-view-harness { background: transparent !important; }
  		${SELECTORS.calendarGrid} { border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.25) !important; overflow: hidden !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.calendarHeaderCells} { background: rgba(255,255,255,0.08) !important; color: #ffffff !important; font-weight: 600 !important; }
  		${SELECTORS.calendarTodayColumn} { background: ${t.primary}22 !important; }
  		${SELECTORS.calendarNowLine} { border-color: ${t.accent} !important; }
  		${SELECTORS.calendarFilterDrawer} { background: rgba(30,30,40,0.7) !important; backdrop-filter: blur(24px) !important; border-left: 1px solid rgba(255,255,255,0.2) !important; }
  		#calendar-view-filter-drawer, #calendar-view-filter-drawer label, #calendar-view-filter-drawer p, #calendar-view-filter-drawer span,
  		#calendar-view-filter-drawer .n-radio-group .n-radio__label, #calendar-view-filter-drawer .n-radio-group label,
  		#calendar-view-filter-drawer div.n-radio__label { color: #ffffff !important; opacity: 1 !important; }
  		${SELECTORS.invoicePageHeader} { background: rgba(255,255,255,0.06) !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.invoicePageTitle} { color: #ffffff !important; font-weight: 600 !important; }
  		${SELECTORS.statTile} { border-radius: 20px !important; border: 1px solid rgba(255,255,255,0.25) !important; background: rgba(255,255,255,0.08) !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.dataTable} { border-radius: 20px !important; overflow: hidden !important; border: 1px solid rgba(255,255,255,0.25) !important; background: rgba(255,255,255,0.05) !important; backdrop-filter: blur(20px) !important; }
  		${SELECTORS.dataTableHeader} { background: rgba(255,255,255,0.1) !important; color: #ffffff !important; font-weight: 600 !important; }
  		${SELECTORS.dataTableCell} { color: #ffffff !important; }
  		${SELECTORS.statusTag} { font-weight: 600 !important; }
  		${SELECTORS.tableScrollbarRail} { background: rgba(255,255,255,0.08) !important; }
  		${SELECTORS.pagination} { border-radius: 999px !important; }
  		${SELECTORS.pageSizeSelect} { border-radius: 999px !important; }
  		* {
  			scrollbar-width: thin !important;
  			scrollbar-color: ${t.accent}aa rgba(255,255,255,0.08) !important;
  		}
  		*::-webkit-scrollbar { width: 10px !important; height: 10px !important; }
  		*::-webkit-scrollbar-track { background: rgba(255,255,255,0.06) !important; }
  		*::-webkit-scrollbar-thumb { background: ${t.accent}aa !important; border-radius: 999px !important; border: 2px solid transparent !important; background-clip: padding-box !important; }
  		*::-webkit-scrollbar-thumb:hover { background: ${t.accent} !important; border: 2px solid transparent !important; background-clip: padding-box !important; }
  	`;
  		},
  
  		skeuomorphic: (t) => {
  			// Defaults below match the literal values this generator used
  			// before texture became tunable — a theme with no texture data
  			// renders byte-identical to before, EXCEPT grainOpacity (see
  			// below — that one's a deliberate new addition, confirmed with
  			// the user, not a neutral default).
  			const skeuTex = (t.texture && t.texture.skeuomorphic) || {};
  			const gradientDepth = skeuTex.gradientDepth ?? 3;
  			const highlight = skeuTex.highlightOpacity ?? 0.6;
  			const grain = skeuTex.grainOpacity ?? 0.25;
  			const hi = (base) => Math.min(Math.max(base + (highlight - 0.6), 0), 1);
  			// SVG fractal-noise data URI — a cheap, dependency-free grain
  			// texture. Skeuomorphism is the "realistic material" movement
  			// and had zero grain/noise before this; this is the one
  			// meaningfully missing signature effect for it.
  			const grainImage = "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";
  			return `
  		${SELECTORS.header} { background: linear-gradient(180deg, ${t.primary}, ${t.secondary}) !important; box-shadow: inset 0 -${gradientDepth}px ${gradientDepth * 2}px rgba(0,0,0,0.35) !important; }
  		${SELECTORS.sidebar} { background: repeating-linear-gradient(90deg, ${t.primary}, ${t.primary} 6px, ${t.secondary} 6px, ${t.secondary} 12px) !important; box-shadow: inset -${gradientDepth * 2}px 0 ${gradientDepth * 4}px rgba(0,0,0,0.4) !important; }
  		${SELECTORS.sidebarLinks} { background: linear-gradient(180deg, ${t.accent}, ${t.bg}) !important; border-radius: ${navRadiusPx(t)}px !important; margin: 3px 16px 3px 8px !important; color: #2a2015 !important; font-weight: 600 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.35), inset 0 1px 1px rgba(255,255,255,${hi(0.5)}) !important; }
  		${SELECTORS.sidebarLinkText} { color: #2a2015 !important; }
  		${SELECTORS.sidebarActive} { background: linear-gradient(180deg, ${t.accent}, ${t.secondary}) !important; box-shadow: inset 0 2px 2px rgba(255,255,255,${hi(0.4)}), inset 0 -2px 3px rgba(0,0,0,0.4) !important; }
  		${SELECTORS.sidebarActiveText} { color: #fdf6e3 !important; }
  		${SELECTORS.cardContent} {
  			position: relative !important;
  			overflow: hidden !important;
  			background: linear-gradient(180deg, #ffffff, #f1f1f1) !important;
  			border-radius: 8px !important;
  			box-shadow: 0 6px 14px rgba(0,0,0,0.25), inset 0 1px 0 rgba(255,255,255,${hi(0.6)}) !important;
  			border: 1px solid rgba(0,0,0,0.15) !important;
  			color: #2a2015 !important;
  		}
  		${SELECTORS.cardContent}::after {
  			content: "" !important;
  			position: absolute !important;
  			inset: 0 !important;
  			background-image: ${grainImage} !important;
  			opacity: ${grain} !important;
  			mix-blend-mode: overlay !important;
  			pointer-events: none !important;
  		}
  		${SELECTORS.cardHeader} { background: linear-gradient(180deg, ${t.secondary}, ${t.primary}) !important; color: #fdf6e3 !important; font-weight: 600 !important; }
  		${SELECTORS.title} { color: ${t.secondary} !important; font-weight: 700 !important; text-shadow: 0 1px 0 rgba(255,255,255,0.5) !important; }
  		${SELECTORS.primaryButtons} { background: linear-gradient(180deg, ${t.accent}, ${t.secondary}) !important; border-radius: 6px !important; border: 1px solid rgba(0,0,0,0.4) !important; color: #fdf6e3 !important; box-shadow: 0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,${hi(0.4)}) !important; }
  		${SELECTORS.notificationBanner} { background: linear-gradient(180deg, ${t.accent}, ${t.bg}) !important; color: #2a2015 !important; box-shadow: inset 0 -2px 4px rgba(0,0,0,0.25) !important; }
  		${SELECTORS.searchBar} { background: linear-gradient(180deg, #ffffff, #eee) !important; border-radius: 6px !important; border: 1px solid rgba(0,0,0,0.2) !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.15) !important; }
  		${SELECTORS.locationSwitcher} { background: linear-gradient(180deg, ${t.primary}, ${t.secondary}) !important; color: #fdf6e3 !important; }
  		${SELECTORS.avatarButton} { border-radius: 50% !important; border: 2px solid rgba(0,0,0,0.3) !important; box-shadow: 0 2px 5px rgba(0,0,0,0.4) !important; }
  		${SELECTORS.accountMenu} { background: linear-gradient(180deg, #ffffff, #eee) !important; border-radius: 8px !important; box-shadow: 0 8px 20px rgba(0,0,0,0.3) !important; }
  		${SELECTORS.feedbackButton} { background: linear-gradient(180deg, ${t.accent}, ${t.secondary}) !important; color: #fdf6e3 !important; border-radius: 6px !important; box-shadow: 0 3px 6px rgba(0,0,0,0.4), inset 0 1px 1px rgba(255,255,255,0.4) !important; }
  		${SELECTORS.subNavTabs} { background: linear-gradient(180deg, ${t.primary}, ${t.secondary}) !important; }
  		${SELECTORS.genericButton} { border-radius: 6px !important; }
  		${SELECTORS.inputWrapper} { border-radius: 6px !important; box-shadow: inset 0 2px 4px rgba(0,0,0,0.2) !important; }
  		${SELECTORS.emptyStateTitle} { color: ${t.secondary} !important; font-weight: 700 !important; }
  		${SELECTORS.pipelineDropdown} { border-radius: 6px !important; border: 1px solid rgba(0,0,0,0.25) !important; box-shadow: inset 0 2px 3px rgba(0,0,0,0.15) !important; }
  		${SELECTORS.conversationScrollArea} { background: #f1f1f1 !important; }
  		${SELECTORS.conversationListHeader} { background: linear-gradient(180deg, #ffffff, #e8e8e8) !important; color: #2a2015 !important; font-weight: 600 !important; box-shadow: 0 2px 4px rgba(0,0,0,0.15) !important; }
  		${SELECTORS.bulkCheckbox} { border-radius: 4px !important; box-shadow: inset 0 1px 3px rgba(0,0,0,0.3) !important; }
  		${SELECTORS.messageBubble} { border-radius: 8px !important; background: linear-gradient(180deg, #ffffff, #f1f1f1) !important; border: 1px solid rgba(0,0,0,0.15) !important; box-shadow: 0 3px 8px rgba(0,0,0,0.2) !important; color: #2a2015 !important; }
  		${SELECTORS.composerFooter} { background: linear-gradient(180deg, #eee, #ffffff) !important; box-shadow: inset 0 3px 6px rgba(0,0,0,0.15) !important; }
  		${SELECTORS.sendButton} { background: linear-gradient(180deg, ${t.accent}, ${t.secondary}) !important; color: #fdf6e3 !important; border-radius: 6px !important; box-shadow: 0 3px 6px rgba(0,0,0,0.4) !important; }
  		${SELECTORS.contactSidePanel} { background: #f1f1f1 !important; }
  		${SELECTORS.sidePanelTabs} { color: #6b5b4a !important; font-weight: 600 !important; }
  		${SELECTORS.sidePanelTabActive} { color: ${t.secondary} !important; border-bottom: 2px solid ${t.secondary} !important; }
  		${SELECTORS.calendarToolbar} { background: linear-gradient(180deg, #ffffff, #eee) !important; }
  		${SELECTORS.calendarGrid} { border-radius: 8px !important; border: 1px solid rgba(0,0,0,0.2) !important; overflow: hidden !important; box-shadow: 0 6px 14px rgba(0,0,0,0.2) !important; }
  		${SELECTORS.calendarHeaderCells} { background: linear-gradient(180deg, ${t.primary}, ${t.secondary}) !important; color: #fdf6e3 !important; font-weight: 600 !important; }
  		${SELECTORS.calendarTodayColumn} { background: ${t.accent}33 !important; }
  		${SELECTORS.calendarNowLine} { border-color: ${t.secondary} !important; }
  		${SELECTORS.calendarFilterDrawer} { background: linear-gradient(180deg, #ffffff, #eee) !important; box-shadow: inset 4px 0 10px rgba(0,0,0,0.1) !important; }
  		${SELECTORS.invoicePageHeader} { background: linear-gradient(180deg, #ffffff, #eee) !important; }
  		${SELECTORS.invoicePageTitle} { color: ${t.secondary} !important; font-weight: 700 !important; }
  		${SELECTORS.statTile} { border-radius: 8px !important; border: 1px solid rgba(0,0,0,0.15) !important; background: linear-gradient(180deg, #ffffff, #f1f1f1) !important; box-shadow: 0 4px 10px rgba(0,0,0,0.2) !important; }
  		${SELECTORS.dataTable} { border-radius: 8px !important; overflow: hidden !important; border: 1px solid rgba(0,0,0,0.15) !important; box-shadow: 0 6px 14px rgba(0,0,0,0.2) !important; }
  		${SELECTORS.dataTableHeader} { background: linear-gradient(180deg, ${t.primary}, ${t.secondary}) !important; color: #fdf6e3 !important; font-weight: 600 !important; }
  		${SELECTORS.dataTableCell} { color: #2a2015 !important; }
  		${SELECTORS.statusTag} { font-weight: 600 !important; }
  		${SELECTORS.tableScrollbarRail} { background: #eee !important; }
  		${SELECTORS.pagination} { border-radius: 6px !important; }
  		${SELECTORS.pageSizeSelect} { border-radius: 6px !important; }
  	`;
  		},
  
  		neumorphic: (t) => `
  		${SELECTORS.header} { background: ${t.bg} !important; box-shadow: 0 4px 10px rgba(0,0,0,0.08) !important; }
  		${SELECTORS.sidebar} { background: ${t.bg} !important; }
  		${SELECTORS.sidebarLinks} { border-radius: ${navRadiusPx(t)}px !important; box-shadow: 5px 5px 10px rgba(0,0,0,0.12), -5px -5px 10px rgba(255,255,255,0.6) !important; margin-right: 18px !important; }
  		${SELECTORS.sidebarActive} { box-shadow: inset 4px 4px 8px rgba(0,0,0,0.15), inset -4px -4px 8px rgba(255,255,255,0.5) !important; color: ${t.accent} !important; }
  		${SELECTORS.cardContent} { background: ${t.bg} !important; border-radius: 20px !important; box-shadow: 8px 8px 16px rgba(0,0,0,0.10), -8px -8px 16px rgba(255,255,255,0.7) !important; border: none !important; }
  		${SELECTORS.primaryButtons} { background: ${t.bg} !important; color: ${t.accent} !important; border-radius: 14px !important; border: none !important; box-shadow: 6px 6px 12px rgba(0,0,0,0.12), -6px -6px 12px rgba(255,255,255,0.6) !important; }
  	`,
  
  		cyberpunk: (t) => `
  		${SELECTORS.header} { background: ${t.bg} !important; border-bottom: 2px solid ${t.primary} !important; box-shadow: 0 0 20px ${t.primary}77 !important; }
  		${SELECTORS.sidebar} { background: ${t.bg} !important; border-right: 2px solid ${t.secondary} !important; }
  		${SELECTORS.sidebarLinks} { border-radius: ${navRadiusPx(t)}px !important; font-family: 'Courier New', monospace !important; margin-right: 18px !important; }
  		${SELECTORS.sidebarActive} { border: 1px solid ${t.primary} !important; color: ${t.primary} !important; text-shadow: 0 0 8px ${t.primary} !important; box-shadow: 0 0 12px ${t.primary}55 !important; background: rgba(255,255,255,0.03) !important; }
  		${SELECTORS.cardContent} { background: #0a0a0f !important; border: 1px solid ${t.secondary}88 !important; border-radius: 8px !important; box-shadow: 0 0 18px ${t.secondary}44 !important; color: #e2e8f0 !important; }
  		${SELECTORS.primaryButtons} { background: ${t.primary} !important; color: #000000 !important; border: 2px solid ${t.primary} !important; border-radius: 4px !important; text-shadow: 0 0 6px ${t.primary} !important; box-shadow: 0 0 14px ${t.primary}66 !important; text-transform: uppercase !important; font-weight: 700 !important; }
  	`,
  
  		vaporwave: (t) => `
  		${SELECTORS.header} { background: linear-gradient(90deg, ${t.bg}, ${t.primary}, ${t.secondary}) !important; }
  		${SELECTORS.sidebar} { background: linear-gradient(180deg, ${t.bg}, ${t.primary}44) !important; }
  		${SELECTORS.sidebarLinks} { border-radius: ${navRadiusPx(t)}px !important; border: 1px solid ${t.accent}55 !important; margin-right: 18px !important; }
  		${SELECTORS.sidebarActive} { background: ${t.secondary} !important; color: #fff !important; box-shadow: 2px 2px 0 ${t.accent} !important; }
  		${SELECTORS.cardContent} { background: ${t.bg} !important; border: 1px solid ${t.accent}66 !important; border-radius: 4px !important; box-shadow: 0 0 20px ${t.primary}44 !important; color: #fff !important; }
  		${SELECTORS.primaryButtons} { background: linear-gradient(90deg, ${t.primary}, ${t.secondary}) !important; color: #fff !important; border-radius: 4px !important; border: 1px solid ${t.accent} !important; text-shadow: 1px 1px 0 ${t.secondary} !important; }
  	`,
  
  		artdeco: (t) => `
  		${SELECTORS.header} { background: ${t.bg} !important; border-bottom: 2px solid ${t.primary} !important; }
  		${SELECTORS.sidebar} { background: ${t.bg} !important; border-right: 2px solid ${t.primary} !important; }
  		${SELECTORS.sidebarLinks} { border-radius: ${navRadiusPx(t)}px !important; border: 1px solid ${t.primary}55 !important; letter-spacing: 0.08em !important; text-transform: uppercase !important; font-size: 12px !important; margin-right: 18px !important; }
  		${SELECTORS.sidebarActive} { background: ${t.primary} !important; color: ${t.bg} !important; }
  		${SELECTORS.cardContent} { background: ${t.bg} !important; border: 1px solid ${t.primary} !important; border-radius: 0 !important; color: ${t.accent} !important; }
  		${SELECTORS.cardHeader} { background: ${t.bg} !important; border-bottom: 1px solid ${t.primary} !important; color: ${t.accent} !important; letter-spacing: 0.1em !important; text-transform: uppercase !important; }
  		${SELECTORS.primaryButtons} { background: ${t.bg} !important; color: ${t.primary} !important; border: 1px solid ${t.primary} !important; border-radius: 0 !important; letter-spacing: 0.1em !important; text-transform: uppercase !important; }
  	`,
  
  		// Dark Mode — the one movement whose whole point is a genuinely dark page
  		// canvas, not just dark decorative chrome. Every other movement here
  		// deliberately leaves `body`/dashboardWrapper untouched (interfaceColors
  		// keeps their actual page surface light for readability — see
  		// buildPremiumBgLayer's comment), so this is the only generator that
  		// sets it. No orb layer (BG_LAYER_STYLE has no "darkMode" entry, so
  		// applyPremiumTheme's dispatch calls clearPremiumBgLayer for it) — the
  		// flat `t.bg` fill here is the entire canvas, nothing needed behind it.
  		darkMode: (t) => `
  		body, ${SELECTORS.dashboardWrapper} { background: ${t.bg} !important; }
  		${SELECTORS.header} { background: ${t.bg} !important; border-bottom: 1px solid ${t.border || "#ffffff1a"} !important; }
  		${SELECTORS.sidebar} { background: ${t.secondary} !important; border-right: 1px solid ${t.border || "#ffffff1a"} !important; }
  		${SELECTORS.sidebarLinks} { border-radius: ${navRadiusPx(t)}px !important; margin-right: 18px !important; }
  		${SELECTORS.sidebarActive} { background: ${t.primary}26 !important; color: ${t.primary} !important; }
  		${SELECTORS.cardContent} { background: ${t.secondary} !important; border: 1px solid ${t.border || "#ffffff1a"} !important; border-radius: 12px !important; box-shadow: 0 8px 20px rgba(0,0,0,0.35) !important; color: ${t.text || "#e2e8f0"} !important; }
  		${SELECTORS.cardHeader} { background: ${t.secondary} !important; border-bottom: 1px solid ${t.border || "#ffffff1a"} !important; color: ${t.text || "#e2e8f0"} !important; }
  		${SELECTORS.primaryButtons} { background: ${t.primary} !important; color: #ffffff !important; border-radius: 8px !important; border: none !important; }
  	`,
  	};
  
  	// Every field here is an explicit, individually-authored color from the
  	// superadmin Customizer (Global & Shared tab or one of the per-page
  	// tabs — Sidebar & Nav, Dashboard, Conversations, Calendars, Contacts,
  	// Opportunities, Payments). Appended after movementCss in
  	// buildPremiumCss, so on equal specificity these `!important` rules win
  	// the cascade by source order — individual customization always takes
  	// priority over the movement's brand-color-derived default for that
  	// same selector, including selectors a movement already styles (e.g.
  	// cardContentBg's `.hl-card-content`) and including Glass/Liquid Glass,
  	// where a set page color replaces that movement's translucent panel
  	// with a solid one (accepted tradeoff — explicit color choice wins).
  	// (dashboardWidgetHeaderBg and sidePanelTabActiveText stay removed —
  	// their selectors, .hr-card-header and .hr-tabs-tab--active, are pure
  	// duplicates of cardHeaderBg / sidePanelTabActive below.)
  	const INTERFACE_COLOR_OVERLAY = [
  		{ key: "headerIcon", selector: "#hl_header--help", prop: "color" },
  		{ key: "primaryButtonBg", selector: "#custom-dialer-button", prop: "background" },
  		// Generic Naive-UI primary button (no id) used as the "Update"/"Save"
  		// CTA at the bottom of many settings forms — confirmed via a live
  		// DOM dump on Settings > Company. Broad on purpose, matching the
  		// user's intent for a global/shared fix rather than a per-page one.
  		{ key: "updateButtonBg", selector: ".n-button.n-button--primary-type", prop: "background" },
  		// "Upload"-style secondary CTAs (e.g. the Business Logo upload
  		// button) are a different Naive-UI variant — ".n-button--default-type"
  		// with a hardcoded "text-blue-500" utility class instead of a filled
  		// background. Reused the same field for the text color rather than a
  		// separate one, since it's the same "on-theme accent button" concept
  		// with a different visual treatment.
  		{ key: "updateButtonBg", selector: "button.text-blue-500", prop: "color" },
  		// The sidebar's own "Go Back" button (confirmed present with this id
  		// on both agency and location settings pages via a live DOM dump).
  		{ key: "sidebarGoBackBg", selector: "#backButtonv2", prop: "background" },
  		// Confirmed via a live DOM dump across Conversations/Calendars/
  		// Contacts/Opportunities/Payments: every page's top sub-nav bar
  		// (".topmenu-nav") marks its selected tab with the identical
  		// "topmenu-navitem active" pair (same on sub-dropdown items too,
  		// e.g. Payments' "All Invoices" — just "active" there, no
  		// "topmenu-navitem"), all hardcoded to the same blue
  		// (rgb(56, 160, 219)) everywhere. One rule fixes every page's active
  		// tab at once instead of a per-page field.
  		{ key: "activeTabAccent", selector: ".topmenu-nav .topmenu-navitem.active, .topmenu-nav .active", prop: "color" },
  		{ key: "activeTabAccent", selector: ".topmenu-nav .topmenu-navitem.active", prop: "border-bottom-color" },
  		// Global & Shared — these selectors ARE movement-owned (every
  		// movement's cardContent/cardHeader/title/statTile/dataTable rules
  		// above set the same properties); listed after movementCss so the
  		// explicit color wins.
  		{ key: "cardHeaderBg", selector: SELECTORS.cardHeader, prop: "background" },
  		{ key: "cardContentBg", selector: SELECTORS.cardContent, prop: "background" },
  		{ key: "inputBg", selector: ".n-input", prop: "background" },
  		{ key: "titleText", selector: SELECTORS.title, prop: "color" },
  		{ key: "tableBorderColor", selector: SELECTORS.dataTable, prop: "border-color" },
  		{ key: "statTileBg", selector: SELECTORS.statTile, prop: "background" },
  		{ key: "statTileBorder", selector: SELECTORS.statTile, prop: "border-color" },
  		{ key: "statTileValueText", selector: ".ui-statistic .ui-display-sm-semibold", prop: "color" },
  		{ key: "statTileLabelText", selector: ".ui-statistic-header .ui-text-sm-medium", prop: "color" },
  		// Dashboard — dashboardEditModeBg shares its selector with
  		// SELECTORS.primaryButtons (movement-owned).
  		{ key: "dashboardEditModeBg", selector: "#location-dashboard_btn--edit-dashboard", prop: "background" },
  		// Calendars — both movement-owned (calendarGrid/calendarTodayColumn
  		// are styled by several movement generators above).
  		{ key: "calendarGridBg", selector: SELECTORS.calendarGrid, prop: "background" },
  		{ key: "calendarTodayAccent", selector: SELECTORS.calendarTodayColumn, prop: "background" },
  		// Reused (not a separate field) for the active/today day column's own
  		// header text ("15 Tue"), which FullCalendar colors blue by default
  		// via ".fc-col-header-cell-cushion" nested inside ".fc-day-today" —
  		// confirmed via a live DOM dump (today: rgb(21,94,239) vs every other
  		// day's gray). Same "today" accent idea, just the text instead of
  		// the column background.
  		{ key: "calendarTodayAccent", selector: `${SELECTORS.calendarTodayColumn} .fc-col-header-cell-cushion`, prop: "color" },
  		{ key: "avatarFallbackBg", selector: ".contact.my-tooltip, .avatar_img", prop: "background" },
  		{ key: "locationSwitcherBg", selector: "#location-switcher-sidbar-v2", prop: "background" },
  		{
  			key: "locationSwitcherText",
  			// ".hl_text-overflow" is the label once a sub-account is selected;
  			// ".hl_location-text" is the "Click here to switch" label shown at
  			// the agency level before any sub-account is chosen (confirmed via
  			// a live DOM dump on /settings/profile) — both need the override.
  			selector: "#location-switcher-sidbar-v2 .hl_text-overflow, #location-switcher-sidbar-v2 .hl_location-text",
  			prop: "color",
  		},
  		{ key: "quickActionsIcon", selector: "#quickActions, #globalSearchOpener", prop: "background" },
  		{ key: "sidebarSectionLabelBg", selector: SELECTORS.sidebarSectionLabel, prop: "background" },
  		{ key: "sidebarSectionLabelText", selector: SELECTORS.sidebarSectionLabel, prop: "color" },
  		{ key: "dashboardDateRangeBg", selector: "#reporting_common_datepicker-btn-trigger", prop: "background" },
  		{ key: "conversationsListBg", selector: "#conversations-list", prop: "background" },
  		{ key: "composerInputBg", selector: "#conv-composer-inline-expand-trigger", prop: "background" },
  		{ key: "threadHeaderBg", selector: "#conv-mail-thread-header", prop: "background" },
  		{ key: "dateSeparatorBg", selector: "#date-label-CONV_START_DATE", prop: "background" },
  		{ key: "calendarToolbarBg", selector: "nav.bg-white.border-b", prop: "background" },
  		{ key: "calendarViewSelectBg", selector: "#view-select", prop: "background" },
  		// The calendar-type selector ("Meetings"/"Services") — confirmed via
  		// a live DOM dump that its selected label defaults to GHL's hardcoded
  		// blue ("rgb(0, 78, 235)") via this Naive-UI selection-input span.
  		{ key: "calendarTypeSelectorText", selector: "#industry-select .n-base-selection-input__content", prop: "color" },
  		// The open dropdown's option list is a SEPARATE popup teleported to
  		// <body> by Naive-UI (no id, and no back-reference to "industry-select"
  		// in its own markup — confirmed via a live DOM dump), so it can't be
  		// scoped to just this one selector; ".n-base-select-option--selected"
  		// is the generic "selected option in any n-select" class, meaning
  		// this reused value will also color the selected row of any other
  		// Naive-UI dropdown elsewhere in the app that shares this component.
  		// Only the selected/checked row is targeted — unselected options keep
  		// their own neutral color, matching how the closed trigger behaves.
  		{ key: "calendarTypeSelectorText", selector: ".n-base-select-option--selected .n-base-select-option__content p", prop: "color" },
  		// One accent color across three unrelated GHL/Naive-UI pieces in the
  		// "Manage view" filter panel — confirmed via a live DOM dump that all
  		// three independently hardcode a very similar blue:
  		// "#customizations-button" (the "Manage view" toggle, text + border),
  		// the checked radio's own fill ("#all > input.n-radio-input" — using
  		// ":checked" instead of the fixed "#all" id so it still works once a
  		// different option, e.g. Appointments, is selected instead), and
  		// every "See more" expandable-list link (id prefixed
  		// "see-more-button-", one per section — Users/Calendars/Groups).
  		{ key: "calendarManageViewAccent", selector: "#customizations-button", prop: "color" },
  		{ key: "calendarManageViewAccent", selector: "#customizations-button", prop: "border-color" },
  		{ key: "calendarManageViewAccent", selector: "input.n-radio-input:checked", prop: "background" },
  		{ key: "calendarManageViewAccent", selector: '[id^="see-more-button-"] .text-primary-700', prop: "color" },
  		{ key: "calendarNowLineColor", selector: ".fc-timegrid-now-indicator-line", prop: "border-color" },
  		{ key: "calendarFilterDrawerBg", selector: "#calendar-view-filter-drawer", prop: "background" },
  		{ key: "paymentsAlertBannerBg", selector: "#payment-integration-alert", prop: "background" },
  		{ key: "paymentsTableBg", selector: "#invoice_listing .ui-table-container__wrapper", prop: "background" },
  		{ key: "contactsCountBadgeBg", selector: ".pipeline-ribbon .count", prop: "background" },
  		{ key: "contactsCountBadgeText", selector: ".pipeline-ribbon .count", prop: "color" },
  		// Was defined in interfaceColors/DEFAULT_INTERFACE_COLORS long before
  		// this selector was ever confirmed — never actually wired to a rule
  		// here or exposed in GHL_ELEMENTS, so it had zero effect on any
  		// theme. Now activated with the real selector, confirmed via a live
  		// DOM dump of actual tag chips ("lead e-mail", "en relance", …).
  		{ key: "contactsTagPillBg", selector: "#table-container .tabulator-cell.no-padding > div > div", prop: "background" },
  		{ key: "contactsBulkToolbarBg", selector: ".bulk-actions .bulk-action.d-flex", prop: "background" },
  		{ key: "contactsImportButtonAccent", selector: "#import-btn", prop: "color" },
  		{ key: "contactsImportButtonAccent", selector: "#import-btn", prop: "border-color" },
  		{ key: "contactsAddButtonBg", selector: "#add-record-btn", prop: "background" },
  		// "border-color" set on the button itself (two rules above) never
  		// reaches its visible border at all — that's actually painted by a
  		// separate absolutely-positioned "div.hr-button__border" overlay
  		// (plus "div.hr-button__state-border" for the hover/focus/active
  		// ring), and border-color is not an inherited CSS property, so
  		// nothing here was ever going to cascade down to them. Confirmed via
  		// a live element walk: both were still blue even at rest, not just
  		// on hover. Targeted directly now, for both the resting state and
  		// every interactive state.
  		{
  			key: "contactsImportButtonAccent",
  			selector:
  				"#import-btn .hr-button__border, #import-btn .hr-button__state-border, " +
  				"#import-btn:hover .hr-button__border, #import-btn:hover .hr-button__state-border, " +
  				"#import-btn:active .hr-button__border, #import-btn:active .hr-button__state-border, " +
  				"#import-btn:focus .hr-button__border, #import-btn:focus .hr-button__state-border",
  			prop: "border-color",
  		},
  		{
  			key: "contactsAddButtonBg",
  			selector:
  				"#add-record-btn .hr-button__border, #add-record-btn .hr-button__state-border, " +
  				"#add-record-btn:hover .hr-button__border, #add-record-btn:hover .hr-button__state-border, " +
  				"#add-record-btn:active .hr-button__border, #add-record-btn:active .hr-button__state-border, " +
  				"#add-record-btn:focus .hr-button__border, #add-record-btn:focus .hr-button__state-border",
  			prop: "border-color",
  		},
  		// GHL's own hr-button component reverts to its hardcoded blue on
  		// hover via several component-scoped rules reading CSS vars like
  		// "--n-color-hover"/"--n-border-hover" — confirmed via a live
  		// stylesheet scan that some of those carry "!important" themselves.
  		// Rather than chase which exact one wins, these target ":hover"
  		// directly: an id + ":hover" selector's specificity beats any of
  		// GHL's class-based hover rules regardless of their own importance.
  		// Widened to ":active"/":focus" too, not just ":hover" — a user
  		// report of the color still flashing blue on this button pointed at
  		// more than one interaction state (click/press, not just mouse-over),
  		// so every state GHL might restyle is covered up front instead of
  		// diagnosing them one at a time.
  		{ key: "contactsImportButtonAccent", selector: "#import-btn:hover, #import-btn:active, #import-btn:focus", prop: "color" },
  		{ key: "contactsImportButtonAccent", selector: "#import-btn:hover, #import-btn:active, #import-btn:focus", prop: "border-color" },
  		{ key: "contactsAddButtonBg", selector: "#add-record-btn:hover, #add-record-btn:active, #add-record-btn:focus", prop: "background" },
  		{ key: "oppStageColumnBg", selector: ".crm-opportunities-stage", prop: "background" },
  		{ key: "oppCardBg", selector: ".crm-opportunities-card-fields", prop: "background" },
  		{ key: "oppCardWonBg", selector: ".won-card-bg", prop: "background" },
  		{ key: "oppStageHeaderText", selector: '[id^="data-stage-name-"]', prop: "color" },
  		{ key: "oppCardValueText", selector: "#monetaryValue span.truncate.hr-ellipsis span", prop: "color" },
  		{ key: "oppPipelineSwitcherBg", selector: "#pipelineDropdDown-listview", prop: "background" },
  		// "Advanced filters" has no id (deeply nested, only a stable
  		// ".advanced-container" ancestor class); "Sort" is "#field-selection".
  		// Both are the same hr-button family as Contacts' Import/Add button,
  		// so they get the identical ":hover" treatment up front this time —
  		// GHL's own hover rules revert them to blue otherwise (see the
  		// contactsImportButtonAccent/contactsAddButtonBg comments below for
  		// the confirmed mechanism).
  		{ key: "oppFilterBarAccent", selector: ".advanced-container button, #field-selection", prop: "color" },
  		{ key: "oppFilterBarAccent", selector: ".advanced-container button, #field-selection", prop: "border-color" },
  		{
  			key: "oppFilterBarAccent",
  			selector: ".advanced-container button:hover, #field-selection:hover, .advanced-container button:active, #field-selection:active, .advanced-container button:focus, #field-selection:focus",
  			prop: "color",
  		},
  		{
  			key: "oppFilterBarAccent",
  			selector: ".advanced-container button:hover, #field-selection:hover, .advanced-container button:active, #field-selection:active, .advanced-container button:focus, #field-selection:focus",
  			prop: "border-color",
  		},
  		// "Advanced filters" text/icon actually live in a separate nested
  		// div ("#list-view-advance-filter-btn.active", inside the <button>
  		// but with its own hardcoded blue independent of it) — confirmed via
  		// a live element walk; the outer button's own color/border alone
  		// never reached it. Setting color here cascades to its icon (svg
  		// stroke="currentColor") and label span through normal inheritance.
  		{ key: "oppFilterBarAccent", selector: "#list-view-advance-filter-btn", prop: "color" },
  		// Same nested-border gap as Contacts' Import/Add Contact buttons —
  		// "#field-selection" (Sort) is the same hr-button component, so its
  		// visible border is likely also painted by a separate
  		// ".hr-button__border"/".hr-button__state-border" div rather than
  		// the button's own border-color. Closed preemptively here too.
  		{
  			key: "oppFilterBarAccent",
  			selector:
  				"#field-selection .hr-button__border, #field-selection .hr-button__state-border, " +
  				"#field-selection:hover .hr-button__border, #field-selection:hover .hr-button__state-border, " +
  				"#field-selection:active .hr-button__border, #field-selection:active .hr-button__state-border, " +
  				"#field-selection:focus .hr-button__border, #field-selection:focus .hr-button__state-border",
  			prop: "border-color",
  		},
  		// ".tabulator-col" carries its own explicit background (confirmed via
  		// a live diagnostic on the Contacts list: computed rgb(249,250,251),
  		// unaffected by the ".tabulator-header" rule alone) that sits on top
  		// of and hides whatever ".tabulator-header" is painted — added here
  		// so this field actually reaches every Tabulator table's header, not
  		// just tables where the column cells happen to stay transparent.
  		{ key: "tableHeaderBg", selector: ".tabulator-header, .tabulator-col", prop: "background" },
  		{ key: "dashboardAddWidgetBg", selector: "#location-dashboard_btn--add-widget", prop: "background" },
  		{ key: "dashboardEmptyStateIconBg", selector: ".hr-empty__header .hr-icon-wrapper", prop: "background" },
  		{ key: "channelIconTint", selector: "#conv-provider-select-trigger svg.text-primary-600", prop: "color" },
  		{ key: "composerSendButtonBg", selector: "#conv-send-button-simple", prop: "background" },
  		// The send control is actually three pieces inside one pill wrapper
  		// ("div.bg-primary-600.rounded-md.overflow-hidden", no id): the send
  		// button itself, a 1px divider, and "#conv-send-options-dropdown-arrow"
  		// (the chevron) — confirmed via a live DOM dump that only the send
  		// button paints its own opaque background; the divider and chevron are
  		// both transparent, so without this the wrapper's own blue keeps
  		// showing straight through on their portion of the pill.
  		{ key: "composerSendButtonBg", selector: "#conv-composer-footer .bg-primary-600.rounded-md.overflow-hidden", prop: "background" },
  		{ key: "newChatButtonBg", selector: "#new-conversation-btn-collapsed, #new-conversation-btn", prop: "background" },
  		// Naive-UI button: its border color is driven by its own
  		// "--n-border: 1px solid var(--primary-600)" custom property,
  		// independent of the background. Confirmed via a live diagnostic that
  		// this button's actual border-width is currently 0 (GHL defines the
  		// --n-border var but never consumes it in a real "border:" rule here),
  		// so this has no visible effect today — kept anyway in case that
  		// changes, since it costs nothing and is correct either way.
  		{ key: "newChatButtonBg", selector: "#new-conversation-btn-collapsed, #new-conversation-btn", prop: "border-color" },
  		// Same structural gap found on the Import/Add Contact buttons: the
  		// visible border is actually painted by separate nested
  		// ".hr-button__border"/".hr-button__state-border" divs, unreachable
  		// by border-color on the button itself since that property isn't
  		// inherited. Applied preemptively here too, same component family.
  		{
  			key: "newChatButtonBg",
  			selector:
  				"#new-conversation-btn-collapsed .hr-button__border, #new-conversation-btn .hr-button__border, " +
  				"#new-conversation-btn-collapsed .hr-button__state-border, #new-conversation-btn .hr-button__state-border",
  			prop: "border-color",
  		},
  		// The ring the user actually sees is the focus outline
  		// ("--n-outline-focus: 4px solid var(--primary-100)", confirmed via
  		// a live diagnostic) — a different CSS property (outline, not
  		// border). Scoping this to ":focus" wasn't enough (GHL may gate it
  		// on ":focus-visible" or something similar instead), so it's set
  		// unconditionally here rather than guessing the exact pseudo-class —
  		// harmless when no outline is showing, and catches every state that
  		// does trigger one. Only recolors it; width/style still come from
  		// the var's shorthand wherever GHL applies it.
  		{ key: "newChatButtonBg", selector: "#new-conversation-btn-collapsed, #new-conversation-btn", prop: "outline-color" },
  		// The "active" state of these icons is the "text-blue-600" utility
  		// class GHL swaps onto the clicked one (confirmed via a live click
  		// watcher: inactive icons carry "text-gray-900" instead) — color is
  		// set here rather than on ".sidebar-option-button" generally so the
  		// inactive icons keep their own gray, only the selected one recolors.
  		// Also covers ":hover" — GHL's own inactive-icon markup carries a
  		// literal "hover:text-blue-600" utility class, which is its own
  		// :hover rule with normal specificity and isn't reachable via the
  		// ".text-blue-600" selector above (that only matches the persistent
  		// class GHL adds to the truly-selected icon) — without this, hovering
  		// any inactive icon falls back to GHL's hardcoded blue instead of
  		// the theme's color.
  		{
  			key: "contactDetailActiveIconColor",
  			// Reused (deliberately not a separate field) for the My Inbox /
  			// Team Inbox / Internal Chat toggle icons above the conversation
  			// list — same "recolor only the selected one" idea, just a
  			// different active marker: confirmed via a live class dump that
  			// GHL adds "active" to the icon's *grandparent* ".menu-item-container"
  			// (not the icon itself), with no equivalent hover-only utility class
  			// there, so no ":hover" variant is needed for this one.
  			selector:
  				"#contacts-highrise-right-side-bar-wrapper .sidebar-option-button.text-blue-600, " +
  				"#contacts-highrise-right-side-bar-wrapper .sidebar-option-button:hover, " +
  				"#conversations-layout .menu-item-container.active .hr-icon-inner",
  			prop: "color",
  		},
  		// Same value again, but for the highlight box's own border around the
  		// active My Inbox / Team Inbox / Internal Chat icon (the ".active"
  		// wrapper itself, not the icon inside it) — so the box border always
  		// matches the icon color it's framing instead of GHL's default blue.
  		{ key: "contactDetailActiveIconColor", selector: "#conversations-layout .menu-item-container.active", prop: "border-color" },
  		// Attribute-prefix selector on purpose: each channel row's id carries
  		// the channel's own id ("conv-channel-bar-option-email",
  		// "conv-channel-bar-option-<inbox-id>", …), which varies per company
  		// and isn't enumerable — this covers every row generically instead of
  		// hardcoding one company's channel ids. Confirmed via a live DOM dump
  		// with the dropdown open.
  		{ key: "channelDropdownOptionText", selector: '[id^="conv-channel-bar-option-"] .text-sm.font-medium.truncate.min-w-0', prop: "color" },
  		// The closed trigger pill (showing the currently selected channel,
  		// e.g. "SMS") has its own separate label span — not one of the
  		// dropdown list rows above, and never wired until now even though
  		// it was spotted earlier. Reuses the same value so the collapsed
  		// pill and the open list always match.
  		{ key: "channelDropdownOptionText", selector: "#conv-channel-bar-provider-trigger span", prop: "color" },
  		{ key: "sidePanelBg", selector: ".bg-contacts-panel", prop: "background" },
  		{ key: "dashboardWidgetBg", selector: ".hr-card", prop: "background" },
  		{ key: "dashboardWidgetBorder", selector: ".hr-card", prop: "border-color" },
  		{ key: "dashboardEmptyStateText", selector: "p.hr-text.hr-text-lg", prop: "color" },
  		{ key: "conversationsUnreadIndicatorBg", selector: "div.text-\\[12px\\].text-white", prop: "background" },
  		// Reused (not a separate field) for the unread-count badge on the
  		// "Unread" tab itself, above the conversation list — same color as
  		// the per-conversation unread dots, just a different element
  		// (".bg-blue-600" inside the stable ".conversation-list-header"
  		// wrapper, confirmed via a live DOM dump) since it's GHL's own
  		// hardcoded blue, not sharing a class with the per-row indicator.
  		{ key: "conversationsUnreadIndicatorBg", selector: ".conversation-list-header .bg-blue-600", prop: "background" },
  		// Reused again for the active-tab underline itself (the "Unread" tab's
  		// own bottom border, class "border-b-blue-600" — confirmed in the same
  		// DOM dump as the badge above) so the underline and the badge it sits
  		// under always match.
  		{ key: "conversationsUnreadIndicatorBg", selector: ".conversation-list-header button.border-b-blue-600", prop: "border-bottom-color" },
  		{ key: "conversationsTimestampText", selector: "span.text-\\[12px\\].text-gray-500", prop: "color" },
  		{ key: "contactsDetailCustomFieldBg", selector: ".hr-collapse-item__header", prop: "background" },
  		{ key: "oppCardAvatarBg", selector: ".hr-avatar.ui-avatar__default", prop: "background" },
  	];
  
  	// Runs for every movement uniformly, appended after the movement's own
  	// CSS. Only ever emits a rule for a field that actually has a value —
  	// a theme saved before interfaceColors existed (or with these specific
  	// fields left blank) produces no output here at all, so it can't
  	// change anything for any theme that isn't explicitly using this data.
  	function buildInterfaceColorOverlay(theme) {
  		const colors = theme.interfaceColors || {};
  		const rules = INTERFACE_COLOR_OVERLAY
  			.filter((entry) => typeof colors[entry.key] === "string" && colors[entry.key].trim() !== "")
  			.map((entry) => `${entry.selector} { ${entry.prop}: ${colors[entry.key]} !important; }`);
  		return rules.join("\n");
  	}
  
  	// GHL fades the composer Send button to 50% opacity while the message
  	// box is empty (its own "nothing to send yet" affordance) — harmless
  	// normally, but it makes a deliberately-chosen composerSendButtonBg read
  	// as washed-out/off-color rather than the actual color picked in the
  	// editor. Forces full opacity so the button always shows the true
  	// theme color; gated on composerSendButtonBg being set, same as every
  	// other interface-color rule, so it changes nothing for a theme that
  	// never touched this field.
  	function buildComposerSendButtonOpacityFix(theme) {
  		const colors = theme.interfaceColors || {};
  		if (typeof colors.composerSendButtonBg !== "string" || colors.composerSendButtonBg.trim() === "") return "";
  		return `#conv-send-button-simple { opacity: 1 !important; }`;
  	}
  
  	// The calendar-type selector's (#industry-select) hover/focus/active
  	// border and focus glow aren't a plain "border-color" — Naive-UI reads
  	// them from its own CSS custom properties ("--n-border-hover",
  	// "--n-border-focus", "--n-border-active", "--n-box-shadow-focus"),
  	// which GHL pins to blue with "!important" on ".n-base-selection"
  	// (confirmed via a live diagnostic). Those carry multi-part values
  	// ("1px solid <color>"), so INTERFACE_COLOR_OVERLAY's plain
  	// "prop: value" substitution can't express them — redefining the same
  	// custom properties here instead, reusing calendarTypeSelectorText
  	// rather than adding a separate field, same color as the dropdown's own
  	// text. Our selector is ID-scoped ("#industry-select .n-base-selection"),
  	// so it's more specific than GHL's class-only rule and wins even though
  	// both use "!important".
  	function buildCalendarTypeSelectorBorderFix(theme) {
  		const colors = theme.interfaceColors || {};
  		const color = colors.calendarTypeSelectorText;
  		if (typeof color !== "string" || color.trim() === "") return "";
  		return `
  			#industry-select .n-base-selection {
  				--n-border-hover: 1px solid ${color} !important;
  				--n-border-focus: 1px solid ${color} !important;
  				--n-border-active: ${color} !important;
  				--n-box-shadow-focus: 0 0 0 2px ${color}33 !important;
  			}
  		`;
  	}
  
  	// A few selectors have a FIXED text color hardcoded directly in one or
  	// more MOVEMENT_CSS generators (assuming that movement's own hardcoded
  	// background stays put) — cardHeader/cardContent (light text on every
  	// movement that styles them) and the Liquid Glass calendar filter drawer
  	// (hardcoded white text on its labels). Once cardHeaderBg/cardContentBg/
  	// calendarFilterDrawerBg are overridden via interfaceColors above, that
  	// fixed text can land on the wrong side of light-vs-dark. Rather than
  	// leaving those backgrounds dark to dodge the clash (which defeats the
  	// point of overriding them at all), this reads the ACTUAL resolved
  	// background's luminance and picks a readable text color — self-adjusting
  	// per theme, so it keeps working for any theme authored later in
  	// superadmin too, not just today's 10.
  	const TEXT_SAFETY_TARGETS = [
  		{ bgKey: "cardHeaderBg", selectors: [SELECTORS.cardHeader] },
  		{ bgKey: "cardContentBg", selectors: [SELECTORS.cardContent] },
  		{
  			bgKey: "calendarFilterDrawerBg",
  			selectors: [
  				SELECTORS.calendarFilterDrawer,
  				`${SELECTORS.calendarFilterDrawer} label`,
  				`${SELECTORS.calendarFilterDrawer} p`,
  				`${SELECTORS.calendarFilterDrawer} span`,
  				`${SELECTORS.calendarFilterDrawer} .n-radio-group .n-radio__label`,
  				`${SELECTORS.calendarFilterDrawer} .n-radio-group label`,
  				`${SELECTORS.calendarFilterDrawer} div.n-radio__label`,
  			],
  		},
  	];
  
  	function autoTextColorFor(hex) {
  		const lum = relativeLuminance(hex);
  		if (lum === null) return null;
  		return lum > 0.5 ? "#1e293b" : "#f1f5f9";
  	}
  
  	function buildTextSafetyCss(theme) {
  		const colors = theme.interfaceColors || {};
  		const rules = [];
  		TEXT_SAFETY_TARGETS.forEach(({ bgKey, selectors }) => {
  			const bg = colors[bgKey];
  			if (typeof bg !== "string" || bg.trim() === "") return;
  			const textColor = autoTextColorFor(bg);
  			if (!textColor) return;
  			rules.push(`${selectors.join(", ")} { color: ${textColor} !important; }`);
  		});
  		return rules.join("\n");
  	}
  
  	// Dark Mode's locationSwitcherText is intentionally near-white (readable
  	// against that theme's own dark locationSwitcherBg), but the "Search for
  	// a sub-account" popup that opens from #location-switcher-sidbar-v2 is
  	// GHL's own unstyled white surface, not covered by locationSwitcherBg —
  	// so that near-white text becomes unreadable there. Forces black on that
  	// same selector specifically for darkMode themes, appended after the
  	// interface-color overlay so it wins the cascade; touches nothing else.
  	function buildDarkModeLocationSwitcherFix(theme) {
  		if (theme.style !== "darkMode") return "";
  		return `#location-switcher-sidbar-v2 .hl_text-overflow { color: #000000 !important; }`;
  	}
  
  	// Sidebar Effect — deliberately independent of `theme.style` (the 11
  	// design movements). A theme's movement drives everything else, but the
  	// sidebar nav items/active-state can be re-skinned to any of these
  	// regardless of movement (e.g. a Brutalist-colored theme with a Glass
  	// sidebar). "inherit"/missing (every theme saved before this existed)
  	// means: emit nothing here, so the movement's own SELECTORS.sidebarLinks/
  	// sidebarActive CSS above remains the only source — zero behavior change
  	// for existing themes. Appended after movementCss + the interface-color
  	// overlay so its `!important` rules win the cascade when active.
  	// textColor/activeTextColor are independent fields on theme.sidebarEffect
  	// itself — NOT derived from Primary/Secondary/Bg/Accent. Deriving from
  	// those (the old approach) silently produced invisible text whenever two
  	// brand colors collided (e.g. Primary === Bg). Every generator below also
  	// targets SELECTORS.sidebarLinkText/sidebarActiveText in addition to the
  	// parent sidebarLinks/sidebarActive — the visible label lives in a nested
  	// span with its own GHL-set color, so setting `color` on the parent alone
  	// doesn't reliably reach it (see the header comment on SELECTORS.sidebarLinkText).
  	function sidebarEffectTextColors(t) {
  		const effect = t.sidebarEffect || {};
  		return {
  			text: effect.textColor || "#1e293b",
  			active: effect.activeTextColor || "#ffffff",
  		};
  	}
  
  	const SIDEBAR_EFFECT_CSS = {
  		flat: (t) => {
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebarLinks} { background: ${t.bg} !important; border: none !important; box-shadow: none !important; color: ${text} !important; transition: none !important; margin: 4px 18px 4px 10px !important; }
  		${SELECTORS.sidebarActive} { background: ${t.secondary} !important; border: none !important; box-shadow: none !important; color: ${active} !important; }
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  		threeDBox: (t) => {
  			const cfg = t.sidebarEffect.threeDBox || {};
  			const depth = cfg.depth ?? 4;
  			const outlineWeight = cfg.outlineWeight ?? 2;
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebarLinks} {
  			background: ${t.bg} !important;
  			border: ${outlineWeight}px solid #000000 !important;
  			border-radius: 8px !important;
  			box-shadow: ${depth}px ${depth}px 0 #000000 !important;
  			color: ${text} !important;
  			transition: transform 0.15s ease, box-shadow 0.15s ease !important;
  			margin: 4px ${14 + depth}px 4px 10px !important;
  		}
  		${SELECTORS.sidebarLinks}:hover { transform: translate(-2px, -2px) !important; box-shadow: ${depth + 2}px ${depth + 2}px 0 #000000 !important; }
  		${SELECTORS.sidebarActive} { background: ${t.secondary} !important; border-color: #000000 !important; color: ${active} !important; box-shadow: ${depth}px ${depth}px 0 #000000 !important; }
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  		glass: (t) => {
  			const cfg = t.sidebarEffect.glass || {};
  			const blurAmount = cfg.blurAmount ?? 16;
  			const opacity = cfg.opacity ?? 0.12;
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebar} {
  			/* Amber + indigo duotone: indigo is amber's complement on the color
  			   wheel, giving the panel two soft glows instead of one flat wash. */
  			background:
  				radial-gradient(120% 60% at 10% 0%, ${t.accent}30, transparent 55%),
  				radial-gradient(100% 55% at 95% 100%, #818cf840, transparent 60%),
  				linear-gradient(180deg, ${t.primary}18, ${t.accent}10) !important;
  			backdrop-filter: blur(${blurAmount + 6}px) saturate(180%) !important;
  			-webkit-backdrop-filter: blur(${blurAmount + 6}px) saturate(180%) !important;
  			border-right: 1px solid ${t.primary}44 !important;
  			box-shadow: 8px 0 32px rgba(0,0,0,0.10) !important;
  		}
  		${SELECTORS.sidebarLinks} {
  			background: rgba(255,255,255,0.38) !important;
  			backdrop-filter: blur(${blurAmount}px) !important;
  			-webkit-backdrop-filter: blur(${blurAmount}px) !important;
  			border: 1px solid rgba(255,255,255,0.55) !important;
  			border-radius: 999px !important;
  			box-shadow: 0 1px 3px rgba(120,53,15,0.08) !important;
  			color: ${text} !important;
  			margin: 4px 18px 4px 10px !important;
  			transition: background 0.18s ease, transform 0.18s ease, box-shadow 0.18s ease !important;
  		}
  		${SELECTORS.sidebarLinks}:hover {
  			background: ${t.secondary}2e !important;
  			border-color: ${t.secondary}77 !important;
  			transform: translateX(2px) !important;
  			box-shadow: 0 3px 10px ${t.secondary}44 !important;
  		}
  		${SELECTORS.sidebarActive} {
  			background: linear-gradient(135deg, #818cf8, #6366f1) !important;
  			border-color: #6366f1 !important;
  			color: ${active} !important;
  			box-shadow: 0 4px 18px #6366f166 !important;
  		}
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  		bordered: (t) => {
  			const cfg = t.sidebarEffect.bordered || {};
  			const borderWeight = cfg.borderWeight ?? 2;
  			const cornerRadius = cfg.cornerRadius ?? 8;
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebarLinks} { background: ${t.bg} !important; border: ${borderWeight}px solid ${t.primary} !important; border-radius: ${cornerRadius}px !important; box-shadow: none !important; color: ${text} !important; margin: 4px 18px 4px 10px !important; }
  		${SELECTORS.sidebarActive} { background: ${t.primary} !important; border-color: ${t.primary} !important; color: ${active} !important; }
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  		neumorphic: (t) => {
  			const cfg = t.sidebarEffect.neumorphic || {};
  			const sd = cfg.shadowDistance ?? 6;
  			const sb = cfg.shadowBlur ?? 12;
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebar} { background: ${t.bg} !important; }
  		${SELECTORS.sidebarLinks} {
  			background: ${t.bg} !important;
  			border: none !important;
  			border-radius: 14px !important;
  			box-shadow: ${sd}px ${sd}px ${sb}px rgba(0,0,0,0.15), -${sd}px -${sd}px ${sb}px rgba(255,255,255,0.08) !important;
  			color: ${text} !important;
  			margin: 4px ${14 + sd}px 4px 10px !important;
  		}
  		${SELECTORS.sidebarActive} {
  			box-shadow: inset ${sd}px ${sd}px ${sb}px rgba(0,0,0,0.25), inset -${sd}px -${sd}px ${sb}px rgba(255,255,255,0.06) !important;
  			color: ${active} !important;
  		}
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  		clay: (t) => {
  			const cfg = t.sidebarEffect.clay || {};
  			const inner = cfg.innerShadowDepth ?? 8;
  			const outer = cfg.outerShadowDepth ?? 16;
  			const { text, active } = sidebarEffectTextColors(t);
  			return `
  		${SELECTORS.sidebarLinks} {
  			background: ${t.bg} !important;
  			border: none !important;
  			border-radius: 20px !important;
  			box-shadow: -${inner}px -${inner}px ${inner * 1.5}px rgba(255,255,255,0.6), ${outer}px ${outer}px ${outer * 1.2}px ${t.secondary}55 !important;
  			color: ${text} !important;
  			margin: 4px ${10 + outer}px 4px 10px !important;
  		}
  		${SELECTORS.sidebarActive} {
  			background: ${t.primary} !important;
  			box-shadow: inset -${inner}px -${inner}px ${inner}px rgba(255,255,255,0.5), inset ${inner}px ${inner}px ${inner}px ${t.secondary}66 !important;
  			color: ${active} !important;
  		}
  		${SELECTORS.sidebarLinkText} { color: ${text} !important; }
  		${SELECTORS.sidebarActiveText} { color: ${active} !important; }
  	`;
  		},
  	};
  
  	function buildSidebarEffectCss(theme) {
  		const effect = theme.sidebarEffect;
  		if (!effect || !effect.style || effect.style === "inherit") return "";
  		const generator = SIDEBAR_EFFECT_CSS[effect.style];
  		return generator ? generator(theme) : "";
  	}
  
  	// WCAG relative-luminance formula — used only to pick "is this text color
  	// dark or light" for the icon filter below, not for contrast compliance.
  	function relativeLuminance(hex) {
  		if (typeof hex !== "string") return null;
  		const m = hex.trim().match(/^#([0-9a-fA-F]{6})$/);
  		if (!m) return null;
  		const int = parseInt(m[1], 16);
  		const r = (int >> 16) & 255, g = (int >> 8) & 255, b = int & 255;
  		const lin = (c) => {
  			const s = c / 255;
  			return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  		};
  		return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b);
  	}
  
  	// An <img>-based icon can only be flipped dark<->light via `filter`, not
  	// recolored to an arbitrary hex — see sidebarLinkIconImg's comment. `null`
  	// means "unknown text color for this state, don't touch the icon" rather
  	// than guessing.
  	function iconFilterForColor(hex) {
  		const lum = relativeLuminance(hex);
  		if (lum === null) return null;
  		return lum > 0.5 ? "brightness(0) invert(1)" : "brightness(0)";
  	}
  
  	// The literal/derived text color each MOVEMENT_CSS generator actually
  	// uses for sidebarLinks/sidebarActive — kept in sync BY VALUE with those
  	// generators above (not re-derived from them) so this stays a plain
  	// lookup. `link: null` marks movements that never set an explicit
  	// non-active nav text color (falls through to GHL's own untreated
  	// default) — the icon filter is skipped for that state rather than
  	// guessing at a color that was never actually applied.
  	function movementSidebarTextColors(t) {
  		switch (t.style) {
  			case "glass": return { link: "#e2e8f0", active: "#ffffff" };
  			case "brutalist": return { link: "#000000", active: "#ffffff" };
  			case "clay": return { link: "#9d174d", active: "#9d174d" };
  			case "maximalist": return { link: t.primary, active: "#000000" };
  			case "liquidGlass": return { link: "#ffffff", active: "#ffffff" };
  			case "skeuomorphic": return { link: "#2a2015", active: "#fdf6e3" };
  			case "neumorphic": return { link: null, active: t.accent };
  			case "cyberpunk": return { link: null, active: t.primary };
  			case "vaporwave": return { link: null, active: "#ffffff" };
  			case "artdeco": return { link: null, active: t.bg };
  			case "darkMode": return { link: null, active: t.primary };
  			default: return { link: null, active: null };
  		}
  	}
  
  	// A Sidebar Effect (when active) fully owns nav text color via its own
  	// independent textColor/activeTextColor fields, so it takes priority over
  	// the movement's own colors — same precedence as the rest of the effect
  	// system (see buildSidebarEffectCss).
  	function resolveSidebarTextColors(theme) {
  		const effect = theme.sidebarEffect;
  		if (effect && effect.style && effect.style !== "inherit") {
  			const colors = sidebarEffectTextColors(theme);
  			return { link: colors.text, active: colors.active };
  		}
  		return movementSidebarTextColors(theme);
  	}
  
  	function buildSidebarIconCss(theme) {
  		const { link, active } = resolveSidebarTextColors(theme);
  		const rules = [`${SELECTORS.sidebarLinkIconFont} { color: inherit !important; }`];
  		const linkFilter = iconFilterForColor(link);
  		if (linkFilter) rules.push(`${SELECTORS.sidebarLinkIconImg} { filter: ${linkFilter} !important; }`);
  		const activeFilter = iconFilterForColor(active);
  		if (activeFilter) rules.push(`${SELECTORS.sidebarActiveIconImg} { filter: ${activeFilter} !important; }`);
  		return rules.join("\n");
  	}
  
  	// A `border` (added by several movements and by the Bordered/3D
  	// Box/Glass sidebar effects) grows an element beyond its box's width
  	// under the default `box-sizing: content-box`, eating back into whatever
  	// margin gap we just reserved on the right for the scrollbar. Forcing
  	// `border-box` keeps the border INSIDE the element's own width instead.
  	// `scrollbar-gutter: stable` is a second, independent line of defense —
  	// it reserves the scrollbar's own width from the nav's layout permanently
  	// (supported in current Chrome/Edge/Firefox; a no-op, not a break, on
  	// browsers that don't support it yet). Always emitted, for every
  	// theme/movement/effect, since nothing about this is style-specific.
  	function buildSidebarLayoutFix() {
  		return `
  		${SELECTORS.sidebarLinks} {
  			box-sizing: border-box !important;
  			width: calc(100% - 28px) !important;
  		}
  		#sidebar-v2, #sidebar-v2 .hl_nav-header nav, #sidebar-v2 .hl_nav-settings nav { scrollbar-gutter: stable !important; }
  	`;
  	}
  
  	// A bare `*::-webkit-scrollbar-thumb/track { background }` with no
  	// accompanying `*::-webkit-scrollbar { width }` is a silent no-op in
  	// Chrome — confirmed live: only liquidGlass's own dedicated scrollbar
  	// block (which sets width too) actually rendered a colored scrollbar,
  	// every other movement's scrollbarThumb/scrollbarTrack colors did
  	// nothing. This is the one, universal, working version — same pattern
  	// liquidGlass already used, now applied for every theme regardless of
  	// movement. Falls back to sane neutral defaults if a theme never set
  	// these two fields, so it's always safe to emit.
  	function buildScrollbarCss(theme) {
  		const colors = theme.interfaceColors || {};
  		const thumb = (typeof colors.scrollbarThumb === "string" && colors.scrollbarThumb.trim()) || "#94a3b8";
  		const track = (typeof colors.scrollbarTrack === "string" && colors.scrollbarTrack.trim()) || "transparent";
  		return `
  		* { scrollbar-width: thin !important; scrollbar-color: ${thumb} ${track} !important; }
  		*::-webkit-scrollbar { width: 10px !important; height: 10px !important; }
  		*::-webkit-scrollbar-track { background: ${track} !important; }
  		*::-webkit-scrollbar-thumb {
  			background: ${thumb} !important;
  			border-radius: 999px !important;
  			border: 2px solid transparent !important;
  			background-clip: padding-box !important;
  		}
  		*::-webkit-scrollbar-thumb:hover { background: ${thumb} !important; border: 2px solid transparent !important; background-clip: padding-box !important; }
  		/* The sidebar's own scroll container has scrollbar-color/-width set
  		   directly on it by GHL — beats the universal star rule above on
  		   specificity regardless of source order, so it needs its own
  		   explicit override to actually change color. */
  		#sidebar-v2 .hl_nav-header,
  		#sidebar-v2 .hl_nav-header-without-footer {
  			scrollbar-color: ${thumb} ${track} !important;
  			scrollbar-width: thin !important;
  		}
  	`;
  	}
  
  	// Named-theme-only override — deliberately NOT part of any shared movement
  	// or sidebarEffect generator, so it can only ever affect this one theme by
  	// name and never leaks into any other theme that happens to share its
  	// style/sidebarEffect.
  	function buildTerminalPulseSidebarOverride(theme) {
  		if (theme.name !== "Terminal Pulse") return "";
  		// A custom Sidebar Effect (superadmin's Sidebar & Nav tab) fully owns nav
  		// text color once set — same precedence rule as resolveSidebarTextColors
  		// above — so this named fallback only fires while the effect is still
  		// "inherit"/unset, and never fights a deliberately-chosen textColor/
  		// activeTextColor.
  		const effect = theme.sidebarEffect;
  		if (effect && effect.style && effect.style !== "inherit") return "";
  		return `
  		${SELECTORS.sidebarLinkText} { color: #ffffff !important; }
  		${SELECTORS.sidebarActiveText} { color: #ffffff !important; }
  		${SELECTORS.sidebarLinkIconImg} { filter: brightness(0) invert(1) !important; }
  		${SELECTORS.sidebarActiveIconImg} { filter: brightness(0) invert(1) !important; }
  		${SELECTORS.sidebarLinkIconFont} { color: #ffffff !important; }
  	`;
  	}
  
  	function buildPremiumCss(theme) {
  		const generator = MOVEMENT_CSS[theme.style];
  		const movementCss = generator ? generator(theme) : "";
  		return (
  			movementCss +
  			"\n" + buildInterfaceColorOverlay(theme) +
  			"\n" + buildComposerSendButtonOpacityFix(theme) +
  			"\n" + buildCalendarTypeSelectorBorderFix(theme) +
  			"\n" + buildTextSafetyCss(theme) +
  			"\n" + buildDarkModeLocationSwitcherFix(theme) +
  			"\n" + buildSidebarEffectCss(theme) +
  			"\n" + buildSidebarIconCss(theme) +
  			"\n" + buildSidebarLayoutFix() +
  			"\n" + buildScrollbarCss(theme) +
  			"\n" + buildTerminalPulseSidebarOverride(theme)
  		);
  	}

  	// Payments status tags (Paid/Overdue/Draft) all share the exact same
  	// class, .hr-tag.hr-tag--round, with no per-status modifier class — the
  	// only way to tell them apart is by their text content, which a plain
  	// CSS selector can't do. This walks the DOM directly and sets an inline
  	// background per matched status text instead. Re-runs via a debounced
  	// MutationObserver since the invoice table paginates/re-renders rows
  	// dynamically, so a one-time pass would miss rows added after load.
  	const PAYMENT_STATUS_TEXT_MAP = {
  		Paid: "paymentsStatusPaidBg",
  		Overdue: "paymentsStatusOverdueBg",
  		Draft: "paymentsStatusDraftBg",
  	};
  
  	function applyPaymentStatusTagColors(theme) {
  		const colors = theme.interfaceColors || {};
  		document.querySelectorAll(".hr-tag.hr-tag--round").forEach((tagEl) => {
  			const colorKey = PAYMENT_STATUS_TEXT_MAP[tagEl.textContent.trim()];
  			if (!colorKey) return;
  			const bg = colors[colorKey];
  			if (typeof bg === "string" && bg.trim() !== "") {
  				tagEl.style.setProperty("background", bg, "important");
  			}
  		});
  	}
  
  	let paymentStatusTagObserver = null;
  	let paymentStatusTagDebounce = null;
  	function watchPaymentStatusTags(theme) {
  		if (paymentStatusTagObserver) paymentStatusTagObserver.disconnect();
  		applyPaymentStatusTagColors(theme);
  		paymentStatusTagObserver = new MutationObserver(() => {
  			clearTimeout(paymentStatusTagDebounce);
  			paymentStatusTagDebounce = setTimeout(() => applyPaymentStatusTagColors(theme), 150);
  		});
  		paymentStatusTagObserver.observe(document.body, { childList: true, subtree: true });
  	}
  
  	function stopWatchingPaymentStatusTags() {
  		if (paymentStatusTagObserver) {
  			paymentStatusTagObserver.disconnect();
  			paymentStatusTagObserver = null;
  		}
  		clearTimeout(paymentStatusTagDebounce);
  	}
  
  
  

  	/* ── 5b. Hover-color lock for a handful of stubborn hr-button instances ── */
  	//
  	// A handful of buttons (Import/Add Contact/Add opportunity, the compose
  	// button, Sort, Advanced filters) kept reverting to GHL's hardcoded blue
  	// on hover no matter how specific or how many "!important" pure-CSS
  	// overrides were added — confirmed via a live capture (real cursor, not
  	// DevTools' simulated hover) that our own ID+":hover" rule was present
  	// and matched in the stylesheet, yet still lost. That points at some
  	// other "!important" rule (very likely one of GHL's Vue-scoped
  	// "[data-v-xxxx]" variants) that a plain CSS `matches()` scan can miss
  	// or that simply out-specifies anything we can express as pure CSS.
  	//
  	// Rather than keep chasing that invisible rule with more CSS, this
  	// freezes each element's own correct RESTING color (already reliably
  	// correct — that part of the cascade was never in question) right after
  	// the theme's <style> tag is written, then forces that exact value back
  	// via an inline "!important" style the instant the pointer/focus enters
  	// the element, and releases it on leave. An inline "!important" style
  	// always wins over any external stylesheet rule, no matter its
  	// specificity or its own importance — there is no CSS rule that can
  	// beat this short of GHL's own JS also setting inline !important styles
  	// (checked for and ruled out: no inline "style" mutation happens on
  	// hover today).
  	const HOVER_LOCK_TARGETS = [
  		"#add-record-btn",
  		"#import-btn",
  		"#new-conversation-btn-collapsed",
  		"#new-conversation-btn",
  		"#field-selection",
  		"#list-view-advance-filter-btn",
  	];
  	const HOVER_LOCK_CHILD_SELECTOR = ".hr-button__border, .hr-button__state-border";
  	const HOVER_LOCK_PROPS = ["background-color", "color", "border-color"];
  	const hoverLockFrozen = new WeakMap();
  
  	function captureHoverLockRestColors(el) {
  		const cs = getComputedStyle(el);
  		const frozen = {};
  		HOVER_LOCK_PROPS.forEach((p) => {
  			frozen[p] = cs.getPropertyValue(p);
  		});
  		hoverLockFrozen.set(el, frozen);
  	}
  
  	function applyHoverLock(el) {
  		const frozen = hoverLockFrozen.get(el);
  		if (!frozen) return;
  		HOVER_LOCK_PROPS.forEach((p) => el.style.setProperty(p, frozen[p], "important"));
  	}
  
  	function releaseHoverLock(el) {
  		HOVER_LOCK_PROPS.forEach((p) => el.style.removeProperty(p));
  		// Re-capture shortly after release, in case the theme (or its
  		// enabled/disabled state) changed while this element was locked.
  		setTimeout(() => captureHoverLockRestColors(el), 0);
  	}
  
  	function lockOneHoverElement(el) {
  		captureHoverLockRestColors(el); // refresh every scan, even if already wired
  		if (el.dataset.premiumHoverLocked) return; // but only attach listeners once per node
  		el.dataset.premiumHoverLocked = "1";
  		el.addEventListener("mouseenter", () => applyHoverLock(el));
  		el.addEventListener("mouseleave", () => releaseHoverLock(el));
  		el.addEventListener("focus", () => applyHoverLock(el));
  		el.addEventListener("blur", () => releaseHoverLock(el));
  	}
  
  	function scanAndLockHoverElements() {
  		HOVER_LOCK_TARGETS.forEach((sel) => {
  			document.querySelectorAll(sel).forEach((container) => {
  				lockOneHoverElement(container);
  				container.querySelectorAll(HOVER_LOCK_CHILD_SELECTOR).forEach(lockOneHoverElement);
  			});
  		});
  	}
  
  	let hoverLockScanDebounce = null;
  	function scheduleHoverLockScan() {
  		if (hoverLockScanDebounce) return;
  		hoverLockScanDebounce = setTimeout(() => {
  			hoverLockScanDebounce = null;
  			scanAndLockHoverElements();
  		}, 200);
  	}
  
  	let hoverLockObserver = null;
  	function startHoverLockWatcher() {
  		scanAndLockHoverElements();
  		if (hoverLockObserver) return;
  		  		hoverLockObserver = new MutationObserver(scheduleHoverLockScan);
      hoverLockObserver.observe(document.body, { childList: true, subtree: true });
  	}

  function stopHoverLockWatcher() {
    if (hoverLockObserver) hoverLockObserver.disconnect();
    hoverLockObserver = null;
    if (hoverLockScanDebounce) clearTimeout(hoverLockScanDebounce);
    hoverLockScanDebounce = null;
    // Re-capture resting colors now the theme's CSS is gone, so nothing stays frozen to it.
    scanAndLockHoverElements();
  }

  C.register('premium-theme', {
    apply: function (cfg) {
      var theme = cfg && cfg.theme;
      if (!theme || !theme.style) return;

      C.style('premium-theme', buildPremiumCss(theme));
      watchPaymentStatusTags(theme);
      startHoverLockWatcher();

      var bgLayerConfig = BG_LAYER_STYLE[theme.style];
      if (bgLayerConfig && bgLayerConfig.enabled) buildPremiumBgLayer(theme, !!bgLayerConfig.animate);
      else clearPremiumBgLayer();

      return function () {
        clearPremiumBgLayer();
        stopWatchingPaymentStatusTags();
        stopHoverLockWatcher();
      };
    },
  });
})(window.__mgcCustomizer);
