/* Pure, versioned fragrance model. Measures are fictional game units, not chemistry. */
(() => {
	"use strict";
	const materials = {
		// family, intensity, volatility, persistence, affinity, sweetness, freshness, earthiness, human, wildlife
		red_rose: ["floral", 1.2, 0.5, 0.6, "heart", 0.6, 0.3, 0.1, 0.8, 0.2],
		white_rose: ["floral", 0.8, 0.6, 0.5, "heart", 0.3, 0.7, 0.1, 0.7, 0.1],
		orchid: ["floral", 1.4, 0.3, 0.8, "base", 0.5, 0.1, 0.5, 0.8, 0.3],
		daisy: ["green", 0.6, 0.8, 0.2, "top", 0.1, 0.9, 0.3, 0.3, -0.2],
		tulip: ["green", 0.9, 0.6, 0.4, "heart", 0.1, 0.7, 0.4, 0.3, -0.2],
		lotus: ["floral", 0.8, 0.4, 0.7, "heart", 0.3, 0.8, 0.2, 0.7, -0.1],
		lily: ["floral", 1.7, 0.5, 0.7, "heart", 0.4, 0.3, 0.2, 0.9, 0.4],
		orange: ["citrus", 1.1, 0.9, 0.2, "top", 0.7, 0.8, 0, 0.6, 0.3],
		lemon: ["citrus", 1.3, 1, 0.15, "top", 0.1, 1, 0, 0.5, -0.4],
		apple: ["fruit", 0.7, 0.8, 0.3, "top", 0.7, 0.6, 0.1, 0.5, 0.6],
		peach: ["fruit", 1, 0.7, 0.4, "heart", 0.9, 0.3, 0.1, 0.7, 0.7],
		wild_honeycomb: ["sweet", 1.5, 0.2, 0.9, "base", 1, 0, 0.3, 0.6, 1],
		truffle: ["earthy", 1.9, 0.15, 1, "base", 0, 0, 1, -0.5, 0.9],
		plumeria: ["floral", 1.3, 0.4, 0.8, "base", 0.8, 0.3, 0.2, 0.8, 0.4],
	};
	const ingredients = Object.fromEntries(
		Object.entries(materials).map(([id, d]) => [
			id,
			{
				family: d[0],
				intensity: d[1],
				volatility: d[2],
				persistence: d[3],
				affinity: d[4],
				sweet: d[5],
				fresh: d[6],
				earth: d[7],
				human: d[8],
				animal: d[9],
			},
		])
	);
	const solvents = {
		soft: { name: "조향용 소프트 스피릿", purity: 0.45, projection: 0.8, evaporation: 0.75, cost: 20 },
		clear: { name: "조향용 클리어 스피릿", purity: 0.75, projection: 1.1, evaporation: 1, cost: 30 },
		bright: { name: "조향용 브라이트 스피릿", purity: 0.95, projection: 1.35, evaporation: 1.3, cost: 40 },
	};
	const layers = ["top", "heart", "base"];
	const clamp = (n, a, b) => Math.max(a, Math.min(b, n));
	const copy = x => JSON.parse(JSON.stringify(x));
	function material(id) {
		return Object.hasOwn(ingredients, id) ? ingredients[id] : setup.perfumeryExtraction?.resolve(id)?.properties;
	}
	function source(id) {
		return id.startsWith("aroma~") ? id.split("~")[1] : id;
	}
	function name(id) {
		const base = setup.foodstuff[source(id)]?.name || source(id);
		if (!id.startsWith("aroma~")) return base;
		const p = setup.perfumeryExtraction.resolve(id);
		return `${base}: ${p.selected.slice(0, 2).join(" / ")} (${p.finish})`;
	}
	function validate(f) {
		if (
			!f ||
			f.version !== 1 ||
			!Object.keys(solvents).includes(f.solvent) ||
			![20, 40, 60].includes(f.capacity) ||
			!Number.isFinite(f.concentration) ||
			f.concentration < 10 ||
			f.concentration > 40 ||
			![0, 1, 3, 7, 14].includes(f.age)
		)
			throw new Error("Invalid liquid formulation.");
		const needed = {};
		for (const layer of layers) {
			if (!f[layer] || typeof f[layer] !== "object" || Array.isArray(f[layer])) throw new Error("Missing note layer.");
			for (const [id, n] of Object.entries(f[layer])) {
				if (!material(id) || !Number.isInteger(n) || n < 1 || n > 24) throw new Error("Invalid fragrance material quantity.");
				needed[id] = (needed[id] || 0) + n;
			}
		}
		const units = Object.values(needed).reduce((a, b) => a + b, 0);
		/* Empty notes are allowed: the imbalance term in calculate() already makes one- or two-note perfumes less balanced. */
		if (!units) throw new Error("Add at least one material.");
		const volume = (units * 100) / f.concentration;
		if (volume > f.capacity + 0.00001) throw new Error("This formula exceeds the bottle capacity. Remove material or raise concentration.");
		return { needed, units, volume, solvent: Math.ceil(volume - units) };
	}
	function compatibility(a, b) {
		if (a === b) return 0.95;
		const pair = [a, b].sort().join("/");
		return (
			{
				"citrus/floral": 0.95,
				"floral/green": 0.9,
				"floral/sweet": 0.85,
				"fruit/sweet": 0.9,
				"citrus/green": 0.9,
				"earthy/green": 0.85,
				"earthy/fruit": 0.25,
				"citrus/earthy": 0.35,
				"earthy/floral": 0.45,
			}[pair] ?? 0.7
		);
	}
	function contribution(id, layer, quantity, d = material(id)) {
		return quantity * d.intensity * (layer === "top" ? 0.75 + d.volatility * 0.5 : layer === "base" ? 0.75 + d.persistence * 0.5 : 1);
	}
	function calculate(f, blending = 0.5, age = f.age, overrides = {}) {
		const cost = validate(f);
		const s = solvents[f.solvent];
		const totals = { sweet: 0, fresh: 0, earth: 0, human: 0, animal: 0, persistence: 0, volatility: 0 };
		const family = {};
		const layerWeights = {};
		const entries = [];
		let weight = 0;
		let affinity = 0;
		for (const layer of layers) {
			layerWeights[layer] = 0;
			for (const [id, n] of Object.entries(f[layer]).sort(([a], [b]) => a.localeCompare(b))) {
				const d = overrides[id] || material(id);
				// Top placement projects volatile materials; base placement retains heavy ones.
				const w = contribution(id, layer, n, d);
				weight += w;
				layerWeights[layer] += w;
				affinity += w * (d.affinity === layer ? 1 : 0.65);
				for (const [f, share] of Object.entries(d.families || { [d.family]: 1 })) family[f] = (family[f] || 0) + w * share;
				for (const key of Object.keys(totals)) totals[key] += w * d[key];
				totals.persistence += w * (layer === "base" ? 0.25 : layer === "top" ? -0.15 : 0);
				totals.volatility += w * (layer === "top" ? 0.2 : layer === "base" ? -0.1 : 0);
				for (const [f, share] of Object.entries(d.families || { [d.family]: 1 })) entries.push({ family: f, w: w * share });
			}
		}
		for (const key of Object.keys(totals)) totals[key] /= weight;
		let harmony = 0;
		let pairs = 0;
		for (let i = 0; i < entries.length; i++)
			for (let j = i + 1; j < entries.length; j++) {
				const w = entries[i].w * entries[j].w;
				harmony += w * compatibility(entries[i].family, entries[j].family);
				pairs += w;
			}
		harmony = pairs ? harmony / pairs : 0.9;
		const idealAge = 1 + totals.persistence * 6 + totals.earth * 3;
		const maturation = (1 - Math.exp(-age / idealAge)) * 12 - Math.max(0, age - idealAge) * totals.fresh * 1.4;
		const imbalance = layers.reduce((sum, l) => sum + Math.abs(layerWeights[l] / weight - 1 / 3), 0);
		const harsh = (Math.max(0, f.concentration - 23) * s.purity * (0.3 + totals.volatility)) / (1 + age / 3);
		const quality = clamp(30 + harmony * 30 + (affinity / weight) * 12 - imbalance * 10 - harsh + maturation + clamp(blending, 0, 1) * 12, 0, 100);
		const intensity = (((weight / cost.units) * f.concentration) / 20) * s.projection * (1 + totals.volatility * 0.15);
		const duration = clamp(((70 + totals.persistence * 210) * (0.6 + f.concentration / 30)) / s.evaporation, 45, 720);
		const families = Object.keys(family).sort((a, b) => family[b] - family[a]);
		const result = {
			...totals,
			family: families[0],
			families,
			quality,
			intensity,
			duration,
			harmony,
			idealAge,
			development: Object.fromEntries(layers.map(l => [l, layerWeights[l] / weight])),
			romance: clamp(((totals.human * quality) / 100) * (1 - Math.max(0, intensity - 1.8) / 3), 0, 1),
			attention: clamp(intensity * (0.25 + totals.sweet * 0.35 + (100 - quality) / 200), 0, 2),
			concealment: clamp(totals.fresh * 0.5 + totals.earth * 0.6 - totals.sweet * 0.7, -1, 1),
			applications: Math.max(1, Math.floor(cost.volume / 4)),
			volume: cost.volume,
			colour: `hsl(${Math.round(35 + totals.fresh * 70 - totals.sweet * 25)}, 48%, ${Math.round(42 + totals.fresh * 15)}%)`,
			name: `${families[0][0].toUpperCase() + families[0].slice(1)} ${totals.fresh > totals.sweet ? "Murmur" : "Embrace"}`,
		};
		const identity = setup.perfumeryIdentity.analyze(f, result, blending, age, overrides);
		return {
			...result,
			...identity,
			name: identity.name,
			romance: identity.socialAppeal,
			attention: clamp(result.intensity * (0.25 + identity.distinctiveness / 150 + (100 - identity.pleasantness) / 250), 0, 2),
		};
	}
	function blendStep(f, stage, technique) {
		if (!Number.isInteger(stage) || stage < 0 || stage > 2 || !["fold", "circle", "rest"].includes(technique))
			throw new Error("Choose a blending technique for this stage.");
		const p = calculate(f);
		const spirit = solvents[f.solvent];
		const fit =
			technique === "fold"
				? p.volatility * 0.25 + (stage === 0 ? 0.16 : 0) - p.earth * 0.08
				: technique === "circle"
				? p.persistence * 0.22 + p.earth * 0.12 + (stage === 1 ? 0.16 : 0)
				: p.persistence * 0.12 + spirit.purity * 0.08 + (stage === 2 ? 0.2 : 0);
		const score = clamp(0.48 + fit - Math.max(0, p.intensity - 2) * 0.04, 0.35, 0.95);
		let text;
		if (technique === "fold") {
			if (p.volatility > 0.6) {
				text = "당신은 재료를 살살 섞는다. 가벼운 향이 아직 또렷하게 맡힌다.";
			} else {
				text = "당신은 재료를 살살 섞지만, 무거운 재료 몇 가지는 잘 섞이지 않는다.";
			}
		} else if (technique === "circle") {
			if (p.persistence > 0.55) {
				text = "당신은 혼합물을 원을 그리며 젓는다. 오래 남는 향은 여전히 쉽게 알아챌 수 있다.";
			} else {
				text = "당신은 혼합물을 원을 그리며 젓지만, 가벼운 재료는 이미 잘 섞여 있었다. 더 저어도 크게 달라지는 것 같지 않다.";
			}
		} else if (stage === 2) {
			text = "당신은 잠시 젓기를 멈춘다. 작은 거품이 사라졌고, 더 강한 향이 한층 또렷하게 맡힌다.";
		} else {
			text = "당신은 잠시 젓기를 멈춘다. 재료 몇 가지는 따로 구별해 맡을 수 있지만, 아직 완전히 섞이지는 않았다.";
		}
		return { score, text };
	}
	setup.perfumeryModel = {
		material,
		source,
		name,
		ingredients,
		solvents,
		layers,
		calculate,
		validate,
		copy,
		clamp,
		compatibility,
		contribution,
		blendStep,
		empty: () => ({ version: 1, top: {}, heart: {}, base: {}, solvent: "clear", concentration: 30, capacity: 40, age: 1 }),
	};
})();

