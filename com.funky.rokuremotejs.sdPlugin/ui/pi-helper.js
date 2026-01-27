// Requests the plugin to open a URL via the official system.openUrl call.
// Uses SDPIComponents client when available; falls back to sendToPlugin or postMessage.
function openPage(site) {
    const lowerSite = site.toLowerCase();
    const isInstructionsLink = lowerSite.includes("instructions");
    const isMailtoLink = lowerSite.startsWith("mailto:");

    if (isMailtoLink) {
        window.open(site, "_self");
        return;
    }

    const hasScheme = /^[a-z][a-z0-9+.-]*:/i.test(site);
    if (!hasScheme) {
        site = "https://" + site; // Ensure it has a proper URL scheme
    }

    if (isInstructionsLink) {
        window.open(site, "_blank");
        return;
    }

    const sdpiClient = (window.SDPIComponents || {}).streamDeckClient;
    if (sdpiClient && typeof sdpiClient.send === "function") {
        sdpiClient.send("openUrl", { url: site });
    } else if (typeof sendToPlugin === "function") {
        sendToPlugin({ event: "openUrl", url: site });
    } else {
        window.opener?.postMessage(
            {
                event: "openUrl",
                payload: {
                    url: site,
                },
            },
            "*"
        );
    }
}

// ---- Tab helpers for SDPI layouts ----
function updateSelectedTabBorder() {
	const isCompact = document.body?.dataset?.tabsCompact === "true";
	document.querySelectorAll("sdpi-button.tab").forEach((el) => {
		const btn = el.shadowRoot?.querySelector("button");
		if (!btn) return;

		const isProTab = el.dataset?.target === "#tab2";
		btn.style.border = "none";
		btn.style.borderRadius = "3px";
		btn.style.backgroundColor = "transparent";
		btn.style.boxShadow = "none";
		btn.style.fontWeight = "600";
		btn.style.fontSize = isCompact ? "11px" : "";
		btn.style.color = isProTab
			? "#b85cff"
			: el.classList.contains("selected")
			? "#ffffff"
			: "";
		btn.style.padding = isCompact ? "6px 6px" : "8px 10px"; // tighter padding to keep long labels on one line
		btn.style.whiteSpace = isCompact ? "normal" : "nowrap";
		btn.style.lineHeight = isCompact ? "1.1" : "";
		btn.style.textAlign = isCompact ? "center" : "";
        btn.style.wordBreak = isCompact ? "normal" : "";
    });

    const selected = document.querySelector("sdpi-button.tab.selected");
    if (selected) moveHighlight(selected);
}

function moveHighlight(tabEl) {
    const row = tabEl.closest(".tab-row");
    const highlight = row?.querySelector(".tab-highlight");
    if (!row || !highlight) return;

    const tabs = Array.from(row.querySelectorAll("sdpi-button.tab"));
    const index = tabs.indexOf(tabEl);
    const styles = getComputedStyle(row);
    const paddingLeft = parseFloat(styles.paddingLeft) || 0;
    const paddingRight = parseFloat(styles.paddingRight) || 0;
    const contentWidth = row.clientWidth - paddingLeft - paddingRight;
    const segmentWidth = contentWidth / tabs.length;

    highlight.style.width = `${segmentWidth}px`;
    highlight.style.transform = `translateX(${paddingLeft + segmentWidth * index}px)`;
}

function clickTab(clickedTab) {
    const allTabs = Array.from(document.querySelectorAll(".tab"));
    allTabs.forEach((el) => el.classList.remove("selected"));
    clickedTab.classList.add("selected");

    allTabs.forEach((el) => {
        const target = el.dataset.target ? document.querySelector(el.dataset.target) : null;
        if (target) {
            target.classList.toggle("active", el === clickedTab);
        }
    });

    updateSelectedTabBorder();
    moveHighlight(clickedTab);
}

function activateTabs(activeTarget) {
	const tabs = Array.from(document.querySelectorAll(".tab"));
	const initial = tabs.find((t) => t.dataset?.target === activeTarget) ?? tabs[0];

    tabs.forEach((tab) => tab.addEventListener("click", () => clickTab(tab)));

    if (initial) {
        clickTab(initial);
	}
}

function goToTab(targetSelector) {
	const target = targetSelector || "#tab1";
	const tab = Array.from(document.querySelectorAll(".tab")).find(
		(t) => t.dataset?.target === target
	);
	if (tab) {
		clickTab(tab);
	}
}

// Auto-init tabs if present on the page
document.addEventListener("DOMContentLoaded", () => {
    customElements.whenDefined("sdpi-button").then(() => {
        const hasTabs = document.querySelector(".tab-row");
        if (!hasTabs) return;

        activateTabs("#tab1");

        const selected = document.querySelector("sdpi-button.tab.selected");
        if (selected) moveHighlight(selected);
        window.addEventListener("resize", () => {
            const active = document.querySelector("sdpi-button.tab.selected");
            if (active) moveHighlight(active);
        });

        const obs = new MutationObserver(updateSelectedTabBorder);
        obs.observe(document.body, {
            subtree: true,
            attributes: true,
            attributeFilter: ["class"],
        });
    });
});
