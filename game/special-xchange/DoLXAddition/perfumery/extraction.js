/* Stylized aroma facets, not chemical substances or preparation instructions. */
(() => {
	"use strict";
	const facets = {
		petal: ["floral", 1.1, 0.65, 0.5, 0.4, 0.55, 0.1],
		leaf: ["green", 0.8, 0.85, 0.25, 0.1, 0.9, 0.35],
		pollen: ["floral", 1, 0.3, 0.7, 0.65, 0.2, 0.3],
		peel: ["citrus", 1.2, 0.95, 0.2, 0.2, 1, 0.05],
		juice: ["fruit", 1, 0.75, 0.35, 0.8, 0.6, 0.05],
		jam: ["fruit", 1.15, 0.35, 0.7, 0.9, 0.15, 0.15],
		butter: ["bakery", 1, 0.5, 0.55, 0.35, 0.05, 0.2],
		crumb: ["bakery", 0.85, 0.6, 0.45, 0.35, 0.1, 0.35],
		caramel: ["sweet", 1.2, 0.3, 0.8, 1, 0, 0.2],
		cocoa: ["roasted", 1.4, 0.2, 0.9, 0.3, 0, 0.65],
		spice: ["herbal", 1.3, 0.65, 0.6, 0.1, 0.45, 0.55],
		root: ["earthy", 1, 0.25, 0.8, 0.1, 0.2, 0.9],
		umami: ["savoury", 1.3, 0.35, 0.85, 0.05, 0, 0.7],
		sharp: ["sulphurous", 1.7, 0.85, 0.6, 0, 0.1, 0.6],
		ferment: ["fermented", 1.5, 0.55, 0.8, 0.2, 0, 0.65],
		toast: ["roasted", 1.1, 0.45, 0.75, 0.2, 0, 0.6],
	};
	const defaults = {
		flower: ["petal", "leaf", "pollen", "root", "juice", "spice"],
		fruit: ["juice", "peel", "leaf", "jam", "petal", "root"],
		vegetable: ["leaf", "root", "juice", "spice", "umami", "sharp"],
		mushroom: ["root", "umami", "leaf", "spice", "ferment", "toast"],
		meat: ["umami", "toast", "root", "sharp", "ferment", "spice"],
		seafood: ["umami", "sharp", "leaf", "root", "ferment", "spice"],
	};
	const baked = ["crumb", "toast", "butter", "leaf", "ferment", "caramel"];
	const overrides = {
		bread: baked,
		naan_bread: baked,
		yorkshire_pudding: baked,
		chips: ["toast", "root", "umami", "butter", "leaf", "ferment"],
		choc_chip_cookie: ["butter", "crumb", "caramel", "cocoa", "toast", "ferment"],
		chocolate: ["cocoa", "caramel", "butter", "toast", "petal", "ferment"],
		cocoa_powder: ["cocoa", "toast", "root", "petal", "spice", "ferment"],
		butter: ["butter", "crumb", "caramel", "leaf", "ferment", "sharp"],
		cheese: ["butter", "umami", "ferment", "sharp", "root", "toast"],
		honey: ["caramel", "petal", "pollen", "jam", "leaf", "ferment"],
		wild_honeycomb: ["caramel", "petal", "pollen", "jam", "leaf", "ferment"],
		jam: ["jam", "juice", "caramel", "peel", "petal", "ferment"],
		oats: ["crumb", "toast", "butter", "leaf", "root", "ferment"],
		pastry: ["butter", "crumb", "toast", "caramel", "leaf", "ferment"],
		red_wine: ["jam", "ferment", "petal", "root", "peel", "spice"],
		white_wine: ["juice", "ferment", "peel", "petal", "leaf", "spice"],
		cream: ["butter", "caramel", "leaf", "crumb", "ferment", "sharp"],
		scottish_bog_myrtle: ["spice", "leaf", "petal", "root", "peel", "pollen"],
	};
	// Weak, scentless, bodily, bait, toxic, and story-sensitive stock is never inferred into an accord.
	const excluded = new Set([
		"salt",
		"sugar",
		"flour",
		"vegetable_oil",
		"rice",
		"wheat",
		"potato",
		"green_manure",
		"oyster_pearl",
		"chicken_egg",
		"bird_egg",
		"water_dragon_egg",
		"water_dragon_egg_pastel",
		"bottle_of_milk",
		"bottle_of_breast_milk",
		"baby_bottle_of_breast_milk",
		"bottle_of_semen",
		"baitfish",
		"bait_worm",
		"poppy",
		"strange_flower",
		"ghost_orchid",
		"ghostshroom",
		"wolfshroom",
		"fly_agaric",
		"ghostbrew",
		"wolfbrew",
	]);
	const methods = {
		capture: { name: "부드러운 향 포집", minutes: 8, yield: 3 },
		balanced: { name: "균형 분리", minutes: 12, yield: 4 },
		deep: { name: "깊은 향 연구", minutes: 16, yield: 4 },
	};
	let catalogue;
	function registry() {
		if (catalogue) return catalogue;
		if (!setup.foodstuff) throw new Error("Food catalogue is not ready.");
		catalogue = {};
		const build = (id, path = []) => {
			if (Object.hasOwn(catalogue, id)) return catalogue[id];
			const item = setup.foodstuff[id];
			if (!item || excluded.has(id) || path.includes(id)) return null;
			let seeds = overrides[id] || defaults[item.category];
			const prepared = !!item.recipe || ["meat", "seafood"].includes(item.category);
			if (!seeds && item.recipe) {
				const aromas = item.recipe.ingredients.flatMap(source => build(source, [...path, id])?.seeds.slice(0, 2) || []);
				if (!aromas.length) return null;
				seeds = [...new Set([...aromas, "toast", "crumb", "ferment", "caramel", "root", "leaf", "spice"])].slice(0, 6);
			}
			if (!seeds) return null;
			catalogue[id] = {
				seeds,
				prepared,
				methods: prepared ? ["capture", "balanced"] : ["capture", "balanced", "deep"],
				kind: prepared
					? "reconstructed accord"
					: ["meat", "seafood"].includes(item.category) || seeds.includes("umami")
					? "strong aromatic"
					: "natural aromatic",
			};
			return catalogue[id];
		};
		for (const id of Object.keys(setup.foodstuff)) build(id);
		return catalogue;
	}
	function puzzle(id) {
		const entry = registry()[id];
		if (!entry) throw new Error("This item has no supported aromatic profile.");
		return entry.seeds.map((name, i) => {
			const d = facets[name];
			return {
				name,
				family: d[0],
				intensity: d[1],
				volatility: d[2],
				persistence: d[3],
				sweet: d[4],
				fresh: d[5],
				earth: d[6],
				unpleasant: ["sharp", "ferment"].includes(name),
				neighbours: [(i + 1) % 6, (i + 5) % 6],
			};
		});
	}
	function calculate(id, method, mask, finish) {
		const entry = registry()[id];
		const m = setup.perfumeryModel;
		if (!entry || !entry.methods.includes(method) || !Number.isInteger(mask) || mask < 1 || mask > 63 || !["purity", "yield", "stability"].includes(finish))
			throw new Error("Choose a supported approach, fragments, and finish.");
		const fragments = puzzle(id);
		const selected = fragments.filter((_, i) => mask & (1 << i));
		if (selected.length < 2) throw new Error("Keep at least two connected ideas in the scent.");
		const totals = { volatility: 0, persistence: 0, sweet: 0, fresh: 0, earth: 0 };
		const families = {};
		let weight = 0;
		let tension = 0;
		let links = 0;
		for (let i = 0; i < fragments.length; i++) {
			if (!(mask & (1 << i))) continue;
			const f = fragments[i];
			let support = 1;
			for (const j of f.neighbours) {
				const compatibility = m.compatibility(f.family, fragments[j].family);
				if (mask & (1 << j)) {
					support += (compatibility - 0.5) * 0.25;
					tension += 1 - compatibility;
					links++;
				} else support -= compatibility * 0.13;
			}
			const response = method === "capture" ? 0.5 + f.volatility : method === "deep" ? 0.5 + f.persistence : 1;
			const w = f.intensity * support * response * (finish === "purity" && f.unpleasant ? 0.55 : 1);
			weight += w;
			families[f.family] = (families[f.family] || 0) + w;
			for (const key of Object.keys(totals)) totals[key] += w * f[key];
		}
		for (const key of Object.keys(totals)) totals[key] /= weight;
		for (const family of Object.keys(families)) families[family] /= weight;
		const family = Object.keys(families).sort((a, b) => families[b] - families[a])[0];
		const purity = m.clamp(0.63 + (finish === "purity" ? 0.22 : 0) - (links ? tension / links : 0.3) * 0.2, 0.3, 0.98);
		const stability = m.clamp(0.4 + totals.persistence * 0.3 + (finish === "stability" ? 0.25 : 0) - totals.volatility * 0.12, 0.25, 0.95);
		const yieldUnits = Math.max(1, Math.floor((methods[method].yield * selected.length) / 6 + (finish === "yield" ? 2 : 0) - (finish === "purity" ? 1 : 0)));
		const strength = m.clamp((weight / selected.length) * (finish === "yield" ? 0.72 : 1) * (0.7 + purity * 0.3), 0.35, 1.9);
		totals.persistence *= 0.7 + stability * 0.3;
		const key =
			method === "balanced" && mask === 63 && finish === "stability" && Object.hasOwn(m.ingredients, id) ? id : `aroma~${id}~${method}~${mask}~${finish}`;
		const affinity = totals.volatility > 0.65 ? "top" : totals.persistence > 0.65 ? "base" : "heart";
		const properties = {
			...totals,
			family,
			families,
			intensity: strength,
			affinity,
			human: m.clamp(0.7 - (families.sulphurous || 0) - (families.fermented || 0) * 0.6, -0.5, 0.9),
			animal: m.clamp(totals.sweet * 0.6 + totals.earth * 0.3, -0.4, 1),
			purity,
			stability,
		};
		// The standard reference extract preserves released formula-v1 properties exactly.
		if (key === id) Object.assign(properties, m.ingredients[id], { families: { [m.ingredients[id].family]: 1 } });
		return {
			version: 1,
			key,
			source: id,
			method,
			mask,
			finish,
			selected: fragments.filter((_, i) => mask & (1 << i)).map(f => f.name),
			families: properties.families,
			volatility: properties.volatility,
			affinity: properties.affinity,
			purity,
			yield: yieldUnits,
			stability,
			strength: properties.intensity,
			properties,
			minutes: methods[method].minutes,
		};
	}
	function resolve(key) {
		const parts = key.split("~");
		if (parts.length !== 5 || parts[0] !== "aroma") return null;
		const result = calculate(parts[1], parts[2], Number(parts[3]), parts[4]);
		return result.key === key ? result : null;
	}
	function profile(key) {
		return Object.hasOwn(setup.perfumeryModel.ingredients, key) ? calculate(key, "balanced", 63, "stability") : resolve(key);
	}
	setup.perfumeryExtraction = { registry, puzzle, calculate, resolve, profile, methods, defaults, overrides, excluded };
})();