/* Sensory model v2. Extraction v1 and its material properties remain unchanged. */
(() => {
	"use strict";
	const vectors = {
		petal: { floral: 1, powdery: 0.25 },
		leaf: { green: 1, herbal: 0.4, bitter: 0.25 },
		pollen: { powdery: 0.8, musky: 0.45, floral: 0.5 },
		peel: { citrus: 1, bitter: 0.5, sour: 0.4 },
		juice: { fruity: 1, sour: 0.25, aquatic: 0.2 },
		jam: { fruity: 0.8, sweet: 0.8, amber: 0.2 },
		butter: { creamy: 1, gourmand: 0.6, greasy: 0.5 },
		crumb: { gourmand: 0.8, woody: 0.3, stale: 0.3 },
		caramel: { sweet: 1, amber: 0.6, gourmand: 0.7 },
		cocoa: { roasted: 1, bitter: 0.6, woody: 0.4 },
		spice: { spicy: 1, herbal: 0.6, resinous: 0.4, medicinal: 0.35 },
		root: { earthy: 1, woody: 0.65, musty: 0.4 },
		umami: { savoury: 1, musky: 0.25, sweaty: 0.35, decaying: 0.3 },
		sharp: { sulfurous: 1, pungent: 0.8, acrid: 0.3, metallic: 0.25 },
		ferment: { fermented: 1, sour: 0.6, rancid: 0.4, moldy: 0.25 },
		toast: { roasted: 0.8, smoky: 0.6, bitter: 0.25, burnt: 0.35 },
	};
	const familyVectors = { fruit: "fruity", bakery: "gourmand", sulphurous: "sulfurous" };
	const negative = {
		sour: 0.4,
		bitter: 0.25,
		fermented: 0.65,
		musty: 0.55,
		moldy: 1,
		rancid: 1,
		greasy: 0.5,
		burnt: 0.65,
		acrid: 0.85,
		medicinal: 0.35,
		metallic: 0.4,
		sulfurous: 1,
		sweaty: 0.8,
		stale: 0.65,
		overpowering: 0.7,
		muddy: 0.6,
		decaying: 1,
		pungent: 0.6,
	};
	const nouns = {
		floral: ["Blossom", "Petals", "Bouquet", "Bloom"],
		fruity: ["Orchard", "Harvest", "Nectar"],
		citrus: ["Grove", "Zest", "Sunrise"],
		green: ["Garden", "Meadow", "Fern"],
		herbal: ["Herbarium", "Leaves", "Thicket"],
		aquatic: ["Lagoon", "Rain", "Tide"],
		woody: ["Woods", "Bark", "Timber"],
		earthy: ["Cellar", "Loam", "Forest"],
		resinous: ["Resin", "Incense", "Balsam"],
		spicy: ["Spice", "Ember", "Pepper"],
		powdery: ["Veil", "Silk", "Dust"],
		musky: ["Musk", "Velvet", "Skin"],
		amber: ["Amber", "Lantern", "Dusk"],
		sweet: ["Sugar", "Honey", "Confection"],
		creamy: ["Cream", "Ivory", "Butter"],
		gourmand: ["Pantry", "Pastry", "Hearth"],
		roasted: ["Toast", "Cocoa", "Grain"],
		smoky: ["Smoke", "Ash", "Cinder"],
		savoury: ["Supper", "Broth", "Harvest"],
	};
	const adjectives = {
		sour: "Sour",
		bitter: "Bitter",
		fermented: "Fermented",
		musty: "Damp",
		moldy: "Mouldering",
		rancid: "Rancid",
		greasy: "Oily",
		burnt: "Scorched",
		acrid: "Acrid",
		medicinal: "Medicinal",
		metallic: "Iron",
		sulfurous: "Sulfurous",
		sweaty: "Salted",
		stale: "Forgotten",
		overpowering: "Unbridled",
		muddy: "Clouded",
		decaying: "Decaying",
		pungent: "Sharp",
		floral: "Velvet",
		fruity: "Orchard",
		citrus: "Sunlit",
		green: "Rainwashed",
		herbal: "Wild",
		aquatic: "Tidal",
		woody: "Evening",
		earthy: "Woodland",
		resinous: "Midnight",
		spicy: "Warm",
		powdery: "Silken",
		musky: "Intimate",
		amber: "Golden",
		sweet: "Honeyed",
		creamy: "Soft",
		gourmand: "Buttered",
		roasted: "Toasted",
		smoky: "Ashen",
		savoury: "Strange",
		"fresh floral": "이슬 머금은",
	};
	const descriptors = [...Object.keys(nouns), ...Object.keys(negative), "fresh floral"];
	function canonical(f) {
		return JSON.stringify([
			f.version,
			...["top", "heart", "base"].map(l => Object.entries(f[l]).sort(([a], [b]) => a.localeCompare(b))),
			f.solvent,
			f.concentration,
			f.capacity,
			f.age,
		]);
	}
	function hash(text) {
		let h = 2166136261;
		for (let i = 0; i < text.length; i++) h = Math.imul(h ^ text.charCodeAt(i), 16777619);
		return h >>> 0;
	}
	function fingerprint(f, blending = 0.5) {
		const key = canonical(f) + ":" + Math.round(blending * 10000);
		return `p2-${hash(key).toString(36)}-${hash(key.split("").reverse().join("")).toString(36)}`;
	}
	function materialVector(id, override) {
		const m = setup.perfumeryModel;
		const d = override || m.material(id);
		const source = m.source(id);
		const category = setup.foodstuff?.[source]?.category;
		const v = {};
		const purity = d.purity ?? 0.85;
		const stability = d.stability ?? 0.8;
		if (id.startsWith("aroma~")) {
			const p = setup.perfumeryExtraction.profile(id);
			const puzzle = setup.perfumeryExtraction.puzzle(p.source);
			let sum = 0;
			puzzle.forEach((facet, i) => {
				if (!(p.mask & (1 << i))) return;
				const w = facet.intensity * (p.method === "capture" ? 0.5 + facet.volatility : p.method === "deep" ? 0.5 + facet.persistence : 1);
				sum += w;
				for (const [k, n] of Object.entries(vectors[facet.name])) v[k] = (v[k] || 0) + n * w;
			});
			for (const k of Object.keys(v)) v[k] /= sum;
			if (p.finish === "purity") for (const k of Object.keys(negative)) if (v[k]) v[k] *= 0.55;
		} else {
			v[familyVectors[d.family] || d.family] = 1;
			v.powdery = category === "flower" ? d.persistence * 0.4 : 0;
			v.woody = d.earth * 0.65;
			v.musky = d.persistence * d.earth * 0.35;
			if (category === "mushroom") {
				v.musty = 0.5;
				v.earthy = 1;
			}
		}
		// Source character remains even after separation, without turning every food into fruit.
		if (category === "vegetable") {
			v.green = (v.green || 0) + 0.2;
			v.pungent = (v.sulfurous || 0) * 0.4;
		}
		if (category === "mushroom") {
			v.musty = (v.musty || 0) + 0.2;
			v.earthy = (v.earthy || 0) + 0.2;
		}
		if (["meat", "seafood"].includes(category)) {
			v.savoury = (v.savoury || 0) + 0.3;
			v.metallic = (v.metallic || 0) + 0.15;
		}
		if (["lotus", "bog_orchid", "marsh_saxifrage"].includes(source)) v.aquatic = (v.aquatic || 0) + 0.5;
		if (source === "scottish_bog_myrtle") v.resinous = (v.resinous || 0) + 0.6;
		return { vector: v, purity, stability };
	}
	function analyze(f, p, blending, age, overrides = {}) {
		const m = setup.perfumeryModel;
		const scores = {};
		const phase = {};
		const contributions = [];
		let total = 0;
		let purity = 0;
		let stability = 0;
		let crowded = 0;
		for (const layer of m.layers) {
			const local = {};
			const items = Object.entries(f[layer]).sort(([a], [b]) => a.localeCompare(b));
			let subtotal = 0;
			crowded += Math.max(0, items.filter(([id]) => m.material(id).intensity > 1).length - 2);
			for (const [id, quantity] of items) {
				const d = materialVector(id, overrides[id]);
				const w = m.contribution(id, layer, quantity, overrides[id]);
				total += w;
				subtotal += w;
				purity += d.purity * w;
				stability += d.stability * w;
				contributions.push({ id, layer, quantity, weight: w, purity: d.purity, stability: d.stability });
				for (const [k, n] of Object.entries(d.vector)) {
					scores[k] = (scores[k] || 0) + n * w;
					local[k] = (local[k] || 0) + n * w;
				}
			}
			phase[layer] = subtotal ? Object.fromEntries(Object.entries(local).map(([k, n]) => [k, n / subtotal])) : {};
		}
		for (const k of Object.keys(scores)) scores[k] /= total;
		purity /= total;
		stability /= total;
		const defects = [];
		const add = (name, n, cause) => {
			n = m.clamp(n, 0, 1);
			if (n > 0.08) {
				scores[name] = (scores[name] || 0) + n;
				const layer = ["acrid", "sour", "overpowering", "pungent"].includes(name) ? "top" : ["muddy", "medicinal"].includes(name) ? "heart" : "base";
				phase[layer][name] = (phase[layer][name] || 0) + n;
				defects.push({ name, severity: n, cause });
			}
		};
		const harshness = ((Math.max(0, f.concentration - 23) / 17) * m.solvents[f.solvent].purity * (0.4 + p.volatility)) / (1 + age / 4);
		const decay = (Math.max(0, age - p.idealAge) / 9) * (1 - stability);
		add("overpowering", Math.max(0, p.intensity - 2.2) * 0.4, "향수가 너무 강해서 가벼운 향을 맡기 어렵습니다.");
		add("acrid", harshness * 0.65, "처음 맡을 때 향수 냄새가 불쾌할 만큼 날카롭습니다.");
		add(
			"muddy",
			crowded * 0.12 + Math.max(0, 0.7 - p.harmony) * 0.7 + (1 - blending) * (1 - stability) * 0.5,
			"강한 냄새가 너무 많이 섞여 있어 서로 구별하기 어렵습니다."
		);
		add(
			"stale",
			decay + (scores.stale || 0) * (1 - stability),
			"일부 재료의 향이 너무 빨리 사라졌거나, 향수를 너무 오래 쓰지 않고 두었습니다. 더 이상 신선한 냄새가 나지 않습니다."
		);
		add(
			"rancid",
			(scores.greasy || 0) * ((scores.fermented || 0) + decay) * 2,
			"기름진 냄새와 발효된 냄새가 섞여 향수에서 상한 음식 냄새가 납니다."
		);
		add(
			"moldy",
			(scores.musty || 0) * ((scores.fermented || 0) + decay) * 1.6,
			"젖은 채로 너무 오래 방치한 눅눅한 옷과 비슷한 불쾌한 냄새가 향수에서 납니다."
		);
		add(
			"decaying",
			(scores.savoury || 0) * ((scores.fermented || 0) + decay) * 1.5,
			"일부 재료가 섞이면서 향수에서 썩는 음식 냄새가 납니다."
		);
		add(
			"burnt",
			(scores.roasted || 0) * harshness * 0.8 + (scores.burnt || 0) * Math.max(0, p.intensity - 1),
			"구운 냄새가 너무 강해져 향수에서 타 버린 것 같은 냄새가 납니다."
		);
		add(
			"medicinal",
			(scores.herbal || 0) * ((scores.bitter || 0) + harshness) * 0.6,
			"허브의 강하고 쓴 냄새 때문에 향수에서 약 냄새가 납니다."
		);
		add("sour", (scores.sour || 0) * (1 - purity) + (scores.fermented || 0) * 0.3, "신 냄새가 너무 강해져서 더 달콤한 향을 덮어 버립니다.");
		add("pungent", (scores.sulfurous || 0) * p.intensity * 0.35, "썩은 달걀과 비슷한 강한 냄새 때문에 향수가 불쾌합니다.");
		if ((scores.floral || 0) > 0.25 && p.fresh > 0.3) scores["fresh floral"] = scores.floral * p.fresh;
		const penalty = Object.entries(negative).reduce((sum, [k, n]) => sum + (scores[k] || 0) * n, 0);
		const pleasantness = m.clamp(77 + p.human * 14 + p.harmony * 8 - penalty * 58 - harshness * 12, 0, 100);
		const distinctive = m.clamp(15 + penalty * 30 + Object.values(scores).filter(n => n > 0.15).length * 4 + (1 - p.harmony) * 20, 0, 100);
		const stable = m.clamp(stability * 0.65 + blending * 0.25 + Math.min(age / p.idealAge, 1) * 0.1 - decay * 0.15, 0, 1);
		const ranked = Object.keys(scores)
			.filter(k => scores[k] > 0.12)
			.sort((a, b) => scores[b] - scores[a] || a.localeCompare(b));
		const conventional = ranked.filter(k => !Object.hasOwn(negative, k));
		const challenging = ranked.filter(k => Object.hasOwn(negative, k));
		const dominant = conventional[0] || ranked[0] || p.family;
		const secondary = conventional[1] || dominant;
		const mainDefect = challenging.find(k => scores[k] > 0.32);
		const simulationOnly = Object.keys(overrides).length > 0;
		const fp =
			fingerprint(f, blending) +
			(simulationOnly ? `-simulation-${hash(JSON.stringify(Object.entries(overrides).sort(([a], [b]) => a.localeCompare(b))))}` : "");
		const h = hash(fp);
		const noun = nouns[dominant] || ["Accord", "Trail", "Study"];
		const generatedName = `${adjectives[mainDefect || secondary] || "Strange"} ${noun[h % noun.length]}`;
		const phaseText = (layer, label) => {
			const keys = Object.keys(phase[layer])
				.filter(k => phase[layer][k] > 0.16)
				.sort((a, b) => phase[layer][b] - phase[layer][a])
				.slice(0, 3);
			return `${label}: ${keys.join(", ") || dominant}`;
		};
		const phases = { opening: phaseText("top", "Opening"), heart: phaseText("heart", "Heart"), drydown: phaseText("base", "Base") };
		const phasePleasantness = Object.fromEntries(
			Object.entries(phase).map(([layer, vector]) => [
				layer,
				/* An empty note smells of whatever is still there, so it borrows the whole perfume's pleasantness. */
				!Object.keys(vector).length
					? pleasantness
					: m.clamp(77 + p.human * 14 + p.harmony * 8 - Object.entries(negative).reduce((sum, [k, n]) => sum + (vector[k] || 0) * n, 0) * 58, 0, 100),
			])
		);
		for (const k of Object.keys(negative))
			if ((scores[k] || 0) > 0.3 && !defects.some(n => n.name === k)) {
				const sources = contributions.filter(c => (materialVector(c.id).vector[k] || 0) > 0.2).map(c => m.source(c.id));
				defects.push({
					name: k,
					severity: m.clamp(scores[k], 0, 1),
					cause: `${[...new Set(sources)].join(", ") || "당신의 배합"}에서 남긴 ${({ bitter: "쓴맛", fermented: "발효취", musty: "곰팡내", greasy: "기름기", metallic: "금속내", sulfurous: "황 냄새", sweaty: "땀내", sour: "신맛", acrid: "매캐함", rancid: "산패취", moldy: "곰팡이 냄새", decaying: "부패취", burnt: "탄내", medicinal: "약 냄새", overpowering: "압도적인 향", muddy: "탁함", stale: "묵은내", pungent: "쏘는 냄새" })[k] || k} 성분이 아직 느껴집니다.`,
				});
			}
		const sensory = {
			bitter: "쓴 냄새가 더 달콤한 향과 섞여 있다.",
			fermented: "너무 익은 과일이나 술 같은 냄새가 조금 난다.",
			musty: "젖은 흙이나 오래된 옷 같은 눅눅하고 흙내 나는 냄새가 난다.",
			greasy: "향수에서 묵직하고 기름진 냄새가 나서 가벼운 향이 잘 느껴지지 않는다.",
			metallic: "동전 같은 금속 냄새가 희미하게 난다.",
			sulfurous: "썩은 달걀과 비슷한 불쾌한 냄새가 난다.",
			sweaty: "시간이 지나면 향수에서 땀 냄새가 나기 시작한다.",
			sour: "신 냄새가 더 달콤한 향과 섞여 있다.",
			acrid: "첫 냄새가 매우 날카롭고 불쾌해서 코가 따끔할 정도다.",
			rancid: "상한 식용유 같은 불쾌한 냄새가 난다.",
			moldy: "곰팡이가 피기 시작한 음식처럼 눅눅하고 오래된 냄새가 난다.",
			decaying: "썩는 음식과 비슷한 냄새가 나며, 시간이 지날수록 강해진다.",
			burnt: "구운 재료에서 탄내가 남는다.",
			medicinal: "향수에서 허브와 약 냄새가 나며 쓴맛이 조금 섞여 있다.",
			overpowering: "한 가지 냄새가 너무 강해서 다른 냄새는 거의 느껴지지 않는다.",
			muddy: "여러 강한 냄새가 섞여 있어 서로 구별하기 어렵다.",
			stale: "처음의 향이 사라지고 나면 향수에서 오래된 곡물이나 시리얼 냄새가 나기 시작한다.",
			pungent: "냄새가 매우 강해서 가까이 있지 않은 사람도 알아챌 수 있다.",
		};
		const join = text => {
			const parts = text.slice(text.indexOf(":") + 2).split(", ");
			return parts.length > 2 ? `${parts.slice(0, -1).join(", ")}, and ${parts[parts.length - 1]}` : parts.join(" and ");
		};
		const description = `You first smell ${join(phases.opening)} scents before ${join(
			phases.heart
		)} scents become more noticeable. As the lighter scents fade, you can still smell ${join(phases.drydown)} scents on your skin. ${
			p.intensity > 2.3 ? "향수 냄새가 매우 강하다." : p.intensity < 1 ? "향수 냄새가 희미하다." : "향수 냄새가 눈에 띈다."
		} ${
			defects.length
				? sensory[defects.sort((a, b) => b.severity - a.severity)[0].name]
				: stable > 0.7
				? "한 노트에서 다음 노트로 부드럽게 변한다."
				: "가벼운 향이 사라지면서 냄새가 변한다."
		}`;
		return {
			simulationOnly,
			fingerprint: fp,
			name: generatedName,
			dominant,
			secondary,
			nuances: ranked.slice(0, 8),
			descriptorStrengths: scores,
			familyStrengths: Object.fromEntries(conventional.map(k => [k, scores[k]])),
			phases,
			phasePleasantness,
			phaseStrengths: phase,
			description,
			offNotes: defects,
			technicalQuality: p.quality,
			pleasantness,
			distinctiveness: distinctive,
			stability: stable,
			extractionPurity: purity,
			socialAppeal: m.clamp((pleasantness / 100) * (0.4 + p.human * 0.6) - Math.max(0, p.intensity - 2) * 0.2, 0, 1),
			contributions,
		};
	}
	setup.perfumeryIdentity = { analyze, canonical, fingerprint, hash, materialVector, descriptors, negative };
})();
