/* globals V Time either ensurePillInventoryRecords */
/* Completion rewards for the DoL player. Pills come from the game's own catalogue (setup.pills): a win gives an SWP
 * anti-pill, a loss an ordinary gray X-Change pill. Per DoL day (Time.days) the meta allows one pill of each kind and
 * three Science payments. game.rewarded is set the moment a run's reward is decided, even when a cap paid nothing, so
 * loading a finished run later can never pay it. The Science itself is paid by the caller through <<scienceskill>>. */
(() => {
	const science = 2;
	const dailyScienceCap = 3;

	const pool = won => setup.pills.filter(p => p.type === "xchange" && (won ? p.subtype === "anti-pill" : p.color === "gray")).map(p => p.name);

	/* The meta's ledger for today, reset when the DoL day has changed. */
	function ledger(meta) {
		const day = Time.days;
		if (!meta.dailyRewards || meta.dailyRewards.day !== day) meta.dailyRewards = { day, anti: false, gray: false, science: 0 };
		return meta.dailyRewards;
	}

	function grant(game, meta) {
		if (!game || !meta || game.status === "active" || game.rewarded) return null;
		game.rewarded = true;
		const won = game.status === "won";
		const today = ledger(meta);
		const reward = { science: 0, pill: null, notes: [] };
		if (today.science < dailyScienceCap) {
			today.science += 1;
			reward.science = science;
		} else {
			reward.notes.push("일일 과학 보상 한도에 도달했습니다.");
		}
		const kind = won ? "anti" : "gray";
		const names = pool(won);
		if (names.length && V.sexStats && V.sexStats.pills) {
			if (today[kind]) {
				reward.notes.push(won ? "오늘의 안티 알약 보상은 이미 받았습니다." : "오늘의 X-체인지 알약 보상은 이미 받았습니다.");
			} else {
				const name = either(names);
				ensurePillInventoryRecords(V.sexStats.pills.pills);
				V.sexStats.pills.pills[name].owned += 1;
				today[kind] = true;
				reward.pill = name;
			}
		}
		game.reward = reward;
		return reward;
	}

	setup.plagueReward = Object.freeze({ grant });
})();

/* Outbreak console minigame: fixed definitions only. Nothing here changes during play; save state lives on V.plagueGame.
 *
 * Effect objects (used by upgrades and events) share one shape, every key optional:
 *   infectivity / severity / lethality / resistance: added to the disease stat
 *   spread: multiplies spread inside every region
 *   travel: multiplies every route between regions
 *   cure:   multiplies daily cure progress
 *   routes:  { routeType: multiplier }, e.g. { river: 1.5 }
 *   regions: { regionId: multiplier } for spread inside that region
 *   isolate: true  (targeted effects only) blocks every route into and out of the effect's target region
 *   climates: { climateId: multiplier } for spread inside every region of that climate
 *   visibility: added straight to response pressure; negative keeps the outbreak quiet
 *   dnaReward: multiplies milestone DNA (a day's total, rounded down)
 *   restrictionResist: 0..1, the share of every travel cut from the response or a world event that is ignored
 *   cureHardening: true turns on the Genetic Hardening cure rule (tuning.hardening*)
 *   pressure: multiplies total response pressure (difficulty and traits)
 *   infectedWork: added to how much medical work an infected person still does (see infectedWork in plague-sim.js)
 *   startingDna / startingInfected: added when a game is created (traits only) */
