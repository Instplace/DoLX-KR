/* globals playerMayBeSpiked, blackmailGiveDaisies, blackmailGrantStall, hasSexStat, playerCannotSelfClimax */
// All quests part from the assumption that PC starts their day at the orphanage
function blackmailReward(rentShare = 1, scaleIncome = true) {
	let rent = Number(V.rentMoney) || 0;
	// Bailey's added rent pressure, especially the uncapped Relentless version, must not turn Club tasks into an escalating income source.
	if (setup.inflation?.rentBaseWithModifiers && Number.isFinite(V.rentStage)) {
		const baseRents = [10000, 30000, 50000, 70000, 100000, 150000, 200000];
		rent = setup.inflation.rentBaseWithModifiers(baseRents[Math.clamp(Math.floor(V.rentStage) - 1, 0, 6)]);
	}
	const rewardPercent = scaleIncome && setup.inflation?.setting ? setup.inflation.setting("inflationBlackmailRewardPct") : 100;
	return Math.round(rent * (Number(rentShare) || 0) * 5 * (rewardPercent / 100));
}
window.blackmailReward = blackmailReward;

const blackmailQuests = {
	low: [],
	mid: [],
	high: [],
	template: [
		{
			id: 1,
			prerequisites() {
				return true;
			},
			reward() {
				return blackmailReward();
			},
			instructions: [". 자정 전에 이 과제를 완수하십시오."],
			clearCondition() {
				return true;
			},
			failCondition() {
				return false;
			},
			alertMessage: ``,
			clearCheck() {
				if (this.clearCondition()) {
					this.cleared = true;
				}
			},
			failCheck() {
				if (this.failCondition()) {
					this.failed = true;
				}
			},
			cleared: false,
			failed: false,
			failMessage() {},
			includesItems: false,
			receiveItems() {},
			onDayCleared() {},
			onDayFailed() {},
		},
	],
};
window.blackmailQuests = blackmailQuests;

/// ##################################################################################
/// ################################# QUEST LIST #####################################
/// ##################################################################################

