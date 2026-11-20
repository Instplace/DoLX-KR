/* globals formatMoney saveAs */
/* Rhythm game screens: song select, the game itself, results, the Rhythm Library, playlists, settings and records.
 * Everything is built inside the passage's #rhythm element and torn down on the next passage change (or when the player
 * leaves through the game's own link), so no listener, audio, timer or object URL outlives the passage. */
(() => {
	const R = () => setup.rhythm;
	const L = () => setup.rhythmLibrary;
	const levels = ["easy", "normal", "hard"];
	const levelName = l => ({ easy: "쉬움", normal: "보통", medium: "보통", hard: "어려움" })[l] || l[0].toUpperCase() + l.slice(1);
	const warning = "자동 생성된 채보는 음악과 완벽하게 맞지 않을 수 있습니다. 일부 곡은 BPM이나 타이밍을 직접 조정해야 할 수 있습니다.";

	/* Small element builder: h("div", { class, text, onclick, ...attributes }, ...children). */
	function h(tag, props, ...kids) {
		const el = document.createElement(tag);
		for (const [k, v] of Object.entries(props || {})) {
			if (v === undefined || v === null || v === false) continue;
			if (k === "class") el.className = v;
			else if (k === "text") el.textContent = v;
			else if (k.startsWith("on")) el.addEventListener(k.slice(2), v);
			else el.setAttribute(k, v === true ? "" : String(v));
		}
		for (const kid of kids.flat(Infinity)) if (kid !== null && kid !== undefined && kid !== false) el.append(kid instanceof Node ? kid : String(kid));
		return el;
	}
	const button = (label, onclick, props = {}) => h("button", { type: "button", class: "rh-btn", onclick, ...props }, label);
	const time = sec => `${Math.floor(sec / 60)}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
	const chip = level => h("span", { class: `con-diff ${{ easy: "green", normal: "gold", hard: "red" }[level]}` }, levelName(level));

	/* Appends only real children: append() and replaceChildren() print null or false as text and an array as
	 * "[object HTMLElement],...". `fill` replaces an element's children the same way. */
	const put = (el, ...kids) => el.append(...kids.flat(Infinity).filter(k => k !== null && k !== undefined && k !== false));
	const fill = (el, ...kids) => {
		el.replaceChildren();
		put(el, ...kids);
	};

	let current = null;

	/* What a key is called on this keyboard: the layout's own character where the browser can tell (so an AZERTY
	 * player sees Q where the physical key is), else a readable name for the code. */
	let layoutMap = null;
	if (navigator.keyboard && typeof navigator.keyboard.getLayoutMap === "function") {
		navigator.keyboard
			.getLayoutMap()
			.then(map => (layoutMap = map))
			.catch(() => {});
	}
	const codeNames = {
		Semicolon: ";",
		Quote: "'",
		Comma: ",",
		Period: ".",
		Slash: "/",
		BracketLeft: "[",
		BracketRight: "]",
		Backslash: "\\",
		Minus: "-",
		Equal: "=",
		Backquote: "`",
		ArrowLeft: "←",
		ArrowRight: "→",
		ArrowUp: "↑",
		ArrowDown: "↓",
	};
	function keyLabel(code) {
		const mapped = layoutMap && layoutMap.get(code);
		if (mapped && mapped.trim()) return mapped.toUpperCase();
		if (codeNames[code]) return codeNames[code];
		return code.replace(/^Key/, "").replace(/^Numpad/, "Num ");
	}
	const keyLabels = () => R().settings().keys.map(keyLabel);

	/* Pointer and lane-key input for a playfield. `getPlay()` returns the Play to send presses to, or null while not
	 * playing. Pointer capture keeps each finger's moves and release on the canvas, and every finger is tracked on its
	 * own. Each lane key is its own input too, so two keys pressed together hit a pair. `onLane` is told when a lane key
	 * is first used, so the field can show its key labels. Shared by the game and the tutorial. */
	function bindInput(canvas, field, getPlay, onLane) {
		const held = new Map(); // code -> input id
		const down = e => {
			const play = getPlay();
			if (!play) return;
			e.preventDefault();
			try {
				canvas.setPointerCapture(e.pointerId);
			} catch (err) {}
			const q = play.field.toField(e.clientX, e.clientY);
			play.pointers.set(e.pointerId, q);
			play.press(e.pointerId, { sx: q.sx, sy: q.sy, mouse: e.pointerType === "mouse" });
		};
		const move = e => {
			const play = getPlay();
			if (!play || !play.pointers.has(e.pointerId)) return;
			play.pointers.set(e.pointerId, play.field.toField(e.clientX, e.clientY));
		};
		const up = e => {
			const play = getPlay();
			if (!play || !play.pointers.has(e.pointerId)) return;
			play.pointers.delete(e.pointerId);
			play.release(e.pointerId);
		};
		for (const [type, fn] of [
			["pointerdown", down],
			["pointermove", move],
			["pointerup", up],
			["pointercancel", up],
			["lostpointercapture", up],
		])
			canvas.addEventListener(type, fn);
		/* The long-press menu and text selection never belong to a playfield. */
		field.addEventListener("contextmenu", e => e.preventDefault());
		const releaseAll = () => {
			const play = getPlay();
			if (play) {
				for (const id of play.pointers.keys()) play.release(id);
				play.pointers.clear();
			}
			for (const id of held.values()) {
				if (play) {
					play.keysDown.delete(id);
					play.release(id);
				}
			}
			held.clear();
		};
		return {
			keydown(e) {
				const play = getPlay();
				if (!play || e.ctrlKey || e.metaKey || e.altKey) return;
				const lane = R().settings().keys.indexOf(e.code);
				if (lane < 0) return;
				e.preventDefault();
				/* Auto-repeat and a key already down are not new presses. */
				if (e.repeat || held.has(e.code)) return;
				const id = `key-${e.code}`;
				held.set(e.code, id);
				play.keysDown.set(id, lane);
				if (onLane) onLane();
				play.press(id, { lane });
			},
			keyup(e) {
				const id = held.get(e.code);
				if (!id) return;
				held.delete(e.code);
				const play = getPlay();
				if (play) {
					play.keysDown.delete(id);
					play.release(id);
				}
			},
			/* The window lost focus: its key releases will never arrive, so every key is let go now. */
			releaseAll,
		};
	}

	/* Should the field show lane keys from the start? "auto" shows them where a keyboard and mouse are the main input. */
	function lanesAtStart() {
		const mode = R().settings().laneLabels;
		if (mode !== "auto") return mode === "always";
		return !!window.matchMedia && window.matchMedia("(hover: hover) and (pointer: fine)").matches && !window.matchMedia("(any-pointer: coarse)").matches;
	}

	/* A chart's level number, from how busy it is: notes per second, weighted for holds and drags. */
	function chartLevel(song, level) {
		const notes = L().chartFor(song, level).notes;
		const span = Math.max(30, song.duration);
		const weight = notes.reduce((sum, n) => sum + (n.type === "drag" ? 0.4 : n.type === "hold" ? 1.3 : 1), 0);
		return Math.max(1, Math.min(15, Math.round(1 + (weight / span) * 3.4 + (level === "hard" ? 1 : 0))));
	}

	/* A song's look, from a hash of its id (so a song the player adds gets its own as surely as a built-in one) and its
	 * analysis: two colours a set step apart on the colour wheel, one of five background patterns, one of four waveform
	 * styles, where the glow sits, and how strong the colour is from how loud the song runs. */
	function identity(song) {
		const n = setup.rhythmAnalysis.hashText(String(song.id));
		const hue = n % 360;
		const energy = song.analysis?.energy || "";
		const avg = energy.length ? [...energy].reduce((sum, c) => sum + Number(c), 0) / energy.length : 5;
		return {
			hue,
			hue2: (hue + [40, 180, 120, 150, 320][(n >>> 9) % 5]) % 360,
			sat: Math.round(45 + avg * 5),
			pattern: (n >>> 12) % 5,
			wave: (n >>> 15) % 4,
			gx: 15 + ((n >>> 18) % 70),
			gy: 20 + ((n >>> 25) % 60),
		};
	}

	const svgNs = "http://www.w3.org/2000/svg";
	/* An SVG element with attributes, added to `parent` when there is one. */
	function svgEl(parent, tag, attrs) {
		const el = document.createElementNS(svgNs, tag);
		for (const [k, v] of Object.entries(attrs)) el.setAttribute(k, String(v));
		if (parent) parent.append(el);
		return el;
	}

	/* The cover combines the song's colours, pattern and loudness. The selected cover carries a scan line;
	 * reduced motion stops it. `small` is the song list's size. */
	function cover(song, { big = false, small = false } = {}) {
		const look = identity(song);
		const { gx, gy } = look;
		const pattern = svgEl(null, "svg", { viewBox: "0 0 100 100", preserveAspectRatio: "xMidYMid slice", "aria-hidden": "true", class: "rh-pattern" });
		if (look.pattern === 0) {
			for (let i = 0; i < 16; i++) {
				const angle = (i / 16) * Math.PI * 2 + gx / 100;
				svgEl(pattern, "line", { x1: gx, y1: gy, x2: (gx + Math.cos(angle) * 150).toFixed(1), y2: (gy + Math.sin(angle) * 150).toFixed(1) });
			}
		} else if (look.pattern === 1) {
			for (let r = 8; r < 140; r += 9) svgEl(pattern, "circle", { cx: gx, cy: gy, r });
		} else if (look.pattern === 2) {
			const step = small ? 20 : 10;
			for (let x = step / 2; x < 100; x += step)
				for (let y = step / 2; y < 100; y += step) svgEl(pattern, "circle", { cx: x, cy: y, r: small ? 1.6 : 0.9, class: "rh-pattern-dot" });
		} else if (look.pattern === 3) {
			for (let k = -100; k < 100; k += 7) svgEl(pattern, "line", { x1: k, y1: 100, x2: k + 100, y2: 0 });
		} else {
			for (let i = 0; i < 4; i++)
				svgEl(pattern, "ellipse", { cx: gx, cy: gy, rx: 20 + i * 18, ry: 8 + i * 7, transform: `rotate(${(gx * 3 + i * 25) % 180} ${gx} ${gy})` });
		}

		const energy = song.analysis?.energy || "";
		const bars = big ? 48 : 12;
		const wave = svgEl(null, "svg", {
			viewBox: `0 0 ${bars} 20`,
			preserveAspectRatio: "none",
			"aria-hidden": "true",
			class: `rh-wave rh-wave--${["bars", "mirror", "line", "dots"][look.wave]}`,
		});
		const level = i => (energy.length ? Number(energy[Math.floor((Math.min(i, bars - 1) / bars) * energy.length)]) || 0 : 4);
		if (look.wave === 2) {
			let d = "M0 20";
			for (let i = 0; i <= bars; i++) d += ` L${i} ${(18 - (level(i) / 9) * 16).toFixed(2)}`;
			svgEl(wave, "path", { d: `${d} L${bars} 20 Z` });
		} else {
			for (let i = 0; i < bars; i++) {
				const height = 2 + (level(i) / 9) * 16;
				if (look.wave === 1) svgEl(wave, "rect", { x: i + 0.2, y: (10 - height / 2).toFixed(2), width: 0.6, height: height.toFixed(2) });
				else if (look.wave === 3)
					for (let y = 19; y > 20 - height; y -= 2.4) svgEl(wave, "rect", { x: i + 0.25, y: (y - 1.2).toFixed(2), width: 0.5, height: 1.2 });
				else svgEl(wave, "rect", { x: i + 0.15, y: (20 - height).toFixed(2), width: 0.7, height: height.toFixed(2) });
			}
		}

		const art = h(
			"div",
			{
				class: `rh-cover${big ? " rh-cover--big" : ""}${small ? " rh-cover--small" : ""}`,
				style: `--hue: ${look.hue}; --hue2: ${look.hue2}; --sat: ${look.sat}%; --gx: ${gx}%; --gy: ${gy}%; --sweep: ${(
					(240 / song.bpm) *
					(big ? 1 : 2)
				).toFixed(2)}s`,
			},
			pattern,
			wave
		);
		if (big) art.append(h("span", { class: "rh-cover-line", "aria-hidden": "true" }));
		return art;
	}

	/* The stage panel takes the selected song's colours. */
	function lookStyle(song) {
		const look = identity(song);
		return `--hue: ${look.hue}; --hue2: ${look.hue2}; --sat: ${look.sat}%`;
	}

	/* How long a menu preview plays before it fades and starts over, in seconds. */
	const previewLength = 24;

	const levelColour = { easy: "rh-lv--easy", normal: "rh-lv--normal", hard: "rh-lv--hard" };
	const pad7 = n => String(Math.max(0, Math.round(n))).padStart(7, "0");

	class RhythmUI {
		constructor(root) {
			this.root = root;
			this.screenVersion = 0;
			if (window.PocketMusic?.active) window.PocketMusic.stop(false);
			this.audio = new Audio();
			this.audio.preload = "auto";
			this.objectURL = null;
			this.timers = new Set();
			this.listeners = [];
			this.cleanup = null; // the open screen's own teardown
			this.tab = "play";
			this.source = "builtin";
			this.selected = null;
			this.queue = null; // a playlist being played: { ids, index }
			this.busy = false;
			this.previewId = null; // the song the menu is previewing (or waiting for a tap to preview)
			this.previewToken = 0; // bumped on every change, so an older preview's timers and fades stand down
			this.previewRetry = null;
			this.previewHidden = false;
			root.textContent = "";
			this.body = h("div", { class: "rh-body" });
			this.status = h("div", { class: "rh-sr", "aria-live": "polite" });
			root.append(this.body, this.status);
			this.listen(document, "visibilitychange", () => {
				this.cleanup?.visibility?.();
				this.previewVisibility();
			});
			/* A preview the browser would not start before the player touched the page starts on their next tap or key. */
			for (const type of ["click", "keydown", "touchend"])
				this.listen(
					root,
					type,
					() => {
						const retry = this.previewRetry;
						this.previewRetry = null;
						if (retry) retry();
					},
					true
				);
			this.listen(document, "keydown", e => this.cleanup?.keydown?.(e));
			this.listen(document, "keyup", e => this.cleanup?.keyup?.(e));
			/* Key releases never arrive while the window is in the background. */
			this.listen(window, "blur", () => this.cleanup?.blur?.());
			this.menu();
		}

		listen(target, type, fn, opts) {
			target.addEventListener(type, fn, opts);
			this.listeners.push([target, type, fn, opts]);
		}

		later(fn, ms) {
			const id = setTimeout(() => {
				this.timers.delete(id);
				if (this.root) fn();
			}, ms);
			this.timers.add(id);
			return id;
		}

		say(text) {
			this.status.textContent = text;
		}

		/* Replaces the screen, running the old one's teardown first. */
		show(el, cleanup = null) {
			if (!this.root) return;
			this.screenVersion++;
			if (this.cleanup?.destroy) this.cleanup.destroy();
			/* "Fewer effects" also stills the menus' scan lines. */
			this.root.classList.toggle("rh-calm", R().settings().reduced);
			this.cleanup = cleanup;
			this.body.replaceChildren(el);
			const focus = el.querySelector("[data-autofocus]") || el.querySelector("h3");
			if (focus) {
				if (!focus.hasAttribute("tabindex") && focus.tagName === "H3") focus.setAttribute("tabindex", "-1");
				focus.focus({ preventScroll: true });
			}
		}

		/* Stops the music and frees its source. */
		silence() {
			this.stopPreview();
			this.audio.pause();
			this.audio.removeAttribute("src");
			this.audio.load();
			if (this.objectURL) URL.revokeObjectURL(this.objectURL);
			this.objectURL = null;
		}

		destroy() {
			if (this.cleanup?.destroy) this.cleanup.destroy();
			this.cleanup = null;
			for (const id of this.timers) clearTimeout(id);
			this.timers.clear();
			for (const [target, type, fn, opts] of this.listeners) target.removeEventListener(type, fn, opts);
			this.listeners = [];
			this.silence();
			this.root = null;
		}

		/* Where a song's audio comes from: a game file path, or the stored file. Returns { src } or { missing }. */
		async audioSource(song) {
			if (song.builtin) return { src: L().builtin(song.builtin).path };
			const token = this.previewToken;
			const blob = await L().getAudio(song.id);
			if (!this.root || token !== this.previewToken) return { cancelled: true };
			if (!blob) return { missing: true };
			if (this.objectURL) URL.revokeObjectURL(this.objectURL);
			this.objectURL = URL.createObjectURL(blob);
			return { src: this.objectURL };
		}

		/* ---- the menu's song preview ----
		 * The selected song plays in the menu through the same audio element as the game, so two songs never play at
		 * once, and the taps that let the preview play also let the game play. It carries on across the menu's tabs. The
		 * game, the tutorial, the chart editor and the details player take the element over, and each calls
		 * stopPreview() first (silence() does too); the menu picks the preview up again when it is next shown. */

		previewVolume() {
			if (V.options?.audio !== 1 || !R().settings().previews) return 0;
			return Math.max(0, Math.min(1, (V.options?.mastervolume ?? 1) * R().settings().music));
		}

		/* The part of a song to preview: the loudest stretch of about previewLength seconds, starting on a bar line, from
		 * the song's analysis (often the chorus); without an analysis, from a third of the way in. Returns [from, to]. */
		previewSpan(song) {
			const length = Math.min(previewLength, Math.max(6, song.duration - 1));
			const a = song.analysis || {};
			const energy = a.energy || "";
			const bar = 240 / (a.bpm || song.bpm);
			const first = (a.offset ?? song.offset ?? 0) / 1000;
			const count = Math.max(1, Math.round(length / bar));
			let from = song.duration * 0.3;
			if (energy.length > count) {
				let best = -1;
				let sum = 0;
				for (let i = 0; i < energy.length; i++) {
					sum += Number(energy[i]);
					if (i >= count) sum -= Number(energy[i - count]);
					const start = i - count + 1;
					if (start >= 0 && sum > best && first + (start + count) * bar <= song.duration) {
						best = sum;
						from = first + start * bar;
					}
				}
			}
			from = Math.max(0, Math.min(from, song.duration - length));
			return [from, from + length];
		}

		/* Ramps the volume over `ms`. Resolves false if the preview changed meanwhile. */
		fadeTo(target, ms, token) {
			const audio = this.audio;
			const from = audio.volume;
			const steps = Math.max(1, Math.round(ms / 40));
			let i = 0;
			return new Promise(resolve => {
				const step = () => {
					if (token !== this.previewToken) return resolve(false);
					i++;
					audio.volume = Math.max(0, Math.min(1, from + ((target - from) * i) / steps));
					if (i < steps) this.later(step, 40);
					else resolve(true);
				};
				step();
			});
		}

		/* Previews `song`: fades out whatever is playing, then fades in the song's preview and loops it. Picking the song
		 * already previewing changes nothing, so redrawing the menu never restarts it. */
		async preview(song) {
			if (!song || this.previewId === song.id || !this.root) return;
			const token = ++this.previewToken;
			this.previewId = song.id;
			this.previewRetry = null;
			this.previewHidden = false;
			if (this.previewMetadata) this.audio.removeEventListener("loadedmetadata", this.previewMetadata);
			this.previewMetadata = null;
			const audio = this.audio;
			if (this.previewVolume() === 0) {
				audio.pause();
				return;
			}
			if (!audio.paused && !(await this.fadeTo(0, 180, token))) return;
			let src;
			try {
				src = await this.audioSource(song);
			} catch (e) {
				return;
			}
			if (token !== this.previewToken || src.cancelled) return;
			audio.pause();
			if (src.missing) return;
			const [from, to] = this.previewSpan(song);
			if (audio.getAttribute("src") !== src.src) {
				audio.src = src.src;
				audio.load();
			}
			audio.volume = 0;
			let looping = false;
			const ours = () => token === this.previewToken && audio.getAttribute("src") === src.src;
			/* Near the end of the stretch: fade out, go back to its start, fade in. */
			const watch = () => {
				if (!ours()) return;
				if (!looping && !this.previewHidden && (audio.ended || (!audio.paused && audio.currentTime >= to - 0.9))) {
					looping = true;
					this.fadeTo(0, 700, token).then(ok => {
						if (!ok || !ours()) return;
						audio.currentTime = from;
						if (audio.paused) audio.play().catch(() => {});
						this.fadeTo(this.previewVolume(), 500, token);
						looping = false;
					});
				}
				this.later(watch, 200);
			};
			const begin = () => {
				if (!ours()) return;
				if (document.hidden) {
					this.previewHidden = true;
					this.previewRetry = begin;
					return;
				}
				const started = audio.play();
				Promise.resolve(started).then(
					() => {
						if (!ours()) return;
						this.fadeTo(this.previewVolume(), 450, token);
						watch();
					},
					e => {
						if (ours() && e && e.name === "NotAllowedError") this.previewRetry = begin;
					}
				);
			};
			const seekAndBegin = () => {
				if (!ours()) return;
				try {
					audio.currentTime = from;
				} catch (e) {}
				begin();
			};
			if (audio.readyState >= 1) seekAndBegin();
			else {
				this.previewMetadata = seekAndBegin;
				audio.addEventListener("loadedmetadata", seekAndBegin, { once: true });
			}
		}

		/* Previews the selected song, for tabs other than Play (which previews from its own list). */
		async previewSelected() {
			const screen = this.screenVersion;
			const id = this.selected;
			if (!id || this.previewId === id) return;
			let song = null;
			try {
				song = await L().getSong(id);
			} catch (e) {}
			if (song && this.selected === id && this.root && screen === this.screenVersion) this.preview(song);
		}

		stopPreview() {
			if (this.previewMetadata) this.audio.removeEventListener("loadedmetadata", this.previewMetadata);
			this.previewMetadata = null;
			this.previewToken++;
			this.previewId = null;
			this.previewRetry = null;
			this.previewHidden = false;
			this.audio.pause();
		}

		/* The page went to the background: hold the preview, and carry on when it comes back. */
		previewVisibility() {
			if (!this.previewId) return;
			if (document.hidden) {
				if (!this.audio.paused) {
					this.audio.pause();
					this.previewHidden = true;
				}
			} else if (this.previewHidden) {
				this.previewHidden = false;
				const retry = this.previewRetry;
				this.previewRetry = null;
				if (retry) retry();
				else this.audio.play().catch(() => {});
			}
		}

		/* ---- the menu: tabs ---- */

		menu(tab = this.tab) {
			if (!this.root) return Promise.resolve();
			this.tab = tab;
			this.queue = tab === "play" ? this.queue : null;
			const tabs = [
				["play", "플레이"],
				["challenges", "도전"],
				["library", "라이브러리"],
				["playlists", "재생 목록"],
				["settings", "설정"],
			];
			const bar = h(
				"div",
				{ class: "rh-tabs", role: "group", "aria-label": "리듬 게임 메뉴" },
				tabs.map(([id, label]) => button(label, () => this.menu(id), { "aria-pressed": tab === id ? "true" : "false", class: "rh-tab" }))
			);
			const head = h(
				"div",
				{ class: "rh-masthead", "aria-hidden": "true" },
				h("span", { class: "rh-wordmark" }, "리듬"),
				h("span", { class: "rh-mast-line" })
			);
			const page = h("div", { class: `rh-page rh-page--${tab}` });
			this.show(h("div", { class: "rh-menu" }, head, bar, page));
			const fillTab = {
				play: this.playTab,
				challenges: this.challengesTab,
				library: this.libraryTab,
				playlists: this.playlistsTab,
				settings: this.settingsTab,
			}[tab];
			if (tab !== "play") this.previewSelected();
			return fillTab
				.call(this, page)
				.then(screen => {
					/* A tab with something to undo on leaving (Settings waiting for a key) hands back its teardown. */
					if (screen && screen.destroy && this.body.contains(page)) this.cleanup = screen;
				})
				.catch(e => {
					console.error("Rhythm game menu failed", e);
					page.replaceChildren(h("p", { class: "rh-error", role: "alert" }, L().storageMessage(e)));
				});
		}

		storageNote() {
			return L().persistent
				? null
				: h("p", { class: "rh-note" }, "이 브라우저에서는 게임이 리듬 라이브러리를 보관할 수 없어, 추가한 곡은 페이지를 닫을 때까지만 유지됩니다.");
		}

		/* ---- Play tab ---- */

		/* The Play tab: the selected song's stage (cover, details, difficulty, best, Play) and the song list. There is one
		 * difficulty, R().settings().level; every part that shows it is redrawn from it whenever it changes. */
		async playTab(page) {
			await L().open();
			const lists = await L().listPlaylists();
			if (!this.root || !page.isConnected) return;
			if (this.source !== "builtin" && this.source !== "library" && !lists.some(p => p.id === this.source)) this.source = "builtin";
			const select = h(
				"select",
				{
					class: "rh-select",
					"aria-label": "표시할 곡",
					onchange: e => {
						this.source = e.target.value;
						this.selected = null;
						this.menu("play");
					},
				},
				h("option", { value: "builtin" }, "게임에 포함된 곡"),
				h("option", { value: "library" }, "내 리듬 라이브러리"),
				lists.map(p => h("option", { value: p.id }, `재생 목록: ${p.name}`))
			);
			select.value = this.source;
			let songs;
			if (this.source === "builtin") songs = setup.rhythmBuiltins.map(b => L().builtinSong(b));
			else if (this.source === "library") songs = (await L().listSongs()).sort((a, b) => a.title.localeCompare(b.title));
			else {
				const list = lists.find(p => p.id === this.source);
				songs = (await Promise.all(list.songs.map(id => L().getSong(id)))).filter(Boolean);
			}
			const missing = new Set();
			const audioFound = await Promise.all(songs.map(song => (song.builtin ? true : L().getAudio(song.id))));
			if (!this.root || !page.isConnected) return;
			songs.forEach((song, i) => {
				if (!audioFound[i]) missing.add(song.id);
			});
			if (!songs.some(s => s.id === this.selected)) this.selected = songs[0]?.id ?? null;

			const stage = h("section", { class: "rh-stage", "aria-label": "선택한 곡" });
			const list = h("ul", { class: "rh-picks", "aria-label": "곡 목록" });
			/* The stage, in the selected song's colours; the menu preview follows the selection. */
			const drawStage = () => {
				const song = songs.find(s => s.id === this.selected);
				stage.setAttribute("style", song ? lookStyle(song) : "");
				stage.replaceChildren(...(song ? this.stage(song, R().settings().level, missing.has(song.id), draw) : []));
				if (song) this.preview(song);
				else this.stopPreview();
			};
			/* Picking a song only moves the selection mark; the rows are rebuilt when the difficulty (and so the grades)
			 * changes. */
			const mark = () => {
				for (const row of list.querySelectorAll(".rh-pick")) {
					const on = row.dataset.song === this.selected;
					row.setAttribute("aria-pressed", on ? "true" : "false");
					row.querySelector(".rh-pick-mark").textContent = on ? "●" : "›";
				}
			};
			const draw = () => {
				const level = R().settings().level;
				drawStage();
				list.replaceChildren(
					...songs.map(s => {
						const own = !L().builtin(s.id);
						const best = own ? s.best?.[level] : R().data().best[`${s.id}|${level}`];
						const selected = s.id === this.selected;
						return h(
							"li",
							{ class: "rh-pick-item" },
							h(
								"button",
								{
									type: "button",
									class: "rh-pick",
									"data-song": s.id,
									"aria-pressed": selected ? "true" : "false",
									onclick: () => {
										if (this.selected === s.id) return;
										this.selected = s.id;
										mark();
										drawStage();
										/* On a narrow screen the stage sits above the list: bring it into view. */
										if (stage.getBoundingClientRect().top < 0) stage.scrollIntoView({ block: "start", behavior: R().settings().reduced ? "auto" : "smooth" });
									},
								},
								cover(s, { small: true }),
								h(
									"span",
									{ class: "rh-pick-text" },
									h("span", { class: "rh-song-title" }, s.title),
									h("span", { class: "rh-song-sub" }, `${s.artist || "알 수 없는 아티스트"} · ${Math.round(s.bpm)} BPM · ${time(s.duration)}`)
								),
								missing.has(s.id) ? h("span", { class: "rh-tag rh-tag--warn" }, "음원 없음") : null,
								h(
									"span",
									{
										class: `rh-pick-grade${best ? "" : " rh-pick-grade--none"}`,
										"aria-label": best ? `${({ easy: "쉬움", normal: "보통", hard: "어려움" })[level] || levelName(level)} 최고 기록: ${best.grade}등급` : `${({ easy: "쉬움", normal: "보통", hard: "어려움" })[level] || levelName(level)}: 플레이한 적 없음`,
									},
									best ? best.grade : "–"
								),
								h("span", { class: "rh-pick-mark", "aria-hidden": "true" }, selected ? "●" : "›")
							)
						);
					})
				);
			};
			draw();

			const playAll =
				this.source !== "builtin" && songs.length > 1
					? button("순서대로 모두 재생", () => {
							this.queue = { ids: songs.map(s => s.id), index: 0 };
							this.startById(songs[0].id, R().settings().level);
					  })
					: null;
			put(
				page,
				this.tutorialOffer(),
				this.dailyBanner(songs, draw),
				h(
					"div",
					{ class: `rh-select-layout${songs.length ? "" : " rh-select-layout--empty"}` },
					songs.length ? stage : null,
					h(
						"div",
						{ class: "rh-list-col" },
						h(
							"div",
							{ class: "rh-row rh-row--head" },
							select,
							playAll,
							button("튜토리얼", () => setup.rhythmTutorial.open(this))
						),
						songs.length
							? list
							: h(
									"p",
									{ class: "rh-note" },
									this.source === "library"
										? "라이브러리가 비어 있습니다. 라이브러리 탭에서 음악 파일을 추가하십시오."
										: "이 재생 목록이 비어 있습니다. 재생 목록 탭에서 곡을 추가하십시오."
							  )
					)
				),
				this.storageNote()
			);
		}

		/* The selected song's stage. Returns its children; `redraw` repaints the stage and list after a change. */
		stage(song, level, missing, redraw) {
			const own = !L().builtin(song.id);
			const bestOf = l => (own ? song.best?.[l] : R().data().best[`${song.id}|${l}`]);
			const best = bestOf(level);
			const levelsRow = h(
				"div",
				{ class: "rh-levels", role: "group", "aria-label": "난이도" },
				levels.map(l =>
					h(
						"button",
						{
							type: "button",
							class: `rh-level ${levelColour[l]}`,
							"aria-pressed": l === level ? "true" : "false",
							onclick: () => {
								R().setSetting("level", l);
								redraw();
								this.body.querySelector(`.rh-level.${levelColour[l]}`)?.focus({ preventScroll: true });
							},
						},
						h("span", { class: "rh-level-name" }, levelName(l)),
						h("span", { class: "rh-level-num", "aria-label": `레벨 ${chartLevel(song, l)}` }, String(chartLevel(song, l))),
						h("span", { class: "rh-level-best" }, bestOf(l) ? bestOf(l).grade : "–")
					)
				)
			);
			const notes = L().chartFor(song, level).notes.length;
			return [
				cover(song, { big: true }),
				h(
					"div",
					{ class: "rh-stage-info" },
					h("h3", { class: "rh-stage-title" }, song.title),
					h("span", { class: "rh-song-sub" }, song.artist || "알 수 없는 아티스트"),
					h("span", { class: "rh-stage-meta" }, `${Math.round(song.bpm)} BPM · ${time(song.duration)} · 노트 ${notes}개`),
					own ? h("span", { class: "rh-tag" }, "내 채보: 최고 점수만 기록되며 보상 없음") : null,
					missing ? h("span", { class: "rh-tag rh-tag--warn" }, "음원 없음") : null
				),
				levelsRow,
				h(
					"div",
					{ class: "rh-stage-foot" },
					h(
						"div",
						{ class: "rh-stage-best" },
						h("span", { class: "rh-k" }, `${({ easy: "쉬움", normal: "보통", hard: "어려움" })[level] || levelName(level)} 최고 기록`),
						h("span", { class: "rh-score" }, best ? pad7(best.score) : "-------"),
						h("span", { class: "rh-song-sub" }, best ? `${best.grade}${best.ap ? " · 올 퍼펙트" : best.fc ? " · 풀 콤보" : ""}` : "아직 플레이하지 않음")
					),
					missing
						? button("음원 연결", () => this.relink(song), { class: "rh-btn rh-play" })
						: button(`${levelName(level)} 플레이`, () => this.start(song, level), {
								class: `rh-btn rh-play ${levelColour[level]}`,
								"aria-label": `${song.title} ${({ easy: "쉬움", normal: "보통", hard: "어려움" })[level] || levelName(level)} 난이도 재생`,
						  })
				),
			];
		}

		/* Today's daily challenge, in short, above the song list. */
		dailyBanner(songs, redraw) {
			if (this.source !== "builtin") return null;
			const c = R().daily();
			const day = R().data().daily[c.date];
			return h(
				"div",
				{ class: "rh-daily-strip" },
				h("span", { class: "rh-k" }, "오늘의 도전"),
				h("span", { class: "rh-daily-goal" }, c.goal),
				h(
					"span",
					{ class: "rh-song-sub" },
					day?.done ? "오늘 완료" : `완료 시 ${formatMoney(c.reward)} · ${setup.consoleDaily.untilReset()} 후 초기화`
				),
				day?.done
					? null
					: button("선택", () => {
							R().setSetting("level", c.level);
							this.selected = c.songId;
							redraw();
					  })
			);
		}

		/* The first-time offer of the tutorial, until the player takes it or turns it down. */
		tutorialOffer() {
			const d = R().data();
			if (d.tutorial) return null;
			const card = h(
				"div",
				{ class: "rh-offer" },
				h("strong", null, "리듬 게임이 처음이십니까?"),
				h("span", null, "짧은 튜토리얼에서 느린 연습 박자에 맞춰 선, 탭, 홀드, 드래그, 쌍 노트를 터치, 마우스, 키보드로 연습해 볼 수 있습니다."),
				h(
					"div",
					{ class: "rh-row" },
					button("튜토리얼 시작", () => setup.rhythmTutorial.open(this), { class: "rh-btn rh-btn--main" }),
					button("나중에", () => {
						R().finishTutorial("skipped");
						card.remove();
					})
				)
			);
			return card;
		}

		/* ---- the game ---- */

		async startById(id, level) {
			const screen = this.screenVersion;
			const song = await L().getSong(id);
			if (!this.root || screen !== this.screenVersion) return;
			if (song) this.start(song, level);
			else this.menu("play");
		}

		async start(song, level) {
			if (this.busy) return;
			const screen = this.screenVersion;
			if (V.options?.audio !== 1) {
				this.notice("옵션에서 게임 소리가 꺼져 있는데, 이 게임은 음악이 필요합니다. 플레이하려면 소리를 켜십시오.");
				return;
			}
			const chart = L().chartFor(song, level);
			if (!chart.notes.length) {
				this.notice(`이 곡의 ${({ easy: "쉬움", normal: "보통", hard: "어려움" })[level] || levelName(level)} 채보에는 노트가 없습니다. 채보 편집기에서 열어 노트를 추가하십시오.`);
				return;
			}
			this.busy = true;
			this.stopPreview();
			let src;
			try {
				src = await this.audioSource(song);
			} catch (e) {
				this.busy = false;
				this.notice(L().storageMessage(e));
				return;
			}
			this.busy = false;
			if (!this.root || screen !== this.screenVersion || src.cancelled) return;
			if (src.missing) {
				this.relink(song);
				return;
			}
			if (window.PocketMusic?.active) window.PocketMusic.stop(false);
			this.game(song, level, chart, src.src);
		}

		/* A one-message screen with a way back. */
		notice(text) {
			this.show(
				h(
					"div",
					{ class: "rh-notice" },
					h("p", { role: "alert" }, text),
					button("곡 목록으로 돌아가기", () => this.menu(), { "data-autofocus": true })
				)
			);
		}

		game(song, level, chart, src) {
			this.selected = song.id;
			const s = R().settings();
			const audio = this.audio;
			const eligible = !!L().builtin(song.id) && !chart.edited;
			const notes = chart.notes.map(n => ({ ...n }));
			const hud = {
				score: h("span", { class: "rh-hud-score" }, "0000000"),
				combo: h("span", { class: "rh-hud-combo" }, "0"),
				comboLabel: h("span", { class: "rh-hud-k" }, "콤보"),
				acc: h("span", { class: "rh-hud-acc" }, "100.00%"),
				judge: h("span", { class: "rh-judge" }, "\u00a0"),
			};
			const progress = h("span", { class: "rh-progress-fill" });
			const canvas = h("canvas", {
				class: "rh-canvas",
				"aria-label": `${song.title}. 선이 노트를 가로지를 때 노트를 탭하거나 클릭하고, 또는 레인 키(${keyLabels().join(" ")})를 사용하십시오. P 또는 Escape 키로 일시정지합니다.`,
			});
			const overlay = h("div", { class: "rh-overlay", role: "dialog", "aria-modal": "false", "aria-labelledby": "rh-overlay-title" });
			const field = h("div", { class: "rh-field", "data-gesture-owner": "rhythm" }, canvas, overlay);
			const pauseBtn = h(
				"button",
				{ type: "button", class: "rh-btn rh-pause", onclick: () => pause(), "aria-keyshortcuts": "P Escape", "aria-label": "일시정지" },
				h("span", { class: "rh-pause-icon", "aria-hidden": "true" })
			);
			const el = h(
				"div",
				{ class: "rh-game" },
				h(
					"div",
					{ class: "rh-hud-bar" },
					h("span", { class: "rh-progress", "aria-hidden": "true" }, progress),
					pauseBtn,
					h("div", { class: "rh-hud-mid" }, hud.combo, hud.comboLabel),
					h("div", { class: "rh-hud-right" }, hud.score, h("span", { class: "rh-hud-sub" }, hud.acc, " ", hud.judge))
				),
				field,
				h(
					"div",
					{ class: "rh-game-foot" },
					h("span", { class: "rh-song-title" }, song.title),
					h("span", { class: "rh-song-sub" }, song.artist || ""),
					h("span", { class: `rh-lv-tag ${levelColour[level]}` }, `${levelName(level)} ${chartLevel(song, level)}`)
				)
			);

			let phase = "loading"; // loading, held (paused while loading), countdown, playing, paused, results, error
			let play = null;
			let countdownTimer = 0;
			let pausedAt = 0;
			let ourPause = false;
			let observer = null;

			const setOverlay = (title, text, buttons = [], light = false) => {
				overlay.classList.toggle("rh-overlay--light", light);
				fill(
					overlay,
					h("span", { class: "rh-overlay-title", id: "rh-overlay-title" }, title),
					text ? h("span", { class: "rh-overlay-text" }, text) : null,
					buttons.length ? h("div", { class: "rh-overlay-buttons" }, buttons) : null
				);
				overlay.hidden = false;
				const first = overlay.querySelector("button");
				if (first) first.focus({ preventScroll: true });
			};
			const hideOverlay = () => {
				overlay.hidden = true;
				overlay.replaceChildren();
			};

			const audioPause = () => {
				ourPause = true;
				audio.pause();
				Promise.resolve().then(() => (ourPause = false));
			};

			const onHud = (st, result) => {
				hud.score.textContent = pad7(st.score);
				hud.combo.textContent = String(st.combo);
				hud.combo.classList.toggle("rh-hud-combo--zero", st.combo === 0);
				hud.acc.textContent = `${st.acc.toFixed(2)}%`;
				progress.style.width = `${Math.round(st.progress * 100)}%`;
				if (result) {
					hud.judge.textContent = { perfect: "퍼펙트", good: "굿", miss: "미스", hold: "홀드 중" }[result];
					hud.judge.className = `rh-judge rh-judge--${result}`;
				}
			};

			const build = () => {
				play = new (R().Play)({
					canvas,
					song,
					notes,
					level,
					audio,
					offsetMs: s.offset + (song.trim || 0),
					reduced: s.reduced,
					onHud,
					onEnd: result => finish(result),
				});
				if (lanesAtStart()) play.field.lanes = keyLabels();
				onHud(play.summary());
			};

			/* Counts 3, 2, 1 over a still field, then starts (or resumes) the music. */
			const countdown = (from, then) => {
				phase = "countdown";
				let n = 3;
				const tick = () => {
					if (!this.root || phase !== "countdown") return;
					if (n === 0) {
						hideOverlay();
						then();
						return;
					}
					/* A see-through count over the field as it will be when play starts, so the first notes can be read. */
					setOverlay(String(n), null, [], true);
					play.still(from);
					if (n === 3) setup.consoleSfx?.play("rhythm-start");
					n--;
					countdownTimer = this.later(tick, 650);
				};
				tick();
			};

			const run = () => {
				play.stop();
				audio.volume = Math.max(0, Math.min(1, (V.options?.mastervolume ?? 1) * s.music));
				phase = "playing";
				const p = audio.play();
				if (p && p.catch)
					p.catch(() => {
						if (phase !== "playing") return;
						/* The browser wants a fresh tap before it plays sound. */
						phase = "paused";
						play.stop();
						setOverlay("탭하여 음악 시작", "브라우저가 소리를 재생하기 전에 탭을 기다리고 있습니다.", [
							button("시작", () => countdown(play.time(), run)),
						]);
					});
				play.start();
			};

			const pause = () => {
				/* Still loading: nothing to pause yet, but the way out is always there. */
				if (phase === "loading") {
					phase = "held";
					setOverlay("일시정지", "곡을 아직 불러오는 중입니다.", [
						button("계속하기", () => {
							phase = "loading";
							setOverlay("곡을 불러오는 중", null);
							waitReady();
						}),
						button("곡 목록으로 나가기", () => quit()),
					]);
					return;
				}
				if (phase !== "playing" && phase !== "countdown") return;
				clearTimeout(countdownTimer);
				phase = "paused";
				play.stop();
				/* Lifts during the pause are never seen, so every finger and key is let go now. */
				play.settleInputs();
				input.releaseAll();
				audioPause();
				pausedAt = play.time();
				play.still(pausedAt);
				setOverlay("일시정지", `${time(Math.max(0, audio.currentTime))} / ${time(song.duration)}`, [
					button("계속하기", () => countdown(pausedAt, run)),
					button("다시 시작", () => restart()),
					button("곡 목록으로 나가기", () => quit()),
				]);
			};

			const restart = () => {
				clearTimeout(countdownTimer);
				if (play) play.stop();
				input.releaseAll();
				audioPause();
				audio.currentTime = 0;
				build();
				countdown(0, run);
			};

			const quit = () => {
				this.queue = null;
				this.menu("play");
			};

			const finish = async result => {
				phase = "results";
				audioPause();
				let outcome = { newBest: false, paid: 0, unlocked: [] };
				if (eligible) outcome = R().record({ ...result, songId: song.id, level }, true);
				else {
					outcome = R().record({ custom: !L().builtin(song.id) }, false);
					/* Your own songs keep their best on the song itself, in the library. */
					if (!L().builtin(song.id)) {
						try {
							const stored = await L().getSong(song.id);
							if (stored) {
								stored.best = stored.best || {};
								const old = stored.best[level];
								if (!old || result.score > old.score) {
									stored.best[level] = { score: result.score, grade: result.grade, fc: result.fc || !!old?.fc, ap: result.ap || !!old?.ap };
									outcome.newBest = !!old;
									await L().saveSong(stored);
								} else if ((result.fc && !old.fc) || (result.ap && !old.ap)) {
									old.fc = old.fc || result.fc;
									old.ap = old.ap || result.ap;
									await L().saveSong(stored);
								}
							}
						} catch (e) {
							console.warn("Rhythm game: could not store the result", e);
							outcome.storageError = L().storageMessage(e);
						}
					}
				}
				if (!this.root || phase !== "results") return;
				setup.consoleSfx?.play(result.cleared ? "rhythm-clear" : "rhythm-fail");
				/* A moment on the field to see how it ended, then the results. */
				setOverlay(result.ap ? "올 퍼펙트" : result.fc ? "풀 콤보" : result.cleared ? "클리어" : "곡 종료", null, [], true);
				this.later(() => {
					if (phase === "results" && el.isConnected) this.results(song, level, result, outcome, eligible);
				}, 1100);
			};

			/* ---- input ---- */
			/* Key labels appear on the field the first time a lane key is used, unless the player turned them off. */
			const input = bindInput(
				canvas,
				field,
				() => (phase === "playing" ? play : null),
				() => {
					if (play && !play.field.lanes && R().settings().laneLabels !== "never") play.field.lanes = keyLabels();
				}
			);
			const keydown = e => {
				if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
				if ((e.code === "Escape" || e.code === "KeyP") && (phase === "playing" || phase === "countdown")) {
					e.preventDefault();
					pause();
					return;
				}
				input.keydown(e);
			};
			const keyup = e => input.keyup(e);

			/* Audio events: a stall just freezes the clock; an outside pause (headphones unplugged, a call) pauses the game. */
			const onAudioPause = () => {
				if (!ourPause && phase === "playing" && !audio.ended) pause();
			};
			const onAudioError = () => {
				if (phase === "results" || !audio.getAttribute("src")) return;
				phase = "error";
				if (play) play.stop();
				setOverlay("이 곡을 재생할 수 없습니다", "브라우저가 음원 파일을 읽지 못했습니다. 직접 추가한 곡이라면 라이브러리 탭에서 파일을 다시 연결하십시오.", [
					button("곡 목록으로 돌아가기", () => quit()),
				]);
			};
			audio.addEventListener("pause", onAudioPause);
			audio.addEventListener("error", onAudioError);

			const resize = () => {
				if (!play) return;
				play.field.resize();
				if (phase !== "playing") play.still(phase === "paused" ? pausedAt : 0);
			};

			this.show(el, {
				visibility: () => {
					if (document.hidden) pause();
				},
				keydown,
				keyup,
				/* Switching windows loses key releases, so pause and forget held inputs. */
				blur: () => {
					pause();
					input.releaseAll();
				},
				destroy: () => {
					clearTimeout(countdownTimer);
					phase = "closed";
					if (play) play.stop();
					audio.removeEventListener("pause", onAudioPause);
					audio.removeEventListener("error", onAudioError);
					if (observer) observer.disconnect();
					audioPause();
				},
			});

			/* ---- load, then count in ---- */
			build();
			if (window.ResizeObserver) {
				observer = new ResizeObserver(resize);
				observer.observe(field);
			}
			play.still(0);
			setOverlay("곡을 불러오는 중", null);
			if (audio.getAttribute("src") !== src) {
				audio.src = src;
				audio.load();
			} else audio.currentTime = 0;
			/* Unlock playback inside this tap, for browsers that only allow sound straight after one. */
			audio.muted = true;
			const unlock = audio.play();
			if (unlock && unlock.then)
				unlock
					.then(() => {
						if (phase === "loading") audioPause();
					})
					.catch(() => {})
					.finally(() => {
						audio.muted = false;
					});
			else audio.muted = false;
			const started = performance.now();
			const waitReady = () => {
				if (!this.root || phase !== "loading") return;
				if (audio.readyState >= 3) {
					audioPause();
					audio.currentTime = 0;
					audio.muted = false;
					countdown(0, run);
					return;
				}
				if (audio.error || performance.now() - started > 20000) {
					onAudioError();
					return;
				}
				this.later(waitReady, 100);
			};
			waitReady();
		}

		results(song, level, r, outcome, eligible) {
			const s = R().settings();
			const extra = [];
			if (outcome.storageError) extra.push(outcome.storageError);
			if (outcome.newBest) extra.push("이 곡의 최고 기록을 경신했습니다.");
			if (outcome.paid) extra.push(`오늘의 콘솔 보상: ${formatMoney(outcome.paid)}.`);
			for (const a of outcome.unlocked) extra.push(`업적 달성: ${a}.`);
			if (!eligible) extra.push("직접 추가했거나 편집한 채보는 최고 점수를 기록하지만 보상은 지급되지 않습니다.");
			let offsetBlock = null;
			if (r.meanError !== null && Math.abs(r.meanError) >= 15) {
				const way = r.meanError > 0 ? "late" : "early";
				const next = Math.max(-300, Math.min(300, s.offset + r.meanError));
				offsetBlock = h(
					"div",
					{ class: "rh-offset-tip" },
					h("p", null, `평균적으로 ${Math.abs(r.meanError)} ms ${r.meanError > 0 ? "늦게" : "일찍"} 쳤습니다. 그 느낌이 맞다면 타이밍 오프셋으로 보정할 수 있습니다.`),
					button(`타이밍 오프셋을 ${next} ms로 설정`, e => {
						R().setSetting("offset", next);
						e.currentTarget.disabled = true;
						e.currentTarget.textContent = `타이밍 오프셋이 이제 ${next} ms입니다`;
					})
				);
			}
			const queue = this.queue;
			const hasNext = queue && queue.index + 1 < queue.ids.length;
			const buttons = [
				hasNext
					? button(
							"다음 곡",
							() => {
								queue.index++;
								this.startById(queue.ids[queue.index], level);
							},
							{ "data-autofocus": true }
					  )
					: null,
				button("다시 하기", () => this.start(song, level), hasNext ? {} : { "data-autofocus": true }),
				button("곡 목록으로 돌아가기", () => {
					this.queue = null;
					this.menu("play");
				}),
			];
			const share = n => `${r.total ? (n / r.total) * 100 : 0}%`;
			const rewards = [...(outcome.completed || []).map(name => `도전 완료: ${name}.`), ...(outcome.feat ? [`업적 달성: ${({ "Rhythm Master": "리듬 마스터" })[R().masterFeat] || R().masterFeat}.`] : [])];
			if (outcome.daily)
				rewards.unshift(
					outcome.daily.met
						? outcome.daily.first
							? "오늘의 도전을 완료했습니다."
							: "오늘의 도전을 다시 달성했습니다(오늘 이미 완료함)."
						: "이번에는 오늘의 도전을 달성하지 못했습니다."
				);
			this.show(
				h(
					"div",
					{ class: `rh-results rh-results--${r.grade}` },
					h(
						"div",
						{ class: "rh-result-head" },
						cover(song),
						h(
							"div",
							{ class: "rh-result-song" },
							h("h3", { class: "rh-stage-title" }, song.title),
							h("span", { class: `rh-lv-tag ${levelColour[level]}` }, `${levelName(level)} ${chartLevel(song, level)}`)
						)
					),
					h(
						"div",
						{ class: "rh-result-top" },
						h("div", { class: "rh-grade", "aria-label": `${r.grade}등급` }, r.grade),
						h(
							"div",
							{ class: "rh-result-main" },
							h("span", { class: "rh-result-verdict" }, r.ap ? "올 퍼펙트" : r.fc ? "풀 콤보" : r.cleared ? "클리어" : "클리어 실패"),
							h("span", { class: "rh-score rh-score--big" }, pad7(r.score)),
							h("span", { class: "rh-song-sub" }, `정확도 ${r.acc.toFixed(2)}% · 최대 콤보 ${r.maxCombo} / ${r.total}`)
						)
					),
					h(
						"div",
						{ class: "rh-split", role: "img", "aria-label": `퍼펙트 ${r.perfect}, 굿 ${r.good}, 미스 ${r.miss}` },
						h("span", { class: "rh-split-perfect", style: `width: ${share(r.perfect)}` }),
						h("span", { class: "rh-split-good", style: `width: ${share(r.good)}` }),
						h("span", { class: "rh-split-miss", style: `width: ${share(r.miss)}` })
					),
					h(
						"div",
						{ class: "rh-counts" },
						[
							["퍼펙트", r.perfect, "perfect"],
							["굿", r.good, "good"],
							["미스", r.miss, "miss"],
						].map(([k, v, c]) =>
							h("span", { class: "rh-count" }, h("span", { class: `rh-k rh-judge--${c}` }, k), h("span", { class: "rh-count-v" }, String(v)))
						)
					),
					rewards.length || extra.length
						? h(
								"ul",
								{ class: "rh-extra" },
								[...rewards, ...extra].map(t => h("li", null, t))
						  )
						: null,
					offsetBlock,
					h("div", { class: "rh-row rh-result-actions" }, buttons)
				)
			);
			this.silence();
			this.say(`${r.cleared ? "클리어" : "클리어 실패"}, ${r.grade}등급, ${r.acc}퍼센트.`);
		}

		/* ---- Library tab ---- */

		async libraryTab(page) {
			await L().open();
			const input = h("input", {
				type: "file",
				accept: "audio/*,.mp3,.ogg,.oga,.wav,.m4a,.aac,.flac,.webm",
				class: "rh-file",
				"aria-label": "추가할 음악 파일",
			});
			const json = h("input", { type: "file", accept: "application/json,.json", class: "rh-file", "aria-label": "가져올 리듬 JSON 파일" });
			const progress = h("p", { class: "rh-progress-text", role: "status" });
			input.addEventListener("change", () => {
				const file = input.files && input.files[0];
				input.value = "";
				if (file) this.addFile(file, progress);
			});
			json.addEventListener("change", async () => {
				const file = json.files && json.files[0];
				json.value = "";
				if (file) this.importJson(file, progress);
			});
			const songs = (await L().listSongs()).sort((a, b) => a.title.localeCompare(b.title));
			const builtinPick = h(
				"select",
				{ class: "rh-select", "aria-label": "편집할 기본 곡" },
				setup.rhythmBuiltins.map(b => h("option", { value: b.id }, b.title))
			);
			const rows = h("ul", { class: "rh-songs" });
			for (const song of songs) {
				const missing = !song.builtin && !(await L().getAudio(song.id));
				rows.append(
					h(
						"li",
						{ class: "rh-song" },
						cover(song, { small: true }),
						h(
							"div",
							{ class: "rh-song-main" },
							h("span", { class: "rh-song-title" }, song.title),
							h("span", { class: "rh-song-sub" }, `${song.artist || "알 수 없는 아티스트"} · ${Math.round(song.bpm)} BPM · ${time(song.duration)}`),
							missing ? h("span", { class: "rh-tag rh-tag--warn" }, "음원 없음") : null
						),
						h(
							"div",
							{ class: "rh-song-actions" },
							button("세부 정보와 타이밍", () => this.details(song.id)),
							button("채보 편집", () => this.edit(song.id)),
							missing ? button("음원 연결", () => this.relink(song)) : null
						)
					)
				);
			}
			put(
				page,
				h("h3", { class: "rh-head" }, "리듬 라이브러리"),
				h(
					"p",
					null,
					"이 기기의 음악 파일(MP3, OGG, WAV 등 브라우저가 재생할 수 있는 형식)을 추가하십시오. 게임이 박자를 분석해 쉬움, 보통, 어려움 채보를 만듭니다. 파일은 이 브라우저에만 남으며 세이브에는 들어가지 않습니다."
				),
				h("p", { class: "rh-warning" }, warning),
				h(
					"div",
					{ class: "rh-row" },
					h("label", { class: "rh-btn rh-file-label" }, "음악 파일 추가", input),
					h("label", { class: "rh-btn rh-file-label" }, "채보 가져오기(JSON)", json),
					songs.length ? button("라이브러리 전체 내보내기", () => this.exportJson("library")) : null
				),
				progress,
				songs.length ? rows : h("p", { class: "rh-note" }, "아직 곡이 없습니다."),
				h("h4", { class: "con-subhead" }, "기본 곡 채보 편집"),
				h("p", { class: "rh-song-sub" }, "저장하면 편집한 사본이 라이브러리에 들어가며, 원래 곡과 그 보상은 그대로 남습니다."),
				h(
					"div",
					{ class: "rh-row" },
					builtinPick,
					button("채보 편집기에서 열기", () => this.edit(builtinPick.value))
				),
				this.storageNote()
			);
		}

		/* Reads, fingerprints, decodes and analyses one audio file. Returns { file, fingerprint, analysis } or throws. */
		async readAudio(file, say) {
			const lim = L().limits;
			if (file.size > lim.audioBytes) throw new Error(`이 파일은 ${lim.audioBytes / 1024 / 1024} MB를 넘습니다. 더 짧은 곡이나 더 작은 파일을 고르십시오.`);
			if (file.type && !file.type.startsWith("audio/") && !file.type.startsWith("video/")) throw new Error("음악 파일이 아닌 것 같습니다.");
			say("파일을 읽는 중...");
			const bytes = await file.arrayBuffer();
			const fingerprint = L().fingerprint(bytes);
			say("음악을 디코딩하는 중...");
			const AC = window.OfflineAudioContext || window.webkitOfflineAudioContext;
			if (!AC) throw new Error("이 브라우저는 분석을 위해 음악 파일을 해독할 수 없습니다.");
			const ctx = new AC(1, 2, 44100);
			let buffer;
			try {
				buffer = await new Promise((resolve, reject) => {
					const p = ctx.decodeAudioData(bytes, resolve, reject);
					if (p && p.then) p.then(resolve, reject);
				});
			} catch (e) {
				throw new Error("브라우저가 그 파일을 해독하지 못했습니다. MP3, OGG, WAV 파일로 시도하십시오.");
			}
			if (buffer.duration > lim.audioSeconds) throw new Error(`이 곡은 ${lim.audioSeconds / 60}분을 넘습니다. 더 짧은 곡을 고르십시오.`);
			if (buffer.duration < 10) throw new Error("이 파일은 10초도 되지 않아 채보를 만들기에 너무 짧습니다.");
			say("박자를 찾는 중...");
			await new Promise(resolve => setTimeout(resolve, 30));
			const analysis = setup.rhythmAnalysis.analyse(buffer);
			return { fingerprint, analysis, duration: buffer.duration };
		}

		async addFile(file, progress) {
			if (this.busy) return;
			this.busy = true;
			const say = t => {
				progress.textContent = t;
				this.say(t);
			};
			try {
				const { fingerprint, analysis, duration } = await this.readAudio(file, say);
				const id = L().newId("s");
				const base = file.name.replace(/\.[^.]+$/, "");
				const [artist, title] = base.includes(" - ") ? [base.slice(0, base.indexOf(" - ")), base.slice(base.indexOf(" - ") + 3)] : ["", base];
				const song = {
					id,
					title: title.slice(0, 120) || "제목 없음",
					artist: artist.slice(0, 120),
					source: "file",
					audio: { name: file.name.slice(0, 200), size: file.size, type: (file.type || "").slice(0, 60), fingerprint },
					bpm: analysis.bpm,
					offset: analysis.offset,
					pageBeats: setup.rhythmAnalysis.pageBeats(analysis.bpm),
					duration: Math.round(duration * 1000) / 1000,
					trim: 0,
					analysis: { bpm: analysis.bpm, offset: analysis.offset, slots: analysis.slots, energy: analysis.energy },
					charts: {},
					created: Date.now(),
				};
				for (const level of levels) song.charts[level] = { notes: setup.rhythmAnalysis.generate(song, level).notes, edited: false };
				say("저장하는 중...");
				await L().saveSong(song, file);
				if (!this.root || !progress.isConnected) return;
				this.busy = false;
				this.menu("library");
				this.say(`추가함: ${song.title}, ${Math.round(song.bpm)} BPM.`);
			} catch (e) {
				say(e instanceof Error && !e.name.includes("Quota") && e.message ? e.message : L().storageMessage(e));
			} finally {
				this.busy = false;
			}
		}

		/* Link a file to a song whose audio is missing (or replace it). A different file than the one charted gets a
		 * warning, and the choice to keep the charts or regenerate them from the new file. */
		relink(song) {
			const input = h("input", {
				type: "file",
				accept: "audio/*,.mp3,.ogg,.oga,.wav,.m4a,.aac,.flac,.webm",
				class: "rh-file",
				"aria-label": "연결할 음악 파일",
			});
			const progress = h("p", { class: "rh-progress-text", role: "status" });
			const choice = h("div", { class: "rh-row" });
			const want = song.audio;
			input.addEventListener("change", async () => {
				const file = input.files && input.files[0];
				input.value = "";
				if (!file || this.busy) return;
				this.busy = true;
				try {
					const read = await this.readAudio(file, t => (progress.textContent = t));
					if (!this.root || !progress.isConnected) return;
					const fresh = await L().getSong(song.id);
					if (!fresh) throw new Error("그 곡은 더 이상 라이브러리에 없습니다.");
					const differences = [];
					if (want?.fingerprint && want.fingerprint !== read.fingerprint) differences.push("채보를 만든 파일과 똑같은 파일이 아닙니다");
					if (Math.abs(read.duration - fresh.duration) > 1.5) differences.push(`길이가 ${time(read.duration)}이며, 채보에 맞는 길이는 ${time(fresh.duration)}입니다`);
					const link = async regenerate => {
						if (fresh.audio?.fingerprint !== read.fingerprint) delete fresh.best;
						fresh.audio = { name: file.name.slice(0, 200), size: file.size, type: (file.type || "").slice(0, 60), fingerprint: read.fingerprint };
						if (regenerate) {
							fresh.analysis = { bpm: read.analysis.bpm, offset: read.analysis.offset, slots: read.analysis.slots, energy: read.analysis.energy };
							fresh.bpm = read.analysis.bpm;
							fresh.offset = read.analysis.offset;
							fresh.pageBeats = setup.rhythmAnalysis.pageBeats(fresh.bpm);
							fresh.duration = Math.round(read.duration * 1000) / 1000;
							for (const level of levels)
								if (!fresh.charts[level]?.edited) {
									fresh.charts[level] = { notes: setup.rhythmAnalysis.generate(fresh, level).notes, edited: false };
									if (fresh.best) delete fresh.best[level];
								}
						}
						await L().saveSong(fresh, file);
						if (!this.root || !progress.isConnected) return;
						this.menu("library");
						this.say(`음원을 연결했습니다: ${fresh.title}.`);
					};
					if (!differences.length) await link(false);
					else {
						progress.textContent = `이 파일은 맞지 않을 수 있습니다: ${differences.join("; ")}. 채보의 타이밍이 어긋날 수 있습니다.`;
						choice.replaceChildren(
							button("연결하고 채보 유지", () => link(false).catch(e => (progress.textContent = L().storageMessage(e)))),
							button("연결하고 편집하지 않은 채보 다시 만들기", () => link(true).catch(e => (progress.textContent = L().storageMessage(e)))),
							button("취소", () => this.menu("library"))
						);
					}
				} catch (e) {
					progress.textContent = e.message || L().storageMessage(e);
				} finally {
					this.busy = false;
				}
			});
			this.show(
				h(
					"div",
					{ class: "rh-notice" },
					h("h3", { class: "rh-head" }, `음원 연결: ${song.title}`),
					h(
						"p",
						null,
						want
							? `이 채보는 "${want.name}"${want.size ? `, ${(want.size / 1024 / 1024).toFixed(1)} MB` : ""} 파일로 만들었습니다. 그 곡의 사본을 고르십시오.`
							: "이 채보에 쓸 음악 파일을 고르십시오."
					),
					h("label", { class: "rh-btn rh-file-label" }, "파일 선택", input),
					progress,
					choice,
					button("뒤로", () => this.menu("library"))
				)
			);
		}

		async importJson(file, progress) {
			if (this.busy) return;
			if (file.size > L().limits.importBytes) {
				progress.textContent = "이 파일은 리듬 채보로 쓰기에는 너무 큽니다(8 MB 초과).";
				return;
			}
			this.busy = true;
			try {
				const data = L().parse(await file.text());
				const report = await L().merge(data);
				const parts = [];
				if (report.added.length) parts.push(`곡 ${report.added.length}${report.added.length === 1 ? "개" : "개"} 추가`);
				if (report.skipped.length) parts.push(`이미 라이브러리에 있어 ${report.skipped.length}개 건너뜀`);
				if (report.renamed.length) parts.push(`같은 ID의 다른 곡과 구분해 ${report.renamed.length}개 따로 보관`);
				if (report.playlists.length) parts.push(`재생 목록${report.playlists.length === 1 ? "" : ""} ${report.playlists.join(", ")} 추가`);
				const text = `가져오기 완료: ${parts.join(", ") || "새로운 것 없음"}.${
					report.missingAudio ? " 곡을 재생하기 전에 각 곡의 음원 사본을 직접 연결하십시오." : ""
				}`;
				if (!this.root || !progress.isConnected) return;
				await this.menu("library");
				const p = this.body.querySelector(".rh-progress-text");
				if (p) p.textContent = text;
				this.say(text);
			} catch (e) {
				progress.textContent = e instanceof L().ImportError ? `아무것도 가져오지 못했습니다. ${e.message}` : L().storageMessage(e);
			} finally {
				this.busy = false;
			}
		}

		async exportJson(kind, opts = {}) {
			try {
				const data = await L().exportData(kind, opts);
				if (!data.songs.length && !data.playlists.length) {
					this.say("아직 내보낼 것이 없습니다.");
					return;
				}
				const name = (opts.name || kind).replace(/[^A-Za-z0-9 _-]+/g, "").trim() || kind;
				const blob = new Blob([JSON.stringify(data, null, 1)], { type: "application/json" });
				saveAs(blob, `rhythm-${name}.json`);
				this.say("내보내기를 저장했습니다.");
			} catch (e) {
				this.say(e.message || "내보내기에 실패했습니다.");
			}
		}

		/* ---- one library song: details and timing ---- */

		async details(id) {
			const screen = this.screenVersion;
			const song = await L().getSong(id);
			if (!this.root || screen !== this.screenVersion) return;
			if (!song) return this.menu("library");
			/* A labelled input with a one-line explanation under it. */
			const field = (label, attrs, hint) => {
				const input = h("input", { class: "rh-input", ...attrs });
				return [
					h(
						"div",
						{ class: "rh-detail-field" },
						h("label", { class: "rh-field-row" }, h("span", null, label), input),
						hint ? h("span", { class: "rh-song-sub" }, hint) : null
					),
					input,
				];
			};
			const [titleRow, title] = field("제목", { type: "text", maxlength: 120, value: song.title });
			const [artistRow, artist] = field("아티스트", { type: "text", maxlength: 120, value: song.artist || "" });
			const [bpmRow, bpm] = field(
				"템포(BPM)",
				{ type: "number", min: 40, max: 300, step: 0.01, value: song.bpm },
				"분당 박자 수입니다. 잘 모르겠다면 곡을 재생하고 위의 '박자에 맞춰 여기 탭'을 사용하십시오."
			);
			const [offRow, off] = field(
				"첫 박자(ms)",
				{ type: "number", min: -10000, max: 60000, step: 1, value: song.offset },
				"파일의 시작에서 첫 박자까지의 거리입니다. 채보는 여기서부터 센 박자를 기준으로 만들어집니다."
			);
			const [trimRow, trim] = field(
				"노트 보정(ms)",
				{ type: "number", min: -500, max: 500, step: 1, value: song.trim || 0 },
				"채보를 다시 만들지 않고 이 곡의 모든 노트를 뒤로(플러스) 또는 앞으로(마이너스) 옮깁니다."
			);
			const pages = h(
				"select",
				{ class: "rh-select" },
				[2, 4, 8].map(b => h("option", { value: b }, `${b}박자`))
			);
			pages.value = String(song.pageBeats);
			const msg = h("p", { class: "rh-progress-text", role: "status" });

			/* Tap tempo: tap along to the music for a BPM estimate. */
			const taps = [];
			const tapOut = h("span", { class: "rh-song-sub" }, "모든 박자에 맞춰 8번 이상 탭하면 템포 칸이 채워집니다.");
			const tapBtn = button("박자에 맞춰 여기 탭", () => {
				const now = performance.now();
				if (taps.length && now - taps[taps.length - 1] > 2000) taps.length = 0;
				taps.push(now);
				if (taps.length >= 5) {
					const span = (taps[taps.length - 1] - taps[0]) / (taps.length - 1);
					const est = Math.round((60000 / span) * 10) / 10;
					if (est < 40 || est > 300) {
						tapOut.textContent = `${est} BPM이 나왔는데, 40에서 300 범위를 벗어났습니다. 음악에 맞춰 박자마다 한 번씩 탭하십시오.`;
						return;
					}
					tapOut.textContent = `탭 ${taps.length}번으로 약 ${est} BPM이 나와 템포 칸에 넣었습니다. 저장하면 유지됩니다.`;
					bpm.value = est;
				}
			});
			const preview = button("곡 재생", async () => {
				if (V.options?.audio !== 1) {
					msg.textContent = "옵션에서 게임 소리가 꺼져 있습니다.";
					return;
				}
				if (!this.audio.paused) {
					this.audio.pause();
					preview.textContent = "곡 재생";
					return;
				}
				this.stopPreview();
				const src = await this.audioSource(song);
				if (src.cancelled || !preview.isConnected) return;
				if (src.missing) {
					msg.textContent = "먼저 음원을 연결하십시오.";
					return;
				}
				if (this.audio.getAttribute("src") !== src.src) this.audio.src = src.src;
				this.audio.volume = Math.max(0, Math.min(1, (V.options?.mastervolume ?? 1) * R().settings().music));
				this.audio.play().catch(() => (msg.textContent = "브라우저가 재생하지 않았습니다."));
				preview.textContent = "곡 정지";
			});
			const remake = h(
				"select",
				{ class: "rh-select", "aria-label": "저장할 때 채보 처리" },
				h("option", { value: "" }, "채보를 그대로 유지"),
				h("option", { value: "unedited" }, "편집하지 않은 채보 다시 만들기"),
				h("option", { value: "all" }, "편집한 것을 포함해 모든 채보 다시 만들기")
			);

			const save = async regenerate => {
				const b = Number(bpm.value);
				const o = Math.round(Number(off.value));
				const tr = Math.round(Number(trim.value));
				if (!(b >= 40 && b <= 300)) {
					msg.textContent = "BPM은 40에서 300 사이여야 합니다.";
					return;
				}
				if (!(o >= -10000 && o <= 60000)) {
					msg.textContent = "첫 박자는 -10000에서 60000 ms 사이여야 합니다.";
					return;
				}
				if (!(tr >= -500 && tr <= 500)) {
					msg.textContent = "곡의 타이밍 오프셋은 -500에서 500 ms 사이여야 합니다.";
					return;
				}
				const fresh = await L()
					.getSong(id)
					.catch(e => {
						msg.textContent = L().storageMessage(e);
						return null;
					});
				if (!fresh) {
					if (!msg.textContent) msg.textContent = "그 곡은 더 이상 라이브러리에 없습니다.";
					return;
				}
				fresh.title =
					title.value
						.replace(/[\p{Cc}<>]/gu, "")
						.trim()
						.slice(0, 120) || "제목 없음";
				fresh.artist = artist.value
					.replace(/[\p{Cc}<>]/gu, "")
					.trim()
					.slice(0, 120);
				if (fresh.bpm !== b || fresh.offset !== o || fresh.trim !== tr || fresh.pageBeats !== Number(pages.value)) delete fresh.best;
				fresh.bpm = b;
				fresh.offset = o;
				fresh.trim = tr;
				fresh.pageBeats = Number(pages.value);
				if (regenerate)
					for (const level of levels)
						if (!fresh.charts[level]?.edited || regenerate === "all") {
							fresh.charts[level] = { notes: setup.rhythmAnalysis.generate(fresh, level).notes, edited: false };
							if (fresh.best) delete fresh.best[level];
						}
				try {
					await L().saveSong(fresh);
					msg.textContent = regenerate ? "저장했고, 이 타이밍으로 채보를 다시 만들었습니다." : "저장했습니다.";
				} catch (e) {
					msg.textContent = L().storageMessage(e);
				}
			};

			const meta = h(
				"dl",
				{ class: "con-facts" },
				h("dt", null, "음원 파일"),
				h(
					"dd",
					null,
					song.audio
						? `${song.audio.name || "이름 없음"}${song.audio.size ? `, ${(song.audio.size / 1024 / 1024).toFixed(1)} MB` : ""}`
						: song.builtin
						? "게임에 내장"
						: "없음"
				),
				h("dt", null, "길이"),
				h("dd", null, time(song.duration)),
				h("dt", null, "감지된 템포"),
				h("dd", null, song.analysis ? `${song.analysis.bpm} BPM, 첫 박자 ${song.analysis.offset} ms 지점` : "분석되지 않음"),
				levels.map(l => {
					const c = L().chartFor(song, l);
					return [h("dt", null, levelName(l)), h("dd", null, `노트 ${c.notes.length}개${c.edited ? ", 직접 편집함" : ""}`)];
				})
			);
			const confirmDelete = h("div", { class: "rh-row", hidden: true });
			confirmDelete.append(
				h("span", null, "이 곡과 채보, 음원을 라이브러리에서 삭제하시겠습니까?"),
				button("예, 삭제합니다", async () => {
					try {
						await L().deleteSong(id);
					} catch (e) {
						msg.textContent = L().storageMessage(e);
						return;
					}
					this.menu("library");
				}),
				button("유지", () => (confirmDelete.hidden = true))
			);
			const back = button("라이브러리로 돌아가기", () => this.menu("library"));
			this.show(
				h(
					"div",
					{ class: "rh-details" },
					h("div", { class: "rh-row rh-row--head" }, back),
					h("h3", { class: "rh-head" }, song.title),
					meta,
					h("section", { class: "rh-panel" }, h("h4", { class: "rh-panel-head" }, "곡"), titleRow, artistRow),
					h(
						"section",
						{ class: "rh-panel" },
						h("h4", { class: "rh-panel-head" }, "타이밍"),
						h("p", { class: "rh-warning" }, warning),
						h("div", { class: "rh-row" }, preview, tapBtn),
						tapOut,
						bpmRow,
						offRow,
						trimRow,
						h(
							"div",
							{ class: "rh-detail-field" },
							h("label", { class: "rh-field-row" }, h("span", null, "선 이동 주기"), pages),
							h("span", { class: "rh-song-sub" }, "선이 필드를 한 번 가로지르는 데 걸리는 박자 수입니다.")
						),
						h("label", { class: "rh-field-row" }, h("span", null, "저장할 때"), remake),
						h(
							"div",
							{ class: "rh-row" },
							button("저장", () => save(remake.value === "all" ? "all" : !!remake.value), { class: "rh-btn rh-btn--main" })
						),
						msg
					),
					h(
						"section",
						{ class: "rh-panel" },
						h("h4", { class: "rh-panel-head" }, "채보와 음원 파일"),
						h(
							"div",
							{ class: "rh-row" },
							button("채보 편집", () => this.edit(id)),
							button("이 곡의 채보 내보내기", () => this.exportJson("song", { songIds: [id], name: song.title })),
							button("음원 파일 교체", () => this.relink(song))
						),
						h(
							"div",
							{ class: "rh-row" },
							button("이 곡 삭제", () => (confirmDelete.hidden = false), { class: "rh-btn rh-btn--danger" })
						),
						confirmDelete
					)
				),
				{ destroy: () => this.stopPreview() }
			);
		}

		edit(id) {
			setup.rhythmEditor.open(this, id);
		}

		/* ---- Playlists tab ---- */

		async playlistsTab(page) {
			await L().open();
			const lists = await L().listPlaylists();
			const name = h("input", { type: "text", class: "rh-input", maxlength: 80, placeholder: "재생 목록 이름", "aria-label": "새 재생 목록 이름" });
			const msg = h("p", { class: "rh-progress-text", role: "status" });
			const create = async () => {
				const n = name.value
					.replace(/[\p{Cc}<>]/gu, "")
					.trim()
					.slice(0, 80);
				if (!n) {
					msg.textContent = "먼저 재생 목록에 이름을 지어 주십시오.";
					return;
				}
				try {
					await L().savePlaylist({ id: L().newId("p"), name: n, songs: [], order: lists.length });
					this.menu("playlists");
				} catch (e) {
					msg.textContent = L().storageMessage(e);
				}
			};
			name.addEventListener("keydown", e => e.key === "Enter" && create());
			put(
				page,
				h("h3", { class: "rh-head" }, "재생 목록"),
				h("div", { class: "rh-row" }, name, button("재생 목록 만들기", create)),
				msg,
				lists.length
					? h(
							"ul",
							{ class: "rh-songs" },
							lists.map(p =>
								h(
									"li",
									{ class: "rh-song" },
									h(
										"div",
										{ class: "rh-song-main" },
										h("span", { class: "rh-song-title" }, p.name),
										h("span", { class: "rh-song-sub" }, `곡 ${p.songs.length}개`)
									),
									button("열기", () => this.playlist(p.id))
								)
							)
					  )
					: h("p", { class: "rh-note" }, "아직 재생 목록이 없습니다. 재생 목록에는 기본 곡과 직접 추가한 곡을 섞어 넣을 수 있습니다."),
				this.storageNote()
			);
		}

		async playlist(id) {
			const screen = this.screenVersion;
			const list = (await L().listPlaylists()).find(p => p.id === id);
			if (!this.root || screen !== this.screenVersion) return;
			if (!list) return this.menu("playlists");
			const all = [...setup.rhythmBuiltins.map(b => L().builtinSong(b)), ...(await L().listSongs()).sort((a, b) => a.title.localeCompare(b.title))];
			if (!this.root || screen !== this.screenVersion) return;
			const titleOf = sid => all.find(s => s.id === sid)?.title || "(삭제된 곡)";
			const msg = h("p", { class: "rh-progress-text", role: "status" });
			const persist = async () => {
				try {
					await L().savePlaylist(list);
				} catch (e) {
					msg.textContent = L().storageMessage(e);
				}
				draw();
			};
			const entries = h("ol", { class: "rh-songs rh-entries" });
			const draw = () => {
				entries.replaceChildren(
					...list.songs.map((sid, i) =>
						h(
							"li",
							{ class: "rh-song" },
							h("span", { class: "rh-song-main rh-song-title" }, `${i + 1}. ${titleOf(sid)}`),
							h(
								"div",
								{ class: "rh-song-actions" },
								button(
									"위로",
									() => {
										[list.songs[i - 1], list.songs[i]] = [list.songs[i], list.songs[i - 1]];
										persist();
									},
									{ disabled: i === 0, "aria-label": `${titleOf(sid)} 위로 이동` }
								),
								button(
									"아래로",
									() => {
										[list.songs[i + 1], list.songs[i]] = [list.songs[i], list.songs[i + 1]];
										persist();
									},
									{ disabled: i === list.songs.length - 1, "aria-label": `${titleOf(sid)} 아래로 이동` }
								),
								button(
									"제거",
									() => {
										list.songs.splice(i, 1);
										persist();
									},
									{ "aria-label": `${titleOf(sid)} 제거` }
								)
							)
						)
					)
				);
				if (!list.songs.length) entries.append(h("li", { class: "rh-note" }, "이 재생 목록에는 아직 곡이 없습니다."));
			};
			draw();
			const pick = h(
				"select",
				{ class: "rh-select", "aria-label": "추가할 곡" },
				all.map(s => h("option", { value: s.id }, `${s.title}${L().builtin(s.id) ? " (기본 곡)" : ""}`))
			);
			const rename = h("input", { type: "text", class: "rh-input", maxlength: 80, value: list.name, "aria-label": "재생 목록 이름" });
			const confirmDelete = h("div", { class: "rh-row", hidden: true });
			confirmDelete.append(
				h("span", null, "이 재생 목록을 삭제하시겠습니까? 곡은 라이브러리에 남습니다."),
				button("예, 삭제합니다", async () => {
					await L()
						.deletePlaylist(id)
						.catch(() => {});
					this.menu("playlists");
				}),
				button("유지", () => (confirmDelete.hidden = true))
			);
			this.show(
				h(
					"div",
					{ class: "rh-details" },
					h("h3", { class: "rh-head" }, list.name),
					h(
						"div",
						{ class: "rh-row" },
						rename,
						button("이름 변경", () => {
							const n = rename.value
								.replace(/[\p{Cc}<>]/gu, "")
								.trim()
								.slice(0, 80);
							if (!n) return;
							list.name = n;
							persist();
						})
					),
					entries,
					h(
						"div",
						{ class: "rh-row" },
						pick,
						button("재생 목록에 추가", () => {
							if (!pick.value || list.songs.length >= L().limits.playlistSongs) return;
							list.songs.push(pick.value);
							persist();
						})
					),
					msg,
					h(
						"div",
						{ class: "rh-row" },
						button("이 재생 목록 재생", () => {
							this.source = id;
							this.menu("play");
						}),
						button("재생 목록 내보내기", () => this.exportJson("playlist", { playlistId: id, name: list.name })),
						button("재생 목록 삭제", () => (confirmDelete.hidden = false))
					),
					confirmDelete,
					button("재생 목록으로 돌아가기", () => this.menu("playlists"))
				)
			);
		}

		/* ---- Settings tab ---- */

		/* ---- Settings tab ---- */

		async settingsTab(page) {
			const s = R().settings();
			const music = h("input", { type: "range", min: 0, max: 100, step: 5, value: Math.round(s.music * 100), "aria-label": "음악 볼륨", class: "rh-range" });
			music.addEventListener("input", () => {
				R().setSetting("music", Number(music.value) / 100);
				/* The preview follows the slider, so the change can be heard. */
				if (this.previewId) this.audio.volume = this.previewVolume();
			});
			const previews = h("input", { type: "checkbox", checked: s.previews });
			previews.addEventListener("change", () => {
				R().setSetting("previews", previews.checked);
				this.stopPreview();
				if (previews.checked) this.previewSelected();
			});
			const offset = h("input", {
				type: "number",
				class: "rh-input",
				min: -300,
				max: 300,
				step: 5,
				value: s.offset,
				"aria-label": "타이밍 오프셋(밀리초)",
			});
			const offsetMsg = h("span", { class: "rh-song-sub", role: "status" });
			offset.addEventListener("change", () => {
				const v = Math.round(Number(offset.value));
				if (!(v >= -300 && v <= 300)) {
					offsetMsg.textContent = "-300에서 300 사이의 숫자를 입력하십시오.";
					offset.value = R().settings().offset;
					return;
				}
				R().setSetting("offset", v);
				offsetMsg.textContent = `저장했습니다: ${v} ms.`;
			});
			const reduced = h("input", { type: "checkbox", checked: s.reduced });
			reduced.addEventListener("change", () => {
				R().setSetting("reduced", reduced.checked);
				this.root.classList.toggle("rh-calm", reduced.checked);
			});
			const sfx = h("div", { class: "rh-sfx" });
			sfx.innerHTML = setup.consoleSfx ? setup.consoleSfx.controlsHtml() : "";

			/* Lane keys: each button waits for the next key press. A key already on another lane swaps with it. */
			const keyMsg = h("p", { class: "rh-song-sub", role: "status" });
			const keyRow = h("div", { class: "rh-keys", role: "group", "aria-label": "레인 키, 왼쪽부터" });
			const labelsSel = h(
				"select",
				{ class: "rh-select", "aria-label": "필드에 키 표시" },
				h("option", { value: "auto" }, "키보드와 마우스를 쓸 때"),
				h("option", { value: "always" }, "항상"),
				h("option", { value: "never" }, "표시 안 함")
			);
			labelsSel.value = s.laneLabels;
			labelsSel.addEventListener("change", () => R().setSetting("laneLabels", labelsSel.value));
			let capture = null;
			const stopCapture = () => {
				if (!capture) return;
				document.removeEventListener("keydown", capture, true);
				capture = null;
			};
			const drawKeys = () => {
				const keys = R().settings().keys;
				keyRow.replaceChildren(
					...keys.map((code, i) =>
						h(
							"button",
							{
								type: "button",
								class: "rh-key",
								"aria-label": `레인 ${i + 1}: ${keyLabel(code)}. 눌러서 변경하십시오.`,
								onclick: e => {
									stopCapture();
									const btn = e.currentTarget;
									btn.classList.add("rh-key--wait");
									btn.querySelector(".rh-key-cap").textContent = "?";
									keyMsg.textContent = `레인 ${i + 1}에 쓸 키를 누르십시오. ${keyLabel(code)} 키를 유지하려면 Escape를 누르십시오.`;
									capture = ev => {
										/* Nothing else hears this press: not DoL's shortcuts, not the page. */
										ev.preventDefault();
										ev.stopImmediatePropagation();
										if (ev.repeat) return;
										stopCapture();
										if (ev.code === "Escape") keyMsg.textContent = "변경하지 않았습니다.";
										else if (!R().keyAllowed(ev.code))
											keyMsg.textContent = R().reservedKeys.includes(ev.code)
												? `${keyLabel(ev.code)} 키는 일시정지나 게임 자체의 단축키용으로 예약되어 있습니다. 다른 키를 고르십시오.`
												: `${ev.key || ev.code} 키는 레인 키로 쓸 수 없습니다. 글자, 문장 부호, 방향, 숫자 패드 키를 사용하십시오.`;
										else {
											const next = [...R().settings().keys];
											const other = next.indexOf(ev.code);
											if (other >= 0 && other !== i) {
												next[other] = next[i];
												keyMsg.textContent = `${keyLabel(ev.code)} 키가 레인 ${other + 1}에 있었으므로 레인 ${other + 1}, ${i + 1}의 키를 서로 바꿨습니다.`;
											} else keyMsg.textContent = `레인 ${i + 1}의 키가 이제 ${keyLabel(ev.code)}입니다.`;
											next[i] = ev.code;
											R().setSetting("keys", next);
										}
										drawKeys();
										keyRow.children[i]?.focus({ preventScroll: true });
									};
									document.addEventListener("keydown", capture, true);
								},
							},
							h("span", { class: "rh-key-cap" }, keyLabel(code)),
							h("span", { class: "rh-key-lane" }, `레인 ${i + 1}`)
						)
					)
				);
			};
			drawKeys();
			put(
				page,
				h(
					"section",
					{ class: "rh-panel" },
					h("h3", { class: "rh-panel-head" }, "소리"),
					h("label", { class: "rh-field-row" }, h("span", null, "음악 볼륨"), music),
					h("label", { class: "rh-field-row rh-check" }, previews, h("span", null, "메뉴에서 선택한 곡의 미리 듣기 재생")),
					sfx,
					V.options?.audio !== 1 ? h("p", { class: "rh-note" }, "옵션에서 게임 소리가 꺼져 있어, 켜기 전까지는 곡이 재생되지 않습니다.") : null
				),
				h(
					"section",
					{ class: "rh-panel" },
					h("h3", { class: "rh-panel-head" }, "타이밍"),
					h("label", { class: "rh-field-row" }, h("span", null, "타이밍 오프셋(ms)"), offset),
					offsetMsg,
					h(
						"p",
						{ class: "rh-song-sub" },
						"박자에 맞춰 쳤는데도 판정이 늦게 나오면 오프셋을 올리고, 일찍 나오면 내리십시오. 블루투스 헤드폰은 대개 150 이상이 필요합니다. 곡이 끝나면 결과 화면이 실제 플레이를 바탕으로 한 값을 제안합니다."
					)
				),
				h(
					"section",
					{ class: "rh-panel" },
					h("h3", { class: "rh-panel-head" }, "키보드"),
					h(
						"p",
						{ class: "rh-song-sub" },
						"필드는 여섯 레인으로 나뉘며, 레인마다 키가 하나씩 있습니다. 키는 자기 레인의 다음 노트를 치고, 홀드는 키를 누르고 있어야 합니다. 누르고 있는 키는 자기 레인과 양옆 레인의 드래그 노트도 맡습니다. 쌍 노트는 두 키를 함께 누르십시오. P 또는 Escape 키로 일시정지합니다."
					),
					keyRow,
					keyMsg,
					h(
						"div",
						{ class: "rh-row" },
						button("A S D J K L로 되돌리기", () => {
							stopCapture();
							R().setSetting("keys", [...R().defaultKeys]);
							keyMsg.textContent = "레인 키를 되돌렸습니다.";
							drawKeys();
						}),
						h("label", { class: "rh-field-row" }, h("span", null, "필드의 키 표시"), labelsSel)
					),
					h(
						"p",
						{ class: "rh-song-sub" },
						"마우스는 두 곳을 동시에 클릭할 수 없으므로, 쌍 노트 중 어느 쪽을 클릭해도 둘 다 맞습니다. 터치 화면은 손가락마다 따로 인식합니다."
					)
				),
				h(
					"section",
					{ class: "rh-panel" },
					h("h3", { class: "rh-panel-head" }, "화면"),
					h(
						"label",
						{ class: "rh-field-row rh-check" },
						reduced,
						h("span", null, "효과 줄이기: 명중 이펙트, 선의 잔상, 메뉴 애니메이션을 끕니다(타이밍 고리는 유지)")
					)
				)
			);
			return { destroy: stopCapture };
		}

		/* ---- Challenges tab: today's challenge, the regular challenges, and the feat for finishing them ---- */

		async challengesTab(page) {
			const d = R().data();
			const c = R().daily();
			const day = d.daily[c.date];
			const song = setup.rhythmBuiltins.find(b => b.id === c.songId);
			const status = R().challengeStatus();
			const done = status.filter(x => x.done).length;
			const feat = R().masterFeat;
			const groups = ["easy", "medium", "hard"].map(diff => {
				const items = status.filter(x => x.c.diff === diff);
				return h(
					"section",
					{ class: "rh-chal-group" },
					h(
						"h4",
						{ class: "rh-chal-head" },
						h("span", { class: `con-diff ${{ easy: "green", medium: "gold", hard: "red" }[diff]}` }, levelName(diff)),
						h("span", { class: "rh-song-sub" }, `${items.length}개 중 ${items.filter(x => x.done).length}개`)
					),
					h(
						"ul",
						{ class: "rh-chal-list" },
						items.map(x =>
							h(
								"li",
								{ class: `rh-chal${x.done ? " rh-chal--done" : ""}` },
								h("span", { class: "rh-chal-mark", "aria-hidden": "true" }, x.done ? "✓" : ""),
								h(
									"div",
									{ class: "rh-chal-main" },
									h("span", { class: "rh-song-title" }, x.c.name),
									h("span", { class: "rh-song-sub" }, x.c.desc),
									x.done
										? h("span", { class: "rh-chal-state" }, x.date ? `완료 ${x.date}` : "완료")
										: h(
												"span",
												{
													class: "rh-meter",
													role: "progressbar",
													"aria-valuemin": 0,
													"aria-valuemax": x.target,
													"aria-valuenow": x.value,
													"aria-label": `${x.c.name} 진행도`,
												},
												h("span", { class: "rh-meter-fill", style: `width: ${Math.round((x.value / x.target) * 100)}%` })
										  ),
									x.done
										? null
										: h("span", { class: "rh-chal-state" }, x.target === 1 ? "아직" : `${x.target.toLocaleString()} 중 ${x.value.toLocaleString()}`)
								)
							)
						)
					)
				);
			});
			put(
				page,
				h(
					"section",
					{ class: `rh-daily${day?.done ? " rh-daily--done" : ""}`, "aria-label": "오늘의 도전" },
					h("div", { class: "rh-daily-head" }, h("span", { class: "rh-k" }, `오늘의 도전 · ${c.date} (UTC)`), chip(c.level)),
					h("div", { class: "rh-daily-body" }, cover(L().builtinSong(song)), h("p", { class: "rh-daily-goal" }, c.goal)),
					h(
						"dl",
						{ class: "rh-facts" },
						h("dt", null, "보상"),
						h("dd", null, day?.paid ? `${formatMoney(day.paid)}, 지급됨` : formatMoney(c.reward)),
						h("dt", null, "상태"),
						h(
							"dd",
							null,
							day?.done ? "완료" : day?.tries ? `아직 (${day.tries}${day.tries === 1 ? "번" : "번"} 시도, 최고 ${day.best}%)` : "아직 시도하지 않음"
						),
						h("dt", null, "다음 도전"),
						h("dd", null, `${setup.consoleDaily.untilReset()} 후 (UTC 자정)`)
					),
					day?.done
						? null
						: button(
								"오늘의 도전 하기",
								() => {
									R().setSetting("level", c.level);
									this.source = "builtin";
									this.selected = c.songId;
									this.menu("play");
								},
								{ class: `rh-btn rh-play ${levelColour[c.level]}` }
						  ),
					h("p", { class: "rh-song-sub" }, "도전과 보상은 기본 곡만 인정됩니다. 오늘의 도전은 하루에 한 번만 보상을 줍니다.")
				),
				h(
					"div",
					{ class: "rh-chal-total" },
					h("span", { class: "rh-k" }, "도전"),
					h("span", { class: "rh-song-sub" }, `${status.length}개 중 ${done}개 완료`),
					h(
						"span",
						{ class: "rh-meter", "aria-hidden": "true" },
						h("span", { class: "rh-meter-fill", style: `width: ${Math.round((done / status.length) * 100)}%` })
					)
				),
				groups
			);
			const featBox = h("div", { class: "rh-feat" });
			featBox.innerHTML = setup.consoleDaily.featCard(feat, done, status.length);
			put(page, featBox);
			put(
				page,
				h("h4", { class: "con-subhead" }, "업적"),
				h(
					"ul",
					{ class: "rh-chal-list" },
					R().achievements.map(a =>
						h(
							"li",
							{ class: `rh-chal${d.achievements[a.id] ? " rh-chal--done" : ""}` },
							h("span", { class: "rh-chal-mark", "aria-hidden": "true" }, d.achievements[a.id] ? "✓" : ""),
							h(
								"div",
								{ class: "rh-chal-main" },
								h("span", { class: "rh-song-title" }, a.name),
								h("span", { class: "rh-song-sub" }, a.desc),
								h("span", { class: "rh-chal-state" }, d.achievements[a.id] ? `달성 ${d.achievements[a.id]}` : "아직")
							)
						)
					)
				)
			);
		}
	}

	function mount(selector = "#rhythm") {
		destroy();
		const root = document.querySelector(selector);
		if (!root) return null;
		try {
			current = new RhythmUI(root);
		} catch (e) {
			current = null;
			console.error("Rhythm game failed to start", e);
			root.textContent = "리듬 게임을 시작할 수 없습니다. 콘솔로 돌아가 다시 열어 주십시오.";
		}
		return current;
	}

	function destroy() {
		if (!current) return;
		try {
			current.destroy();
		} finally {
			current = null;
		}
	}

	/* Called from the passage once it is rendered. */
	function open(selector) {
		Utils.Defer(mount, selector);
	}

	$(document).on(":passageinit", destroy);

	setup.rhythmUI = Object.freeze({
		open,
		destroy,
		leave: destroy,
		h,
		button,
		levelName,
		bindInput,
		fill,
		keyLabel,
		keyLabels,
		chip,
		time,
		get current() {
			return current;
		},
	});
})();
