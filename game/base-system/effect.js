/* globals pcIsBlinded, sizeSidebarDollCanvases, canBeMPregnant, playerClutchReadyToLay */
function effectsWater(waterType = "liquid") {
	const fragment = document.createDocumentFragment();

	const sWikifier = text => {
		fragment.append(Wikifier.wikifyEval(text + " "));
	};
	const span = (text, colour) => {
		const element = document.createElement("span");
		if (colour) element.classList.add(colour);
		element.textContent = text + " ";
		fragment.append(element);
	};
	const br = () => fragment.append(document.createElement("br"));

	let wetIntro = 0;
	let squidArousal = 0;
	const wetStageReveals = (slot, fabricStrength, includeEqual = false) => {
		if (V.realisticTransparency !== 1) return true;
		if (antitransparentCheck(V.worn[slot])) return false;
		const itemFabricStrength = wornSetupClothes(slot).fabric_strength;
		return includeEqual ? itemFabricStrength <= fabricStrength : itemFabricStrength < fabricStrength;
	};
	const capWetStage = (slot, wetstage, includeEqual = false) => {
		if (V[wetstage] >= 3 && !wetStageReveals(slot, 20, includeEqual)) {
			V[wetstage] = wetStageReveals(slot, 30, includeEqual) ? 2 : 1;
		} else if (V[wetstage] >= 2 && !wetStageReveals(slot, 30, includeEqual)) {
			V[wetstage] = 1;
		}
	};

	switch (V.squidcount) {
		case 1:
			sWikifier('<span class="purple">오징어가 당신의 <<genitals>>【을를】 희롱한다.</span> <<garousal>><<arousal 100 "genitals">>');
			break;
		case 2:
			sWikifier(
				'<span class="purple">오징어들이 당신의 <<genitals>>【와과】 가슴을 희롱한다.</span> <<garousal>><<arousal 100 "breasts">><<arousal 100 "genitals">>'
			);
			break;
		case 3:
			sWikifier(
				'<span class="purple">오징어들이 당신의 <<genitals>>【와과】 <<breasts>>【을를】 희롱한다.</span> <<garousal>><<arousal 200 "breasts">><<arousal 100 "genitals">>'
			);
			break;
		case 4:
			sWikifier(
				'<span class="purple">오징어들이 당신의 <<genitals>>, <<breasts>>, <<bottom>>【을를】 희롱한다.</span> <<garousal>><<arousal 200 "breasts">><<arousal 100 "genitals">><<arousal 100 "bottom">>'
			);
			break;
		default:
			if (V.squidcount >= 5) {
				squidArousal = V.squidcount * 30;
				sWikifier(`<span class="purple">${V.squidcount}마리의 오징어가 당신의 <<genitals>>, <<breasts>>, <<bottom>>, 그리고 몸 이곳저곳을 집요하게 희롱한다.</span>
				<<garousal>><<arousal ${squidArousal} "breasts">><<arousal ${squidArousal} "genitals">><<arousal ${squidArousal} "bottom">>`);
			}
			break;
	}
	if (!V.worn.over_upper.type.includes("naked") && !waterproofCheck(V.worn.over_upper)) {
		capWetStage("over_upper", "overupperwetstage");
		if (V.overupperwet >= 100 && V.overupperwetstage < 3 && wetStageReveals("over_upper", 20)) {
			V.overupperwetstage = 3;
			wetIntro = 2;
			sWikifier(
				`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.over_upper.name}, exposing your ${
					V.worn.upper.type.includes("naked") ? "<<undertop>>" : V.worn.upper.name
				}.</span>`
			);
		} else if (V.overupperwet < 90 && V.overupperwetstage >= 3) {
			V.overupperwetstage = 2;
			sWikifier(
				`<span class="green">Your ${V.worn.over_upper.name} <<overupperhas>> dried, concealing your ${
					V.worn.upper.type.includes("naked") ? "<<undertop>>" : V.worn.upper.name
				}. </span>`
			);
		} else if (V.overupperwet >= 80 && V.overupperwetstage < 2 && wetStageReveals("over_upper", 30)) {
			V.overupperwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.over_upper.name} <<overupperplural>> wet.</span>`);
		} else if (V.overupperwet < 70 && V.overupperwetstage >= 2) {
			V.overupperwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.over_upper.name} <<overupperplural>> drying out.</span>`);
		} else if (V.overupperwet >= 50 && V.overupperwetstage < 1) {
			V.overupperwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.over_upper.name} <<overupperplural>> damp.</span>`);
		} else if (V.overupperwet < 40 && V.overupperwetstage >= 1) {
			V.overupperwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.over_upper.name} <<overupperplural>> dry.</span>`);
		}
	}

	if (!V.worn.upper.type.includes("naked") && !waterproofCheck(V.worn.upper)) {
		capWetStage("upper", "upperwetstage");
		if (V.upperwet >= 100 && V.upperwetstage < 3 && wetStageReveals("upper", 20)) {
			V.upperwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterTypeText}【이가】 ${V.worn.upper.name}【을를】 흠뻑 적셔 <<undertop>>【이가】 드러난다.</span>`);
		} else if (V.upperwet < 90 && V.upperwetstage >= 3) {
			V.upperwetstage = 2;
			sWikifier(`<span class="green">${V.worn.upper.name}【이가】 말라 <<undertop>>【을를】 다시 가린다.</span>`);
		} else if (V.upperwet >= 80 && V.upperwetstage < 2 && wetStageReveals("upper", 30)) {
			V.upperwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">${V.worn.upper.name}【이가】 젖었다.</span>`);
		} else if (V.upperwet < 70 && V.upperwetstage >= 2) {
			V.upperwetstage = 1;
			sWikifier(`<span class="green">${V.worn.upper.name}【이가】 마르고 있다.</span>`);
		} else if (V.upperwet >= 50 && V.upperwetstage < 1) {
			V.upperwetstage = 1;
			sWikifier(`<span class="blue">${V.worn.upper.name}【이가】 축축해졌다.</span>`);
		} else if (V.upperwet < 40 && V.upperwetstage >= 1) {
			V.upperwetstage = 0;
			sWikifier(`<span class="green">${V.worn.upper.name}【이가】 말랐다.</span>`);
		}
	}

	if (!V.worn.over_lower.type.includes("naked") && !waterproofCheck(V.worn.over_lower)) {
		capWetStage("over_lower", "overlowerwetstage");
		if (V.overlowerwet >= 100 && V.overlowerwetstage < 3 && wetStageReveals("over_lower", 20)) {
			V.overlowerwetstage = 3;
			wetIntro = 2;
			sWikifier(
				`<span class="lewd">${waterType.toUpperFirst()} soaks through your ${V.worn.over_lower.name}, exposing your ${
					V.worn.lower.type.includes("naked") ? "<<undies>>" : V.worn.lower.name
				}.</span>`
			);
		} else if (V.overlowerwet < 90 && V.overlowerwetstage >= 3) {
			V.overlowerwetstage = 2;
			sWikifier(
				`<span class="green">Your ${V.worn.over_lower.name} <<overlowerhas>> dried, concealing your ${
					V.worn.lower.type.includes("naked") ? "<<undies>>" : V.worn.lower.name
				}. </span>`
			);
		} else if (V.overlowerwet >= 80 && V.overlowerwetstage < 2 && wetStageReveals("over_lower", 30)) {
			V.overlowerwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">Your ${V.worn.over_lower.name} <<overlowerplural>> wet.</span>`);
		} else if (V.overlowerwet < 70 && V.overlowerwetstage >= 2) {
			V.overlowerwetstage = 1;
			sWikifier(`<span class="green">Your ${V.worn.over_lower.name} <<overlowerplural>> drying out.</span>`);
		} else if (V.overlowerwet >= 50 && V.overlowerwetstage < 1) {
			V.overlowerwetstage = 1;
			sWikifier(`<span class="blue">Your ${V.worn.over_lower.name} <<overlowerplural>> damp.</span>`);
		} else if (V.overlowerwet < 40 && V.overlowerwetstage >= 1) {
			V.overlowerwetstage = 0;
			sWikifier(`<span class="green">Your ${V.worn.over_lower.name} <<overlowerplural>> dry.</span>`);
		}
	}

	if (!V.worn.lower.type.includes("naked") && !waterproofCheck(V.worn.lower)) {
		capWetStage("lower", "lowerwetstage");
		if (V.lowerwet >= 100 && V.lowerwetstage < 3 && wetStageReveals("lower", 20)) {
			V.lowerwetstage = 3;
			wetIntro = 2;
			sWikifier(`<span class="lewd">${waterTypeText}【이가】 ${V.worn.lower.name}【을를】 흠뻑 적셔 <<undies>>【이가】 드러난다.</span>`);
		} else if (V.lowerwet < 90 && V.lowerwetstage >= 3) {
			V.lowerwetstage = 2;
			sWikifier(`<span class="green">${V.worn.lower.name}【이가】 말라 <<undies>>【을를】 다시 가린다.</span>`);
		} else if (V.lowerwet >= 80 && V.lowerwetstage < 2 && wetStageReveals("lower", 30)) {
			V.lowerwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">${V.worn.lower.name}【이가】 젖었다.</span>`);
		} else if (V.lowerwet < 70 && V.lowerwetstage >= 2) {
			V.lowerwetstage = 1;
			sWikifier(`<span class="green">${V.worn.lower.name}【이가】 마르고 있다.</span>`);
		} else if (V.lowerwet >= 50 && V.lowerwetstage < 1) {
			V.lowerwetstage = 1;
			sWikifier(`<span class="blue">${V.worn.lower.name}【이가】 축축해졌다.</span>`);
		} else if (V.lowerwet < 40 && V.lowerwetstage >= 1) {
			V.lowerwetstage = 0;
			sWikifier(`<span class="green">${V.worn.lower.name}【이가】 말랐다.</span>`);
		}
	}

	if (!V.worn.under_lower.type.includes("naked") && !waterproofCheck(V.worn.under_lower)) {
		capWetStage("under_lower", "underlowerwetstage", true);
		if (V.underlowerwet >= 100 && V.underlowerwetstage < 3 && V.player.sex === "f" && V.pantiesSoaked && wetStageReveals("under_lower", 20, true)) {
			V.underlowerwetstage = 3;
			if (V.lowerwetstage === 3 || V.worn.lower.type.includes("naked")) {
				// If clothing above underwear is also wet, or missing
				wetIntro = 2;
				sWikifier(`<span class="lewd">당신의 체액이 ${V.worn.under_lower.name}【을를】 흠뻑 적셔, 천 너머로 <<genitals>>【이가】 비쳐 보인다.</span>`);
			} else if (wornSetupClothes("lower").skirt === 1) {
				sWikifier(
					`<span class="lewd">당신의 체액이 ${V.worn.under_lower.name}【을를】 흠뻑 적셔, $worn.lower.name 아래로 <<genitals>>【이가】 공기에 노출된다.</span>`
				);
			} else {
				span(`당신의 체액이 ${V.worn.under_lower.name}【을를】 흠뻑 적신다.`, "lewd");
			}
		} else if (V.underlowerwet >= 100 && V.underlowerwetstage < 3 && wetStageReveals("under_lower", 20, true)) {
			V.underlowerwetstage = 3;
			wetIntro = 2;
			sWikifier(
				`<span class="lewd">${waterTypeText}【이가】 ${V.worn.under_lower.name}【을를】 흠뻑 적셔, 천 너머로 <<genitals>>【이가】 비쳐 보인다.</span>`
			);
		} else if (V.underlowerwet < 90 && V.underlowerwetstage >= 3) {
			V.underlowerwetstage = 2;
			sWikifier(`<span class="green">${V.worn.under_lower.name}【이가】 말라 <<genitals>>【을를】 다시 가린다.</span>`);
		} else if (V.underlowerwet >= 80 && V.underlowerwetstage < 2 && wetStageReveals("under_lower", 30, true)) {
			V.underlowerwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">${V.worn.under_lower.name}【이가】 젖었다.</span>`);
		} else if (V.underlowerwet < 70 && V.underlowerwetstage >= 2) {
			V.underlowerwetstage = 1;
			sWikifier(`<span class="green">${V.worn.under_lower.name}【이가】 마르고 있다.</span>`);
		} else if (V.underlowerwet >= 50 && V.underlowerwetstage < 1) {
			V.underlowerwetstage = 1;
			sWikifier(`<span class="blue">${V.worn.under_lower.name}【이가】 축축해졌다.</span>`);
		} else if (V.underlowerwet < 40 && V.underlowerwetstage >= 1) {
			V.underlowerwetstage = 0;
			sWikifier(`<span class="green">${V.worn.under_lower.name}【이가】 말랐다.</span>`);
		}
	}

	if (!V.worn.under_upper.type.includes("naked") && !V.worn.under_upper.type.includes("chastity") && !waterproofCheck(V.worn.under_upper)) {
		capWetStage("under_upper", "underupperwetstage", true);
		if (V.underupperwet >= 100 && V.underupperwetstage < 3 && wetStageReveals("under_upper", 20, true)) {
			V.underupperwetstage = 3;
			wetIntro = 2;
			sWikifier(
				`<span class="lewd">${waterTypeText}【이가】 ${V.worn.under_upper.name}【을를】 흠뻑 적셔, 천 너머로 <<breasts>>【이가】 비쳐 보인다.</span>`
			);
		} else if (V.underupperwet < 90 && V.underupperwetstage >= 3) {
			V.underupperwetstage = 2;
			sWikifier(`<span class="green">${V.worn.under_upper.name}【이가】 말라 <<breasts>>【을를】 다시 가린다.</span>`);
		} else if (V.underupperwet >= 80 && V.underupperwetstage < 2 && wetStageReveals("under_upper", 30, true)) {
			V.underupperwetstage = 2;
			wetIntro = 1;
			sWikifier(`<span class="purple">${V.worn.under_upper.name}【이가】 젖었다.</span>`);
		} else if (V.underupperwet < 70 && V.underupperwetstage >= 2) {
			V.underupperwetstage = 1;
			sWikifier(`<span class="green">${V.worn.under_upper.name}【이가】 마르고 있다.</span>`);
		} else if (V.underupperwet >= 50 && V.underupperwetstage < 1) {
			V.underupperwetstage = 1;
			sWikifier(`<span class="blue">${V.worn.under_upper.name}【이가】 축축해졌다.</span>`);
		} else if (V.underupperwet < 40 && V.underupperwetstage >= 1) {
			V.underupperwetstage = 0;
			sWikifier(`<span class="green">${V.worn.under_upper.name}【이가】 말랐다.</span>`);
		}
	}

	if (!V.possessed) {
		if (wetIntro >= 2 && V.exposed >= 2) {
			sWikifier("<<exposure>>");
			if (V.exhibitionism >= 55) {
				span(
					!pcIsBlinded()
						? "몸에 바짝 달라붙은 옷이 완전히 비쳐 보이는 걸 내려다보자 음란한 전율이 인다."
						: "옷이 몸에 바짝 달라붙어 완전히 비쳐 보이자 음란한 전율이 인다."
				);
			} else {
				span(
					!pcIsBlinded()
						? "몸에 바짝 달라붙어 완전히 비쳐 보이는 옷을 내려다보며 공포에 질린다."
						: "몸에 바짝 달라붙어 완전히 비쳐 보이는 옷의 감촉에 공포가 엄습한다."
				);
			}
			sWikifier("<<covered>>");
			br();
			if (V.makeupWashed) br();
		} else if (wetIntro >= 1) {
			if (V.exhibitionism >= 35) {
				span(
					!pcIsBlinded()
						? "몸에 바짝 달라붙은 옷이 살짝 비쳐 보이는 걸 내려다보자 음란한 전율이 인다."
						: "옷이 몸에 바짝 달라붙어 살짝 비쳐 보이자 음란한 전율이 인다."
				);
			} else {
				span(
					!pcIsBlinded()
						? "몸에 바짝 달라붙어 살짝 비쳐 보이는 옷을 불안하게 내려다본다."
						: "몸에 바짝 달라붙어 살짝 비쳐 보이는 옷의 감촉이 느껴진다."
				);
			}
			br();
			if (V.makeupWashed) br();
		}
	}
	return fragment;
}

