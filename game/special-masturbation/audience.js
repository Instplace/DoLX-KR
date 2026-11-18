// eslint-disable-next-line no-unused-vars
function masturbationAudience() {
	const br = () => document.createElement("br");
	const sWikifier = text => {
		if (T.noMasturbationOutput) return;
		fragment.append(Wikifier.wikifyEval(text));
	};
	const fragment = document.createDocumentFragment();

	if (V.masturbationAudience >= 1) {
		const npc = random(1, Math.clamp(V.masturbationAudience, 1, 6));
		const comment = masturbationAudienceLines(npc);
		const audienceMutual = V.masturbationAudienceMutualAllowed && V.audiencearousal >= 50;
		if (V.masturbationAudience > 6) {
			sWikifier(
				`<span class="lewd">군중이 당신을 지켜보고 있다.${
					audienceMutual ? " 들려오는 음란한 소리로 보아 그들 중 여럿이 자위하고 있는 게 분명하다." : ""
				}</span> `
			);
		}
		if (V.npc[npc - 1]) {
			sWikifier(
				`<span class="lewd"><<person${npc}>><<combatpersons>> 시선${V.masturbationAudience > 1 ? "과 다른 이들의 시선" : ""}이 당신에게 꽂히는 것이 느껴진다.${
					audienceMutual && V.masturbationAudience <= 6 ? ` <<He>> mirrors${V.mouth === 0 || V.mouth === "disabled" ? " " : " some of"} your actions.` : ""
				}</span>`
			);
		} else if (V.masturbationAudience === 1) {
			sWikifier(
				`<span class="lewd"><<person${npc}>><<persons>> 시선이 당신에게 꽂히는 것이 느껴진다${
					audienceMutual ? ` <<he>>【이가】 당신의 행동${V.mouth === 0 || V.mouth === "disabled" ? "" : " 일부"}를 따라 하며` : ""
				}.</span>`
			);
		} else if (V.masturbationAudience <= 6) {
			sWikifier(`<span class="lewd"><<person${npc}>>${V.masturbationAudience > 4 ? "수많은 " : ""}시선이 당신을 지켜보는 것이 느껴진다.</span>`);
		}
		fragment.append(" ");
		if (comment) {
			sWikifier(comment);
		}
	}
	if (fragment.textContent) {
		fragment.append(br());
		fragment.append(br());
	}

	return fragment;
}

