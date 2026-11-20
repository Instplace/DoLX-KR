/* globals V, C, Time, Weather, Wikifier, modLISelected, poppyDismissed, poppySchedule, poppyFlatAccessible, markPoppyInteraction */
(() => {
	"use strict";
	const model = () => setup.perfumeryModel;
	const now = () => V.timeStamp;
	const enabled = () => V.perfumery?.enabled !== false;
	const composition = f => JSON.stringify(model().layers.map(l => Object.entries(f[l]).sort(([a], [b]) => a.localeCompare(b))));
	const formulaKey = f =>
		JSON.stringify({
			version: f.version,
			notes: JSON.parse(composition(f)),
			solvent: f.solvent,
			concentration: f.concentration,
			capacity: f.capacity,
			age: f.age,
		});
	const notes = f =>
		model()
			.layers.map(
				l =>
					`${({ top: "오프닝", heart: "하트", base: "베이스" })[l] || l}: ${Object.entries(f[l])
						.map(([id, n]) => `${model().name(id)} × ${n}`)
						.join(", ")}`
			)
			.join(". ");
	function state() {
		// Initialize on first use; ordinary scent checks leave untouched saves alone.
		V.perfumery ??= {
			version: 1,
			extraction: { stock: {}, profiles: [], serial: 0, practice: 0, lesson: null },
			session: null,
			collaborations: [],
			learned: false,
			equipment: false,
			skill: 0,
			lesson: 0,
			lessonSample: null,
			kit: false,
			bottles: [],
			journal: [],
			solvent: { soft: 0, clear: 0, bright: 0 },
			containers: 0,
			serial: 0,
			active: null,
			social: {},
			giftDay: -1,
			gifts: [],
			invited: false,
		};
		return V.perfumery;
	}

	function extract(source, method, mask, finish, serial, quick = false) {
		const s = state();
		const e = s.extraction;
		if (V.perfumeryVenue === "poppy" && teacher()) poppySchedule();
		if (!access() || V.passage !== "Perfumery Workstation") throw new Error("사용할 수 있는 조향 탁자를 이용하십시오.");
		if (serial !== e.serial) throw new Error("이 추출은 이미 끝났습니다. 다른 샘플을 꺼내 놓으십시오.");
		const result = setup.perfumeryExtraction.calculate(source, method, mask, finish);
		const known = e.profiles.find(p => p.key === result.key);
		if (quick && (!known || known.runs < 2)) throw new Error("빠른 추출을 쓰려면 같은 설정으로 먼저 두 번 추출해 보십시오.");
		if ((V.foodstuff[source]?.amount || 0) < 1) throw new Error("재료가 통째로 하나 필요합니다.");
		if (!Object.hasOwn(e.stock, result.key) && Object.keys(e.stock).length >= 80)
			throw new Error("아로마 케이스에는 80종까지만 담을 수 있습니다. 먼저 하나를 쓰거나 버리십시오.");
		if ((e.stock[result.key] || 0) + result.yield > 240) throw new Error("이 아로마 병은 가득 찼습니다(240계량).");
		// This synchronous transaction is the only raw-material debit in perfumery.
		V.foodstuff[source].amount--;
		e.stock[result.key] = (e.stock[result.key] || 0) + result.yield;
		e.serial++;
		e.practice = Math.min(100, e.practice + (quick ? 0 : 1));
		if (known) known.runs = Math.min(255, known.runs + 1);
		if (e.lesson && !e.lesson.complete) {
			if (source === "red_rose") e.lesson.flower = result.key;
			if (source === "choc_chip_cookie") e.lesson.food = result.key;
		}
		Time.pass(result.minutes * 60);
		if (V.perfumeryVenue === "poppy" && V.modLIUnlocks?.Poppy) poppySchedule();
		return result;
	}
	function saveExtraction(key) {
		const e = state().extraction;
		if (!e.stock[key]) throw new Error("레시피를 저장하기 전에 먼저 아로마를 모으십시오.");
		if (e.profiles.some(p => p.key === key)) return;
		if (e.profiles.length >= 48) throw new Error("저장할 수 있는 레시피는 48개까지입니다.");
		const p = setup.perfumeryExtraction.profile(key);
		if (!p) throw new Error("알 수 없는 추출 레시피입니다.");
		e.profiles.push({ key, name: model().name(key).slice(0, 80), runs: 1 });
	}
	function extractionLesson(action) {
		const s = state();
		if (teacher()) poppySchedule();
		if (!canTeach() || s.lesson < 4 || (s.session && s.session.stage !== "concluded"))
			throw new Error("수업 실험을 마친 뒤, 포피가 한가할 때 찾아오십시오.");
		if (action === "begin") {
			if (s.extraction.lesson) throw new Error("이 비교는 이미 시작했습니다.");
			// Teaching samples are awarded once; they still require normal extraction.
			s.extraction.lesson = { flower: null, food: null, complete: false };
			for (const id of ["red_rose", "choc_chip_cookie"]) {
				V.foodstuff[id] ??= { amount: 0 };
				V.foodstuff[id].amount++;
			}
		} else if (action === "review") {
			const l = s.extraction.lesson;
			if (!l || l.complete || !l.flower || !l.food) throw new Error("비교용 샘플 두 가지를 먼저 모으십시오.");
			l.complete = true;
			if (s.social.Poppy !== Time.days) {
				s.social.Poppy = Time.days;
				Wikifier.wikifyEval("<<npcincr Poppy love 1>>");
			}
		} else throw new Error("비교 동작을 고르십시오.");
		markPoppyInteraction();
		Time.pass(5 * 60);
	}
	function teacher() {
		return enabled() && !!V.modLIUnlocks?.Poppy && C.npc.Poppy?.init === 1 && !poppyDismissed() && (C.npc.Poppy.patience >= 34 || Number(V.poppyromance) >= 0);
	}
	function availableTeacher() {
		if (!teacher()) return false;
		return (
			V.poppyFlat?.home &&
			V.poppyFlat.room === "living_room" &&
			!Time.isBloodMoon() &&
			!(Number(V.poppyFlat.kickedUntilDay) >= Time.days) &&
			!(Time.month === 2 && Time.monthDay === 14 && V.valentines_poppy_flat_accept)
		);
	}
	function canTeach() {
		return V.location === "flats" && V.bus === "poppy_living_room" && availableTeacher() && C.npc.Poppy.love >= (V.perfumery?.lesson === 3 ? 60 : 15);
	}
	function canInvite() {
		return (
			teacher() &&
			C.npc.Poppy.love >= 15 &&
			((V.location === "lake" && T.poppy_location === "lake" && Time.hour >= 9 && Time.hour < 12 && !["rain", "snow"].includes(Weather.precipitation)) ||
				canTeach() ||
				// A partner can ask in Poppy's bedroom while Poppy is awake there.
				(V.bus === "poppy_bedroom" && V.poppyFlat?.bedroomUnlocked && Number(V.poppyromance) >= 0 && V.poppyFlat.home && !(Time.hour >= 1 && Time.hour < 6)))
		);
	}
	function canVisit() {
		if (!enabled() || !V.perfumery?.invited || !V.modLIUnlocks?.Poppy || poppyDismissed()) return false;
		if (!teacher() && Number(V.poppyromance) < 0) return false;
		if (Time.isBloodMoon() || Number(V.poppyFlat?.kickedUntilDay) >= Time.days || (Time.month === 2 && Time.monthDay === 14 && V.valentines_poppy_flat_accept))
			return false;
		return poppyFlatAccessible() || (teacher() && V.poppyFlat?.home && V.poppyFlat.room !== "bedroom");
	}
	function access() {
		return (
			enabled() &&
			V.perfumery?.learned &&
			(V.perfumeryVenue === "home"
				? V.perfumery.equipment && V.location === "home"
				: V.perfumeryVenue === "poppy" && V.location === "flats" && V.bus === "poppy_living_room" && canVisit())
		);
	}
	function buy(kind, type = "clear") {
		const s = state();
		if (!enabled() || V.passage !== "Perfumery Supplies" || V.location !== "shopping_centre")
			throw new Error("장비와 재료는 화장품 가게에서 사십시오.");
		const base = kind === "equipment" ? 15000 : kind === "manual" ? 5000 : kind === "container" ? 150 : model().solvents[type]?.cost * 20;
		const price = setup.inflation ? setup.inflation.price(base) : base;
		if (!Number.isFinite(price) || V.money < price) throw new Error("돈이 모자라 살 수 없습니다.");
		if (kind === "equipment" && (s.equipment || !s.learned)) throw new Error("장비를 사기 전에 기본부터 배우십시오.");
		if (kind === "manual" && (s.learned || modLISelected("Poppy"))) throw new Error("기본은 포피가 가르쳐 줄 수 있습니다.");
		if (!["equipment", "manual", "container", "solvent"].includes(kind)) throw new Error("알 수 없는 물품입니다.");
		statChange.money(-base, "cosmetics");
		if (kind === "equipment") s.equipment = true;
		else if (kind === "manual") {
			s.learned = true;
			s.equipment = true;
		} else if (kind === "container") s.containers++;
		else s.solvent[type] += 20;
	}
	function invite() {
		if (teacher()) poppySchedule();
		if (!canInvite()) throw new Error("포피와 이야기할 틈이 있을 때 물어보십시오.");
		state().invited = true;
		markPoppyInteraction();
		Time.pass(5 * 60);
	}
	function beginLesson(approach = "observe") {
		const s = state();
		if (teacher()) poppySchedule();
		if (!canTeach() || s.lesson >= 4) throw new Error("포피가 지금은 다음 수업을 해 줄 수 없습니다.");
		if (!s.invited) throw new Error("먼저 포피에게 배우고 싶다고 말하십시오.");
		if (s.session && s.session.stage !== "concluded") throw new Error("진행 중인 실험을 먼저 끝내거나 치워 두십시오.");
		if (!["observe", "familiar", "contrast", "quiet", "bold", "respect", "question"].includes(approach)) throw new Error("수업 방식을 고르십시오.");
		s.session = { kind: "lesson", lesson: s.lesson, stage: "compose", approach, bottleId: null };
		s.invited = true;
		s.learned = true;
		if (!s.kit) {
			s.kit = true;
			for (const id of ["red_rose", "daisy", "orchid"]) {
				V.foodstuff[id] ??= { amount: 0 };
				V.foodstuff[id].amount += 6;
			}
			s.containers += 3;
			s.solvent.clear += 60;
		}
		markPoppyInteraction();
		Time.pass(5 * 60);
	}
	function lessonMatches(bottle) {
		const s = state();
		const f = bottle.formula;
		const p = properties(bottle);
		let complete = false;
		if (s.lesson === 0) complete = true;
		if (s.lesson === 1 && s.lessonSample) {
			const previous = model().validate(s.lessonSample).needed;
			const next = model().validate(f).needed;
			complete =
				Object.keys(previous).sort().join() === Object.keys(next).sort().join() &&
				composition(f) !== composition(s.lessonSample) &&
				(Object.keys(previous).length === 1 || model().layers.some(l => Object.keys(f[l]).length >= 2));
		}
		if (s.lesson === 2 && s.lessonSample)
			complete =
				composition(f) === composition(s.lessonSample) &&
				(f.concentration !== s.lessonSample.concentration || f.solvent !== s.lessonSample.solvent || f.age !== s.lessonSample.age);
		if (s.lesson === 3) complete = p.families.includes("floral") && p.persistence > 0.5 && p.quality >= 60;
		return complete;
	}
	/* Poppy's own entry for the friendly rivalry. Fixed so the comparison is fair across saves. */
	const rivalFormula = { version: 1, top: { daisy: 1 }, heart: { red_rose: 2 }, base: { orchid: 2 }, solvent: "soft", concentration: 26, capacity: 40, age: 3 };
	function startCollaboration(topic, demonstrated) {
		const s = state();
		if (teacher()) poppySchedule();
		if (!canTeach() || s.lesson < 4 || !["opening", "challenge", "gift", "demonstration", "rivalry", "rescue"].includes(topic))
			throw new Error("포피가 그 공동 작업에는 응해 줄 수 없습니다.");
		if (s.session && s.session.stage !== "concluded") throw new Error("진행 중인 실험을 먼저 끝내십시오.");
		if ((topic === "demonstration" || topic === "rescue") && !demonstrated) throw new Error("포피가 따라 할 배합이 필요합니다.");
		if (topic === "rivalry" && !s.characters?.poppy?.rivalry) throw new Error("포피가 아직 도전해 오지 않았습니다.");
		const previous = s.bottles[s.bottles.length - 1];
		let reference = demonstrated || (topic === "rivalry" ? rivalFormula : previous?.formula || s.lessonSample);
		if (topic === "gift") {
			if (!s.gifts.length) throw new Error("포피가 비교해 볼 향수를 아직 받지 못했습니다.");
			const gift = JSON.parse(s.gifts[s.gifts.length - 1]);
			reference = {
				version: gift.version,
				...Object.fromEntries(model().layers.map((layer, i) => [layer, Object.fromEntries(gift.notes[i])])),
				solvent: gift.solvent,
				concentration: gift.concentration,
				capacity: gift.capacity,
				age: gift.age,
			};
		}
		s.session = { kind: "collaboration", stage: "compose", approach: topic, reference: model().copy(reference), bottleId: null };
		markPoppyInteraction();
		Time.pass(5 * 60);
	}
	function sessionBottle() {
		return V.perfumery?.bottles.find(b => b.id === V.perfumery.session?.bottleId);
	}
	function smellSignature() {
		if (teacher()) poppySchedule();
		const session = V.perfumery?.session;
		if (!canTeach() || session?.kind !== "lesson" || session.lesson !== 3 || session.stage !== "compose" || V.poppySeen.includes("perfumery_signature_strip"))
			throw new Error("포피가 시그니처 시향지를 더는 내주지 않습니다.");
		V.poppySeen.push("perfumery_signature_strip");
		// This is Poppy's own story-specific fragrance, never a player's manufactured perfume.
		Wikifier.wikifyEval("<<poppyOpiumPulse>>");
		markPoppyInteraction();
		Time.pass(5 * 60);
	}
	function review(response) {
		const s = state();
		const session = s.session;
		const b = sessionBottle();
		if (teacher()) poppySchedule();
		if (!canTeach() || session?.stage !== "review" || !b) throw new Error("포피와 이야기할 틈이 있을 때 완성한 샘플을 가져오십시오.");
		if (session.kind === "lesson" && session.lesson === 2 && !ready(b)) throw new Error("비교용 병이 숙성될 때까지 기다린 뒤 평가하십시오.");
		if (!["explain", "revise", "respect", "question"].includes(response)) throw new Error("샘플을 어떻게 이야기할지 고르십시오.");
		session.response = response;
		session.success = session.kind === "lesson" ? lessonMatches(b) : true;
		session.stage = "concluded";
		if (session.kind === "lesson" && session.success) {
			s.lesson++;
			s.lessonSample = model().copy(b.formula);
			Wikifier.wikifyEval("<<npcincr Poppy love 1>>");
		} else if (session.kind === "collaboration") {
			const key = formulaKey(b.formula);
			if (s.collaborations.length < 16 && !s.collaborations.includes(key)) {
				s.collaborations.push(key);
				if (s.social.Poppy !== Time.days && properties(b).quality >= 65) {
					s.social.Poppy = Time.days;
					Wikifier.wikifyEval("<<npcincr Poppy love 1>>");
				}
			}
		}
		markPoppyInteraction();
		Time.pass(5 * 60);
		return session.success;
	}
	function craft(formula, blending, expectedSerial) {
		const s = state();
		if (V.perfumeryVenue === "poppy" && teacher()) poppySchedule();
		if (!access() || V.passage !== "Perfumery Workstation") throw new Error("조향 탁자를 이용할 수 없습니다.");
		if (expectedSerial !== s.serial) throw new Error("이번 배치는 이미 병에 담았습니다. 새 초안을 시작하십시오.");
		if (!Number.isFinite(blending) || blending < 0 || blending > 1) throw new Error("먼저 블렌딩을 끝내십시오.");
		const f = model().copy(formula);
		const cost = model().validate(f);
		if (s.bottles.length >= 24) throw new Error("보관장에는 병을 24개까지 둘 수 있습니다. 먼저 하나를 쓰거나, 선물하거나, 버리십시오.");
		if (s.containers < 1 || s.solvent[f.solvent] < cost.solvent) throw new Error("빈 병과 선택한 스피릿이 충분히 필요합니다.");
		for (const [id, n] of Object.entries(cost.needed)) if ((s.extraction.stock[id] || 0) < n) throw new Error(`먼저 ${model().name(id)} 추출을 더 하십시오.`);
		const bottle = bottleRecord(f, Math.min(1, blending * 0.9 + s.skill / 1000), s.serial + 1);
		// All checks precede this synchronous commit. No passage navigation or await between debit and credit.
		for (const [id, n] of Object.entries(cost.needed)) {
			s.extraction.stock[id] -= n;
			if (s.extraction.stock[id] === 0) delete s.extraction.stock[id];
		}
		s.containers--;
		s.solvent[f.solvent] -= cost.solvent;
		s.serial++;
		s.bottles.push(bottle);
		const recorded = s.journal.find(e => formulaKey(e.formula) === formulaKey(f));
		if (recorded) {
			const quality = model().calculate(f, bottle.blending).quality;
			recorded.attempts++;
			recorded.best = Math.max(recorded.best, quality);
			recorded.results.push(Math.round(quality));
			recorded.results = recorded.results.slice(-4);
		}
		s.skill = Math.min(100, s.skill + 1);
		if (s.session?.stage === "compose" && V.perfumeryVenue === "poppy") {
			s.session.bottleId = bottle.id;
			s.session.stage = "review";
		} else setup.perfumeryCharacters.poppyCrafted(bottle);
		Time.pass(20 * 60);
		if (V.perfumeryVenue === "poppy" && V.modLIUnlocks?.Poppy) poppySchedule();
		return bottle;
	}
	function properties(bottle) {
		const age = Math.min(bottle.formula.age, Math.max(0, (now() - bottle.made) / 86400));
		return model().calculate(bottle.formula, bottle.blending, age);
	}
	function bottleRecord(formula, blending, id) {
		const p = model().calculate(formula, blending);
		return {
			id,
			formula: model().copy(formula),
			blending,
			made: now(),
			name: p.name,
			uses: p.applications,
			fingerprint: p.fingerprint,
			icon: setup.perfumeryIcons.descriptor(p.fingerprint, p),
		};
	}
	function debugAction(action, value, extra) {
		if (V.debug !== 1) throw new Error("Enable the native DEBUG menu first.");
		const s = state();
		if (action === "bottle") {
			model().validate(value);
			if (s.bottles.length >= 24 || !Number.isFinite(extra) || extra < 0 || extra > 1) throw new Error("Choose valid craftsmanship and free bottle space.");
			const b = bottleRecord(value, extra, s.serial + 1);
			s.serial++;
			s.bottles.push(b);
			return b;
		}
		if (action === "extract") {
			const p = setup.perfumeryExtraction.profile(value);
			if (!p || !Number.isInteger(extra) || extra < 0 || extra > 240) throw new Error("Choose a real profile and 0–240 measures.");
			if (!Object.hasOwn(s.extraction.stock, value) && Object.keys(s.extraction.stock).length >= 80) throw new Error("Extract case full.");
			if (extra) s.extraction.stock[value] = extra;
			else delete s.extraction.stock[value];
		}
		if (action === "studies") {
			const p = setup.perfumeryExtraction.profile(value);
			if (!p) throw new Error("Choose a profile.");
			s.extraction.profiles = s.extraction.profiles.filter(x => x.key !== value);
			if (extra) {
				if (s.extraction.profiles.length >= 48) throw new Error("Notebook full.");
				s.extraction.profiles.push({ key: value, name: model().name(value).slice(0, 80), runs: 2 });
			}
		}
		if (action === "duration") {
			if (!Number.isFinite(value) || value < 0 || value > 720) throw new Error("Use 0–720 minutes.");
			if (s.active) s.active.remaining = value;
		}
		if (action === "lessons") {
			if (!Number.isInteger(value) || value < 0 || value > 4) throw new Error("Use lesson 0–4.");
			s.lesson = value;
			s.session = null;
		}
		if (action === "workstation") {
			s.learned = true;
			s.equipment = true;
		}
		if (action === "skill") {
			if (!Number.isInteger(value) || value < 0 || value > 100) throw new Error("Use skill 0–100.");
			s.skill = value;
		}
		if (action === "resetLessons") {
			s.lesson = 0;
			s.lessonSample = null;
			s.session = null;
			s.extraction.lesson = null;
		}
	}
	function ready(bottle) {
		return now() >= bottle.made + bottle.formula.age * 86400;
	}
	function apply(id) {
		if (!enabled()) throw new Error("향수 기능을 지금은 쓸 수 없습니다.");
		const s = state();
		const b = s.bottles.find(b => b.id === id);
		if (!b || b.uses < 1 || !ready(b)) throw new Error("그 병은 비었거나 아직 숙성 중입니다.");
		b.uses--;
		const age = Math.min(b.formula.age, Math.max(0, (now() - b.made) / 86400));
		/* The worn scent keeps its recipe, not a copy of the calculation; activeProperties() rebuilds and caches it. */
		s.active = {
			name: b.name,
			icon: setup.perfumeryIcons.forBottle(b),
			formula: model().copy(b.formula),
			blending: b.blending,
			age,
		};
		const p = activeProperties(s.active);
		s.active.remaining = p.duration;
		s.active.total = p.duration;
		// Half a bath's glow (2400), wearing off over about the same 7 waking hours
		if (V.beautyBoost) {
			V.beautyBoost.perfume = 1200;
			delete V.beautyBoost._perfumeShown;
			V.effectsmessage = 1;
		}
		// Poppy's Opium carries the real scent, so wearing it counts like being close to Poppy.
		if (b.opium && typeof window.poppyOpiumPulse === "function") window.poppyOpiumPulse();
	}
	function tick(minutes) {
		const a = V.perfumery?.active;
		if (!a) return;
		a.remaining -= minutes * (V.outside && Weather.precipitation === "rain" ? 2 : 1);
		if (a.remaining <= 0) {
			V.perfumery.active = null;
			V.perfumeFadedMessage = a.name;
			V.effectsmessage = 1;
			if (V.beautyBoost) {
				V.beautyBoost.perfume = 0;
				delete V.beautyBoost._perfumeShown;
			}
		}
	}
	function wash() {
		if (!V.perfumery?.active) return;
		V.perfumeFadedMessage = V.perfumery.active.name;
		V.perfumeWashedMessage = true;
		V.effectsmessage = 1;
		V.perfumery.active = null;
		// The "scent is gone" line already covers the lost glow
		if (V.beautyBoost) {
			V.beautyBoost.perfume = 0;
			delete V.beautyBoost._perfumeShown;
		}
	}
	function scent() {
		const a = V.perfumery?.active;
		if (!a || !enabled()) return null;
		return { ...previewWear(a), name: a.name };
	}
	const activeCache = new Map();
	function activeProperties(a) {
		const key = JSON.stringify([a.formula, a.blending, a.age]);
		if (!activeCache.has(key)) {
			if (activeCache.size >= 8) activeCache.clear();
			activeCache.set(key, model().calculate(a.formula, a.blending, a.age));
		}
		return activeCache.get(key);
	}
	function previewWear(active, minutes = 0, rain = false) {
		if (!active) return null;
		if (!Number.isFinite(minutes) || minutes < 0 || minutes > 720) throw new Error("Preview 0–720 minutes.");
		const remaining = Math.max(0, active.remaining - minutes * (rain ? 2 : 1));
		const left = model().clamp(remaining / active.total, 0, 1);
		const p = activeProperties(active);
		const d = p.development;
		const layer = left > 0.7 ? "top" : left > 0.3 ? "heart" : "base";
		const pleasantness = p.phasePleasantness?.[layer] ?? p.pleasantness;
		return {
			...p,
			pleasantness,
			romance: model().clamp(p.romance * Math.min(1.2, pleasantness / Math.max(1, p.pleasantness)), 0, 1),
			remaining,
			strength: d.top * left ** 3 + d.heart * Math.sin((left * Math.PI) / 2) + d.base * Math.sqrt(left),
			phase: layer === "top" ? "opening" : layer === "heart" ? "heart" : "foundation",
		};
	}
	function effects() {
		const p = scent();
		if (!p) return [];
		const lines = [`${Math.ceil(p.remaining)}분 뒤에 사라집니다. 비가 오면 더 빨리 사라집니다.`];
		if (p.attention * p.strength * 0.2 >= 0.05) lines.push("마을 사람들이 당신을 더 쉽게 알아챕니다.");
		if (isBestialityOnForAnyCreature() || V.monster === 1) {
			const pull = ["wolf", "boar", "bear"].map(animal => wildlifePreview(animal, p, true));
			if (pull.some(m => m >= 1.05)) lines.push("숲속 동물이 당신을 더 쉽게 찾아냅니다.");
			else if (pull.every(m => m <= 0.95)) lines.push("숲속 동물이 당신을 더 어렵게 찾아냅니다.");
		}
		if (["Poppy", "Robin"].some(npc => socialPreview(npc, p).score >= 0.2)) lines.push("일부 사람은 이 향을 좋아합니다.");
		if (p.intensity * p.strength > 2.5) lines.push("일부 사람은 향이 너무 강하다고 느낍니다.");
		return lines;
	}
	function wildlife(category) {
		return wildlifePreview(category, scent());
	}
	function wildlifePreview(category, p, outside = V.outside) {
		if (!p || !outside || !(isBestialityOnForAnyCreature() || V.monster === 1)) return 1;
		const sensory = p.descriptorStrengths;
		const interest =
			category === "bear" ? p.sweet : category === "boar" ? p.animal + (sensory?.savoury || 0) * 0.4 : p.animal - (sensory?.sulfurous || 0) * 0.5;
		return model().clamp(1 + (interest * 0.25 - p.concealment * 0.35) * p.strength, 0.7, 1.3);
	}
	function social(npc) {
		const p = scent();
		if (!p) return false;
		const s = state();
		if (!socialPreview(npc, p).eligible) return false;
		s.social[npc] = Time.days;
		Wikifier.wikifyEval(`<<npcincr ${npc} love 1>>`);
		return true;
	}
	function socialPreview(npc, p = scent()) {
		if (!p || !["Poppy", "Robin"].includes(npc)) return { preference: 0, score: 0, eligible: false };
		const preference = npc === "Poppy" ? p.sweet * 0.4 + p.persistence * 0.6 : Math.max(0, p.fresh - (p.descriptorStrengths?.smoky || 0) * 0.25);
		return {
			preference,
			score: p.romance * (p.strength ?? 1) * preference,
			eligible:
				p.romance * (p.strength ?? 1) * preference >= 0.2 &&
				!!C.npc[npc] &&
				C.npc[npc].love >= 10 &&
				V.perfumery?.social?.[npc] !== Time.days &&
				(npc !== "Poppy" || (teacher() && C.npc.Poppy.patience >= 40)) &&
				p.intensity * (p.strength ?? 1) <= 2.5,
		};
	}
	function saveFormula(id, name) {
		const s = state();
		const b = s.bottles.find(b => b.id === id);
		if (!b) throw new Error("병을 찾을 수 없습니다.");
		const key = formulaKey(b.formula);
		const previous = s.journal.find(e => formulaKey(e.formula) === key);
		const quality = model().calculate(b.formula, b.blending).quality;
		const entry = { name: String(name || b.name).slice(0, 48), formula: model().copy(b.formula), best: quality, attempts: 1, results: [Math.round(quality)] };
		entry.blending = b.blending;
		entry.icon = setup.perfumeryIcons.forBottle(b);
		if (previous) {
			previous.name = entry.name;
			previous.best = Math.max(previous.best, entry.best);
		} else {
			if (s.journal.length >= 32) throw new Error("배합 목록에는 배합을 32개까지 담을 수 있습니다. 먼저 하나를 지우십시오.");
			s.journal.push(entry);
		}
	}
	function outcome(b) {
		const p = properties(b);
		if (p.intensity > 2.6) return "intense";
		if (p.quality < 60) return "discordant";
		const s = V.perfumery || { skill: 0, gifts: [], collaborations: [] };
		const key = formulaKey(b.formula);
		if (p.quality > 85 && s.skill >= 20 && !s.gifts.includes(key) && !s.collaborations.includes(key)) return "original";
		if (p.families.includes("floral") && p.sweet > 0.45 && p.persistence > 0.65) return "familiar";
		if (p.sweet > 0.4 && p.persistence > 0.5 && p.quality > 72) return "preferred";
		return p.quality > 80 ? "elegant" : "beginner";
	}
	function feedback(b) {
		const p = properties(b);
		if (p.pleasantness < 30 && p.quality > 72)
			return '포피가 시향지 냄새를 다시 맡고는 당신의 노트를 본다. "잘 만들긴 했는데 냄새가 끔찍해. 이게 네가 원한 거야?"';
		if (p.pleasantness < 25)
			return '포피가 기침하며 시향지를 멀리 치운다. "냄새가 지독해! 방 전체에 퍼지기 전에 병 뚜껑부터 닫아."';
		if (p.extractionPurity < 0.55)
			return '포피가 재료에 관한 당신의 노트를 훑어본다. "문제는 이 재료를 추출할 때 시작된 것 같아. 쓰는 양을 바꾸기 전에 추출부터 다시 해 봐."';
		if (p.distinctiveness > 60 && p.quality > 65)
			return '포피가 시향지 냄새를 다시 맡는다. "내가 쓸 향은 아니지만, 흥미로운 걸 만들었네. 어떻게 떠올렸어?"';
		if (p.nuances.includes("gourmand") && p.pleasantness > 65)
			return '포피가 향수를 쿠키에 견준 페이지를 확인한다. "단 냄새 얘기는 네 말이 맞았어. 꽃향기를 덮을 줄 알았는데, 아직 다 맡히네."';
		return {
			intense: '포피가 시향지를 코에서 멀리 치운다. "세다! 가까이 대지 않아도 냄새가 나. 이렇게까지 강하게 하고 싶었던 거야?"',
			discordant:
				'포피가 시향지 냄새를 다시 맡고는 재료를 확인한다. "이 냄새 중 하나가 나머지를 덮고 있어. 재료를 각각 얼마나 썼는지 확인해 보자."',
			original:
				'포피가 당신의 재료 목록을 읽고는 시향지 냄새를 다시 맡는다. "이 재료들이 함께 이런 냄새를 낼 줄은 몰랐어. 뭘 바꿨어?"',
			familiar:
				'포피가 당신의 샘플을 원래 향수병 옆에 놓는다. "이거랑 닮았는데, 네 건 충분히 달라. 네 버전을 계속 쓰는 게 좋겠어."',
			preferred: '포피가 시향지 냄새를 다시 맡고 미소 짓는다. "이거 마음에 들어. 단 냄새가 먼저 오는데, 그 뒤에도 꽃향기가 맡혀."',
			elegant: '포피가 잠시 기다렸다가 시향지 냄새를 다시 맡는다. "여전히 좋은 냄새야. 아직은 더할 게 없을 것 같아."',
			beginner:
				'포피가 향이 밴 시향지를 열려 있는 병들에서 멀리 치우고는 다시 냄새를 맡는다. "아까보다 낫네. 다른 향수들 때문에 네 향을 제대로 맡기가 어려웠거든."',
		}[outcome(b)];
	}
	function gift(id) {
		const s = state();
		if (teacher()) poppySchedule();
		const b = s.bottles.find(b => b.id === id);
		if (s.session?.stage === "review" && s.session.bottleId === id) throw new Error("병을 선물하기 전에 이 실험 이야기를 먼저 하십시오.");
		if (V.perfumeryVenue !== "poppy" || V.location !== "flats" || !availableTeacher() || !b || !ready(b) || b.uses < 1)
			throw new Error("포피가 거실에 있을 때 쓸 수 있는 숙성된 병을 건네십시오.");
		const key = formulaKey(b.formula);
		if (s.giftDay === Time.days || s.gifts.includes(key)) throw new Error("포피가 이미 이 배합을 살펴봤거나 오늘 향수를 받았습니다.");
		const response = feedback(b);
		const p = properties(b);
		s.giftDay = Time.days;
		s.gifts.push(key);
		// At most 32 rewarded discoveries, so alternating or slightly editing formulas cannot farm forever.
		if (s.gifts.length <= 32 && p.quality > 65 && p.sweet > 0.3 && p.persistence > 0.4 && (p.pleasantness >= 45 || (p.quality > 85 && p.distinctiveness > 65)))
			Wikifier.wikifyEval("<<npcincr Poppy love 2>>");
		if (s.gifts.length > 32) s.gifts.shift();
		s.bottles.splice(s.bottles.indexOf(b), 1);
		markPoppyInteraction();
		Time.pass(5 * 60);
		return `포피가 병을 받기 전에 손으로 쓴 라벨을 빛 쪽으로 돌려 본다. ${
			p.sweet > 0.4 && p.persistence > 0.5
				? '"나한테 주려고 만든 거야? 이 노트는 사본을 남겨 둬. 이게 떨어지면 하나 더 부탁할지도 몰라."'
				: "\"나한테? 내가 직접 고르진 않았을 향이야. 그렇다고 치워 둘 이유는 아니지.\""
		} ${response}`;
	}
	setup.perfumery = {
		wildlifePreview,
		previewWear,
		activeProperties,
		debugAction,
		socialPreview,
		extract,
		saveExtraction,
		extractionLesson,
		state,
		enabled,
		teacher,
		availableTeacher,
		canTeach,
		canInvite,
		canVisit,
		access,
		buy,
		invite,
		beginLesson,
		startCollaboration,
		smellSignature,
		sessionBottle,
		review,
		lessonMatches,
		craft,
		properties,
		ready,
		apply,
		tick,
		wash,
		scent,
		effects,
		wildlife,
		social,
		saveFormula,
		feedback,
		outcome,
		gift,
		bottleRecord,
		composition,
		formulaKey,
		notes,
	};
})();