Macro.add("effectswater", {
	handler() {
		const fragment = effectsWater(this.args[0]);
		if (fragment) this.output.append(fragment);
	},
});

function effectsMakeup() {
	const fragment = document.createDocumentFragment();

	const span = (text, colour) => {
		const element = document.createElement("span");
		if (colour) element.classList.add(colour);
		element.textContent = text + " ";
		fragment.append(element);
	};
	const br = () => fragment.append(document.createElement("br"));

	if (V.makeupWashed) {
		delete V.makeupWashed;
		const hadBeautyBoost = typeof getBeautyBoost === "function" && getBeautyBoost() > 0;
		span(
			`화장이 씻겨 내려간다${
				V.beauty >= (V.beautymax / 7) * 4 ? ", 타고난 아름다움이 드러난다" : hadBeautyBoost ? "" : ", 어쩐지 조금 밋밋해진 느낌이 든다"
			}.`,
			"teal"
		);
		br();
	}

	if (V.makeup.mascara && V.makeup.mascara_running < painToTearsLvl(V.pain) && !V.makeup.mascara.includes("waterproof")) {
		V.makeup.mascara_running = painToTearsLvl(V.pain);
	}

	/* Beauty boost status messages (shown once per source per application) */
	if (V.beautyBoost) {
		if (V.beautyBoost.bath > 0 && !V.beautyBoost._bathShown) {
			V.beautyBoost._bathShown = true;
			span("목욕한 덕에 상쾌하다. 피부가 빛나고 온몸이 깨끗하다.", "gold");
			br();
		} else if (V.beautyBoost.bath <= 0 && V.beautyBoost._bathShown) {
			delete V.beautyBoost._bathShown;
			span("목욕의 상쾌함이 사라졌다. 한 번 더 씻는 게 좋겠다.", "teal");
			br();
		}

		if (V.beautyBoost.perfume > 0 && !V.beautyBoost._perfumeShown) {
			V.beautyBoost._perfumeShown = true;
			span("피부에 밴 향수 덕에 한결 매력적으로 느껴진다.", "gold");
			br();
		} else if (V.beautyBoost.perfume <= 0 && V.beautyBoost._perfumeShown) {
			delete V.beautyBoost._perfumeShown;
			span("향수의 은은한 빛이 가셨다.", "teal");
			br();
		}

		if (V.beautyBoost.teeth > 0 && !V.beautyBoost._teethShown) {
			V.beautyBoost._teethShown = true;
			span("깨끗한 미소가 조용한 자신감을 준다.", "gold");
			br();
		} else if (V.beautyBoost.teeth <= 0 && V.beautyBoost._teethShown) {
			delete V.beautyBoost._teethShown;
			span("입안의 박하향 상쾌함이 가셨다.", "teal");
			br();
		}

		/* A bath covers face, hands and intimate hygiene, so its own message speaks for them */
		const bathActive = V.beautyBoost.bath > 0;

		if (V.beautyBoost.face > 0 && !V.beautyBoost._faceShown) {
			V.beautyBoost._faceShown = true;
			if (!bathActive) {
				span("얼굴이 산뜻하고 깨끗하게 느껴진다.", "gold");
				br();
			}
		} else if (V.beautyBoost.face <= 0 && V.beautyBoost._faceShown) {
			delete V.beautyBoost._faceShown;
			span("얼굴이 예전만큼 산뜻하지 않다.", "teal");
			br();
		}

		if (V.beautyBoost.hands > 0 && !V.beautyBoost._handsShown) {
			V.beautyBoost._handsShown = true;
			if (!bathActive) {
				span("손이 깨끗하고 산뜻하게 느껴진다.", "gold");
				br();
			}
		} else if (V.beautyBoost.hands <= 0 && V.beautyBoost._handsShown) {
			delete V.beautyBoost._handsShown;
			span("손이 더는 깨끗하게 느껴지지 않는다.", "teal");
			br();
		}

		if (V.beautyBoost.hygiene > 0 && !V.beautyBoost._hygieneShown) {
			V.beautyBoost._hygieneShown = true;
			if (!bathActive) {
				span("한결 깨끗하고 단정해진 느낌이다.", "gold");
				br();
			}
		} else if (V.beautyBoost.hygiene <= 0 && V.beautyBoost._hygieneShown) {
			delete V.beautyBoost._hygieneShown;
			span("아래쪽이 더는 예전만큼 산뜻하지 않다.", "teal");
			br();
		}

		if (V.beautyBoost.tan > 0 && !V.beautyBoost._tanShown) {
			V.beautyBoost._tanShown = true;
			span("피부에 햇볕에 그을린 따뜻한 윤기가 돈다.", "gold");
			br();
		} else if (V.beautyBoost.tan <= 0 && V.beautyBoost._tanShown) {
			delete V.beautyBoost._tanShown;
			span("태닝으로 얻은 윤기가 사라졌다.", "teal");
			br();
		}

		const spaBoost = V.beautyBoost.spa;
		const spaActive = typeof getSpaBeautyBoost === "function" && getSpaBeautyBoost() > 0;
		if (spaActive && !V.beautyBoost._spaShown) {
			V.beautyBoost._spaShown = true;
			span(`${spaBoost?.treatment || "스파 관리"} 덕분에 잘 가꾼 듯한 모습이다.`, "gold");
			br();
		} else if ((!spaActive || spaBoost?.expiredNotice) && V.beautyBoost._spaShown) {
			delete V.beautyBoost._spaShown;
			if (V.beautyBoost.spa) delete V.beautyBoost.spa.expiredNotice;
			span("스파 관리로 얻은 값비싼 윤기가 마침내 사라졌다.", "teal");
			br();
		} else if (spaBoost?.expiredNotice) {
			delete V.beautyBoost.spa.expiredNotice;
		}
	}

	/* Well Fed uses the same one-time gain/loss notice pattern as bathing freshness. */
	if (!V.statFreeze && typeof window.wellFedActive === "function" && V.pocket) {
		if (window.wellFedActive() && !V.pocket._wellFedShown) {
			V.pocket._wellFedShown = true;
			span("적당히 배가 부르고 잘 먹은 느낌이다.", "gold");
			br();
		} else if (!window.wellFedActive() && V.pocket._wellFedShown) {
			delete V.pocket._wellFedShown;
			span("배가 다시 비었다. 더는 잘 먹은 상태가 아니다.", "teal");
			br();
		}
	}

	if (!V.statFreeze && typeof window.bloatedActive === "function" && V.pocket) {
		if (window.bloatedActive() && !V.pocket._bloatedShown) {
			V.pocket._bloatedShown = true;
			span("배가 고통스러울 만큼 더부룩하다.", "red");
			br();
		} else if (!window.bloatedActive() && V.pocket._bloatedShown) {
			delete V.pocket._bloatedShown;
			span("더부룩한 느낌이 마침내 가라앉았다.", "teal");
			br();
		}
	}
	return fragment;
}

