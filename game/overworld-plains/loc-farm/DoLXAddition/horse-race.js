/* Horse Race Betting Minigame for DoL-style projects */
/* globals isMonsterHallucinationAllowed */
setup.horserace = setup.horserace || {};

(function () {
	"use strict";
	const HR = setup.horserace;
	HR.DEFAULT_WATCH_DELAY = 1600;

	/* Gambling balance configuration.
	 * PAYOUT_MARGIN: house edge built into the posted odds. Odds are the
	 *   margin divided by the horse's estimated chance, so every bet returns
	 *   92% of its stake on average. Set to 1.0 for fair odds. The odds are
	 *   never capped, because a cap would quietly worsen the edge on longshots.
	 *
	 * MAX_PAYOUT: the most one slip can return, in whole pounds. Instead of
	 *   shortening long odds, the bookie lowers the largest stake it takes
	 *   (MAX_PAYOUT / odds), so the price stays honest and one lucky longshot
	 *   cannot pay more than the old 5.75x odds on a 2000 stake did.
	 *
	 * PLACE_WIN_WEIGHT: how much a winning place bet counts towards the weekly
	 *   win cap. Place bets land about twice as often and pay much less.
	 *
	 * INCIDENT_CHANCES: percent chance per runner per race, rolled once at the
	 *   start whether or not anyone backed that runner. Only "injured" marks the
	 *   horse as injured for the week; "exhausted" pulls it out of this race only.
	 *
	 * ODDS_TRIALS: how many silent runs of the field createRace uses to price it.
	 *
	 * The weekly reset is handled by DoL's native $weekly cleanup; all weekly
	 * counters live on $weekly, so they clear automatically each game week.
	 */
	HR.PAYOUT_MARGIN = 0.92;
	HR.INCIDENT_CHANCES = { blocked: 5, wide: 3, stumble: 2, exhausted: 1.5, injured: 1 };
	/* Pace multipliers for the rounds after a non-fatal incident starts. */
	HR.INCIDENT_PACE = { blocked: [0.35, 0.45, 0.65], wide: [0.2, 0.55], stumble: [0.1, 0.7] };
	/* Each runner's form on the day, rolled once per race and added to its pace every round. Bigger means more upsets. */
	HR.FORM_SPREAD = 1.7;
	HR.ODDS_TRIALS = 2000;
	/* A winning slip always returns at least the stake. */
	HR.ODDS_FLOOR = 1;
	HR.MAX_PAYOUT = 10000;
	HR.PLACE_WIN_WEIGHT = 0.5;
	/* Gambling luck speeds up only the backed horse, after the odds are posted, so it is a real edge over the bookie.
	   Sized so the average return per stake roughly matches what the same luck gives at blackjack and dice. */
	HR.MOOR_LUCK_PACE = 0.13;
	HR.CLOVER_LUCK_PACE = 0.035;

	/* The runners are the farm's horses, so they follow the farm's daily horse/centaur roll (see the farm_text widget).
	   A 100% beastfolk chance always shows centaurs, even on a day the farm rolled before the setting changed. */
	HR.centaurs = function () {
		return isMonsterHallucinationAllowed(State.variables.farm_work?.horse?.monster_roll === true ? 1 : 100);
	};

	HR.kind = function (plural, capital) {
		const word = (HR.centaurs() ? "centaur" : "horse") + (plural ? "s" : "");
		return capital ? word.toUpperFirst() : word;
	};

	/* Centaur runners are written as male, matching the stallion text and the male combat init. */
	HR.it = function (form) {
		const forms = HR.centaurs() ? { it: "he", It: "He", its: "his", Its: "His", itobj: "him" } : { it: "it", It: "It", its: "its", Its: "Its", itobj: "it" };
		return forms[form];
	};

	/* ---- Race rigging configuration ------------------------------------ *
	 * Each stable action adds suspicion on success or failure (failure adds more, since getting caught trying is worse than a clean success).
	 * SUSPICION_CANCEL_CAP is the maximum percent chance, rolled once when the player places their bet, that the stewards pull the race entirely (bet is never charged).
	 * Surviving suspicion instead shortens the effective odds on a winning payout, via suspicionPayoutMultiplier.
	 * ------------------------------------------------------------------- */
	HR.SUSPICION_CANCEL_CAP = 80;

	HR.suspicionPayoutMultiplier = function (suspicion) {
		return HR.clamp(1 - HR.clamp(suspicion, 0, 100) / 250, 0.55, 1);
	};

	HR.RIG_ACTIONS = [
		{
			id: "injure_horse",
			tier: "high",
			get label() {
				return `Injure a ${HR.kind()}`;
			},
			target: "rival",
			passage: "Racecourse Rig Injure Horse",
			difficulty: 250,
			suspicionSuccess: 25,
			suspicionFail: 45,
			apply(horse) {
				horse.baseSpeed -= 60;
				horse.maxStamina -= 60;
				horse.stamina = Math.min(horse.stamina, horse.maxStamina);
				horse.focus -= 20;
			},
		},
		{
			id: "beat_rider",
			tier: "high",
			label: "기수를 위협한다",
			target: "rival",
			passage: "Racecourse Rig Threaten Rider",
			difficulty: 350,
			suspicionSuccess: 25,
			suspicionFail: 45,
			apply(horse) {
				horse.baseSpeed -= 25;
				horse.focus -= 30;
				horse.stamina -= 15;
			},
		},
		{
			id: "drug_horse",
			tier: "medium",
			label: "사료에 약을 탄다",
			target: "rival",
			passage: "Racecourse Rig Drug Horse",
			difficulty: 450,
			suspicionSuccess: 12,
			suspicionFail: 25,
			itemCost: "phial",
			apply(horse) {
				horse.stamina -= 25;
				horse.focus -= 20;
			},
		},
		{
			id: "stimulate_own",
			tier: "medium",
			get label() {
				return `${HR.kind()}에게 약을 먹인다`;
			},
			target: "own",
			passage: "Racecourse Rig Stimulant",
			difficulty: 400,
			suspicionSuccess: 12,
			suspicionFail: 25,
			itemCost: "phial",
			apply(horse) {
				horse.baseSpeed += 15;
				horse.stamina += 15;
			},
		},
		{
			id: "bribe_money",
			tier: "medium",
			label: "현금으로 매수한다",
			target: "rival",
			passage: "Racecourse Rig Bribe Money",
			difficulty: 300,
			suspicionSuccess: 12,
			suspicionFail: 20,
			cost: 500,
			apply(horse) {
				horse.focus -= 20;
				horse.baseSpeed -= 10;
			},
		},
		{
			id: "sabotage_equipment",
			tier: "low",
			label: "마구를 끊는다",
			target: "rival",
			passage: "Racecourse Rig Sabotage Tack",
			difficulty: 350,
			suspicionSuccess: 4,
			suspicionFail: 10,
			apply(horse) {
				horse.focus -= 15;
				horse.stamina -= 8;
			},
		},
		{
			id: "encourage_own",
			tier: "low",
			get label() {
				return `${HR.kind()}에게 힘을 북돋운다`;
			},
			target: "own",
			passage: "Racecourse Rig Encourage Horse",
			deviancyGated: true,
			difficulty: 250,
			suspicionSuccess: 4,
			suspicionFail: 10,
			apply(horse) {
				horse.focus += 12;
				horse.stamina += 8;
			},
		},
		{
			id: "bribe_sex",
			tier: "low",
			label: "섹스로 매수한다",
			target: "own",
			passage: "Racecourse Rig Bribe Rider",
			difficulty: 300,
			suspicionSuccess: 4,
			suspicionFail: 10,
			apply(horse) {
				horse.baseSpeed += 12;
				horse.focus += 10;
			},
		},
	];

	/* ---- Stable rigging mini-game --------------------------------------- *
	 * Every rigging action (except the rider bribe, which runs the real sex encounter loop instead) plays out as a short push-your-luck game:
		a progress meter that has to reach 100 before a risk meter reaches 100.
	 * Each turn the player picks:
	 *   "quick"    - a skulduggery check at the action's full difficulty.
	 *                Big progress and a real risk bump on success, a small
	 *                gain but a heavy risk bump on failure.
	 *   "careful"  - a skulduggery check 100 points easier. Smaller gains,
	 *                much smaller risk either way.
	 *   "watch"    - no check, no progress, but bleeds off risk.
	 * Five turns is the hard cap; running out of time resolves on whichever meter is closer to its own threshold.
	 * ------------------------------------------------------------------- */
	HR.RIG_MINIGAME_TURN_CAP = 5;

	HR.rigGameState = function () {
		const race = HR.ensureState();
		if (race.rigGame == null || typeof race.rigGame !== "object") race.rigGame = {};
		const g = race.rigGame;
		if (!Number.isFinite(g.progress)) g.progress = 0;
		if (!Number.isFinite(g.risk)) g.risk = 0;
		if (!Number.isFinite(g.turn)) g.turn = 0;
		if (typeof g.actionId !== "string") g.actionId = "";
		if (typeof g.pendingMode !== "string") g.pendingMode = "";
		return g;
	};

	HR.startRigMinigame = function (actionId) {
		const g = HR.rigGameState();
		g.actionId = actionId;
		g.progress = 0;
		g.risk = 0;
		g.turn = 0;
		g.pendingMode = "";
		return g;
	};

	/* Built in JS rather than as twee markup */
	HR.renderRigMeters = function () {
		const g = HR.rigGameState();
		const progress = HR.clamp(g.progress, 0, 100);
		const risk = HR.clamp(g.risk, 0, 100);
		const turnsLeft = Math.max(0, HR.RIG_MINIGAME_TURN_CAP - g.turn);
		return `<div class="horse-race-panel">
			<div class="horse-race-progress">
				<span>Progress</span>
				<meter min="0" max="100" low="35" high="70" optimum="100" value="${progress.toFixed(0)}"></meter>
				<span>${Math.floor(progress)}%</span>
			</div>
			<div class="horse-race-progress">
				<span>Risk of being noticed</span>
				<meter min="0" max="100" low="35" high="70" optimum="0" value="${risk.toFixed(0)}"></meter>
				<span>${Math.floor(risk)}%</span>
			</div>
			<p>Time before the ${HR.kind(true)} are led out: <strong>${turnsLeft}</strong></p>
		</div>`;
	};

	HR.rigMinigameDifficulty = function (action, mode) {
		if (!action) return 0;
		if (mode === "careful") return Math.max(0, action.difficulty - 100);
		return action.difficulty;
	};

	HR.applyMinigameTurn = function (mode, success) {
		const g = HR.rigGameState();
		g.turn += 1;
		if (mode === "quick") {
			if (success) {
				g.progress = HR.clamp(g.progress + 45, 0, 100);
				g.risk = HR.clamp(g.risk + 8, 0, 100);
			} else {
				g.progress = HR.clamp(g.progress + 10, 0, 100);
				g.risk = HR.clamp(g.risk + 35, 0, 100);
			}
		} else if (mode === "careful") {
			if (success) {
				g.progress = HR.clamp(g.progress + 25, 0, 100);
				g.risk = HR.clamp(g.risk + 3, 0, 100);
			} else {
				g.progress = HR.clamp(g.progress + 8, 0, 100);
				g.risk = HR.clamp(g.risk + 15, 0, 100);
			}
		} else if (mode === "watch") {
			g.risk = HR.clamp(g.risk - 18, 0, 100);
		}
		return g;
	};

	HR.rigMinigameOutcome = function () {
		const g = HR.rigGameState();
		if (g.risk >= 100) return "caught";
		if (g.progress >= 100) return "success";
		if (g.turn >= HR.RIG_MINIGAME_TURN_CAP) return g.progress >= 60 ? "success" : "caught";
		return "ongoing";
	};

	HR.RIG_MINIGAME_TEXT = {
		injure_horse: {
			get scene() {
				return `당신은 ${HR.kind()}의 앞다리 옆에 웅크리고 편자를 붙잡는다. 일꾼이 눈치채지 못하게 못을 느슨하게 빼내야 한다.`;
			},
			quick: "세게 잡아당긴다",
			careful: "천천히 빼낸다",
			watchLabel: "일꾼이 어디 있는지 살핀다",
			quickSuccess: "못이 순식간에 빠진다. 편자는 벌써 거의 다 헐거워졌다.",
			quickFail: "너무 세게 잡아당기는 바람에 편자가 땅바닥에 쨍 부딪힌다. 당신은 얼어붙지만, 아직 아무도 달려오지 않는다.",
			carefulSuccess: "못을 조금씩 빼낸다. 느리지만 효과가 있고, 아무도 이쪽을 보지 않는다.",
			carefulFail: "손가락이 못대가리에서 미끄러져 쥐고 있던 것을 놓친다. 못은 거의 움직이지 않았다.",
			watch: "줄지어 선 쪽을 흘끗 살핀다. 일꾼은 아직 저 끝에서 바쁘다.",
		},
		beat_rider: {
			scene: "당신은 마구간 뒤에서 기수를 구석에 몰아넣었다. 누가 지나가기 전에 협박이 먹히게 해야 한다.",
			quick: "협박을 세게 밀어붙인다",
			careful: "목소리를 낮추고 침착하게 이어 간다",
			watchLabel: "근처에 누가 있는지 살핀다",
			quickSuccess: "협박이 먹힌다. 그것이 파고드는 게 눈에 보인다.",
			quickFail: "기수가 움찔 물러서며 목소리가 높아진다. 마구간 두 칸 아래에 있던 마부가 이쪽을 흘끗 쳐다본다.",
			carefulSuccess: "조용하고 구체적으로 말한다. 기수는 귀를 기울이고 있고, 다른 누구도 눈치채지 못했다.",
			carefulFail: "기수는 넘어가지 않고, 부를 사람을 찾으려 계속 당신의 어깨 너머를 흘끗거린다.",
			watch: "어깨 너머로 확인한다. 이 뒤편에는 여전히 둘뿐이다.",
		},
		drug_horse: {
			scene: "작은 병은 열려 있고 사료통이 눈앞에 있다. 일꾼이 돌아오기 전에 고르게 섞어야 한다.",
			quick: "병째 쏟아붓는다",
			careful: "조금씩 섞는다",
			watchLabel: "발소리에 귀를 기울인다",
			get quickSuccess() {
				return `깔끔하게 사료에 섞인다. ${HR.kind()}【은는】 아무것도 눈치채지 못할 것이다.`;
			},
			quickFail: "일부가 통 가장자리 너머로 튄다. 얼룩이 지기 전에 소매로 통을 닦아 낸다.",
			carefulSuccess: "손가락 두 개로 저어 가며 천천히 섞어, 사료가 손대지 않은 것처럼 보일 때까지 한다.",
			carefulFail: "사료가 액체를 흡수하지 않고 뭉쳐 버린다. 계속 손을 봐야 한다.",
			watch: "멈추고 귀를 기울인다. 아직 발소리는 없다.",
		},
		stimulate_own: {
			scene: "물통이 눈앞에 있고 작은 병은 이미 열려 있다. 일꾼이 돌아오기 전에 섞어 놓아야 한다.",
			quick: "그대로 붓는다",
			careful: "천천히 넣어 저어 준다",
			watchLabel: "일꾼이 오는지 지켜본다",
			quickSuccess: "빠르게 풀리고, 물은 몇 초 만에 다시 맑아진다.",
			quickFail: "물이 눈에 띄게 뿌예진다. 누가 보기 전에 손으로 세게 휘저어 맑게 만든다.",
			carefulSuccess: "물이 다시 정상으로 보일 때까지 조금씩 저어 넣는다.",
			carefulFail: "생각보다 오래 걸린다. 물은 아직 희미하게 색이 돌고 있다.",
			watch: "줄지어 선 쪽을 이쪽저쪽 둘러본다. 아직 아무도 오지 않는다.",
		},
		bribe_money: {
			scene: "기수는 듣고 있지만 아직 아무것도 동의하지 않았다. 긴장하거나 누가 다가오기 전에 거래를 매듭지어야 한다.",
			quick: "제안을 더 세게 민다",
			careful: "차분히 풀어 설명한다",
			watchLabel: "귀가 닿는 거리에 누가 있는지 살핀다",
			quickSuccess: "기수가 망설임을 멈추고 손을 내민다.",
			quickFail: "기수가 망설이며 주변에 누가 있는지 살피느라 마구간 쪽을 본다.",
			carefulSuccess: "목소리를 낮추고 담담하게 사정을 늘어놓는다. 기수의 마음이 기울고 있다.",
			carefulFail: "기수는 여전히 결심하지 못하고 계속 당신 너머를 본다.",
			watch: "주위를 둘러본다. 엿들을 만큼 가까운 사람은 아직 없다.",
		},
		sabotage_equipment: {
			scene: "뱃대끈이 당신 손에 있다. 대놓고 찢어진 티를 내지 않고 바느질을 약하게 만들어야 한다.",
			quick: "세게 뜯는다",
			careful: "바느질을 조금씩 푼다",
			watchLabel: "일꾼이 있는지 확인한다",
			quickSuccess: "바느질 한 군데가 깔끔하게 뜯어진다. 진짜 무게가 실리기 전까지는 버틸 것이다.",
			quickFail: "눈에 띄는 곳에서 실이 끊어진다. 흠집이 눈에 안 보이게 끈을 돌려놓는다.",
			carefulSuccess: "한 번에 몇 땀씩 풀어 간다. 얼핏 보면 여전히 멀쩡하다.",
			carefulFail: "가죽이 생각보다 질겨서 거의 움직이지 않는다.",
			watch: "물구유 쪽을 바라본다. 일꾼은 아직 돌아오지 않았다.",
		},
		encourage_own: {
			get scene() {
				return `Your hand is on the ${HR.kind()}'s flank and ${HR.it("it")} is pushing back against you. You need to work ${HR.it(
					"itobj"
				)} up and settle ${HR.it("itobj")} again before anyone comes down the row.`;
			},
			quick: "계속한다, 더 빠르게",
			careful: "느리고 꾸준한 손놀림",
			watchLabel: "옆 칸을 살핀다",
			get quickSuccess() {
				return `${HR.kind()}【은는】 금세 가라앉는다. 귀는 앞을 향하고 네 다리에 체중이 고르게 실린다.`;
			},
			get quickFail() {
				return `그 속도에 ${HR.kind()}【이가】 고개를 홱 들고 짚더미에 발굽을 구른다.`;
			},
			get carefulSuccess() {
				return `${HR.kind()}【은는】 그 손길에 몸을 맡기고, 숨을 느리게 쉬며 눈을 반쯤 감는다.`;
			},
			get carefulFail() {
				return `${HR.kind()}【은는】 아직도 안절부절못하며 체중을 옮기고 꼬리를 홱홱 흔든다.`;
			},
			watch: "귀를 기울인다. 옆 칸에서는 아직 아무 소리도 없다.",
		},
	};

	HR.getRigAction = function (actionId) {
		return HR.RIG_ACTIONS.find(action => action.id === actionId) || null;
	};

	HR.rigActionUsed = function (actionId) {
		const race = HR.ensureState();
		return Array.isArray(race.riggedActions) && race.riggedActions.includes(actionId);
	};

	HR.rigCostInternal = function (action) {
		if (!action || !Number.isFinite(action.cost)) return 0;
		return HR.toInternalMoney(action.cost);
	};

	HR.resolveRigAction = function (actionId, targetId, success) {
		const race = HR.ensureState();
		const action = HR.getRigAction(actionId);
		const horse = HR.getHorse(targetId);
		if (!action || !horse) return { ok: false };

		if (!Array.isArray(race.riggedActions)) race.riggedActions = [];
		if (!race.riggedActions.includes(actionId)) race.riggedActions.push(actionId);

		if (success) {
			action.apply(horse);
			/* A rider or handler on your side keeps the bookies quiet for longer. */
			if (actionId === "bribe_money" || actionId === "bribe_sex") {
				HR.weeklyState().horseRaceStaffBribed = true;
			}
		}

		horse.baseSpeed = HR.clamp(horse.baseSpeed, 5, 140);
		horse.focus = HR.clamp(horse.focus, 5, 140);
		horse.maxStamina = HR.clamp(horse.maxStamina, 10, 160);
		horse.stamina = HR.clamp(horse.stamina, 0, horse.maxStamina + 35);

		const suspicionAdded = success ? action.suspicionSuccess : action.suspicionFail;
		race.suspicion = HR.clamp((Number.isFinite(race.suspicion) ? race.suspicion : 0) + suspicionAdded, 0, 100);

		return { ok: true, suspicionAdded, action, horse };
	};

	HR.trackDefs = {
		oval: {
			name: "바깥 타원 코스",
			description: "정통 타원형 코스다.",
			viewBox: "0 0 1000 540",
			/* The path starts on the finish/start line, so horses do not begin somewhere else. */
			path: "M 250 400 L 750 400 C 875 400 930 340 930 270 C 930 200 875 140 750 140 L 250 140 C 125 140 70 200 70 270 C 70 340 125 400 250 400 Z",
			finish: { x1: 250, y1: 365, x2: 250, y2: 435 },
		},
		cross: {
			name: "안쪽 순환 코스",
			description: "더 넓은 타원형 코스로, 순수한 속도보다 위치 선정이 더 중요하다.",
			viewBox: "0 0 1000 540",
			/* The path starts on the finish/start line, so the markers and line match. */
			path: "M 250 420 L 780 420 C 895 420 945 360 945 285 C 945 210 895 150 780 150 L 220 150 C 105 150 55 210 55 285 C 55 360 105 420 220 420 L 250 420 Z",
			innerPaths: ["M 250 150 L 750 420", "M 220 420 L 780 150"],
			finish: { x1: 250, y1: 385, x2: 250, y2: 455 },
		},
	};

	HR.skillPool = [
		{
			id: "steady_stride",
			name: "안정된 보폭",
			description: "깔끔한 리듬을 유지하며 시간이 갈수록 속도를 붙인다.",
			condition(horse, race) {
				return horse.progress >= 15 && horse.progress <= 75 && horse.stamina > 35;
			},
			effect(horse, race, log) {
				horse.boost += 2.1;
				horse.focus += 4;
				horse.stamina -= 3;
				log.push(`${horse.name}【이가】 안정된 보폭을 찾고 앞서 나가기 시작한다.`);
			},
		},
		{
			id: "steady_breath",
			name: "안정된 호흡",
			description: "속도를 유지하면서 체력을 회복한다.",
			condition(horse) {
				return horse.stamina < 78;
			},
			effect(horse, race, log) {
				horse.stamina += 14;
				horse.boost += 0.4;
				log.push(`${horse.name}의 숨이 고르게 가라앉으며 나중을 위해 힘을 아낀다.`);
			},
		},
		{
			id: "inner_rail",
			name: "안쪽 레일",
			description: "안쪽 레인을 깔끔하게 활용한다.",
			condition(horse) {
				return horse.lane <= 2;
			},
			effect(horse, race, log) {
				horse.progress += 3;
				horse.boost += 1.1;
				log.push(`${horse.name}【이가】 안쪽 레일에 바짝 붙어 앞으로 나선다.`);
			},
		},
		{
			id: "corner_cutter",
			name: "코너 가로지르기",
			description: "급한 코너에서 가속한다.",
			condition(horse, race) {
				return race.trackId === "cross" || horse.progress % 25 > 14;
			},
			effect(horse, race, log) {
				horse.progress += race.trackId === "cross" ? 4 : 2.5;
				horse.boost += 1.2;
				log.push(`${horse.name}【이가】 코너를 매끄럽게 돌며 속도를 유지한다.`);
			},
		},
		{
			id: "draft_chaser",
			name: "바람막이 추격",
			description: "앞서가는 말을 바람막이로 삼는다.",
			condition(horse, race) {
				return HR.rankOf(race, horse.id) > 1 && HR.distanceToNextHorse(race, horse.id) <= 9;
			},
			effect(horse, race, log) {
				horse.boost += 2.5;
				horse.stamina += 5;
				log.push(`${horse.name}【이가】 다른 주자를 바짝 뒤따르다가 속도를 낼 채비를 한다.`);
			},
		},
		{
			id: "pace_lock",
			name: "페이스 고정",
			description: "매끄러운 리듬을 찾는다.",
			condition() {
				return true;
			},
			effect(horse, race, log) {
				horse.boost += 1.8;
				horse.focus += 3;
				log.push(`${horse.name}【이가】 매끄러운 페이스에 자리를 잡는다.`);
			},
		},
		{
			id: "mud_dancer",
			name: "진흙 춤꾼",
			description: "트랙이 젖었거나 질척할 때 더 잘 달린다.",
			condition(horse, race) {
				return race.condition === "wet" || race.condition === "muddy";
			},
			effect(horse, race, log) {
				horse.progress += race.condition === "muddy" ? 5 : 3;
				horse.boost += 1.3;
				log.push(`${horse.name}【은는】 험한 땅을 어렵지 않게 달린다.`);
			},
		},
		{
			id: "sunlit_stride",
			name: "햇살 보폭",
			description: "맑은 트랙에서 빛을 발한다.",
			condition(horse, race) {
				return race.condition === "clear";
			},
			effect(horse, race, log) {
				horse.boost += 2.2;
				horse.progress += 2;
				log.push(`${horse.name}【이가】 맑은 트랙 위에서 속도를 끌어올린다.`);
			},
		},
		{
			id: "fearless_chase",
			name: "겁 없는 추격",
			description: "뒤처졌을 때 간격을 좁힌다.",
			condition(horse, race) {
				return HR.rankOf(race, horse.id) >= Math.ceil(race.horses.length / 2);
			},
			effect(horse, race, log) {
				horse.boost += 2.8;
				log.push(`${horse.name}【은는】 뒤처지기를 거부하고 맹렬히 쫓기 시작한다.`);
			},
		},
		{
			id: "leader_pride",
			name: "선두의 자존심",
			description: "이미 1위일 때 더 힘껏 달린다.",
			condition(horse, race) {
				return HR.rankOf(race, horse.id) === 1;
			},
			effect(horse, race, log) {
				horse.boost += 1.5;
				horse.stamina += 6;
				log.push(`${horse.name}【은는】 다른 말들이 따라붙는 것을 느끼고 더 힘껏 달린다.`);
			},
		},
		{
			id: "tempo_breaker",
			name: "템포 파괴자",
			description: "다른 주자의 리듬을 깨뜨린다.",
			condition(horse, race) {
				return race.horses.length > 1 && horse.progress > 20 && horse.progress < 85;
			},
			effect(horse, race, log) {
				const target = HR.nearestRival(race, horse.id);
				if (target) {
					target.boost -= 1.4;
					target.stamina -= 5;
					log.push(`${horse.name}【이가】 템포를 바꿔 ${target.name}의 리듬을 흐트러뜨린다.`);
				}
			},
		},
		{
			id: "track_reader",
			name: "코스 판독가",
			description: "어려운 코스에서 최적의 경로를 고른다.",
			condition() {
				return true;
			},
			effect(horse, race, log) {
				horse.progress += race.trackId === "cross" ? 4 : 2;
				horse.focus += 6;
				log.push(`${horse.name}【이가】 코스를 읽고 더 나은 경로를 고른다.`);
			},
		},
		{
			id: "second_wind",
			name: "새 숨",
			description: "지친 상태에서 회복한다.",
			condition(horse) {
				return horse.stamina < 45 && horse.progress > 35;
			},
			effect(horse, race, log) {
				horse.stamina += 24;
				horse.boost += 1;
				log.push(`${horse.name}【은는】 지쳐 갈 때쯤 새 숨을 찾아낸다.`);
			},
		},
		{
			id: "final_burst",
			name: "마지막 스퍼트",
			description: "결승선이 가까워지면 속도를 올린다.",
			condition(horse) {
				return horse.progress >= 65;
			},
			effect(horse, race, log) {
				horse.boost += 4.2;
				log.push(`${horse.name}【은는】 힘을 아껴 뒀다가 결승선 근처에서 앞으로 폭발적으로 튀어 나간다.`);
			},
		},
		{
			id: "last_fang",
			name: "막판 뒷심",
			description: "1위가 아닐 때 막판에 속도를 올린다.",
			condition(horse, race) {
				return horse.progress >= 78 && HR.rankOf(race, horse.id) > 1;
			},
			effect(horse, race, log) {
				horse.progress += 6;
				horse.boost += 2;
				log.push(`${horse.name}【이가】 결승선을 향해 마지막 힘을 쥐어짠다.`);
			},
		},
	];

	HR.horseNames = [
		"벨벳 혜성",
		"초록 총알",
		"낡은 왕관",
		"은빛 과수원",
		"Saltwind",
		"한밤의 대출",
		"카드 샤크",
		"Foxglove",
		"환한 소문",
		"빗속의 동반자",
		"행운의 폭동",
		"호박빛 바늘",
		"유리 전령",
		"잿불 왈츠",
		"북쪽 예배당",
		"종이 달",
		"푸른 악동",
		"숨은 교구",
		"체리 빚",
		"고요한 사이렌",
		"붉은 등불",
		"잿빛 클로버",
		"구리 성인",
		"새벽 조약",
		"이끼 예배당",
	];

	HR.fallbackConditions = ["turf", "dirt", "wet", "muddy"];

	HR.normaliseWeatherName = function (raw) {
		const types =
			typeof setup !== "undefined" && setup.WeatherGeneration && Array.isArray(setup.WeatherGeneration.weatherTypes)
				? setup.WeatherGeneration.weatherTypes
				: [];

		if (raw && typeof raw === "object") {
			for (const key of ["name", "type", "weather", "current", "condition"]) {
				const found = HR.normaliseWeatherName(raw[key]);
				if (found) return found;
			}
			return "";
		}

		if (Number.isFinite(raw)) {
			const byValue = types.find(type => type && type.value === raw);
			return byValue ? byValue.name : "";
		}

		if (typeof raw !== "string") return "";

		const cleaned = raw.trim();
		if (!cleaned) return "";

		const direct = types.find(type => type && type.name === cleaned);
		if (direct) return direct.name;

		const lower = cleaned.toLowerCase();

		if (lower.includes("thunder")) return "thunderstorm";
		if (lower.includes("storm")) return "storm";
		if (lower.includes("heavy") && (lower.includes("rain") || lower.includes("snow") || lower.includes("precip"))) return "heavyPrecipitation";
		if (lower.includes("light") && (lower.includes("rain") || lower.includes("snow") || lower.includes("precip"))) return "lightPrecipitation";
		if (lower.includes("rain") || lower.includes("snow") || lower.includes("precip")) return "lightPrecipitation";
		if (lower.includes("heavy") && lower.includes("cloud")) return "heavyClouds";
		if (lower.includes("cloud")) return "lightClouds";
		if (lower.includes("clear") || lower.includes("sun")) return "clear";

		return cleaned;
	};

	HR.getCurrentWeatherName = function () {
		const V = typeof State !== "undefined" && State.variables ? State.variables : {};
		const candidates = [];

		try {
			if (typeof Weather !== "undefined") {
				candidates.push(Weather.current, Weather.name, Weather.type, Weather.weather, Weather.condition, Weather.currentWeather);
			}
		} catch (e) {
			/* Weather object may not exist on older builds. */
		}

		candidates.push(V.weather, V.weatherType, V.currentWeather, V.weather_current);

		for (const candidate of candidates) {
			const found = HR.normaliseWeatherName(candidate);
			if (found) return found;
		}

		return "";
	};

	HR.getRaceGoing = function () {
		const weatherName = HR.getCurrentWeatherName();

		switch (weatherName) {
			case "clear":
				return {
					weatherName,
					condition: "clear",
					label: "clear",
					description: `트랙이 말라 있어, ${HR.kind(true)}【이가】 전속력으로 달릴 수 있다.`,
				};

			case "lightClouds":
				return {
					weatherName,
					condition: "clear",
					label: "good",
					description: "날씨는 온화하고, 트랙은 여전히 달리기 좋다.",
				};

			case "heavyClouds":
				return {
					weatherName,
					condition: "clear",
					label: "cloudy",
					description: "하늘은 흐리지만 땅 상태는 여전히 좋다.",
				};

			case "lightPrecipitation":
				return {
					weatherName,
					condition: "wet",
					label: "wet",
					description: "가벼운 비로 트랙이 미끄럽다.",
				};

			case "heavyPrecipitation":
				return {
					weatherName,
					condition: "wet",
					label: "soft",
					description: "폭우가 트랙을 흠뻑 적셔 달리기 힘들어졌다.",
				};

			case "storm":
				return {
					weatherName,
					condition: "muddy",
					label: "muddy",
					description: "폭풍으로 트랙 곳곳이 진창이 되었다.",
				};

			case "thunderstorm":
				return {
					weatherName,
					condition: "muddy",
					label: "heavy",
					description: "천둥과 폭우 탓에 트랙이 험하다.",
				};

			default: {
				const fallback = HR.fallbackConditions[HR.randInt(0, HR.fallbackConditions.length - 1)];
				return {
					weatherName: "",
					condition: fallback,
					label: fallback,
					description: "",
				};
			}
		}
	};

	HR.clamp = function (value, min, max) {
		return Math.max(min, Math.min(max, value));
	};

	HR.randFloat = function (min, max) {
		return min + Math.random() * (max - min);
	};

	HR.randInt = function (min, max) {
		if (typeof random === "function") return random(min, max);
		return Math.floor(Math.random() * (max - min + 1)) + min;
	};

	HR.shuffle = function (source) {
		const array = source.slice();
		for (let i = array.length - 1; i > 0; i--) {
			const j = HR.randInt(0, i);
			const tmp = array[i];
			array[i] = array[j];
			array[j] = tmp;
		}
		return array;
	};

	HR.roundMoney = function (amount) {
		if (setup.hbsc && typeof setup.hbsc.roundMoney === "function") {
			return setup.hbsc.roundMoney(amount);
		}
		if (!Number.isFinite(amount)) return 0;
		return Math.max(0, Math.round(amount));
	};

	HR.toInternalMoney = function (amount) {
		if (setup.hbsc && typeof setup.hbsc.toInternalMoney === "function") {
			return setup.hbsc.toInternalMoney(amount);
		}
		if (!Number.isFinite(amount)) return 0;
		return HR.roundMoney(amount * 100);
	};

	HR.toWholeMoney = function (amount) {
		if (setup.hbsc && typeof setup.hbsc.toWholePounds === "function") {
			return setup.hbsc.toWholePounds(amount);
		}
		return Math.floor(HR.roundMoney(amount) / 100);
	};

	HR.formatMoney = function (amount) {
		return "£" + HR.toWholeMoney(amount).toLocaleString("en-GB");
	};

	HR.parseMoneyInput = function (value) {
		if (setup.hbsc && typeof setup.hbsc.parseMoneyInput === "function") {
			return setup.hbsc.parseMoneyInput(value);
		}
		if (Number.isFinite(value)) return HR.toInternalMoney(value);
		if (typeof value !== "string") return 0;
		const cleaned = value.replace(/[£,\s]/g, "").trim();
		if (!cleaned || !/^\d+$/.test(cleaned)) return 0;
		return HR.toInternalMoney(Number(cleaned));
	};

	HR.escapeHtml = function (value) {
		if (setup.hbsc && typeof setup.hbsc.escapeHtml === "function") {
			return setup.hbsc.escapeHtml(value);
		}
		return String(value == null ? "" : value)
			.replace(/&/g, "&amp;")
			.replace(/</g, "&lt;")
			.replace(/>/g, "&gt;")
			.replace(/"/g, "&quot;");
	};

	HR.escapeJsArg = function (value) {
		return HR.escapeHtml(JSON.stringify(String(value == null ? "" : value)));
	};

	HR.playPassage = function (passage) {
		const target = String(passage == null ? "" : passage);
		if (!target) return false;

		/* Compatibility helper only.  
		Do not call HR.playPassage from inside HR.playPassage, or SugarCube will recurse until the call stack dies. */
		if (typeof window !== "undefined") {
			if (window.SugarCube && window.SugarCube.Engine && typeof window.SugarCube.Engine.play === "function") {
				window.SugarCube.Engine.play(target);
				return false;
			}
			if (window.Engine && typeof window.Engine.play === "function") {
				window.Engine.play(target);
				return false;
			}
		}
		if (typeof SugarCube !== "undefined" && SugarCube && SugarCube.Engine && typeof SugarCube.Engine.play === "function") {
			SugarCube.Engine.play(target);
			return false;
		}
		if (typeof Engine !== "undefined" && Engine && typeof Engine.play === "function") {
			Engine.play(target);
			return false;
		}

		if (State.variables.debug === 1) {
			console.error(`Cannot open passage: ${target}`);
		}
		return false;
	};

	HR.refreshGameSidebar = function () {
		try {
			if (typeof UIBar !== "undefined" && UIBar && typeof UIBar.update === "function") {
				UIBar.update();
				return;
			}
			if (typeof window !== "undefined" && window.SugarCube && window.SugarCube.UIBar && typeof window.SugarCube.UIBar.update === "function") {
				window.SugarCube.UIBar.update();
			}
		} catch (e) {
			if (State && State.variables && State.variables.debug === 1) {
				console.warn("Horse race could not refresh the sidebar.", e);
			}
		}
	};

	HR.passRaceTime = function (minutes) {
		const amount = Math.max(0, Math.floor(Number(minutes) || 0));
		if (amount <= 0) return;

		try {
			const wiki = `<<pass ${amount}>>`;
			if (typeof Wikifier !== "undefined" && typeof Wikifier.wikifyEval === "function") {
				Wikifier.wikifyEval(wiki);
			} else if (typeof window !== "undefined" && typeof window.Wikifier?.wikifyEval === "function") {
				window.Wikifier.wikifyEval(wiki);
			}
			HR.refreshGameSidebar();
		} catch (e) {
			if (State && State.variables && State.variables.debug === 1) {
				console.warn("Horse race could not run <<pass>>.", e);
			}
		}
	};

	/* Single source of truth for every weekly counter.
	They live on DoL's $weekly object, so the game's normal weekly cleanup resets them for us and nothing accumulates in the permanent save. */
	HR.weeklyState = function () {
		const V = State.variables;
		if (V.weekly == null || typeof V.weekly !== "object") V.weekly = {};
		const w = V.weekly;
		if (!Number.isFinite(w.horseRaceWeeklyBets)) w.horseRaceWeeklyBets = 0;
		if (!Number.isFinite(w.horseRaceWeeklyAccidents)) w.horseRaceWeeklyAccidents = 0;
		if (!Number.isFinite(w.horseRaceIncidentLossStreak)) w.horseRaceIncidentLossStreak = 0;
		if (!Array.isArray(w.horseRaceInjuredHorses)) w.horseRaceInjuredHorses = [];
		if (!Number.isFinite(w.horseRaceWeeklyWins)) w.horseRaceWeeklyWins = 0;
		if (typeof w.horseRaceStaffBribed !== "boolean") w.horseRaceStaffBribed = false;
		if ("horseRaceWeeklyWinnings" in w) delete w.horseRaceWeeklyWinnings;
		return w;
	};

	/* The bookies only tolerate so many winning weeks from one face.
	Once the player hits the cap the racecourse fills up and no more slips are sold until the week rolls over.
	Having a rider or handler in your pocket (a landed cash or sex bribe) buys you two extra wins before that. */
	HR.WEEKLY_WIN_CAP = 5;
	HR.WEEKLY_WIN_CAP_BRIBED = 7;

	HR.weeklyWinCap = function () {
		return HR.weeklyState().horseRaceStaffBribed ? HR.WEEKLY_WIN_CAP_BRIBED : HR.WEEKLY_WIN_CAP;
	};

	HR.weeklyWins = function () {
		return HR.weeklyState().horseRaceWeeklyWins;
	};

	HR.atWeeklyWinCap = function () {
		return HR.weeklyWins() >= HR.weeklyWinCap();
	};

	HR.addWeeklyBet = function (amountInternal) {
		if (!Number.isFinite(amountInternal)) return;
		HR.weeklyState().horseRaceWeeklyBets += amountInternal;
	};

	HR.availableHorseNames = function () {
		const injuredNames = new Set(HR.weeklyState().horseRaceInjuredHorses);
		return HR.horseNames.filter(name => !injuredNames.has(name));
	};

	HR.recordLoss = function () {
		const V = State.variables;
		const race = HR.ensureState();
		if (race.lossRecorded) return;
		race.lossRecorded = true;
		if (V.daily == null || typeof V.daily !== "object") V.daily = {};
		if (!Number.isFinite(V.daily.horseRaceLosses)) V.daily.horseRaceLosses = 0;
		V.daily.horseRaceLosses += 1;
		if (V.daily.horseRaceLosses > 3) {
			race.lossTraumaPending = true;
		} else {
			race.lossStressPending = true;
		}
	};

	HR.ensureState = function () {
		const V = State.variables;
		if (V.horserace == null || typeof V.horserace !== "object") V.horserace = {};

		const race = V.horserace;
		if (typeof race.phase !== "string") race.phase = "idle";
		if (!Number.isFinite(race.round)) race.round = 0;
		if (!Number.isFinite(race.betAmount)) race.betAmount = 0;
		if (!Number.isFinite(race.payout)) race.payout = 0;
		if (!Array.isArray(race.horses)) race.horses = [];
		if (!Array.isArray(race.messages)) race.messages = [];
		if (!Array.isArray(race.messageHistory)) race.messageHistory = [];
		if (!Array.isArray(race.ranking)) race.ranking = [];
		if (typeof race.betInput !== "string") race.betInput = "";
		if (typeof race.selectedHorseId !== "string") race.selectedHorseId = "";
		if (typeof race.betHorseId !== "string") race.betHorseId = "";
		if (typeof race.winnerId !== "string") race.winnerId = "";
		if (typeof race.lastError !== "string") race.lastError = "";
		if (typeof race.trackId !== "string" || !HR.trackDefs[race.trackId]) race.trackId = "oval";
		if (typeof race.condition !== "string") race.condition = "clear";
		if (typeof race.paidOut !== "boolean") race.paidOut = false;
		if (typeof race.trial !== "boolean") race.trial = false;
		if (typeof race.autoWatch !== "boolean") race.autoWatch = false;
		if (typeof race.lossStressPending !== "boolean") race.lossStressPending = false;
		if (typeof race.lossTraumaPending !== "boolean") race.lossTraumaPending = false;
		if (typeof race.lossRecorded !== "boolean") race.lossRecorded = false;
		if (race.betType !== "place") race.betType = "win";

		/* Weekly counters used to live here; they now live on $weekly and reset
		   with DoL's weekly cleanup. Shed the old fields from existing saves. */
		if ("weeklyWinnings" in race) delete race.weeklyWinnings;
		if ("weeklyAccidents" in race) delete race.weeklyAccidents;
		if ("weekAnchorDay" in race) delete race.weekAnchorDay;
		if ("inputNonce" in race) delete race.inputNonce;

		/* The backed horse is no longer pulled up by a pre-rolled accident; incidents live on each horse. */
		for (const key of ["accident", "accidentAtRound", "accidentRefund", "rigSuccesses", "rigFailures"]) {
			if (key in race) delete race[key];
		}
		if (typeof race.incidentHorseId !== "string") race.incidentHorseId = "";

		/* Per-race stable rigging fields (reset by createRace). */
		if (!Number.isFinite(race.suspicion)) race.suspicion = 0;
		if (typeof race.rigEntered !== "boolean") race.rigEntered = false;
		if (typeof race.rigSuccessPassage !== "string") race.rigSuccessPassage = "";
		if (typeof race.rigCaughtPassage !== "string") race.rigCaughtPassage = "";
		if (!Array.isArray(race.riggedActions)) race.riggedActions = [];
		if (typeof race.rigActionId !== "string") race.rigActionId = "";
		if (typeof race.rigTargetId !== "string") race.rigTargetId = "";
		if (typeof race.riggedCancelled !== "boolean") race.riggedCancelled = false;

		for (const horse of race.horses) {
			if (!horse || typeof horse !== "object") continue;
			if (typeof horse.accident !== "boolean") horse.accident = false;
			if (typeof horse.withdrawn !== "boolean") horse.withdrawn = false;
			if (typeof horse.incident !== "string") horse.incident = "";
			if (!Number.isFinite(horse.incidentRound)) horse.incidentRound = 0;
			if (typeof horse.incidentHappened !== "boolean") horse.incidentHappened = false;
			if (!Number.isFinite(horse.odds)) horse.odds = 2;
			if (!Number.isFinite(horse.placeOdds)) horse.placeOdds = Math.max(HR.ODDS_FLOOR, Number((1 + (horse.odds - 1) / 3).toFixed(2)));
			if (!Number.isFinite(horse.progress)) horse.progress = 0;
			if (!Number.isFinite(horse.stamina)) horse.stamina = 80;
			if (!Number.isFinite(horse.boost)) horse.boost = 0;
			if (!Number.isFinite(horse.focus)) horse.focus = 70;
			if (!Number.isFinite(horse.skillCooldown)) horse.skillCooldown = 0;
			if (!Array.isArray(horse.skills)) horse.skills = [];
			if (!Array.isArray(horse.skillHistory)) horse.skillHistory = [];
			if (!Number.isFinite(horse.lastSkillRound)) horse.lastSkillRound = -99;
		}

		return race;
	};

	HR.getSkill = function (id) {
		return HR.skillPool.find(skill => skill.id === id) || null;
	};

	HR.getHorse = function (horseId) {
		const race = HR.ensureState();
		return race.horses.find(horse => horse && horse.id === horseId) || null;
	};

	HR.randomSkills = function (count) {
		return HR.shuffle(HR.skillPool.map(skill => skill.id)).slice(0, count);
	};

	HR.createHorse = function (name, index) {
		const baseSpeed = HR.randInt(68, 94);
		const stamina = HR.randInt(68, 100);
		const focus = HR.randInt(55, 96);
		const kick = HR.randFloat(0.2, 1.8);

		return {
			id: `horse-${index + 1}`,
			name,
			lane: index + 1,
			baseSpeed,
			stamina,
			maxStamina: stamina,
			focus,
			finishKick: kick,
			progress: 0,
			accident: false,
			boost: 0,
			skillCooldown: HR.randInt(0, 2),
			lastSkillRound: -99,
			skills: HR.randomSkills(3),
			skillHistory: [],
			withdrawn: false,
			incident: "",
			incidentRound: 0,
			incidentHappened: false,
			odds: 2.0,
			placeOdds: 1.3,
			formScore: baseSpeed * 0.52 + stamina * 0.3 + focus * 0.14 + kick * 5,
		};
	};

	HR.createRace = function (force) {
		const race = HR.ensureState();
		if (!force && race.phase !== "idle" && race.phase !== "finished" && race.phase !== "closed") return race;

		const namePool = HR.availableHorseNames();
		if (namePool.length < 3) {
			race.id = `hr-closed-${Date.now()}-${HR.randInt(1000, 9999)}`;
			race.phase = "closed";
			race.round = 0;
			race.horses = [];
			race.messages = [];
			race.messageHistory = [];
			race.ranking = [];
			race.selectedHorseId = "";
			race.betHorseId = "";
			race.betAmount = 0;
			race.betInput = "";
			race.payout = 0;
			race.winnerId = "";
			race.won = false;
			race.paidOut = false;
			race.trial = false;
			race.autoWatch = false;
			race.lastError = `${HR.kind(true)}【이가】 오늘 뛸 만한 상태가 아니다.`;
			race.incidentHorseId = "";
			race.lossStressPending = false;
			race.lossTraumaPending = false;
			race.lossRecorded = false;
			race.suspicion = 0;
			race.riggedActions = [];
			race.rigActionId = "";
			race.rigTargetId = "";
			race.riggedCancelled = false;
			race.rigGame = {};
			race.rigEntered = false;
			race.rigSuccessPassage = "";
			race.rigCaughtPassage = "";
			return race;
		}

		const minCount = Math.min(3, namePool.length);
		const maxCount = Math.min(5, namePool.length);
		const count = HR.randInt(minCount, maxCount);
		const names = HR.shuffle(namePool).slice(0, count);
		const horses = names.map((name, index) => HR.createHorse(name, index));

		race.id = `hr-${Date.now()}-${HR.randInt(1000, 9999)}`;
		race.phase = "betting";
		race.trackId = HR.randInt(1, 2) === 1 ? "oval" : "cross";
		const going = HR.getRaceGoing();
		race.weatherName = going.weatherName;
		race.condition = going.condition;
		race.goingLabel = going.label;
		race.goingDescription = going.description;

		/* Price the field by running it silently, so the posted odds match how often each horse really wins or places on this track and going. */
		const chances = HR.estimateChances({ trackId: race.trackId, condition: race.condition, horses });
		for (const horse of horses) {
			horse.odds = Math.max(HR.ODDS_FLOOR, Number((HR.PAYOUT_MARGIN / chances.win[horse.id]).toFixed(2)));
			horse.placeOdds = Math.max(HR.ODDS_FLOOR, Number((HR.PAYOUT_MARGIN / chances.place[horse.id]).toFixed(2)));
		}
		race.betType = "win";
		race.round = 0;
		race.horses = horses;
		race.messages = [];
		race.messageHistory = [];
		race.ranking = [];
		race.selectedHorseId = "";
		race.betHorseId = "";
		race.betAmount = 0;
		race.betInput = "";
		race.payout = 0;
		race.winnerId = "";
		race.won = false;
		race.paidOut = false;
		race.trial = false;
		race.autoWatch = false;
		race.lastError = "";
		race.incidentHorseId = "";
		race.lossStressPending = false;
		race.lossTraumaPending = false;
		race.lossRecorded = false;
		race.suspicion = 0;
		race.riggedActions = [];
		race.rigActionId = "";
		race.rigTargetId = "";
		race.riggedCancelled = false;
		race.rigGame = {};
		race.rigEntered = false;
		race.rigSuccessPassage = "";
		race.rigCaughtPassage = "";

		return race;
	};

	/* Sheds the heavy per-race data (horse list, logs, ranking) from the save once a race is over and the player walks away, so finished races do not sit in every save slot.
	   Weekly counters are untouched. */
	HR.clearRaceData = function () {
		const race = HR.ensureState();
		if (race.phase !== "finished" && race.phase !== "idle" && race.phase !== "closed") return race;
		race.horses = [];
		race.messages = [];
		race.messageHistory = [];
		race.ranking = [];
		race.selectedHorseId = "";
		race.betHorseId = "";
		race.winnerId = "";
		race.incidentHorseId = "";
		race.betInput = "";
		race.betAmount = 0;
		race.payout = 0;
		race.lossStressPending = false;
		race.lossTraumaPending = false;
		race.lossRecorded = false;
		race.suspicion = 0;
		race.riggedActions = [];
		race.rigActionId = "";
		race.rigTargetId = "";
		race.riggedCancelled = false;
		race.rigGame = {};
		race.rigEntered = false;
		race.rigSuccessPassage = "";
		race.rigCaughtPassage = "";
		race.phase = "idle";
		return race;
	};

	HR.startTrialRace = function () {
		const race = HR.createRace(true);
		if (race.phase === "closed") return race;
		race.phase = "running";
		race.trial = true;
		race.selectedHorseId = "";
		race.betHorseId = "";
		race.betAmount = 0;
		race.betInput = "";
		race.payout = 0;
		race.paidOut = true;
		race.autoWatch = false;
		race.messages = [`Alex waits beside the rail with you while the handlers settle the ${HR.kind(true)} at the gate.`];
		race.messageHistory = race.messages.slice();
		return race;
	};

	HR.placeBet = function (horseId, rawAmount, betType) {
		const V = State.variables;
		const race = HR.ensureState();
		race.lastError = "";
		race.betInput = typeof rawAmount === "string" ? rawAmount : String(rawAmount == null ? "" : rawAmount);

		if (race.phase !== "betting") {
			race.lastError = "마권업자가 이 경주의 베팅을 이미 마감했다.";
			return { ok: false, reason: "closed" };
		}

		if (HR.atWeeklyWinCap()) {
			race.lastError = "이 인파를 뚫고는 마권업자에게 다가갈 수 없다.";
			return { ok: false, reason: "crowded" };
		}

		const horse = HR.getHorse(horseId);
		if (!horse) {
			race.lastError = `베팅하기 전에 ${HR.kind()}【을를】 먼저 골라야 한다.`;
			return { ok: false, reason: "noHorse" };
		}

		const amount = HR.parseMoneyInput(rawAmount);
		if (!(amount > 0)) {
			race.lastError = "올바른 베팅 금액을 입력해야 한다.";
			return { ok: false, reason: "invalidAmount" };
		}
		if (!Number.isFinite(V.money) || V.money < amount) {
			race.lastError = `베팅하려는 ${HR.formatMoney(amount)}만큼의 돈이 없다.`;
			return { ok: false, reason: "insufficientMoney" };
		}
		const maxStake = HR.maxStake(horse, betType);
		if (amount > maxStake) {
			race.lastError = `마권업자는 그 마권에 ${HR.formatMoney(maxStake)} 넘게는 받지 않는다.`;
			return { ok: false, reason: "overLimit" };
		}

		const suspicion = HR.clamp(race.suspicion || 0, 0, 100);
		if (suspicion > 0 && HR.randInt(1, 100) <= HR.clamp(suspicion, 0, HR.SUSPICION_CANCEL_CAP)) {
			/* Shut the whole meeting down for the rest of the day.
			Without this the player just walks back to the course, createRace builds a fresh field, and being caught costs them nothing at all. */
			if (V.daily == null || typeof V.daily !== "object") V.daily = {};
			V.daily.horseRaceCancelled = true;
			race.phase = "closed";
			race.riggedCancelled = true;
			race.horses = [];
			race.selectedHorseId = "";
			race.betHorseId = "";
			race.betAmount = 0;
			race.betInput = "";
			race.lastError = "심판진이 수상한 베팅 양상을 알아채고 경주를 취소한다.";
			return { ok: false, reason: "cancelled" };
		}

		V.money = HR.roundMoney(V.money - amount);
		HR.addWeeklyBet(amount);
		race.betHorseId = horse.id;
		race.selectedHorseId = horse.id;
		race.betAmount = amount;
		race.betType = betType === "place" ? "place" : "win";
		race.phase = "running";
		race.autoWatch = false;
		race.messages = [
			race.betType === "place"
				? `당신은 ${horse.name}【이가】 입상한다는 쪽에 걸었다. 건 돈은 ${HR.formatMoney(amount)}, 배당은 ${horse.placeOdds.toFixed(2)}배.`
				: `당신은 ${horse.name}【이가】 1위를 한다는 쪽에 걸었다. 건 돈은 ${HR.formatMoney(amount)}, 배당은 ${horse.odds.toFixed(2)}배.`,
		];

		race.messageHistory = race.messages.slice();
		return { ok: true };
	};

	/* The largest stake (internal money) the bookie takes on this horse and bet type, so no slip returns more than MAX_PAYOUT. */
	HR.maxStake = function (horse, betType) {
		const odds = betType === "place" ? horse.placeOdds : horse.odds;
		return HR.toInternalMoney(Math.floor(HR.MAX_PAYOUT / Math.max(HR.ODDS_FLOOR, odds)));
	};

	/* Injured and withdrawn runners stop where they are and can never be placed. */
	HR.isOut = function (horse) {
		return Boolean(horse && (horse.accident === true || horse.withdrawn === true));
	};

	HR.raceOver = function (race) {
		return race.horses.some(horse => horse.progress >= 100) || race.round >= 28 || race.horses.every(HR.isOut);
	};

	/* Runners still in the race, best first. */
	HR.finishers = function (race) {
		return HR.rankedHorses(race).filter(horse => !HR.isOut(horse));
	};

	HR.rollIncidents = function (race) {
		for (const horse of race.horses) {
			horse.incident = "";
			horse.incidentRound = 0;
			horse.incidentHappened = false;
			horse.form = HR.randFloat(-HR.FORM_SPREAD, HR.FORM_SPREAD);
			let roll = Math.random() * 100;
			for (const type in HR.INCIDENT_CHANCES) {
				if (roll < HR.INCIDENT_CHANCES[type]) {
					horse.incident = type;
					horse.incidentRound = type === "exhausted" ? HR.randInt(12, 20) : HR.randInt(5, 19);
					break;
				}
				roll -= HR.INCIDENT_CHANCES[type];
			}
		}
	};

	HR.INCIDENT_LOG = {
		blocked: [
			name => `${name}【이가】 더 느린 ${HR.kind()} 뒤에 갇혀, 앞지를 틈이 없어 속도를 늦춰야 한다.`,
			name => `다른 ${HR.kind()}【이가】 ${name} 앞으로 끼어들어, ${name}【은는】 속도를 늦추고 앞지를 공간이 날 때까지 기다려야 한다.`,
		],
		wide: [
			name => `${name}【이가】 코너를 트랙 안쪽에서 너무 멀리 돌아, 다른 말들보다 더 먼 거리를 달리며 거리를 잃는다.`,
			name =>
				`${name}【이가】 코너를 돌며 트랙 바깥쪽으로 너무 크게 벗어난다. ${name}【이가】 원래 경로로 돌아왔을 때는 다른 말들이 한참 앞서 있다.`,
		],
		stumble: [
			name => `${name}【이가】 코너를 돌다 넘어질 뻔하지만 간신히 버티고 계속 달린다.`,
			name => `${name}【이가】 발을 잘못 디뎌 잠시 속도를 잃었다가 경주를 이어 간다.`,
		],
		exhausted: [
			name => `${name}【이가】 너무 지쳐 더는 달리지 못한다. 기수가 속도를 늦추고 경주에서 빼낸다.`,
			name => `${name}【이가】 지친 탓에 따라가지 못한다. 기수는 억지로 계속 달리게 하기보다 경주를 포기하기로 한다.`,
		],
		injured: [
			name =>
				`${name} hurts one of ${HR.it(
					"its"
				)} legs while running and starts having trouble walking properly. The rider stops immediately, and the vets come onto the track to help.`,
			name =>
				`${name}【이가】 트랙 반대편에서 달리다 넘어진다. 기수는 재빨리 일어나고, 수의사들이 ${HR.kind()}【을를】 살피러 서둘러 달려간다.`,
		],
	};

	/* Starts the planned incident for this horse. Returns the pace multiplier for this round, or 0 if the horse leaves the race. */
	HR.startIncident = function (race, horse, log) {
		horse.incidentHappened = true;
		const text = HR.INCIDENT_LOG[horse.incident][HR.randInt(0, HR.INCIDENT_LOG[horse.incident].length - 1)](horse.name);
		if (horse.incident === "injured") {
			horse.accident = true;
			horse.boost = 0;
			race.incidentHorseId = horse.id;
			log.push({ type: "accident", horseId: horse.id, text });
			return 0;
		}
		if (horse.incident === "exhausted") {
			horse.withdrawn = true;
			horse.boost = 0;
			log.push({ type: "incident", serious: true, horseId: horse.id, text });
			return 0;
		}
		horse.boost = 0;
		log.push({ type: "incident", horseId: horse.id, text });
		return HR.INCIDENT_PACE[horse.incident][0];
	};

	/* One round of the race. Shared by the live view, the skip button, and the odds estimate, so all three run the same race.
	   luckHorseId gets the player's gambling luck; the odds estimate passes "" so the posted odds never depend on who backs what. */
	HR.advanceRound = function (race, log, luckHorseId, luck) {
		race.round += 1;
		if (race.round === 1) HR.rollIncidents(race);

		for (const horse of race.horses) {
			if (HR.isOut(horse)) continue;
			HR.trySkill(horse, race, log);
		}

		for (const horse of race.horses) {
			if (HR.isOut(horse)) continue;

			let incidentPace = 1;
			if (horse.incident && race.round >= horse.incidentRound) {
				if (!horse.incidentHappened) {
					incidentPace = HR.startIncident(race, horse, log);
					if (HR.isOut(horse)) continue;
				} else {
					const pace = HR.INCIDENT_PACE[horse.incident];
					const offset = race.round - horse.incidentRound;
					if (pace && offset < pace.length) incidentPace = pace[offset];
				}
			}

			const staminaPressure = (horse.stamina - 50) / 55;
			const wetPenalty = race.condition === "wet" ? -0.15 : race.condition === "muddy" ? -0.35 : 0;
			const trackChaos = race.trackId === "cross" ? HR.randFloat(-0.35, 0.45) : HR.randFloat(-0.2, 0.25);
			const finalKick = horse.progress >= 75 ? horse.finishKick : 0;
			const pace =
				(horse.baseSpeed / 21 + (horse.form || 0) + staminaPressure + horse.boost + finalKick + wetPenalty + trackChaos + HR.randFloat(-0.85, 1.05)) *
				(horse.id === luckHorseId ? luck : 1);

			horse.progress = HR.clamp(horse.progress + (incidentPace < 1 ? Math.max(0.2, pace * incidentPace) : Math.max(0.8, pace)), 0, 100);
			horse.stamina = HR.clamp(horse.stamina - HR.randFloat(1.8, 4.1), 0, horse.maxStamina + 35);
			horse.boost *= 0.52;
		}
	};

	/* Runs the field silently many times from the start line and counts wins and top-two finishes. */
	HR.estimateChances = function (race, trials) {
		const runs = trials || HR.ODDS_TRIALS;
		const wins = {};
		const places = {};
		for (const horse of race.horses) {
			wins[horse.id] = 0;
			places[horse.id] = 0;
		}
		for (let t = 0; t < runs; t++) {
			const sim = {
				round: 0,
				trackId: race.trackId,
				condition: race.condition,
				betHorseId: "",
				incidentHorseId: "",
				/* Only the fields the race and the skills read, so the real horses are never touched. */
				horses: race.horses.map(horse => ({
					id: horse.id,
					name: horse.name,
					lane: horse.lane,
					baseSpeed: horse.baseSpeed,
					stamina: horse.maxStamina,
					maxStamina: horse.maxStamina,
					focus: horse.focus,
					finishKick: horse.finishKick,
					formScore: horse.formScore,
					skills: horse.skills,
					skillCooldown: horse.skillCooldown,
					skillHistory: [],
					lastSkillRound: -99,
					progress: 0,
					boost: 0,
					form: 0,
					accident: false,
					withdrawn: false,
					incident: "",
					incidentRound: 0,
					incidentHappened: false,
				})),
			};
			while (!HR.raceOver(sim)) HR.advanceRound(sim, [], "", 1);
			const top = HR.finishers(sim);
			if (top[0]) wins[top[0].id] += 1;
			for (const horse of top.slice(0, 2)) places[horse.id] += 1;
		}
		const win = {};
		const place = {};
		for (const id in wins) {
			/* (count + 1) / runs is never zero, and the odds it gives are on average no longer than the true price,
			   so sampling noise cannot hand the player better than the posted margin on a rare longshot. */
			win[id] = Math.min(1, (wins[id] + 1) / runs);
			place[id] = Math.min(1, (places[id] + 1) / runs);
		}
		return { win, place };
	};

	HR.rankedHorses = function (race) {
		return race.horses.slice().sort(function (a, b) {
			const aAccident = HR.isOut(a);
			const bAccident = HR.isOut(b);
			if (aAccident !== bAccident) return aAccident ? 1 : -1;
			if (b.progress !== a.progress) return b.progress - a.progress;
			return b.formScore - a.formScore;
		});
	};

	HR.rankOf = function (race, horseId) {
		const ranked = HR.rankedHorses(race);
		const index = ranked.findIndex(horse => horse.id === horseId);
		return index < 0 ? ranked.length : index + 1;
	};

	HR.distanceToNextHorse = function (race, horseId) {
		const ranked = HR.rankedHorses(race);
		const index = ranked.findIndex(horse => horse.id === horseId);
		if (index <= 0) return Infinity;
		return Math.abs(ranked[index - 1].progress - ranked[index].progress);
	};

	HR.nearestRival = function (race, horseId) {
		const horse = race.horses.find(candidate => candidate.id === horseId);
		if (!horse) return null;
		let best = null;
		let bestDistance = Infinity;
		for (const rival of race.horses) {
			if (!rival || rival.id === horseId) continue;
			const distance = Math.abs(rival.progress - horse.progress);
			if (distance < bestDistance) {
				best = rival;
				bestDistance = distance;
			}
		}
		return best;
	};

	HR.trySkill = function (horse, race, log) {
		if (horse.skillCooldown > 0) {
			horse.skillCooldown -= 1;
			return;
		}

		const baseChance = 0.13 + horse.focus / 900 + (horse.progress >= 70 ? 0.05 : 0);
		if (Math.random() > HR.clamp(baseChance, 0.12, 0.31)) return;

		const candidates = horse.skills.map(skillId => HR.getSkill(skillId)).filter(skill => skill && skill.condition(horse, race));

		if (candidates.length === 0) return;

		const skill = candidates[HR.randInt(0, candidates.length - 1)];
		const before = log.length;
		skill.effect(horse, race, log);
		for (let i = before; i < log.length; i++) {
			log[i] = {
				type: "skill",
				horseId: horse.id,
				horseName: horse.name,
				skillName: skill.name,
				round: race.round,
				text: String(log[i] == null ? "" : log[i]),
			};
		}
		horse.lastSkillRound = race.round;
		horse.skillHistory.push({ round: race.round, name: skill.name });
		if (horse.skillHistory.length > 6) horse.skillHistory.shift();
		horse.skillCooldown = HR.randInt(2, 4);
	};

	HR.step = function () {
		const V = State.variables;
		const race = HR.ensureState();
		if (race.phase === "betting") race.phase = "running";
		if (race.phase !== "running") return race;

		HR.passRaceTime(2);
		const stepMessages = [];
		const gamblingLuck = V.statFreeze
			? 1
			: 1 + (V.daily?.moorGamblingLuck ? HR.MOOR_LUCK_PACE : 0) + (V.foodstuff?.four_leaf_clover?.amount >= 1 ? HR.CLOVER_LUCK_PACE : 0);
		HR.advanceRound(race, stepMessages, race.betHorseId, gamblingLuck);

		const weekly = HR.weeklyState();
		for (const message of stepMessages) {
			if (!message || message.type !== "accident") continue;
			const horse = HR.getHorse(message.horseId);
			if (horse && !weekly.horseRaceInjuredHorses.includes(horse.name)) weekly.horseRaceInjuredHorses.push(horse.name);
			weekly.horseRaceWeeklyAccidents += 1;
			if (message.horseId === race.betHorseId && race.betAmount > 0) weekly.horseRaceIncidentLossStreak += 1;
		}

		if (stepMessages.length === 0) {
			const leader = HR.finishers(race)[0];
			if (leader) stepMessages.push(`${leader.name}【이가】 다른 말들보다 앞서 간다.`);
		}

		race.messages = stepMessages;
		race.messageHistory = Array.isArray(race.messageHistory) ? race.messageHistory : [];
		for (let i = stepMessages.length - 1; i >= 0; i--) {
			race.messageHistory.unshift(stepMessages[i]);
		}
		race.messageHistory = race.messageHistory.slice(0, 3);

		if (HR.raceOver(race)) {
			HR.finishRace();
		}

		return race;
	};

	HR.simulateToEnd = function () {
		const race = HR.ensureState();
		let guard = 0;
		while (race.phase === "running" && guard < 40) {
			HR.step();
			guard += 1;
		}
		return race;
	};

	HR.cancelAutoWatch = function () {
		if (HR._autoWatchTimer) {
			clearTimeout(HR._autoWatchTimer);
			HR._autoWatchTimer = null;
		}
	};

	HR.updateLiveTrack = function () {
		if (typeof document === "undefined") return;
		const race = HR.ensureState();
		const root = document.querySelector(".horse-race-live");
		if (!root) return;

		const caption = root.querySelector(".horse-race-caption");
		const track = HR.trackDefs[race.trackId] || HR.trackDefs.oval;
		root.classList.toggle("horse-race-accident-active", Boolean(race.incidentHorseId));
		if (caption) {
			caption.innerHTML = `<strong>${HR.escapeHtml(track.name)}</strong>`;
		}

		const markers = Array.from(root.querySelectorAll(".horse-race-marker"));
		markers.forEach(function (marker, index) {
			const horse = race.horses[index];
			if (!horse) return;
			marker.setAttribute("data-progress", horse.progress.toFixed(2));
			marker.classList.toggle("horse-race-skill-active", Number.isFinite(horse.lastSkillRound) && race.round - horse.lastSkillRound <= 2);
			marker.classList.toggle("horse-race-incident-horse", horse.accident === true || horse.id === race.incidentHorseId);
			const title = marker.querySelector("title");
			if (title) title.textContent = `${horse.name}: ${Math.floor(horse.progress)}%`;
		});

		const progressRows = Array.from(root.querySelectorAll(".horse-race-progress"));
		progressRows.forEach(function (row, index) {
			const horse = race.horses[index];
			if (!horse) return;
			const meter = row.querySelector("meter");
			const text = row.querySelector("[data-progress-text]");
			if (meter) meter.value = horse.progress.toFixed(2);
			if (text) text.textContent = `${Math.floor(horse.progress)}%`;
			row.classList.toggle("horse-race-backed", horse.id === race.betHorseId);
			row.classList.toggle("horse-race-skill-active", Number.isFinite(horse.lastSkillRound) && race.round - horse.lastSkillRound <= 2);
			row.classList.toggle("horse-race-incident-horse", horse.accident === true || horse.id === race.incidentHorseId);
		});

		HR.placeMarkers();
	};

	HR.updateLiveLog = function () {
		if (typeof document === "undefined") return;
		const log = document.getElementById("horse-race-log-area");
		if (log) log.outerHTML = HR.renderRaceLog();
	};

	/* resultPassage is intentionally omitted: this function only needs the label.
	   refreshLiveView still passes it positionally, so we accept and ignore it. */
	HR.updateLiveControls = function (_resultPassage, resultLabel) {
		if (typeof document === "undefined") return;
		const race = HR.ensureState();
		const controls = document.getElementById("horse-race-controls");
		const status = document.getElementById("horse-race-watch-status");
		if (!controls) return;

		const resultAnchor = document.querySelector("#horse-race-result-link a");
		if (race.phase === "finished") {
			controls.innerHTML = `<span class="horse-race-finished-note">The race has ended. See the result below.</span>`;
			if (status) status.textContent = "경주가 끝났다.";
			if (resultAnchor) resultAnchor.textContent = resultLabel || "결과를 본다";
			return;
		}
		if (resultAnchor) resultAnchor.textContent = "결승선까지 건너뛴다";

		const watchButton = controls.querySelector("[data-horse-watch]");
		const pauseButton = controls.querySelector("[data-horse-pause]");
		if (watchButton) watchButton.disabled = race.autoWatch;
		if (pauseButton) pauseButton.disabled = !race.autoWatch;
		if (status) {
			status.textContent = race.autoWatch
				? `${HR.kind(true, true)}【이가】 달리고 있다.`
				: race.round > 0
				? "경주가 일시 정지되었다."
				: `${HR.kind(true, true)}【이가】 출발선에 나란히 서 있다. 준비가 되면 관람을 시작하십시오.`;
		}
	};

	HR.refreshLiveView = function (resultPassage, resultLabel) {
		HR.updateLiveTrack();
		HR.updateLiveLog();
		HR.updateLiveControls(resultPassage, resultLabel);
	};

	HR.startLiveWatch = function (resultPassage, delay, resultLabel) {
		const race = HR.ensureState();
		if (race.phase === "betting") race.phase = "running";
		if (race.phase !== "running") {
			HR.refreshLiveView(resultPassage, resultLabel);
			return false;
		}

		race.autoWatch = true;
		HR.cancelAutoWatch();
		HR.refreshLiveView(resultPassage, resultLabel);

		const wait = Math.max(600, Number(delay) || HR.DEFAULT_WATCH_DELAY);
		const tick = function () {
			const liveRace = HR.ensureState();
			if (!liveRace.autoWatch || liveRace.phase !== "running") {
				HR.refreshLiveView(resultPassage, resultLabel);
				return;
			}

			HR.step();
			const afterStep = HR.ensureState();
			if (afterStep.phase === "finished") {
				afterStep.autoWatch = false;
				HR.cancelAutoWatch();
				HR.refreshLiveView(resultPassage, resultLabel);
				return;
			}

			HR.refreshLiveView(resultPassage, resultLabel);
			HR._autoWatchTimer = setTimeout(tick, wait);
		};

		/* Let the browser apply the current marker positions first, then animate. */
		HR._autoWatchTimer = setTimeout(tick, Math.min(350, wait));
		return false;
	};

	HR.pauseLiveWatch = function (resultPassage, resultLabel) {
		const race = HR.ensureState();
		race.autoWatch = false;
		HR.cancelAutoWatch();
		HR.refreshLiveView(resultPassage, resultLabel);
		return false;
	};

	HR.renderLiveControls = function (resultPassage, resultLabel, watchLabel, pauseLabel, delay) {
		const race = HR.ensureState();
		if (race.phase === "finished") {
			return `<p id="horse-race-watch-status" class="horse-race-watch-status">The race has ended. See the result below.</p>
			<div id="horse-race-controls" class="horse-race-controls"><span class="horse-race-finished-note">Finished.</span></div>`;
		}

		const result = HR.escapeJsArg(resultPassage);
		const label = HR.escapeJsArg(resultLabel || "결과를 본다");
		const wait = Number.isFinite(Number(delay)) ? Number(delay) : HR.DEFAULT_WATCH_DELAY;
		return `<p id="horse-race-watch-status" class="horse-race-watch-status">${
			race.round > 0 ? "경주가 일시 정지되었다." : `${HR.kind(true, true)}【이가】 출발선에 나란히 서 있다. 준비가 되면 관람을 시작하십시오.`
		}</p>
		<div id="horse-race-controls" class="horse-race-controls">
			<button type="button" data-horse-watch onclick="return setup.horserace.startLiveWatch(${result}, ${wait}, ${label});"${
			race.autoWatch ? " disabled" : ""
		}>${HR.escapeHtml(watchLabel || "관람 시작")}</button>
			<button type="button" data-horse-pause onclick="return setup.horserace.pauseLiveWatch(${result}, ${label});"${
			race.autoWatch ? "" : " disabled"
		}>${HR.escapeHtml(pauseLabel || "관람 일시 정지")}</button>
		</div>`;
	};

	HR.finishRace = function () {
		const V = State.variables;
		const race = HR.ensureState();
		if (race.phase === "finished") return race;

		const ranked = HR.rankedHorses(race);
		race.phase = "finished";
		race.autoWatch = false;
		race.ranking = ranked.map(horse => horse.id);
		/* An injured or withdrawn runner can never be declared the winner or placed. */
		const finishers = HR.finishers(race);
		race.winnerId = finishers.length > 0 ? finishers[0].id : "";
		const neededPlace = race.betType === "place" ? 2 : 1;
		race.won =
			race.betHorseId !== "" &&
			finishers
				.slice(0, neededPlace)
				.map(horse => horse.id)
				.includes(race.betHorseId);
		race.payout = 0;

		if (!race.paidOut && race.betAmount > 0 && race.betHorseId !== "") {
			const betHorse = HR.getHorse(race.betHorseId);
			if (race.won && betHorse) {
				/* The house margin is already inside the posted odds. */
				const odds = race.betType === "place" ? betHorse.placeOdds : betHorse.odds;
				const suspicionMultiplier = HR.suspicionPayoutMultiplier(race.suspicion || 0);
				const basePayout = HR.roundMoney(race.betAmount * odds * suspicionMultiplier);
				const baseProfit = Math.max(0, basePayout - race.betAmount);
				const boostedProfit = window.divineTfIncome(baseProfit, "horseRace");
				race.payout = HR.roundMoney(basePayout + boostedProfit - baseProfit);
				V.money = HR.roundMoney((Number.isFinite(V.money) ? V.money : 0) + race.payout);
				HR.weeklyState().horseRaceWeeklyWins += race.betType === "place" ? HR.PLACE_WIN_WEIGHT : 1;
			} else {
				HR.recordLoss();
			}
			race.paidOut = true;
		}

		const winner = HR.getHorse(race.winnerId);
		if (winner) {
			race.messages = [`${winner.name} crosses the line first.`];
			race.messageHistory = race.messages.concat(Array.isArray(race.messageHistory) ? race.messageHistory : []).slice(0, 3);
		}
		return race;
	};

	HR.renderHorseList = function () {
		const race = HR.ensureState();
		const rows = race.horses
			.map(function (horse) {
				return `<tr>
				<td>${horse.lane}</td>
				<td><strong>${HR.escapeHtml(horse.name)}</strong></td>
				<td>${horse.odds.toFixed(2)}x</td>
				<td>${horse.placeOdds.toFixed(2)}x</td>
				<td>${horse.baseSpeed}</td>
				<td>${horse.maxStamina}</td>
			</tr>`;
			})
			.join("");

		const track = HR.trackDefs[race.trackId];
		return `<div class="horse-race-panel">
			<p><strong>Track:</strong> ${HR.escapeHtml(track.name)}. ${HR.escapeHtml(track.description)}</p>
			<p><strong>Going:</strong> ${HR.escapeHtml(race.goingLabel || race.condition)}. ${HR.escapeHtml(race.goingDescription || "")}</p>
			<table class="horse-race-table">
				<thead><tr><th>Lane</th><th>${HR.kind(false, true)}</th><th>Win</th><th>Place</th><th>Speed</th><th>Stamina</th></tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
	};

	HR.renderTrack = function () {
		const race = HR.ensureState();
		const track = HR.trackDefs[race.trackId] || HR.trackDefs.oval;
		const raceId = HR.escapeHtml(race.id || "horse-race");
		const markers = race.horses
			.map(function (horse, index) {
				const label = HR.escapeHtml(String(index + 1));
				const name = HR.escapeHtml(horse.name);
				const incidentClass = horse.accident === true || horse.id === race.incidentHorseId ? " horse-race-incident-horse" : "";
				return `<g class="horse-race-marker${incidentClass}" data-horse-id="${HR.escapeHtml(horse.id)}" data-progress="${horse.progress.toFixed(2)}" data-lane-index="${index}" data-name="${name}">
				<title>${name}: ${Math.floor(horse.progress)}%</title>
				<circle r="15"></circle>
				<text text-anchor="middle" dominant-baseline="central">${label}</text>
			</g>`;
			})
			.join("");

		const progressRows = race.horses
			.map(function (horse) {
				const betClass = horse.id === race.betHorseId ? " horse-race-backed" : "";
				const incidentClass = horse.accident === true || horse.id === race.incidentHorseId ? " horse-race-incident-horse" : "";
				return `<div class="horse-race-progress${betClass}${incidentClass}" data-horse-id="${HR.escapeHtml(horse.id)}">
				<span>${horse.lane}. ${HR.escapeHtml(horse.name)}</span>
				<meter min="0" max="100" value="${horse.progress.toFixed(2)}"></meter>
				<span data-progress-text>${Math.floor(horse.progress)}%</span>
			</div>`;
			})
			.join("");

		const finish = track.finish || {};
		const finishX1 = Number.isFinite(finish.x1) ? finish.x1 : finish.x;
		const finishY1 = finish.y1;
		const finishX2 = Number.isFinite(finish.x2) ? finish.x2 : finish.x;
		const finishY2 = finish.y2;
		const innerPaths = Array.isArray(track.innerPaths) ? track.innerPaths : [];
		const innerEdges = innerPaths.map(path => `<path class="horse-race-track-inner-edge" d="${HR.escapeHtml(path)}"></path>`).join("");
		const innerMain = innerPaths.map(path => `<path class="horse-race-track-inner-main" d="${HR.escapeHtml(path)}"></path>`).join("");
		const innerLines = innerPaths.map(path => `<path class="horse-race-track-inner-line" d="${HR.escapeHtml(path)}"></path>`).join("");

		return `<div id="horse-race-${raceId}" class="horse-race-live" data-race-id="${raceId}">
			<svg class="horse-race-svg" viewBox="${HR.escapeHtml(track.viewBox)}" role="img" aria-label="경마 경주로">
				<rect class="horse-race-grass" x="0" y="0" width="1000" height="540"></rect>
				<path class="horse-race-track-edge" d="${HR.escapeHtml(track.path)}"></path>
				${innerEdges}
				<path class="horse-race-track-main" d="${HR.escapeHtml(track.path)}"></path>
				${innerMain}
				<path class="horse-race-track-line" d="${HR.escapeHtml(track.path)}"></path>
				${innerLines}
				<line class="horse-race-finish" x1="${finishX1}" y1="${finishY1}" x2="${finishX2}" y2="${finishY2}"></line>
				<path class="horse-race-hidden-path" d="${HR.escapeHtml(track.path)}"></path>
				${markers}
			</svg>
			<div class="horse-race-caption"><strong>${HR.escapeHtml(track.name)}</strong></div>
			${progressRows}
		</div>`;
	};

	HR.placeMarkers = function (raceId) {
		if (typeof document === "undefined") return;
		let root = null;
		if (raceId) root = document.getElementById(`horse-race-${raceId}`);
		if (!root) root = document.querySelector(".horse-race-live");
		if (!root) return;

		const path = root.querySelector(".horse-race-hidden-path");
		const markers = Array.from(root.querySelectorAll(".horse-race-marker"));
		if (!path || markers.length === 0 || typeof path.getTotalLength !== "function") return;

		const length = path.getTotalLength();
		const laneCentre = (markers.length - 1) / 2;

		markers.forEach(function (marker, index) {
			const progress = HR.clamp(Number(marker.getAttribute("data-progress")) || 0, 0, 100) / 100;
			const laneIndex = Number(marker.getAttribute("data-lane-index"));
			const laneOffset = ((Number.isFinite(laneIndex) ? laneIndex : index) - laneCentre) * 18;
			const at = path.getPointAtLength(Math.min(length, Math.max(0, length * progress)));
			const next = path.getPointAtLength(Math.min(length, Math.max(0, length * progress + 1)));
			const dx = next.x - at.x;
			const dy = next.y - at.y;
			const norm = Math.sqrt(dx * dx + dy * dy) || 1;
			const normalX = -dy / norm;
			const normalY = dx / norm;
			marker.setAttribute("transform", `translate(${at.x + normalX * laneOffset}, ${at.y + normalY * laneOffset})`);
		});
	};

	HR.renderRaceLog = function () {
		const race = HR.ensureState();
		const messages = (
			race.messageHistory.length > 0 ? race.messageHistory : race.messages.length > 0 ? race.messages : ["The crowd waits for the next move."]
		).slice(0, 3);
		const items = messages
			.map(function (message) {
				if (message && typeof message === "object" && message.type === "accident") {
					return `<li class="horse-race-accident-log"><strong><span style="color:#ff6b6b;">Injured.</span> ${HR.escapeHtml(
						message.text || `사고가 나서 ${HR.kind()} 한 마리가 경주에서 빠진다.`
					)}</strong></li>`;
				}
				if (message && typeof message === "object" && message.type === "incident") {
					const text = HR.escapeHtml(message.text || "");
					return `<li class="horse-race-incident-log">${message.serious ? `<strong>${text}</strong>` : text}</li>`;
				}
				if (message && typeof message === "object" && message.type === "skill") {
					const round = Number.isFinite(message.round) ? `<span class="horse-race-log-round">Moment ${message.round}</span> ` : "";
					return `<li class="horse-race-skill-log">${round}<span class="horse-race-skill-badge">${HR.escapeHtml(
						message.skillName || "Skill"
					)}</span> <strong>${HR.escapeHtml(message.horseName || HR.kind(false, true))}</strong>: ${HR.escapeHtml(message.text || "앞으로 치고 나간다.")}</li>`;
				}
				return `<li>${HR.escapeHtml(message)}</li>`;
			})
			.join("");
		return `<div id="horse-race-log-area" class="horse-race-log"><strong>Race log</strong><ul>${items}</ul></div>`;
	};

	HR.ordinal = function (n) {
		return ["first", "second", "third", "fourth", "fifth"][n - 1] || `number ${n}`;
	};

	/* What happened to the backed horse, told from what the simulation actually did to it. */
	HR.BACKED_STORY = {
		injured: [
			(name, it) =>
				`${name}【이가】 경주 중에 넘어졌다. 기수가 녀석이 계속 달리지 못하게 막았고, 수의사들이 녀석을 도와 트랙에서 내보냈다. 녀석은 이번 주에 다시 경주할 수 없다.`,
			(name, it) =>
				`${name}【이가】 다리를 절기 시작해 경주를 끝내지 못했다. 수의사들이 부상을 살펴보려고 녀석을 마구간으로 데려갔다. 녀석은 이번 주에 다시 경주할 수 없다.`,
		],
		exhausted: [
			(name, it) =>
				`${name}【이가】 너무 지쳐 더는 경주를 이어 갈 수 없었다. 기수가 속도를 늦추고 결승선 전에 멈춰 섰다. 녀석은 지치긴 했지만 다치지는 않은 채 마구간으로 걸어 돌아갔다.`,
			(name, it) =>
				`${name}【은는】 경주가 이어질수록 느려졌다. 결국 기수가 결승선 전에 녀석을 멈춰 세웠다. 일꾼이 다리를 살펴보았지만 부상은 없어서 수의사는 필요하지 않았다.`,
		],
		blocked: [
			(name, it, place) =>
				`${name} was stuck behind another ${HR.kind()} and could not get past. When there was finally enough space to move forward, the horses in front were already too far ahead. ${
					it.It
				} finished ${place}.`,
			(name, it, place) =>
				`다른 ${HR.kind()}【이가】 갑자기 ${name} 앞으로 끼어들어, 기수는 충돌을 피하려 속도를 늦춰야 했다. ${name}【은는】 계속 달렸지만 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
		],
		wide: [
			(name, it, place) =>
				`${name}【이가】 코너를 돌며 트랙 바깥쪽으로 너무 크게 벗어났다. 기수가 녀석을 다른 말들 쪽으로 다시 이끌었지만, 늘어난 거리 탓에 뒤처지고 말았다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
			(name, it, place) =>
				`${name}【이가】 코너를 돌며 다른 말들에게서 멀어져 모퉁이를 더 멀리 돌아야 했다. 다치지는 않았지만, 늘어난 거리 때문에 시간을 잃었다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
		],
		stumble: [
			(name, it, place) =>
				`${name}【이가】 달리다가 잠시 균형을 잃었다. 간신히 계속 달렸지만, 균형을 되찾기 전에 다른 말 몇 마리가 앞질렀다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
			(name, it, place) =>
				`${name}【이가】 코너를 돌다 넘어질 뻔해서 균형을 되찾으려고 속도를 늦춰야 했다. 계속 달려 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔고, 지치긴 했지만 다치지는 않았다.`,
		],
		beaten: [
			(name, it, place) => `${name}【은는】 결승선 근처에서 온 힘을 다해 달렸지만, 앞선 말이 끝내 앞자리를 지켰다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
			(name, it, place) =>
				`${name}【은는】 경주 대부분 동안 다른 말들 바로 곁에 붙어 있었지만, 앞지를 만큼 빠르게 달리지는 못했다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
			(name, it, place) => `${name}【은는】 아무 문제 없이 경주를 마쳤지만, 다른 말들이 더 빨랐다. 녀석은 ${({first: 1, second: 2, third: 3, fourth: 4, fifth: 5})[place] || String(place).replace("number ", "")}위로 들어왔다.`,
		],
	};

	HR.backedStory = function (race, horse) {
		const it = { it: HR.it("it"), It: HR.it("It"), its: HR.it("its"), itobj: HR.it("itobj") };
		let key = "beaten";
		if (horse.accident === true) key = "injured";
		else if (horse.withdrawn === true) key = "exhausted";
		else if (horse.incidentHappened && HR.BACKED_STORY[horse.incident]) key = horse.incident;
		const finishPlace = HR.finishers(race).findIndex(runner => runner.id === horse.id) + 1;
		const lines = HR.BACKED_STORY[key];
		/* Picked from the race itself so reloading the page keeps the same text. */
		const line = lines[(race.round + horse.lane) % lines.length];
		return line(HR.escapeHtml(horse.name), it, HR.ordinal(finishPlace));
	};

	HR.renderResult = function () {
		const race = HR.ensureState();
		if (race.phase !== "finished") HR.finishRace();

		const ranked = race.ranking.map(horseId => HR.getHorse(horseId)).filter(Boolean);
		const rows = ranked
			.map(function (horse, index) {
				const backed = horse.id === race.betHorseId ? " backed" : "";
				let resultText = `${Math.floor(horse.progress)}%`;
				if (horse.accident === true) resultText = `<strong><span style="color:#ff6b6b;">Injured</span></strong>`;
				else if (horse.withdrawn === true) resultText = `<span style="color:#ffcf6b;">Withdrawn</span>`;

				return `<tr class="${backed}">
				<td>${HR.isOut(horse) ? "-" : index + 1}</td>
				<td>${HR.escapeHtml(horse.name)}</td>
				<td>${resultText}</td>
			</tr>`;
			})
			.join("");

		const winner = HR.getHorse(race.winnerId);
		const injured = race.horses.filter(horse => horse.accident === true && horse.id !== race.betHorseId);

		let celebration = winner
			? `<p><strong>${HR.escapeHtml(winner.name)}</strong> crosses the winning post first. The crowd cheers while the bookies start checking their slips.</p>`
			: "<p>The result board changes, and nobody seems certain who crossed the line first.</p>";

		for (const horse of injured) {
			celebration += `<p>The vets are still with ${HR.escapeHtml(horse.name)} on the far side of the course.</p>`;
		}

		if (race.betAmount > 0 && race.betHorseId !== "") {
			const betHorse = HR.getHorse(race.betHorseId);
			const betName = HR.escapeHtml(betHorse ? betHorse.name : `your ${HR.kind()}`);
			const betLabel = race.betType === "place" ? "입상 베팅" : "베팅";
			if (race.won) {
				if (betHorse && race.betType === "place" && race.winnerId !== betHorse.id) {
					celebration += `<p>${HR.escapeHtml(betHorse.name)} finishes second, which is enough for a place.</p>`;
				}
				celebration += `<p><strong><span style="color:#5fcf7b;">You won.</span></strong> Your ${HR.formatMoney(
					race.betAmount
				)} ${betLabel} on ${betName} pays ${HR.formatMoney(race.payout)}.</p>`;
			} else {
				if (betHorse) celebration += `<p>${HR.backedStory(race, betHorse)}</p>`;
				celebration += `<p><strong><span style="color:#ff6b6b;">You lost.</span></strong> Your ${HR.formatMoney(
					race.betAmount
				)} ${betLabel} does not return anything.</p>`;
			}
		}

		return `<div class="horse-race-result">
			${celebration}
			<table class="horse-race-table">
				<thead><tr><th>Place</th><th>${HR.kind(false, true)}</th><th>Finish</th></tr></thead>
				<tbody>${rows}</tbody>
			</table>
		</div>`;
	};
})();
