/* Rhythm game tutorial: seven short practice rounds on a slow click beat, each teaching one thing by doing it. It runs
 * on the game's own playfield, input and music clock: the beat is a click track made in memory as a WAV file and
 * played through the same audio element as any song. Timing is more forgiving than Easy, nothing is recorded and
 * nothing pays. Finishing or skipping it stops the first-time offer on the song list. */
(() => {
	const R = () => setup.rhythm;
	const U = () => setup.rhythmUI;
	const bpm = 100;
	const beat = 60 / bpm;
	const length = 30; // seconds of practice beat, longer than any round
	const windows = Object.freeze({ perfect: 70, good: 160, miss: 200 });
	const song = Object.freeze({ id: "tutorial", title: "연습 박자", bpm, offset: 0, pageBeats: 4, duration: length, trim: 0 });

	/* Notes from beats: [beat, x, type, holdBeats]. */
	const at = list =>
		list.map(([b, x, type = "tap", hold]) =>
			type === "hold" ? { t: Math.round(b * beat * 1000), x, type, d: Math.round(hold * beat * 1000) } : { t: Math.round(b * beat * 1000), x, type }
		);
	const drag = (from, to, x0, x1) => {
		const out = [];
		const steps = (to - from) * 2;
		for (let k = 0; k <= steps; k++) out.push([from + k / 2, x0 + ((x1 - x0) * k) / steps, "drag"]);
		return out;
	};

	/* Lane centres, so every pattern sits squarely in one lane for keyboard players and the same for touch and mouse. */
	const lane = i => (i + 0.5) / 6;

	/* The line sweeps up during beats 0-4, down 4-8, up 8-12 and so on; a note on beat 4, 8, 12... sits at an edge.
	 * Each step's text is written for the controls the player picked: "touch", "mouse" or "keys". Pairs are always two
	 * different lanes, so two keys (or two fingers) take them; a mouse click takes a whole pair. */
	const steps = Object.freeze([
		{
			title: "선",
			text: () =>
				"선이 필드를 위로 훑고 올라가 맨 위에서 방향을 바꾼 뒤, 아래로 훑고 내려가 맨 아래에서 다시 방향을 바꿉니다. 네 박자에 한 번씩입니다. 모든 노트는 그 박자에 선이 지나갈 자리에 놓여 있습니다. 선이 두 번 훑고 지나가는 것을 지켜보십시오.",
			notes: [],
			endAt: 8 * beat,
		},
		{
			title: "탭",
			text: (mode, keys) =>
				"각 노트로 고리가 좁혀 들어옵니다. 고리가 노트에 닿으면 선이 그 노트 위에 있다는 뜻입니다. " +
				(mode === "keys"
					? `그때 그 노트의 키를 누르십시오. 필드는 여섯 레인이며, 왼쪽부터 ${keys.join(" ")} 키이고 각 노트에 해당 키가 표시됩니다.`
					: mode === "mouse"
					? "그때 클릭하십시오."
					: "그때 탭하십시오.") +
				" 이 네 개를 치십시오.",
			notes: at([
				[5, lane(1)],
				[6, lane(3)],
				[9, lane(2)],
				[10, lane(4)],
			]),
			need: 3,
		},
		{
			title: "방향이 바뀌는 곳",
			text: () => "맨 위나 맨 아래의 노트는 선이 방향을 바꿀 때 옵니다. 다른 노트와 똑같은 시점에 나타나며, 고리도 똑같이 작동합니다.",
			notes: at([
				[4, lane(2)],
				[8, lane(1)],
				[12, lane(4)],
				[16, lane(3)],
			]),
			need: 3,
		},
		{
			title: "홀드",
			text: mode =>
				"막대가 달린 네모 노트는 홀드입니다. " +
				(mode === "keys"
					? "고리가 닫힐 때 그 노트의 키를 누른 채로"
					: mode === "mouse"
					? "고리가 닫힐 때 마우스 버튼을 누른 채로"
					: "고리가 닫힐 때 손가락을 댄 채로") +
				" 선이 막대 끝에 닿을 때까지 유지하십시오.",
			notes: at([
				[5, lane(2), "hold", 2],
				[13, lane(3), "hold", 2],
			]),
			need: 1,
		},
		{
			title: "드래그",
			text: (mode, keys) =>
				"점으로 이어진 마름모는 드래그이며, 탭할 필요가 없습니다. " +
				(mode === "keys"
					? `선이 첫 마름모에 닿을 때 키를 누르고 계십시오. 누르고 있는 키는 자기 레인과 양옆 레인을 맡으므로 ${keys[1]} 또는 ${keys[2]} 키로 첫 번째 연결을 처리할 수 있습니다. 연결이 더 멀리 이어지면 키에서 키로 굴리듯 옮기십시오.`
					: mode === "mouse"
					? "마우스 버튼을 누른 채, 선이 지나가는 점을 따라 움직이십시오."
					: "손가락을 댄 채, 선이 지나가는 점을 따라 미끄러뜨리십시오."),
			notes: at([...drag(5, 7, lane(1), lane(2)), ...drag(13, 15, lane(4), lane(3))]),
			need: 7,
		},
		{
			title: "쌍 노트",
			text: (mode, keys) =>
				"같은 박자에 놓인 노트 두 개는 한 쌍입니다. " +
				(mode === "keys"
					? `두 키를 동시에 누르십시오: ${keys[1]} 키와 ${keys[4]} 키, 이어서 ${keys[2]} 키와 ${keys[3]} 키, 그다음 ${keys[0]} 키와 ${keys[5]} 키.`
					: mode === "mouse"
					? "마우스는 두 곳을 동시에 클릭할 수 없으므로, 박자에 맞춰 한 쌍 중 어느 노트든 클릭하면 둘 다 맞습니다."
					: "손가락 하나씩으로 두 개를 동시에 탭하십시오."),
			notes: at([
				[6, lane(1)],
				[6, lane(4)],
				[10, lane(2)],
				[10, lane(3)],
				[14, lane(0)],
				[14, lane(5)],
			]),
			need: 4,
		},
		{
			title: "퍼펙트, 굿, 미스",
			text: () =>
				"박자에 딱 맞으면 퍼펙트, 조금 어긋나면 굿, 너무 어긋나거나 치지 못하면 미스입니다. 명중할 때마다 콤보가 쌓이고 미스가 나면 콤보가 초기화됩니다. 점수는 퍼펙트를 온전히, 굿을 절반을 조금 넘게 쳐 주며, 모든 노트를 퍼펙트로 치면 1,000,000점입니다. 짧은 조합을 연습해 보십시오.",
			notes: at([
				[5, lane(1)],
				[6, lane(3)],
				[6.5, lane(2), "hold", 1.25],
				...drag(9, 10.5, lane(1), lane(2)),
				[12, lane(3)],
				[13, lane(0)],
				[13, lane(4)],
				[14, lane(2)],
			]),
			need: 0,
		},
	]);

	/* The controls this device most likely uses, as the tutorial's first suggestion. */
	const guessMode = () => (window.matchMedia && window.matchMedia("(pointer: coarse)").matches ? "touch" : "keys");
	const modeName = { touch: "터치", mouse: "마우스", keys: "키보드" };

	/* A mono 16-bit WAV of the practice beat: a click on every beat, a lower one at each turn of the line. */
	function practiceBeat() {
		const rate = 22050;
		const n = Math.floor(rate * length);
		const data = new Int16Array(n);
		for (let b = 0; b * beat < length; b++) {
			const start = Math.floor(b * beat * rate);
			const turn = b % 4 === 0;
			const freq = turn ? 520 : 880;
			for (let i = 0; i < 1800 && start + i < n; i++)
				data[start + i] = Math.round((turn ? 9000 : 6000) * Math.exp(-i / 260) * Math.sin((i * 2 * Math.PI * freq) / rate));
		}
		const head = new DataView(new ArrayBuffer(44));
		const text = (o, s) => [...s].forEach((ch, i) => head.setUint8(o + i, ch.charCodeAt(0)));
		text(0, "RIFF");
		head.setUint32(4, 36 + n * 2, true);
		text(8, "WAVEfmt ");
		head.setUint32(16, 16, true);
		head.setUint16(20, 1, true);
		head.setUint16(22, 1, true);
		head.setUint32(24, rate, true);
		head.setUint32(28, rate * 2, true);
		head.setUint16(32, 2, true);
		head.setUint16(34, 16, true);
		text(36, "data");
		head.setUint32(40, n * 2, true);
		return new Blob([head.buffer, data.buffer], { type: "audio/wav" });
	}

	function open(ui, index = 0, mode = null) {
		const { h, button, bindInput, keyLabels, fill } = U();
		const audio = ui.audio;
		const s = R().settings();
		ui.silence();
		ui.objectURL = URL.createObjectURL(practiceBeat());
		audio.src = ui.objectURL;
		audio.load();
		const silent = V.options?.audio !== 1;

		const canvas = h("canvas", {
			class: "rh-canvas",
			"aria-label": "연습 필드. 선이 노트를 가로지를 때 탭, 클릭, 또는 레인 키로 노트를 치십시오.",
		});
		const overlay = h("div", { class: "rh-overlay rh-overlay--light", hidden: true });
		const field = h("div", { class: "rh-field", "data-gesture-owner": "rhythm-tutorial" }, canvas, overlay);
		const stepLabel = h("span", { class: "rh-song-sub" });
		const title = h("h3", { class: "rh-head", tabindex: -1 });
		const text = h("p", { class: "rh-tut-text" });
		const tally = h("span", { class: "tama-v" }, " ");
		const judge = h("span", { class: "tama-v rh-judge" }, " ");
		const combo = h("span", { class: "tama-v" }, "0");
		const stat = (k, v) => h("span", { class: "tama-stat" }, h("span", { class: "tama-k" }, k), v);
		const outcome = h("p", { class: "rh-tut-outcome", role: "status" });
		const actions = h("div", { class: "rh-row" });

		let play = null;
		let phase = "ready"; // ready, countdown, playing, done
		let timer = 0;
		let observer = null;
		const input = bindInput(canvas, field, () => (phase === "playing" ? play : null));

		const modeLabel = h("span", { class: "rh-song-sub rh-tut-mode" });
		const finishTutorial = how => R().finishTutorial(how);

		/* First: which controls to teach. Every step's wording and the field's key labels follow the choice. */
		function chooseMode() {
			stop();
			phase = "ready";
			stepLabel.textContent = "튜토리얼";
			modeLabel.replaceChildren();
			title.textContent = "어떻게 플레이하시겠습니까?";
			text.textContent = "조작 방식을 고르면 튜토리얼이 그 방식을 알려 줍니다. 어느 단계에서든 바꿀 수 있으며, 실제 곡에서는 모든 조작 방식을 쓸 수 있습니다.";
			outcome.textContent = "";
			const guess = mode || guessMode();
			actions.replaceChildren(
				...["touch", "mouse", "keys"].map(m =>
					button(
						modeName[m],
						() => {
							mode = m;
							show(index);
						},
						{ class: m === guess ? "rh-btn rh-btn--main" : "rh-btn" }
					)
				)
			);
			actions.querySelector(".rh-btn--main").focus({ preventScroll: true });
		}

		function stop() {
			clearTimeout(timer);
			if (play) play.stop();
			audio.pause();
		}

		function show(i) {
			stop();
			index = i;
			const step = steps[i];
			phase = "ready";
			stepLabel.textContent = `튜토리얼, ${steps.length}단계 중 ${i + 1}단계`;
			modeLabel.replaceChildren(
				`조작 방식: ${modeName[mode]} `,
				button("변경", () => chooseMode(), { class: "rh-btn rh-btn--small" })
			);
			title.textContent = step.title;
			text.textContent = step.text(mode, keyLabels());
			outcome.textContent = silent ? "옵션에서 게임 소리가 꺼져 있어 연습 박자가 들리지 않습니다. 대신 선을 따라가십시오." : "";
			overlay.hidden = true;
			play = new (R().Play)({
				canvas,
				song,
				notes: step.notes.map(n => ({ ...n })),
				level: "easy",
				win: windows,
				endAt: step.endAt,
				audio,
				offsetMs: s.offset,
				reduced: s.reduced,
				onHud: (st, result) => {
					combo.textContent = String(st.combo);
					const hits = play ? play.stats.perfect + play.stats.good : 0;
					tally.textContent = step.notes.length ? `${step.notes.length}개 중 ${hits}개` : " ";
					if (result) {
						judge.textContent = { perfect: "퍼펙트", good: "굿", miss: "미스", hold: "홀드 중" }[result];
						judge.className = `tama-v rh-judge rh-judge--${result}`;
					}
				},
				onEnd: done,
			});
			if (mode === "keys") play.field.lanes = keyLabels();
			play.onHud(play.summary());
			judge.textContent = " ";
			play.still(0);
			fill(
				actions,
				button(step.notes.length ? "이번 판 시작" : "선 지켜보기", () => run(), { class: "rh-btn rh-btn--main", "data-autofocus": true }),
				i > 0 ? button("이전 단계", () => show(i - 1)) : null
			);
			actions.querySelector("button").focus({ preventScroll: true });
			title.focus({ preventScroll: true });
		}

		/* Counts in, then plays the round from the start of the practice beat. */
		function run() {
			stop();
			show(index);
			actions.replaceChildren(button("이번 판 중지", () => show(index)));
			phase = "countdown";
			audio.currentTime = 0;
			audio.muted = silent;
			audio.volume = Math.max(0, Math.min(1, (V.options?.mastervolume ?? 1) * s.music));
			let n = 3;
			const tick = () => {
				if (!ui.root || phase !== "countdown") return;
				if (n === 0) {
					overlay.hidden = true;
					phase = "playing";
					audio.play().catch(() => {
						if (phase !== "playing" || !canvas.isConnected) return;
						show(index);
						outcome.textContent = "브라우저가 연습 박자를 재생하지 않았습니다. 시작을 다시 누르십시오.";
					});
					play.start();
					return;
				}
				overlay.replaceChildren(h("span", { class: "rh-overlay-title" }, String(n)));
				overlay.hidden = false;
				n--;
				timer = ui.later(tick, 600);
			};
			tick();
		}

		function done(result) {
			phase = "done";
			audio.pause();
			const step = steps[index];
			const hits = result.perfect + result.good;
			const passed = !step.need || hits >= step.need;
			const last = index === steps.length - 1;
			if (!step.notes.length) outcome.textContent = "이것이 필드의 리듬 전부입니다. 위로, 방향 전환, 아래로, 방향 전환.";
			else if (last)
				outcome.textContent = `퍼펙트 ${result.perfect}, 굿 ${result.good}, 미스 ${result.miss}, 최대 콤보 ${result.maxCombo}. 이제 실제 곡을 칠 준비가 되었습니다.`;
			else
				outcome.textContent = passed
					? `잘했습니다: ${step.notes.length}개 중 ${hits}개.`
					: `${step.notes.length}개 중 ${hits}개. 다시 도전하거나, 준비되면 다음으로 넘어가십시오.`;
			actions.replaceChildren(
				last
					? button(
							"튜토리얼 마치기",
							() => {
								finishTutorial("done");
								ui.menu("play");
							},
							{ class: "rh-btn rh-btn--main" }
					  )
					: button("다음 단계", () => show(index + 1), { class: passed ? "rh-btn rh-btn--main" : "rh-btn" }),
				button("다시 하기", () => run(), { class: passed ? "rh-btn" : "rh-btn rh-btn--main" })
			);
			actions.querySelector(".rh-btn--main").focus({ preventScroll: true });
		}

		ui.show(
			h(
				"div",
				{ class: "rh-tutorial" },
				h(
					"div",
					{ class: "rh-game-head" },
					stepLabel,
					modeLabel,
					button("튜토리얼 건너뛰기", () => {
						finishTutorial("skipped");
						ui.menu("play");
					})
				),
				h("div", { class: "rh-tut-card" }, title, text),
				h("div", { class: "rh-hud" }, stat("명중", tally), stat("콤보", combo), stat("마지막 판정", judge)),
				field,
				outcome,
				actions
			),
			{
				keydown: e => {
					if (e.target && /^(INPUT|SELECT|TEXTAREA)$/.test(e.target.tagName)) return;
					if (e.key === "Escape" && (phase === "playing" || phase === "countdown")) {
						e.preventDefault();
						show(index);
						return;
					}
					input.keydown(e);
				},
				keyup: e => input.keyup(e),
				blur: () => input.releaseAll(),
				visibility: () => document.hidden && (phase === "playing" || phase === "countdown") && show(index),
				destroy: () => {
					phase = "done";
					stop();
					if (observer) observer.disconnect();
					audio.muted = false;
					ui.silence();
				},
			}
		);
		if (window.ResizeObserver) {
			observer = new ResizeObserver(() => {
				if (!play) return;
				play.field.resize();
				if (phase !== "playing") play.still(0);
			});
			observer.observe(field);
		}
		if (mode) show(index);
		else chooseMode();
	}

	setup.rhythmTutorial = Object.freeze({ open, steps });
})();
