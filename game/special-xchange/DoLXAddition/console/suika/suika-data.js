/* Fruit game data: challenges, daily templates, achievements, jar themes, help text. Tiers are fruit indexes, 0 Cherry
 * to 10 Watermelon. Challenge: { id, name, diff, rules "classic"|"arcade", noAbilities?, drops?, goal: { type, n } };
 * goal types are score, tier, merges, chain and survive. */
(() => {
	const settleMs = 3000;

	const challenges = Object.freeze(
		[
			{ id: "first-steps", name: "첫걸음", diff: "easy", rules: "classic", drops: 40, goal: { type: "score", n: 200 } },
			{ id: "busy-hands", name: "바쁜 손", diff: "easy", rules: "classic", drops: 30, goal: { type: "merges", n: 15 } },
			{ id: "apple-picking", name: "사과 따기", diff: "easy", rules: "classic", drops: 30, goal: { type: "tier", n: 5 } },
			{ id: "steady-stack", name: "안정적인 쌓기", diff: "medium", rules: "classic", goal: { type: "survive", n: 100 } },
			{ id: "pear-shaped", name: "배 모양", diff: "medium", rules: "classic", drops: 40, goal: { type: "tier", n: 6 } },
			{ id: "ripple", name: "파문 효과", diff: "medium", rules: "arcade", drops: 70, goal: { type: "chain", n: 4 } },
			{ id: "bare-hands", name: "맨손", diff: "medium", rules: "arcade", noAbilities: true, drops: 70, goal: { type: "score", n: 550 } },
			{ id: "pineapple-express", name: "파인애플 특급", diff: "hard", rules: "arcade", drops: 100, goal: { type: "tier", n: 8 } },
			{ id: "score-rush", name: "점수 러시", diff: "hard", rules: "arcade", drops: 100, goal: { type: "score", n: 950 } },
			{ id: "cascade", name: "폭포 효과", diff: "hard", rules: "arcade", goal: { type: "chain", n: 5 } },
			{ id: "the-big-one", name: "대물", diff: "hard", rules: "classic", goal: { type: "tier", n: 10 } },
		].map(c => Object.freeze(c))
	);

	const fruitName = tier => setup.suika.fruits[tier].name;

	/* The goal and the limits apart, for the daily panel: { goal, drops, rules }. */
	function describeParts(c) {
		const g = c.goal;
		let goal;
		if (g.type === "score") goal = `${g.n}점 얻기`;
		else if (g.type === "tier") goal = `${/^[AEIOU]/.test(fruitName(g.n)) ? "" : ""}${fruitName(g.n)} 만들기`;
		else if (g.type === "merges") goal = `${g.n}번 합치기`;
		else if (g.type === "chain") goal = `한 번 떨어뜨려 ${g.n}번 연쇄 합치기`;
		else goal = `더미가 넘쳐 끝나지 않고 과일 ${g.n}개 떨어뜨리기`;
		const rules = c.rules === "arcade" ? (c.noAbilities ? "아케이드 콤보 점수, 파워업 없음" : "아케이드 규칙, 파워업 허용") : "클래식 규칙";
		return { goal, drops: c.drops && g.type !== "survive" ? c.drops : null, rules };
	}

	/* One line saying what the goal is, for lists and the in-run goal strip. */
	function describe(c) {
		const p = describeParts(c);
		let text = p.goal + (p.drops ? `, 낙하 ${p.drops}번 이내` : "");
		if (c.rules === "arcade") text += ". " + p.rules;
		return text + ".";
	}

	/* Where a run stands on its challenge: { value, target, done, failed, text }. `run` is the game. */
	function evaluate(c, run) {
		const g = c.goal;
		let value;
		if (g.type === "score") value = run.score;
		else if (g.type === "tier") value = Math.max(-1, run.runInfo.largest);
		else if (g.type === "merges") value = run.mergeCount;
		else if (g.type === "chain") value = run.runInfo.maxChain;
		else value = run.drops;
		const limit = g.type === "survive" ? g.n : c.drops;
		/* The run waits settleMs after its last allowed drop, so merges already under way still count. */
		const settled = !!limit && run.drops >= limit && run.time - run.lastDropAt >= settleMs;
		const done = g.type === "survive" ? settled && !run.over : value >= g.n;
		const failed = !done && (settled || (run.over && run.endReason !== "won"));
		let text;
		if (g.type === "tier") text = value >= 0 ? `가장 큰 과일: ${fruitName(value)}` : "가장 큰 과일: 아직 없음";
		else if (g.type === "survive") text = `떨어뜨린 과일 ${Math.min(value, g.n)} / ${g.n}`;
		else text = `${g.type === "score" ? "점수" : g.type === "merges" ? "합치기" : "최고 연쇄"} ${Math.min(value, g.n)} / ${g.n}`;
		if (c.drops && g.type !== "survive") text += ` · 낙하 ${run.drops} / ${c.drops}`;
		const fraction = g.type === "tier" ? Math.max(0, value + 1) / (g.n + 1) : Math.min(1, value / g.n);
		return { done, failed, text, fraction: Math.min(1, fraction) };
	}

	/* ---- daily challenge ----
	 * The UTC date seeds the template, numbers and fruit sequence; `level` lines up with `n` and sets the reward. */
	const dailyTemplates = Object.freeze([
		{ type: "score", rules: "classic", n: [250, 350, 450], level: ["easy", "medium", "hard"], drops: [55, 65] },
		{ type: "score", rules: "arcade", n: [400, 500, 600], level: ["easy", "medium", "hard"], drops: [60, 75] },
		{ type: "tier", rules: "classic", n: [6], level: ["medium"], drops: [35, 45] },
		{ type: "tier", rules: "arcade", n: [7], level: ["hard"], drops: [60, 80] },
		{ type: "merges", rules: "classic", n: [20, 25], level: ["easy", "medium"], drops: [35, 45] },
		{ type: "chain", rules: "arcade", n: [3, 4], level: ["easy", "medium"], drops: [70, 90] },
	]);

	function utcDate(now = new Date()) {
		return now.toISOString().slice(0, 10);
	}

	/* 32-bit FNV-1a: a stable seed from a string. */
	function hash(text) {
		let h = 0x811c9dc5;
		for (let i = 0; i < text.length; i++) {
			h ^= text.charCodeAt(i);
			h = Math.imul(h, 0x01000193);
		}
		return h >>> 0;
	}

	function daily(date = utcDate()) {
		const rng = setup.suika.makeRng(hash("fruit-daily-" + date));
		const pick = list => list[Math.floor(rng.next() * list.length)];
		const t = pick(dailyTemplates);
		/* Same draws in the same order as before levels existed, so every date keeps its challenge. */
		const drops = pick(t.drops);
		const i = Math.floor(rng.next() * t.n.length);
		const c = {
			id: "daily-" + date,
			date,
			name: "오늘의 도전",
			diff: "daily",
			level: t.level[i],
			reward: setup.consoleDaily.dailyMoney.fruit[t.level[i]],
			rules: t.rules,
			noAbilities: !!t.noAbilities,
			drops,
			goal: { type: t.type, n: t.n[i] },
			seed: hash("fruit-daily-drops-" + date),
		};
		return Object.freeze(c);
	}

	/* ---- achievements ----
	 * check(ctx) runs on game events; ctx is { type, game, data, stats } where stats is the saved totals plus this run's
	 * tally. icon is { fruit: tier } (drawn with the fruit art) or { glyph: name } from `glyphs`. reward names a theme. */
	const glyphs = Object.freeze({
		trophy: '<path d="M8 4h8v5a4 4 0 0 1-8 0z"/><path d="M8 6H5v1a3 3 0 0 0 3 3M16 6h3v1a3 3 0 0 1-3 3M12 13v4M9 20h6M10 17h4"/>',
		chain: '<path d="M10 14a4 4 0 0 1 0-5.6l2-2a4 4 0 0 1 5.6 5.6l-1 1"/><path d="M14 10a4 4 0 0 1 0 5.6l-2 2a4 4 0 0 1-5.6-5.6l1-1"/>',
		jar: '<path d="M9 3h6M10 3v3L7 10v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9l-3-4V3"/><path d="M3 9v6M21 9v6"/>',
		wand: '<path d="M4 20L14 10"/><path d="M17 3l1 2.3 2.4.4-1.8 1.6.5 2.4L17 8.5l-2.1 1.2.5-2.4-1.8-1.6 2.4-.4z"/>',
		kit: '<rect x="3" y="8" width="18" height="12" rx="2"/><path d="M9 8V5h6v3M3 13h18"/>',
		flag: '<path d="M5 21V4M5 4h11l-2 4 2 4H5"/>',
		calendar: '<rect x="4" y="5" width="16" height="15" rx="2"/><path d="M4 10h16M9 3v4M15 3v4"/>',
		hand: '<path d="M7 11V6a1.5 1.5 0 0 1 3 0v4M10 10V4.5a1.5 1.5 0 0 1 3 0V10M13 10V5.5a1.5 1.5 0 0 1 3 0V11M16 11V8a1.5 1.5 0 0 1 3 0v6a7 7 0 0 1-7 7h-1a6 6 0 0 1-5-3l-2.5-4a1.5 1.5 0 0 1 2.5-1.6L7 14"/>',
		bowl: '<path d="M3 11h18a9 9 0 0 1-18 0z"/><path d="M8 11c0-3 2-5 4-5M13 11c0-2 1.5-4 4-4M7 20h10"/>',
		basket: '<path d="M3 10h18l-2 10H5z"/><path d="M8 10l3-6M16 10l-3-6M9 14v3M12 14v3M15 14v3"/>',
		crown: '<path d="M4 18h16M5 15l-1-9 5 4 3-6 3 6 5-4-1 9z"/>',
		joystick: '<rect x="4" y="15" width="16" height="5" rx="1.5"/><path d="M12 15V8"/><circle cx="12" cy="6" r="2.5"/><path d="M16.5 17.5h1"/>',
		rise: '<path d="M4 20h16"/><path d="M5 16l5-5 3 3 6-7"/><path d="M15 7h4v4"/>',
		dominoes:
			'<rect x="3" y="9" width="5" height="11" rx="1" transform="rotate(-18 5.5 14.5)"/><rect x="10" y="7" width="5" height="11" rx="1" transform="rotate(-9 12.5 12.5)"/><rect x="16" y="6" width="5" height="12" rx="1"/>',
		gauge: '<path d="M4 17a8 8 0 1 1 16 0"/><path d="M12 17l4-6"/><path d="M4 17h2M18 17h2M12 7v2"/>',
		waves:
			'<path d="M9 3h6M10 3v3L7 10v9a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2v-9l-3-4V3"/><path d="M3 12c1-1.5 2-1.5 3 0M18 12c1-1.5 2-1.5 3 0M3 16c1-1.5 2-1.5 3 0M18 16c1-1.5 2-1.5 3 0"/>',
		flags: '<path d="M4 21V5h9l-1.5 3L13 11H4M14 21V8h6l-1.5 3 1.5 3h-6"/>',
		cup: '<path d="M7 4h10v4a5 5 0 0 1-10 0z"/><path d="M7 5H4v2a3 3 0 0 0 3 3M17 5h3v2a3 3 0 0 1-3 3M12 13v4M8 20h8l-1-3h-6z"/><path d="M10.5 7.5l1 1 2-2"/>',
	});
	/* Achievement groups, in the order the Achievements page shows them. */
	const achievementGroups = Object.freeze([
		["fruit", "과일"],
		["score", "점수"],
		["chain", "연쇄와 콤보"],
		["power", "파워업"],
		["challenge", "도전"],
	]);

	const competitive = game => game.mode !== "tutorial";
	/* Each achievement's group and its own icon (count draws a small "x5" on a repeated fruit). */
	const look = {
		"merge-1": { group: "fruit", icon: { fruit: 1 } },
		apple: { group: "fruit", icon: { fruit: 5 } },
		pineapple: { group: "fruit", icon: { fruit: 8 } },
		melon: { group: "fruit", icon: { fruit: 9 } },
		watermelon: { group: "fruit", icon: { fruit: 10 } },
		"watermelon-5": { group: "fruit", icon: { fruit: 10, count: 5 } },
		"score-500": { group: "score", icon: { glyph: "bowl" } },
		"score-1500": { group: "score", icon: { glyph: "basket" } },
		"classic-2500": { group: "score", icon: { glyph: "crown" } },
		"arcade-3000": { group: "score", icon: { glyph: "joystick" } },
		"new-best": { group: "score", icon: { glyph: "rise" } },
		"chain-3": { group: "chain", icon: { glyph: "chain" } },
		"chain-5": { group: "chain", icon: { glyph: "dominoes" } },
		"combo-max": { group: "chain", icon: { glyph: "gauge" } },
		"shake-1": { group: "power", icon: { glyph: "jar" } },
		"shake-merge": { group: "power", icon: { glyph: "waves" } },
		"wand-1": { group: "power", icon: { glyph: "wand" } },
		"all-four": { group: "power", icon: { glyph: "kit" } },
		"pure-arcade": { group: "power", icon: { glyph: "hand" } },
		"challenge-1": { group: "challenge", icon: { glyph: "flag" } },
		"challenge-5": { group: "challenge", icon: { glyph: "flags" } },
		"challenge-all": { group: "challenge", icon: { glyph: "cup" } },
		"daily-1": { group: "challenge", icon: { glyph: "calendar" } },
	};
	/* Unlocking every achievement earns this DoL feat (setup.feats, Level 3), once, through earnFeat. */
	const masterFeat = "Fruit Master";

	const achievements = Object.freeze(
		[
			{ id: "merge-1", name: "첫 합치기", desc: "과일 두 개 합치기.", icon: { fruit: 1 }, check: x => x.type === "merge" },
			{ id: "apple", name: "첫 사과", desc: "사과 만들기.", icon: { fruit: 5 }, reward: "pastel", check: x => x.type === "merge" && x.data.tier >= 5 },
			{
				id: "pineapple",
				name: "첫 파인애플",
				desc: "파인애플 만들기.",
				icon: { fruit: 8 },
				reward: "wood",
				check: x => x.type === "merge" && x.data.tier >= 8,
			},
			{ id: "melon", name: "첫 멜론", desc: "멜론 만들기.", icon: { fruit: 9 }, check: x => x.type === "merge" && x.data.tier >= 9 },
			{ id: "watermelon", name: "첫 수박", desc: "수박 만들기.", icon: { fruit: 10 }, check: x => x.type === "merge" && x.data.tier === 10 },
			{
				id: "watermelon-5",
				name: "수박 전문가",
				desc: "여러 판에 걸쳐 수박 5개 만들기.",
				icon: { fruit: 10 },
				check: x => x.stats.watermelons >= 5,
			},
			{ id: "score-500", name: "과일 샐러드", desc: "한 판에서 500점 얻기.", icon: { glyph: "trophy" }, check: x => x.game.score >= 500 },
			{ id: "score-1500", name: "대풍작", desc: "한 판에서 1,500점 얻기.", icon: { glyph: "trophy" }, check: x => x.game.score >= 1500 },
			{
				id: "classic-2500",
				name: "클래식 챔피언",
				desc: "클래식에서 2,500점 얻기.",
				icon: { glyph: "trophy" },
				check: x => x.game.mode === "classic" && x.game.score >= 2500,
			},
			{
				id: "arcade-3000",
				name: "아케이드 에이스",
				desc: "아케이드에서 3,000점 얻기.",
				icon: { glyph: "trophy" },
				check: x => x.game.mode === "arcade" && x.game.score >= 3000,
			},
			{
				id: "new-best",
				name: "개인 최고 기록",
				desc: "클래식 또는 아케이드에서 이전 최고 점수 넘기기.",
				icon: { glyph: "trophy" },
				check: x => x.type === "end" && x.data.beatBest,
			},
			{
				id: "chain-3",
				name: "연쇄 반응",
				desc: "한 번 떨어뜨려 3번 연쇄 합치기.",
				icon: { glyph: "chain" },
				check: x => x.type === "merge" && x.data.chain >= 3,
			},
			{
				id: "chain-5",
				name: "도미노 효과",
				desc: "한 번 떨어뜨려 5번 연쇄 합치기.",
				icon: { glyph: "chain" },
				reward: "neon",
				check: x => x.type === "merge" && x.data.chain >= 5,
			},
			{
				id: "combo-max",
				name: "최대 콤보",
				desc: "아케이드에서 최대 콤보 보너스 얻기.",
				icon: { glyph: "chain" },
				check: x => x.type === "merge" && x.data.bonus >= setup.suika.config.combo.maxBonus,
			},
			{ id: "shake-1", name: "흔들어 보자", desc: "흔들기 사용하기.", icon: { glyph: "jar" }, check: x => x.type === "ability" && x.data.id === "shake" },
			{
				id: "shake-merge",
				name: "좋은 흔들기",
				desc: "흔들기로 합치기 일으키기.",
				icon: { glyph: "jar" },
				check: x => x.type === "merge" && x.data.cause === "shake",
			},
			{
				id: "wand-1",
				name: "아브라카다브라",
				desc: "마법 지팡이로 과일 하나 제거하기.",
				icon: { glyph: "wand" },
				check: x => x.type === "ability" && x.data.id === "wand",
			},
			{
				id: "all-four",
				name: "풀 세트",
				desc: "아케이드 한 판에서 파워업 네 가지 모두 사용하기.",
				icon: { glyph: "kit" },
				check: x => x.type === "ability" && Object.keys(x.game.runInfo.used).length >= 4,
			},
			{
				id: "pure-arcade",
				name: "속임수는 필요 없다",
				desc: "파워업을 쓰지 않고 아케이드 한 판을 500점 이상으로 끝내기.",
				icon: { glyph: "hand" },
				check: x => x.type === "end" && x.game.mode === "arcade" && x.game.score >= 500 && !Object.keys(x.game.runInfo.used).length,
			},
			{ id: "challenge-1", name: "도전자", desc: "도전 1개 완료하기.", icon: { glyph: "flag" }, check: x => x.stats.challenges >= 1 },
			{ id: "challenge-5", name: "노련함", desc: "도전 5개 완료하기.", icon: { glyph: "flag" }, check: x => x.stats.challenges >= 5 },
			{
				id: "challenge-all",
				name: "모든 도전",
				desc: `도전 ${challenges.length}개 모두 완료하기.`,
				icon: { glyph: "flag" },
				check: x => x.stats.challenges >= challenges.length,
			},
			{ id: "daily-1", name: "매일의 습관", desc: "오늘의 도전 완료하기.", icon: { glyph: "calendar" }, check: x => x.stats.daily >= 1 },
		].map(a => Object.freeze({ ...a, ...look[a.id], check: x => competitive(x.game) && a.check(x) }))
	);

	/* ---- jar themes ----
	 * Board colours only. Every ink/halo pair keeps text readable on its board. */
	const themes = Object.freeze({
		dark: {
			name: "오리지널 다크",
			bg: "#1c1824",
			inner: "#26202f",
			line: "#ff7878",
			warn: "#f5a623",
			guide: "rgb(255 255 255 / 22%)",
			ink: "#fff",
			halo: "rgb(20 14 28 / 90%)",
			accent: "#ffd84a",
			ring: "#444",
		},
		light: {
			name: "라이트",
			bg: "#e7e2d9",
			inner: "#f5f1ea",
			line: "#c0392b",
			warn: "#a35c00",
			guide: "rgb(0 0 0 / 25%)",
			ink: "#1d1a17",
			halo: "rgb(255 255 255 / 90%)",
			accent: "#8a4b00",
			ring: "#b8b0a2",
		},
		pastel: {
			name: "파스텔",
			bg: "#f2dcef",
			inner: "#fbeefa",
			line: "#c2366e",
			warn: "#a34a00",
			guide: "rgb(120 40 90 / 30%)",
			ink: "#3a1530",
			halo: "rgb(255 255 255 / 90%)",
			accent: "#9b2667",
			ring: "#e0a9d2",
			reward: "apple",
		},
		wood: {
			name: "원목",
			bg: "#5b3a21",
			inner: "#76502f",
			line: "#ffb199",
			warn: "#ffcc66",
			guide: "rgb(255 240 220 / 30%)",
			ink: "#fff6e8",
			halo: "rgb(40 22 10 / 90%)",
			accent: "#ffd27a",
			ring: "#3b2412",
			reward: "pineapple",
		},
		neon: {
			name: "아케이드 네온",
			bg: "#0b0b1a",
			inner: "#141032",
			line: "#ff3fd5",
			warn: "#ffb000",
			guide: "rgb(0 255 240 / 35%)",
			ink: "#fff",
			halo: "rgb(5 5 20 / 90%)",
			accent: "#3ff6ff",
			ring: "#3ff6ff",
			reward: "chain-5",
		},
		/* Used instead of the chosen theme when High contrast is on. */
		contrast: {
			name: "고대비",
			bg: "#000",
			inner: "#000",
			line: "#ff3030",
			warn: "#ffb000",
			guide: "rgb(255 255 255 / 60%)",
			ink: "#fff",
			halo: "#000",
			accent: "#ffe600",
			ring: "#fff",
		},
	});

	/* ---- How to Play ---- */
	const help = Object.freeze([
		[
			"떨어뜨리기",
			[
				"병 위쪽을 따라 움직여 조준하십시오. 과일이 떨어질 위치가 선으로 표시됩니다.",
				"탭하거나 클릭하거나 스페이스를 눌러 떨어뜨리십시오. 다음 낙하까지 잠깐 기다려야 하며, 그때까지는 들고 있는 과일이 흐리게 표시됩니다.",
			],
		],
		[
			"합치기",
			[
				"같은 과일 두 개가 닿으면 합쳐져 한 단계 큰 과일이 됩니다.",
				"순서는 체리에서 수박까지이며, 병 아래의 띠에 표시됩니다. 수박 두 개가 만나면 보너스와 함께 사라집니다.",
			],
		],
		["점수", ["합칠 때마다 만들어진 과일의 점수를 얻습니다. 딸기는 1점, 수박은 55점입니다.", "수박 두 개가 사라지면 100점입니다."]],
		[
			"빨간 선",
			[
				"더미가 빨간 선 위에 2.5초 동안 머물면 게임이 끝납니다.",
				"더미가 가까워지면 선이 주황색으로 바뀌고, 선을 넘은 동안에는 카운트다운 막대와 함께 빨간색이 됩니다. 방금 떨어뜨렸거나 방금 만들어진 과일은 처음 1.2초 동안 계산되지 않습니다.",
			],
		],
		[
			"모드",
			[
				"클래식: 기본 규칙의 게임입니다.",
				"아케이드: 파워업 네 가지를 각각 몇 번씩 쓸 수 있고, 연쇄에 보너스 점수가 붙습니다.",
				"젠: 게임 오버가 없습니다. 더미가 선을 넘은 채로 있으면 선 위의 과일이 치워집니다. 이번 접속의 점수만 기록됩니다.",
				"도전과 오늘의 도전: 목표가 정해져 있으며, 일부는 낙하 횟수 제한이 있습니다. 메뉴에서 여십시오.",
			],
		],
		[
			"파워업(아케이드)",
			[
				"흔들기: 병을 흔들어 과일끼리 부딪치게 합니다. 과일이 튀어 올라 선을 넘을 수 있습니다.",
				"섞기: 들고 있는 과일을 다른 작은 과일로 바꿉니다.",
				"마법 지팡이: 병 안에서 가장 작은 다섯 종류 가운데 과일 하나를 치웁니다. 고리가 표시된 과일을 탭하거나 취소를 누르십시오.",
				"교체: 들고 있는 과일과 다음 과일을 맞바꿉니다.",
				"파워업이 실제로 효과를 낼 때만 사용 횟수가 소모됩니다.",
			],
		],
		[
			"연쇄와 콤보",
			[
				"연쇄는 한 번의 낙하, 흔들기, 지팡이 선택에서 이어지는 모든 합치기입니다.",
				"아케이드에서는 연쇄의 2번째 합치기에 +2, 3번째에 +4가 붙고, 이런 식으로 합치기당 최대 +10까지 붙습니다.",
			],
		],
		[
			"도전",
			[
				"도전마다 목표가 하나씩 있습니다. 일부는 낙하 횟수를 제한하며, 마지막 낙하 뒤에는 병에서 합치기가 끝날 때까지 3초가 주어집니다.",
				"완료한 도전은 계속 체크된 상태로 남습니다. 오늘의 도전은 UTC 자정에 바뀌며, 그날의 최고 점수를 기록합니다.",
			],
		],
		[
			"일시정지, 다시 시작, 저장",
			[
				"일시정지하면 병이 멈춥니다. 다시 시작은 플레이 중에 한 번 더 눌러야 실행됩니다.",
				"콘솔로 돌아가기를 선택하거나 메뉴에서 저장 후 나가기를 선택하면 다음에 이어서 할 수 있습니다. 다른 방법으로 나가면 게임이 끝납니다.",
			],
		],
		[
			"조작",
			[
				"마우스: 움직여 조준하고 클릭해 떨어뜨립니다.",
				"터치: 드래그해 조준하고 손가락을 떼면 떨어뜨립니다.",
				"키보드(병에 초점이 있을 때): 방향키 또는 A, D로 조준하고, 스페이스 또는 Enter로 떨어뜨리고, P로 일시정지합니다. 지팡이를 쓸 때는 방향키로 과일을 고르고, Enter로 치우고, Esc로 취소합니다.",
				"Esc 키로 메뉴 화면도 닫을 수 있습니다.",
			],
		],
	]);

	setup.suikaContent = Object.freeze({
		settleMs,
		challenges,
		describe,
		describeParts,
		evaluate,
		dailyTemplates,
		achievementGroups,
		masterFeat,
		daily,
		utcDate,
		hash,
		achievements,
		glyphs,
		themes,
		help,
	});
})();

