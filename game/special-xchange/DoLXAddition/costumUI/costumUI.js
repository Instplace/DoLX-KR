(function () {
	"use strict";

	let scheduled = false;
	let observer = null;
	let observedScope = null;
	const overlayTabIcons = Object.freeze({
		"특징": "\u2726", // ✦
		"정체성": "\u25C7", // ◇
		Social: "\u2637", // ☷
		"관계": "\u2661", // ♡
		"평판": "\u2606", // ☆
		"특성": "\u25C6", // ◆

		"저널": "\u25A4", // ▤
		"메모": "\u270E", // ✎

		"통계": "\u25A5", // ▥
		"추가 통계 (스포일러)": "\u2295", // ⊕
		"업적": "\u2742", // ❂
		"스탯": "\u25A6", // ▦

		"시각": "\u25C9", // ◉
		"NPC": "\u265F", // ♟
		"알렉스의 농장": "\u2302", // ⌂
		"텔레포트": "\u219C", // ↜
		"기타": "\u22EF", // ⋯

		"일반": "\u2699\uFE0E", // ⚙︎
		"테마": "\u25C8", // ◈
		"성능": "\u21AF", // ↯
		"고급": "\u2692\uFE0E", // ⚒︎
		"세이브": "\u25A3", // ▣
		"백업": "\u21BA",
		"내보내기/불러오기": "\u21C4", // ⇄

		"이벤트 정보": "\u25CE", // ◎
		"블랙잭 가이드": "\u2660", // ♠
		"레이어": "\u25A9", // ▩
		"색상": "\u25D2", // ◒
		"모델": "\u25B1", // ▱
		"애니메이션 시작/정지": "\u25B6", // ▶
		"캐시 새로고침": "\u21BB", // ↻
		"의상 편집기": "\u2702", // ✂
		"가방": "\u25A2", // ▢
		"손거울": "\u232C", // ⌬
		"음악": "\u266B", // ♫
	});

	function styleOverlayTabs() {
		const overlay = document.getElementById("customOverlay");
		if (!overlay || ["DoLXCredits", "mirrorMood"].includes(overlay.dataset.overlay)) return;

		overlay.querySelectorAll("#overlayTabs button").forEach(button => {
			const label = button.textContent.trim().replace(/\s+/g, " ");
			const icon = overlayTabIcons[label];
			if (icon) button.dataset.tabIcon = icon;
			else delete button.dataset.tabIcon;
			/* The island's implant interface gets the island itself as its icon, drawn in CSS. */
			button.classList.toggle("tab-holo", label === "홀로" || label === "Holo");
		});
	}

	window.customUiStyleOverlayTabs = styleOverlayTabs;

	/* The only UI we care about lives inside the sidebar caption / ui-bar.
	   Observing that container instead of <body> avoids reacting to every mutation in #passages (the story text),
	   which is where DoL does the overwhelming majority of its DOM churn. */
	function getUiScope() {
		return document.getElementById("story-caption") || document.getElementById("ui-bar") || null;
	}

	function isStartLikeScreen() {
		return document.getElementById("startCaption") !== null;
	}

	function getDirectChildByTag(parent, tagName) {
		if (!parent) return null;
		tagName = String(tagName || "").toUpperCase();
		for (const child of parent.children) {
			if (child.tagName === tagName) return child;
		}
		return null;
	}

	function ensureStartCaptionAnchor(startLike) {
		if (!startLike) return;

		const startCaption = document.getElementById("startCaption");
		if (!startCaption) return;

		let h4 = getDirectChildByTag(startCaption, "h4");
		if (h4) return;

		h4 = document.createElement("h4");
		h4.className = "breeze-anchor-title";
		h4.setAttribute("aria-hidden", "true");
		h4.textContent = (document.getElementById("story-title")?.textContent || "").trim() || "Degrees of Lewdity";

		startCaption.insertBefore(h4, startCaption.firstChild);
	}

	function ensureOverlayButtonSplitAnchors(startLike) {
		if (startLike) return;

		const overlayButtons = document.getElementById("overlayButtons");
		if (!overlayButtons) return;

		let splitCount = overlayButtons.querySelectorAll(".sidebarButtonSplit").length;
		if (splitCount >= 2) return;

		let anchorGroup = overlayButtons.querySelector(".breeze-anchor-group");
		if (!anchorGroup) {
			anchorGroup = document.createElement("div");
			anchorGroup.className = "sidebarButtonGroup breeze-anchor-group";
			overlayButtons.insertBefore(anchorGroup, overlayButtons.firstChild);
		}

		while (splitCount < 2) {
			const split = document.createElement("div");
			split.className = "sidebarButtonSplit breeze-anchor-split";
			anchorGroup.appendChild(split);
			splitCount++;
		}
	}

	function ensureBreezeCompatAnchors() {
		/* Late-attach the observer once the caption container exists. */
		installObserver();

		const startLike = isStartLikeScreen();
		ensureStartCaptionAnchor(startLike);
		ensureOverlayButtonSplitAnchors(startLike);
	}

	function scheduleEnsureBreezeCompatAnchors() {
		if (scheduled) return;
		scheduled = true;

		const run = () => {
			scheduled = false;
			ensureBreezeCompatAnchors();
		};

		if (typeof window.requestAnimationFrame === "function") {
			window.requestAnimationFrame(run);
		} else {
			window.setTimeout(run, 0);
		}
	}

	function mutationTouchesUi(mutations) {
		for (const mutation of mutations) {
			if (mutation.type === "childList" && (mutation.addedNodes.length > 0 || mutation.removedNodes.length > 0)) {
				return true;
			}
		}

		return false;
	}

	function installObserver() {
		if (typeof MutationObserver !== "function") return;

		const scope = getUiScope();
		if (!scope) return; /* container not built yet; a later passage hook will retry */
		if (observer && observedScope === scope) return;

		if (observer) observer.disconnect();
		observedScope = scope;

		observer = new MutationObserver(mutations => {
			if (mutationTouchesUi(mutations)) {
				scheduleEnsureBreezeCompatAnchors();
			}
		});

		/* Narrow scope: only the sidebar caption / ui-bar, not the whole body.
		   This is the single change that removes the per-passage tax
		   we no longer get a callback for every node added to the story text. */
		observer.observe(scope, {
			childList: true,
			subtree: true,
		});
	}

	function init() {
		scheduleEnsureBreezeCompatAnchors();
		installObserver();
	}

	if (document.readyState === "loading") {
		document.addEventListener("DOMContentLoaded", init, { once: true });
	} else {
		init();
	}

	if (window.jQuery) {
		jQuery(document).on(":passagedisplay", scheduleEnsureBreezeCompatAnchors);
	}
})();
