(() => {
	"use strict";
	const paths = [
		"M18 24 Q7 31 10 48 Q16 61 32 61 Q48 61 54 48 Q57 31 46 24Z",
		"M23 21 L19 57 Q32 64 45 57 L41 21Z",
		"M12 26 H52 V57 Q32 62 12 57Z",
		"M32 20 Q8 40 13 53 Q32 70 51 53 Q56 40 32 20Z",
		"M24 20 V31 L10 54 Q8 61 32 61 Q56 61 54 54 L40 31 V20Z",
		"M19 24 Q5 33 16 43 Q4 59 22 60 H42 Q60 59 48 43 Q59 33 45 24Z",
		"M14 34 Q32 24 50 34 V54 Q32 63 14 54Z",
		"M22 23 L10 39 L17 59 H47 L54 39 L42 23Z",
	];
	const hues = {
		floral: 334,
		"fresh floral": 322,
		fruity: 18,
		citrus: 48,
		green: 99,
		herbal: 126,
		aquatic: 183,
		woody: 30,
		earthy: 42,
		resinous: 38,
		spicy: 19,
		powdery: 278,
		musky: 273,
		amber: 40,
		sweet: 35,
		creamy: 47,
		gourmand: 28,
		roasted: 22,
		smoky: 217,
		savoury: 71,
	};
	const cache = new Map();
	function descriptor(fingerprint, p) {
		const key = fingerprint;
		if (cache.has(key)) return cache.get(key);
		const h = setup.perfumeryIdentity.hash(key);
		const h2 = setup.perfumeryIdentity.hash(key + "ornament");
		const d = {
			version: 1,
			shape: h % 8,
			hue: ((hues[p.dominant] ?? 210) + (h2 % 25) - 12 + 360) % 360,
			cap: (h >>> 3) % 5,
			label: (h >>> 6) % 4,
			ornament: h2 % 65536,
			motif: ["floral", "powdery"].includes(p.dominant)
				? "flower"
				: ["woody", "earthy", "green", "herbal"].includes(p.dominant)
				? "leaf"
				: ["roasted", "smoky"].includes(p.dominant)
				? "smoke"
				: p.dominant === "fruity"
				? "fruit"
				: p.dominant === "aquatic"
				? "drop"
				: "star",
			finish: p.stability < 0.5 ? "layered" : p.offNotes?.some(n => n.name === "muddy") ? "cloudy" : h2 % 3 === 0 ? "shimmer" : "clear",
		};
		if (cache.size >= 256) cache.delete(cache.keys().next().value);
		cache.set(key, Object.freeze(d));
		return d;
	}
	function forBottle(b) {
		if (b.icon) return b.icon;
		const p = setup.perfumeryModel.calculate(b.formula, b.blending ?? 0.5, b.formula.age);
		return descriptor(p.fingerprint, p);
	}
	function render(d, label = "향수병") {
		const ns = "http://www.w3.org/2000/svg";
		const svg = document.createElementNS(ns, "svg");
		svg.setAttribute("viewBox", "0 0 64 70");
		svg.setAttribute("role", "img");
		svg.setAttribute("aria-label", String(label));
		svg.classList.add("perf-icon");
		const add = (tag, attrs) => {
			const n = document.createElementNS(ns, tag);
			for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
			svg.append(n);
			return n;
		};
		// Only whitelisted templates and bounded numbers reach SVG attributes; never parse supplied markup.
		const shape = paths[Number.isInteger(d.shape) && d.shape >= 0 && d.shape < 8 ? d.shape : 0];
		const hue = Number.isFinite(d.hue) ? Math.max(0, Math.min(360, d.hue)) : 330;
		add("path", { d: shape, fill: `hsl(${hue}, 48%, ${d.finish === "cloudy" ? 35 : 49}%)`, stroke: "#bdd1ce", "stroke-width": 2 });
		add("path", { d: "M21 29 L18 44", stroke: "#fff", opacity: 0.5, "stroke-width": 2 });
		add("rect", { x: 23, y: 13, width: 18, height: 11, rx: Number(d.cap) % 5 || 0, fill: "#ad9864", stroke: "#ddd0a7" });
		add("rect", { x: 20, y: 38, width: 24, height: 16, rx: Number(d.label) % 4 || 0, fill: "#eee0bd", opacity: 0.9 });
		const motif = {
			flower: "M32 41 Q21 34 28 47 Q21 57 32 51 Q43 57 36 47 Q43 34 32 41Z",
			leaf: "M25 50 Q23 39 39 41 Q38 52 25 50 M26 49 L36 43",
			smoke: "M27 51 Q38 47 29 43 Q24 39 36 36",
			fruit: "M32 43 Q21 38 25 50 Q32 57 39 50 Q43 38 32 43 M32 43 L35 38",
			drop: "M32 39 Q20 52 32 53 Q44 52 32 39Z",
			star: "M32 40 L34 45 L40 46 L35 49 L36 54 L32 51 L27 54 L28 49 L24 46 L30 45Z",
		};
		add("path", { d: motif[d.motif] || motif.star, fill: "none", stroke: "#3d493d", "stroke-width": 1.5 });
		const bits = Number(d.ornament) >>> 0;
		for (let i = 0; i < 16; i++)
			if (bits & (1 << i)) add("circle", { cx: 17 + (i % 8) * 4, cy: 29 + Math.floor(i / 8) * 28, r: d.finish === "shimmer" ? 1.1 : 0.7, fill: "#fff2c8" });
		if (d.finish === "layered") add("path", { d: "M17 55 Q32 51 47 55", fill: "none", stroke: "#d4c4a5", "stroke-width": 3 });
		return svg;
	}
	setup.perfumeryIcons = { descriptor, forBottle, render, signature: d => JSON.stringify(d), cacheSize: () => cache.size };
	if (Macro.has("perfumeryIcon")) Macro.delete("perfumeryIcon");
	Macro.add("perfumeryIcon", {
		handler() {
			const b = this.args[0];
			if (b?.formula) this.output.append(render(forBottle(b), b.name || "기록된 향수"));
		},
	});
})();