blackmailQuests.low.push(
	// Generic wear no underwear
	{
		id: 1, // Implemented
		summary: "자정까지 속옷을 입지 않기",
		prerequisites() {
			/*
				Swimsuits count as underwear for this task. 
				On schooldays, that can make swimming lessons impossible for PCs whose exhibitionism is too low to swim naked.
				Only offer this demand on schooldays once the PC can handle nude swimming.
			*/
			return !Time.schoolDay || hasSexStat("exhibitionism", 4);
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"오늘 하루 속옷을 입지 마십시오.",
			"윗속옷과 아랫속옷 모두 입을 수 없습니다.",
			"이 과제에서는 수영복과 레오타드도 속옷으로 칩니다.",
			`<span class="red">자정 전 하루 중 어느 때든 속옷을 한 점이라도 입으면 실패로 처리됩니다.</span>`,
		],
		clearCondition() {
			return true;
		},
		failCondition() {
			return (V.worn.under_upper.name !== "naked" || V.worn.under_lower.name !== "naked") && !V.xchange.blackmail.gracePeriod;
		},
		alertMessage: `속옷을 입고 있습니다. 시간이 지나면 과제에 실패합니다.`,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
				this.worn = clone(V.worn);
			}
		},
		cleared: true,
		failed: false,
		failMessage() {
			if (!this.worn) return;
			let clothing = "";
			if (this.worn?.under_upper.name !== "naked" && this.worn?.under_lower.name !== "naked")
				clothing = `${this.worn.under_upper.name}, ${this.worn.under_lower.name}`;
			else if (this.worn?.under_upper.name !== "naked") clothing = clone(this.worn.under_upper.name);
			else clothing = clone(this.worn.under_lower.name);

			delete this.worn;

			return `저희가 지켜보지 않을 줄 아셨습니까? 오늘 ${clothing} 차림으로 계신 모습을 똑똑히 봤습니다.`;
		},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.low.push(
	// Drink and get wasted
	{
		id: 2, // Implemented
		summary: "자정 전까지 만취하기",
		// A knowingly-pregnant PC refuses all alcohol, making "get wasted" impossible. Don't assign it.
		prerequisites() {
			return !(playerIsPregnant() && playerAwareTheyArePregnant());
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: ["나가서 만취할 때까지 마시십시오.", "술집에서 마셔도 좋지만 꼭 그래야 하는 것은 아닙니다.", "자정 전에 이 과제를 완수하십시오."],
		clearCondition() {
			return V.drunk >= 480;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.mid.push(
	// Take a pill and flirt with 3 people
	{
		id: 3, // Implemented. ID fixed. Do not alter value.
		summary: "자정 전까지 술집에서 세 명에게 추파 던지기",
		prerequisites() {
			return !playerIsXChanged();
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"이 봉투에 저희가 정성껏 준비해 둔 알약을 먹으십시오.",
			"이 알약의 효과를 시험해 보는 것은 허용되지 않습니다.",
			"그런 다음 술집에서 최소 세 명에게 추파를 던지십시오.",
			"상대가 먼저 다가와 수작을 거는 경우는 해당되지 않으니, 그런 사람들은 무시하셔도 좋습니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.tookPill && this.flirtCount >= 3;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			} else if (this.pillLanded && V.xchange.pill.active && V.xchange.pill.effectsKnown) {
				this.failed = true;
			}
		},
		flirtCount: 0,
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: true,
		tookPill: false,
		pillLanded: false,
		receiveItems() {
			// See quest 13/14/16:
			// a no-op spike (e.g. the player took and identified an unrelated pill between assignment and opening this envelope)
			// must not arm the pill-test fail off a pill this quest never actually landed.
			const landed = playerMayBeSpiked();
			if (V.player.sex === "m") {
				wikifier("xchange-pink", 1, "spike", "passion");
				wikifier("drugs", 1000);
			} else {
				wikifier("xchange-blue", 1, "spike", "passion");
				wikifier("drugs", 1000);
			}
			this.tookPill = true;
			this.pillLanded = landed;
		},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
	}
);

blackmailQuests.high.push(
	// Masturbate in an empty classroom
	{
		id: 4, // Implemented. ID fixed. Do not alter value.
		summary: "자정 전까지 빈 교실에서 자위하여 절정에 이르기",
		prerequisites() {
			return Time.schoolDay || (V.historytrait >= 1 && V.parktunnelintro >= 1) || currentSkillValue("skulduggery") >= 200;
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"빈 교실에서 알몸으로 절정에 이를 때까지 자위하십시오.",
			`<span class="red">절정에 이르기 전에 멈추거나 방해를 받으면 처음부터 다시 시작해야 합니다.</span>`,
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.masturbationtimer >= 30;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {},
		onDayFailed() {},
		masturbationtimer: 0,
	}
);

blackmailQuests.mid.push(
	// Skinny dip into the school's pool
	{
		id: 5, // Implemented
		summary: "자정 전까지 학교 수영장에서 알몸으로 수영하기",
		prerequisites() {
			return Time.schoolDay || (V.historytrait >= 1 && V.parktunnelintro >= 1) || currentSkillValue("skulduggery") >= 200;
		},
		reward() {
			return blackmailReward();
		},
		instructions: ["학교 수영장에서 알몸으로 수영하십시오.", "자정 전에 이 과제를 완수하십시오."],
		clearCondition() {
			return this.swamNaked;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
		swamNaked: false,
	}
);

blackmailQuests.low.push(
	// Go for a run in your underwear at park
	{
		id: 6, // Implemented.
		summary: "자정 전까지 공원에서 속옷 차림으로 30분 동안 달리기",
		prerequisites() {
			return true;
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"속옷 차림으로 공원에서 달리십시오. 이 활동에 최소 30분을 들이십시오.",
			"밤 9시 이후에 하실 것을 권합니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.timeSpent >= 30;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 100;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
		timeSpent: 0,
	}
);

blackmailQuests.mid.push(
	// Go for a run naked at park
	{
		id: 7, // Implemented.
		summary: "자정 전까지 공원에서 알몸으로 한 시간 동안 달리기",
		prerequisites() {
			return true;
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"알몸으로 공원에서 달리십시오. 이 활동에 최소 1시간을 들이십시오.",
			"밤 9시 이후에 하실 것을 권합니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.timeSpent >= 60;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 200;
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
		timeSpent: 0,
	}
);

blackmailQuests.low.push(
	// Take a pill and wear a skirt
	{
		id: 8, // Implemented
		summary: "자정까지 치마를 입거나 하의를 아예 입지 않기",
		prerequisites() {
			return V.player.sex === "m" && !playerIsXChanged();
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"이 봉투에 동봉한 알약을 먹으십시오.",
			"알약의 효과를 시험해 보는 것은 허용되지 않습니다.",
			"저희가 준비한 치마를 입으셔도 되고, 가지고 계신 다른 치마를 입으셔도 됩니다.",
			"치마 외의 다른 하의는 인정되지 않습니다.",
			"하의를 아예 입지 않으셔도 됩니다(즉, 수영장에서 수영복을 입는 것은 괜찮습니다)",
			`<span class="red">자정 전 하루 중 어느 때든 치마가 아닌 하의를 입으면 실패로 처리됩니다.</span>`,
		],
		clearCondition() {
			return this.tookPill;
		},
		failCondition() {
			return !wornSetupClothes("lower").skirt && V.worn.lower.name !== "naked" && !V.xchange.blackmail.gracePeriod;
		},
		alertMessage: `치마가 아닌 하의를 입고 있습니다. 시간이 지나면 과제에 실패합니다.`,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
				this.worn = clone(V.worn);
			} else if (this.pillLanded && V.xchange.pill.active && V.xchange.pill.effectsKnown) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {
			if (!this.worn) return;
			const clothing = clone(this.worn.lower.name);
			delete this.worn;

			return `저희가 지켜보지 않을 줄 아셨습니까? 오늘 ${clothing} 차림으로 계신 모습을 똑똑히 봤습니다.`;
		},
		includesItems: true,
		tookPill: false,
		pillLanded: false,
		receiveItems() {
			// See quest 13/14/16: a no-op spike must not arm the pill-test fail off a pill this quest never landed.
			const landed = playerMayBeSpiked();
			wikifier("generalWear", "lower", `"short school skirt"`, "black");
			wikifier("xchange-pink", 1, "spike");
			this.tookPill = true;
			this.pillLanded = landed;
		},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.low.push(
	// Clean 3 chalets in uniform without underwear
	{
		id: 9, // Implemented
		summary: "자정 전까지 해변의 샬레 세 곳을 속옷 없이 제복 차림으로 청소하기",
		prerequisites() {
			return Time.hour < 17;
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"해변의 샬레 세 곳을 청소하십시오.",
			"청소하는 동안 메이드복이나 집사복을 입으십시오.",
			"편의를 위해 이 봉투에 옷 한 벌을 동봉했습니다.",
			"제복을 입는 동안에는 속옷이 허용되지 않습니다.",
			`<span class="red">제복 안에 속옷을 입으면 자동으로 실패합니다.</span>`,
			"제복은 샬레를 청소하는 동안에만 입으면 됩니다.",
			"제복을 입지 않고 청소한 샬레는 인정되지 않습니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.chaletsCleaned >= 3;
		},
		failCondition() {
			return this.woreUnderwear;
		},
		woreUnderwear: false,
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		chaletsCleaned: 0,
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: true,
		receiveItems() {
			if (V.player.sex === "m") {
				wikifier("generalWear", "upper", `"waiter's shirt"`);
				wikifier("generalWear", "lower", '"suit trousers"', "black");
			} else if (V.player.sex === "f") {
				wikifier("generalWear", "upper", '"maid dress"');
			}
			wikifier("generalWear", "handheld", '"feather duster"');
			wikifier("updatesidebarimg");
		},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.mid.push(
	// Avoid defiance for a day
	{
		id: 10, // Implemented
		summary: "자정까지 반항적으로 굴지 않기",
		prerequisites() {
			return V.submissive <= 850;
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"당신은 의지가 강하고 자존심이 세시니, 스스로에게 더 솔직해지는 법을 가르쳐 드리고자 합니다.",
			"그래서 오늘은 반항적인 행동을 허용하지 않겠습니다.",
			"즉, 폭력은 안 됩니다. 버릇없이 굴지 마십시오.",
			"자정까지 지키시면 성공으로 인정하겠습니다.",
		],
		clearCondition() {
			return true;
		},
		failCondition() {
			return this.behavedDefiantly;
		},
		behavedDefiantly: false,
		alertMessage: `방금 반항적으로 행동했습니다.`,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
	}
);

blackmailQuests.low.push(
	// Wear no shirt if male
	{
		id: 11, // Implemented
		summary: "자정까지 학교 밖에서 상체에 아무것도 걸치지 않기",
		prerequisites() {
			return V.player.sex === "m";
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"오늘은 셔츠도, 상체를 가리는 다른 어떤 옷도 입으실 수 없습니다.",
			"학교 부지 안(수영장은 제외)에서만 상체를 가리셔도 됩니다.",
			"앞서 말한 예외는 등교일에만 적용됩니다.",
			`<span class="red">자정 전 하루 중 어느 때든 학교 밖에서 상체를 가리는 옷을 입으면 실패로 처리됩니다.</span>`,
		],
		clearCondition() {
			return true;
		},
		failCondition() {
			return (
				(V.worn.under_upper.name !== "naked" || V.worn.upper.name !== "naked") &&
				(V.location !== "school" || !Time.schoolDay) &&
				!V.xchange.blackmail.gracePeriod
			);
		},
		alertMessage: `상체를 가리는 옷을 입고 있습니다. 시간이 지나면 과제에 실패합니다.`,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
				this.worn = clone(V.worn);
			}
		},
		cleared: true,
		failed: false,
		failMessage() {
			if (!this.worn) return;
			let clothing = "";
			if (this.worn?.under_upper.name !== "naked" && this.worn?.upper.name !== "naked") clothing = `${this.worn.upper.name}, ${this.worn.under_upper.name}`;
			else if (this.worn?.under_upper.name !== "naked") clothing = clone(this.worn.under_upper.name);
			else clothing = clone(this.worn.upper.name);

			delete this.worn;

			return `저희가 지켜보지 않을 줄 아셨습니까? 오늘 ${clothing} 차림으로 계신 모습을 똑똑히 봤습니다.`;
		},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.low.push(
	// Flash your underwear to at least 5 strangers
	{
		id: 12,
		summary: "자정 전까지 거리에서 낯선 사람 다섯 명에게 노출하기",
		prerequisites() {
			return hasSexStat("exhibitionism", 2);
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"거리에서 낯선 사람 최소 다섯 명에게 노출하십시오.",
			"이 과제는 콘누다투스 가에서 하시기를 권합니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.flashedPeople >= 5;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		flashedPeople: 0,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.low.push(
	// Sell flowers on a market stall, without any lower clothing (undies allowed)
	{
		id: 13,
		summary: "자정 전까지 콘누다투스 가의 꽃 노점에서 하의 없이 꽃 팔기",
		prerequisites() {
			return Time.dayState === "dawn" && !playerIsXChanged();
		},
		reward() {
			return blackmailReward(1 / 3);
		},
		instructions: [
			"저희가 준비한 알약을 삼키고, 팔 꽃 200송이를 가져가십시오.",
			"콘누다투스 가에서 꽃을 파십시오. <span class='green'>오늘 노점 임대료는 저희가 이미 처리해 두었습니다.</span>",
			"수익이 <<printmoney 25000>> 이상이면 기본 보수에 더해 당신의 사업 명성도 올려 드리겠습니다.",
			`<span class="red">알약의 효과를 시험해 보는 것은 허용되지 않습니다.</span>`,
			"하의(속옷은 허용)를 입은 채 이루어진 판매는 목표에 포함되지 않습니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.tookPill && this.soldFlowers;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			} else if (this.pillLanded && V.xchange.pill.active && V.xchange.pill.effectsKnown) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: true,
		tookPill: false,
		pillLanded: false,
		soldFlowers: false,
		profit: 0,
		receiveItems() {
			// The spike no-ops when the player can't be spiked (noncon spiking disabled, therapy, pregnancy); only a landed spike can be "tested", so only that may fail.
			const landed = playerMayBeSpiked();
			blackmailGiveDaisies(200);
			blackmailGrantStall();
			wikifier("xchange-random-spike", "suppress");
			this.tookPill = true;
			this.pillLanded = landed;
		},
		onDayCleared() {
			if (this.profit >= 25000) wikifier("famebusiness", 25);
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 2;
		},
		onDayFailed() {},
	}
);

blackmailQuests.mid.push(
	// Sell flowers on a market stall, without any lower clothing (undies allowed), and masturbate at least once
	{
		id: 14,
		summary: "자정 전까지 콘누다투스 가의 꽃 노점에서 하의 없이 꽃을 팔며 자위하기",
		prerequisites() {
			return Time.dayState === "dawn" && !playerIsXChanged() && !playerCannotSelfClimax();
		},
		reward() {
			return blackmailReward(1 / 2);
		},
		instructions: [
			"꽃 노점에서 꽃을 파는 동안 최소 한 번 자위하십시오(그리고 절정에 이르십시오).",
			"저희가 준비한 알약을 삼키고, 이 꽃 200송이를 가져가 파십시오. <span class='green'>오늘 노점 임대료는 저희가 이미 처리해 두었습니다.</span>",
			"수익이 <<printmoney 25000>> 이상이면 기본 보수에 더해 당신의 사업 명성도 올려 드리겠습니다.",
			`<span class="red">알약의 효과를 시험해 보는 것은 허용되지 않습니다.</span>`,
			"하의(속옷은 허용)를 입은 채 이루어진 판매는 목표에 포함되지 않습니다.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.tookPill && this.soldFlowers && this.masturbatedOnce;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			} else if (this.pillLanded && V.xchange.pill.active && V.xchange.pill.effectsKnown) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: true,
		tookPill: false,
		pillLanded: false,
		soldFlowers: false,
		masturbatedOnce: false,
		profit: 0,
		receiveItems() {
			// See quest 13: a no-op spike (unspikeable player) must not arm the pill-test fail.
			const landed = playerMayBeSpiked();
			blackmailGiveDaisies(200);
			blackmailGrantStall();
			wikifier("xchange-random-spike", "suppress");
			this.tookPill = true;
			this.pillLanded = landed;
		},
		onDayCleared() {
			if (this.profit >= 25000) wikifier("famebusiness", 25);
			V.xchange.blackmail.penaltyThreat.exhibitionism += 50;
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
	}
);

blackmailQuests.high.push(
	// Go streaking naked at the park during the day
	{
		id: 15, // Implemented.
		summary: "낮 동안 공원에서 알몸으로 스트리킹하기",
		prerequisites() {
			return Time.hour <= 16;
		},
		reward() {
			return blackmailReward();
		},
		instructions: ["낮에 공원에서 알몸으로 스트리킹하십시오.", "자정 전에 이 과제를 완수하십시오."],
		clearCondition() {
			return V.daily.parkStreak;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 300;
		},
		onDayFailed() {},
	}
);

blackmailQuests.high.push(
	// Go play air hockey at the arcade, and either fully strip, or be stripped by, the other player.
	{
		id: 16, // Implemented.
		summary: "자정 전까지 오락실에서 스트립 에어하키 치기",
		prerequisites() {
			return Time.hour < 20;
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"오락실에 가서 에어하키를 치십시오.",
			"다른 플레이어와 스트립 게임을 하여, 둘 중 한 사람이 완전히 알몸이 될 때까지 계속하십시오.",
			"이 과제를 위해 선택 사항인 알약을 무료로 제공합니다.",
			`<span class="red">알약을 먹는다면 효과를 시험해 보는 것은 허용되지 않습니다.</span>`,
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.finishedGame;
		},
		failCondition() {
			return false;
		},
		alertMessage: ``,
		clearCheck() {
			if (this.clearCondition()) {
				this.cleared = true;
			}
		},
		failCheck() {
			if (this.failCondition()) {
				this.failed = true;
			} else if (this.pillLanded && V.xchange.pill.active && V.xchange.pill.effectsKnown) {
				this.failed = true;
			}
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: true,
		tookPill: false,
		pillLanded: false,
		receiveItems() {
			// This quest has no !playerIsXChanged prerequisite, so the player may already be on a knowingly-taken pill (effectsKnown true).
			// If the spike can't land it no-ops, and the old tookPill-based fail check then instantly failed the quest off that pre-existing pill.
			// Only a landed spike arms the pill-test fail.
			const landed = playerMayBeSpiked();
			wikifier("xchange-random-spike", "suppress");
			this.tookPill = true;
			this.pillLanded = landed;
		},
		onDayCleared() {
			V.xchange.blackmail.penaltyThreat.exhibitionism += 300;
		},
		onDayFailed() {},
		finishedGame: false,
	}
);

blackmailQuests.high.push(
	// Work a waiter shift, then make a fluid-filled bun as a returning chef
	{
		id: 17,
		summary: "종업원으로 한 번 근무한 뒤, 자정 전까지 자신의 체액으로 크림빵 만들기",
		prerequisites() {
			return V.chef_state >= 1 && (V.chef_state !== 7 || V.chef_rework > 30) && V.chef_state !== 8 && Time.hour < 19 && !playerCannotSelfClimax();
		},
		reward() {
			return blackmailReward();
		},
		instructions: [
			"오션 브리즈 카페에서 종업원으로 한 번 근무하십시오.",
			"그런 다음 카페의 요리사로 일하며 당신의 체액으로 크림빵을 만드십시오.",
			"자정 전에 이 과제를 완수하십시오.",
		],
		clearCondition() {
			return this.workedAsWaiter && this.madeFluidBun;
		},
		failCondition() {
			return false;
		},
		alertMessage: `오션 브리즈 카페에서 일하고 체액이 든 빵을 만드는 일이 아직 남았습니다.`,
		clearCheck() {
			if (this.clearCondition()) this.cleared = true;
		},
		failCheck() {
			if (this.failCondition()) this.failed = true;
		},
		cleared: false,
		failed: false,
		failMessage() {},
		includesItems: false,
		workedAsWaiter: false,
		madeFluidBun: false,
		receiveItems() {},
		onDayCleared() {
			V.xchange.blackmail.cooldown = 3;
		},
		onDayFailed() {},
	}
);