/* Fruit game saved data, all in $suikaData (best scores stay in $suikaBest / $suikaBestArcade for older saves):
 *   { v, mode, tutorial, settings, stats, records { classic, arcade }, challenges { id: date },
 *     achievements { id: date }, daily { date: { best, done, tries, paid } }, run }
 * A running game counts in game.tally and folds it into stats only when the run ends, is saved or is thrown away,
 * so nothing is counted twice. */
(() => {
	const schema = 1;
	const recordLimit = 10;
	const dailyKeep = 30;
	const recordModes = ["classic", "arcade"];

	function defaults() {
		return {
			v: schema,
			mode: "classic",
			tutorial: false,
			settings: { sfx: 0.6, mute: false, music: true, haptics: false, motion: "auto", faces: true, simple: false, bold: false, contrast: false, theme: "dark" },
			stats: {
				runs: { classic: 0, arcade: 0, zen: 0, challenge: 0, daily: 0 },
				drops: 0,
				merges: 0,
				score: 0,
				largest: -1,
				watermelons: 0,
				bestChain: 0,
				abilities: 0,
				daily: 0,
				playMs: 0,
			},
			records: { classic: [], arcade: [] },
			challenges: {},
			achievements: {},
			daily: {},
			run: null,
		};
	}

	/* Fills anything an older or partial object lacks. Version 1 is the first schema, so this only adds defaults;
	 * later versions add their own steps before the version is raised. */
	function migrate(d) {
		const fill = (target, source) => {
			for (const [key, value] of Object.entries(source)) {
				if (target[key] === undefined || target[key] === null) target[key] = value;
				else if (value && typeof value === "object" && !Array.isArray(value) && typeof target[key] === "object") fill(target[key], value);
			}
		};
		const def = defaults();
		delete def.run;
		fill(d, def);
		if (d.run === undefined) d.run = null;
		d.v = schema;
	}

	/* The saved progression, created on first use. */
	function data() {
		let d = V.suikaData;
		if (!d || typeof d !== "object" || Array.isArray(d)) d = V.suikaData = defaults();
		else if (d.v !== schema) migrate(d);
		return d;
	}

	function settings() {
		return data().settings;
	}

	/* Saves one setting at once (a DoL save made right after keeps it) and redraws the running game. */
	function setSetting(key, value) {
		data().settings[key] = value;
		updateMoment();
		const game = setup.suika.current;
		if (game) game.applySettings();
	}

	function newTally() {
		return { drops: 0, merges: 0, largest: -1, watermelons: 0, bestChain: 0, abilities: 0, playMs: 0 };
	}

	const challengeCount = d => setup.suikaContent.challenges.filter(c => d.challenges[c.id]).length;

	/* Saved totals plus the running game's tally, for achievement checks. */
	function totals(game) {
		const d = data();
		const s = d.stats;
		const t = game ? game.tally : newTally();
		return {
			drops: s.drops + t.drops,
			merges: s.merges + t.merges,
			watermelons: s.watermelons + t.watermelons,
			abilities: s.abilities + t.abilities,
			challenges: challengeCount(d),
			daily: s.daily,
		};
	}

	function checkAchievements(game, type, payload) {
		if (game.mode === "tutorial") return;
		const d = data();
		const ctx = { type, game, data: payload || {}, stats: totals(game) };
		for (const a of setup.suikaContent.achievements) {
			if (d.achievements[a.id] || !a.check(ctx)) continue;
			d.achievements[a.id] = setup.suikaContent.utcDate();
			game.onAchievement(a);
			if (masterFeat()) game.onFeat(setup.suikaContent.masterFeat);
		}
	}

	/* The Fruit Master feat: earned through DoL's own earnFeat once every achievement is unlocked (setup.consoleDaily
	 * keeps it to once per save and lets DoL's feat rules decide whether it can be earned at all). Returns true only
	 * when this call earned it. */
	function masterFeat() {
		const d = data();
		return setup.suikaContent.achievements.every(a => d.achievements[a.id]) && setup.consoleDaily.earnFeatOnce(setup.suikaContent.masterFeat);
	}

	/* "earned", "blocked" (DoL's feat rules are off for this save) or "open". */
	const masterFeatState = () => setup.consoleDaily.featState(setup.suikaContent.masterFeat);

	/* Game events: drop { tier }, merge { tier (null when watermelons vanish), chain, bonus, cause }, ability { id }. */
	function event(game, type, payload) {
		if (game.mode === "tutorial") return;
		const t = game.tally;
		if (type === "drop") t.drops++;
		else if (type === "merge") {
			t.merges++;
			if (payload.tier !== null) {
				t.largest = Math.max(t.largest, payload.tier);
				if (payload.tier === setup.suika.fruits.length - 1) t.watermelons++;
			}
			t.bestChain = Math.max(t.bestChain, payload.chain || 0);
		} else if (type === "ability") t.abilities++;
		checkAchievements(game, type, payload);
	}

	/* Folds the game's tally into the saved totals and zeroes it. */
	function commit(game) {
		if (game.mode === "tutorial") return;
		const s = data().stats;
		const t = game.tally;
		s.drops += t.drops;
		s.merges += t.merges;
		s.largest = Math.max(s.largest, t.largest);
		s.watermelons += t.watermelons;
		s.bestChain = Math.max(s.bestChain, t.bestChain);
		s.abilities += t.abilities;
		s.playMs += Math.round(t.playMs);
		game.tally = newTally();
	}

	function countRun(game) {
		const runs = data().stats.runs;
		runs[game.mode] = (runs[game.mode] || 0) + 1;
	}

	/* A run thrown away mid-way (restart, mode change). Counts as played; no best score or record. */
	function abandon(game) {
		if (game.mode === "tutorial" || game.over) return;
		commit(game);
		if (game.drops > 0) countRun(game);
	}

	/* A run that ended. Returns { best, newBest, firstClear } for the summary. */
	function endRun(game, reason) {
		if (game.mode === "tutorial") return { best: null, newBest: false, firstClear: false };
		const d = data();
		commit(game);
		countRun(game);
		d.stats.score += game.score;
		const mode = setup.suika.modes[game.mode];
		let best = null;
		let newBest = false;
		if (mode.best) {
			const prev = V[mode.best] || 0;
			if (game.score > prev) {
				V[mode.best] = game.score;
				newBest = prev > 0;
			}
			best = V[mode.best] || 0;
		}
		if (recordModes.includes(game.mode) && game.score > 0) {
			const list = d.records[game.mode];
			list.push({ s: game.score, t: game.runInfo.largest, n: game.drops, c: game.runInfo.maxChain, d: setup.suikaContent.utcDate() });
			list.sort((a, b) => b.s - a.s);
			list.length = Math.min(list.length, recordLimit);
		}
		let firstClear = false;
		const c = game.challenge;
		if (c && game.mode === "challenge" && reason === "won" && !d.challenges[c.id]) {
			d.challenges[c.id] = setup.suikaContent.utcDate();
			firstClear = true;
		}
		let paid = 0;
		if (c && game.mode === "daily") ({ first: firstClear, paid } = recordDaily(d, c, game.score, reason === "won"));
		checkAchievements(game, "end", { beatBest: newBest, reason });
		updateMoment();
		return { best, newBest, firstClear, paid };
	}

	/* Records the day and pays its money the first time it is completed; the claim is written with the payment.
	 * Returns { first, paid }. */
	function recordDaily(d, c, score, done) {
		const day = d.daily[c.date] || (d.daily[c.date] = { best: 0, done: false, tries: 0 });
		day.tries++;
		day.best = Math.max(day.best, score);
		const first = done && !day.done;
		if (first) {
			day.done = true;
			d.stats.daily++;
		}
		let paid = 0;
		const age = setup.consoleDaily.daysAgo(c.date);
		if (done && !day.paid && c.reward > 0 && age >= 0 && age < dailyKeep) {
			day.paid = c.reward;
			paid = setup.consoleDaily.pay(c.reward);
		}
		setup.consoleDaily.prune(d.daily);
		return { first, paid };
	}

	function dailyDay(date) {
		return data().daily[date] || null;
	}

	/* ---- saved run ---- */

	function savedRun() {
		const run = data().run;
		return run && typeof run === "object" ? run : null;
	}

	function saveRun(game, snapshot) {
		commit(game);
		data().run = snapshot;
	}

	function clearRun() {
		data().run = null;
	}

	function rememberMode(mode) {
		if (mode === "classic" || mode === "arcade" || mode === "zen") data().mode = mode;
	}

	function finishTutorial() {
		data().tutorial = true;
	}

	function themeUnlocked(id) {
		const theme = setup.suikaContent.themes[id];
		return !!theme && (!theme.reward || !!data().achievements[theme.reward]);
	}

	setup.suikaProgress = Object.freeze({
		schema,
		recordLimit,
		dailyKeep,
		data,
		settings,
		setSetting,
		newTally,
		totals,
		event,
		commit,
		abandon,
		endRun,
		dailyDay,
		masterFeat,
		masterFeatState,
		savedRun,
		saveRun,
		clearRun,
		rememberMode,
		finishTutorial,
		themeUnlocked,
		challengeCount: () => challengeCount(data()),
	});
})();
