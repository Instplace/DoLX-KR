/* twine-user-script: kr keys.js */

/*
 * 표시용 한국어 값을 게임 내부의 영문 키로 되돌리는 모듈.
 *
 * 번역 과정에서 데이터의 이름(음식·가구·색·머리 모양 등)을 한국어로 바꿨기 때문에, 그 이름이 그림 경로나
 * 내부 조회에 그대로 쓰이면 "img/clothes/props/general/베이크웰-타르트-gift.png"처럼 없는 파일을 찾게 된다.
 * 호출부를 하나하나 고치는 것과 별개로, 값이 내부로 들어가는 길목에서 한 번 더 영문 키로 바꿔 준다.
 *
 * - KR.toKey(값, 도메인?)      : 값 전체가 한국어 이름이면 영문 키를 돌려준다. 아니면 받은 값을 그대로.
 * - KR.keysIn(값, 도메인?)     : 여러 낱말이 이어진 값 안의 한국어 이름을 키로 바꾼다.
 *                                "베이크웰 타르트 gift" → "bakewell_tart gift"
 * - KR.imagePath(경로)         : 그림 경로 안의 한국어 이름을 파일 이름 형식의 키로 바꾼다.
 *                                "img/…/베이크웰-타르트-gift.png" → "img/…/bakewell-tart-gift.png"
 * - 안전망: 캔버스 모델이 그림을 불러올 때와 <<icon>>, 그리고 화면의 <img>가 로드에 실패했을 때
 *   경로에 한글이 있으면 KR.imagePath로 바꿔 다시 불러온다. setup.foodstuff, setup.colours.*_map,
 *   setup.furniture는 한국어 이름으로 찾아도 영문 키의 항목을 돌려준다.
 *   바꾼 내용은 콘솔에 한 번씩 남는다(KR.keyLog에도 쌓인다).
 *
 * 도메인은 아래 SOURCES의 이름이다(foodstuff, furniture, hair, colour, npc, wardrobe, dict). 지정하지 않으면
 * 위에서부터 차례로 찾는다. 표는 처음 쓸 때 게임 데이터에서 만들므로 번역이 바뀌어도 따로 손댈 것이 없다.
 */