/* globals V */
(() => {
	"use strict";
	// Translate facet names into smells for the extraction controls.
	const facetWords = {
		petal: "부드러운 꽃잎 향",
		leaf: "싱그러운 푸른 잎 향",
		pollen: "건조하고 꿀 같은 꽃가루 향",
		peel: "산뜻한 감귤 껍질 향",
		juice: "즙 많은 과일 향",
		jam: "졸인 잼 같은 과일 향",
		butter: "진한 유제품 향",
		crumb: "구운 부스러기 향",
		caramel: "캐러멜 단내",
		cocoa: "짙은 코코아 향",
		spice: "따뜻한 향신료 향",
		root: "축축한 흙내",
		umami: "감칠맛의 깊이",
		sharp: "톡 쏘는 날카로운 느낌",
		ferment: "시큼하게 발효된 느낌",
		toast: "고소하게 구운 곡물 향",
	};
	const sourceDescriptions = {
		apple: "신선한 사과는 가볍고 즙 많은 향에 단맛이 살짝 감돈다.",
		butter: "버터는 진하고 기름진 향이 나서 블렌드를 묵직하게 만들 수 있다.",
		oats: "귀리는 건조하고 곡물 같은 냄새에 은은하게 고소한 온기가 돈다.",
		cream: "크림은 부드럽고 진한 유제품 향이 나며, 덜어낼 수 있는 시큼한 기운이 섞여 있다.",
		apple_crumble: "애플 크럼블은 구운 사과와 버터 향 나는 부스러기 냄새가 나며, 따뜻하고 달콤하다.",
		pastry: "페이스트리는 버터, 구운 반죽, 살짝 구운 부스러기 냄새가 난다.",
		honey: "꿀은 진득한 단맛에 꽃과 꽃가루의 부드러운 기운이 섞여 있다.",
		apple_strudel: "애플 스트루델은 즙 많은 과일과 버터 향 나는 구운 페이스트리 냄새가 난다.",
		onion: "양파에는 풀 내음, 흙내, 톡 쏘는 성분이 있어 향수를 더 감칠맛 나게 만들 수 있다.",
		garlic_bulb: "마늘은 날카롭고 톡 쏘는 냄새에 풀 내음과 흙내가 섞여 있다.",
		white_wine: "화이트 와인은 즙 많은 과일과 감귤 냄새가 나며 발효된 기운이 끝에 돈다.",
		cheese: "치즈는 진한 유제품 향에 감칠맛, 발효, 톡 쏘는 성분이 있다.",
		lemon: "레몬은 밝은 감귤 향이 나서 향수의 오프닝 노트에 잘 어울린다.",
		truffle: "송로버섯은 깊고 축축한 흙 내음이 나서 베이스 노트에서 오래 간다.",
		arancini: "아란치니는 버터 향 나는 부스러기, 풀 내음, 흙내가 난다.",
		bacon: "베이컨은 강한 감칠맛 향에 구운 냄새와 흙내가 섞여 있다.",
		shortbread: "쇼트브레드는 버터 향 나는 비스킷 냄새가 나며, 갓 구운 따뜻한 부스러기 같다.",
		cherry: "체리는 즙 많은 과일과 달콤하게 졸인 과일 냄새가 나며 풋풋하고 날카로운 기운이 살짝 있다.",
		bakewell_tart: "베이크웰 타르트는 버터 향 나는 페이스트리와 달콤한 과일 냄새가 난다.",
		banana: "바나나는 부드럽고 달콤한 과일 냄새에 풀 내음과 흙내가 섞여 있다.",
		banana_bread: "바나나 빵은 달콤한 과일과 버터 향 나는 구운 부스러기 냄새가 난다.",
		sausage: "소시지는 감칠맛 나는 향에 흙내, 구운 냄새, 톡 쏘는 성분이 섞여 있다.",
		bangers_and_mash: "뱅어스 앤 매시는 감칠맛 나는 고기와 버터 향 나는 달콤한 익힌 감자 냄새가 난다.",
		bass: "베스는 감칠맛 나는 생선 향이 나며, 덜어낼 수 있는 날카롭고 풋풋한 성분이 있다.",
		beef: "소고기는 풍성한 감칠맛 향에 구운 냄새와 흙내가 섞여 있다.",
		mushroom: "버섯은 축축한 흙 내음이 나며 감칠맛의 깊이와 희미한 발효된 기운이 있다.",
		beef_wellington: "비프 웰링턴은 감칠맛 나는 고기, 흙, 버터 향 나는 페이스트리 냄새가 난다.",
		belgian_bun: "벨지안 번은 즙 많은 과일과 따뜻하게 구운 반죽 냄새가 난다.",
		blackberry: "블랙베리는 즙 많은 과일과 잼 같은 단맛이 나며 풋풋한 기운이 있다.",
		blood_lemon: "핏빛 레몬은 밝은 감귤 껍질, 즙 많은 과일, 풋내가 약간 난다.",
		bog_orchid: "늪난초는 꽃잎과 꽃가루 냄새가 나며 풀 내음과 흙내가 섞여 있다.",
		bread: "빵은 따뜻하고 부슬부슬한 향이 나며 구운 가장자리 냄새와 버터 향이 약간 있다.",
		broccoli: "브로콜리는 푸른 채소 향이 나며 흙내와 톡 쏘는 성분이 섞여 있다.",
		chocolate: "초콜릿은 짙은 코코아, 캐러멜, 진한 버터 냄새가 난다.",
		brownie: "브라우니는 코코아, 캐러멜, 버터 향 나는 구운 부스러기 냄새가 난다.",
		cabbage: "양배추는 잎채소의 푸른 향이 나며 흙내와 톡 쏘는 기운이 약간 있다.",
		pork: "돼지고기는 감칠맛 나는 향에 구운 냄새와 흙내가 섞여 있다.",
		carbonara: "까르보나라는 유제품, 감칠맛 나는 음식, 익힌 단맛 냄새가 난다.",
		carnation: "카네이션은 꽃잎과 마른 꽃가루 냄새가 나며 풀 내음과 향신료 기운이 약간 있다.",
		wild_carrot: "야생 당근은 푸른 잎, 축축한 흙, 따뜻한 향신료 냄새가 약간 난다.",
		carrot_cake: "당근 케이크는 흙내 나는 채소, 즙 많은 과일, 버터, 캐러멜 냄새가 난다.",
		cauliflower: "콜리플라워는 풋풋하고 흙내 나는 향에 감칠맛과 톡 쏘는 성분이 섞여 있다.",
		cauliflower_cheese: "콜리플라워 치즈는 잎채소, 진한 유제품, 구운 부스러기 냄새가 난다.",
		cheese_and_crackers: "치즈와 크래커는 감칠맛 나는 유제품과 마르고 고소하게 구운 부스러기 냄새가 난다.",
		trout: "송어는 감칠맛 나는 생선 향이 나며 톡 쏘는 기운과 옅은 풋내가 있다.",
		cheese_topped_trout: "치즈 얹은 송어는 감칠맛 나는 생선과 진한 유제품 냄새가 난다.",
		tomato: "토마토는 푸른 잎과 즙 많은 과육 냄새가 나며 흙내와 감칠맛이 섞여 있다.",
		cheeseburger: "치즈버거는 감칠맛 나게 익힌 고기, 유제품, 구운 빵 냄새가 난다.",
		chelsea_bun: "첼시 번은 버터 향 나는 반죽과 캐러멜 냄새가 나며 구운 기운이 끝에 돈다.",
		chicken: "닭고기는 감칠맛 나는 향에 구운 냄새, 흙내, 날카로운 성분이 섞여 있다.",
		naan_bread: "난은 부드럽게 구운 반죽 향이 나며 버터와 고소하게 구운 기운이 약간 있다.",
		chicken_tikka_masala: "치킨 티카 마살라는 감칠맛 나는 음식, 풋내, 고소하게 구운 온기가 난다.",
		chilli_pepper: "고추는 푸른 잎, 따뜻한 향신료, 흙 냄새가 난다.",
		chicken_vindaloo: "치킨 빈달루는 감칠맛과 구운 냄새가 나며 풀 내음과 흙내가 섞여 있다.",
		chilli_con_carne: "칠리 콘 카르네는 감칠맛 나는 익힌 음식 향에 풋내와 흙내가 약간 있다.",
		chips: "감자튀김은 구운 가장자리, 진한 감칠맛의 온기, 흙 냄새가 난다.",
		choc_chip_cookie: "초코칩 쿠키는 버터 향 나는 부스러기, 캐러멜, 짙은 코코아 냄새가 난다.",
		chub: "처브는 감칠맛 나는 생선 향에 날카롭고 풋풋한 성분이 섞여 있다.",
		clam: "조개는 감칠맛 나는 해산물 향에 톡 쏘는 기운이 있다.",
		clam_chowder: "클램 차우더는 감칠맛 나는 해산물과 진하게 익힌 재료 냄새가 난다.",
		cloudberry: "클라우드베리는 즙 많은 과일과 잼 같은 단맛이 나며 껍질과 잎 냄새가 옅게 섞여 있다.",
		clover: "클로버는 부드러운 꽃잎, 꽃가루, 푸른 잎 냄새가 난다.",
		cocoa_powder: "코코아 가루는 짙은 코코아와 고소하게 구운 온기가 나며 건조하고 흙내 나는 기운이 있다.",
		cod: "대구는 감칠맛 나는 생선 향이 나며, 덜어낼 수 있는 날카롭고 풋풋한 성분이 있다.",
		creme_brulee: "크렘 브륄레는 진한 유제품, 캐러멜, 따뜻하게 익힌 단맛이 난다.",
		crumpet: "크럼펫은 버터 향 나는 구운 반죽, 고소하게 구운 부스러기 냄새가 나며 발효된 기운이 희미하다.",
		daffodil: "수선화는 꽃잎, 마른 꽃가루, 푸른 잎 냄새가 나며 흙내가 약간 있다.",
		daisy: "데이지는 가볍고 상쾌한 풀잎 향이 나서 오프닝 노트에 잘 어울린다.",
		date: "대추야자는 달콤하고 잼 같은 과일 냄새가 나며 풋내와 흙의 깊이가 조금 있다.",
		eel: "뱀장어는 감칠맛 나는 해산물 향이 나며 톡 쏘는 기운과 옅은 풋내가 있다.",
		fish_and_chips: "피시 앤 칩스는 감칠맛 나는 생선, 고소하게 구운 부스러기, 흙 냄새가 난다.",
		flapjack: "플랩잭은 버터 향 나는 곡물과 익힌 단맛이 나며 구운 가장자리 냄새가 있다.",
		flounder: "가자미는 감칠맛 나는 생선 향에 날카롭고 풋풋한 성분이 섞여 있다.",
		four_leaf_clover: "네잎클로버는 꽃잎, 꽃가루, 신선한 푸른 잎 냄새가 난다.",
		full_english_breakfast: "잉글리시 브렉퍼스트는 감칠맛 나는 음식과 구운 재료의 강한 냄새가 난다.",
		grayling: "사루기는 감칠맛 나는 생선 향이 나며 톡 쏘는 기운과 풋내가 약간 있다.",
		haddock: "해덕대구는 감칠맛 나는 해산물 향이 나며, 남기거나 덜어낼 수 있는 날카로운 성분이 있다.",
		hamburger: "햄버거는 감칠맛 나게 익힌 음식 냄새가 나며 구운 냄새와 흙내가 섞여 있다.",
		hen_of_the_woods: "잎새버섯은 축축한 흙 내음에 감칠맛의 깊이가 있다.",
		herring: "청어는 감칠맛 나는 생선 향이 나며 톡 쏘는 기운과 옅은 풋내가 있다.",
		hibiscus: "히비스커스는 꽃잎과 마른 꽃가루 냄새가 나며 풀 내음과 흙내가 섞여 있다.",
		honeyed_pork: "꿀 바른 돼지고기는 감칠맛 나게 익힌 고기와 꿀 냄새가 난다.",
		hot_cocoa: "핫 코코아는 코코아, 진한 단맛, 따뜻하게 익힌 재료 냄새가 난다.",
		jam: "잼은 졸인 과일과 캐러멜 냄새가 나며 껍질과 꽃 냄새가 약간 있다.",
		jammie_dodger: "잼 도저는 버터 향 나는 비스킷 부스러기와 달콤한 잼 같은 과일 냄새가 난다.",
		kedgeree: "케저리는 감칠맛 나게 익힌 음식과 버터 향 나는 부스러기 냄새가 나며 밝은 과일 기운이 약간 있다.",
		lady_orchid: "레이디 난초는 꽃잎, 꽃가루, 푸른 잎, 축축한 흙 냄새가 난다.",
		lasagne: "라자냐는 진하게 익힌 음식 향이 나며 감칠맛, 유제품, 구운 성분이 있다.",
		lemon_meringue_pie: "레몬 머랭 파이는 밝은 과일, 감귤 껍질, 버터 향 나는 익힌 단맛이 난다.",
		lemonade: "레모네이드는 즙 많은 감귤과 껍질 냄새가 나며, 덜어낼 수 있는 익힌 단맛과 발효된 기운이 있다.",
		lily: "백합은 꽃 향이 강해서 하트 노트로 잘 어울린다.",
		lime: "라임은 즙 많은 과일, 밝은 껍질, 신선한 푸른 잎 냄새가 난다.",
		linguine: "링귀네는 따뜻하게 익힌 재료 냄새가 나며 곡물과 고소하게 구운 성분이 있다.",
		lotus: "연꽃은 은은하고 상쾌한 꽃 향이 나서 하트 노트에 잘 어울린다.",
		macaroni_cheese: "마카로니 치즈는 진한 유제품 향이 나며 감칠맛과 고소하게 구운 성분이 있다.",
		mackerel: "고등어는 감칠맛 나는 생선 향이 나며 톡 쏘는 기운과 발효된 기운이 있다.",
		marsh_saxifrage: "습지 범의귀는 꽃잎과 꽃가루 냄새가 나며 풀 내음과 흙내가 섞여 있다.",
		melting_moment: "멜팅 모먼트는 버터 향 나는 비스킷 부스러기와 따뜻하게 익힌 단맛이 난다.",
		mince_pie: "민스 파이는 달콤한 과일과 버터 향 나는 페이스트리 냄새가 나며 구운 기운이 끝에 돈다.",
		omelette: "오믈렛은 진하게 익힌 음식 냄새가 나며 버터와 구운 성분이 있다.",
		onion_bhaji: "양파 바지는 풀 내음과 흙내가 나는, 따뜻하게 익힌 채소 같은 냄새가 난다.",
		orange: "오렌지는 달콤한 감귤 향이 처음에는 밝지만 금세 사라진다.",
		orange_juice: "오렌지 주스는 즙 많은 과일, 감귤 껍질, 익힌 단맛이 난다.",
		orchid: "난초는 진한 꽃 향과 흙내가 나서 베이스 노트에서 오래 간다.",
		pansy: "팬지는 꽃잎, 마른 꽃가루, 푸른 잎 냄새가 난다.",
		peach: "복숭아는 부드럽고 달콤한 과일 향이 나서 향수의 하트에 잘 어울린다.",
		peach_panzanella: "복숭아 판자넬라는 즙 많은 과일과 따뜻하고 곡물 같은 익힌 음식 냄새가 난다.",
		pear: "배는 즙 많은 과일과 부드러운 단맛이 나며 풋내의 깊이가 조금 있다.",
		pepper: "피망은 풀 내음과 향신료 기운이 있으며 흙내 나고 감칠맛 나는 냄새가 난다.",
		perch: "퍼치는 감칠맛 나는 생선 향이 나며, 덜어낼 수 있는 날카롭고 풋풋한 성분이 있다.",
		pike: "꼬치고기는 감칠맛 나는 해산물 향이 나며 톡 쏘는 기운과 흙내가 있다.",
		pink_rose: "분홍 장미는 꽃잎, 꽃가루, 푸른 잎, 흙 냄새가 난다.",
		pizza: "피자는 진하게 익힌 음식 향이 나며 감칠맛 나는 재료와 고소하게 구운 반죽 냄새가 난다.",
		plum: "자두는 즙 많은 과일과 잼 같은 단맛이 나며 흙의 깊이가 조금 있다.",
		plum_pudding: "자두 푸딩은 달콤한 과일과 따뜻하게 익힌 재료 냄새가 난다.",
		plumeria: "플루메리아는 달콤하고 진한 꽃 향이 나서 향수의 베이스에서 오래 간다.",
		red_wine: "레드 와인은 잼 같은 과일과 꽃 냄새가 나며 발효된 기운이 끝에 돈다.",
		poached_pear: "와인에 졸인 배는 즙 많은 과일과 따뜻하게 익힌 단맛이 난다.",
		porridge: "포리지는 부드러운 곡물 향이 나며 살짝 구운 성분과 흙내가 있다.",
		potato_pancake: "감자 팬케이크는 흙내 나는 채소와 따뜻하고 고소하게 구운 부스러기 냄새가 난다.",
		prawn: "새우는 감칠맛 나는 해산물 향이 나며 날카롭고 풋풋한 기운이 있다.",
		prawn_bisque: "새우 비스크는 감칠맛 나는 해산물과 진하고 따뜻하게 익힌 음식 냄새가 난다.",
		primrose: "프림로즈는 꽃잎, 마른 꽃가루, 푸른 잎 냄새가 난다.",
		pumpkin: "호박은 풋풋하고 흙내가 나며 따뜻한 향신료 기운이 조금 있다.",
		pumpkin_drink: "호박 음료에는 남길 수 있는 풋풋하고 흙내 나는 성분과 익힌 단맛이 있다.",
		pumpkin_pie: "호박 파이는 흙내 나는 채소, 버터 향 나는 페이스트리, 익힌 단맛이 난다.",
		quiche: "키시는 진하게 익힌 재료와 버터 향 나는 고소하게 구운 페이스트리 냄새가 난다.",
		red_helleborine: "붉은 헬레보린은 꽃잎과 꽃가루 냄새가 나며 풀 내음과 흙내가 있다.",
		red_rose: "붉은 장미는 부드럽고 달콤한 꽃 향이 나서 블렌드의 하트에 잘 어울린다.",
		rich_biscuit: "리치 비스킷은 고소하게 구운 부스러기와 익힌 단맛이 나며 과일 기운이 있다.",
		roach: "로치는 감칠맛 나는 생선 향에 톡 쏘는 성분과 풋풋한 성분이 섞여 있다.",
		yorkshire_pudding: "요크셔 푸딩은 버터 향 나는 구운 반죽 냄새가 나며 구운 가장자리 냄새가 있다.",
		stuffing: "스터핑은 곡물, 구운 냄새, 흙내가 나며 익힌 재료와 비슷하다.",
		turnip: "순무는 푸른 채소 향이 나며 흙내, 감칠맛, 날카로운 성분이 있다.",
		roast_dinner: "로스트 디너는 감칠맛 나는 음식, 고소하게 구운 곡물, 진하게 익힌 재료 냄새가 난다.",
		spinach: "시금치는 잎채소의 푸른 향이 나며 축축한 흙내와 감칠맛이 약간 있다.",
		salad: "샐러드는 신선한 푸른 잎과 즙 많은 과일 냄새가 나며 흙내가 있다.",
		salmon: "연어는 감칠맛 나는 생선 향이 나며, 덜어낼 수 있는 날카롭고 발효된 성분이 있다.",
		salmon_wellington: "연어 웰링턴은 감칠맛 나는 생선, 버터 향 나는 페이스트리, 흙 냄새가 난다.",
		samosa: "사모사는 버터 향 나는 익힌 재료 냄새가 나며 풋내, 흙내, 즙 많은 성분이 있다.",
		sausage_roll: "소시지 롤은 감칠맛 나는 고기, 고소하게 구운 페이스트리, 버터 냄새가 난다.",
		scone: "스콘은 버터 향 나는 구운 부스러기 냄새가 나며 고소하게 구운 기운과 희미한 발효된 기운이 있다.",
		scottish_bog_myrtle: "스코틀랜드 보그머틀은 따뜻한 향신료, 푸른 잎, 부드러운 꽃 냄새가 난다.",
		small_bass: "작은 베스는 감칠맛 나는 해산물 향이 나며, 덜어낼 수 있는 날카롭고 풋풋한 성분이 있다.",
		small_carp: "작은 잉어는 감칠맛 나는 생선 향이 나며 톡 쏘는 기운과 흙내가 있다.",
		small_herring: "작은 청어는 감칠맛 나는 해산물 향이 나며 날카로운 기운과 풋풋한 성분이 있다.",
		small_trout: "작은 송어는 감칠맛 나는 생선 향에 날카롭고 풋풋한 성분이 섞여 있다.",
		souffle: "수플레는 진한 유제품 향이 나며 익힌 단맛과 버터 향 나는 부스러기 냄새가 있다.",
		spaghetti_bolognese: "스파게티 볼로네제는 감칠맛 나는 음식, 흙내 나는 채소, 고소하게 구운 온기가 난다.",
		spiked_rampion: "스파이크 램피언은 꽃잎, 마른 꽃가루, 잎, 흙 냄새가 난다.",
		sponge_cake: "스펀지 케이크는 버터 향 나는 부스러기, 익힌 단맛, 과일 냄새가 난다.",
		steak: "스테이크는 강한 감칠맛 향에 구운 냄새와 흙내가 섞여 있다.",
		sticky_toffee_pudding: "스티키 토피 푸딩은 달콤한 과일, 버터, 캐러멜, 고소하게 구운 부스러기 냄새가 난다.",
		strawberry: "딸기는 즙 많은 과일과 잼 같은 단맛이 나며 신선하고 풋풋한 기운이 있다.",
		stuffed_pumpkin: "속을 채운 호박은 흙내 나는 채소, 감칠맛 나는 음식, 진하게 익힌 단맛이 난다.",
		sunflower: "해바라기는 꽃잎, 마른 꽃가루, 푸른 잎, 흙 냄새가 난다.",
		sweet_and_sour_chicken: "스위트 앤 사워 치킨은 감칠맛 나게 익힌 음식 냄새가 나며 풋내와 흙내가 있다.",
		swiss_roll: "스위스 롤은 버터 향 나는 케이크 부스러기와 달콤한 잼 같은 과일 냄새가 난다.",
		tart: "타르트는 버터 향 나는 부스러기, 코코아, 익힌 단맛이 나며 구운 가장자리 냄새가 있다.",
		tulip: "튤립은 신선한 풀잎 향과 부드러운 꽃 향이 있어 하트 노트에 잘 어울린다.",
		turnip_soup: "순무 수프는 풋풋하고 흙내가 나며 고소하게 구운 곡물의 온기가 있다.",
		valentines_chocolate: "발렌타인 초콜릿은 코코아, 버터 향 나는 부스러기, 고소하게 구운 단맛이 난다.",
		white_rose: "하얀 장미는 가볍고 상쾌한 꽃 향이 나서 하트 노트에 잘 어울린다.",
		whiting: "민대구는 감칠맛 나는 생선 향에 날카롭고 풋풋한 기운이 있다.",
		wild_honeycomb: "야생 벌집은 깊고 오래가는 단맛에 흙내가 약간 섞여 있다.",
	};
	function description(key, profile = key.startsWith("aroma~") ? setup.perfumeryExtraction.resolve(key) : null) {
		if (profile && key.startsWith("aroma~")) {
			const parts = profile.selected.map(part => facetWords[part]);
			const scents = `${parts.slice(0, -1).join(", ")}${parts.length > 2 ? ", and " : " and "}${parts.at(-1)}`;
			return `이 ${setup.foodstuff[profile.source]?.name || profile.source} 추출물은 ${scents}【을를】 간직한다.`;
		}
		return sourceDescriptions[key] || `당신은 ${setup.foodstuff[key]?.name || key}의 향을 각각의 성분으로 나눌 수 있다.`;
	}
	const kindWords = {
		"자연 그대로의 향": "Natural scent",
		"강한 향": "Strong scent",
		"reconstructed accord": "재료로 되살린 조리 음식",
	};
	const methodHelp = {
		capture: "재료에서 빨리 날아가는 가벼운 향 성분을 모읍니다. 이 방식은 보통 모이는 계량이 더 적습니다.",
		balanced: "가벼운 성분과 무거운 성분에 똑같이 신경 쓰며 향을 분리합니다.",
		deep: "피부에 더 오래 남는 무거운 성분을 더 많이 모읍니다. 익히지 않은 재료에만 쓸 수 있습니다.",
	};
	const finishHelp = [
		["stability", "향을 오래 유지", "향의 균형을 지키고 무거운 성분이 더 오래 남도록 돕습니다."],
		["purity", "거친 부분 완화", "자극이 덜하고 더 선명한 향을 모읍니다. 보통 계량 하나를 희생합니다."],
		["yield", "아로마 더 모으기", "계량을 두 개 더 모으지만, 각 계량의 향은 더 부드러워집니다."],
	];
	const word = (n, steps) => steps.find(([limit]) => n < limit)?.[1] ?? steps[steps.length - 1][1];
	const cap = s => s[0].toUpperCase() + s.slice(1);
	function mount(parent, signal, changed, options = {}) {
		const api = setup.perfumery;
		const engine = setup.perfumeryExtraction;
		const m = setup.perfumeryModel;
		const e = api.state().extraction;
		const catalogue = engine.registry();
		const host = document.createElement("div");
		host.className = "perf-extraction";
		parent.append(host);
		const el = (tag, text, into = host, cls) => {
			const n = document.createElement(tag);
			if (text !== undefined) n.textContent = text;
			if (cls) n.className = cls;
			into.append(n);
			return n;
		};
		const button = (label, action, into, key, cls) => {
			const n = el("button", label, into, cls);
			n.type = "button";
			n.dataset.exAction = action;
			if (key !== undefined) n.dataset.exKey = key;
			return n;
		};
		const have = id => V.foodstuff[id]?.amount || 0;
		const name = id => setup.foodstuff[id]?.name || id;
		const owned = () =>
			Object.keys(catalogue)
				.filter(id => have(id) > 0)
				.sort((a, b) => have(b) - have(a) || name(a).localeCompare(name(b)));
		let source = owned()[0] || null;
		let method = "balanced";
		let finish = "stability";
		let mask = 63;
		let serial = e.serial;
		let result = null;
		let page = 0;
		let feedback = "";

		const pick = el("section", undefined, host, "perf-ex-step");
		const facets = el("section", undefined, host, "perf-ex-step");
		const finishBox = el("section", undefined, host, "perf-ex-step perf-ex-finish");
		const book = el("details", undefined, host, "perf-extraction-book");
		el("summary", "저장한 레시피와 보관한 아로마", book);
		const entries = el("div", undefined, book);

		function renderPick() {
			pick.replaceChildren();
			el("h4", "1. 재료 고르기", pick);
			const list = owned();
			if (!list.length) {
				el(
					"p",
					"아로마로 만들 수 있는 것이 없습니다. 정원의 꽃과 대부분의 음식이 쓸 만합니다. 재료가 생기면 다시 오십시오.",
					pick,
					"perf-empty"
				);
				return;
			}
			const ul = el("ul", undefined, pick, "perf-tiles");
			const pages = Math.ceil(list.length / 9);
			page = Math.min(page, pages - 1);
			for (const id of list.slice(page * 9, page * 9 + 9)) {
				const li = el("li", undefined, ul);
				const b = button("", "source", li, id, "perf-tile");
				b.setAttribute("aria-pressed", String(id === source));
				b.disabled = !!result;
				b.title = kindWords[catalogue[id].kind] || catalogue[id].kind;
				const item = setup.foodstuff[id];
				if (V.options.images && item) {
					const icon = el("img", undefined, b, "icon");
					icon.src = `img/misc/icon/${item.icon_path || "tending/" + item.icon}`;
					icon.alt = "";
				}
				el("strong", cap(name(id)), b);
				el("small", `재고 ${have(id)}개`, b);
			}
			if (pages > 1) {
				const nav = el("div", undefined, pick, "perf-pager");
				button("Previous", "page", nav, "-1").disabled = page === 0;
				el("span", `${page + 1} of ${pages}`, nav);
				button("Next", "page", nav, "1").disabled = page >= pages - 1;
			}
		}

		function profileBars(into, now, before) {
			const rows = el("ul", undefined, into, "perf-profile");
			const families = [...new Set([...Object.keys(before), ...Object.keys(now)])].sort((a, b) => (before[b] || 0) - (before[a] || 0));
			for (const f of families) {
				const n = Math.round((now[f] || 0) * 100);
				const was = Math.round((before[f] || 0) * 100);
				const li = el("li", undefined, rows);
				el("span", cap(f), li);
				const bar = el("span", undefined, li, "perf-bar");
				bar.setAttribute("aria-hidden", "true");
				el("i", undefined, bar).style.width = `${n}%`;
				el("b", undefined, bar).style.left = `${was}%`;
				el("small", n === was ? `${n}%` : `${n}% (was ${was}%)`, li);
			}
		}

		function renderFacets() {
			facets.replaceChildren();
			if (!source) return;
			el("h4", `2. ${name(source)} 향의 일부를 남기거나 빼기`, facets);
			el("p", description(source), facets, "perf-source-description");
			el(
				"p",
				"빼고 싶은 향 성분을 선택하면 제외되고, 다시 선택하면 남습니다. 최소 두 개는 남겨야 합니다. 이웃한 성분끼리는 서로 돕거나 부딪칠 수 있습니다.",
				facets,
				"perf-hint"
			);
			const parts = engine.puzzle(source);
			const grid = el("div", undefined, facets, "perf-facets");
			parts.forEach((f, i) => {
				const kept = !!(mask & (1 << i));
				const b = button("", "fragment", grid, String(i), "perf-facet");
				b.setAttribute("aria-pressed", String(kept));
				b.disabled = !!result;
				el("strong", cap(f.name), b);
				el("span", facetWords[f.name] || f.family, b);
				el("b", kept ? "Keeping" : "Removed", b, "perf-facet-state");
				el("small", `${f.unpleasant ? "거침 · " : ""}이웃: ${f.neighbours.map(j => parts[j].name).join(", ")}`, b);
			});
			const live = el("p", feedback, facets, "perf-facet-detail");
			live.setAttribute("aria-live", "polite");
		}

		function renderFinish() {
			finishBox.replaceChildren();
			if (!source) return;
			if (result) {
				const done = el("div", undefined, finishBox, "perf-ex-done");
				const vial = el("div", undefined, done, "perf-extract-vessel perf-condensed");
				vial.setAttribute("aria-hidden", "true");
				vial.style.setProperty("--extract-fill", `${Math.min(100, result.yield * 14)}%`);
				const text = el("div", undefined, done);
				el("h4", `${name(result.source)} 아로마 ${result.yield}${result.yield === 1 ? "계량" : "계량"} 수집 완료`, text);
				el("p", description(result.key, result), text);
				el(
					"p",
					`이 아로마는 ${({ top: "오프닝", heart: "하트", base: "베이스" })[result.affinity] || result.affinity} 노트에 어울립니다. 모으는 데 재고에서 재료 하나를 썼습니다.`,
					text
				);
				if (V.perfumeryVenue === "poppy" && api.availableTeacher())
					el(
						"p",
						result.properties.family === "roasted"
							? '포피가 냄새를 두 번 맡는다. "어두운 쪽을 남겼네. 난 단맛을 예상했는데."'
							: result.properties.families.sulphurous > 0.15
							? '포피가 몸을 뒤로 물렸다가 시향지를 팔 길이만큼 떨어뜨려 다시 맡아 본다. "이건 공간이 필요해. 네가 뭘 하려던 건지 알기 전까진 실패라고 부르지 마."'
							: result.properties.sweet > 0.6
							? '"그 부분은 나라면 남겼을 거야." 포피가 말한다. "이제 꽃 옆에 둬 보고 더 필요한지 정해."'
							: '포피가 시향지를 노트 옆으로 옮긴다. "일부러 뭔가 빼놨네. 그게 어떤 자리를 만들었는지 보여 줘."',
						text,
						"perf-poppy"
					);
				const row = el("div", undefined, finishBox, "perf-steps");
				button("향수에 사용", "done", row, undefined, "perf-primary");
				button("하나 더 준비", "next", row);
				if (!e.profiles.some(p => p.key === result.key)) button("레시피 저장", "save", row);
				return;
			}
			el("h4", "3. 아로마 모으기", finishBox);
			let p;
			try {
				p = engine.calculate(source, method, mask, finish);
			} catch (error) {
				el("p", error.message, finishBox, "perf-missing");
				return;
			}
			const full = engine.calculate(source, method, 63, finish);
			el("p", "채워진 막대는 남기기로 한 향을, 가는 표시는 성분을 빼기 전 재료 전체의 향을 나타냅니다.", finishBox, "perf-hint");
			profileBars(finishBox, p.families, full.families);
			const facts = el("dl", undefined, finishBox, "perf-facts");
			const fact = (k, v) => {
				el("dt", k, facts);
				el("dd", v, facts);
			};
			fact(
				"모은 양",
				`아로마 ${p.yield}${p.yield === 1 ? "계량" : "계량"}. 계량은 제작 단위 하나이며, 구성 단계에서 한 번 선택할 때마다 하나씩 더해집니다.`
			);
			fact("가장 어울리는 노트", `이 아로마는 ${({ top: "오프닝", heart: "하트", base: "베이스" })[p.affinity] || p.affinity} 노트에 가장 어울리지만, 어느 노트에든 넣을 수 있습니다.`);
			fact(
				"Clarity",
				word(p.purity, [
					[0.55, "흐릿함: 성분을 구별하기 어렵습니다."],
					[0.75, "꽤 선명함: 주된 성분을 가려낼 수 있습니다."],
					[Infinity, "매우 선명함: 각 성분이 깔끔하게 드러납니다."],
				])
			);
			fact(
				"Stability",
				word(p.stability, [
					[0.5, "오래 숙성하면 이 아로마에서 불쾌한 냄새가 날 가능성이 높습니다."],
					[0.7, "향수가 숙성되는 동안 이 아로마는 보통 정도로 변합니다."],
					[Infinity, "향수가 숙성되는 동안 이 아로마는 덜 변합니다."],
				])
			);
			fact("비용", `${name(source)} 1개(보유 ${have(source)}개)와 ${p.minutes}분이 듭니다.`);
			const go = button(`아로마 모으기 (${p.minutes}분)`, "collect", finishBox, undefined, "perf-primary perf-big");
			go.disabled = have(source) < 1;
			const adv = el("details", undefined, finishBox, "perf-advanced");
			adv.open = options.advanced || method !== "balanced" || finish !== "stability";
			el("summary", "방식과 마감 (선택)", adv);
			const fs1 = el("fieldset", undefined, adv, "perf-options");
			el("legend", "Method", fs1);
			for (const id of catalogue[source].methods) {
				const lab = el("label", undefined, fs1, "perf-option");
				const r = el("input", undefined, lab);
				Object.assign(r, { type: "radio", name: "perf-ex-method", value: id, checked: method === id });
				r.dataset.exField = "method";
				const body = el("span", undefined, lab);
				el("strong", `${engine.methods[id].name} (${engine.methods[id].minutes} min)`, body);
				el("small", methodHelp[id], body);
			}
			const fs2 = el("fieldset", undefined, adv, "perf-options");
			el("legend", "Finish", fs2);
			for (const [id, label, help] of finishHelp) {
				const lab = el("label", undefined, fs2, "perf-option");
				const r = el("input", undefined, lab);
				Object.assign(r, { type: "radio", name: "perf-ex-finish", value: id, checked: finish === id });
				r.dataset.exField = "finish";
				const body = el("span", undefined, lab);
				el("strong", label, body);
				el("small", help, body);
			}
			if (options.advanced)
				el("small", `순도 ${Math.round(p.purity * 100)}%, 안정성 ${Math.round(p.stability * 100)}%, 강도 ${p.strength.toFixed(2)}.`, adv, "perf-hint");
		}

		function renderBook() {
			entries.replaceChildren();
			if (!book.open) return;
			el("p", `Practice ${e.practice}/100. Make a saved recipe twice to unlock Quick extraction.`, entries);
			if (!e.profiles.length && !Object.keys(e.stock).length) el("p", "아직 저장한 것이 없습니다.", entries);
			for (const profile of e.profiles) {
				const p = engine.profile(profile.key);
				const row = el("div", undefined, entries, "perf-book-row");
				el("p", `${profile.name}: ${p.selected.join(", ")}. Made ${profile.runs} ${profile.runs === 1 ? "time" : "times"}.`, row);
				const actions = el("div", undefined, row, "perf-steps");
				button("다시 설정", "repeat", actions, profile.key);
				if (profile.runs >= 2) button("빠른 추출", "quick", actions, profile.key).disabled = !!result;
				button("Forget", "forget", actions, profile.key);
			}
			for (const [key, amount] of Object.entries(e.stock)) {
				const row = el("div", undefined, entries, "perf-book-row");
				el("span", `${m.name(key)}: ${amount} ${amount === 1 ? "measure" : "measures"}. `, row);
				button("쏟아 버리기", "discard", row, key);
			}
		}
		book.ontoggle = renderBook;

		function render() {
			renderPick();
			renderFacets();
			renderFinish();
			renderBook();
		}
		function choose(id) {
			source = id;
			method = catalogue[id].methods.includes(method) ? method : "balanced";
			mask = 63;
			feedback = "";
		}
		function toggled(i) {
			const parts = engine.puzzle(source);
			const f = parts[i];
			const kept = !!(mask & (1 << i));
			const near = f.neighbours.filter(j => mask & (1 << j)).map(j => parts[j]);
			const clash = near.filter(n => m.compatibility(f.family, n.family) < 0.5).map(n => n.name);
			const support = near.filter(n => m.compatibility(f.family, n.family) >= 0.5).map(n => n.name);
			feedback = kept
				? `남긴 성분: ${f.name}.${support.length ? ` ${support.join(" 및 ")}에 힘이 됩니다.` : ""}${
						clash.length ? ` 부딪치는 성분: ${clash.join(" 및 ")}. 결과가 덜 선명해집니다.` : ""
				  }`
				: `뺀 성분: ${f.name}.${support.length ? ` ${cap(support.join(" 및 "))} 쪽 뒷받침이${support.length > 1 ? "" : ""} 조금 줄어듭니다.` : ""}${
						clash.length ? ` ${cap(clash.join(" 및 "))} 쪽과 더는 부딪치지 않아${clash.length > 1 ? "" : ""} 나머지가 더 선명해집니다.` : ""
				  }`;
		}
		function collected(p) {
			result = p;
			render();
			changed();
			host.querySelector(".perf-ex-done h4")?.setAttribute("tabindex", "-1");
			host.querySelector(".perf-ex-done h4")?.focus({ preventScroll: false });
		}
		host.addEventListener(
			"click",
			event => {
				const b = event.target.closest("button[data-ex-action]");
				if (!b || !host.contains(b) || b.disabled) return;
				const action = b.dataset.exAction;
				const key = b.dataset.exKey;
				let focus = null;
				try {
					if (action === "source" && !result) {
						choose(key);
						focus = `[data-ex-action="source"][data-ex-key="${CSS.escape(key)}"]`;
					}
					if (action === "page") page += Number(key);
					if (action === "fragment" && !result) {
						const next = mask ^ (1 << Number(key));
						const left = [0, 1, 2, 3, 4, 5].filter(i => next & (1 << i)).length;
						if (left < 2) feedback = "최소 두 성분은 남겨야 합니다. 아로마를 붙잡아 줄 무언가가 필요합니다.";
						else {
							mask = next;
							toggled(Number(key));
						}
						focus = `[data-ex-action="fragment"][data-ex-key="${key}"]`;
					}
					if (action === "collect" && !result) {
						b.disabled = true;
						return collected(api.extract(source, method, mask, finish, serial));
					}
					if (action === "next") {
						serial = e.serial;
						result = null;
						if (have(source) < 1) source = owned()[0] || null;
						feedback = "";
					}
					if (action === "done") return changed("notes");
					if (action === "save" && result) api.saveExtraction(result.key);
					if (action === "repeat" || action === "quick") {
						const p = engine.profile(key);
						serial = e.serial;
						result = null;
						choose(p.source);
						method = p.method;
						mask = p.mask;
						finish = p.finish;
						if (action === "quick") return collected(api.extract(p.source, p.method, p.mask, p.finish, serial, true));
						focus = '[data-ex-action="collect"]';
					}
					if (action === "forget") e.profiles = e.profiles.filter(p => p.key !== key);
					if (action === "discard") {
						delete e.stock[key];
						changed();
					}
					render();
					if (focus) host.querySelector(focus)?.focus({ preventScroll: true });
				} catch (error) {
					feedback = error.message;
					render();
				}
			},
			{ signal }
		);
		host.addEventListener(
			"change",
			event => {
				const field = event.target.dataset.exField;
				if (!field) return;
				if (field === "method") method = event.target.value;
				if (field === "finish") finish = event.target.value;
				render();
				host.querySelector(`[name="${event.target.name}"][value="${event.target.value}"]`)?.focus({ preventScroll: true });
			},
			{ signal }
		);
		render();
		return {
			choose(id) {
				if (!catalogue[id] || result) return;
				choose(id);
				render();
				host.querySelector(`[data-ex-action="source"][data-ex-key="${CSS.escape(id)}"]`)?.focus({ preventScroll: true });
			},
		};
	}
	setup.perfumeryExtractionUI = { mount, description };
})();