function masturbationAudienceLines(npc) {
	if (!V.masturbationAudienceReactions) V.masturbationAudienceReactions = [];
	if (V.masturbationAudienceReactions.length >= 8) V.masturbationAudienceReactions.deleteAt(0);
	if (V.pleasure >= V.pleasuremax) {
		V.masturbationAudienceReactions.push("orgasm");
		V.audiencearousal += Math.clamp(2 * V.masturbationAudience, 2, 10);
		return masturbationAudienceLineText(npc, "orgasm");
	}

	if (!V.masturbationAudienceReactions.includes("mouthOral")) {
		/* Do nothing */
	} else if (["mpenisentrance", "mchastityparasiteentrance", "mvaginaentrance", "mpenis"].includes(V.mouth)) {
		V.masturbationAudienceReactions.push("mouthOral");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "mouthOral");
	}

	if (["mrest"].includesAny(V.masturbationActions.leftaction, V.masturbationActions.rightaction) && random(0, 100) >= 66) {
		V.masturbationAudienceReactions.push("rest");
		if (V.audiencearousal > 10) V.audiencearousal -= 1;
		return masturbationAudienceLineText(npc, "rest");
	}

	if (
		["mpenisentrance", "mpenisglans", "mpenisshaft"].includesAny(V.masturbationActions.leftaction, V.masturbationActions.rightaction) &&
		random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "penis").length + 1)
	) {
		V.masturbationAudienceReactions.push("penis");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "penis");
	}

	if (
		["mchastityparasiteentrance", "mchastityparasiterub", "mchastityparasitesqueeze"].includesAny(
			V.masturbationActions.leftaction,
			V.masturbationActions.rightaction
		) &&
		random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "chastitypenis").length + 1)
	) {
		V.masturbationAudienceReactions.push("chastitypenis");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "chastitypenis");
	}

	if (
		["mvaginaentrance", "mvaginafingerstarttwo", "mvagina", "mvaginaclit", "mvaginarub", "mvaginafingeraddtwo", "mvaginafingeradd", "mvaginatease"].includesAny(
			V.masturbationActions.leftaction,
			V.masturbationActions.rightaction
		) &&
		random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "vagina").length + 1)
	) {
		V.masturbationAudienceReactions.push("vagina");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "vagina");
	}

	if (
		["manusentrance"].includesAny(V.leftarm, V.rightarm) &&
		random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "anusEntrance").length + 1)
	) {
		V.masturbationAudienceReactions.push("anusEntrance");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "anusEntrance");
	}

	if (["manus"].includesAny(V.leftarm, V.rightarm) && random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "anus").length + 1)) {
		V.masturbationAudienceReactions.push("anus");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "anus");
	}

	if (["mbreast"].includes(V.mouth) && random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "mouthBreast").length + 1)) {
		V.masturbationAudienceReactions.push("mouthBreast");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "mouthBreast");
	}

	if (
		["mchest", "mbreastfondle", "mbreastpinch"].includesAny(V.masturbationActions.leftaction, V.masturbationActions.rightaction) &&
		random(0, 100) >= 20 * (V.masturbationAudienceReactions.filter(a => a === "chest").length + 1)
	) {
		V.masturbationAudienceReactions.push("chest");
		V.audiencearousal += 1;
		return masturbationAudienceLineText(npc, "chest");
	}

	if (V.masturbationAudienceReactions.includes("penisSize")) {
		/* Do nothing */
	} else if (V.exposed >= 2 && V.player.penisExist && !playerChastity("hidden")) {
		V.masturbationAudienceReactions.push("penisSize");
		V.audiencearousal += 1;
		switch (V.player.penissize) {
			case 0:
				wikifier("insecurity", '"penis_small"', 4);
				break;
			case 1:
				wikifier("insecurity", '"penis_small"', 3);
				break;
			case 2:
				wikifier("insecurity", '"penis_small"', 2);
				break;
			case 3:
				wikifier("insecurity", '"penis_small"', 1);
				break;
			case 4:
				break;
			case 5:
				wikifier("insecurity", '"penis_big"', 1);
				break;
			case 6:
				wikifier("insecurity", '"penis_big"', 1);
				break;
		}
		return masturbationAudienceLineText(npc, "penisSize" + V.player.penissize);
	}

	if (V.masturbationAudienceReactions.includes("breastSize")) {
		/* Do nothing */
	} else if (V.player.breastsize === 0) {
		V.masturbationAudienceReactions.push("breastSize");
		V.audiencearousal += 1;
		if (V.player.gender_appearance !== "m") {
			wikifier("insecurity", '"breasts_small"', 2);
		}
		return masturbationAudienceLineText(npc, "breastSizeFlat");
	} else if (V.player.breastsize <= 5) {
		V.masturbationAudienceReactions.push("breastSize");
		V.audiencearousal += 1;
		if ((V.player.gender_appearance === "m" && V.worn.upper.exposed >= 2) || V.player.gender_appearance !== "m") {
			wikifier("insecurity", '"breasts_small"', 1);
		}
		return masturbationAudienceLineText(npc, "breastSizeSmall");
	} else if (V.player.breastsize <= 7) {
		V.masturbationAudienceReactions.push("breastSize");
		V.audiencearousal += 1;
		if (V.player.gender_appearance === "m") {
			wikifier("insecurity", '"breasts_big"', 1);
		}
		return masturbationAudienceLineText(npc, "breastSizeNormal");
	} else if (V.player.breastsize <= 10) {
		V.masturbationAudienceReactions.push("breastSize");
		V.audiencearousal += 1;
		wikifier("insecurity", '"breasts_big"', 1);
		return masturbationAudienceLineText(npc, "breastSizeLarge");
	} else {
		V.masturbationAudienceReactions.push("breastSize");
		V.audiencearousal += 1;
		wikifier("insecurity", '"breasts_big"', 2);
		return masturbationAudienceLineText(npc, "breastSizeHuge");
	}

	return "";
}