function effects() {
	const fragment = document.createDocumentFragment();

	/* Must happen before any effect/caption/stat macro can clamp tiredness. */
	if (typeof updateDynamicStatCaps === "function") updateDynamicStatCaps();

	const sWikifier = text => {
		fragment.append(Wikifier.wikifyEval(text + " "));
	};
	const element = (element, text, colour) => {
		const result = document.createElement(element);
		if (colour) result.classList.add(colour);
		result.textContent = text + " ";
		fragment.append(result);
	};
	const br = () => fragment.append(document.createElement("br"));

	// Depricated as of current
	// if (V.newVersionData) sWikifier("<<newversionnotification>>");

	sWikifier("<<autoTakePillCheck>>");
	fragment.append(effectsWater());
	fragment.append(effectsMakeup());

	V.speechcycle++;
	if (V.speechcycle >= 7) V.speechcycle = 0;

	if (Weather.bodyTemperature < setup.WeatherTemperature.minTemperature + 1 && !Weather.BodyTemperature.isIncreasing()) {
		element("span", `몸이 너무 차가워 저체온증에 걸릴 것 같다!`, "red");
		br();
	} else if (Weather.bodyTemperature > setup.WeatherTemperature.maxTemperature - 1 && !Weather.BodyTemperature.isDecreasing()) {
		element("span", `몸이 너무 뜨거워 열사병에 걸릴 것 같다!`, "red");
		br();
	}

	if (!T.inWater && V.squidcount) {
		element("span", `${V.squidcount > 1 ? "오징어들이" : "오징어가"} 물을 찾아 당신에게서 떨어져 나간다.`, "blue");
		V.squidcount = 0;
	}

	if (V.scienceproject === "ongoing" && V.scienceprojectdays === 0 && !V.scienceprojectwarning) {
		V.scienceprojectwarning = 1;
		element("span", `오늘 클리프 가의 시청에서 ${ampm(9, 0)}부터 ${ampm(18, 0)}까지 과학 박람회가 열린다.`, "gold");
	}

	if (V.mathsproject === "ongoing" && V.mathsprojectdays === 0 && !V.mathsprojectwarning) {
		V.mathsprojectwarning = 1;
		element("span", `오늘 클리프 가의 시청에서 ${ampm(9, 0)}부터 ${ampm(18, 0)}까지 수학 경시대회가 열린다.`, "gold");
	}

	if (V.englishPlay === "ongoing" && V.englishPlayDays === 0 && !V.englishPlayWarning) {
		V.englishPlayWarning = 1;
		element("span", `오늘 밤 클리프 가에서 ${ampm(17, 0)}부터 ${ampm(21, 0)}까지 학교 연극제가 열린다.`, "gold");
	}

	const rentedCount = V.studyBooks?.rented?.count ?? 0;

	if (rentedCount >= 1 && V.book_rent_timer === 0 && !V.studyBookDueWarning && Time.schoolTerm) {
		V.studyBookDueWarning = 1;
		element("span", `오늘 도서관에 반납해야 할 책이 있다.`, "gold");
	}

	if (V.innocencemessage === "start") {
		delete V.innocencemessage;
		element("span", "깊은 평온이 마음 위로 내려앉는다. 방금 전까지 괴로웠지만, 왜 그랬는지 기억나지 않는다.", "red");
		element("i", "트라우마가 순수함으로 대체되었다. 트라우마는 계속 축적되며, 순수함이 바닥나면 다시 돌아온다.");
	} else if (V.innocencemessage === "end") {
		delete V.innocencemessage;
		element("span", "끔찍한 깨달음이 찾아온다. 지금까지 견뎌 온 학대를 더는 외면할 수 없다.", "red");
		element("i", "순수함이 트라우마로 대체되었다.");
	}

	if (V.eventskipoverrule) V.eventskipoverrule = 0;

	if (V.underwatercheck > 0) {
		V.underwatercheck--;
	} else if (V.underwater === 1) {
		V.underwater = 0;
		V.oxygen = Math.clamp(V.oxygen, 0, V.oxygenmax);
		if (V.oxygen < V.oxygenmax) {
			V.oxygenRecovery = true;
		}
	}
	if (V.oxygenRecovery && V.underwater === 0 && V.combat === 0) {
		sWikifier(
			`<span class="lblue">산소 (회복 중):</span>
			<<dynamicblock id=oxygen-caption>>
				<<oxygencaption>>
			<</dynamicblock>>`
		);
	}

	sWikifier("<<updateHallucinations>>");

	if (V.controlled === 0 && V.flashbacks >= 1) {
		switch (V.location) {
			case "town":
				if (V.flashbacktownready === 1) {
					delete V.flashbacktownready;
					sWikifier("<<flashbacktown>>");
				}
				break;
			case "home":
				if (V.flashbackhomeready === 1) {
					delete V.flashbackhomeready;
					sWikifier("<<flashbackhome>>");
				}
				break;
			case "beach":
				if (V.flashbackbeachready === 1) {
					delete V.flashbackbeachready;
					sWikifier("<<flashbackbeach>>");
				}
				break;
			case "underground":
				if (V.flashbackundergroundready === 1) {
					delete V.flashbackundergroundready;
					sWikifier("<<flashbackunderground>>");
				}
				break;
			case "school":
				if (V.flashbackschoolready === 1) {
					delete V.flashbackschoolready;
					sWikifier("<<flashbackschool>>");
				}
				break;
		}
	}

	if (
		!V.waterDragonNest?.discovered &&
		((V.settings.playerPregnancyEggLayingEnabled === true &&
			V.waterDragonEggs?.daysTillLaying <= 0 &&
			(V.player.vaginaExist || canBeMPregnant()) &&
			!playerIsPregnant()) ||
			(Transformations.waterDragonPregnancy() && (isPregnancyEnding() || playerClutchReadyToLay()))) &&
		!Transformations.waterDragonLayingBlocked() &&
		!V.waterDragonLab?.active
	) {
		sWikifier("<<waterDragonNestDefaults>>");
		V.waterDragonNest.discovered = true;
		sWikifier(
			'<span class="navy">A strong pull draws your attention towards the sea. You can picture a hidden opening in the coastal cliffs, beyond the white roses. You know how to reach the hidden beach from the coastal path.</span>'
		);
		br();
	}

	// eslint-disable-next-line no-undef
	if (isPregnancyEnding() && V.birth === undefined) {
		// Pregnancies with partner-specific content keep their native birth route.
		// Locked-down locations keep their own birth chain, so the coastal-path prompt would only be misleading there.
		const dragonLabour = typeof Transformations !== "undefined" && Transformations.waterDragonPregnancy();
		const dragonHeld = !!(V.waterDragonLab && V.waterDragonLab.active) || ["asylum", "prison"].includes(V.location);
		sWikifier(
			`<span class="red">양수가 터졌다.</span> ${
				dragonLabour && !dragonHeld
					? '<span class="navy">빨리 해안 산책로로 가야 한다!</span>'
					: ["asylum", "prison", "hospital", "mines"].includes(V.location)
					? "빨리 도움을 찾아야 한다!"
					: "빨리 병원으로 가야 한다!"
			} <<ggstress>>`
		);
		br();
	}

	if (V.effectsmessage && !V.statFreeze && !V.silenceNotifications) {
		delete V.effectsmessage;

		if (V.speechDailyMessagePending && V.speechDailyMessage) {
			element("span", V.speechDailyMessage, "lustful");
			delete V.speechDailyMessagePending;
			delete V.speechDailyMessage;
			br();
		}

		if (V.recovered_from_pregnancy) {
			delete V.recovered_from_pregnancy;
			element("span", "자궁에 익숙한 공허함이 돌아온다.", "green");
		}

		// Acceptance of the belly earned by repetition rather than by praying about it - see the habituation floor in dailyPlayerEffects().
		if (V.pregnancy_acceptance_message) {
			const carrying = V.pregnancy_acceptance_message === "carrying";
			const traitName = playerAwareTheyArePregnant() ? "수용: 임신한 배" : "수용: 임신한 것 같은 배";
			delete V.pregnancy_acceptance_message;
			element(
				"span",
				carrying
					? `이 일을 워낙 자주 겪은 탓에 몸 앞쪽의 무게는 이제 그저 당신의 일부다. 더는 버티며 막아낼 것이 없다. "${traitName}" 특성을 얻었다.`
					: `여러 번 품어본 끝에, 다시 배가 부풀 수 있다는 생각에도 더는 움찔하지 않는다. 배가 다시 불러올 경우를 대비해 "${traitName}" 특성을 얻었다.`,
				"green"
			);
			br();
		}

		if (V.skulduggerymessage) {
			const grade = ["S", "A+", "A", "B+", "B", "C+", "C", "D+", "D", "F+"];
			const colour = ["green", "teal", "teal", "lblue", "lblue", "blue", "blue", "purple", "purple", "pink"];
			element("span", "속임수 실력이", "gold");
			element("span", `${grade[V.skulduggerymessage - 1]}`, colour[V.skulduggerymessage - 1]);
			element("span", "등급으로 향상되었다.", "gold");
			delete V.skulduggerymessage;
			V.skulduggeryday = V.skulduggery;
		}

		if (V.hypnosis_deviancy_message) {
			delete V.hypnosis_deviancy_message;
			sWikifier(
				`<<hypnosisText "어제는 그다지 일탈적이지 않았다.">> ${
					V.hypnosis_traits.deviancy < 5 ? "그 생각에 " : "그 생각이 마음을 "
				}`
			);
			switch (V.hypnosis_traits.deviancy) {
				case 1:
					element("span", "수치심으로 채운다.", "lblue");
					break;
				case 2:
					element("span", "후회로 채운다.", "blue");
					break;
				case 3:
					element("span", "죄책감으로 채운다.", "purple");
					break;
				case 4:
					element("span", "강렬한 죄책감으로 채운다.", "pink");
					break;
				case 5:
					element("span", "죄책감과 불안으로 어지럽힌다.", "red");
					break;
			}
			sWikifier("<<gggtrauma>>");
		}

		if (V.hypnosis_devotion_message) {
			switch (V.hypnosis_devotion_message) {
				case "ritual":
					sWikifier(`<<hypnosisText "이번 주에 그윌란의 의식을 돕기 위해 만나지 않았다.">> `);
					break;
				case "request":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "아직 그윌란의 부탁을 끝내지 못했다.">> `);
					} else {
						sWikifier(`<<hypnosisText "어제 그윌란의 부탁을 끝내지 못했다.">> `);
					}
					break;
				case "meetAtShop":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "아직 상점에서 그윌란과 만나지 않았다.">> `);
					} else {
						sWikifier(`<<hypnosisText "어제 상점에서 그윌란과 만나지 않았다.">> `);
					}
					break;
				case "meetAtCafe":
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "아직 카페에서 그윌란과 만나지 않았다.">> `);
					} else {
						sWikifier(`<<hypnosisText "어제 카페에서 그윌란과 만나지 않았다.">> `);
					}
					break;
				default:
					if (V.gwylan.request.missed) {
						sWikifier(`<<hypnosisText "아직 그윌란의 부탁을 들어주지 못했다.">> `);
					} else {
						sWikifier(`<<hypnosisText "어제 그윌란의 부탁을 들어주지 못했다.">> `);
					}
					break;
			}
			sWikifier(`${V.hypnosis_traits.devotion < 5 ? "그 생각에 " : "그 생각이 마음을 "}`);
			switch (V.hypnosis_traits.devotion) {
				case 1:
					element("span", "수치심으로 채운다.", "lblue");
					sWikifier(`<<gtrauma>><<ghallucinogens>>`);
					break;
				case 2:
					element("span", "후회로 채운다.", "blue");
					sWikifier(`<<ggtrauma>><<ghallucinogens>>`);
					break;
				case 3:
					element("span", "죄책감으로 채운다.", "purple");
					sWikifier(`<<ggtrauma>><<gghallucinogens>>`);
					break;
				case 4:
					element("span", "강렬한 죄책감으로 채운다.", "pink");
					sWikifier(`<<gggtrauma>><<gghallucinogens>>`);
					break;
				case 5:
					element("span", "죄책감과 불안으로 어지럽힌다.", "red");
					sWikifier(`<<gggtrauma>><<ggghallucinogens>>`);
					break;
			}
			delete V.hypnosis_devotion_message;
		}

		if (V.hypnosis_timer_messages?.length) {
			V.hypnosis_timer_messages.forEach(trait => {
				switch (trait) {
					case "devotion":
						sWikifier("<<gwylanHypnosis 'devotion' -1>>");
						break;
					case "intrusive_planted":
						sWikifier(
							numberOfEarSlime() >= 2
								? '<span class="lewd">A second voice settles in beside the first. The two of them murmur back and forth about what you should do.</span>'
								: `<span class="lewd">Something from the trance stays with you: a quiet voice at the back of your mind, suggesting lewd things. It doesn't feel like your own, and it doesn't go away.</span>` +
										(V.earSlime.corruption ? "" : "<br><i>A corruption bar has appeared in the Characteristics tab.</i>")
						);
						break;
					case "peace":
						sWikifier('<span class="purple">익숙한 불확실함이 온몸을 채운다. 최면의 평온이 사라졌다.</span>');
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					case "silence":
						sWikifier(
							`${
								numberOfEarSlime()
									? "<span class='purple'>익숙한 속삭임이 귀를 채운다. 최면의 침묵이 사라졌다.</span>"
									: "<span class='purple'>최면의 침묵이 사라졌다.</span>"
							}`
						);
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					case "slumber":
						sWikifier('<span class="purple">최면의 수면이 사라졌다.</span>');
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					case "insight": {
						const insightText = V.awareness >= 300 ? "무지" : "통찰";
						sWikifier(`<span class="purple">최면의 ${insightText}【이가】 사라졌다.</span>`);
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
					}
					default:
						sWikifier(`<span class="purple">최면 효과 ${trait === "insight" && V.awareness >= 300 ? "Ignorance" : trait.toUpperFirst()}【이가】 사라졌다.</span>`);
						delete V.hypnosis_traits[trait];
						delete V.hypnosisTimers[trait];
						break;
				}
			});
			delete V.hypnosis_timer_messages;
		}

		// expects the use of $science_up_message, $maths_up_message, $english_up_message, $history_up_message, $science_down_message, $maths_down_message, $english_down_message, $history_down_message
		["science", "maths", "english", "history"].forEach(subject => {
			const subjectDisplay = { science: "과학", maths: "수학", english: "영어", history: "역사" }[subject] || subject;
			if (V[`${subject}_up_message`]) {
				delete V[`${subject}_up_message`];
				sWikifier(`<<${subject}_skill_up_text>>`);
				br();
			} else if (V[`${subject}_down_message`]) {
				delete V[`${subject}_down_message`];
				element("span", `${subjectDisplay} 수업 내용을 따라가지 못하게 되었다${V[`${subject}trait`] > 0 ? ", 특성이 약화된다" : ""}.`, "red");
				br();
			}
		});

		if (V.lactationmessage) {
			delete V.lactationmessage;
			if (V.lactating) {
				sWikifier('<span class="purple"><<breasts>>【이가】 묵직하고 민감하게 느껴진다.</span>');
			} else {
				sWikifier('<span class="lblue"><<breasts>>【이가】 가볍게 느껴진다. 더는 그렇게 민감하지 않다.</span>');
			}
		}

		if (V.penisgrowthmessage !== undefined) {
			switch (V.penisgrowthmessage) {
				case 6:
					element("span", "성기가 엄청난 크기로 자랐다.", "purple");
					break;
				case 5:
					element("span", "성기가 더 커졌다.", "purple");
					break;
				case 4:
					element("span", "성기가 평범한 크기로 자랐다.", "purple");
					break;
				case 3:
					element("span", "성기가 자랐지만, 아직 작다.", "purple");
					break;
				case 2:
					element("span", "성기가 회복되고 있는 것 같다.", "purple");
					break;
				case 1:
					element("span", "성기가 다시 기회를 얻은 것처럼 보인다.", "purple");
					break;
			}
			delete V.penisgrowthmessage;
		}

		if (V.penisshrinkmessage !== undefined) {
			if (V.worn.genitals.name === "chastity parasite") {
				switch (V.penisshrinkmessage) {
					case 5:
						element("span", "정조 기생충이 줄어들었지만, 아직도 인상적인 성기 크기를 암시한다.", "purple");
						break;
					case 4:
						element("span", "정조 기생충이 평범한 크기로 줄어들었다.", "purple");
						break;
					case 3:
						element("span", "정조 기생충이 더 작아졌다.", "purple");
						break;
					case 2:
						element("span", "정조 기생충이 아주 작아졌다.", "purple");
						break;
					case 1:
						element("span", "정조 기생충이 쪼그라들 것 같다.", "purple");
						break;
					case 0:
						element("span", "정조 기생충이 거의 아무것도 가리지 못하는 것 같다.", "purple");
						break;
				}
			} else {
				switch (V.penisshrinkmessage) {
					case 5:
						element("span", "성기가 줄어들었지만, 아직 인상적인 크기다.", "purple");
						break;
					case 4:
						element("span", "성기가 평범한 크기로 줄어들었다.", "purple");
						break;
					case 3:
						element("span", "성기가 더 작아졌다.", "purple");
						break;
					case 2:
						element("span", "성기가 아주 작아졌다.", "purple");
						break;
					case 1:
						element("span", "성기가 쪼그라들 것 같다.", "purple");
						break;
					case 0:
						element("span", "성기가 다시는 제대로 쓰이지 못할 것 같다.", "purple");
						break;
				}
			}
			delete V.penisshrinkmessage;
		}

		if (V.breastgrowthmessage !== undefined) {
			switch (V.breastgrowthmessage) {
				case 12:
					element("span", "큰 가슴이 묵직하게 느껴지고, 움직임에 방해가 될 것 같다.", "purple");
					break;
				case 11:
					element("span", "큰 가슴이 묵직하고 인상적으로 느껴진다.", "purple");
					break;
				case 10:
				case 9:
					element("span", "가슴이 묵직하게 느껴진다.", "purple");
					break;
				case 8:
				case 7:
					element("span", "가슴이 조금 더 묵직하게 느껴진다.", "purple");
					break;
				case 6:
				case 5:
					element("span", "작은 가슴이 주변 사람들에게도 눈에 띌 것이다.", "purple");
					break;
				case 4:
				case 3:
					element("span", "작은 가슴이 다른 사람들에게 눈에 띌지도 모른다.", "purple");
					break;
				case 2:
				case 1:
					element("span", "가슴께가 이상하게 느껴진다. 자라고 있는지도 모른다.", "purple");
					break;
			}
			delete V.breastgrowthmessage;
		}

		if (V.orgasmCrampMessage) {
			// Numeric messages may still be pending in saves from before skill scaling.
			if (V.orgasmCrampMessage.severe || V.orgasmCrampMessage >= 20) {
				sWikifier(`<span class="red">You climaxed far too many times yesterday. Your groin cramps and aches with every step.</span>`);
				statChange.pain(10);
				statChange.tiredness(20);
			} else {
				sWikifier(`<span class="red">You climaxed too many times yesterday. Your groin feels sore and crampy.</span>`);
				statChange.pain(5);
				statChange.tiredness(10);
			}
			delete V.orgasmCrampMessage;
		}

		if (V.daily.milkFullPainMessage === 1) {
			if (V.milkFullPain >= 275) {
				sWikifier(`<span class="red">한동안 충분히 착유하지 않았다. 가득 찬 <<breasts>>【이가】 아프게 욱신거린다.</span>`);
			} else if (V.milkFullPain >= 250) {
				sWikifier(`<span class="red">최근 충분히 착유하지 않았다. 가득 찬 <<breasts>>【이가】 쓰라리다.</span>`);
			} else {
				sWikifier(`<span class="red">요즘 충분히 착유하지 않았다. 가득 찬 <<breasts>>【이가】 조금 쓰라리다.</span>`);
			}
			V.daily.milkFullPainMessage = true;
		}

		if (V.breastshrinkmessage !== undefined) {
			switch (V.breastshrinkmessage) {
				case 11:
					element("span", "큰 가슴이 가벼워진 것 같지만, 아직도 매우 크다.", "purple");
					break;
				case 10:
				case 9:
					element("span", "가슴이 가볍게 느껴지고, 덜 인상적으로 보인다.", "purple");
					break;
				case 8:
				case 7:
					element("span", "가슴이 더 가볍게 느껴진다.", "purple");
					break;
				case 6:
				case 5:
					element("span", "작은 가슴이 조금 더 가볍게 느껴진다.", "purple");
					break;
				case 4:
				case 3:
					element("span", "작은 가슴이 덜 도드라져 보인다.", "purple");
					break;
				case 2:
				case 1:
					element("span", "가슴께가 더 납작해 보인다.", "purple");
					break;
				case 0:
					element("span", "가슴께가 납작해 보인다.", "purple");
					break;
			}
			delete V.breastshrinkmessage;
		}

		if (V.bottomgrowthmessage !== undefined) {
			switch (V.bottomgrowthmessage) {
				case 8:
					element("span", "큰 엉덩이가 더 커졌다.", "purple");
					break;
				case 7:
					element("span", "엉덩이가 묵직하게 느껴진다.", "purple");
					break;
				case 6:
					element("span", "엉덩이가 통통하게 느껴진다.", "purple");
					break;
				case 5:
					element("span", "엉덩이가 둥글게 느껴진다.", "purple");
					break;
				case 4:
					element("span", "엉덩이가 푹신하게 느껴진다.", "purple");
					break;
				case 3:
					element("span", "엉덩이에 살이 조금 붙었다.", "purple");
					break;
				case 2:
					element("span", "작던 엉덩이가 기억보다 더 도드라진다.", "purple");
					break;
				case 1:
					element("span", "엉덩이가 더는 그렇게 작게 느껴지지 않는다.", "purple");
					break;
			}
			delete V.bottomgrowthmessage;
		}

		if (V.bottomshrinkmessage) {
			switch (V.bottomshrinkmessage) {
				case 7:
					element("span", "큰 엉덩이가 조금 가벼워진 것 같다.", "purple");
					break;
				case 6:
					element("span", "엉덩이가 가볍게 느껴진다.", "purple");
					break;
				case 5:
					element("span", "엉덩이가 예전만큼 푹신하지 않다.", "purple");
					break;
				case 4:
					element("span", "엉덩이 살이 빠졌다.", "purple");
					break;
				case 3:
					element("span", "엉덩이가 훨씬 날렵하게 느껴진다.", "purple");
					break;
				case 2:
				case 1:
					element("span", "엉덩이가 작게 느껴진다.", "purple");
					break;
				case 0:
					element("span", "엉덩이가 아주 작게 느껴진다.", "purple");
					break;
			}
			delete V.bottomshrinkmessage;
		}

		if (V.speech_attitude_bratty_message) {
			delete V.speech_attitude_bratty_message;
			element("span", "너무 순종적이 되어 대화에서 건방진 태도를 취할 수 없게 되었다.", "purple");
		}

		if (V.speech_attitude_meek_message) {
			delete V.speech_attitude_meek_message;
			element("span", "너무 반항적이 되어 대화에서 온순한 태도를 취할 수 없게 되었다.", "purple");
		}

		if (V.sunscreenAutoApplied) {
			element("span", `피부에 자외선 차단제를 바른다${Skin.Sunscreen.usesLeft <= 0 ? "," : "."}`, "purple");
			if (Skin.Sunscreen.usesLeft <= 0) element("span", "마지막 남은 것까지 사용했다.", "red");
			delete V.sunscreenAutoApplied;
		}

		if (V.pillsTaken) {
			element("span", "매일 먹는 알약을 복용한다.", "purple");
			if (V.pillsTakenLast) element("span", "몇몇 알약이 떨어졌다.", "red");
			delete V.pillsTaken;
			delete V.pillsTakenLast;
		}

		if (V.hairGrowthApplied) {
			element("span", `머리에 성장 촉진제를 바른다${V.hairGrowthAppliedLast ? "," : "."}`, "purple");
			if (V.hairGrowthAppliedLast) element("span", "하지만 마지막 남은 것까지 사용했다.", "red");
			delete V.hairGrowthApplied;
			delete V.hairGrowthAppliedLast;
		}

		if (V.exhibitionism_message) {
			sWikifier(
				`<span class="lblue">속옷을 입지 않은 채로 공공장소에서 시간을 보냈다. 사람들이 눈치챘을까 하는 생각에 몸이 떨린다.</span> <<exhibitionism1>>`
			);
			delete V.exhibitionism_message;
		}

		if (V.rebuy_success.length) {
			const rebuyMessage = {};
			V.rebuy_success.forEach(([item, location]) => {
				if (!rebuyMessage[location]) rebuyMessage[location] = [];
				rebuyMessage[location].push(item);
			});
			Object.entries(rebuyMessage).forEach(([location, items]) => {
				const itemList = items.join(", ");
				element(
					"span",
					`${itemList}【이가】 대체품 요청 신호를 보냈습니다${
						V.wardrobes[location]
							? `. 대체품은 ${window.KR.getWardrobeNameKr(V.wardrobes[location].name)}에 도착합니다`
							: `. (일회성 업데이트 오류일 가능성이 높습니다. 같은 세이브에서 여러 번 보이는 경우가 아니라면 보고할 필요는 없습니다.) ${
									Array.isArray(V.rebuy_success) ? JSON.stringify(V.rebuy_success) : ""
							}`
					}.`,
					"lblue"
				);
			});
			V.rebuy_success = [];
		}

		if (V.rebuy_failure.length) {
			const itemList = V.rebuy_failure.join(", ");
			element(
				"span",
				`${formatList(V.rebuy_failure)}【이가】 대체품 요청 신호를 보냈지만, 돈이 부족합니다.`,
				"purple"
			);
			V.rebuy_failure = [];
		}

		if (V.masochism_message) {
			switch (V.masochism_message) {
				case "up 1":
					element("span", "당신이 겪은 공격들이 머릿속을 맴돈다. 몸이 떨린다.", "blue");
					element("i", "죄책감 어린 마조히스트가 되었다.", "blue");
					break;
				case "up 2":
					element("span", "당신이 겪은 공격들이 떠오른다. 원치 않는 전율이 뒤따른다.", "purple");
					element("i", "평범한 마조히스트가 되었다.", "purple");
					break;
				case "up 3":
					element("span", "몸이 더 많은 학대를 갈망한다.", "pink");
					element("i", "단련된 마조히스트가 되었다.", "pink");
					break;
				case "up 4":
					element("span", "몸이 더 많은 학대를 탐한다.", "red");
					element("i", "침 흘리는 마조히스트가 되었다.", "red");
					break;
				case "down 0":
					element("i", "더는 마조히스트가 아니다.", "lblue");
					break;
				case "down 1":
					element("span", "마조히즘 성향이 약해졌다.", "blue");
					element("i", "죄책감 어린 마조히스트가 되었다.", "blue");
					break;
				case "down 2":
					element("span", "마조히즘 성향이 약해졌다.", "purple");
					element("i", "평범한 마조히스트가 되었다.", "purple");
					break;
				case "down 3":
					element("span", "마조히즘 성향이 약해졌다.", "pink");
					element("i", "단련된 마조히스트가 되었다.", "pink");
					break;
			}
			delete V.masochism_message;
		}

		if (V.sadism_message) {
			switch (V.sadism_message) {
				case "up 1":
					element("span", "당신이 가한 고통들이 떠오른다. 몸이 떨린다.", "blue");
					element("i", "죄책감 어린 사디스트가 되었다.", "blue");
					break;
				case "up 2":
					element("span", "당신이 가한 고통들이 떠오른다. 원치 않는 전율이 뒤따른다.", "purple");
					element("i", "평범한 사디스트가 되었다.", "purple");
					break;
				case "up 3":
					element("span", "다른 사람을 해치고 싶어진다.", "pink");
					element("i", "단련된 사디스트가 되었다.", "pink");
					break;
				case "up 4":
					element("span", "거칠게 놀고 싶다면, 그렇게 해주면 된다.", "red");
					element("i", "복수심에 불타는 사디스트가 되었다.", "red");
					break;
				case "down 0":
					element("i", "더는 사디스트가 아니다.", "lblue");
					break;
				case "down 1":
					element("span", "사디즘 성향이 약해졌다.", "blue");
					element("i", "죄책감 어린 사디스트가 되었다.", "blue");
					break;
				case "down 2":
					element("span", "사디즘 성향이 약해졌다.", "purple");
					element("i", "평범한 사디스트가 되었다.", "purple");
					break;
				case "down 3":
					element("span", "사디즘 성향이 약해졌다.", "pink");
					element("i", "단련된 사디스트가 되었다.", "pink");
					break;
			}
			delete V.sadism_message;
		}

		if (V.school_crossdress_message) {
			const crossdressing = V.player.gender !== V.player.sex ? "여장/남장이라는 의심" : "여장/남장";
			const knows = V.player.gender !== V.player.sex ? "그게 사실이라고 믿고 있다" : "알고 있다";
			switch (V.school_crossdress_message) {
				case 5:
					element("span", `학교에서 당신의 ${crossdressing}【이가】 공공연한 사실이 되었다. 교사들을 포함해 모두가 ${knows}.`, "red");
					break;
				case 4:
					element("span", `당신의 ${crossdressing}에 대한 소문이 학교 전체로 퍼지고 있다.`, "pink");
					break;
				case 3:
					element("span", `당신의 ${crossdressing}에 대한 소문이 퍼져 학교에서 인기 있는 화젯거리가 되었다.`, "purple");
					break;
				case 2:
					element("span", `당신의 ${crossdressing}에 대한 수군거림이 학교에 퍼지고 있다.`, "blue");
					break;
				case 1:
					element("span", `학교의 몇몇 무리가 당신의 ${crossdressing}에 대해 수군거리기 시작했다.`, "lblue");
					break;
			}
			delete V.school_crossdress_message;
		}

		if (V.school_herm_message) {
			switch (V.school_herm_message) {
				case 5:
					element("span", "교사들을 포함해 학교의 모두가 당신의 특이한 성기에 대해 들었다.", "red");
					break;
				case 4:
					element("span", "당신의 특이한 성기에 대한 소문이 학교 전체로 퍼졌다.", "pink");
					break;
				case 3:
					element("span", "많은 이에게 터무니없는 이야기로 들리겠지만, 학교에는 남자와 여자의 몸을 모두 가진 학생에 대한 소문이 자자하다.", "purple");
					break;
				case 2:
					element("span", "남성과 여성의 부위를 모두 지닌 학생에 대한 소문이 학교에 퍼지고 있다.", "blue");
					break;
				case 1:
					element("span", "학교의 몇몇 무리가 남성과 여성의 부위를 모두 지닌 학생에 대해 수군거리기 시작했다.", "lblue");
					break;
			}
			delete V.school_herm_message;
		}

		// Set by hermRumourBodyCheck (xchange.js) when losing both sets of genitals drains the herm rumour.
		if (V.school_herm_fade_message !== undefined) {
			switch (V.school_herm_fade_message) {
				case 0:
					element("span", "학교에서는 두 가지 성기를 모두 가리킬 수 없게 되어 당신의 성기에 대한 소문이 잠잠해진다.", "green");
					break;
				case 1:
					element("span", "당신의 몸이 더는 성기에 대한 소문과 맞지 않는다. 몇몇 무리만 여전히 그 소문을 되풀이한다.", "green");
					break;
				case 2:
					element("span", "당신의 몸이 더는 성기에 대한 소문과 맞지 않게 되었고, 학교 대부분이 더는 그 소문을 믿지 않는다.", "teal");
					break;
				case 3:
					element("span", "당신의 몸이 더는 성기에 대한 소문과 맞지 않게 되었고, 학교의 수군거림도 잦아들었다.", "teal");
					break;
				case 4:
					element("span", "당신의 몸이 더는 성기에 대한 소문과 맞지 않게 되었고, 학교에서 일부는 더는 그 소문을 믿지 않는다.", "teal");
					break;
			}
			delete V.school_herm_fade_message;
		}

		// expects the use of $orgasm_trait_message, $molest_trait_message, $rape_trait_message, $bestiality_trait_message, $tentacle_trait_message, $critter_magnet_trait_message, $vore_trait_message, $milk_trait_message and $cum_trait_message
		[
			["orgasm", "쾌락주의자", "절정 중독"],
			["molest", "우아한", "노리개"],
			["rape", "살아남은자", "육변기"],
			["bestiality", "조련사", "암캐"],
			["tentacle", "마녀", "사냥감"],
			["critter_magnet", "동물 자석", "동물 자석"],
			["vore", "무모한 도전자", "맛있는 먹잇감"],
			["milk", "우유 애호가", "우유 중독자"],
			["cum", "정액 감별사", "정액받이"],
			["penis_addict", "자지 애호가", "자지 중독자"],
			["hole_addict", "구멍 애호가", "구멍 중독자"],
			["oral_fixation", "구강 집착", "구강 집착"],
		].forEach(([variable, defiantName, submissiveName]) => {
			if (V[`${variable}_trait_message`]) {
				element("span", `"${V.submissive <= 850 ? defiantName : submissiveName}" 특성을 얻었다.`, "gold");
				delete V[`${variable}_trait_message`];
			}
		});

		// Both messages are queued a tick before they print. Drop them silently if the trait was switched off in between.
		if (!V.statFreeze && V.chastityAcclimatedTraitMessage) {
			if (V.chastityAcclimatedTrait === 1) {
				element("span", `갇혀 지내는 일이 더는 예전처럼 마음을 갉아먹지 않는다. "정조대에 익숙해짐" 특성을 얻었다.`, "gold");
				br();
			}
			delete V.chastityAcclimatedTraitMessage;
		}

		if (!V.statFreeze && V.arousalDesensitizedTraitMessage) {
			if (!V.statFreeze && V.arousalDesensitizedTrait === 1) {
				element("span", `성적 흥분이 더는 다급하게 느껴지지 않는다. "흥분에 익숙해짐" 특성을 얻었다.`, "gold");
				br();
			}
			delete V.arousalDesensitizedTraitMessage;
		}

		if (V.insanityTraitMessage) {
			if (V.insanityTraitMessage === "gain") {
				element("span", "지금껏 견뎌온 모든 것의 무게가 마침내 마음속 무언가를 갈라놓는다. 현실을 붙드는 힘이 느슨해진다. 당신은 ", "red");
				element("span", '"Insanity"', "red");
				element("span", "trait.", "red");
			} else if (V.insanityTraitMessage === "gainPermanent") {
				element(
					"span",
					"지금껏 견뎌온 모든 것의 무게가 마침내 마음속 무언가를 산산이 부수고, 이제 마음은 스스로 아물지 못한다. 균열이 남아 있는 동안에는 그윌란의 손길만이 그것을 가라앉힐 수 있다. 당신은 ",
					"red"
				);
				element("span", '"Insanity"', "red");
				element("span", " 특성을 영구적으로 얻었다.", "red");
			} else if (V.insanityTraitMessage === "loss") {
				element("span", "트라우마의 가장 심한 부분이 가라앉으면서, 마음이 서서히 스스로 다시 이어붙는다. 당신은 ", "lblue");
				element("span", '"Insanity"', "red");
				element("span", "trait.", "lblue");
			}
			br();
			delete V.insanityTraitMessage;
		}

		if (V.nectarmessage) {
			switch (V.nectarmessage) {
				case "traitGain":
					element(
						"span",
						`달콤한 넥타르를 더 갈망하게 된다. "${V.submissive <= 850 ? "나무성애자" : "식물 애호가"}" 및`,
						"purple"
					);
					element("span", '"넥타르 중독"', "red");
					element("span", "특성을 얻었다.", "purple");
					break;
				case "traitLost":
					element("span", `넥타르에 대한 갈망이 마침내 가라앉았다. "${V.submissive <= 850 ? "나무성애자" : "식물 애호가"}" 및`, "lblue");
					element("span", '"넥타르 중독"', "red");
					element("span", "특성을 잃었다.", "lblue");
					break;
				case "withdrawals":
					sWikifier(
						'<span class="red">몸이 넥타르를 갈망하며 금단 증상에 시달리기 시작했다.</span> <<stress 12>><<ggstress>><<trauma 12>><<ggtrauma>><<physique -4>><<lphysique>>'
					);
					br();
					break;
			}
			delete V.nectarmessage;
		}

		if (window.poppyConsumePendingOpiumMessage) {
			const poppyOpiumMessage = poppyConsumePendingOpiumMessage();
			switch (poppyOpiumMessage) {
				case "traitGainKnown":
					element("span", "가루 같은 아편 냄새가 간절해진다. ", "purple");
					element("span", '"아편 중독자"', "red");
					element("span", " 특성을 얻었다.", "purple");
					br();
					break;
				case "traitGainUnknown":
					element("span", "이유도 모른 채 포피가 곁에 있기를 간절히 바라게 된다.", "purple");
					br();
					break;
				case "traitLostKnown":
					element("span", "아편에 대한 갈망이 마침내 가라앉았다. ", "lblue");
					element("span", '"아편 중독자"', "red");
					element("span", " 특성을 잃었다.", "lblue");
					br();
					break;
				case "traitLostUnknown":
					element("span", "포피가 곁에 있기를 바라던 갈망이 마침내 가라앉았다.", "lblue");
					br();
					break;
				case "withdrawalsKnown":
					sWikifier(
						'<span class="red">몸이 아편을 갈망하며 금단 증상에 시달리기 시작했다.</span> <<stress 12>><<ggstress>><<straighttrauma 12>><<ggtrauma>>'
					);
					br();
					break;
				case "withdrawalsUnknown":
					sWikifier(
						'<span class="red">몸이 포피의 존재를 갈망하며 금단 증상에 시달리기 시작했다.</span> <<stress 12>><<ggstress>><<straighttrauma 12>><<ggtrauma>>'
					);
					br();
					break;
			}
		}
		if (window.poppyConsumePendingPavlovMessage && poppyConsumePendingPavlovMessage()) {
			element("span", "포피가 관심 연인이 된 뒤로, 불꽃에 끌리는 나방처럼 포피에게 이끌리는 것을 어쩔 수 없다. ", "purple");
			element("span", '"파블로프: 포피"', "red");
			element("span", " 특성을 얻었다.", "purple");
			br();
		}

		if (V.hiddenTransformMessage) {
			element(
				"span",
				V.hiddenTransformMessage === 1
					? "정신 상태가 너무 취약해 내면의 모습을 계속 숨길 수 없다."
					: "내면의 모습을 숨기는 일이 정신 상태를 갉아먹는다.",
				"red"
			);
			delete V.hiddenTransformMessage;
		}

		if (V.prof_spray_message) {
			element("span", "스프레이가 정확히 맞았다. 카트리지를 전부 쓰지 않아 탄약을 아꼈다.", "green");
			delete V.prof_spray_message;
		}

		if (V.community_message === "missed") {
			sWikifier('<span class="red">사회봉사를 빠졌다. 경찰이 이를 기록했다.</span><<crime "obstruction">>');
			delete V.community_message;
		}

		if (V.toy_message) {
			element("span", "마을 전역에서 섹스 토이가 더 인기를 얻고 있다.", "purple");
			delete V.toy_message;
		}

		if (V.loveInterest_message === 1) {
			element("i", "여러 연인을 두는 것은 잘못이라는 생각이 든다. 이제 관심 연인을 하나만 선택할 수 있다.", "blue");
			delete V.loveInterest_message;
			delete V.loveInterestAwareMessage;
		} else if (V.loveInterest_message === 2 && !V.loveInterestAwareMessage) {
			element("i", "다른 연인의 가능성에 마음이 열린다. 이제 두 번째 관심 연인을 선택할 수 있다.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 1;
		} else if (V.loveInterest_message === 3 && V.loveInterestAwareMessage === 1) {
			element("i", "여러 연인의 가능성에 마음이 열린다. 이제 세 번째 관심 연인을 선택할 수 있다.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 2;
		} else if (V.loveInterest_message === 4 && V.loveInterestAwareMessage === 2) {
			element("i", "여러 연인의 가능성에 마음이 열린다. 이제 네 번째 관심 연인을 선택할 수 있다.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 3;
		} else if (V.loveInterest_message === 5 && V.loveInterestAwareMessage === 3) {
			element("i", "여러 연인의 가능성에 마음이 열린다. 이제 다섯 번째 관심 연인을 선택할 수 있다.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 4;
		} else if (V.loveInterest_message === 6 && V.loveInterestAwareMessage === 4) {
			element("i", "여러 연인의 가능성에 마음이 열린다. 이제 여섯 번째 관심 연인을 선택할 수 있다.", "pink");
			delete V.loveInterest_message;
			V.loveInterestAwareMessage = 5;
		}

		if (V.fallenangelmessage) {
			sWikifier('<span class="red">어두운 존재가 피부를 할퀴는 것 같다.</span> <<gstress>>');
			V.stress += V.stressmax;
			delete V.fallenangelmessage;
		}

		if (V.demonmessage) {
			sWikifier('<span class="red">끔찍한 빛이 몸을 꿰뚫고 태우는 것 같다.</span> <<gstress>>');
			V.stress += V.stressmax;
			if (V.stress >= V.stressmax) V.stress = V.stressmax - 50;
			V.trauma += V.traumamax * 0.75;
			delete V.demonmessage;
		}

		if (V.foxCrimeMessage) {
			element(
				"span",
				V.blackmoney >= 100
					? "점점 늘어나는 훔친 물건들을 보며 동물적인 만족감이 든다."
					: "그런 범죄를 저지르며 동물적인 만족감이 든다.",
				"gold"
			);
			delete V.foxCrimeMessage;
		}

		if (V.bookoverduemessage) {
			if (V.bookoverduemessage === 1) {
				sWikifier(`<<crimeUp 5 "thievery">><<delinquency ${5 / 4}>>`);
				element("span", "반납 기한을 크게 넘긴 책이 있으며, 경찰에 통보되었다.", "red");
			} else {
				sWikifier(`<<delinquency ${3 / 4}>>`);
				element("span", "반납 기한을 넘긴 책이 있어 비행도가 올랐다.", "red");
			}
			delete V.bookoverduemessage;
		}

		if (V.wraithcompoundmessage) {
			element("span", "엘크 가 위로 불길한 안개가 드리워졌다.", "red");
			delete V.wraithcompoundmessage;
		}

		if (V.halloweenClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "halloween">>`);
			delete V.halloweenClothesMessage;
		}

		if (V.christmasClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "christmas">>`);
			delete V.christmasClothesMessage;
		}

		if (V.valentinesClothesMessage) {
			sWikifier(`<<specialClothesUnlock "set" "valentines">>`);
			delete V.valentinesClothesMessage;
		}

		if (V.earSlimebreastsParasite || V.earSlimePenisParasite || V.earSlimeClitParasite) {
			const parasiteCount = (V.earSlimebreastsParasite ? 1 : 0) + (V.earSlimePenisParasite ? 1 : 0) + (V.earSlimeClitParasite ? 1 : 0);
			let parasiteMessage = "";
			if (V.earSlimebreastsParasite) parasiteMessage += `새 기생충이 당신의 ${V.player.breastsize >= 1 ? "가슴" : "흉부"} 주위에 생겨난다`;

			if (V.earSlimePenisParasite) {
				parasiteMessage += parasiteMessage ? " 그리고 성기 밑동" : "새 기생충이 당신의 성기 밑동 주위에 생겨난다";
			}

			if (V.earSlimeClitParasite && V.player.vaginaExist) {
				if (V.earSlime.focus === "pregnancy") {
					parasiteMessage += parasiteMessage ? " 그리고 <<pussy>>" : "새 기생충이 당신의 <<pussy>> 주위에 생겨난다";
				} else {
					const looksText = playerChastity("vagina") ? "느껴진다" : "보인다";
					parasiteMessage += parasiteMessage
						? ` 그리고 클리토리스 주위에 생겨난다. 이제 당신만의 성기가 생긴 것처럼 ${looksText}`
						: `새 기생충이 당신의 클리토리스 밑동 주위에 생겨나 성기처럼 ${looksText}`;
				}
			}
			if (parasiteMessage) {
				sWikifier(`<span class="blue">만족스러운 온기가 당신을 채운다. ${parasiteMessage}.</span>`);
				element("span", `그것이 귀 속 슬라임에게서 비롯된 것임을 알 수 있다.`);
				if (V.earSlimePenisParasite && V.earSlimePenisParasite !== 1) {
					element("span", `성장이 끝난 직후 이전 ${V.earSlimePenisParasite}【이가】 떨어져 나간다.`, "red");
				}
				if (V.earSlimeClitParasite && V.earSlimeClitParasite !== 1) {
					element("span", `성장이 끝난 직후 이전 ${V.earSlimeClitParasite}【이가】 떨어져 나간다.`, "red");
				}
			}
			delete V.earSlimebreastsParasite;
			delete V.earSlimePenisParasite;
			delete V.earSlimeClitParasite;
		}

		if (V.penisslimebrokenchastitymessage) {
			element(
				"span",
				`성기 밑동의 기생충이 ${V.penisslimebrokenchastitymessage}에서 당신을 풀어준다${
					V.penisslimecagemessage === 1 ? ", 그리고 거의 동시에 새 정조 기생충이 성기 주위에 생겨난다" : ""
				}.`,
				"purple"
			);
			delete V.penisslimecagemessage;
			delete V.penisslimebrokenchastitymessage;
		}

		if (V.penisslimecagemessage) {
			element(
				"span",
				V.penisslimecagemessage === 1 ? "새 정조 기생충이 성기 주위에 생겨난다." : "정조 기생충이 다시 새것처럼 보인다.",
				"purple"
			);
			delete V.penisslimecagemessage;
		}

		if (V.pregnancyDailyEvent) {
			sWikifier("<<pregnancyDailyEvent>>");
			delete V.pregnancyDailyEvent;
		}

		// Check if any parasites are present before running events. If not, clear events.
		// TODO: Clear event messages in the case of "staggered" births where some parasites remain in that category. Otherwise, all events will continue to play until the daily reset, even if some parasites have already been birthed.
		if (V.daily.parasiteEvent) {
			if (V.sexStats.vagina.pregnancy.type === "parasite") {
				for (let i = 0; i < maxParasites("vagina"); i++) {
					if (V.sexStats.vagina.pregnancy.fetus[i] !== undefined) {
						T.hasVaginaParasiteForEvent = true;
						break;
					}
				}
			}
			if (V.sexStats.anus.pregnancy.type === "parasite") {
				for (let i = 0; i < maxParasites("anus"); i++) {
					if (V.sexStats.anus.pregnancy.fetus[i] !== undefined) {
						T.hasAnusParasiteForEvent = true;
						break;
					}
				}
			}
			if (!T.hasVaginaParasiteForEvent) {
				V.daily.parasiteEvent = V.daily.parasiteEvent.filter(function (event) {
					return !event?.includes("vagina");
				});
			}
			if (!T.hasAnusParasiteForEvent) {
				V.daily.parasiteEvent = V.daily.parasiteEvent.filter(function (event) {
					return !event?.includes("anus");
				});
			}
		}

		if (V.daily.parasiteEvent) {
			let minDaysLeft;
			if (V.sexStats.vagina.pregnancy.type === "parasite") {
				minDaysLeft = V.sexStats.vagina.pregnancy.fetus.reduce((prev, curr) => (prev.daysLeft < curr.daysLeft ? prev.daysLeft : curr.daysLeft), 30);
			}
			if (V.sexStats.anus.pregnancy.type === "parasite") {
				minDaysLeft = V.sexStats.anus.pregnancy.fetus.reduce(
					(prev, curr) => (prev.daysLeft < curr.daysLeft ? prev.daysLeft : curr.daysLeft),
					minDaysLeft || 30
				);
			}
			const stressMulti = Math.clamp(2 - V.sexStats.anus.pregnancy.motherStatus + V.sexStats.vagina.pregnancy.motherStatus, 0, 2);
			const arousalMulti = Math.clamp(1 + V.sexStats.anus.pregnancy.motherStatus + V.sexStats.vagina.pregnancy.motherStatus, 1, 3);
			let arousalGain = 0;
			if (V.daily.parasiteEvent.includes("anus3") && V.daily.parasiteEvent.includes("vagina3")) V.daily.parasiteEvent.delete("vagina3");

			V.daily.parasiteEvent.forEach(event => {
				switch (event) {
					case "anus0":
					case "vagina0":
						if (V.pregnancyStats.parasiteDoctorEvents >= 4) {
							sWikifier(
								`${event === "anus0" ? "배 속" : "자궁"} 안에서 ${V.pregnancyStats.namesParasitesChild ? "다 자란 아이" : "다 자란 기생충"}【이가】 느껴진다. <<ggarousal>>`
							);
						} else {
							sWikifier(
								`${event === "anus0" ? "배 속" : "자궁"} 안에서 커다란 무언가의 움직임이 느껴진다. 병원에 다시 가는 게 좋을지도 모른다. <<ggarousal>>`
							);
						}
						arousalGain += 2000;
						break;
					case "anus1":
					case "vagina1":
						if (V.pregnancyStats.parasiteDoctorEvents >= 2) {
							sWikifier(
								`${V.pregnancyStats.namesParasitesChild ? "아이들" : "기생충들"} 중 하나의 움직임이 ${event === "anus1" ? "배 속" : "자궁"} 안에서 느껴진다. <<ggarousal>>${stressMulti ? "<<gstress>>" : ""}`
							);
						} else {
							sWikifier(`${event === "anus1" ? "배 속" : "자궁"} 안에서 무언가의 움직임이 느껴진다. 병원에 가는 게 좋을지도 모른다.
							<<ggarousal>>${stressMulti ? "<<gstress>>" : ""}`);
						}
						arousalGain += (arousalMulti * 500) / (minDaysLeft + 1);
						V.stress += 300 * stressMulti;
						break;
					case "anus2":
					case "vagina2":
						sWikifier(
							`Your ${event === "anus2" ? "stomach" : "uterus"} rumbles a little. You hope the noise hasn't attracted any attention. <<garousal>>${
								stressMulti ? "<<gstress>>" : ""
							}`
						);
						arousalGain += (arousalMulti * 250) / (minDaysLeft + 1);
						V.stress += 200 * stressMulti;
						break;
					case "anus3":
					case "vagina3":
						sWikifier(`잠시 어지러운 기분이 든다.${stressMulti ? "<<gstress>>" : ""}`);
						V.stress += 100 * stressMulti;
						break;
				}
			});
			if (arousalGain) {
				sWikifier(`<<arousal ${Math.clamp(arousalGain, 0, 10000)}>>`);
				br();
			}
			delete V.daily.parasiteEvent;
		}

		fragment.append(xchangeEffectsMessages());
	}

	if (V.debug === 1) {
		console.log("List of crime event types");
		console.log("Crime event types:", Object.keys(V.crime.events));
	}
	// for (let i = 0; i < Object.keys(V.crime.events).length; i++) {
	// 	// This will intentionally trigger an error when crime events gets wiped,
	// 	// and will let me get save files closer to the source when somebody reports it again.
	// }

	// The chastity parasite wraps a penis, so it falls away once the penis is gone (identity drift, X-Change pills)
	if (V.worn.genitals.name === "chastity parasite" && !V.player.penisExist && !V.statFreeze) {
		V.worn.genitals.type.push("broken");
		wikifier("genitalsruined");
		element("span", "더는 붙들 것이 없어, 당신의 기생형 정조대가 떨어져 나간다.", "purple");
		br();
	}

	if (numberOfEarSlime() && V.earSlime.event && !V.statFreeze) {
		if (V.earSlime.event.includes("get sperm into your") && V.earSlime.event.includes("completed") && V.earSlime.eventTimer <= 2) {
			element(
				"span",
				`귀 속 ${earSlimeNoun()}【이가】 과제를 완수한 당신에게 흡족해한다. 당신 자신이 아닌 상대의 정액을 당신의 ${V.player.vaginaExist ? "보지" : "항문"}에 넣는 과제였다.`,
				"green"
			);
			sWikifier(`<<pain -4>><<stress -6>><<trauma -12>><<lpain>><<lltrauma>><<lstress>>`);
			br();
			V.earSlime.event = "";
		} else if (V.earSlime.event.includes("get your own sperm into your") && V.earSlime.event.includes("completed") && V.earSlime.eventTimer <= 2) {
			element(
				"span",
				`귀 속 ${earSlimeNoun()}【이가】 과제를 완수한 당신에게 흡족해한다. 당신 자신의 정액을 넣은 곳은 당신의 ${
					V.player.vaginaExist ? "보지" : "항문"
				}.`,
				"green"
			);
			sWikifier(`<<pain -4>><<stress -6>><<trauma -12>><<lpain>><<lltrauma>><<lstress>>`);
			if (V.earSlime.growth >= 100 && V.earSlime.focus === "pregnancy" && V.worn.genitals.name === "naked" && !earSlimeThoughts()) {
				sWikifier(`<span class="purple">새 정조 기생충이 성기 주위에 생겨난다.</span> <<genitalswear "chastity parasite">>`);
				V.worn.genitals.origin = "ear slime";
			}
			br();
			V.earSlime.event = "";
		} else if (V.earSlime.eventTimer <= 2 || (V.earSlime.noSleep && Time.dayState !== "night")) {
			if (V.earSlime.startedThreats) {
				element("span", `귀 속 ${earSlimeNoun()}【이가】 과제를 완수하지 못한 당신을 벌한다.`, "red");
				sWikifier(`<<ggpain>><<ggtrauma>><<ggstress>><<pain 16>><<stress 12>><<trauma 12>>`);
				V.earSlime.defyCooldown += 4;
			} else {
				element("span", `귀 속 ${earSlimeNoun()}【이가】 당신이 하겠다고 한 일을 끝내지 못해 언짢아한다.`, "cyan");
			}
			br();
			V.earSlime.event = "";
			V.earSlime.noSleep = false;
		}
	}

	if (V.cheatClothes) {
		const slots = ["upper", "lower", "under_upper", "under_lower", "over_upper", "over_lower", "genitals"];
		if (V.worn.face.type.includesAny("face_covering", "gag", "mask")) {
			slots.push("face");
		}
		slots.forEach(slot => {
			if (V.worn[slot].name === "naked") return;
			V.worn[slot].integrity = clothingData(slot, V.worn[slot], "integrity_max");
			cheatsUpdateSlider(`#numberslider-input-worn${slot.replace("_", "-")}integrity`, V.worn[slot].integrity);
		});
	}

	if (Array.isArray(V.timeMessages) && V.timeMessages.length) {
		/*
			Calls to <<earnFeat "x">> here and within earnHourlyFeats are intended to show feats to the user.
			Be aware that the earnFeat widget is also used in passages such as 'Forest Blood Lemon Pick' and feats earned this way should still be displayed on that very passage and not the next one.
		*/
		const errors = [];
		V.timeMessages.forEach(messageKey => {
			let display;
			switch (messageKey) {
				case "blindAdaptation":
					element("span", "눈을 가려도 소리, 냄새, 촉감으로 주변 사물의 위치를 알 수 있게 되었다. 적응력을 얻었다.", "green");
					break;
				case "feats":
					display = earnHourlyFeats();
					if (display) fragment.append(display);
					break;
				// Transformations
				case "fallenAngelFeathers":
					element("span", "날개에 새 깃털이 조금 자랐다.", "gold");
					break;
				case "fallenAngelWings":
					element("span", "부드러운 깃털의 익숙한 감촉이 희망으로 당신을 채운다.", "gold");
					break;
				case "fallenAngelDescend":
					element(
						"span",
						"검게 물든 날개가 더 깊은 검정으로 변한다. 부서진 후광이 희미해진다. 두피에서 뿔이 돋고 허리 아래에서 꼬리가 자라난다. 상실감은 복수심으로 대체된다.",
						"gold"
					);
					fragment.append(wikifier("garousal"));
					fragment.append(wikifier("specialClothesUnlock", "'set'", "'succubus'"));
					fragment.append(wikifier("earnFeat", "'Demon'"));
					break;
				case "angelUp1":
					sWikifier('<span class="gold">그 모든 일에도 불구하고, 당신은 순수한 <<pcGender>>【으로로】 남아 있다. 그 생각이 당신을 기쁘게 한다.</span>');
					break;
				case "angelUp2":
					element("span", "당신은 순수하며, 그 순수함을 지키겠다고 다짐한다.", "gold");
					break;
				case "angelUp3":
					element("span", "어깨를 짓누르던 무게가 사라지는 것 같다.", "gold");
					break;
				case "angelUp4":
					element("span", "금빛 빛줄기가 당신 위로 내려온다.", "gold");
					break;
				case "angelUp5":
					element("span", "등에서 편안한 온기가 느껴진다.", "gold");
					break;
				case "angelUp6":
					element("span", "몸이 가벼워진다. 새 날개가 얼굴을 어루만진다.", "gold");
					fragment.append(wikifier("earnFeat", "'Angel'"));
					break;
				case "angelDown0":
					element("span", "더럽혀진 기분이 든다.", "gold");
					break;
				case "angelDown1":
					element("span", "더러운 기분이 든다.", "gold");
					break;
				case "angelDown2":
					element("span", "무거운 짐이 당신을 짓누르는 것 같다.", "gold");
					break;
				case "angelDown3":
					element("span", "머리 위의 빛이 사그라진다.", "gold");
					break;
				case "angelDown4":
					element("span", "등의 편안한 온기가 사라진다.", "gold");
					break;
				case "angelDown5":
					element("span", "날개가 사라진다.", "gold");
					break;
				case "demonUp1":
					sWikifier('<span class="gold">두피가 가렵다.</span><<garousal>>');
					break;
				case "demonUp2":
					sWikifier('<span class="gold">두피에서 뿔이 돋아난다.</span><<garousal>>');
					break;
				case "demonUp3":
					sWikifier('<span class="gold"><<bottom>>【이가】 가렵다.</span><<garousal>>');
					break;
				case "demonUp4":
					sWikifier('<span class="gold">허리 아래에서 꼬리가 돋아난다.</span><<garousal>>');
					break;
				case "demonUp5":
					sWikifier('<span class="gold">등에서 타는 듯한 감각이 느껴진다.</span><<garousal>>');
					break;
				case "demonUp6":
					sWikifier(
						'<span class="gold">몸이 가벼워진다. 새 날개가 얼굴을 어루만진다.</span><<garousal>><<earnFeat "Demon">><<specialClothesUnlock "set" "succubus">>'
					);
					break;
				case "demonDown0":
					element("span", "보이지 않는 빛이 당신의 불순함을 태워 없애는 듯하다.", "gold");
					if (V.demonFeat) {
						fragment.append(wikifier("earnFeat", "'The Path to Redemption'"));
						delete V.demonFeat;
					}
					break;
				case "demonDown1":
					element("span", "뿔이 사라진다.", "gold");
					break;
				case "demonDown2":
					sWikifier('<span class="gold"><<bottom>>의 가려움이 멎는다.</span>');
					break;
				case "demonDown3":
					element("span", "꼬리가 사라진다.", "gold");
					break;
				case "demonDown4":
					element("span", "등의 타는 듯한 감각이 멎는다.", "gold");
					break;
				case "demonDown5":
					element("span", "날개가 사라진다.", "gold");
					break;
				case "wolfUp1":
					element("span", "이상한 치통이 느껴진다.", "gold");
					break;
				case "wolfUp2":
					element("span", "입안이 달라진 것 같다. 입안을 더듬던 혀가 새 송곳니에 닿자 얼굴을 찡그린다.", "gold");
					break;
				case "wolfUp3":
					element("span", `두피${V.settings.pubicHairEnabled === true ? "와 음부가" : "가"} 가렵다.`, "gold");
					break;
				case "wolfUp4":
					element("span", "머리 위에 무언가가 느껴진다. 손을 올려 잡아당기자 아프다. 새 늑대 귀가 생겼다.", "gold");
					if (V.settings.pubicHairEnabled === true) element("span", "음부에도 길고 복슬복슬한 털이 자란 것을 알아차린다.");
					break;
				case "wolfUp5":
					element("span", "허리 아래가 가렵다.", "gold");
					break;
				case "wolfUp6":
					element("span", "엉덩이가 평소보다 묵직하다. 뒤로 손을 뻗자 새 늑대 꼬리가 만져진다.", "gold");
					fragment.append(wikifier("earnFeat", "'Wolf'"));
					break;
				case "wolfDown0":
					element("span", "치통이 멎었다.", "gold");
					break;
				case "wolfDown1":
					element("span", "송곳니가 평범한 이빨로 돌아왔다.", "gold");
					break;
				case "wolfDown2":
					element("span", `두피${V.settings.pubicHairEnabled === true ? "와 음부가" : "가"} 더는 가렵지 않다.`, "gold");
					break;
				case "wolfDown3":
					element("span", `늑대 귀${V.settings.pubicHairEnabled === true ? "와 여분의 체모" : ""}가 사라졌다.`, "gold");
					break;
				case "wolfDown4":
					element("span", "허리 아래의 가려움이 멎었다.", "gold");
					break;
				case "wolfDown5":
					element("span", "균형감각이 달라진 것 같다. 늑대 꼬리가 사라졌다.", "gold");
					break;
				case "catUp1":
					element("span", "이상한 치통이 느껴진다. 딱정벌레 하나가 기어 지나간다. 달려들고 싶은 충동을 참는다.", "gold");
					break;
				case "catUp2":
					element("span", "입안이 달라진 것 같다. 입안을 더듬던 혀가 새 송곳니에 닿자 얼굴을 찡그린다.", "gold");
					break;
				case "catUp3":
					element("span", "두피가 가렵다.", "gold");
					break;
				case "catUp4":
					element("span", "두피가 꿈틀거린다. 손을 올리자 새 고양이 귀 한 쌍이 만져진다.", "gold");
					break;
				case "catUp5":
					element("span", "허리 아래가 가렵다.", "gold");
					break;
				case "catUp6":
					element("span", "엉덩이가 묵직하면서도 완벽히 균형 잡힌 느낌이다. 뒤로 손을 뻗자 새 고양이 꼬리가 만져진다.", "gold");
					fragment.append(wikifier("earnFeat", "'Neko'"));
					break;
				case "catUp7":
					element("span", "눈이 가렵다.", "gold");
					break;
				case "catUp8":
					element("span", "동공 주변이 타는 듯해 눈물이 난다.", "gold");
					break;
				case "catUp9":
					element("span", "무슨 알레르기 때문인지 눈이 화끈거린다. 간신히 눈을 뜨고 있을 수 있다.", "gold");
					break;
				case "catUp10":
					element(
						"span",
						"눈의 화끈거림이 사라졌다. 이른 아침의 어둠 속에서도 주변 풍경의 세세한 부분까지 알아볼 수 있다.",
						"gold"
					);
					break;
				case "catDown0":
					element("span", "치통이 멎었다.", "gold");
					break;
				case "catDown1":
					element("span", "송곳니가 평범한 이빨로 돌아왔다.", "gold");
					break;
				case "catDown2":
					element("span", "두피가 더는 가렵지 않다.", "gold");
					break;
				case "catDown3":
					element("span", "고양이 귀가 사라졌다.", "gold");
					break;
				case "catDown4":
					element("span", "허리 아래의 가려움이 멎는다.", "gold");
					break;
				case "catDown5":
					element("span", "고양이 꼬리가 사라진다.", "gold");
					break;
				case "catDown6":
					element("span", "눈이 더는 가렵지 않다. 알레르기였나 보다.", "gold");
					break;
				case "catDown7":
					element("span", "눈이 주변의 세부를 덜 포착한다.", "gold");
					break;
				case "catDown9":
					element("span", "주변이 전보다 어둡게 보인다.", "gold");
					break;
				case "cowUp1":
					element("span", "풀을 우물거리고 싶은 이상한 충동이 든다.", "gold");
					break;
				case "cowUp2":
					element("span", "두피가 가렵다. 손을 올려 보니 작은 뿔 한 쌍이 돋아났다.", "gold");
					break;
				case "cowUp3":
					element("span", "귀가 따끔거린다.", "gold");
					break;
				case "cowUp4":
					element("span", "귀가 가렵다. 긁으려고 손을 올리자 생각보다 훨씬 커져 있다. 소 귀 한 쌍이 자라났다.", "gold");
					break;
				case "cowUp5":
					element("span", "허리 아래가 따끔거린다.", "gold");
					break;
				case "cowUp6":
					element("span", "엉덩이가 평소보다 무겁다. 뒤로 손을 뻗자 새로 생긴 소 꼬리가 만져진다. 음메 하고 울고 싶은 충동을 참는다.", "gold");
					fragment.append(wikifier("earnFeat", "'Cattle'"));
					break;
				case "cowDown0":
					element("span", "풀이 더는 그렇게 맛있어 보이지 않는다.", "gold");
					break;
				case "cowDown1":
					element("span", "작은 뿔이 사라졌다.", "gold");
					break;
				case "cowDown2":
					element("span", "귀가 더는 따끔거리지 않는다.", "gold");
					break;
				case "cowDown3":
					element("span", "소 귀가 사라졌다.", "gold");
					break;
				case "cowDown4":
					element("span", "허리 아래의 따끔거림이 멎었다.", "gold");
					break;
				case "cowDown5":
					element("span", "균형감각이 달라진 것 같다. 소 꼬리가 사라졌다.", "gold");
					break;
				case "waterdragonUp1":
					element("span", "물속에서 헤엄치고 싶은 강렬한 욕구가 느껴진다.", "gold");
					break;
				case "waterdragonUp2":
					element(
						"span",
						"입안이 달라진 것 같다. 길게 늘어난 갈라진 새 혀로 입안을 더듬자, 새로 돋은 송곳니에 닿아 얼굴이 찡그려진다.",
						"gold"
					);
					break;
				case "waterdragonUp3":
					element("span", "머리가 무겁다. 손을 올려 보니 뿔 한 쌍이 돋아나 있다.", "gold");
					break;
				case "waterdragonUp4":
					element("span", "귀가 가렵다. 손을 올려 보니 생각보다 훨씬 커져 있다. 용 귀 한 쌍이 자라났다.", "gold");
					break;
				case "waterdragonUp5":
					element("span", "허리 아래가 따끔거린다.", "gold");
					break;
				case "waterdragonUp6":
					element("span", "엉덩이가 평소보다 무겁다. 뒤로 손을 뻗자 새로 생긴 비늘 달린 꼬리가 만져진다. 힘이 넘친다.", "gold");
					break;
				case "waterdragonUp7":
					element("span", "피부가 달라진 느낌이다. 손을 내려다보니 쪽빛으로 물들어 있다. 깊은 곳이 당신을 부르는 것이 느껴진다.", "gold");
					fragment.append(wikifier("earnFeat", "'Lost Legacy'"));
					break;
				case "waterdragonDown0":
					element("span", "더는 헤엄치고 싶다는 생각이 들지 않는다.", "gold");
					break;
				case "waterdragonDown1":
					element("span", "송곳니가 평범한 이빨로 돌아오고, 혀도 원래대로 돌아왔다.", "gold");
					break;
				case "waterdragonDown2":
					element("span", "뿔이 사라졌다.", "gold");
					break;
				case "waterdragonDown3":
					element("span", "용 귀가 사라졌다.", "gold");
					break;
				case "waterdragonDown4":
					element("span", "허리 아래의 따끔거림이 멎었다.", "gold");
					break;
				case "waterdragonDown5":
					element("span", "균형감각이 달라진 것 같다. 용 꼬리가 사라졌다.", "gold");
					break;
				case "waterdragonDown6":
					element("span", "몸이 달라진 느낌이다. 손을 내려다보니 원래대로 돌아와 있다.", "gold");
					break;
				case "bearUp1":
					element("span", "이상한 치통이 느껴지고, 꿀이 이상하게 당긴다.", "gold");
					break;
				case "bearUp2":
					element("span", "입안이 달라진 느낌이다. 혀로 더듬어 보다가 새로 돋은 송곳니에 눌려 움찔한다.", "gold");
					break;
				case "bearUp3":
					element("span", "두피와 목이 가렵다.", "gold");
					break;
				case "bearUp4":
					element("span", "두피가 움찔거린다. 손을 올리자 새로 생긴 곰 귀 한 쌍과 목을 덮은 털이 만져진다.", "gold");
					break;
				case "bearUp5":
					element("span", "허리 아래가 따끔거린다.", "gold");
					break;
				case "bearUp6":
					element("span", "엉덩이가 평소보다 푹신하다. 뒤로 손을 뻗자 새로 생긴 곰 꼬리가 만져진다. 으르렁거리고 싶은 충동을 참는다.", "gold");
					fragment.append(wikifier("earnFeat", "'Bear'"));
					break;

				case "bearDown0":
					element("span", "치통이 멎었다.", "gold");
					break;
				case "bearDown1":
					element("span", "송곳니가 평범한 이빨로 돌아왔다.", "gold");
					break;
				case "bearDown2":
					element("span", "두피와 목이 더는 가렵지 않다.", "gold");
					break;
				case "bearDown3":
					element("span", "곰 귀가 사라졌다. 목을 덮던 털도 더는 보이지 않는다.", "gold");
					break;
				case "bearDown4":
					element("span", "허리 아래의 따끔거림이 멎었다.", "gold");
					break;
				case "bearDown5":
					element("span", "균형감각이 달라진 것 같다. 곰 꼬리가 사라졌다.", "gold");
					break;
				case "harpyUp1":
					element("span", "시야가 더 선명하게 느껴진다.", "gold");
					break;
				case "harpyUp2":
					element("span", "눈이 이상하게 느껴진다. 시력이 좋아졌다.", "gold");
					break;
				case "harpyUp3":
					element(
						"span",
						`허리 아래와 목이 가렵다. ${
							V.loveInterest.primary !== "None"
								? `생각은 ${
										["Black Wolf", "Great Hawk"].includes(V.loveInterest.primary) ? `그 ${window.KR.gatPersonNameDictKR(V.loveInterest.primary)},` : `${window.KR.gatPersonNameDictKR(V.loveInterest.primary)},`
								  }에게로 향하고, 그와 함께 있고 싶은 원초적이고 거의 동물적인 충동이 든다.`
								: "함께할 진정한 짝을 갑자기 갈망한다."
						}`,
						"gold"
					);
					break;
				case "harpyUp4":
					element("span", "엉덩이가 가벼워진 것 같다. 뒤로 손을 뻗자 깃털 달린 꼬리가 잡힌다. 목을 작은 깃털들이 덮고 있다.", "gold");
					break;
				case "harpyUp5":
					element("span", `등${V.settings.pubicHairEnabled === true ? "과 음부가" : "이"} 가렵다.`, "gold");
					break;
				case "harpyUp6":
					element(
						"span",
						`깃털처럼 몸이 가볍다. 날개가 얼굴을 어루만진다.${
							V.settings.pubicHairEnabled === true ? " 음부에 짧고 깃털 같은 털이 자란 것도 알아차린다." : ""
						}`,
						"gold"
					);
					fragment.append(wikifier("earnFeat", "'Harpy'"));
					break;
				case "harpyDown0":
					element("span", "시야가 정상으로 돌아왔다.", "gold");
					break;
				case "harpyDown1":
					element("span", "시야가 더는 그렇게 선명하지 않다.", "gold");
					break;
				case "harpyDown2":
					element("span", "허리 아래와 목의 가려움이 모두 멎고, 더는 그토록 열렬히 짝을 갈망하지 않는다.", "gold");
					break;
				case "harpyDown3":
					element("span", "목의 깃털과 함께 깃털 달린 꼬리가 사라졌다.", "gold");
					break;
				case "harpyDown4":
					element("span", `몸이 더 무겁게 느껴진다${V.settings.pubicHairEnabled === true ? ", 그리고 음부가 더는 가렵지 않다" : ""}.`, "gold");
					break;
				case "harpyDown5":
					element(
						"span",
						`몸이 더 무겁게 느껴진다. 깃털 달린 날개${V.settings.pubicHairEnabled === true ? "와 깃털 같은 음모" : ""}가 사라졌다.`,
						"gold"
					);
					break;
				case "foxUp1":
					element("span", "이상한 치통이 느껴지고, 눈은 조금 더 예리해진 것 같다. 무언가를 훔치고 싶은 충동이 든다.", "gold");
					break;
				case "foxUp2":
					element("span", "입안과 눈이 달라진 느낌이다. 혀로 더듬어 보다가 새로 돋은 송곳니에 눌려 깨갱 소리를 낸다.", "gold");
					break;
				case "foxUp3":
					element(
						"span",
						`두피가 가렵다. ${
							V.loveInterest.primary !== "None"
								? `생각은 ${
										["Black Wolf", "Great Hawk"].includes(V.loveInterest.primary) ? `그 ${window.KR.gatPersonNameDictKR(V.loveInterest.primary)},` : `${window.KR.gatPersonNameDictKR(V.loveInterest.primary)},`
								  }에게로 향하고, 그와 함께 있고 싶은 원초적이고 거의 동물적인 충동이 든다.`
								: "함께할 진정한 짝을 갑자기 갈망한다."
						}`,
						"gold"
					);
					break;
				case "foxUp4":
					element("span", "머리 위에 무언가가 느껴진다. 손을 올려 새 여우 귀 한 쌍을 만지자, 귀가 반응하듯 움찔거린다.", "gold");
					break;
				case "foxUp5":
					element(
						"span",
						"허리 아래가 가렵다. 누군가에게 긁어 달라고 하고 싶은 충동이 든다. 눈가에 이상한 변색이 생긴 것도 알아차린다.",
						"gold"
					);
					break;
				case "foxUp6":
					element("span", "엉덩이가 평소보다 무겁다. 살짝 흔들어 보니 새로 생긴 여우 꼬리가 느껴진다. 만지면 몹시 포근하다.", "gold");
					fragment.append(wikifier("specialClothesUnlock", "'set'", "'shrine'"));
					fragment.append(wikifier("earnFeat", "'Fox'"));
					break;
				case "foxDown0":
					element("span", "치통이 멎었다.", "gold");
					break;
				case "foxDown1":
					element("span", "송곳니가 평범한 이빨로 돌아오고, 시야가 둔해진 것 같다.", "gold");
					break;
				case "foxDown2":
					element("span", "두피가 더는 가렵지 않고, 더는 그토록 열렬히 짝을 갈망하지 않는다.", "gold");
					break;
				case "foxDown3":
					element("span", "여우 귀가 사라졌다.", "gold");
					break;
				case "foxDown4":
					element("span", "허리 아래의 가려움이 멎고, 눈가의 변색도 사라졌다.", "gold");
					break;
				case "foxDown5":
					element("span", "균형감각이 달라진 것 같다. 여우 꼬리가 사라졌다.", "gold");
					break;
				case "bunnyUp1":
					element("span", "다리가 아프기 시작한다.", "gold");
					break;
				case "bunnyUp2":
					element("span", "다리의 통증이 사라지고 몸이 더 날렵해진 느낌이다.", "gold");
					break;
				case "bunnyUp3":
					element("span", "두피가 가렵기 시작한다.", "gold");
					break;
				case "bunnyUp4":
					element("span", "머리를 긁고 싶은 충동이 들어 긁다 보니 토끼 귀 한 쌍이 만져진다. 귀를 살짝 잡아당겨 본다.", "gold");
					break;
				case "bunnyUp5":
					element("span", "허리 아래가 가렵기 시작한다. 티 나지 않게 긁기가 쉽지 않다.", "gold");
					break;
				case "bunnyUp6":
					element(
						"span",
						"허리 아래에 혹 같은 것이 느껴져 확인하려 손을 뻗자 보드라운 토끼 꼬리가 만져진다. 계속 쓰다듬으며 그 감촉을 즐긴다.",
						"gold"
					);
					fragment.append(wikifier("earnFeat", "'Bunny'"));
					break;

				case "bunnyDown0":
					element("span", "느껴지던 통증이 사라졌다.", "gold");
					break;
				case "bunnyDown1":
					element("span", "갑자기 걷는 것이 무겁게 느껴진다.", "gold");
					break;
				case "bunnyDown2":
					element("span", "두피가 더는 가렵지 않다.", "gold");
					break;
				case "bunnyDown3":
					element("span", "토끼 귀가 사라졌다.", "gold");
					break;
				case "bunnyDown4":
					element("span", "허리 아래가 더는 가렵지 않다.", "gold");
					break;
				case "bunnyDown5":
					element("span", "토끼 꼬리가 사라졌다.", "gold");
					break;
				// Clothes
				case "bimboMessage1":
					element(
						"span",
						`어딘가 달라진 것 같지만, 무엇이 어떻게 달라졌는지는 알 수 없다.${
							V.worn.upper.type.includesAny("bimbo", "pimp") ||
							V.worn.lower.type.includesAny("bimbo", "pimp") ||
							V.worn.feet.type.includes("bimbo") ||
							V.worn.head.type.includes("pimp")
								? " 옷이 몸에 달라붙는 것 같다."
								: ""
						}`,
						"lewd"
					);
					break;
				case "pimpMessage1":
					element(
						"span",
						`어딘가 달라진 것 같지만, 무엇이 어떻게 달라졌는지는 알 수 없다.${
							V.worn.upper.type.includes("pimp") || V.worn.lower.type.includes("pimp") || V.worn.head.type.includes("pimp")
								? " 옷을 만지면 따뜻하게 느껴진다."
								: ""
						}`,
						"lewd"
					);
					break;
				case "bimboMessage2":
					element(
						"span",
						`또다시 달라진 느낌이 든다. 이번에는 좀 더 확실하다. 무언가가 당신을 더 여성스럽게 보이게 만들고 있다. 당신은 ${
							V.worn.upper.type.includes("bimbo") || V.worn.lower.type.includes("bimbo") || V.worn.feet.type.includes("bimbo")
								? "지금 입고 있는 옷이 마음에 든다."
								: "아까 입고 있던 옷이 마음에 든다."
						}`,
						"lewd"
					);
					break;
				case "pimpMessage2":
					element(
						"span",
						`또다시 달라진 느낌이 든다. 이번에는 좀 더 확실하다. 무언가가 당신을 더 남성스럽게 보이게 만들고 있다. 당신은 ${
							V.worn.upper.type.includes("pimp") || V.worn.lower.type.includes("pimp") || V.worn.head.type.includes("pimp")
								? "지금 입고 있는 옷이 마음에 든다."
								: "아까 입고 있던 옷이 마음에 든다."
						}`,
						"lewd"
					);
					break;
				case "bimboMessage3":
					element(
						"span",
						"내면에서 이상한 갈망이 자라나고, 깊은 욕망이 차오른다. 곧 견딜 수 없는 욕정이 당신을 사로잡는다.",
						"lewd"
					);
					break;
				// Feats
				case "heroicVictory":
					fragment.append(wikifier("earnFeat", "'Heroic Victory'"));
					break;
				case "dawnToDusk":
					fragment.append(wikifier("earnFeat", "'Dawn to Dusk'"));
					break;
				case "adultShopContribution":
					if (V.adultshopcontribution) fragment.append(wikifier("earnFeat", "'Opened Pandoras Box'"));
					if (V.adultshopcontribution >= 12) fragment.append(wikifier("earnFeat", "'Opened Pandoras Cocks'"));
					break;
				case "valentinesTomorrow":
					sWikifier(
						`<span class="gold">내일은 발렌타인 데이다. 특별한 사람과 소중한 시간을 보내는 일이 기대된다.</span> <<stress -6>><<lstress>><<trauma -6>><<ltrauma>>`
					);
					br();
					break;
				case "valentinesToday":
					sWikifier(
						`<span class="gold">오늘은 발렌타인 데이다. 오늘 특별한 사람과 소중한 시간을 보내는 일이 기대된다. 그렇게 하면 평소보다 더 큰 보상이 있을 것 같은 예감이 든다.</span> <<stress -6>><<lstress>><<trauma -6>><<ltrauma>>`
					);
					br();
					break;
				case "autismHyperfixation": {
					/* The trait can be switched off between the message being queued and this running. */
					if (!playerHasAutismSpectrum()) break;
					const state = ensureAutismSpectrumState();
					if (state.phaseChanged) {
						const capacity = autismSpectrumPhase();
						const capacityText = {
							settled: "머리가 다시 맑아졌다. 일들이 마땅한 만큼의 힘만 든다.",
							strained: "아직 버티고는 있지만, 모든 것이 점점 더 많은 힘을 요구하기 시작한다.",
							burnout: "이 상태는 한동안 쌓여 왔다. 평범한 일들이 힘든 노동이 되었다. 오래 쉬어야 한다.",
						};
						element("span", capacityText[capacity] || capacityText.strained, capacity === "settled" ? "green" : capacity === "burnout" ? "red" : "pink");
						br();
					}
					if (state.focusChanged) {
						const focusDays = autismHyperfixationDaysRemaining();
						const focusName = autismHyperfixationName();
						const arrival = {
							academic: `${focusName}【을를】 처음 찾아본 것은 그것에 대해 궁금한 점이 있었기 때문이다. 그 뒤로도 계속 그것을 생각하며, 기회가 있을 때마다 더 많은 정보를 찾는다. ${focusName.toUpperFirst()}【은는】 내려놓기 어려운 것이 되었다.`,
							physical: `오늘 ${focusName}【을를】 여러 번 떠올리고 있는 자신을 발견했다. 연습하거나 실력을 키우려는 게 아닐 때도 또 하고 싶어진다.`,
							practical: `${focusName.toUpperFirst()}【은는】 하루 중 가장 기대되는 시간 중 하나가 되었다. 한 단계 한 단계에 집중하고 그 결과를 보는 것이 즐겁다.`,
							combat: `같은 동작을 계속 떠올리며 어떻게 더 잘할 수 있을지 생각한다. ${focusName}【을를】 연습할 때마다 조금씩 바꿔서 다시 해 보고 싶어진다.`,
							inner: `자신이 어떻게 반응하는지, 무엇을 원하는지, 언제 물러서지 말아야 하는지를 더 자주 생각하게 되었다. 스스로를 더 잘 이해하고 싶어서 그 생각을 자꾸 되짚는다.`,
						};
						element("span", arrival[autismHyperfixationCategory()] || arrival.academic, "gold");
						br();
						element("span", `약 ${focusDays}일${focusDays === 1 ? "" : ""} 동안 가장 큰 관심사로 남을 수 있다.`, "gold");
						br();
					}
					delete state.phaseChanged;
					delete state.focusChanged;
					break;
				}
				case "autismBurnout": {
					if (!playerHasAutismSpectrum()) break;
					const bState = ensureAutismSpectrumState();
					if (bState.burnoutEntered && autismSpectrumPhase() === "burnout") {
						const where = V.location === "school" ? "school" : autismPrivacyTier() === "alone" ? "private" : "public";
						const lines = {
							school: [
								"누군가 간단한 질문을 한다. 답은 알고 있지만 말을 엮는 데 평소보다 오래 걸린다. 대답할 때쯤 상대는 걱정스러운 얼굴로 당신을 지켜보고 있다.",
								"누군가의 말에 집중하려 하지만 주변의 온갖 소리가 계속 주의를 끈다. 목소리, 의자 끄는 소리, 불빛, 복도의 사람들 때문에 듣기가 더 어렵다.",
								"학교에서 늘 하던 대로 말하고 행동하려 하지만 따라가는 데 버거울 만큼 힘이 든다. 멈추는 일이 잦아지고 간단한 대답에도 시간이 걸린다.",
							],
							public: [
								"어느 길로 갈지 정하려고 멈춰 선다. 평소에는 힘들이지 않고 하던 선택인데, 당신이 하나하나 따져 보는 동안 사람들이 옆으로 비켜 지나간다.",
								"가야 할 곳에 집중하려 하지만 온갖 소리가 계속 주의를 빼앗는다. 차 소리, 근처의 대화, 문 열리는 소리, 자신의 발소리까지 무시하기 어렵다.",
								"움직임이 느려진다. 걸음마다 힘이 들고, 가려는 곳이 몇 분 전보다 더 멀게 느껴진다.",
							],
							private: [
								"무언가를 하려고 자리에 앉지만 시작하지 못한다. 무엇을 해야 하고 어디서 시작할지도 알지만 그대로 앉아 있을 뿐이다.",
								"같은 작은 동작을 되풀이하고 있는 자신을 알아차린다. 다음에 무엇을 할지 정하는 것보다 쉬워서 계속하게 된다.",
								"생각을 말로 옮기려 하지만 간단한 문장조차 만드는 데 시간이 걸린다. 혼자라서 대답을 기다리는 사람은 없다.",
							],
						};
						element("span", (lines[where] || lines.public).random(), "red");
						br();
						element("span", "번아웃에 이르렀다.", "red");
						br();
					}
					delete bState.burnoutEntered;
					break;
				}
				case "autismUnmasked": {
					if (!playerHasAutismSpectrum()) break;
					const uLine = autismUnmaskedLine();
					if (uLine) {
						element("span", uLine, "teal");
						br();
					}
					break;
				}
				case "autismMasking": {
					if (!playerHasAutismSpectrum()) break;
					const mLine = autismMaskingLine();
					if (mLine) {
						element("span", mLine, "pink");
						br();
					}
					break;
				}
				case "autismAmbient": {
					if (!playerHasAutismSpectrum()) break;
					const ambient = autismAmbientLine();
					if (ambient) {
						element("span", ambient, autismSpectrumPhase() === "burnout" ? "purple" : "pink");
						br();
					}
					break;
				}
				case "autismFocus": {
					/* The trait can be switched off between the message being queued and this running. */
					if (!playerHasAutismSpectrum()) break;
					const state = ensureAutismSpectrumState();
					if (Number.isFinite(state.fatigueNotice)) {
						const lines = [
							"충분히 자리 잡을 시간 없이 일을 바꾸는 것은 거슬린다. 제자리를 다시 찾는 데 잠시 걸린다.",
							"제대로 쉬지 못한 채 몇 시간째 요구를 처리하고 있다. 모든 것을 정돈해 두기가 점점 힘들어진다.",
							"요구가 몇 시간째 쌓이고 있다. 새 지시를 정리할 때마다 더 많은 힘이 든다.",
							"충분히 회복하지 못한 채 너무 많이 밀어붙였다. 익숙한 단계조차 어려워지고 있다.",
						];
						element("span", lines[Math.clamp(state.fatigueNotice, 0, lines.length - 1)], state.fatigueNotice >= 2 ? "red" : "pink");
						br();
					}
					if (state.reliefNotice) {
						const reliefFocus = state.reliefNoticeFocus || autismHyperfixationName();
						element("span", `${reliefFocus}에 시간을 쏟는다. 한결 수월해지고 마음이 차분해진다.`, "green");
						br();
					}
					if (state.coldStartNotice) {
						element("span", "무엇을 해야 하는지 알아도 일을 시작하는 것이 어렵게 느껴진다. 일단 시작하면 수월해진다.", "pink");
						br();
					}
					if (state.meltdownNotice) {
						element(
							"span",
							"한꺼번에 너무 많다. 소리, 지시, 감각이 서로 맞물리지 않는다. 회복하려면 요구가 멈춰야 한다.",
							"red"
						);
						br();
					}
					if (state.meltdownEndNotice) {
						element("span", "다시 또렷하게 생각할 수 있다. 가장 힘든 고비는 지나갔다.", "green");
						br();
					}
					delete state.coldStartNotice;
					delete state.fatigueNotice;
					delete state.reliefNoticeFocus;
					delete state.reliefNotice;
					delete state.meltdownNotice;
					delete state.meltdownEndNotice;
					break;
				}
				default:
					// Report error
					errors.pushUnique(messageKey);
					break;
			}
		});
		if (errors.length) Errors.report("완전히 구현되지 않았거나 잘못된 시간 메시지 키가 발견되었습니다", errors);
		V.timeMessages = [];
	}

	sWikifier("<<integritycheck>><<exposure>>");

	if (V.orgasmCum > 0) {
		let arousalDrop = 0;
		if (V.player.sex === "m") {
			arousalDrop = -2000 - V.orgasmcount * 1000;
		} else {
			arousalDrop = -1000 - V.orgasmcount * 500;
		}

		// Chastity keeps the pressure from ever actually venting, so climax barely takes the edge off.
		if (playerChastity()) arousalDrop *= 0.3;

		if (V.drugged > 0) {
			fragment.append(wikifier("pleasure", arousalDrop));
		} else {
			fragment.append(wikifier("pleasure", arousalDrop * 2));
		}

		if (V.orgasmCum === 1) {
			V.refractoryPeriod = V.player.penisExist ? 5 : 0;
		}

		sWikifier(`<span class="light-pink">Your body continues to convulse as it releases the tension from your orgasm.</span> <<llarousal>>`);
		br();
		sWikifier(`<span class="pink">Your body is extra sensitive due to the current orgasm.</span>`);
	}

	V.orgasmdown -= 1;
	V.orgasmCum -= 1;
	V.refractoryPeriod -= 1;
	if (V.orgasmdown < 0) V.femaleclimax = 0;

	if (V.exposed >= 1 && V.exposedcheck === 1) {
		V.exposedcheck = 0;
		sWikifier("자신의 <<nudity>>【이가】 신경 쓰인다.");
		br();
	}

	if (V.timer >= 1) V.timer--;
	// V.turnCount++;

	sWikifier("<<bindings>>");

	if (V.worn.genitals.cursed === 1 && V.worn.genitals.integrity <= 0) V.worn.genitals.type.push("broken");

	sWikifier("<<exposure>>");

	/* Worth flagging in combat, where not being able to see costs you performance (blindSexMultiplier). */
	if (V.combat && pcIsBlinded()) {
		sWikifier(`<span class="purple">You can't see through your ${V.worn.face.name}.</span>`);
		br();
	}

	if (V.combat) sWikifier("<<pass 10 seconds>>");

	if (fragment.children.length) br();

	V.menu = 0;

	if (V.combat === 0 && V.ironmanmode === true) IronMan.scheduledSaves();

	sWikifier("<<blackmail-effects>>");
	sWikifier("<<portalPantiesDisplay>>");

	if (V.trauma >= V.traumamax * 0.9) V.traumatized = true;

	return fragment;
}