/* globals $, V, pocketPerfumePack, pocketBagName */
(() => {
	"use strict";
	setup.perfumeryUI?.dispose();
	let cleanup = () => {};
	// The unspent draft survives passage changes in memory, outside SugarCube history.
	// Bottling or clearing the draft resets it.
	let draft = null;
	const freshDraft = () => ({
		formula: setup.perfumeryModel.empty(),
		pinned: null,
		layer: "heart",
		tab: null,
		undo: [],
		filters: { q: "", family: "", affinity: "", kind: "", owned: true, sort: "name" },
		page: 0,
	});
	const layerName = { top: "오프닝", heart: "하트", base: "베이스" };
	const layerHint = {
		top: "오프닝 노트는 가장 먼저 느껴지는 냄새입니다. 향수의 하트가 또렷해지면서 옅어집니다.",
		heart: "하트 노트는 향수의 중심이 되는 성격을 정합니다. 오프닝이 사라진 뒤에 더 뚜렷해집니다.",
		base: "베이스 노트는 가벼운 냄새가 사라진 뒤에도 피부에 남는 냄새입니다.",
	};
	/* Nine tiles: three rows on every width, so the drawer never turns into a long scroll. */
	const PAGE = 9;
	const word = (n, steps) => steps.find(([limit]) => n < limit)?.[1] ?? steps[steps.length - 1][1];
	const plural = (n, one, many = one) => `${n}${n === 1 ? one : many}`;
	const clamp01 = n => Math.max(0, Math.min(1, n)); const scent = x => setup.perfumeryIdentity?.scentKr?.[x] || x; const fam = x => setup.perfumeryIdentity?.famKr?.[x] || scent(x);
	const projectionWord = n =>
		word(n, [
			[1, "은은함"],
			[1.8, "뚜렷함"],
			[2.4, "강함"],
			[Infinity, "매우 강함"],
		]);
	const concentrationWord = n =>
		word(n, [
			[18, "연함"],
			[26, "보통"],
			[34, "진함"],
			[Infinity, "아주 진함"],
		]);
	const scoreWord = n =>
		word(n, [
			[40, "나쁨"],
			[60, "고르지 않음"],
			[75, "괜찮음"],
			[88, "좋음"],
			[Infinity, "뛰어남"],
		]);
	const qualityAssessment = p => {
		const balance = word(p.quality, [
			[40, "향의 균형이 맞지 않는다. 레시피와 농도, 블렌딩을 더 손봐야 한다."],
			[60, "어떤 노트들은 서로 부딪힌다. 비율을 조정하거나 더 신중하게 블렌딩하면 나아질 수 있다."],
			[75, "향수의 균형은 잡혀 있지만, 몇몇 노트는 더 부드럽게 어우러질 수 있다."],
			[88, "균형이 잘 잡힌 향수를 만들었다. 노트들이 편안하게 어우러진다."],
			[Infinity, "재료를 각별히 공들여 하나로 엮어, 부드럽고 균형 잡힌 향수를 완성했다."],
		]);
		return p.pleasantness < 30 ? `${balance} 그래도 냄새가 불쾌하다. 솜씨가 아무리 좋아도 모든 재료 조합을 매력적으로 만들 수는 없다.` : balance;
	};
	const meterWord = n =>
		word(n, [
			[0.2, "희미함"],
			[0.45, "약간"],
			[0.7, "또렷함"],
			[Infinity, "강함"],
		]);
	const hours = minutes => (minutes < 90 ? `약 ${Math.round(minutes / 10) * 10}분` : `약 ${Math.round(minutes / 30) / 2}시간`);
	/* Workflow order. "notes" is the internal id for Compose. */
	const stages = [
		["prepare", "준비", "재료의 냄새를 모으고 남길 부분을 고릅니다"],
		["notes", "구성", "향수의 오프닝, 하트, 베이스에 쓸 냄새를 고릅니다"],
		["blend", "블렌딩", "오프닝, 하트, 베이스 노트를 조심스럽게 섞습니다"],
		["bottle", "병입", "완성된 블렌드를 확인한 뒤 병에 봉하고 이름을 붙입니다"],
	];
	/* Where the gold band sits on each blending pass. */
	const zones = [52, 36, 64];
	const passes = [
		["오프닝", "top"],
		["하트", "heart"],
		["베이스", "base"],
	];
	function mount(root) {
		cleanup();
		const api = setup.perfumery;
		const m = setup.perfumeryModel;
		const s = api.state();
		const abort = new AbortController();
		const signal = abort.signal;
		const station = root.dataset.mode === "station";
		let blending = null;
		let blended = "";
		let result = null;
		let serial = s.serial;
		let liquidOpen = false;
		/* Timing minigame state: one stop per pass. Lives only while this page is open. */
		const timing = { scores: [], running: false, raf: 0, start: 0, pos: 0, direction: 1, last: "" };
		cleanup = () => {
			abort.abort();
			cancelAnimationFrame(timing.raf);
		};
		if (station) draft ??= freshDraft();
		const d = draft;
		const el = (tag, text, parent, cls) => {
			const node = document.createElement(tag);
			if (text !== undefined) node.textContent = text;
			if (cls) node.className = cls;
			if (parent) parent.append(node);
			return node;
		};
		const button = (text, action, parent, id, extra = {}) => {
			const b = el("button", text, parent, extra.cls);
			b.type = "button";
			b.dataset.action = action;
			if (id !== undefined) b.dataset.id = id;
			if (extra.layer) b.dataset.layer = extra.layer;
			if (extra.label) b.setAttribute("aria-label", extra.label);
			return b;
		};
		const knowledge = Math.max(s.lesson + (s.session?.kind === "lesson" && s.session.stage === "compose" ? 1 : 0), Math.floor(s.skill / 10));
		const advanced = knowledge >= 2;
		const units = f => m.layers.reduce((sum, l) => sum + Object.values(f[l]).reduce((a, b) => a + b, 0), 0);
		const used = id => m.layers.reduce((sum, l) => sum + (d.formula[l][id] || 0), 0);
		const safe = fn => {
			try {
				return fn();
			} catch {
				return null;
			}
		};
		const iconOf = id => {
			const src = setup.foodstuff[m.source(id)];
			return src && V.options.images ? `img/misc/icon/${src.icon_path || "tending/" + src.icon}` : null;
		};
		/* Two-line readable identity for a material: "Mushroom" / "Root and umami · lasting". */
		function label(id) {
			const base = setup.foodstuff[m.source(id)]?.name || m.source(id);
			const title = base[0].toUpperCase() + base.slice(1);
			if (!id.startsWith("aroma~")) return { title, sub: "표준 아로마", full: title, description: setup.perfumeryExtractionUI.description(id) };
			const p = setup.perfumeryExtraction.resolve(id);
			const facets = p.selected.slice(0, 2).map(x => setup.perfumeryIdentity?.facetKr?.[x] || x).join(", ");
			const finish = { stability: "안정화", purity: "정제", yield: "아로마 추가" }[p.finish] || p.finish;
			return {
				title,
				sub: `${facets} · ${finish}`,
				full: m.name(id),
				description: setup.perfumeryExtractionUI.description(id, p),
			};
		}
		const stockLeft = () => Object.entries(s.extraction.stock).reduce((n, [id, amount]) => n + Math.max(0, amount - used(id)), 0);
		/* First-time guidance: Poppy at Poppy's table, the manual elsewhere. Gone after the first bottle. */
		const firstTime = station && !s.bottles.length && !s.journal.length;
		const poppyHere = station && V.perfumeryVenue === "poppy" && api.availableTeacher();

		const title = el("h2", station ? "향수 제작 탁자" : "향수 보관장", root);
		title.tabIndex = -1;
		/* Supplies are listed in the journal; the table only says what changed. */
		const status = el("p", "", root, "perf-status");
		status.setAttribute("role", "status");
		const notice = text => {
			status.textContent = text;
		};

		/* Lesson and collaboration briefs sit above the steps so they stay visible at every stage. */
		if (station) {
			const exercises = [
				"수업 1: 포피가 준 재료로 첫 향수를 만드십시오. 재료를 고르고 섞은 다음, 완성한 향수를 병에 담으십시오.",
				"수업 2: 앞서 만든 향수를 불러오십시오. 같은 재료를 쓰되, 각 재료의 양을 바꿔 보십시오. 재료를 오프닝, 하트, 베이스 사이에서 옮겨도 됩니다. 적어도 두 가지 재료는 같은 노트에 두십시오.",
				"수업 3: 이전 향수를 재료를 바꾸지 말고 불러오십시오. 블렌딩 단계에서 액체 설정을 열어 스피릿, 아로마 농도, 숙성 시간을 바꿔 보십시오.",
				"수업 4: 서로 다른 꽃으로 꽃향 향수를 만드십시오. 냄새가 서로 잘 어울리게 하고, 베이스 향이 더 오래가게 해 보십시오.",
				"포피의 수업을 모두 마쳤습니다! 집으로 찾아가 만든 향수에 대해 이야기를 나눌 수 있습니다.",
			];
			const brief = {
				opening: "포피의 예시 향수를 불러오십시오. 냄새 하나가 너무 강하거나 너무 답니다. 레시피를 바꿔 더 좋은 냄새가 나게 하십시오.",
				challenge: "당신이 직접 좋아하는 것을 바탕으로 향수를 만드십시오. 가장 좋아하는 재료를 골라 서로 잘 어울리게 해 보십시오.",
				gift: "앞서 포피에게 준 향수를 불러오십시오. 레시피의 한 부분을 바꾸고 결과가 어떻게 달라지는지 확인하십시오.",
				demonstration: "저장해 둔 향수 중 하나를 불러오십시오. 재료나 설정 하나를 바꾼 뒤, 무엇을 바꿨는지 포피에게 보여 주십시오.",
				rescue: "실패한 향수를 불러오십시오. 어떤 재료가 문제인지 찾아내고 레시피를 바꿔 냄새를 개선하십시오.",
				rivalry:
					"오프닝 노트에 데이지, 하트 노트에 장미, 베이스 노트에 난초를 넣은 향수를 만드십시오. 포피의 것보다 더 좋은 향수를 만들어 보십시오.",
			};
			if (s.session?.kind === "lesson" && s.session.stage === "compose") {
				const box = el("div", undefined, root, "perf-brief");
				el("p", exercises[s.lesson], box);
				if (s.lessonSample) button("지난 수업의 배합 불러오기", "sample", box);
			}
			if (s.session?.kind === "collaboration" && s.session.stage === "compose") {
				const box = el("div", undefined, root, "perf-brief");
				el("p", brief[s.session.approach] || brief.gift, box);
				button("포피의 기준 배합 불러오기", "reference", box);
			}
		}

		const results = el("section", undefined, null, "perf-results");
		const cabinet = el("section", undefined, null, "perf-cabinet");
		const journal = el("section", undefined, null, "perf-journal");
		let tabs, panels, coach;
		if (station) {
			const nav = el("div", undefined, root, "perf-stepper");
			nav.setAttribute("role", "tablist");
			nav.setAttribute("aria-label", "향수 제작 단계");
			tabs = {};
			stages.forEach(([id, name], i) => {
				const t = button("", "tab", nav, id, { cls: "perf-step" });
				t.setAttribute("role", "tab");
				t.id = `perf-tab-${id}`;
				t.setAttribute("aria-controls", `perf-panel-${id}`);
				el("span", String(i + 1), t, "perf-step-num");
				el("strong", name, t);
				el("small", "", t, "perf-step-state");
				tabs[id] = t;
			});
			coach = el("p", "", root, "perf-coach");
			panels = {};
			for (const [id] of stages) {
				const p = el("section", undefined, root, "perf-panel");
				p.id = `perf-panel-${id}`;
				p.setAttribute("role", "tabpanel");
				p.setAttribute("aria-labelledby", `perf-tab-${id}`);
				panels[id] = p;
			}
			panels.bottle.append(results);
			if (!d.tab || !panels[d.tab]) d.tab = units(d.formula) || stockLeft() ? "notes" : "prepare";
		} else root.append(cabinet, journal);

		/* Everything still missing before bottling, each with the step that fixes it. */
		function check() {
			const n = units(d.formula);
			const cost = safe(() => m.validate(d.formula));
			const blendDone = blending !== null && blended === JSON.stringify(d.formula);
			const lacks = [];
			if (!n) lacks.push({ text: "향수에 아로마를 하나 이상 넣으십시오.", fix: ["구성", "notes"] });
			if (n && !cost) lacks.push({ text: validateMessage(), fix: ["병 설정 바꾸기", "liquid"] });
			if (n && cost && !blendDone) lacks.push({ text: "향수를 블렌딩하십시오.", fix: ["블렌딩하기", "blend"] });
			if (s.containers < 1) lacks.push({ text: "빈 병이 없습니다. 화장품 가게에서 판매합니다." });
			if (cost && s.solvent[d.formula.solvent] < cost.solvent)
				lacks.push({
					text: `${({ soft: "소프트", clear: "클리어", bright: "브라이트" })[d.formula.solvent] || d.formula.solvent} 스피릿이 ${cost.solvent}단위 필요하지만 ${
						s.solvent[d.formula.solvent]
					}단위뿐입니다. 다른 스피릿을 고르거나 화장품 가게에서 더 사십시오.`,
					fix: ["다른 스피릿 고르기", "liquid"],
				});
			if (cost)
				for (const [id, amount] of Object.entries(cost.needed)) {
					const available = s.extraction.stock[id] || 0;
					if (available < amount)
						lacks.push({
							text: `${label(id).title} 아로마가 ${amount}단위 필요하지만 ${available}단위뿐입니다.`,
							fix: ["아로마 더 준비하기", "prepare"],
						});
				}
			if (s.bottles.length >= 24) lacks.push({ text: "보관장이 가득 찼습니다(24병). 먼저 보관장에서 하나를 버리십시오." });
			return { n, cost, blendDone, lacks, ready: !lacks.length };
		}
		function validateMessage() {
			try {
				m.validate(d.formula);
				return null;
			} catch (e) {
				return e.message;
			}
		}
		function renderProgress() {
			const c = check();
			const left = stockLeft();
			const state = {
				prepare: left ? `${left}단위 준비됨` : "아직 아로마 없음",
				notes: c.n ? `${plural(c.n, "단위")} 추가됨` : "비어 있음",
				blend: c.blendDone ? "블렌딩 완료" : c.n ? "블렌딩 전" : "아로마 필요",
				bottle: result ? "병입 완료" : c.ready ? "준비됨" : "준비 안 됨",
			};
			const done = { prepare: left > 0 || c.n > 0, notes: c.n > 0, blend: c.blendDone, bottle: !!result };
			for (const [id, name] of stages) {
				const on = d.tab === id;
				tabs[id].querySelector(".perf-step-state").textContent = state[id];
				tabs[id].classList.toggle("perf-step-done", done[id]);
				tabs[id].setAttribute("aria-selected", String(on));
				tabs[id].setAttribute("aria-label", `${name}: ${state[id]}`);
				tabs[id].tabIndex = on ? 0 : -1;
			}
			for (const id of Object.keys(panels)) panels[id].hidden = d.tab !== id;
			renderCoach(c);
		}
		function renderCoach(c) {
			coach.hidden = true;
			if (!firstTime || result || d.tab === "blend") return;
			const lines = poppyHere
				? {
						prepare: '"먼저 꽃을 하나 골라 봐. 아로마를 모으기 전에 원하지 않는 냄새는 뺄 수 있어."',
						notes: c.n
							? '"첫 향수에 쓸 재료는 충분히 넣었어. 이제 블렌딩으로 가 봐."'
							: '"이제 향수의 중심이 될 냄새를 골라 봐. 하트를 선택하고, 모아 둔 아로마를 눌러서 넣으면 돼."',

						bottle: '"향수를 병에 담을 준비가 됐어. 병입을 마치고 나한테 향을 맡게 해 줘."',
				  }
				: {
						prepare: "꽃을 고르고 냄새를 확인하십시오. 아로마를 모으기 전에 원하지 않는 냄새 부분은 빼십시오.",
						notes: c.n ? "첫 향수에 충분한 재료가 있습니다. 블렌딩으로 가십시오." : "하트를 선택하고, 모아 둔 아로마를 눌러 향수에 넣으십시오.",
						bottle: "넣은 재료를 확인한 뒤 향수를 병에 담으십시오.",
				  };
			if (!lines[d.tab]) return;
			coach.hidden = false;
			coach.replaceChildren();
			el("strong", poppyHere ? "포피: " : "안내: ", coach);
			coach.append(lines[d.tab]);
		}
		function head(panel, id, need) {
			const box = el("div", undefined, panel, "perf-stage-head");
			const [, name, what] = stages.find(x => x[0] === id);
			el("small", `${stages.findIndex(x => x[0] === id) + 1}단계 / 총 ${stages.length}단계`, box, "perf-stage-number");
			el("h3", name, box);
			el("p", what + ".", box);
			if (need) el("p", need, box, "perf-need");
			return box;
		}
		function foot(panel, back, next, nextLabel, enabled = true) {
			const row = el("div", undefined, panel, "perf-stage-foot");
			if (back) button(`${stages.find(x => x[0] === back)[1]} 단계로 돌아가기`, "tab", row, back);
			if (next) {
				const b = button(nextLabel, "tab", row, next, { cls: "perf-primary" });
				b.disabled = !enabled;
			}
		}

		// Bottle height shows fill; colour and meters come from the calculated scent.
		const svgNS = "http://www.w3.org/2000/svg";
		const svg = (tag, attrs, parent) => {
			const n = document.createElementNS(svgNS, tag);
			for (const [k, v] of Object.entries(attrs)) n.setAttribute(k, String(v));
			if (parent) parent.append(n);
			return n;
		};
		let stageId = 0;
		function bottleStage(parent, p = null) {
			const c = check();
			p ??= c.n ? safe(() => m.calculate(d.formula, blending ?? 0.5)) : null;
			const box = el("div", undefined, parent, "perf-stage");
			const art = el("div", undefined, box, "perf-bottle-art");
			const id = `perf-clip-${++stageId}`;
			const g = svg("svg", { viewBox: "0 0 220 300", "aria-hidden": "true", class: "perf-bottle-svg" }, art);
			const defs = svg("defs", {}, g);
			svg("rect", { x: 31, y: 84, width: 158, height: 200, rx: 30 }, svg("clipPath", { id }, defs));
			svg("rect", { x: 93, y: 22, width: 34, height: 50, rx: 6, fill: "#bdb39a", stroke: "#e3d4a3" }, g);
			svg("rect", { x: 78, y: 14, width: 64, height: 24, rx: 6, fill: "#d6c08e", stroke: "#eacb95", "stroke-width": 2 }, g);
			svg("rect", { x: 31, y: 84, width: 158, height: 200, rx: 30, fill: "#d6e4cd22", stroke: "#c2d1c2", "stroke-width": 3 }, g);
			const fill = c.n ? Math.min(1, ((c.n * 100) / d.formula.concentration / d.formula.capacity) * 1) : 0;
			const height = 18 + fill * 170;
			const clip = svg("g", { "clip-path": `url(#${id})` }, g);
			/* Three bands, base at the bottom, each as tall as that note's share. */
			let y = 284;
			for (const l of ["base", "heart", "top"]) {
				const share = c.n ? Object.values(d.formula[l]).reduce((a, b) => a + b, 0) / c.n : l === "base" ? 1 : 0;
				const h = height * share;
				y -= h;
				if (h > 0)
					svg(
						"rect",
						{ x: 31, y, width: 158, height: h, fill: p?.colour || "#8c9860", opacity: { base: 0.95, heart: 0.8, top: 0.62 }[l], class: "perf-liquid" },
						clip
					);
			}
			if (c.n) {
				const bubbles = svg("g", { class: "perf-bubbles", fill: "#f9edc6" }, clip);
				for (const [cx, r] of [
					[70, 3],
					[110, 2.4],
					[150, 3.4],
					[90, 2],
				])
					svg("circle", { cx, cy: 276, r }, bubbles);
			}
			svg("path", { d: "M46 103 Q39 131 46 248", fill: "none", stroke: "#fcffe6", "stroke-width": 8, opacity: 0.16, "stroke-linecap": "round" }, g);
			svg("rect", { x: 60, y: 170, width: 100, height: 46, rx: 3, fill: "#f0e2c2", opacity: 0.9 }, g);
			const name = svg("text", { x: 110, y: 198, "text-anchor": "middle", "font-size": 11, fill: "#3d493d" }, g);
			name.textContent = (p?.name || "제목 없음").slice(0, 18);
			art.classList.toggle("perf-shaking", timing.running);
			const caption = el("div", undefined, box, "perf-stage-caption");
			el("strong", p ? p.name : c.n ? "준비 안 됨" : "빈 병", caption);
			el(
				"small",
				p
					? `아로마 ${c.n}단위, 농도 ${d.formula.concentration}%, ${({ soft: "소프트", clear: "클리어", bright: "브라이트" })[d.formula.solvent] || d.formula.solvent} 스피릿.`
					: c.n
					? c.lacks[0]?.text || ""
					: "아로마를 눌러 넣으십시오.",
				caption
			);
			const meters = el("dl", undefined, box, "perf-meters");
			const meter = (k, v, text) => {
				const row = el("div", undefined, meters);
				el("dt", k, row);
				const dd = el("dd", undefined, row);
				const track = el("span", undefined, dd, "perf-track");
				track.setAttribute("aria-hidden", "true");
				el("i", undefined, track).style.width = `${Math.round(clamp01(v) * 100)}%`;
				el("b", p ? text || (advanced ? `${Math.round(clamp01(v) * 100)}%` : meterWord(v)) : "-", dd);
			};
			meter("존재감", p ? p.intensity / 2.6 : 0, p ? (p.intensity < 0.9 ? "은은함" : p.intensity < 1.8 ? "뚜렷함" : "강함") : null);
			meter("지속 시간", p ? p.duration / 720 : 0, p ? hours(p.duration) : null);
			meter("단맛", p ? p.sweet : 0, p ? (p.sweet < 0.3 ? "낮음" : p.sweet < 0.65 ? "보통" : "높음") : null);
			meter("동물 호감도", p ? Math.max(0, p.animal) : 0, p ? (p.animal < 0.3 ? "낮음" : p.animal < 0.65 ? "보통" : "높음") : null);
			const help = el("details", undefined, box, "perf-property-help");
			el("summary", "이 수치들의 의미", help);
			el(
				"p",
				"존재감은 다른 사람이 향수 냄새를 얼마나 쉽게 맡을 수 있는지를 나타냅니다. 향이 강하면 더 많은 사람이 당신을 알아챌 수 있지만, 지나치게 진한 향을 싫어하는 사람도 있습니다.",
				help
			);
			el("p", "지속 시간은 건조한 환경에서 한 번 뿌린 향이 유지되는 시간입니다. 비가 오면 두 배 빨리 사라지고, 씻으면 지워집니다.", help);
			el(
				"p",
				"단맛은 냄새가 얼마나 달콤한지만 나타냅니다. 사람과 동물마다 좋아하는 냄새가 다르므로 단맛이 높다고 더 좋은 향수라는 뜻은 아닙니다.",
				help
			);
			el(
				"p",
				"동물 호감도는 동물이 보이는 반응의 일부일 뿐입니다. 동물과의 만남이 켜져 있으면 전체 향이 바깥에서 당신을 더 쉽게 또는 더 어렵게 찾게 만들 수 있으며, 동물의 종류와 몸을 숨겼는지 여부, 약해지는 향의 세기도 영향을 줍니다.",
				help
			);
			return box;
		}

		/* Prepare: the extraction minigame, mounted once per workstation visit. */
		let extractionUI = null;
		function renderPrepare() {
			const panel = panels.prepare;
			if (extractionUI) return;
			head(
				panel,
				"prepare",
				"재료를 모으기 전에 그 냄새를 살펴보십시오. 모으는 데에는 재료 하나가 쓰이고 표시된 시간이 걸립니다. 둘러보거나 선택을 바꾸는 데에는 아무것도 들지 않습니다."
			);
			extractionUI = setup.perfumeryExtractionUI.mount(
				panel,
				signal,
				next => {
					catalogue = buildCatalogue();
					if (next) {
						d.tab = next;
						d.filters.owned = true;
						renderAll();
						focusAfter(`#perf-tab-${next}`);
					} else renderProgress();
				},
				{ advanced }
			);
			if (stockLeft()) foot(panel, null, "notes", "구성으로 계속");
		}

		function renderNotes() {
			const panel = panels.notes;
			panel.replaceChildren();
			const total = units(d.formula);
			const ready = stockLeft();
			head(
				panel,
				"notes",
				`노트를 고른 뒤 아로마를 누르면 1단위가 들어갑니다. 1단위는 준비한 향의 제작 단위 하나이며, 지금 쓸 수 있는 양은 ${plural(
					ready,
					"단위"
				)}입니다. 병입하기 전에는 아무것도 소모되지 않습니다.`
			);
			const bench = el("div", undefined, panel, "perf-workbench");
			const drawer = el("section", undefined, bench, "perf-drawer");
			if (!ready && !catalogue.some(e => e.kind === "raw" && left(e) > 0)) {
				const empty = el("div", undefined, drawer, "perf-callout");
				el("p", total ? "준비한 아로마를 모두 썼습니다." : "준비한 아로마가 아직 없습니다. 아로마는 꽃과 음식으로 만듭니다.", empty);
				button("아로마 준비하기", "tab", empty, "prepare", { cls: "perf-primary" });
			} else renderBrowser(drawer);
			bottleStage(bench);
			const chambers = el("section", undefined, bench, "perf-chambers");
			for (const l of m.layers) chamber(chambers, l, total);
			const tools = el("div", undefined, panel, "perf-steps");
			if (d.undo.length) button("되돌리기", "undo", tools);
			foot(panel, "prepare", total ? "blend" : null, "블렌딩으로 계속");
		}
		function chamber(parent, l, total) {
			const count = Object.values(d.formula[l]).reduce((a, b) => a + b, 0);
			const card = el("section", undefined, parent, `perf-chamber perf-${l}`);
			card.dataset.drop = l;
			const pick = button("", "layer", card, l, { cls: "perf-chamber-head" });
			pick.setAttribute("aria-pressed", String(d.layer === l));
			el("strong", `${layerName[l]} 노트`, pick);
			el("span", d.layer === l ? "여기에 추가 중" : `${count}단위`, pick, "perf-chamber-tag");
			el("small", layerHint[l], card);
			const list = el("ul", undefined, card, "perf-chips");
			if (!count) el("li", d.layer === l ? "아로마를 눌러 여기에 넣으십시오." : "이 노트를 고른 뒤 아로마를 누르십시오.", list, "perf-empty");
			for (const [id, n] of Object.entries(d.formula[l])) {
				const info = label(id);
				const chip = el("li", undefined, list, "perf-chip");
				const src = iconOf(id);
				if (src) Object.assign(el("img", undefined, chip, "icon"), { src, alt: "" });
				const name = el("span", info.title, chip, "perf-chip-name");
				name.title = info.full;
				button("−", "minus", chip, id, { layer: l, label: `${info.full} 하나 줄이기`, cls: "perf-mini" });
				el("output", String(n), chip).setAttribute("aria-label", `${info.full} ${n}단위`);
				button("+", "plus", chip, id, { layer: l, label: `${info.full} 하나 늘리기`, cls: "perf-mini" });
				const moveLabel = el("label", undefined, chip, "perf-move");
				el("span", "옮길 노트", moveLabel, "perf-sr");
				const move = el("select", undefined, moveLabel);
				move.dataset.move = id;
				move.dataset.from = l;
				move.setAttribute("aria-label", `${info.full} 다른 노트로 옮기기`);
				for (const note of m.layers) {
					const o = el("option", layerName[note], move);
					o.value = note;
				}
				move.value = l;
				button("✕", "remove", chip, id, { layer: l, label: `${info.full} 빼기`, cls: "perf-mini" });
			}
			const share = el("div", undefined, card, "perf-track");
			share.setAttribute("aria-hidden", "true");
			el("i", undefined, share).style.width = `${total ? (count / total) * 100 : 0}%`;
		}

		/* Owned extracts, basic aromas, and extractable sources. Rebuilt when an aroma is collected,
		   so a vial prepared during this visit shows up in Compose straight away. */
		const buildCatalogue = () =>
			station
				? (() => {
						const entries = [];
						const seen = new Set();
						for (const id of [...Object.keys(s.extraction.stock), ...Object.keys(m.ingredients)]) {
							if (seen.has(id) || !m.material(id)) continue;
							seen.add(id);
							const info = label(id);
							const mat = m.material(id);
							entries.push({
								id,
								kind: id.startsWith("aroma~") ? "extract" : "raw",
								...info,
								family: mat.family,
								affinity: mat.affinity,
								intensity: mat.intensity,
							});
						}
						const registry = setup.perfumeryExtraction.registry();
						for (const src of Object.keys(registry)) {
							const name = setup.foodstuff[src]?.name || src;
							entries.push({
								id: src,
								kind: "source",
								title: name[0].toUpperCase() + name.slice(1),
								sub: "아직 준비하지 않음",
								description: setup.perfumeryExtractionUI.description(src),
								full: name,
								family: "",
								affinity: "",
							});
						}
						for (const e of entries) e.search = `${e.full} ${e.sub} ${e.family} ${fam(e.family)} ${scent(e.family)}`.toLowerCase();
						return entries;
				  })()
				: [];
		let catalogue = buildCatalogue();
		function left(entry) {
			if (entry.kind === "source") return V.foodstuff[entry.id]?.amount || 0;
			return (s.extraction.stock[entry.id] || 0) - used(entry.id);
		}
		function renderBrowser(box) {
			const f = d.filters;
			el("h4", `내 아로마: ${layerName[d.layer].toLowerCase()} 노트에 추가 중`, box);
			const controls = el("div", undefined, box, "perf-filters");
			const search = el("label", undefined, controls, "perf-search");
			el("span", "검색", search, "perf-sr");
			const q = el("input", undefined, search);
			Object.assign(q, { type: "search", value: f.q, placeholder: "아로마 검색", enterKeyHint: "search", autocomplete: "off" });
			q.setAttribute("aria-label", "내 아로마 검색");
			q.dataset.filter = "q";
			const more = el("details", undefined, controls, "perf-more-filters");
			more.open = !!(f.family || f.affinity || f.kind || f.sort !== "name" || !f.owned);
			el("summary", "필터와 정렬", more);
			const extra = el("div", undefined, more, "perf-filters");
			const ownedLabel = el("label", undefined, extra, "perf-check");
			const owned = el("input", undefined, ownedLabel);
			owned.type = "checkbox";
			owned.checked = f.owned;
			owned.dataset.filter = "owned";
			ownedLabel.append(" 가진 것만");
			const select = (labelText, key, options) => {
				const wrap = el("label", undefined, extra);
				el("span", labelText, wrap);
				const sel = el("select", undefined, wrap);
				sel.dataset.filter = key;
				for (const [v, t] of options) {
					const o = el("option", t, sel);
					o.value = v;
				}
				sel.value = f[key];
			};
			const families = [...new Set(catalogue.map(e => e.family).filter(Boolean))].sort();
			select("향 계열", "family", [["", "모든 계열"], ...families.map(x => [x, fam(x)])]);
			select("어울리는 노트", "affinity", [["", "모든 노트"], ...m.layers.map(l => [l, layerName[l]])]);
			select("표시", "kind", [
				["", "준비한 아로마 전체"],
				["extract", "맞춤 추출물"],
				["raw", "표준 아로마"],
				["source", "준비할 재료"],
			]);
			select("정렬", "sort", [
				["name", "이름"],
				["left", "남은 양"],
				["family", "향 계열"],
				["affinity", "이 노트에 가장 알맞은 순"],
			]);
			const list = el("ul", undefined, box, "perf-tiles");
			renderCards(list);
		}
		function renderCards(list) {
			const f = d.filters;
			const q = f.q.trim().toLowerCase();
			let rows = catalogue.filter(
				e =>
					(f.kind ? e.kind === f.kind : e.kind !== "source") &&
					(!f.family || e.family === f.family) &&
					(!f.affinity || e.affinity === f.affinity) &&
					(!q || e.search.includes(q)) &&
					(!f.owned || left(e) > 0)
			);
			const by = {
				name: (a, b) => a.title.localeCompare(b.title) || a.sub.localeCompare(b.sub),
				left: (a, b) => left(b) - left(a),
				family: (a, b) => a.family.localeCompare(b.family) || a.title.localeCompare(b.title),
				affinity: (a, b) => (b.affinity === d.layer) - (a.affinity === d.layer) || a.title.localeCompare(b.title),
			}[f.sort];
			rows = rows.sort(by);
			list.replaceChildren();
			list.dataset.count = String(rows.length);
			const pager = list.nextElementSibling?.classList.contains("perf-pager") ? list.nextElementSibling : null;
			pager?.remove();
			if (!rows.length) {
				el("li", "일치하는 항목이 없습니다. 검색어를 지우거나 필터를 바꾸십시오.", list, "perf-empty perf-tiles-empty");
				return;
			}
			const pages = Math.ceil(rows.length / PAGE);
			d.page = Math.min(d.page, pages - 1);
			for (const e of rows.slice(d.page * PAGE, d.page * PAGE + PAGE)) {
				const li = el("li", undefined, list);
				const n = left(e);
				const source = e.kind === "source";
				const tile = button("", source ? "extractSource" : "add", li, e.id, {
					cls: "perf-tile",
					label: source ? `아로마 준비: ${e.full}` : `${e.full} 추가: ${({ top: "오프닝", heart: "하트", base: "베이스" })[d.layer] || d.layer} 노트, ${n}단위 남음`,
				});
				if (!source) {
					tile.draggable = n > 0 && window.matchMedia("(pointer: fine)").matches;
					tile.disabled = n <= 0;
				}
				const src = iconOf(e.id);
				if (src) Object.assign(el("img", undefined, tile, "icon"), { src, alt: "", draggable: false });
				el("strong", e.title, tile);
				el("small", source ? `재고 ${n}개` : `${n}단위 남음 · ${fam(e.family)}`, tile);
				el("small", e.description, tile, "perf-aroma-description");
				tile.title = source ? `${e.full} 준비` : `${e.full}. ${({ top: "오프닝", heart: "하트", base: "베이스" })[e.affinity] || e.affinity} 노트에 가장 잘 어울립니다.`;
			}
			if (pages > 1) {
				const nav = el("div", undefined, null, "perf-pager");
				list.after(nav);
				button("이전", "page", nav, "-1").disabled = d.page === 0;
				el("span", `${d.page + 1} / ${pages}`, nav);
				button("다음", "page", nav, "1").disabled = d.page >= pages - 1;
			}
		}

		/* Liquid settings: a one-line recommended default, with the precise controls folded away. */
		function renderLiquid(panel, c) {
			const f = d.formula;
			const sv = m.solvents[f.solvent];
			const box = el("details", undefined, panel, "perf-liquid");
			box.open = liquidOpen || (c.n > 0 && !c.cost);
			box.dataset.liquid = "1";
			el("summary", "병 설정", box);
			el(
				"p",
				`스피릿: ${sv.name.replace("조향용 ", "").replace(" 스피릿", "")} · 아로마 ${f.concentration}% · ${f.capacity}단위 병. ${
					f.age ? `${f.age}일 동안 숙성시킵니다.` : "숙성 시간은 필요하지 않습니다."
				}`,
				box
			);
			el(
				"p",
				"간단한 첫 향수라면 클리어 스피릿, 농도 20%, 40단위 병, 숙성 없음으로 설정하십시오. 현재 설정을 그대로 두거나 아래에서 조정해도 됩니다.",
				box,
				"perf-hint"
			);
			const isDefault = f.solvent === "clear" && f.concentration === 20 && f.capacity === 40 && f.age === 0;
			if (!isDefault) button("권장 설정 사용", "defaults", box);
			const fieldset = (legend, cls) => {
				const fs = el("fieldset", undefined, box, cls);
				el("legend", legend, fs);
				return fs;
			};
			const solvents = fieldset("스피릿", "perf-options");
			for (const [id, spirit] of Object.entries(m.solvents)) {
				const lab = el("label", undefined, solvents, "perf-option");
				const r = el("input", undefined, lab);
				Object.assign(r, { type: "radio", name: "perf-solvent", value: id, checked: f.solvent === id });
				r.dataset.control = "solvent";
				const body = el("span", undefined, lab);
				el("strong", spirit.name, body);
				el(
					"span",
					`${spirit.projection < 1 ? "냄새가 더 은은해지고" : spirit.projection > 1.2 ? "냄새가 더 뚜렷해지고" : "냄새 세기가 보통이고"}, ${
						spirit.evaporation < 1 ? "천천히 사라집니다" : spirit.evaporation > 1.1 ? "더 빨리 사라집니다" : "보통 속도로 사라집니다"
					}${spirit.purity > 0.9 ? ". 아주 진하면 냄새가 날카로워집니다" : ""}.`,
					body
				);
				el("small", `보유 ${s.solvent[id]}${c.cost && f.solvent === id ? `, 필요 ${c.cost.solvent}` : ""}.`, body);
			}
			const conc = fieldset("아로마 농도", "perf-range");
			const rangeLabel = el("label", undefined, conc);
			el("span", `${concentrationWord(f.concentration)} (아로마 ${f.concentration}%)`, rangeLabel, "perf-range-value");
			const range = el("input", undefined, rangeLabel);
			Object.assign(range, { type: "range", min: "10", max: "40", step: "1", value: String(f.concentration) });
			range.dataset.control = "concentration";
			range.setAttribute("aria-valuetext", `${concentrationWord(f.concentration)}, ${f.concentration}%`);
			el(
				"small",
				"농도는 완성된 액체에서 아로마가 차지하는 비율입니다. 농도를 높이면 향이 더 강하고 오래갑니다. 같은 아로마에 쓰는 스피릿이 줄고 사용 횟수도 줄지만, 같은 병에 아로마를 더 넣을 여유가 생깁니다.",
				conc,
				"perf-hint"
			);
			const caps = fieldset("병 크기", "perf-options perf-options-row");
			for (const n of [20, 40, 60]) {
				const lab = el("label", undefined, caps, "perf-option");
				const r = el("input", undefined, lab);
				Object.assign(r, { type: "radio", name: "perf-capacity", value: String(n), checked: f.capacity === n });
				r.dataset.control = "capacity";
				el("strong", `${n}단위`, el("span", undefined, lab));
			}
			if (c.cost)
				el(
					"small",
					`현재 배합으로 완성된 액체는 ${c.cost.volume.toFixed(1)}단위이며, ${plural(
						Math.max(1, Math.floor(c.cost.volume / 4)),
						"회"
					)} 뿌릴 만큼입니다. 병 크기는 실제로 만든 양과 다릅니다.`,
					caps,
					"perf-hint"
				);
			const ages = fieldset("숙성", "perf-options perf-options-row");
			const base = c.n ? safe(() => m.calculate({ ...f, age: 0 }, 0.7, 0)) : null;
			for (const n of [0, 1, 3, 7, 14]) {
				const lab = el("label", undefined, ages, "perf-option");
				const r = el("input", undefined, lab);
				Object.assign(r, { type: "radio", name: "perf-age", value: String(n), checked: f.age === n });
				r.dataset.control = "age";
				const body = el("span", undefined, lab);
				el("strong", n ? plural(n, "일") : "없음", body);
				const p = base && n ? safe(() => m.calculate({ ...f, age: n }, 0.7, n)) : null;
				if (p) {
					const dq = p.quality - base.quality;
					el(
						"small",
						advanced
							? `균형 ${dq >= 0 ? "+" : ""}${Math.round(dq)}, 안정성 ${Math.round(p.stability * 100)}%`
							: dq > 2
							? "더 부드러워짐"
							: dq < -1
							? "신선한 향이 약해짐"
							: "변화 적음",
						body
					);
				}
			}
			el(
				"small",
				"숙성하면 블렌드가 더 부드러워질 수 있지만, 너무 오래 두면 신선한 향이 무뎌집니다. 정한 일수가 지나기 전에는 병입한 향수를 뿌릴 수 없습니다.",
				ages,
				"perf-hint"
			);
			if (c.cost) {
				const cmp = el("details", undefined, box, "perf-compare");
				cmp.open = !!d.pinned;
				el("summary", "이전 버전과 비교", cmp);
				const row = el("div", undefined, cmp, "perf-steps");
				button("이 버전 기억", "pin", row);
				if (d.pinned) button("기억해 둔 버전과 바꾸기", "swap", row);
				if (d.pinned) el("p", comparisonText(), cmp, "perf-comparison").setAttribute("aria-live", "polite");
			}
		}
		function comparisonText() {
			const now = safe(() => m.calculate(d.formula));
			const before = safe(() => m.calculate(d.pinned));
			if (!now || !before) return "비교하려면 현재 배합을 유효하게 만드십시오.";
			const diff = (a, b, small, more, less, same) => (Math.abs(a - b) < small ? same : a > b ? more : less);
			return `기억해 둔 버전과 비교: ${diff(
				now.intensity,
				before.intensity,
				0.02,
				"오프닝이 더 강함",
				"오프닝이 더 약함",
				"오프닝이 비슷함"
			)}, ${diff(now.duration, before.duration, 2, "더 오래감", "더 빨리 사라짐", "지속 시간 비슷함")}, ${diff(
				now.quality,
				before.quality,
				0.2,
				"더 부드러움",
				"더 거침",
				"균형 비슷함"
			)}.${
				knowledge >= 3 ? ` 균형 ${Math.round(before.quality)} → ${Math.round(now.quality)}, 지속 시간 ${hours(before.duration)} → ${hours(now.duration)}.` : ""
			}`;
		}

		// Three timing passes set craftsmanship within the engine's 0.35 to 0.95 range.
		const reduced = window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
		function passScore(pos, pass) {
			return clamp01(1 - Math.max(0, Math.abs(pos - zones[pass]) - 9) / 38);
		}
		function renderBlend() {
			const panel = panels.blend;
			panel.replaceChildren();
			const c = check();
			head(panel, "blend", null);
			if (!c.n) {
				const empty = el("div", undefined, panel, "perf-callout");
				el("p", "아직 블렌딩할 것이 없습니다.", empty);
				button("먼저 향수 구성하기", "tab", empty, "notes", { cls: "perf-primary" });
				return;
			}
			const bench = el("div", undefined, panel, "perf-workbench perf-workbench-two perf-blend-bench");
			bottleStage(bench);
			const side = el("section", undefined, bench, "perf-blend");
			if (!c.cost) {
				renderLiquid(side, c);
				return foot(panel, "notes", null);
			}
			if (c.blendDone) {
				el("h4", "블렌딩이 끝났습니다", side, "perf-done");
				const untimed = timing.scores.length === 0;
				el(
					"p",
					untimed
						? "타이밍 없이 꾸준하고 무난한 정성으로 블렌딩을 마친다. 타이밍을 정확히 맞추면 혼합물이 더 부드러워질 수 있다."
						: blending >= 0.86
						? "안정된 손놀림으로 모든 것을 섞는다. 노트들이 부드럽게 어우러져, 레시피가 낼 수 있는 최고의 결과가 나온다."
						: blending >= 0.65
						? "섞기를 마치지만, 타이밍이 더 안정적이었다면 노트들이 더 부드럽게 어우러졌을 것이다."
						: "타이밍이 어긋나 혼합물이 고르지 않다. 다시 블렌딩해 보거나, 병에 담아 레시피가 어떤 결과를 내는지 볼 수 있다.",
					side,
					"perf-blend-assessment"
				);
				el("p", "병입으로 넘어가 재료를 확인하고 향수를 봉하십시오. 아직 아무것도 소모되지 않았습니다.", side, "perf-hint");
				button("다시 블렌딩", "reblend", side);
				renderLiquid(side, c);
				return foot(panel, "notes", "bottle", "병입으로 계속");
			}
			const pass = timing.scores.length;
			const track = el("ol", undefined, side, "perf-stage-track");
			passes.forEach(([name], i) => {
				const li = el("li", undefined, track);
				el("strong", name, li);
				el(
					"small",
					i < pass
						? timing.scores[i] >= 0.85
							? "부드럽게 블렌딩됨"
							: timing.scores[i] >= 0.5
							? "약간 고르지 않음"
							: "고르지 않음"
						: i === pass
						? timing.running
							? "블렌딩 중"
							: "블렌딩 준비됨"
						: "아직 블렌딩 전",
					li
				);
				if (i < pass) li.className = "perf-stage-done";
				if (i === pass) {
					li.className = "perf-stage-now";
					li.setAttribute("aria-current", "step");
				}
			});
			const [passName, layer] = passes[pass];
			el("h4", `${pass + 1} / ${passes.length} · ${passName} 노트`, side, "perf-pass-title");
			el("p", layerHint[layer], side, "perf-note-description");
			el("p", noteCharacter(layer), side, "perf-need");
			el(
				"p",
				"블렌딩 시작을 누르고 흰색 표시가 막대를 가로질러 움직이는 모습을 지켜보십시오. 금색 구역에 닿으면 정지를 누르십시오. 한 번 더 지나가기를 기다려도 됩니다.",
				side,
				"perf-timing-instructions"
			);
			const bar = el("div", undefined, side, "perf-meter");
			bar.setAttribute("aria-hidden", "true");
			const zone = el("i", undefined, bar, "perf-zone");
			zone.style.left = `${zones[pass] - 9}%`;
			zone.textContent = "정지";
			const needle = el("b", undefined, bar, "perf-needle");
			needle.style.transform = `translateX(${timing.pos}%)`;
			const row = el("div", undefined, side, "perf-steps");
			button(timing.running ? "정지" : pass ? "다음 노트 블렌딩" : "블렌딩 시작", timing.running ? "stopBlend" : "startBlend", row, undefined, {
				cls: "perf-primary perf-blend-go",
			});
			const feedback = el(
				"p",
				timing.last || (timing.running ? "냄새들이 섞이기 시작하는 가운데 혼합물을 부드럽게 젓는다." : ""),
				side,
				"perf-timing-feedback"
			);
			feedback.setAttribute("aria-live", "polite");
			feedback.hidden = !timing.last && !timing.running;
			const lastScore = timing.scores.at(-1);
			if (lastScore !== undefined) feedback.dataset.result = lastScore >= 0.85 ? "smooth" : lastScore >= 0.5 ? "close" : "uneven";
			if (!timing.running) {
				const quick = el("details", undefined, side, "perf-quick-blend");
				el("summary", "타이밍 도전 없이 블렌딩", quick);
				el(
					"p",
					"타이밍 없는 블렌딩은 블렌딩 정성이 55%로 고정된 결과를 냅니다. 타이밍을 맞추면 더 좋거나 더 나쁜 결과가 나올 수 있으며, 정확히 멈출수록 블렌드가 더 부드러워집니다. 어느 쪽이든 추가 재료는 소모되지 않습니다.",
					quick
				);
				button("타이밍 없이 블렌딩", "gentle", quick);
			}
			renderLiquid(side, c);
			foot(panel, "notes", null);
		}
		function noteCharacter(l) {
			const ids = Object.keys(d.formula[l]);
			if (!ids.length) return "이 노트에는 배정한 아로마가 없습니다. 그래도 이 블렌딩 단계는 혼합물 전체에 영향을 줍니다.";
			if (ids.length === 1) return label(ids[0]).description;
			return `이 노트에 쓰는 아로마: ${ids
				.map(id => label(id).title)
				.join(", ")
				.replace(/, ([^,]+)$/, ", $1")}.`;
		}
		function startTiming() {
			timing.running = true;
			timing.start = performance.now();
			timing.pos = 0;
			timing.direction = 1;
			/* Each pass is a little faster. Reduced motion slows it right down instead of removing it. */
			const period = (reduced ? 1600 : 620) - timing.scores.length * 60;
			renderBlend();
			root.classList.add("perf-blending");
			const needle = panels.blend.querySelector(".perf-needle");
			const step = now => {
				if (!timing.running || !needle.isConnected) return;
				const next = (Math.sin((now - timing.start) / period - Math.PI / 2) + 1) * 50;
				timing.direction = next >= timing.pos ? 1 : -1;
				timing.pos = next;
				needle.style.transform = `translateX(${timing.pos}%)`;
				timing.raf = requestAnimationFrame(step);
			};
			timing.raf = requestAnimationFrame(step);
		}
		function stopTiming() {
			cancelAnimationFrame(timing.raf);
			timing.running = false;
			root.classList.remove("perf-blending");
			const pass = timing.scores.length;
			const score = passScore(timing.pos, pass);
			timing.scores.push(score);
			const early = (timing.pos - zones[pass]) * timing.direction < 0;
			timing.last = `${passes[pass][0]} ${Object.keys(d.formula[passes[pass][1]]).length ? "노트" : "단계"}: ${
				score >= 0.85
					? "딱 맞는 순간에 멈춘다. 혼합물의 이 부분이 부드럽게 하나로 어우러진다."
					: score >= 0.5
					? `조금 ${early ? "일찍" : "늦게"} 멈춘다. 블렌드의 이 부분은 하나로 어우러지지만 더 부드러울 수 있다.`
					: "타이밍이 어긋나 혼합물의 이 부분이 고르지 않다."
			}`;
			if (timing.scores.length === 3) {
				blending = 0.35 + (timing.scores.reduce((a, b) => a + b, 0) / 3) * 0.6;
				blended = JSON.stringify(d.formula);
			}
		}

		/* Bottle: one checklist with a way to fix each gap, then a preview and the only spending button. */
		function renderBottle() {
			const panel = panels.bottle;
			for (const child of [...panel.children]) if (child !== results) child.remove();
			if (result) return;
			results.replaceChildren();
			const c = check();
			const top = el("div", undefined, null);
			panel.insertBefore(top, results);
			head(top, "bottle", null);
			if (c.lacks.length) {
				el("h4", c.lacks.length === 1 ? "병입 전에 한 가지가 남았습니다" : "병입 전에", top);
				const list = el("ul", undefined, top, "perf-checklist");
				for (const lack of c.lacks) {
					const li = el("li", undefined, list, "perf-missing");
					el("span", lack.text, li, "perf-lack");
					if (lack.fix) button(lack.fix[0], lack.fix[1] === "liquid" ? "openLiquid" : "tab", li, lack.fix[1] === "liquid" ? "blend" : lack.fix[1]);
				}
				return;
			}
			const p = safe(() => m.calculate(d.formula, Math.min(1, blending * 0.9 + s.skill / 1000)));
			const bench = el("div", undefined, top, "perf-workbench perf-workbench-two");
			bottleStage(bench, p);
			const side = el("div", undefined, bench);
			if (p) el("p", qualityAssessment(p), side, "perf-quality-assessment");
			if (p?.description) el("p", p.description, side);
			if (d.formula.age)
				el("p", "이 미리 보기는 정한 숙성 시간이 지난 뒤의 향수를 설명합니다. 갓 담은 병은 숙성되는 동안 냄새가 다를 것입니다.", side, "perf-hint");
			if (p) {
				const facts = el("dl", undefined, side, "perf-facts");
				const fact = (k, v) => {
					el("dt", k, facts);
					el("dd", v, facts);
				};
				fact("존재감", projectionWord(p.intensity));
				fact("1회 뿌릴 때 지속 시간", hours(p.duration));
				fact("사용 가능", d.formula.age ? `${d.formula.age}일 뒤` : "바로");
			}
			const cost = el("div", undefined, side, "perf-costs");
			el("h4", "병입에 쓰이는 것", cost);
			const ul = el("ul", undefined, cost);
			el("li", `빈 병 1개 (보유 ${s.containers}개)`, ul);
			el("li", `${({ soft: "소프트", clear: "클리어", bright: "브라이트" })[d.formula.solvent] || d.formula.solvent} 스피릿 ${c.cost.solvent}단위 (보유 ${s.solvent[d.formula.solvent]}단위)`, ul);
			for (const [id, n] of Object.entries(c.cost.needed)) el("li", `${label(id).title} 아로마 ${n}단위`, ul);
			el("li", "병입에는 20분이 걸립니다.", ul);
			button("향수 병입", "craft", side, undefined, { cls: "perf-primary perf-big" });
		}
		function renderResult(bottle) {
			const p = api.properties(bottle);
			const panel = panels.bottle;
			for (const child of [...panel.children]) if (child !== results) child.remove();
			results.replaceChildren();
			const head = el("div", undefined, results, "perf-result-head");
			head.append(setup.perfumeryIcons.render(bottle.icon, bottle.name));
			const nameBox = el("div", undefined, head);
			el("h3", bottle.name, nameBox);
			const good = (p.nuances || []).filter(k => !setup.perfumeryIdentity.negative[k]);
			const bad = (p.offNotes || []).map(o => o.name);
			const balance = word(p.quality, [
				[40, "서로 부딪힌다"],
				[60, "그다지 어우러지지 않는다"],
				[75, "그럭저럭 어우러진다"],
				[88, "부드럽게 어우러진다"],
				[Infinity, "아주 부드럽게 어우러진다"],
			]);
			const strength = word(p.intensity, [
				[1, "희미하며,"],
				[1.8, "뚜렷하며,"],
				[2.4, "강하며,"],
				[Infinity, "매우 강하며,"],
			]);
			el(
				"p",
				`맡아지는 향: ${good.slice(0, 2).map(scent).join(", ") || scent(p.family)}. 노트들이 ${balance}. 향은 ${strength} 한 번 뿌리면 ${hours(
					p.duration
				)} 동안 남는다.`,
				results,
				"perf-result-summary"
			);
			if (bad.length) el("p", bad[0] === "acrid" ? "첫 냄새가 불쾌할 만큼 날카롭다." : p.offNotes[0].cause, results, "perf-result-warning");
			el("p", `향수는 ${bottle.uses}회 뿌릴 만큼 남아 있다.`, results, "perf-result-uses");
			if (!api.ready(bottle))
				el(
					"p",
					`뿌리기 전에 ${plural(
						Math.ceil((bottle.made + bottle.formula.age * 86400 - V.timeStamp) / 3600),
						"시간"
					)} 더 숙성시켜야 합니다.`,
					results,
					"perf-result-warning"
				);
			const row = el("div", undefined, results, "perf-steps");
			if (api.ready(bottle) && api.enabled()) button("지금 뿌리기", "apply", row, bottle.id, { cls: "perf-primary" });
			button("배합 저장", "save", row, bottle.id);
			button("다시 만들기", "again", row);
			const details = el("details", undefined, results, "perf-result-details");
			el("summary", "전체 분석", details);
			if (!api.ready(bottle)) el("p", "이 평가는 현재의 냄새를 설명한 것이며, 병이 숙성되면서 달라질 수 있습니다.", details, "perf-hint");
			const rename = el("label", undefined, details, "perf-rename");
			el("span", "이름 변경", rename);
			const input = el("input", undefined, rename);
			Object.assign(input, { value: bottle.name, maxLength: 48 });
			input.dataset.rename = bottle.id;
			if (p.description) el("p", p.description, details);
			const facts = el("dl", undefined, details, "perf-facts");
			const fact = (k, v) => {
				el("dt", k, facts);
				el("dd", v, facts);
			};
			if (p.phases) {
				fact("오프닝", p.phases.opening.replace(/^[^:]+: /, ""));
				fact("하트", p.phases.heart.replace(/^[^:]+: /, ""));
				fact("베이스", p.phases.drydown.replace(/^[^:]+: /, ""));
			}
			if (good.length) fact("장점", good.map(scent).join(", "));
			if (bad.length) fact("결점", bad.map(scent).join(", "));
			fact("쾌적함", `${scoreWord(p.pleasantness)}${knowledge >= 3 ? ` (${Math.round(p.pleasantness)})` : ""}`);
			if (V.perfumeryVenue === "poppy" && api.availableTeacher()) el("p", api.feedback(bottle), results, "perf-poppy");
			if (V.perfumery.characters?.poppy?.pending?.bottleId === bottle.id) {
				el("p", "포피가 시향지를 돌려주지 않는다. 이야기할 거리가 있는 모양이다.", results, "perf-poppy");
				$(results).wiki("<<link [[이 향수에 대해 이야기하기|Poppy Perfumery Special]]>><</link>>");
			}
			if (s.session?.stage === "review" && s.session.bottleId === bottle.id) {
				el("p", "포피와 비교할 수 있도록 이 샘플을 간직하십시오. 포피가 바쁘면 나중에 보여 줄 수 있습니다.", results, "perf-poppy");
				$(results).wiki("<<link [[샘플에 대해 이야기하기|Poppy Perfumery Debrief]]>><</link>>");
			}
		}

		/* Cabinet and journal: their own page, reached by a link under the table. */
		function describe(p) {
			if (p.description) return `${p.description} 존재감 ${projectionWord(p.intensity)}, 지속 ${hours(p.duration)}.`;
			return `${fam(p.family)} 계열. ${projectionWord(p.intensity)}, 지속 ${hours(p.duration)}.`;
		}
		function renderInventory() {
			const teacherPresent = V.perfumeryVenue === "poppy" && api.availableTeacher();
			const canCompose = api.access();
			cabinet.replaceChildren();
			journal.replaceChildren();
			el("h3", `향수병 (${s.bottles.length}/24)`, cabinet);
			if (!s.bottles.length) el("p", "보관장이 비어 있습니다. 병입한 향수가 여기에 나타납니다.", cabinet);
			for (const b of s.bottles) {
				const row = el("details", undefined, cabinet, "perf-bottle");
				const sum = el("summary", undefined, row);
				sum.append(setup.perfumeryIcons.render(setup.perfumeryIcons.forBottle(b), b.name));
				el(
					"span",
					`${b.name} · ${b.uses}회 · ${api.ready(b) ? "사용 가능" : `숙성 중 ${Math.ceil((b.made + b.formula.age * 86400 - V.timeStamp) / 3600)}시간`}`,
					sum
				);
				row.ontoggle = () => {
					if (!row.open || row.childElementCount > 1) return;
					el("p", describe(api.properties(b)), row);
					const rename = el("label", undefined, row, "perf-rename");
					el("span", "이름 변경", rename);
					const name = el("input", undefined, rename);
					Object.assign(name, { value: b.name, maxLength: 48 });
					name.dataset.rename = b.id;
					const actions = el("div", undefined, row, "perf-steps");
					button("뿌리기", "apply", actions, b.id).disabled = !api.ready(b) || b.uses < 1 || !api.enabled();
					button("배합 저장", "save", actions, b.id);
					if (canCompose) Wikifier.createInternalLink(actions, "Perfumery Workstation", "초안으로 복사", () => load(b.formula));
					if (typeof pocketPerfumePack === "function") button(b.packed ? "보관장에 두기" : `${pocketBagName()}에 넣기`, "carry", actions, b.id);
					if (teacherPresent) button("포피에게 건네기 (5분)", "gift", actions, b.id);
					button("버리기", "discard", actions, b.id).disabled = s.session?.stage === "review" && s.session.bottleId === b.id;
				};
			}
			el("h3", `저장한 배합 (${s.journal.length}/32)`, journal);
			if (!s.journal.length) el("p", "병의 배합을 저장하면 나중에 다시 만들 수 있습니다.", journal);
			s.journal.forEach((entry, i) => {
				const row = el("details", undefined, journal, "perf-bottle");
				const sum = el("summary", undefined, row);
				sum.append(setup.perfumeryIcons.render(setup.perfumeryIcons.forBottle(entry), entry.name));
				el("span", entry.name, sum);
				row.ontoggle = () => {
					if (!row.open || row.childElementCount > 1) return;
					el("p", api.notes(entry.formula), row);
					el(
						"p",
						`아로마 ${entry.formula.concentration}%, ${({ soft: "소프트", clear: "클리어", bright: "브라이트" })[entry.formula.solvent] || entry.formula.solvent} 스피릿, ${entry.formula.capacity}단위 병, 숙성 ${plural(
							entry.formula.age,
							"일"
						)}. 만든 횟수: ${plural(entry.attempts, "회")}.`,
						row
					);
					const rename = el("label", undefined, row, "perf-rename");
					el("span", "이름 변경", rename);
					const name = el("input", undefined, rename);
					Object.assign(name, { value: entry.name, maxLength: 48 });
					name.dataset.journalRename = i;
					const actions = el("div", undefined, row, "perf-steps");
					if (canCompose) Wikifier.createInternalLink(actions, "Perfumery Workstation", "초안으로 불러오기", () => load(entry.formula));
					button("삭제", "forget", actions, i);
				};
			});
		}

		function renderAll() {
			if (!station) return renderInventory();
			if (timing.running) {
				cancelAnimationFrame(timing.raf);
				timing.running = false;
				root.classList.remove("perf-blending");
			}
			renderProgress();
			if (d.tab === "prepare") renderPrepare();
			if (d.tab === "notes") renderNotes();
			if (d.tab === "blend") renderBlend();
			if (d.tab === "bottle" && !result) renderBottle();
		}
		function edited() {
			cancelAnimationFrame(timing.raf);
			Object.assign(timing, { scores: [], running: false, pos: 0, last: "" });
			root.classList.remove("perf-blending");
			blending = null;
			blended = "";
		}
		function remember() {
			d.undo.push(m.copy(d.formula));
			if (d.undo.length > 10) d.undo.shift();
		}
		/* Loading a formula from the cabinet page puts it in the draft and opens the table. */
		function load(f) {
			if (!station) {
				draft ??= freshDraft();
				draft.formula = m.copy(f);
				draft.tab = "notes";
				return;
			}
			remember();
			d.formula = m.copy(f);
			edited();
			notice("배합을 초안으로 불러왔습니다. 아무것도 소모되지 않았습니다.");
			d.tab = "notes";
			renderAll();
		}
		function add(id, note) {
			if (!m.material(id) || !m.layers.includes(note)) return;
			if (used(id) >= (s.extraction.stock[id] || 0)) throw new Error("그 아로마가 더 남지 않았습니다.");
			if (((units(d.formula) + 1) * 100) / d.formula.concentration > d.formula.capacity)
				throw new Error("이 농도에서는 병이 가득 찼습니다. 블렌딩 단계에서 더 큰 병이나 더 진한 농도를 고르십시오.");
			remember();
			d.formula[note][id] = (d.formula[note][id] || 0) + 1;
			edited();
			notice(`${label(id).title} 추가: ${layerName[note].toLowerCase()} 노트 (${d.formula[note][id]}단위).`);
		}
		const focusAfter = selector => root.querySelector(selector)?.focus({ preventScroll: true });

		root.addEventListener(
			"click",
			event => {
				const b = event.target.closest("button[data-action]");
				if (!b || !root.contains(b) || b.disabled) return;
				const action = b.dataset.action;
				const id = b.dataset.id;
				const layer = b.dataset.layer;
				let focus = null;
				try {
					if (action === "tab") {
						d.tab = id;
						focus = `#perf-tab-${id}`;
					}
					if (action === "openLiquid") {
						d.tab = "blend";
						liquidOpen = true;
						focus = "[data-liquid] summary";
					}
					if (action === "layer") {
						d.layer = id;
						focus = `[data-action="layer"][data-id="${id}"]`;
					}
					if (action === "add") {
						add(id, d.layer);
						focus = `.perf-tiles [data-action="add"][data-id="${CSS.escape(id)}"]`;
					}
					if (action === "plus") {
						add(id, layer);
						focus = `[data-action="plus"][data-id="${CSS.escape(id)}"][data-layer="${layer}"]`;
					}
					if (action === "minus" || action === "remove") {
						remember();
						if (action === "remove" || --d.formula[layer][id] <= 0) delete d.formula[layer][id];
						edited();
						focus = d.formula[layer][id]
							? `[data-action="minus"][data-id="${CSS.escape(id)}"][data-layer="${layer}"]`
							: `[data-action="layer"][data-id="${layer}"]`;
					}
					if (action === "undo" && d.undo.length) {
						d.formula = d.undo.pop();
						edited();
						notice("되돌렸습니다.");
					}
					if (action === "page") {
						d.page += Number(id);
						focus = `.perf-pager [data-action="page"][data-id="${id}"]`;
					}
					if (action === "extractSource") {
						d.tab = "prepare";
						renderAll();
						extractionUI?.choose(id);
						return;
					}
					if (action === "sample") return load(s.lessonSample);
					if (action === "reference") return load(s.session.reference);
					if (action === "defaults") {
						Object.assign(d.formula, { solvent: "clear", concentration: 20, capacity: 40, age: 0 });
						edited();
						liquidOpen = true;
					}
					if (action === "pin") {
						m.validate(d.formula);
						d.pinned = m.copy(d.formula);
						notice("기억했습니다. 무언가 바꾼 뒤 비교 결과를 확인하십시오.");
						liquidOpen = true;
					}
					if (action === "swap" && d.pinned) {
						const previous = m.copy(d.formula);
						d.formula = m.copy(d.pinned);
						d.pinned = previous;
						edited();
						liquidOpen = true;
					}
					if (action === "startBlend") {
						startTiming();
						return focusAfter(".perf-blend-go");
					}
					if (action === "stopBlend") {
						stopTiming();
						focus = blending === null ? ".perf-blend-go" : ".perf-stage-foot .perf-primary";
					}
					if (action === "gentle") {
						edited();
						blending = 0.55;
						blended = JSON.stringify(d.formula);
						timing.last = "타이밍을 재지 않고 섞어, 무난하고 일정한 마무리에 만족한다.";
						focus = ".perf-stage-foot .perf-primary";
					}
					if (action === "reblend") edited();
					if (action === "craft") {
						b.disabled = true;
						if (blending === null || blended !== JSON.stringify(d.formula)) throw new Error("병입하기 전에 현재 배합을 블렌딩하십시오.");
						result = api.craft(d.formula, blending, serial);
						const kept = { ...freshDraft(), filters: d.filters, layer: d.layer };
						Object.assign(d, kept, { tab: "bottle" });
						renderProgress();
						renderResult(result);
						notice(`${result.name} 병입 완료. 아로마와 스피릿, 병 하나가 쓰였고 20분이 지났습니다.`);
						focusAfter(".perf-result-head h3");
						return;
					}
					if (action === "again") {
						result = null;
						serial = s.serial;
						edited();
						d.tab = stockLeft() ? "notes" : "prepare";
						notice("새 초안입니다. 마지막 병은 보관장에 있습니다.");
					}
					if (action === "apply") {
						api.apply(Number(id));
						notice("당신은 향수를 뿌린다. 이전에 뿌린 향은 사라진다.");
						if (station) {
							const uses = results.querySelector(".perf-result-uses");
							if (uses && result)
								uses.textContent = result.uses ? `향수는 ${result.uses}회 뿌릴 만큼 남아 있다.` : "병이 비었다.";
							b.disabled = true;
							return;
						}
					}
					if (action === "save") {
						api.saveFormula(Number(id));
						notice("배합을 저장했습니다.");
						if (station) return;
					}
					if (action === "forget") s.journal.splice(Number(id), 1);
					if (action === "discard") {
						s.bottles = s.bottles.filter(x => x.id !== Number(id));
						notice("병을 버렸습니다.");
					}
					if (action === "gift") notice(api.gift(Number(id)));
					if (action === "carry") {
						const bottle = s.bottles.find(x => x.id === Number(id));
						const packing = !bottle.packed;
						if (!pocketPerfumePack(bottle.id, packing)) notice("넣을 자리가 없습니다. 주머니나 가방에서는 종류마다 한 칸씩 차지합니다.");
						else notice(packing ? `${bottle.name}: ${pocketBagName()}에 넣었습니다. 주머니 메뉴에서 뿌릴 수 있습니다.` : `${bottle.name}: 보관장으로 돌려놓았습니다.`);
					}
					renderAll();
					if (focus) focusAfter(focus);
				} catch (error) {
					notice(error.message);
					if (action === "craft") b.disabled = false;
				}
			},
			{ signal }
		);
		/* Search filters as you type without rebuilding the filter controls, so the mobile keyboard stays open. */
		root.addEventListener(
			"input",
			event => {
				const t = event.target;
				if (t.dataset.filter === "q") {
					d.filters.q = t.value;
					d.page = 0;
					renderCards(panels.notes.querySelector(".perf-tiles"));
				}
				if (t.dataset.control === "concentration") {
					d.formula.concentration = Number(t.value);
					edited();
					const label = t.closest("label").querySelector(".perf-range-value");
					label.textContent = `${concentrationWord(Number(t.value))} (아로마 ${t.value}%)`;
					t.setAttribute("aria-valuetext", `${concentrationWord(Number(t.value))}, ${t.value}%`);
					renderProgress();
				}
			},
			{ signal }
		);
		root.addEventListener(
			"change",
			event => {
				const t = event.target;
				try {
					if (t.dataset.filter && t.dataset.filter !== "q") {
						d.filters[t.dataset.filter] = t.type === "checkbox" ? t.checked : t.value;
						d.page = 0;
						renderCards(panels.notes.querySelector(".perf-tiles"));
						return;
					}
					if (t.dataset.move) {
						const id = t.dataset.move;
						const from = t.dataset.from;
						if (m.layers.includes(t.value) && t.value !== from) {
							remember();
							d.formula[t.value][id] = (d.formula[t.value][id] || 0) + d.formula[from][id];
							delete d.formula[from][id];
							edited();
							notice(`${label(id).title} 이동: ${({ top: "오프닝", heart: "하트", base: "베이스" })[t.value] || t.value} 노트. 이제 향이 다른 시점에 나타납니다.`);
							renderAll();
							focusAfter(`[data-move="${CSS.escape(id)}"][data-from="${t.value}"]`);
						}
						return;
					}
					if (t.dataset.control) {
						if (t.dataset.control !== "concentration") {
							d.formula[t.dataset.control] = t.dataset.control === "solvent" ? t.value : Number(t.value);
							edited();
						}
						liquidOpen = true;
						renderAll();
						focusAfter(t.dataset.control === "concentration" ? '[data-control="concentration"]' : `[name="${t.name}"][value="${t.value}"]`);
						return;
					}
					if (t.dataset.journalRename !== undefined) {
						const entry = s.journal[Number(t.dataset.journalRename)];
						if (entry) entry.name = t.value.trim().slice(0, 48) || "이름 없는 배합";
					}
					if (t.dataset.rename) {
						const bottle = s.bottles.find(x => x.id === Number(t.dataset.rename));
						if (bottle) bottle.name = t.value.trim().slice(0, 48) || m.calculate(bottle.formula).name;
						if (result && bottle === result) root.querySelector(".perf-result-head h3").textContent = bottle.name;
					}
				} catch (error) {
					notice(error.message);
				}
			},
			{ signal }
		);
		root.addEventListener(
			"toggle",
			event => {
				if (event.target.dataset?.liquid) liquidOpen = event.target.open;
			},
			{ signal, capture: true }
		);
		/* Arrow keys move between the steps, as screen-reader users expect from a tablist. */
		root.addEventListener(
			"keydown",
			event => {
				if (!event.target.matches?.(".perf-step") || !["ArrowLeft", "ArrowRight"].includes(event.key)) return;
				const order = stages.map(x => x[0]);
				const i = order.indexOf(d.tab) + (event.key === "ArrowRight" ? 1 : -1);
				d.tab = order[(i + order.length) % order.length];
				renderAll();
				focusAfter(`#perf-tab-${d.tab}`);
				event.preventDefault();
			},
			{ signal }
		);
		/* Desktop drag and drop is optional; tapping a tile does the same thing. */
		root.addEventListener(
			"dragstart",
			event => {
				const tile = event.target.closest(".perf-tile[draggable='true']");
				if (tile) event.dataTransfer.setData("text/plain", tile.dataset.id);
			},
			{ signal }
		);
		root.addEventListener(
			"dragover",
			event => {
				if (event.target.closest("[data-drop]")) event.preventDefault();
			},
			{ signal }
		);
		root.addEventListener(
			"drop",
			event => {
				const tray = event.target.closest("[data-drop]");
				if (!tray) return;
				event.preventDefault();
				try {
					add(event.dataTransfer.getData("text/plain"), tray.dataset.drop);
					renderAll();
				} catch (e) {
					notice(e.message);
				}
			},
			{ signal }
		);
		renderAll();
	}
	function dispose() {
		setup.perfumeryLab?.dispose();
		const run = cleanup;
		cleanup = () => {};
		run();
	}
	setup.perfumeryUI = {
		dispose,
		/* Bottling or "Make another" clears it; tests and the debug page can also reset it. */
		resetDraft: () => {
			draft = null;
		},
		draft: () => draft,
	};
	$(document)
		.off(":passageinit.perfumery")
		.on(":passageinit.perfumery", event => {
			dispose();
			if (event.passage.title !== "Perfumery Avery Scene") delete V.perfumeryAveryScene;
		});
	$(document).on(":onloadsave.perfumery", () => {
		dispose();
		draft = null;
	});
	if (Macro.has("perfumeryUI")) Macro.delete("perfumeryUI");
	Macro.add("perfumeryUI", {
		handler() {
			if (!setup.perfumery.enabled()) return;
			const root = document.createElement("div");
			root.className = "perfumery no-numberify";
			root.dataset.mode = this.args[0];
			this.output.append(root);
			queueMicrotask(() => {
				if (root.isConnected) mount(root);
			});
		},
	});
})();