function masturbationAudienceLineText(npc, lineType = "") {
	if (T.noMasturbationOutput) return "";
	const compatibleNamedNpcs = [];
	const npcSelected = V.NPCList[npc - 1];
	const namedNpc = compatibleNamedNpcs.includes(npcSelected.fullDescription) ? npcSelected.fullDescription : "";
	const resultArray = [];
	switch (lineType + namedNpc) {
		case "orgasm":
			resultArray.push(`"쌀 때 네 얼굴 진짜 귀엽다."`, `"이제 와서 멈추지 않는 게 좋을걸. 너 한 번 더 하고 싶은 거 다 알아."`);
			if (V.masturbationAudience > 1) {
				resultArray.push(`"Look at how much <<pshes stranger>> shaking. Must be a pretty intense orgasm."`);
			}
			if (V.masturbationAudience >= 3 && V.masturbationAudienceReactions >= 3) {
				resultArray.push(`"우릴 위해 싸 봐, 변태야. 네가 얼마나 음란한지 모두에게 보여 줘."`, `"모두 앞에서 싸는 게 그렇게 좋아?"`);
			}
			if (["mpenisentrance", "mpenis"].includes(V.mouth)) resultArray.push(`"네 정액 맛은 어때?"`);
			if (["mvaginaentrance"].includes(V.mouth)) resultArray.push(`"네 애액 맛은 어때?"`);
			if (V.masturbationAudienceReactions.filter(a => a === "orgasm").length > 2) {
				if (V.masturbationAudience > 1) {
					resultArray.push(`"이 걸레는 쉬지도 않고 계속 싸네!"`);
				}
				resultArray.push(`"그렇게 자주 싸면 어떤 기분이야?"`);
			}
			if (V.masturbationorgasm >= 5) {
				if (V.masturbationAudience > 1) {
					resultArray.push(`"이 걸레는 ${V.masturbationAudience >= 4 ? "모두" : "우리"} 앞에서 계속 싸대는 거야?"`);
				} else {
					resultArray.push(`"내 앞에서 싸는 게 정말 좋은가 보네."`);
				}
			}
			return resultArray.random();
		case "mouthOral":
			if (V.masturbationAudience > 1) {
				return `"씨발, 이 걸레 존나 유연하네!"`;
			} else {
				return `"씨발, 너 얼마나 유연한 거야?"`;
			}
		case "rest":
			if (V.masturbationActions.leftaction === "mrest" && V.masturbationActions.rightaction === "mrest") {
				if (V.audiencearousal <= 0 && V.exposed <= 0) {
					// Likely needs to be re-written to fit the context, should not show in the first release
					return [`괜찮아?`, `도움이 필요해?`].random();
				} else {
					return [
						`왜 멈췄어? ${V.masturbationAudience > 1 ? "우리" : "내"} 앞에서 계속 만져.`,
						`벌써 지쳤어? 도와줄까?`,
					].random();
				}
			} else {
				return [
					`남은 손으로 더 만질 생각 없어?`,
					`이미 한 손으로 만지고 있잖아. 두 손이면 더 좋을 텐데.`,
				].random();
			}
		case "penis":
			resultArray.push(`"자, 더 세게 쥐어 봐."`);
			if (V.masturbationAudience >= 4) {
				resultArray.push(
					`"Look how fast <<pshes stranger>> stroking <<pherself stranger>>."`,
					`"기분 좋아? 모두 앞에서 네 자지를 만지는 거 말이야."`,
					`"쿠퍼액이 조금 떨어지는 것 같은데."`,
					`"그래, 모두에게 네가 어떻게 자위하는지 보여 줘."`
				);
			} else {
				resultArray.push(
					`"${V.masturbationAudience > 1 ? "우리" : "내"} 앞에서 그렇게 문지르니까 재밌어?"`,
					`"기분 좋아? ${V.masturbationAudience > 1 ? "우리" : "내"} 앞에서 네 자지를 만지는 거 말이야."`,
					`"Is that precum dripping from <<pher stranger>> cock?"`
				);
			}
			return resultArray.random();
		case "chastitypenis":
			resultArray.push(`"네가 만지작거리는 그건 뭐야?"`);
			if (V.mouth === 0 || V.mouth === "disabled") {
				resultArray.push(`"그걸 쥐는 것만으로 침 흘리는 거야?"`);
			}
			if (V.masturbationAudience >= 4) {
				resultArray.push(
					`"Look how hard <<pshes stranger>> squeezing it."`,
					`"정말 기분 좋아 보이네. 진짜 걸레처럼 보여."`,
					`"그래, 모두에게 네가 어떻게 자위하는지 보여 줘."`
				);
			} else {
				resultArray.push(
					`"${V.masturbationAudience > 1 ? "우리" : "내"} 앞에서 그렇게 쥐니까 재밌어?"`,
					`"기분 좋아? ${V.masturbationAudience > 1 ? "우리" : "내"} 앞에서 그걸 만지는 거 말이야."`
				);
			}
			return resultArray.random();
		case "vagina":
			if (V.masturbationAudience >= 4) {
				resultArray.push(
					`"Look how wet <<pshe stranger>> is."`,
					`"그렇게까지 관객이 필요했어?"`,
					`"<<pHer stranger>> clit is so hard."`,
					`"그래, <<girl>>. 네가 보지로 어떻게 노는지 모두에게 보여 줘."`
				);
			} else {
				resultArray.push(
					`"네가 얼마나 젖었는지 봐."`,
					`"그렇게까지 ${V.masturbationAudience > 1 ? "우리" : "내"}가 봐 주길 바랐어?"`,
					`"네 클리 잔뜩 섰네."`,
					`"그래, <<girl>>. 네가 보지로 어떻게 노는지 ${V.masturbationAudience > 1 ? "우리" : "내게"} 보여 줘."`
				);
			}
			if (V.fingersInVagina <= 0) resultArray.push(`"자, 그냥 손가락 좀 쑤셔 넣어."`);
			if (between(V.fingersInVagina, 1, 3))
				resultArray.push(
					`"Is that all ${V.masturbationAudience > 1 ? "<<pshe stranger>>" : "the fingers you"} can fit in${
						V.masturbationAudience > 1 ? " <<phim stranger>>? Must be a virgin." : "?"
					}"`,
					`"어서 손가락 하나 더 넣어. 거기에 그보다 더 들어갈 거 다 알아."`,
					`"이리 오면 손가락보다 더한 것도 줄 수 있는데."`
				);
			if (V.fingersInVagina >= 5) {
				resultArray.push(
					`"Didn't think ${V.masturbationAudience > 1 ? "<<pshe stranger>>" : "you"}'d be able to fit ${
						V.masturbationAudience > 1 ? "<<pher stranger>>" : "a"
					} whole fist in there, but I guess I was wrong. What a size <<pking "stranger">>."`
				);
			}
			if (V.fingersInVagina >= 1) resultArray.push(`"네 보지에서 나는 음란한 소리가 다 들려, <<girl>>."`);
			return resultArray.random();
		case "anusEntrance":
			resultArray.push(
				`"I got a nice view of ${V.masturbationAudience > 1 ? "<<phim stranger>>" : "you"} touching ${
					V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"
				} ass."`,
				`"이렇게 때리고 싶은 엉덩이는 처음 봐."`,
				`"자, 손가락 좀 쑤셔 넣어."`,
				`"네 엉덩이로 어떻게 노는지 ${V.masturbationAudience > 1 ? "우리" : "내게"} 보여 줘, 걸레야."`
			);
			if (npcSelected && npcSelected.penis && npcSelected.penis !== "none") {
				resultArray.push(`"씨발, 저 엉덩이 사이에 내 자지를 비비고 싶네."`);
			}
			return resultArray.random();
		case "anus":
			return [
				`"그게 다야? 더 들어갈 수 있잖아."`,
				`"엉덩이 가지고 노는 게 그렇게 좋아? 완전 걸레네."`,
				`"${V.masturbationAudience > 1 ? "<<pShe stranger>>" : "You"} must have a lot of experience with that ass."`,
				`"손가락보다 더한 게 필요하면 내가 도와줄게."`,
				`"Holy shit, ${V.masturbationAudience > 1 ? "<<pshe stranger>>" : "you"} did manage to shove all ${
					V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"
				} fist inside. How much action has that ass seen?"`,
			].random();
		case "mouthBreast":
			resultArray.push(
				`"자기 유두나 빨고 있다니, 멍청한 걸레 같으니."`,
				`"자기 큰 가슴을 얼마나 쉽게 빨 수 있는지 과시하는 거야? 너 진짜 변태구나."`,
				`"나도 그 젖 좀 빨아도 돼?"`
			);
			if (V.lactating && V.settings.breastFeedingEnabled === true) {
				resultArray.push(`"Look at how hard <<pshes stranger>> trying to milk <<pherself stranger>>."`);
			}
			return resultArray.random();
		case "chest":
			resultArray.push(
				`"그 젖을 쥐어짜 봐, 걸레야."`,
				`"Look at how hard ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} nipples are."`,
				`"모두 보라고 가슴을 과시하는 거야? 너 진짜 변태구나."`,
				`"나도 그 젖 좀 문질러도 돼?"`
			);
			if (npcSelected && npcSelected.penis && npcSelected.penis !== "none") {
				resultArray.push(`"씨발, 저 젖 사이에 내 자지를 처박고 싶네."`);
			}
			return resultArray.random();
		case "penisSize0": // empty case on purpose
		case "penisSize1":
			return [
				`"참 귀여운 클리네!"`,
				`"저건 손가락 하나랑 엄지 말고는 제대로 만지기도 힘들겠는데."`,
				`"이렇게 불쌍한 자지는 처음 봐."`,
			]
				.random()
				.concat(`<<ginsecurity "penis_small">>`);
		case "penisSize2":
			return [
				`"${V.masturbationAudience > 1 ? "<<pShes stranger>>" : "You're"} so tiny!"`,
				`"이렇게 작다니 믿기지가 않네!"`,
				`"이렇게 불쌍한 자지는 처음 봐."`,
			]
				.random()
				.concat(`<<ginsecurity "penis_small">>`);
		case "penisSize3":
			return [
				`"${V.masturbationAudience > 1 ? "<<pShes stranger>>" : "You're"} so small!"`,
				`"작고 귀여운 자지네."`,
				`"I thought ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} penis would be bigger."`,
			]
				.random()
				.concat('<<ginsecurity "penis_small">>');
		case "penisSize4":
			return [
				`"I'd love a picture of ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} cute penis."`,
				`"부끄러워하지 마. 네 자지가 얼마나 예쁜지 모두가 알아야지."`,
				`"자지 사진 찍히기 싫으면 걸레처럼 굴지 말았어야지."`,
			].random();
		case "penisSize5":
			return [
				`"${V.masturbationAudience > 1 ? "<<pShes stranger>>" : "You're"} bigger than I expected."`,
				`"부끄러워하지 마. 네 자지는 자랑스러워해야지."`,
				`"${V.masturbationAudience > 1 ? "<<pHer stranger>>" : "Your"} penis is the perfect size."`,
			]
				.random()
				.concat(V.player.sex !== "m" ? `<<ginsecurity "penis_big">>` : "");
		case "penisSize6":
			return [
				`"${V.masturbationAudience > 1 ? "<<pShes stranger>>" : "You're"} huge!"`,
				`"${V.masturbationAudience > 1 ? "<<pHer stranger>>" : "Your"} penis is freakishly big."`,
				`"이렇게 거대한 자지는 처음 봐."`,
			]
				.random()
				.concat('<<ginsecurity "penis_big">>');
		case "breastSizeFlat":
			if (V.player.gender_appearance === "m") {
				if (V.worn.upper.exposed >= 2) {
					return [
						`"남자애 유두는 참 귀엽다니까."`,
						`"네 매끈한 가슴은 정말 아름답네."`,
						`"부끄러워하지 마. 네 유두는 음란한 게 아니잖아."`,
					].random();
				} else {
					return [
						`"상의 벗어. 그 좋은 가슴 좀 보고 싶어."`,
						`"I wish I could take a picture of what's under <<pher stranger>> top."`,
						`"옷을 입고 있어도 네 가슴이 예쁘다는 건 알겠어."`,
					].random();
				}
			} else {
				if (V.worn.upper.exposed >= 2) {
					return [
						`"네 납작한 가슴 맛있어 보인다."`,
						`"${V.masturbationAudience > 1 ? "<<pHer stranger>>" : "Your"} chest is so flat, ${
							V.masturbationAudience > 1 ? "<<pshe stranger>>" : "you"
						} could pass as a boy."`,
						`"Should I take pictures of <<pher stranger>> cute chest? It'll be useful later."`,
					]
						.random()
						.concat(`<<ginsecurity "breasts_small">>`);
				} else {
					return [
						`"I can't wait to see under <<pher stranger>> top."`,
						`"다른 여자애들이 네 납작한 가슴 가지고 놀려?"`,
						`"걱정 마, 가슴이 없어도 넌 귀여워."`,
					]
						.random()
						.concat(`<<ginsecurity "breasts_small">>`);
				}
			}
		case "breastSizeSmall":
			if (V.player.gender_appearance === "m") {
				if (V.worn.upper.exposed >= 2) {
					return [
						`"네 물렁한 가슴은 거의 여자애 같네."`,
						`"저 작은 젖 좀 봐. 다른 남자애들이 너 놀리겠는데."`,
						`"부끄러워하지 마. 여자애 것처럼 보여도 네 남자애 유두는 음란한 게 아니잖아."`,
					]
						.random()
						.concat(`<<ginsecurity "breasts_small">>`);
				} else {
					return [
						`"상의 벗어. 그 좋은 가슴 좀 보고 싶어."`,
						`"I wish I could take a picture of what's under <<pher stranger>> top."`,
						`"옷을 입고 있어도 네 가슴이 예쁘다는 건 알겠어."`,
					].random();
				}
			} else {
				if (V.worn.upper.exposed >= 2) {
					return [
						`"<<pHer stranger>> tiny breasts are so cute."`,
						`"이제 네 가슴이 아무리 커져도, 작고 귀여웠던 시절의 증거는 내가 갖고 있겠네."`,
						`"작은 가슴이라고 부끄러워하지 마. 사랑스럽잖아."`,
					]
						.random()
						.concat(`<<ginsecurity "breasts_small">>`);
				} else {
					return [
						`"I can see the shape of <<pher stranger>> tiny breasts beneath <<pher stranger>> $worn.upper.name."`,
						`"상의 벗어. 네 가슴을 제대로 보고 싶어."`,
						`"I can't wait to see <<pher stranger>> little breasts, I bet they're superb."`,
					]
						.random()
						.concat(`<<ginsecurity "breasts_small">>`);
				}
			}
		case "breastSizeNormal":
			if (V.worn.upper.exposed >= 2) {
				return [`"네 가슴은 사진발이 정말 좋네."`, `"네 가슴은 홀릴 것 같아."`, `"네 가슴 사진은 나중에 요긴하게 쓰이겠어."`]
					.random()
					.concat(V.player.sex === "m" ? `<<ginsecurity "breasts_big">>` : "");
			} else {
				return [
					`"Take ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} top off, I want a clear look at ${
						V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"
					} breasts."`,
					`"Don't be embarrassed, it's not like your breasts are exposed yet."`,
					`"I can tell how lovely ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} breasts are, even when they're clothed."`,
				]
					.random()
					.concat(V.player.sex === "m" ? `<<ginsecurity "breasts_big">>` : "");
			}
		case "breastSizeLarge":
			if (V.worn.upper.exposed >= 2) {
				return [
					`"${V.masturbationAudience > 1 ? "<<pHer stranger>>" : "Your"} breasts flop about so beautifully."`,
					`"참 대단한 젖가슴이네."`,
					`"부끄러워하지 마, 그렇게 큰 가슴은 자랑스러워해야지.`,
				]
					.random()
					.concat(`<<ginsecurity "breasts_big">>`);
			} else {
				return [
					`"Are ${V.masturbationAudience > 1 ? "<<pher stranger>>" : "your"} breasts really as large as they seem? Only one way to find out."`,
					`"상의 벗어. 네 큰 가슴을 보고 나중에 떠올리고 싶어."`,
					`"그렇게 큰 가슴은 옷 아래 있어도 음란해."`,
				]
					.random()
					.concat(`<<ginsecurity "breasts_big">>`);
			}
		case "breastSizeHuge":
			if (V.worn.upper.exposed >= 2) {
				return [
					`"엄청난 젖통이네."`,
					`"그거면 마을의 아기들을 전부 먹일 수 있겠는데."`,
					`"사진 증거를 남겨야겠어. 안 그러면 아무도 이렇게 컸다는 걸 믿지 않겠지."`,
				]
					.random()
					.concat(`<<ginsecurity "breasts_big">>`);
			} else {
				return [
					`"이렇게 큰 가슴은 속일 수 없겠지, 분명히."`,
					`"상의 벗어. 그 거대한 것 좀 보고 싶어."`,
					`"이렇게 거대한 가슴은 옷 아래 있어도 음란해."`,
				]
					.random()
					.concat(`<<ginsecurity "breasts_big">>`);
			}
	}
}
