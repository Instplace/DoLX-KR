/*
 * "Realistic Childbirth" birth safety init / version gate
 * Validation and version-migration for the `$birth` object runs here in JS, not in Twine macros, so it is loaded
 * once before any passage renders.
 *
 * The entry point is `setup.rcbBirthSafetyCheck()`, called at the very top of the `:: Childbirth` passage.
 * It implements this decision flow:
 *   $birth defined? ──► no ──► info lost ─► deduce location ─► EJECT
 *        │ yes
 *   $birth.version defined? ── no ──► info lost ─► deduce location ─► EJECT
 *        │ yes
 *   version current? ──► yes ──► CONTINUE
 *        │ no
 *   migrate via patch chain ──► ok ──► CONTINUE
 *                            └ fails ─► would cause problems ─► EJECT
 *
 * "EJECT" means the birth minigame can't run safely,
 * so the caller winds the encounter down through the normal `Childbirth End` routing for the deduced location (which still resolves the pregnancy),
 * instead of leaving the player soft-locked.
 */
(() => {
	"use strict";

	/*
	Current schema version of the `$birth` object.
	Bump this whenever the shape of `$birth` changes in a way that an in-progress save needs migrating for, and add a matching entry to `birthPatches` below.
	 */
	const RCB_BIRTH_VERSION = 1;

	/* Birth locations the encounter knows how to wind down (must match the `<<switch $birth.location>>` in the `Childbirth End` passage). */
	const RCB_LOCATIONS = ["hospital", "asylum", "wolf cave", "forest shop", "cottage", "prison", "bedroom", "tower", "waterdragon_nest", "waterdragon_lab"];

	/* Fetus species the birth prompt tables know how to narrate (must match the keys under setup.birthPrompts.stage/stageInitial/contractions). */
	const RCB_TYPES = ["human", "wolf", "hawk"];

	/* Map the player's current game location (`V.location`) onto a birth location, used to deduce where to route the player when `$birth.location` is missing. */
	const LOCATION_FROM_GAME = {
		hospital: "hospital",
		asylum: "asylum",
		forest_shop: "forest shop",
		forest_shop_garden: "forest shop",
		wolf_cave: "wolf cave",
		farm: "cottage",
		cottage: "cottage",
		prison: "prison",
		cell: "prison",
		prisoner: "prison",
		home: "bedroom",
		bedroom: "bedroom",
		tower: "tower",
		waterdragon_nest: "waterdragon_nest",
		waterdragon_lab: "waterdragon_lab",
	};

	const isObject = value => typeof value === "object" && value !== null;

	/*
	 * Version migration registry. 
	Each key `v` holds a function that upgrades a `$birth` object from version `v` to version `v + 1`, mutating it in place.
	The chain is walked one step at a time so multi-version jumps still work.
	 *
	 * There are no patches yet (current version is the first), but as an example:
	   0: birth => { birth.someNewField = birth.oldField ?? 0; delete birth.oldField; },
	 */
	const birthPatches = {};

	/* Figure out where to send the player when `$birth` can't be trusted.
	 * Prefers a valid location already on `$birth`, then the current game location, and falls back to "hospital" (the safe default). */
	function deduceBirthLocation() {
		const birth = V.birth;
		if (isObject(birth) && RCB_LOCATIONS.includes(birth.location)) {
			return birth.location;
		}
		const gameLocation = LOCATION_FROM_GAME[V.location];
		if (gameLocation === "bedroom") {
			// "Childbirth End" only routes "bedroom" to the Robin/Kylar/Solo *egg-laying* passages
			// (every real trigger that starts a bedroom birth hardcodes type: "hawk"). Routing a
			// human/wolf birth there would land it on egg-laying text instead of a birth ending,
			// so only take this fallback when it's actually an egg-laying birth.
			const isHawkBirth = (isObject(birth) && birth.type === "hawk") || (V.harpyEggs && V.harpyEggs.count > 0);
			if (isHawkBirth) {
				return "bedroom";
			}
		} else if (gameLocation) {
			return gameLocation;
		}
		return "hospital";
	}

	/* Figure out what species is being birthed when `$birth.type` can't be trusted. */
	function deduceBirthType() {
		const birth = V.birth;
		if (isObject(birth) && RCB_TYPES.includes(birth.type)) {
			return birth.type;
		}
		if (isObject(birth) && (birth.genital === "vagina" || birth.genital === "anus")) {
			// Real pregnancies live in records now; $sexStats only still holds parasites.
			// Two Beta wombs can be carrying different species, so it's the labouring one that counts.
			const labouring = typeof getLabouringPregnancy === "function" ? getLabouringPregnancy("pc") : null;
			const pregnancy =
				labouring && labouring.orifice === birth.genital
					? labouring
					: typeof getActivePregnancy === "function"
					? getActivePregnancy("pc", birth.genital)
					: null;
			const childType = pregnancy && typeof childBaseSpecies === "function" ? childBaseSpecies(pregnancy.donorSpecies) : null;
			if (RCB_TYPES.includes(childType)) {
				return childType;
			}
		}
		if (V.harpyEggs && V.harpyEggs.count > 0) {
			return "hawk";
		}
		return "human";
	}

	/* Walk the patch chain to bring `birth` up to RCB_BIRTH_VERSION.
	 * Returns true on success, false if migration is impossible or errors; i.e. the "is the version change going to cause problems?" decision. */
	function migrateBirth(birth) {
		let v = birth.version;

		// Save came from a NEWER mod version than is installed.
		// We can't know what changed, so treat it as unsupported rather than risk corrupting state.
		if (v > RCB_BIRTH_VERSION) {
			return false;
		}

		while (v < RCB_BIRTH_VERSION) {
			const patch = birthPatches[v];
			if (typeof patch !== "function") {
				// Gap in the patch chain: nothing knows how to upgrade this version.
				return false;
			}
			try {
				patch(birth);
			} catch (error) {
				console.error(`RCB: birth patch ${v} -> ${v + 1} threw`, error);
				return false;
			}
			// Patches may set the version themselves; otherwise advance it for them.
			if (birth.version === v) birth.version = v + 1;
			if (birth.version !== v + 1) {
				console.error(`RCB: birth patch ${v} left version at ${birth.version}`);
				return false;
			}
			v = birth.version;
		}
		return v === RCB_BIRTH_VERSION;
	}

	/* Build an "end the encounter prematurely" result, ensuring `$birth` exists and carries a routable location so `Childbirth End` can wind down cleanly. */
	function eject(reason) {
		if (!isObject(V.birth)) V.birth = {};
		const location = deduceBirthLocation();
		V.birth.location = location;
		console.warn(`RCB safety: ending childbirth encounter early — ${reason}; routing via "${location}".`);
		return { action: "eject", location, reason };
	}

	/*
	 * Entry point. Returns { action: "continue" } to run the birth normally, or { action: "eject", location, reason } to wind the encounter down safely.
	 */
	setup.rcbBirthSafetyCheck = function rcbBirthSafetyCheck() {
		const birth = V.birth;

		// "Is $birth defined?"
		if (!isObject(birth)) {
			return eject("$birth was undefined");
		}

		// On a brand-new birth, the version and full shape are stamped by the init block that runs immediately after this check,
		// so the version is legitimately absent here. Just guarantee a routable location and let init take over.
		if (V.childbirthstart === 1) {
			if (!RCB_LOCATIONS.includes(birth.location)) {
				birth.location = deduceBirthLocation();
			}
			return { action: "continue" };
		}

		// continuation round: the object should already be fully initialised

		// "Is $birth.version defined?"
		if (typeof birth.version !== "number") {
			return eject("$birth.version was undefined");
		}

		if (!RCB_LOCATIONS.includes(birth.location)) {
			return eject(`$birth.location was invalid: ${birth.location}`);
		}

		// Unlike location, an invalid/missing type is recoverable from the live pregnancy data, so repair it in place instead of ejecting the whole encounter.
		if (!RCB_TYPES.includes(birth.type)) {
			const badType = birth.type;
			birth.type = deduceBirthType();
			console.warn(`RCB safety: $birth.type was invalid (${badType}); repaired to "${birth.type}".`);
		}

		// "Is version current?"
		if (birth.version === RCB_BIRTH_VERSION) {
			return { action: "continue" };
		}

		// Not current: "apply patch or leave unsupported" / "going to cause problems?"
		if (migrateBirth(birth)) {
			return { action: "continue" };
		}
		return eject(`$birth.version ${birth.version} could not be migrated to ${RCB_BIRTH_VERSION}`);
	};

	/* Generic, species-neutral filler used by rcbNormalizeBirthPrompts() when a location has no authored text at all for a given fetus type */
	const RCB_GENERIC_STAGE = [
		[["진통이 당신을 훑고 지나간다. 숨을 고르며 버티는 수밖에 없다."], ["default"]],
		[["진통이 점점 세지고 간격이 짧아진다."], ["default"]],
		[["몸 안에서 차오르는 압박에 온몸이 세게 굳는다."], ["default"]],
		[["이제는 힘주고 싶은 충동을 무시할 수 없다."], ["default"]],
		[["진통에 맞춰 힘을 주며 버틴다."], ["default"]],
		[["머리가 나오려는 것이 느껴진다. 몸을 떨면서도 계속 힘을 준다."], ["default"]],
		[["가장 넓은 부분이 지나가고 있다. 서두를 수는 없다. 몸이 시키는 때에 맞춰 힘을 주는 수밖에 없다."], ["default"]],
		[["마지막으로 힘을 주자 압박이 풀린다."], ["default"]],
		[["아직 끝나지 않았다. 또 하나가 내려오는 것이 느껴진다."], ["default"]],
		[["마침내 출산을 마쳤다."], ["default"]],
	];
	const RCB_GENERIC_CONTRACTIONS = [
		["경련이 당신을 덮친다.", "약한 경련이 느껴진다.", "경련이 잦아들자 몸이 풀린다."],
		["진통이 당신을 움켜쥐는 것이 느껴진다.", "평소보다 강한 진통을 견뎌 낸다.", "잠깐 숨을 고른다."],
		["진통이 몸을 세게 움켜쥔다.", "통증이 줄어들지만 숨 돌릴 틈은 거의 없다."],
		["골반을 짓누르는 압박이 엄청나고 멈출 줄 모른다.", "진통이 잠시 약해진다."],
		["한계에 다다른 것 같지만 진통은 계속된다.", "통증이 잠시 줄어든다."],
		["지치는데도 진통은 계속된다.", "진통이 물러나지만 완전히는 아니다."],
		["지치는데도 진통은 계속된다.", "진통이 물러나지만 완전히는 아니다."],
		["압박이 갑자기 풀린다."],
		["몸이 숨을 고르는 동안 진통이 잠시 잦아든다."],
		["진통이 멎는다."],
	];
	const RCB_GENERIC_BOUND = [
		"누군가 속박을 풀어 주는 동안 오른팔이 묶인 끈에 대고 홱 움찔한다.",
		"오른팔이 고통스러운 속박에서 풀려난다.",
		"속박이 풀리자 오른팔이 힘없이 늘어진다.",
		"오른팔이 속박에서 풀려난다.",
	];

	/* Backfill any RCB_LOCATIONS x RCB_TYPES combination the authored data doesn't cover */
	setup.rcbNormalizeBirthPrompts = function rcbNormalizeBirthPrompts() {
		const prompts = setup.birthPrompts;
		if (!isObject(prompts)) return;

		["stage", "stageInitial"].forEach(table => {
			const byLocation = prompts[table];
			if (!isObject(byLocation)) return;
			RCB_LOCATIONS.forEach(location => {
				if (!isObject(byLocation[location])) byLocation[location] = {};
				const byType = byLocation[location];
				RCB_TYPES.forEach(type => {
					if (!Array.isArray(byType[type])) byType[type] = RCB_GENERIC_STAGE;
				});
			});
		});

		if (!isObject(prompts.contractions)) prompts.contractions = {};
		RCB_TYPES.forEach(type => {
			if (!Array.isArray(prompts.contractions[type])) prompts.contractions[type] = RCB_GENERIC_CONTRACTIONS;
		});

		if (!isObject(prompts.bound)) prompts.bound = {};
		RCB_LOCATIONS.forEach(location => {
			if (!Array.isArray(prompts.bound[location])) prompts.bound[location] = RCB_GENERIC_BOUND;
		});
	};

	// Expose the version + helpers for reuse (e.g. by the init block / other mods).
	setup.RCB_BIRTH_VERSION = RCB_BIRTH_VERSION;
	setup.rcbBirthPatches = birthPatches;
	setup.rcbDeduceBirthLocation = deduceBirthLocation;
	setup.rcbDeduceBirthType = deduceBirthType;
})();