(() => {
	const deepFreeze = obj => {
		Object.values(obj).forEach(v => {
			if (v && typeof v === "object") deepFreeze(v);
		});
		return Object.freeze(obj);
	};

	setup.plagueData = deepFreeze({
		/* $plagueGame schema version. */
		version: 1,

		/* $plagueMeta: progression shared by every run in one DoL save. Created by the setup flow's Begin step.
		 * A trait is available when its entry says `starter: true` or its id is in meta.unlocked.traits (earned traits only),
		 * so a starter trait added later reaches existing metas. */
		meta: {
			version: 1,
			startingSlots: 3,
			maxSlots: 4,
			starter: { pathogens: ["bacteria"], difficulties: ["casual", "normal"] },
			/* Unlock rules, read by recordRun(): a WIN with a matching `pathogen` (any if omitted) and a difficulty in `difficulties`
			 * appends `grants` (ids per unlocked list) to meta.unlocked. `hint` is what a locked card shows. */
			unlocks: [
				{ pathogen: "bacteria", difficulties: ["normal", "brutal"], grants: { pathogens: ["virus"] }, hint: "보통 난이도에서 세균으로 승리하십시오." },
				{ pathogen: "virus", difficulties: ["normal", "brutal"], grants: { pathogens: ["fungus"] }, hint: "보통 난이도에서 바이러스로 승리하십시오." },
				{ pathogen: "fungus", difficulties: ["normal", "brutal"], grants: { pathogens: ["parasite"] }, hint: "보통 난이도에서 진균으로 승리하십시오." },
				{ pathogen: "parasite", difficulties: ["normal", "brutal"], grants: { pathogens: ["prion"] }, hint: "보통 난이도에서 기생충으로 승리하십시오." },
				{ difficulties: ["normal", "brutal"], grants: { difficulties: ["brutal"] }, hint: "보통 난이도에서 아무 발병이나 승리하십시오." },
			],
		},

		/* A pathogen is playable only when meta.unlocked lists it and `ready` is true. `effects` is applied to the whole run. */
		pathogens: {
			bacteria: {
				name: "Bacteria",
				line: "균형이 잡혀 있어 두드러진 강점도 약점도 없습니다.",
				desc: "처음 하기에 권장하는 균주입니다. 표준 규칙대로 진행됩니다.",
				ready: true,
				effects: {},
			},
			virus: {
				name: "Virus",
				line: "불안정하며 돌연변이에 특화되어 있습니다.",
				desc: "퍼지면서 계속 변하는 균주입니다. 세계의 10%, 40%, 75%에 도달하면 스스로 진화해, 선택하지 않은 진화를 공짜로 얻습니다.",
				ready: true,
				effects: {},
				/* Shown on the World screen next to the name. */
				tag: "Unstable",
				/* Virus: each threshold (share of the world infected or dead) grants one random free evolution among those
				 * canMutate() allows, weighted by tier. */
				mutation: { thresholds: [0.1, 0.4, 0.75], tierWeights: { 1: 4, 2: 2, 3: 1 } },
			},
			fungus: {
				name: "Fungus",
				line: "자연 이동은 약하지만 고유 능력이 있습니다.",
				desc: "스스로는 지역 사이를 잘 이동하지 못해 경로를 타고 번지는 일이 훨씬 드문 균주입니다. 지역 안에서는 평소대로 자랍니다. 포자 폭발로 아직 닿지 않은 지역에서 감염을 시작할 수 있으며, 한 판에 최대 세 번입니다.",
				ready: true,
				effects: { travel: 0.6 },
				tag: "Sporebound",
				/* An active ability (game.ability). `charges` per run; `seed` infected added to the chosen unreached region. */
				ability: {
					id: "sporeBurst",
					name: "포자 폭발",
					usedLabel: "포자 폭발 사용 횟수",
					desc: "일반 이동 없이 아직 닿지 않은 지역에 감염을 심습니다.",
					charges: 3,
					seed: 10,
				},
			},
			parasite: {
				name: "Parasite",
				line: "은밀하며 고유 능력이 있습니다.",
				desc: "속도를 내주고 은폐를 얻은 균주입니다. 조금 더디게 퍼지는 대신 대응을 덜 끌어내며, 억제 능력으로 그 대응을 일주일간 막을 수 있습니다. 한 판에 두 번입니다.",
				ready: true,
				effects: { pressure: 0.9, spread: 0.95 },
				tag: "Subtle",
				/* `effect` names a timed effect in abilityEffects, started on the run itself. */
				ability: {
					id: "suppress",
					name: "Suppress",
					usedLabel: "억제 사용 횟수",
					desc: "발병을 일시적으로 가리고 대응 격상을 늦춥니다.",
					charges: 2,
					effect: "suppress",
				},
			},
			prion: {
				name: "Prion",
				line: "느리지만 뿌리 깊어 후반에 강합니다.",
				desc: "처음에는 사람을 더 느리게 감염시키는 균주입니다. 발병이 오래 살아남을수록 없애기 어려워집니다. 고착이 20일, 40일, 60일에 진행되며, 단계마다 치료제 연구가 10%씩 더 느려집니다.",
				ready: true,
				effects: { spread: 0.9 },
				tag: "Entrenched",
				/* Prion: level = how many of `days` the current day has reached; each level multiplies cure research by `cure`. */
				entrenchment: { days: [20, 40, 60], cure: 0.9, names: ["I", "II", "III"] },
			},
		},

		/* Difficulty is an effect object read by modifiers(). Normal is `{}` and must stay neutral. */
		difficulties: {
			casual: {
				name: "Casual",
				line: "게임을 익히거나 느긋하게 즐기기에 알맞습니다.",
				notes: ["치료제 연구가 느려집니다", "당국의 대응이 늦어집니다"],
				ready: true,
				effects: { cure: 0.92, pressure: 0.95 },
			},
			normal: { name: "보통", line: "표준 게임입니다.", notes: ["치료제와 대응이 온전한 강도로 작동합니다"], ready: true, effects: {} },
			/* TEMPORARY provisional numbers: Brutal has not been balanced yet. Do not treat them as final. */
			brutal: {
				name: "Brutal",
				line: "더 가혹한 세계입니다.",
				notes: ["치료제 연구가 빨라집니다", "당국의 대응이 빨라집니다"],
				ready: true,
				effects: { cure: 1.15, pressure: 1.15 },
			},
		},

		/* One equipped trait per category at most. `effects` may use any generic key plus startingDna and startingInfected,
		 * which only create() reads. */
		traitCategories: {
			spread: { name: "Spread" },
			concealment: { name: "Concealment" },
			adaptation: { name: "Adaptation" },
			resistance: { name: "Resistance" },
			tempo: { name: "Tempo" },
		},
		traits: {
			vigorous: { name: "왕성함", category: "spread", starter: true, desc: "모든 지역에서 조금 더 빨리 퍼집니다.", effects: { spread: 1.06 } },
			wanderer: { name: "방랑자", category: "spread", starter: true, desc: "이웃 지역에 닿을 가능성이 조금 높습니다.", effects: { travel: 1.2 } },
			mutedSymptoms: {
				name: "억제된 증상",
				category: "concealment",
				starter: true,
				desc: "증상이 나타나도 주목을 덜 받습니다. 발병에 증상이 없는 동안에는 아무 효과가 없습니다.",
				effects: { visibility: -8 },
			},
			slowBurn: {
				name: "서서히 타오름",
				category: "concealment",
				starter: true,
				desc: "당국의 대응이 느려지는 대신 확산이 약간 줄어듭니다.",
				effects: { pressure: 0.92, spread: 0.97 },
			},
			coldTolerance: {
				name: "추위 내성",
				category: "adaptation",
				starter: true,
				desc: "추운 지역이 덜 장애가 됩니다.",
				effects: { climates: { cold: 1.15 } },
			},
			weatherproof: {
				name: "Weatherproof",
				category: "adaptation",
				starter: true,
				desc: "습한 지역과 건조한 지역이 덜 장애가 됩니다.",
				effects: { climates: { wet: 1.1, dry: 1.1 } },
			},
			hardyStrain: {
				name: "강건한 균주",
				category: "resistance",
				starter: true,
				desc: "연구자들이 치료하기가 조금 어려워집니다.",
				effects: { resistance: 0.05 },
			},
			overburden: {
				name: "Overburden",
				category: "resistance",
				starter: true,
				desc: "감염자가 의료 서비스에 도움이 덜 됩니다.",
				effects: { infectedWork: -0.08 },
			},
			headStart: { name: "선두 출발", category: "tempo", starter: true, desc: "여분의 DNA를 조금 가지고 시작합니다.", effects: { startingDna: 2 } },
			rapidSeeding: {
				name: "신속 파종",
				category: "tempo",
				starter: true,
				desc: "더 많은 감염자로 시작하며, 초반에 주목을 끌게 됩니다.",
				effects: { startingInfected: 10, visibility: 6 },
			},
		},

		/* Fictional pathogen names cycled by the setup screen. */
		nameSuggestions: [
			"Vespera rubra",
			"Caligena pallida",
			"Nexaria cinerea",
			"Morvena lenta",
			"Veloria atra",
			"Serenia muta",
			"Corvella ferox",
			"Thalera obscura",
			"Ardella mortis",
			"Silvaria alba",
			"Noctera gravis",
			"Valeria ignota",
			"Virentis",
			"Mortalis",
			"Aurexis",
			"Tenebris",
			"Corvaxis",
			"Malvera",
			"Orphena",
			"Caelith",
			"Virelia",
			"Solvena",
			"Neraxis",
			"Pallexa",
		],
		nameMax: 24,

		tuning: {
			startingDna: 2,
			startingInfected: 10,
			spreadBase: 0.1,
			spreadPerInfectivity: 0.07,
			routeBase: 0.02,
			routeScale: 1.5,
			routeChanceCap: 0.95,
			seedFraction: 0.002,
			seedMax: 20,
			deathPerLethality: 0.02,
			deathRateCap: 0.25,
			cureBase: 0.9,
			capacityFloor: 0.25,
			infectedCapacityBase: 0.6,
			infectedCapacitySeverityPenalty: 0.06,
			infectedCapacityMin: 0.15,
			resistanceCap: 0.6,
			hardeningAbove: 90,
			hardeningSlow: 0.4,
			hardeningCap: 0.8,
			restrictionResistCap: 0.9,
			eventChance: 0.12,
			maxActiveEvents: 2,
			logLimit: 12,
			fastForwardDays: 10,
			fastForwardCureMarks: [25, 50, 75, 90],
		},

		/* DNA milestones. Each pays once, when first reached (game.milestones lists claimed ids). Progress counts infected + dead.
		 * Share 0 means the first case; `full` means nobody healthy is left. {region} in text is the region's name. */
		dna: {
			region: [
				{ key: "first", share: 0, dna: 2, text: "{region} 도달" },
				{ key: "25", share: 0.25, dna: 1, text: "{region} 25% 돌파" },
				{ key: "50", share: 0.5, dna: 1, text: "{region} 50% 돌파" },
				{ key: "75", share: 0.75, dna: 1, text: "{region} 75% 돌파" },
				{ key: "full", full: true, dna: 2, text: "{region} 완전 도달" },
			],
			global: [
				{ key: "5", share: 0.05, dna: 1, text: "발병 5% 돌파" },
				{ key: "10", share: 0.1, dna: 1, text: "발병 10% 돌파" },
				{ key: "25", share: 0.25, dna: 2, text: "발병 25% 돌파" },
				{ key: "50", share: 0.5, dna: 2, text: "발병 50% 돌파" },
				{ key: "75", share: 0.75, dna: 3, text: "발병 75% 돌파" },
				{ key: "full", full: true, dna: 3, text: "발병이 모두에게 도달" },
			],
			deaths: [
				{ key: "10", share: 0.1, dna: 2, text: "사망 10% 돌파" },
				{ key: "25", share: 0.25, dna: 3, text: "사망 25% 돌파" },
				{ key: "50", share: 0.5, dna: 3, text: "사망 50% 돌파" },
				{ key: "75", share: 0.75, dna: 4, text: "사망 75% 돌파" },
			],
		},

		baseStats: { infectivity: 1, severity: 0, lethality: 0, resistance: 0 },

		regions: {
			/* density: local spread multiplier. healthcare: weight in world medical capacity. hub: multiplier on infection leaving
			 * this region. */
			town: {
				name: "Town",
				icon: "town.png",
				population: 12000,
				density: 1.3,
				healthcare: 2,
				climate: "temperate",
				hub: 1,
				note: "붐비는 거리와 공동 건물",
			},
			farmland: {
				name: "Farmland",
				icon: "farmlands.png",
				population: 4000,
				density: 0.9,
				healthcare: 1,
				climate: "dry",
				hub: 0.9,
				note: "멀리 떨어져 흩어진 농장들",
			},
			forest: {
				name: "Forest",
				icon: "forest.png",
				population: 1500,
				density: 0.5,
				healthcare: 0.5,
				climate: "wet",
				hub: 0.6,
				note: "외딴 오두막에 사는 소수의 사람들",
			},
			lake: { name: "호수", icon: "lake.png", population: 2500, density: 1, healthcare: 1, climate: "wet", hub: 1, note: "물가에 모여 있는 마을들" },
			coast: {
				name: "Coast",
				icon: "beach.gif",
				population: 5000,
				density: 1,
				healthcare: 1.5,
				climate: "wet",
				hub: 1.6,
				note: "선원들이 꾸준히 드나드는 항구 도시",
			},
			north: {
				name: "North",
				icon: "moor.png",
				population: 2000,
				density: 0.8,
				healthcare: 1,
				climate: "cold",
				hub: 0.7,
				note: "긴 겨울에 갇힌 외딴 마을들",
			},
		},

		/* `density` (optional) multiplies local spread in every region of that climate. */
		climates: {
			temperate: { name: "Temperate" },
			wet: { name: "Wet" },
			dry: { name: "Dry" },
			cold: { name: "Cold", density: 0.65 },
		},

		/* World response. The stage is saved and never falls; pressure is recalculated each day (responsePressure). Stage fields:
		 * threshold (pressure to reach it), cure (research speed factor), localSpread (spread multiplier in every region, with
		 * spreadNote for the player), effects (applied from the next day), healthcareSpread (extra spread cut in regions with
		 * healthcare >= highHealthcare), isolate (isolates one region on entry), news (logged once). */
		response: {
			spreadWeight: 35,
			spreadFull: 0.4,
			visibilityPerSeverity: 6,
			visibilityCap: 30,
			deathsWeight: 40,
			deathsFull: 0.25,
			reachWeight: 15,
			timePerDay: 0.5,
			timeCap: 40,
			highHealthcare: 1.5,
			stages: [
				{ name: "Unaware", threshold: 0, cure: 0 },
				{ name: "발견", threshold: 15, cure: 0.4, news: "의사들이 발병을 인지하고 조사에 나선다." },
				{
					name: "Alert",
					threshold: 35,
					cure: 1,
					localSpread: 0.95,
					spreadNote: "시민들의 예방 조치가 지역 내 확산을 약간 늦추고 있습니다.",
					healthcareSpread: 0.9,
					news: "당국이 발병에 대한 대응을 조직한다.",
				},
				{
					name: "Emergency",
					threshold: 60,
					cure: 1.6,
					localSpread: 0.85,
					spreadNote: "비상 조치가 지역 내 확산을 늦추고 있습니다.",
					effects: { travel: 0.8 },
					healthcareSpread: 0.9,
					isolate: true,
					news: "비상 조치가 발표된다.",
				},
				{
					name: "Lockdown",
					threshold: 85,
					cure: 2,
					localSpread: 0.7,
					spreadNote: "엄격한 조치가 지역 내 확산을 크게 늦추고 있습니다.",
					effects: { travel: 0.6 },
					healthcareSpread: 0.8,
					news: "광범위한 제한이 시행된다.",
				},
			],
		},

		/* Timed effects created by the response. {region} in start/end is the target's name. */
		responseEffects: {
			isolation: {
				name: "Isolation",
				duration: 5,
				effects: { isolate: true },
				desc: "누구도 드나들 수 없습니다.",
				start: "당국이 {region} 지역을 격리한다. 누구도 드나들 수 없다.",
				end: "{region} 지역의 격리가 해제된다.",
			},
		},

		/* Timed effects started by a pathogen ability. Added between days, they first apply on the next day and last `duration` days. */
		abilityEffects: {
			suppress: {
				name: "Suppress",
				duration: 7,
				effects: { pressure: 0.6 },
				desc: "대응 압박이 줄어듭니다.",
				start: "기생충이 발병의 징후를 억누른다.",
				end: "억제 효과가 사라졌다.",
			},
		},

		routeTypes: {
			road: { name: "road" },
			river: { name: "river" },
			sea: { name: "해상 항로" },
			trail: { name: "숲길" },
		},

		/* Undirected: each route carries infection both ways. */
		routes: [
			{ a: "town", b: "farmland", type: "road" },
			{ a: "town", b: "lake", type: "river" },
			{ a: "town", b: "coast", type: "sea" },
			{ a: "farmland", b: "forest", type: "trail" },
			{ a: "farmland", b: "north", type: "road" },
			{ a: "forest", b: "lake", type: "river" },
			{ a: "forest", b: "north", type: "trail" },
			{ a: "lake", b: "coast", type: "river" },
		],

		/* requires: every id must be owned. requiresAny: at least one must be owned. Order here is display order. */
		/* Evolve screen sections, in display order. Each upgrade names one in `category`. */
		upgradeCategories: {
			transmission: { name: "Transmission" },
			symptoms: { name: "Symptoms" },
			resistance: { name: "Resistance" },
		},

		/* Branches inside each family, in display order. Each upgrade names one in `branch`; `tier` is its depth (1 first). */
		upgradeBranches: {
			respiratory: { name: "Respiratory", category: "transmission" },
			contact: { name: "Contact", category: "transmission" },
			water: { name: "Water", category: "transmission" },
			animal: { name: "Animal", category: "transmission" },
			travel: { name: "Travel", category: "transmission" },
			environment: { name: "Environment", category: "transmission" },
			mild: { name: "Mild", category: "symptoms" },
			visible: { name: "Visible", category: "symptoms" },
			severe: { name: "Severe", category: "symptoms" },
			lethal: { name: "Lethal", category: "symptoms" },
			cure: { name: "치료 내성", category: "resistance" },
			concealment: { name: "Concealment", category: "resistance" },
			adaptation: { name: "Adaptation", category: "resistance" },
			stability: { name: "Stability", category: "resistance" },
		},

		/* `tag` is the short label printed on the evolution tree node; it has no effect on play. */
		upgrades: {
			cough: {
				name: "Coughing",
				tag: "Air",
				category: "transmission",
				branch: "respiratory",
				tier: 1,
				cost: 3,
				desc: "공기를 통해 퍼집니다.",
				effects: { infectivity: 1 },
			},
			sneeze: {
				name: "Sneezing",
				tag: "Air",
				category: "transmission",
				branch: "respiratory",
				tier: 2,
				cost: 6,
				requires: ["cough"],
				desc: "재채기 한 번이 방 전체에 닿습니다.",
				effects: { infectivity: 2 },
			},
			sweat: {
				name: "열에 젖은 땀",
				tag: "Crowds",
				category: "transmission",
				branch: "contact",
				tier: 1,
				cost: 8,
				requires: ["cough"],
				desc: "군중 속에서 손에서 손으로 옮겨 갑니다.",
				effects: { infectivity: 1, regions: { town: 1.2 } },
			},
			water1: {
				name: "Waterborne",
				tag: "Water",
				category: "transmission",
				branch: "water",
				tier: 1,
				cost: 5,
				desc: "강물과 바다 물보라 속에서도 살아남습니다.",
				effects: { routes: { river: 1.5, sea: 1.5 }, regions: { lake: 1.3 } },
			},
			livestock: {
				name: "가축 매개체",
				tag: "Farms",
				category: "transmission",
				branch: "animal",
				tier: 1,
				cost: 5,
				desc: "동물이 농장 사이로 옮깁니다.",
				effects: { routes: { road: 1.3 }, regions: { farmland: 1.3 } },
			},
			travel: {
				name: "Hitchhiker",
				tag: "Travel",
				category: "transmission",
				branch: "travel",
				tier: 1,
				cost: 9,
				requiresAny: ["water1", "livestock"],
				desc: "이동하는 사람이라면 누구에게나 따라붙습니다.",
				effects: { travel: 1.5 },
			},
			nausea: {
				name: "Nausea",
				tag: "Mild",
				category: "symptoms",
				branch: "mild",
				tier: 1,
				cost: 4,
				desc: "숙주가 아프다고 느낍니다. 사람들이 눈치채기 시작합니다.",
				effects: { severity: 1 },
			},
			delirium: {
				name: "Delirium",
				tag: "Mingling",
				category: "symptoms",
				branch: "severe",
				tier: 1,
				cost: 8,
				requires: ["nausea"],
				desc: "혼란에 빠진 숙주가 돌아다니며 사람들과 섞입니다.",
				effects: { severity: 2, infectivity: 1 },
			},
			organ: {
				name: "장기 부전",
				tag: "Deadly",
				category: "symptoms",
				branch: "lethal",
				tier: 1,
				cost: 10,
				requires: ["nausea"],
				desc: "일부 숙주는 회복하지 못합니다.",
				effects: { lethality: 2, severity: 1 },
			},
			haemorrhage: {
				name: "Haemorrhage",
				tag: "Deadly",
				category: "symptoms",
				branch: "lethal",
				tier: 2,
				cost: 16,
				requires: ["organ"],
				desc: "치명적이며 숨길 수 없습니다.",
				effects: { lethality: 4, severity: 2 },
			},
			resist1: {
				name: "약물 내성",
				tag: "Cure",
				category: "resistance",
				branch: "cure",
				tier: 1,
				cost: 7,
				desc: "흔한 치료법이 듣지 않게 됩니다.",
				effects: { resistance: 0.2 },
			},
			resist2: {
				name: "유전자 뒤섞기",
				tag: "Cure",
				category: "resistance",
				branch: "cure",
				tier: 2,
				cost: 14,
				requires: ["resist1"],
				desc: "연구자가 분석하는 속도보다 빨리 변이합니다.",
				effects: { resistance: 0.25 },
			},
			airborne: {
				name: "공기 전파",
				tag: "Loud",
				category: "transmission",
				branch: "respiratory",
				tier: 3,
				cost: 10,
				requires: ["sneeze"],
				exclusive: "respiratoryPath",
				desc: "빠르게 퍼지지만 발병이 눈에 더 잘 띕니다.",
				effects: { infectivity: 2, spread: 1.2, visibility: 12 },
			},
			silent: {
				name: "무증상 보균",
				tag: "Quiet",
				category: "transmission",
				branch: "respiratory",
				tier: 3,
				cost: 9,
				requires: ["sneeze"],
				exclusive: "respiratoryPath",
				desc: "더 조용히 퍼지지만 이동할 기회는 줄어듭니다.",
				effects: { infectivity: 1, visibility: -10, travel: 0.75 },
			},
			crowd: {
				name: "군중 매개",
				tag: "Crowds",
				category: "transmission",
				branch: "contact",
				tier: 2,
				cost: 11,
				requires: ["sweat"],
				desc: "마을의 인파 속에서 번성하지만 발견되기도 더 쉽습니다.",
				effects: { infectivity: 1, regions: { town: 1.6 }, visibility: 5 },
			},
			flood: {
				name: "Floodborne",
				tag: "Wet",
				category: "transmission",
				branch: "water",
				tier: 2,
				cost: 9,
				requires: ["water1"],
				desc: "건조한 지대보다 습한 지역과 강 경로에서 유리합니다.",
				effects: { climates: { wet: 1.4, dry: 0.85 }, routes: { river: 1.6 } },
			},
			bird: {
				name: "조류 매개",
				tag: "Remote",
				category: "transmission",
				branch: "animal",
				tier: 2,
				cost: 9,
				requires: ["livestock"],
				desc: "외진 오솔길을 따라 숲속 정착지에 닿습니다.",
				effects: { routes: { trail: 1.8 }, regions: { forest: 1.5, north: 1.2 } },
			},
			harbour: {
				name: "항구 건너뛰기",
				tag: "Borders",
				category: "transmission",
				branch: "travel",
				tier: 2,
				cost: 13,
				requires: ["travel"],
				desc: "이동 제한 속에서도 경로를 계속 움직입니다. 완전히 격리된 지역은 계속 닫혀 있습니다.",
				effects: { restrictionResist: 0.6, routes: { sea: 1.3 } },
			},
			coldHardy: {
				name: "내한성",
				tag: "Cold",
				category: "transmission",
				branch: "environment",
				tier: 1,
				cost: 4,
				desc: "추운 지역에서는 더 잘 퍼지고 건조한 지역에서는 덜 퍼집니다.",
				effects: { climates: { cold: 1.6, dry: 0.9 } },
			},
			droughtHardy: {
				name: "내건성",
				tag: "Dry",
				category: "transmission",
				branch: "environment",
				tier: 1,
				cost: 3,
				desc: "습한 지역을 희생해 건조한 지역에서 유리합니다.",
				effects: { climates: { dry: 1.5, wet: 0.9 } },
			},
			paranoia: {
				name: "Paranoia",
				tag: "Quiet",
				category: "symptoms",
				branch: "mild",
				tier: 2,
				cost: 7,
				requires: ["nausea"],
				desc: "증상을 눈에 띄지 않게 하지만 숙주가 덜 섞입니다.",
				effects: { severity: 1, visibility: -12, spread: 0.85 },
			},
			fever: {
				name: "급성 고열",
				tag: "Loud",
				category: "symptoms",
				branch: "visible",
				tier: 1,
				cost: 4,
				desc: "값싸게 확산을 크게 늘리지만 증상이 눈에 띕니다.",
				effects: { infectivity: 1, severity: 1, visibility: 5 },
			},
			frenzy: {
				name: "Frenzy",
				tag: "Loud",
				category: "symptoms",
				branch: "severe",
				tier: 2,
				cost: 12,
				requires: ["delirium"],
				exclusive: "deliriumPath",
				desc: "무모한 활동이 확산을 부추기고 공식 대응도 강화합니다.",
				effects: { infectivity: 2, severity: 2, visibility: 10 },
			},
			lethargy: {
				name: "Lethargy",
				tag: "Quiet",
				category: "symptoms",
				branch: "severe",
				tier: 2,
				cost: 10,
				requires: ["delirium"],
				exclusive: "deliriumPath",
				desc: "약한 증상 때문에 발병이 눈에 덜 띄지만 확산과 이동이 줄어듭니다.",
				effects: { visibility: -20, spread: 0.8, travel: 0.7 },
			},
			collapse: {
				name: "완전 붕괴",
				tag: "Deadly",
				category: "symptoms",
				branch: "lethal",
				tier: 3,
				cost: 22,
				requires: ["haemorrhage"],
				desc: "치사율을 끌어올리는 값비싼 마지막 승부수입니다. 확산이 주춤하고 발병은 무시할 수 없게 됩니다.",
				effects: { lethality: 4, severity: 3, spread: 0.65, visibility: 15 },
			},
			hardening: {
				name: "유전자 경화",
				tag: "치료 후반",
				category: "resistance",
				branch: "cure",
				tier: 3,
				cost: 18,
				requires: ["resist2"],
				desc: "하루 치료제 증가량을 0.8포인트로 제한하고, 90%를 넘으면 증가량에 0.4도 곱합니다. 연구는 여전히 끝낼 수 있습니다.",
				effects: { cureHardening: true },
			},
			lowSignal: {
				name: "저신호",
				tag: "Quiet",
				category: "resistance",
				branch: "concealment",
				tier: 1,
				cost: 3,
				desc: "주목은 덜 받지만 확산이 조금 더딥니다.",
				effects: { visibility: -8, spread: 0.95 },
			},
			mimicry: {
				name: "Mimicry",
				tag: "Quiet",
				category: "resistance",
				branch: "concealment",
				tier: 2,
				cost: 8,
				requires: ["lowSignal"],
				desc: "발병을 더 감추고 연구를 늦추는 대신 이동이 줄어듭니다.",
				effects: { visibility: -12, cure: 0.9, travel: 0.85 },
			},
			stable: {
				name: "안정 유전체",
				tag: "Cure",
				category: "resistance",
				branch: "stability",
				tier: 1,
				cost: 3,
				desc: "치료제 연구가 소폭 줄어듭니다. 이번 판에서는 돌연변이 효과가 작동하지 않습니다.",
				effects: { cure: 0.95 },
			},
			climateShell: {
				name: "기후 껍질",
				tag: "한랭, 건조",
				category: "resistance",
				branch: "adaptation",
				tier: 1,
				cost: 6,
				desc: "추운 지역과 건조한 지역에서 유리하지만 그 사이의 이동은 느려집니다.",
				effects: { climates: { cold: 1.3, dry: 1.3 }, travel: 0.9 },
			},
		},

		/* duration: days the event applies, starting the day after it rolls. weight: relative roll chance.
		 * stackable: may run twice at once (default no). needs: a condition name or list (see eventNeeds in plague-sim.js).
		 * responseAtLeast: the lowest response stage (index into response.stages) at which it can roll.
		 * conflicts: event ids that cannot run at the same time as this one (checked both ways).
		 * desc: the Active events line. start / end: one news entry each. */
		events: {
			rain: {
				name: "폭우",
				duration: 3,
				weight: 3,
				effects: { routes: { river: 1.5, sea: 1.3 }, regions: { lake: 1.2 } },
				desc: "물길을 따라 감염이 더 쉽게 퍼집니다.",
				start: "폭우로 강이 범람한다. 물을 통한 감염이 더 쉽게 퍼진다.",
				end: "폭우가 잦아든다.",
			},
			cold: {
				name: "한파",
				duration: 4,
				weight: 3,
				/* A cold snap keeps people indoors and apart, a festival packs them into the streets: never both. */
				conflicts: ["festival"],
				effects: { spread: 0.75, regions: { north: 0.7 } },
				desc: "감염이 더 느리게 퍼집니다. 특히 북부에서 그렇습니다.",
				start: "한파로 사람들이 실내에 머물며 서로 떨어져 지낸다. 감염이 더 느리게 퍼진다.",
				end: "한파가 끝난다.",
			},
			festival: {
				name: "마을 축제",
				duration: 2,
				weight: 2,
				effects: { regions: { town: 1.6 } },
				desc: "인파가 마을 거리를 가득 메웁니다.",
				start: "축제로 마을 거리가 인파로 가득 찬다.",
				end: "축제가 끝났다.",
			},
			funding: {
				name: "병원 지원금",
				duration: 5,
				weight: 2,
				responseAtLeast: 2,
				effects: { cure: 1.6 },
				desc: "병원이 치료제 연구에 쓸 추가 자금을 확보했습니다.",
				start: "병원이 긴급 자금을 받는다. 치료제 연구에 속도가 붙는다.",
				end: "긴급 자금이 바닥난다.",
			},
			travelBan: {
				name: "이동 제한",
				duration: 5,
				weight: 2,
				responseAtLeast: 2,
				effects: { travel: 0.3 },
				desc: "지역 사이를 오가는 사람이 줄어듭니다.",
				start: "지역 사이의 도로와 여객선이 폐쇄된다.",
				end: "이동 제한이 해제된다.",
			},
		},
	});
})();