Macro.add("effects", {
	handler() {
		try {
			const fragment = effects();
			this.output.append(fragment);
		} catch (e) {
			console.error("<<effects>> crashed:", e);
			console.error(e?.stack || "(no stack)");
			// Keeps the game playable while you debug:
			this.output.append(document.createDocumentFragment());
			return;
		}

		$(document)
			.off(":passageend.effects")
			.on(":passageend.effects", function () {
				try {
					const setStyle = (sel, styles) => {
						const elements = document.querySelectorAll(sel);
						for (const el of elements) Object.assign(el.style, styles);
					};
					const imagesEnabled = V?.options?.images === 1;
					const bigCanvas = V?.options?.bigCanvas === true;
					const nonMobile = !Browser.isMobile.any() && !/joiplay|cyou\.joiplay\.joiplay|wv/i.test(navigator.userAgent);

					if (!V.passage.includes("Waiting Room")) {
						if (imagesEnabled) {
							if (bigCanvas) {
								setStyle("body.has-images #story-caption #storyCaptionDiv", {
									top: "269px",
									height: "calc(100% - 97px - 1.32em)",
									width: "392px",
								});
								setStyle("body.has-images #storyCaptionContent", { width: "392px" });
								setStyle("#canvasSkybox, #daystate, #weather, #oldlocation, #story-caption > [class^='skybox']", {
									transform: "scale(1.4)",
									transformOrigin: "top left",
								});
								setStyle("#weather", { top: "90px" });
								setStyle("#img", { height: "269px", width: "302px", left: "90px" });
								setStyle("#img > *", { left: "-45px" });
								setStyle("#imgInv", { top: "130px", transform: "scale(1.4)", transformOrigin: "top right" });
								setStyle("#characterTemperature", { top: "223px", left: "92px", transform: "scale(1.4)", transformOrigin: "top left" });
								setStyle("#characterTemperatureTooltip", { top: "220px", left: "94px", width: "22px", height: "41px" });
								sizeSidebarDollCanvases(358);
								setStyle("#ui-bar", { width: "24.5em" });
								setStyle("#stats", { width: "392px" });
							} else {
								setStyle("body.has-images #story-caption #storyCaptionDiv", {
									top: "192px",
									height: "calc(100% - 20px - 1.32em)",
									width: "280px",
								});
								setStyle("body.has-images #storyCaptionContent", { width: "280px" });
								setStyle("#canvasSkybox, #daystate, #weather, #oldlocation, #story-caption > [class^='skybox']", {
									transform: "none",
								});
								setStyle("#weather", { top: "64px" });
								setStyle("#img", { height: "192px", width: "216px", left: "64px" });
								setStyle("#img > *", { left: "-32px" });
								setStyle("#imgInv", { top: "93px", transform: "none" });
								setStyle("#characterTemperature", { top: "159px", left: "66px", transform: "none" });
								setStyle("#characterTemperatureTooltip", { top: "157px", left: "67px", width: "16px", height: "29px" });
								sizeSidebarDollCanvases(256);
								setStyle("#ui-bar", { width: "17.5em" });
								setStyle("#stats", { width: "280px" });
							}
						}

						if (nonMobile) {
							setStyle("#story", { marginLeft: document.getElementById("ui-bar")?.classList.contains("stowed") ? "" : bigCanvas ? "27em" : "20em" });
						}
					}
				} catch (e) {
					console.error("effects :passageend handler crashed:", e);
					console.error(e?.stack || "(no stack)");
				}
			});
		if (document.getElementById("ui-bar") && !window.uiBarObserver) {
			window.uiBarObserver = new MutationObserver(mutations => {
				for (const mutation of mutations) {
					if (mutation.type === "attributes" && mutation.attributeName === "class") {
						if (document.getElementById("ui-bar").classList.contains("stowed")) {
							document.querySelector("#story").style.marginLeft = "";
							if (V.options.bigCanvas === true) {
								document.querySelector("#ui-bar").style.left = "-22.5em";
							} else {
								document.querySelector("#ui-bar").style.left = "-15.5em";
							}
						} else {
							document.querySelector("#ui-bar").style.left = "0";
							if (!Browser.isMobile.any() && !/joiplay|cyou\.joiplay\.joiplay|wv/i.test(navigator.userAgent)) {
								document.querySelector("#story").style.marginLeft = V.options.bigCanvas === true ? "27em" : "20em";
							}
						}
					}
				}
			});

			window.uiBarObserver.observe(document.getElementById("ui-bar"), { attributes: true });
		}
		Weather.Thermometer.load();
	},
});