(() => {
	"use strict";
	window.KR = window.KR || {};
	const KR = window.KR;
	const HANGUL = /[ㄱ-ㆎ가-힣]/;
	const hasHangul = value => typeof value === "string" && HANGUL.test(value);
	/* 낱말 사이의 공백·밑줄·붙임표를 한 칸으로: 이름이 키나 파일 이름으로 바뀐 뒤에도 찾을 수 있게 한다. */
	const spaced = text => text.replace(/[\s_-]+/g, " ").trim();

	/* 도메인별로 (한국어 이름, 영문 키) 쌍을 내놓는다. 먼저 나온 쌍이 우선한다. */
	const SOURCES = {
		foodstuff(add) {
			for (const [key, item] of Object.entries(setup.foodstuff || {})) {
				if (!item || typeof item !== "object") continue;
				for (const name of [item.name, item.singular, item.plural, item.recipe && item.recipe.recipe_name, item.seed_name]) add(name, key);
			}
		},
		furniture(add) {
			if (!setup.furniture || typeof setup.furniture.forEach !== "function") return;
			setup.furniture.forEach((item, id) => {
				if (item) for (const name of [item.name, item.nameCap, item.nameSolo]) add(name, id);
			});
		},
		hair(add) {
			for (const list of Object.values(setup.hairstyles || {})) {
				if (Array.isArray(list)) for (const style of list) if (style) for (const name of [style.name, style.name_cap]) add(name, style.variable);
			}
		},
		colour(add) {
			for (const list of Object.values(setup.colours || {})) {
				if (Array.isArray(list)) for (const colour of list) if (colour && typeof colour.variable === "string") for (const name of [colour.name, colour.name_cap]) add(name, colour.variable);
			}
		},
		npc(add) {
			for (const [english, korean] of Object.entries(KR.personNameDict || {})) add(korean, english);
		},
		wardrobe(add) {
			for (const [english, korean] of Object.entries(KR.wardrobeNameDict || {})) add(korean, english);
		},
		/* 화면 번역 사전(주로 의상 이름). 여러 영어 낱말이 같은 한국어로 옮겨진 것은 되돌릴 수 없으므로 뺀다. */
		dict(add) {
			const seen = new Map();
			for (const [english, korean] of Object.entries(KR.dict || {})) {
				if (typeof korean !== "string") continue;
				seen.set(korean, seen.has(korean) ? null : english);
			}
			for (const [korean, english] of seen) if (english !== null) add(korean, english);
		},
	};

	let tables = null;
	function build() {
		tables = {};
		for (const [domain, fill] of Object.entries(SOURCES)) {
			const map = new Map();
			try {
				fill((korean, key) => {
					if (hasHangul(korean) && typeof key === "string" && key && !map.has(spaced(korean))) map.set(spaced(korean), key);
				});
			} catch (error) {
				console.warn(`[KR.keys] ${domain} 표를 만들지 못했습니다:`, error);
			}
			/* 긴 이름부터: "붉은 장미"가 "장미"보다 먼저 맞아야 한다. */
			tables[domain] = { map, names: [...map.keys()].sort((a, b) => b.length - a.length) };
		}
		return tables;
	}
	/* 게임 데이터가 채워지기 전에 불리면 그때 만든 빈 표를 남겨 두지 않는다. */
	const dataReady = () => typeof setup === "object" && setup && setup.foodstuff && Object.keys(setup.foodstuff).length > 0;
	const domainsOf = domain => {
		const all = tables || build();
		if (!dataReady()) tables = null;
		return (domain ? [].concat(domain) : Object.keys(all)).map(name => all[name]).filter(Boolean);
	};

	/* 데이터가 바뀌었을 때(모드가 음식을 더했을 때 등) 표를 다시 만들게 한다. */
	KR.resetKeys = function () {
		tables = null;
	};

	KR.keyLog = [];
	const noted = new Set();
	function note(where, from, to) {
		const line = `${where}: "${from}" → "${to}"`;
		if (noted.has(line)) return;
		noted.add(line);
		if (KR.keyLog.length < 200) KR.keyLog.push(line);
		console.warn(`[KR.keys] 한국어 값을 내부 키로 바꿔 썼습니다. ${line}`);
	}

	KR.toKey = function (value, domain) {
		if (!hasHangul(value)) return value;
		const wanted = spaced(value);
		for (const table of domainsOf(domain)) {
			const key = table.map.get(wanted);
			if (key !== undefined) return key;
		}
		return value;
	};

	/* 낱말 경계에서만 바꾼다: 값은 공백으로 나눈 낱말 열로 보고, 이름도 낱말 열로 맞춘다. */
	function replaceNames(text, domain) {
		let work = ` ${spaced(text)} `;
		let changed = false;
		for (const table of domainsOf(domain)) {
			if (!HANGUL.test(work)) break;
			for (const name of table.names) {
				const needle = ` ${name} `;
				let at = work.indexOf(needle);
				while (at >= 0) {
					work = `${work.slice(0, at)} ${table.map.get(name)} ${work.slice(at + needle.length)}`;
					changed = true;
					at = work.indexOf(needle);
				}
				if (changed && !HANGUL.test(work)) break;
			}
		}
		return changed ? work.trim() : null;
	}

	KR.keysIn = function (value, domain) {
		if (!hasHangul(value)) return value;
		const exact = KR.toKey(value, domain);
		if (exact !== value) return exact;
		return replaceNames(value, domain) ?? value;
	};

	KR.imagePath = function (src, domain) {
		if (typeof src !== "string") return src;
		let path = src;
		if (path.includes("%")) {
			try {
				path = decodeURIComponent(path);
			} catch (error) {
				path = src;
			}
		}
		if (!HANGUL.test(path)) return src;
		const query = path.match(/[?#].*$/);
		const parts = (query ? path.slice(0, query.index) : path).split("/").map(part => {
			if (!HANGUL.test(part)) return part;
			const dot = part.lastIndexOf(".");
			const stem = dot > 0 ? part.slice(0, dot) : part;
			const replaced = replaceNames(stem, domain);
			if (replaced === null) return part;
			/* 파일 이름은 낱말을 붙임표로 잇는다(밑줄을 쓰던 자리면 밑줄). */
			const joiner = stem.includes("_") && !stem.includes("-") ? "_" : "-";
			return replaced.replace(/[\s_-]+/g, joiner) + (dot > 0 ? part.slice(dot) : "");
		});
		const fixed = parts.join("/") + (query ? query[0] : "");
		return fixed === path ? src : fixed;
	};

	/* ---- 안전망 ---- */

	/* 캔버스 모델(옆 화면의 캐릭터 등)이 그림을 불러오는 길목. */
	function hookRenderer() {
		const loader = window.Renderer && window.Renderer.ImageLoader;
		if (!loader || loader.krKeys) return;
		const load = loader.loadImage;
		loader.loadImage = function (src, layer, onLoad, onError) {
			if (hasHangul(src)) {
				const fixed = KR.imagePath(src);
				if (fixed !== src) {
					note(`그림(${(layer && layer.name) || "모델"})`, src, fixed);
					src = fixed;
				}
			}
			return load.call(this, src, layer, onLoad, onError);
		};
		loader.krKeys = true;
	}

	/* 화면의 <img>가 로드에 실패했고 경로에 한글이 있으면, 키로 바꾼 경로로 한 번 더 불러온다. */
	function hookImages() {
		document.addEventListener(
			"error",
			event => {
				const img = event.target;
				if (!img || img.tagName !== "IMG" || img.dataset.krKey) return;
				const src = img.getAttribute("src");
				if (!src) return;
				const fixed = KR.imagePath(src);
				if (fixed === src) return;
				img.dataset.krKey = "1";
				note("그림(<img>)", src, fixed);
				img.src = fixed;
			},
			true
		);
	}

	/*
	 * 데이터 표: 한국어 이름으로 찾으면 영문 키로 찾아 준다.
	 * setup.foodstuff["베이크웰 타르트"] → setup.foodstuff.bakewell_tart, setup.colours.hair_map["칠흑색"] → …jetblack,
	 * setup.furniture.get("나무 의자") → woodenchair. 영문 키로 찾을 때는 아무것도 하지 않는다(그대로 빠르다).
	 * setup만 감싼다: 세이브에 들어가는 V의 값은 건드리지 않는다.
	 */
	const WRAPPED = typeof WeakSet === "function" ? new WeakSet() : null;
	function keyedObject(object, domain, where) {
		if (!object || typeof object !== "object" || typeof Proxy !== "function" || (WRAPPED && WRAPPED.has(object))) return object;
		const resolve = (target, name) => {
			if (typeof name !== "string" || name in target || !HANGUL.test(name)) return undefined;
			const key = KR.toKey(name, domain);
			return key !== name && key in target ? key : undefined;
		};
		const proxy = new Proxy(object, {
			get(target, name, receiver) {
				const key = resolve(target, name);
				if (key === undefined) return Reflect.get(target, name, receiver);
				note(where, name, key);
				return target[key];
			},
			has(target, name) {
				return Reflect.has(target, name) || resolve(target, name) !== undefined;
			},
		});
		if (WRAPPED) WRAPPED.add(proxy);
		return proxy;
	}
	function keyedMap(map, domain, where) {
		if (!map || typeof map.get !== "function" || map.krKeys) return;
		const get = map.get, has = map.has;
		map.get = function (name) {
			if (has.call(this, name) || !hasHangul(name)) return get.call(this, name);
			const key = KR.toKey(name, domain);
			if (key !== name && has.call(this, key)) {
				note(where, name, key);
				return get.call(this, key);
			}
			return get.call(this, name);
		};
		map.has = function (name) {
			return has.call(this, name) || (hasHangul(name) && has.call(this, KR.toKey(name, domain)));
		};
		map.krKeys = true;
	}
	function hookTables() {
		if (typeof setup !== "object" || !setup) return;
		if (setup.foodstuff) setup.foodstuff = keyedObject(setup.foodstuff, "foodstuff", "setup.foodstuff");
		if (setup.colours) {
			for (const name of Object.keys(setup.colours)) {
				if (name.endsWith("_map")) setup.colours[name] = keyedObject(setup.colours[name], "colour", `setup.colours.${name}`);
			}
		}
		keyedMap(setup.furniture, "furniture", "setup.furniture");
	}

	hookImages();
	hookRenderer();
	/* 렌더러·데이터가 이 파일보다 늦게 준비되는 경우에 대비해 이야기가 시작될 때 한 번 더 건다.
	   표를 통째로 다시 만드는 코드가 있어도 다음 장면에서 다시 감싼다. */
	if (window.jQuery) {
		window.jQuery(document).one(":storyready", () => {
			hookRenderer();
			hookTables();
		});
		window.jQuery(document).on(":passagestart", hookTables);
	}
})();
