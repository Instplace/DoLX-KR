/* eslint-disable dot-notation */
/* globals getSensitivityMedication sensitivityMedicationRemainingHours xchangePillNeutralised sleepAidPending sleepAidOtcStrongEnough pillDosesTodayByType pocketBagCapacity pocketBagName pocketAvailable pocketCarrying pocketSlotToggle xchangeVoluntaryDoseBegin xchangeVoluntaryDoseEnd AmbienceAudio */
/*
 * if display_condition is 1, item is displayed, else it's not
 * current max doses for Harper/Asylum pills is 1; 2 for every other pills
 * place the widgets that need to be run inside effects array
 * if you feel lost just ask away :)
 * take_condition == 1 means the "Take Pill" button is not greyed out and is clickable
 * display_condition controls whether or not pill should be displayed in the pill menu
 */

/*
--- Please change this comment as needed when the format of setup.pills changes ---
This is the setup.pills array.
It contains a list of all the possible pills.
A single pill object contains multiple 'properties' which define the pill.

 * name:'example pill' - The name displayed in the medicine drawer screen. Auto-capitalises first word. Capitalise other words if desired.
 * description: 'this pill is green.' - The description displayed when the pill is selected.
 * onTakeMessage: 'You swallow the green pill.' - Text displayed when a pill is taken.
 * warning_label: 'Warning: example pill may cause explosive decompression.' - Warning label displayed in text box. <span class="hpi_notice_label"> is used in several of these.
 * indicators: - Array of indicators. Example: `<span class="hpi_indic_green">+ Control</span>`
 * icon: 'img/misc...blahblah' - file path of the png icon for this pill.
 *
 * autoTake: - Code or statement that determines if this pill is set to auto-take ??? **
 * doseTaken: - Code or statement showing how many doses were taken already. **
 * owned: - Code or statement to determined the number owned. **
 * overdose: - Code or statement to determine overdose. **
 * display_condition: - Code or statement to determine if the pill displays in list. **
 * take_condition: - Code or statement to determine if the take button displays for this pill - can a dose currently be taken. **
 *
 * type: "various" - Type of pill. Pill code uses this to determine what the effects are and where they apply. Example: "bottom" or "breast"
 * subtype: "various" - Action the pill has on bodypart 'type'. Optional for the asylum & harper meds apparently. Example: "reduction" or "growth"
 * shape: "pill" or "galenic" - Helps to properly space the icon.
 * effects: - Array of effects - can be used to issue quick macros for setting results. Example: `<<control 25>>`
*/
setup.pills = [
	{
		name: "bottom reduction",
		description:
			"각 알약에는 엉덩이에 있는 중성지방에 결합해 시간이 지나며 녹이도록 특별히 제작된 유도 분자 프라베르홀 500mg이 들어 있다.",
		onTakeMessage: "엉덩이 크기를 줄이기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label: "경고: 하루 처방 최대 용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "bottom",
		subtype: "reduction",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-bottom.png",
		frontIcon: "img/misc/icon/small-down-arrow.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["bottom growth"].doseTaken === 0 && V.sexStats.pills["pills"]["bottom blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "bottom growth",
		description:
			"이 알약에는 저명한 제약 과학자 반셀 박사의 기술력으로 만들어진 분자 닌트롭테클록신이 들어 있다. 이 물질은 엉덩이와 둔부 지방 증가를 담당하는 특정 호르몬의 체내 생성을 촉진한다. 한 알당 해당 분자 190mg이 포함되어 있다.",
		onTakeMessage: "엉덩이 성장을 촉진하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 하루 최대 복용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 의문이 있는 경우 의사와 상담하십시오. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "bottom",
		subtype: "growth",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-bottom.png",
		frontIcon: "img/misc/icon/small-up-arrow.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 &&
				V.sexStats.pills["pills"]["bottom reduction"].doseTaken === 0 &&
				V.sexStats.pills["pills"]["bottom blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "bottom blocker",
		description:
			"각 알약에는 중성지방에 결합해 시간이 지나며 녹이도록 특별히 제작된 유도 분자 프라베르홀-NG2가 들어 있다. 비활성 성분 트리넬카는 엉덩이의 피하 지방 조직과 강하게 결합하도록 돕는다. 200mg은 늘어나는 지방과 녹아 없어지는 지방 사이의 균형을 맞추는 적정 용량이다.",
		onTakeMessage: "엉덩이 성장을 억제하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"<span class='hpi_notice_label'>알림: 이 약의 임상시험에서 확인된 부작용은 없습니다. 24시간 내에 1알을 초과해 복용해도 효과가 없습니다.</span>",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "bottom",
		subtype: "blocker",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-bottom.png",
		frontIcon: "img/misc/icon/small-cross.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 &&
				V.sexStats.pills["pills"]["bottom growth"].doseTaken === 0 &&
				V.sexStats.pills["pills"]["bottom reduction"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "breast reduction",
		description:
			"각 알약에는 중성지방에 결합해 시간이 지나며 녹이도록 특별히 제작된 유도 분자 프라베르홀-NG2 500mg이 들어 있다. 비활성 성분 애브플루틱스는 가슴의 지방 조직과 강하게 결합하도록 돕는다.",
		onTakeMessage: "가슴 크기를 줄이기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 하루 최대 복용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 의문이 있는 경우 의사와 상담하십시오. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "breast",
		subtype: "reduction",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-breast.png",
		frontIcon: "img/misc/icon/small-down-arrow.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["breast growth"].doseTaken === 0 && V.sexStats.pills["pills"]["breast blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "breast growth",
		description:
			"호르몬 mRNA 치료제 알약이다. 포함된 디파딘 5mg은 가슴 성장을 일으키는 특정 호르몬의 자연 분비를 유도하며, mRNA는 세포가 새로운 종류의 호르몬을 만들어 가슴 조직 생성과 지방 저장 능력을 높이도록 도와 결과적으로 가슴이 더 빨리 자라게 한다.",
		onTakeMessage: "가슴 성장을 촉진하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 하루 최대 복용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 의문이 있는 경우 의사와 상담하십시오. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "breast",
		subtype: "growth",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-breast.png",
		frontIcon: "img/misc/icon/small-up-arrow.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 &&
				V.sexStats.pills["pills"]["breast reduction"].doseTaken === 0 &&
				V.sexStats.pills["pills"]["breast blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "breast blocker",
		description:
			"선택적 에스트로겐 수용체 조절제(SERM)로, 가슴 성장을 담당하는 단백질 수용체를 차단한다. 테트라오제알포스티길 269mg이 보강되어 있다.",
		onTakeMessage: "가슴 성장을 억제하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			'<span class="hpi_notice_label">알림: 이 약의 임상시험에서 확인된 부작용은 없습니다. 24시간 내에 1알을 초과해 복용해도 효과가 없습니다.</span>',
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "breast",
		subtype: "blocker",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-breast.png",
		frontIcon: "img/misc/icon/small-cross.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 &&
				V.sexStats.pills["pills"]["breast growth"].doseTaken === 0 &&
				V.sexStats.pills["pills"]["breast reduction"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "penis reduction",
		description:
			"각 알약에는 제한적인 항안드로겐 효과를 지닌 클리우스토스 50mg이 들어 있다. 또한 피린 450mg이 발기 조직의 양과 두께를 줄인다.",
		onTakeMessage: "자지 크기를 줄이기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 하루 최대 복용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 의문이 있는 경우 의사와 상담하십시오. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "penis",
		subtype: "reduction",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-penis.png",
		frontIcon: "img/misc/icon/small-down-arrow.png",
		display_condition() {
			return V.player.penisExist && this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["penis growth"].doseTaken === 0 && V.sexStats.pills["pills"]["penis blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "penis growth",
		description:
			"각 알약에는 컴닉톤딜 780mg, 이포폴 240mg, 테스토스테론 운데카노에이트 149mg이 들어 있다. 두 분자는 안드로겐의 작용을 가능하게 하고 촉진해, 자지의 자연 성장을 다시 시작시키는 효과를 낸다.",
		onTakeMessage: "자지 성장을 촉진하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 하루 최대 복용량을 초과하면 심각한 부작용이 발생할 수 있습니다. 의문이 있는 경우 의사와 상담하십시오. 다른 호르몬 치료와 병용하지 마십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "penis",
		subtype: "growth",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-penis.png",
		frontIcon: "img/misc/icon/small-up-arrow.png",
		display_condition() {
			return V.player.penisExist && this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["penis reduction"].doseTaken === 0 && V.sexStats.pills["pills"]["penis blocker"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "penis blocker",
		description:
			"딘트라임 370mg을 함유한 항안드로겐 호르몬 치료제로, 체내 안드로스테론과 테스토스테론 생성을 차단해 결과적으로 자지 성장을 억제한다.",
		onTakeMessage: "자지 성장을 억제하기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			'<span class="hpi_notice_label">알림: 이 약의 임상시험에서 확인된 부작용은 없습니다. 24시간 내에 1알을 초과해 복용해도 효과가 없습니다.</span>',
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "penis",
		subtype: "blocker",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-penis.png",
		frontIcon: "img/misc/icon/small-cross.png",
		display_condition() {
			return V.player.penisExist && this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 && V.sexStats.pills["pills"]["penis growth"].doseTaken === 0 && V.sexStats.pills["pills"]["penis reduction"].doseTaken === 0
				? 1
				: 0;
		},
		effects: [],
	},
	{
		name: "fertility booster",
		description:
			"각 알약에는 에스트로겐의 구조 유사체인 클로미펜 시트르산염 50mg이 들어 있다. 또한 배란을 유도하는 데 필요한 호르몬을 분비하는 시상하부에도 작용한다. 경우에 따라 난소가 난자를 배출하도록 효과적으로 유도한다.",
		onTakeMessage: "생식력을 높이기 위한 알약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 처방 용량으로도 가벼운 부작용이 발생할 수 있으며, 초기 임신 징후와 비슷한 증상이 나타날 수 있습니다. 하루 최대 복용량을 초과하면 심각한 합병증이 발생할 수 있습니다. 의심스러운 경우 의사와 상담하십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		hpi_doseTaken() {
			if (V.sexStats.pills["pills"][this.name].doseTaken) {
				return "효과 지속: " + V.sexStats.pills["pills"][this.name].doseTaken + "일";
			} else {
				return "사용하지 않음";
			}
		},
		hpi_take_every_morning() {
			return this.autoTake() ? "자동 복용 중지" : "필요할 때 복용";
		},
		type: "pregnancy",
		subtype: "fertility booster",
		shape: "pill",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-fertility.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["contraceptive"].doseTaken === 0 ? 1 : 0;
		},
		effects: [],
	},
	{
		name: "contraceptive",
		description:
			"에티닐에스트라디올 24mg과 합성 프로게스틴 31mg을 조합한 에스트로겐-프로게스틴 복합제로, 거의 완벽한 피임 효과를 낸다.",
		onTakeMessage: "피임약을 삼킨다. 광고만큼 효과가 있기를 바란다.",
		warning_label:
			"경고: 처방 용량으로도 가벼운 부작용이 발생할 수 있습니다. 하루 최대 복용량을 초과하면 심각한 합병증이 발생할 수 있습니다. 의심스러운 경우 의사와 상담하십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		hpi_doseTaken() {
			if (V.sexStats.pills["pills"][this.name].doseTaken) {
				return "효과 지속: " + V.sexStats.pills["pills"][this.name].doseTaken + "일";
			} else {
				return "사용하지 않음";
			}
		},
		hpi_take_every_morning() {
			return this.autoTake() ? "자동 복용 중지" : "필요할 때 복용";
		},
		type: "pregnancy",
		subtype: "contraceptive",
		shape: "galenic",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-contraceptive.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 2 && V.sexStats.pills["pills"]["fertility booster"].doseTaken === 0 ? 1 : 0;
		},
		effects: [],
	},
	{
		name: "Anti-Parasite Cream",
		description:
			"퍼메트린이 들어 있는 기생충 방지 크림이다. 바르면 새로운 기생충 감염을 막지만, 이미 진행 중인 기생충 감염에는 효과가 없다. 한 번 바르면 14일 동안 효과가 지속된다.",
		onTakeMessage: "성기 주변에 크림을 바른다. 기생충이 새끼를 남기지 못하게 막아주기를 바란다.",
		warning_label:
			"경고: 사용 직후 알레르기 반응이 나타나면 의사와 상담하십시오. 크림이 입이나 눈에 들어간 경우 즉시 의사에게 연락하십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		hpi_take_pills() {
			return "피부에 바르기";
		},
		hpi_doseTaken() {
			if (V.sexStats.pills["pills"][this.name].doseTaken) {
				return "효과 지속: " + V.sexStats.pills["pills"][this.name].doseTaken + "일";
			} else {
				return "사용하지 않음";
			}
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "parasite",
		subtype: "Anti-Parasite Cream",
		shape: "cream",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/anti-parasite-cream.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 ? 1 : 0;
		},
		effects: [],
	},
	{
		name: "painkillers",
		description: "강력한 진통제 한 병이다. 심한 통증을 빠르게 가라앉히지만 상당한 졸음을 일으킨다.",
		onTakeMessage: "진통제를 삼킨다. 오래지 않아 통증이 가라앉지만 눈꺼풀이 무거워진다.",
		warning_label: "경고: 심한 졸음을 일으킬 수 있습니다. 하루에 세 번을 넘게 복용하면 점점 위험한 부작용이 나타납니다.",
		indicators: ["<span class='hpi_indic_green'>-- Pain</span>", "<span class='hpi_indic_blue'>+++ Tiredness</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		type: "painkiller",
		subtype: "pain relief",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/infirmary.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return 1;
		},
		effects: [`<<pain -10>><<tiredness 18>><<llpain>><<gggtiredness>>`],
	},
	{
		name: "anti-anxiety tablets",
		description: "트라우마와 스트레스를 줄여 주는 속효성 약이다. 하루에 한 알을 넘게 먹으면 심각한 부작용이 생길 수 있다.",
		onTakeMessage() {
			const doses = Number(T.calmorylDose) || this.doseTaken();
			if (doses === 1) return "항불안제를 삼킨다. 스트레스가 누그러지기 시작한다.";
			if (doses === 2) return "두 번째 알을 먹는다. 속이 메스껍고 생각을 또렷하게 하기 어렵다.";
			if (doses === 3) return "세 번째 알을 먹는다. 주변에서 동떨어진 느낌이 들고, 눈앞에서 벌어지는 일에 집중하기가 힘들다.";
			return "또 한 알을 삼킨다. 주위에서 벌어지는 일을 더욱 알아차리지 못하게 된다.";
		},
		warning_label:
			"경고: 하루에 한 알을 넘게 복용하지 마십시오. 두 번째 알은 부작용을 일으킵니다. 세 알 이상 복용하면 일시적인 해리 상태가 되어 주변 상황을 이해하기 어려워집니다. 알을 추가할 때마다 효과가 더 오래 지속됩니다.",
		indicators: ["<span class='hpi_indic_green'>--- Trauma</span>", "<span class='hpi_indic_green'>- Stress</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_doseTaken() {
			return `${this.doseTaken()}\u00A0taken`;
		},
		type: "calmoryl",
		subtype: "trauma suppressant",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pill.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return 1;
		},
		effects: [() => `<<run takeCalmoryl()>>`],
	},
	{
		name: "sleeping pills",
		description: "처방전 없이 살 수 있는 순한 수면 보조제다. 자기 전에 한 알 먹으면 잠드는 데 도움이 된다. 트라우마가 심하면 듣지 않을 수 있다.",
		get onTakeMessage() {
			return sleepAidOtcStrongEnough()
				? "수면제를 삼킨다. 잠시 후 졸음이 오기 시작한다."
				: "You swallow a sleeping pill. You start to feel tired, but you still cannot relax. <span class='red'>The pill is not strong enough to help you sleep tonight.</span>";
		},
		warning_label: "경고: 자기 전에 한 알을 복용하십시오. 두 번째 알은 복용하지 마십시오. 잠에서 깨기 어려워질 수 있습니다.",
		indicators: ["<span class='hpi_indic_green'>- Insomnia</span>", "<span class='hpi_indic_blue'>+ Oversleeping</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_doseTaken() {
			return sleepAidPending()?.strength === "otc" ? "Active" : `${this.doseTaken()}\u00A0taken`;
		},
		type: "sleep",
		subtype: "otc",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/sharks-teeth.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return 1;
		},
		effects: [`<<run takeSleepAid("otc")>><<tiredness 5>>`],
	},
	{
		name: "prescription sleeping pills",
		description: "강력한 수면제다. 스트레스를 받은 상태에서도 잠들 수 있게 해 주지만, 너무 자주 쓰면 의존하게 될 수 있다.",
		onTakeMessage: "수면제를 먹는다. 금세 졸음이 밀려온다.",
		warning_label:
			"경고: 자기 전에 한 알을 복용하십시오. 두 번째 알을 복용하면 정신을 잃습니다. 자주 복용하면 의존성이 생겨 알약 없이는 잠들기 더 어려워질 수 있습니다.",
		indicators: [
			"<span class='hpi_indic_green'>-- Insomnia</span>",
			"<span class='hpi_indic_blue'>++ Oversleeping</span>",
			"<span class='hpi_indic_red'>Dependence</span>",
		],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_doseTaken() {
			return sleepAidPending()?.strength === "prescription" ? "Active" : `${this.doseTaken()}\u00A0taken`;
		},
		type: "sleep",
		subtype: "prescription",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pill-strong.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return 1;
		},
		effects: [`<<run takeSleepAid("prescription")>><<tiredness 10>>`],
	},
	{
		name: "prescription painkillers",
		description: "강력한 처방 진통제다. 한 알이면 통증이 크게 줄지만 몹시 피곤해진다.",
		onTakeMessage: "처방 진통제를 삼킨다. 통증이 금세 사라지지만 몹시 졸려지기 시작한다.",
		warning_label: "경고: 심한 졸음을 일으킵니다. 하루에 두 번을 넘게 복용하면 위험한 부작용이 나타날 수 있습니다.",
		indicators: ["<span class='hpi_indic_green'>--- Pain</span>", "<span class='hpi_indic_blue'>+++ Tiredness</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		type: "painkiller",
		subtype: "prescription pain relief",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/infirmary.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return 1;
		},
		effects: [`<<pain -20>><<tiredness 25>><<lllpain>><<gggtiredness>>`],
	},
	{
		name: "asylum's prescription",
		description: "강력한 항정신병제다.",
		onTakeMessage: "정신병원에서 처방받은 알약을 삼킨다. 머리가 멍해진다.",
		warning_label:
			"<span class='hpi_notice_label'>알림: 이 약의 실험 단계에서 확인된 부작용은 없었으며, 모든 안전 규정을 통과했습니다. <span class='hpi_blur unselectable'>이 제약회사 때문에 내가 끝장날 것 같군. 부작용이 없다고? 대체 누굴 속이려는 거야?!</span></span>",
		indicators: ["<span class='hpi_indic_green'>++ 통제력</span>", "<span class='hpi_indic_blue'>- 성지식</span>"],
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "asylum",
		shape: "galenic",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-strong.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 1 && V.asylummedicated === 0 ? 1 : 0;
		},
		effects: [`<<awareness -5>>`, `<<control 25>>`, `<<set $asylummedicated += 1>>`],
	},
	{
		name: "Dr Harper's prescription",
		/* Harper may add an antidepressant to the PC's regular medication. */
		get description() {
			return V.prescriptions?.antidepressant
				? "항정신병 약물에 항우울제가 추가되어 있다. 항우울제는 하루 스트레스 증가량을 줄이지만 더 빨리 피곤해지게 한다."
				: "항정신병 약물이다.";
		},
		get onTakeMessage() {
			return V.prescriptions?.antidepressant
				? "하퍼 의사가 처방한 알약을 삼킨다. 어지럽지만 한결 차분해진다."
				: "하퍼 의사가 처방한 알약을 삼킨다. 어지럽다.";
		},
		warning_label:
			"경고: 하루 한 번 복용하는 약입니다. 매일 복용하면 인지력이 떨어지고 지각이 서서히 왜곡될 수 있습니다. 최대 용량의 효과는 충분히 연구되지 않았습니다. 주의해서 복용하십시오. <span class='hpi_blur'></span>",
		get indicators() {
			const base = ["<span class='hpi_indic_green'>+ 통제력</span>", "<span class='hpi_indic_blue'>- 성지식</span>"];
			if (V.prescriptions?.antidepressant) {
				base.push("<span class='hpi_indic_green'>- 스트레스 증가량</span>", "<span class='hpi_indic_blue'>+ 피로도 증가량</span>");
			}
			return base;
		},
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		type: "harper",
		shape: "galenic",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/pill-collection.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() < 1 && V.medicated === 0 ? 1 : 0;
		},
		effects: [`<<awareness -1>>`, `<<control 10>>`, `<<set $medicated += 1>>`],
	},
	{
		name: "sensitivity-decreasing cream",
		description:
			"감각을 일시적으로 둔하게 만드는 속효성 외용 신경 억제제다. 한 번 바르면 16시간 동안 효과가 이어진다.",
		onTakeMessage: "감도 저하 크림을 피부에 문지른다. 옷이 계속 닿는 감촉이 어느새 배경으로 멀어진다.",
		warning_label: "경고: 하루에 한 번을 넘게 바르지 마십시오. 이 크림은 사용 중인 감도 증가 크림의 효과를 대체합니다.",
		indicators: ["<span class='hpi_indic_blue'>--- Sensitivity</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_doseTaken() {
			const medication = getSensitivityMedication();
			const hours = sensitivityMedicationRemainingHours();
			return medication?.type === this.subtype ? `효과 지속: ${hours}시간${hours === 1 ? "" : ""}` : "사용하지 않음";
		},
		type: "sensitivity",
		subtype: "suppressant",
		shape: "cream",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/cream.png",
		hpi_take_pills() {
			return "크림 바르기";
		},
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 && getSensitivityMedication()?.type !== this.subtype ? 1 : 0;
		},
		take_blocked_reason() {
			return this.doseTaken() > 0 ? "라벨에는 하루에 한 번만 바르도록 되어 있습니다." : "이 크림은 이미 효과가 이어지는 중입니다.";
		},
		effects: [`<<run applySensitivityCream("suppressant")>>`],
	},
	{
		name: "sensitivity-increasing cream",
		description: "온몸의 감각을 일시적으로 예민하게 만드는 속효성 외용 신경 자극제다. 한 번 바르면 16시간 동안 효과가 이어진다.",
		onTakeMessage: "감도 증가 크림을 피부에 문지른다. 오래지 않아 살갗에 스치는 모든 것이 생생하고 산만하게 느껴진다.",
		warning_label: "경고: 하루에 한 번을 넘게 바르지 마십시오. 이 크림은 사용 중인 감도 저하 크림의 효과를 대체합니다.",
		indicators: ["<span class='hpi_indic_green'>+++ Sensitivity</span>"],
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_doseTaken() {
			const medication = getSensitivityMedication();
			const hours = sensitivityMedicationRemainingHours();
			return medication?.type === this.subtype ? `효과 지속: ${hours}시간${hours === 1 ? "" : ""}` : "사용하지 않음";
		},
		type: "sensitivity",
		subtype: "stimulant",
		shape: "cream",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/cream.png",
		hpi_take_pills() {
			return "크림 바르기";
		},
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 && getSensitivityMedication()?.type !== this.subtype ? 1 : 0;
		},
		take_blocked_reason() {
			return this.doseTaken() > 0 ? "라벨에는 하루에 한 번만 바르도록 되어 있습니다." : "이 크림은 이미 효과가 이어지는 중입니다.";
		},
		effects: [`<<run applySensitivityCream("stimulant")>>`],
	},
	{
		name: "Hair Growth Formula",
		description:
			"머리카락에 직접 바르면 더 빠르고 건강한 성장을 촉진하는 미녹시딜과 기타 성분이 들어 있는 스프레이다. 한 번 사용하면 3일 동안 효과가 지속된다.",
		onTakeMessage: "스프레이를 뿌린다. 머리카락이 빨리 자라는 데 도움이 되기를 바란다.",
		warning_label:
			"경고: 사용 직후 알레르기 반응이 나타나면 의사와 상담하십시오. 스프레이가 입이나 눈에 들어간 경우 즉시 의사에게 연락하십시오.",
		autoTake() {
			return V.sexStats.pills["pills"][this.name].autoTake;
		},
		doseTaken() {
			return V.sexStats.pills["pills"][this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills["pills"][this.name].owned;
		},
		hpi_take_pills() {
			return "머리카락에 바르기";
		},
		hpi_doseTaken() {
			if (V.sexStats.pills["pills"][this.name].doseTaken) {
				return "효과 지속: " + V.sexStats.pills["pills"][this.name].doseTaken + "일";
			} else {
				return "사용하지 않음";
			}
		},
		hpi_take_every_morning() {
			return this.autoTake() ? "자동 사용 중지" : "필요할 때 사용";
		},
		type: "hair",
		subtype: "Hair Growth Formula",
		shape: "spray",
		overdose() {
			return V.sexStats.pills["pills"][this.name].overdose;
		},
		icon: "img/misc/icon/hairspray.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return this.doseTaken() === 0 ? 1 : 0;
		},
		effects: [],
	},
 ];

const homePillDisplayNames = {
	"bottom reduction": "엉덩이 축소제",
	"bottom growth": "엉덩이 성장제",
	"bottom blocker": "엉덩이 성장 억제제",
	"breast reduction": "가슴 축소제",
	"breast growth": "가슴 성장제",
	"breast blocker": "가슴 성장 억제제",
	"penis reduction": "자지 축소제",
	"penis growth": "자지 성장제",
	"penis blocker": "자지 성장 억제제",
	"fertility booster": "배란 유도제",
	contraceptive: "피임약",
	"Anti-Parasite Cream": "기생충 방지 크림",
	"asylum's prescription": "정신병원 처방약",
	"Dr Harper's prescription": "하퍼 의사의 처방약",
	"Hair Growth Formula": "모발 성장제",
};

function homePillDisplayName(name) {
	return homePillDisplayNames[name] || name;
}

// ToDo: figure out a means to allow applying the Hair Growth Formula to pubic hair as well

function generateHomePillsInventory() {
	// Render before history navigation can remove the medicine drawer.
	$(document).one(":passageend", function () {
		T.disableGridClick = false;
		for (const item of setup.pills) {
			/* X-Change inventory belongs to the real player, not temporary historical/dream bodies. */
			if (item.type === "xchange" && V.statFreeze) continue;
			if (item.display_condition() === 1) window.addElementToGrid(item);
		}
	});
}
window.generateHomePillsInventory = generateHomePillsInventory;

function addElementToGrid(item) {
	const hpiGridContainer = document.getElementById("homeMainPillContainer");

	const itemName = item.name[0].toUpperCase() + item.name.slice(1);
	hpiGridContainer.innerHTML =
		hpiGridContainer.innerHTML +
		`
			<div class="hpi_item">
				<div class="hpi_icon">${item.frontIcon ? `<img class="icon infront" src="${item.frontIcon}"/>` : ""}<img class="icon" src="${item.icon}"/></div>
				<div class="hpi_name" id="hpi_name_${itemName}">
					${itemDisplayName}
					${item.autoTake() === true ? `<span class="hpi_auto_label"> [자동]</span>` : ""}
				</div>
				<div class="hpi_count" onmouseenter="T.disableGridClick = true" onmouseleave="T.disableGridClick = false">${item.owned()}</div>
			</div>
			`;
	hpiGridContainer.lastElementChild.setAttribute("onclick", "window.onHomePillItemClick(" + "`" + item.name + "`" + ")");
}
window.addElementToGrid = addElementToGrid;

/* The pocket row in a medicine's detail panel. The PC has one personal slot even without a bag. */
function pillBagActionCell(item) {
	if (typeof pocketBagCapacity !== "function" || !pocketAvailable()) return "";
	const name = "`" + item.name + "`";
	return `
						<div class="hpi_action_cell">
							<a id="hpi_pocket_bag" onclick="window.onPillBagClick(${name})">${pillBagActionLabel(item)}</a>
						</div>`;
}
window.pillBagActionCell = pillBagActionCell;

function pillBagActionLabel(item) {
	if (pocketCarrying("pill", item.name)) return "가방에서 꺼내기";
	return "가방에 넣기";
}
window.pillBagActionLabel = pillBagActionLabel;

function onPillBagClick(itemName) {
	const item = setup.pills.find(pill => pill.name === itemName);
	if (!item) return;
	if (!pocketSlotToggle("pill", itemName)) {
		/* The only normal failure is a full carried container; say so instead of doing nothing. */
		const button = document.getElementById("hpi_pocket_bag");
		if (button) button.textContent = `${pocketBagName() === "pocket" ? "주머니" : pocketBagName()}: 가득 참`;
		return;
	}
	const button = document.getElementById("hpi_pocket_bag");
	if (button) button.textContent = pillBagActionLabel(item);
}
window.onPillBagClick = onPillBagClick;

function onHomePillItemClick(itemName) {
	if (!T.disableGridClick) {
		document.getElementById("homeDescPillContainer").style.display = "grid";
		for (const item of setup.pills) {
			if (item.name === itemName) {
				const itemName = "`" + item.name + "`";
				const itemType = "`" + item.type + "`";
				document.getElementById("hpi_desc").outerHTML = `
				<div id="hpi_desc">
					${item.description}
					<div class="hpi_warning_label">${item.warning_label}</div>
					<div id="hpi_desc_action">
						<div class="hpi_action_cell">
							<a id="hpi_take_pills" onclick="window.onTakeClick(${itemName}, ${itemType})">알약 복용</a>
						</div>
						<div class="hpi_action_cell">
							<a id="hpi_take_every_morning" onclick="window.onAutoTakeClick(${itemName}, ${itemType})">매일 아침 복용</a>
						</div>
						${pillBagActionCell(item)}
					</div>
				</div>`;
				window.initPillContextButtons(item);
				document.getElementById("hpi_desc_img").innerHTML =
					(item.frontIcon ? `<img${item.shape === "galenic" ? ` style="margin-left: 17%;"` : ""} class="icon infront" src="${item.frontIcon}"/>` : "") +
					`<img${item.shape === "galenic" ? ` style="margin-left: 17%;"` : ""} src="${item.icon}" />` +
					`<div id="hpi_indicator" class="hpi_indicator"></div>`;
				window.addIndicators(item);
			}
		}
	}
}
window.onHomePillItemClick = onHomePillItemClick;

function addIndicators(item) {
	// Indicators are the "++Control" and "+Awareness" etc. We add them under the pill icon.
	if (item.indicators != null && item.indicators.length > 0 && !V.settings.blindStatsEnabled) {
		for (const indicator of item.indicators) document.getElementById("hpi_indicator").innerHTML += indicator;
	}
}
window.addIndicators = addIndicators;

function initPillContextButtons(item) {
	// create button to "Take everyone morning" / "Stop taking them" (every morning)
	if (item.hpi_take_every_morning) {
		document.getElementById("hpi_take_every_morning").innerHTML = item.hpi_take_every_morning();
	} else {
		document.getElementById("hpi_take_every_morning").innerHTML = item.autoTake() ? "자동 복용 중지" : "매일 아침 복용";
	}

	// Hide auto-use for medication that must be taken manually.
	if (["asylum", "painkiller", "calmoryl", "sensitivity", "sleep", "xchange"].includes(item.type)) {
		document.getElementById("hpi_take_every_morning").className = "hidden"; // prevent 'Take every Morning' option to be displayed for those type of pills
		/* The bag button, when present, takes the freed column, so the panel is only "single" without it. */
		if (!document.getElementById("hpi_pocket_bag")) {
			document.getElementById("hpi_desc_action").classList.add("hpi_action_single"); // readapt css since there's only one button now
		}
	}
	//  Add 'Take pill' button
	document.getElementById("hpi_take_pills").innerHTML = item.hpi_take_pills ? item.hpi_take_pills() : "알약 복용";

	// If the button doesn't exist, create it. If it exists, display the right dose Taken for that pill
	if (document.getElementById("hpi_doseTaken") != null) {
		if (item.hpi_doseTaken) {
			document.getElementById("hpi_doseTaken").outerHTML =
				"<span id='hpi_doseTaken' style='font-size: 0.88em;color: #979797;'> [" + item.hpi_doseTaken() + "]</span>";
		} else {
			// todo: replace style with a proper css class
			document.getElementById("hpi_doseTaken").outerHTML =
				"<span id='hpi_doseTaken' style='font-size: 0.88em;color: #979797;'> [" + item.doseTaken() + "회 복용]</span>";
		}
		// Display today taken doses for specific pill
	} else {
		if (item.hpi_doseTaken) {
			document.getElementById("hpi_take_pills").outerHTML +=
				`<span id="hpi_doseTaken" style="font-size: 0.88em;color: #979797;"> [` + item.hpi_doseTaken() + `]</span>`; // Display today taken doses for specific pill
		} else {
			document.getElementById("hpi_take_pills").outerHTML +=
				`<span id="hpi_doseTaken" style="font-size: 0.88em;color: #979797;"> [` + item.doseTaken() + `회 복용]</span>`; // Display today taken doses for specific pill
		}
	}
	// Check if the player meets the criteria to take the pill.
	if (item.take_condition() === 0) {
		document.getElementById("hpi_take_pills").classList.add("hpi_greyed_out"); // grey the "Take Pill" button out
		document.getElementById("hpi_take_pills").onclick = ""; // disable "Take Pill" onclick event.
		/* Pills can self-report why they're blocked (e.g. X-Change body mismatch) so the grey button isn't unexplained. */
		let blockedReason = typeof item.take_blocked_reason === "function" ? item.take_blocked_reason() : "";
		/* X-Change pills have enough gates that a silent grey button reads as a bug; always say something. */
		if (!blockedReason && item.type === "xchange") blockedReason = "지금 상태에서는 이 알약을 먹을 수 없습니다.";
		if (blockedReason && document.getElementById("hpi_blocked_reason") == null) {
			document
				.getElementById("hpi_desc_action")
				.insertAdjacentHTML("beforebegin", `<div id="hpi_blocked_reason" class="hpi_notice_label">${blockedReason}</div>`);
		}
	}
}
window.initPillContextButtons = initPillContextButtons;

function setLastTaken(type, subtype, fullname = null) {
	if (fullname != null) {
		for (const p of setup.pills) {
			if (p.name === fullname) {
				type = p.type;
				subtype = p.subtype;
			}
		}
	}
	V.sexStats.pills.lastTaken[type] = subtype;
}
window.setLastTaken = setLastTaken;

function redetermineMostTaken(type, subtype, fullname = null) {
	const result = { blocker: 0, growth: 0, reduction: 0 };
	if (fullname != null) {
		for (const p of setup.pills) {
			if (p.name === fullname) {
				type = p.type;
				subtype = p.subtype;
			}
		}
	}
	if (!["breast", "bottom", "penis"].includes(type)) return;
	for (const pill of setup.pills) {
		if (pill.type === type && ["blocker", "growth", "reduction"].includes(pill.subtype)) {
			result[pill.subtype] = pill.doseTaken();
		}
	}
	const ret = result.growth - result.reduction;
	if (ret === 0 && (result.growth > 0 || result.reduction > 0)) {
		// We enter here when growth and reduction pills neutralised each others
		if (result.blocker > 0) return (V.sexStats.pills.mostTaken[type] = "blocker");
		else return (V.sexStats.pills.mostTaken[type] = ["growth", "reduction"].random());
	} else if (ret === 0 && result.blocker > 0)
		// we enter here when player didn't take any growth/blocker but took blockers
		return (V.sexStats.pills.mostTaken[type] = "blocker");
	else if (ret !== 0) {
		// we enter here when there's unbalance between growth/reduction
		if (ret < 0)
			// if reduction won
			return ret + result.blocker >= 0 ? (V.sexStats.pills.mostTaken[type] = "blocker") : (V.sexStats.pills.mostTaken[type] = "reduction");
		// determine if blocker win
		else if (ret > 0)
			// if growth won
			return ret - result.blocker <= 0 ? (V.sexStats.pills.mostTaken[type] = "blocker") : (V.sexStats.pills.mostTaken[type] = "growth"); // determine if blocker win
	}
}
window.redetermineMostTaken = redetermineMostTaken;

function onTakeClick(itemName) {
	V.sexStats.pills["pills"][itemName].owned -= 1;
	AmbienceAudio.effect("meds");

	switch (itemName) {
		case "Anti-Parasite Cream":
			V.sexStats.pills["pills"][itemName].doseTaken += 14;
			break;
		case "Hair Growth Formula":
			V.sexStats.pills["pills"][itemName].doseTaken += 3;
			break;
		case "sensitivity-decreasing cream":
		case "sensitivity-increasing cream":
			V.sexStats.pills["pills"][itemName].doseTaken += 1;
			break;
		default:
			// Stat for total pills consumption
			V.pillsConsumed = (V.pillsConsumed || 0) + 1;
			V.sexStats.pills["pills"][itemName].doseTaken += 1;
			break; // Stat for specific pill consumptionbreak;
	}

	for (const item of setup.pills) {
		if (item.name === itemName) {
			/* The player is swallowing this themselves, so the X-Change Gray Agent trait must not strip its body swap. */
			xchangeVoluntaryDoseBegin();
			try {
				for (const widget of item.effects) // run the widgets associated with a pill
					Wikifier.wikifyEval(typeof widget === "function" ? widget() : widget);
			} finally {
				xchangeVoluntaryDoseEnd();
			}
			V.sexStats.pills.lastTaken[item.type] = item.subtype; // keep track of the category of pill we last took
			V.sexStats.pills.mostTaken[item.type] = window.redetermineMostTaken(item.type, item.subtype);
			const dosesForOverdose =
				item.type === "calmoryl" ? Number(T.calmorylDose) : ["sleep", "painkiller"].includes(item.type) ? pillDosesTodayByType(item.type) : item.doseTaken();
			if (dosesForOverdose > 1 && !item.name.includes("blocker")) {
				switch (item.type) {
					case "parasite":
					case "hair":
						break;
					case "painkiller":
						if (dosesForOverdose > (item.subtype === "prescription pain relief" ? 2 : 3)) {
							V.overdosePillsTaken = item.name;
							Engine.play("PillCollectionPainkillerOverdose");
							return;
						}
						break;
					case "sleep":
						Engine.play("PillCollectionSleepOverdose");
						return;
					case "calmoryl":
						if (Number(T.calmorylDose) >= 5) {
							Engine.play("PillCollectionCalmorylPassOut");
							return;
						}
						break;
					case "pregnancy":
						V.overdosePillsTaken = item.name;
						Engine.play("PillCollectionSecondDosePregnancy");
						return;
					case "xchange":
						break;
					default:
						Engine.play("PillCollectionSecondDose");
						return;
				}
			}
			/* Temporary therapy and permanent X-Change purity neutralise the pill while still recording its consumption. */
			V.lastPillTakenDescription = xchangePillNeutralised(item)
				? "알약을 삼키지만, 아무것도 남기지 않고 녹아 사라진다. 당신의 저항력이 효과가 자리 잡기도 전에 무력화해 버려, 몸은 조금도 변하지 않는다."
				: typeof item.onTakeMessage === "function"
				? item.onTakeMessage()
				: item.onTakeMessage;
		}
	}
	Engine.play("Take Pill From Medicine Drawer");
}
window.onTakeClick = onTakeClick;

function onTakeClickSilent(itemName) {
	if (!setup.pills.find(pill => pill.name === itemName)) return;
	if (!V.sexStats?.pills?.pills?.[itemName]) return;
	if ((V.sexStats.pills.pills[itemName].owned || 0) <= 0) return false;

	V.sexStats.pills.pills[itemName].owned -= 1;

	switch (itemName) {
		case "Anti-Parasite Cream":
			V.sexStats.pills.pills[itemName].doseTaken += 14;
			break;
		case "Hair Growth Formula":
			V.sexStats.pills.pills[itemName].doseTaken += 3;
			break;
		case "sensitivity-decreasing cream":
		case "sensitivity-increasing cream":
			V.sexStats.pills.pills[itemName].doseTaken += 1;
			break;
		default:
			V.pillsConsumed = (V.pillsConsumed || 0) + 1;
			V.sexStats.pills.pills[itemName].doseTaken += 1;
			break;
	}

	for (const item of setup.pills) {
		if (item.name === itemName) {
			/* Deliberate dose: exempt from the X-Change Gray Agent trait, which only neuters pills forced on the player. */
			xchangeVoluntaryDoseBegin();
			try {
				for (const widget of item.effects) {
					Wikifier.wikifyEval(typeof widget === "function" ? widget() : widget);
				}
			} finally {
				xchangeVoluntaryDoseEnd();
			}

			V.sexStats.pills.lastTaken[item.type] = item.subtype;
			V.sexStats.pills.mostTaken[item.type] = window.redetermineMostTaken(item.type, item.subtype);
			/* Temporary therapy and permanent X-Change purity neutralise the pill while still recording its consumption. */
			V.lastPillTakenDescription = xchangePillNeutralised(item)
				? "알약을 삼키지만, 아무것도 남기지 않고 녹아 사라진다. 당신의 저항력이 효과가 자리 잡기도 전에 무력화해 버려, 몸은 조금도 변하지 않는다."
				: typeof item.onTakeMessage === "function"
				? item.onTakeMessage()
				: item.onTakeMessage;

			/* Reuse original daily notice path */
			V.pillsTaken = 1;

			return true;
		}
	}

	return false;
}
window.onTakeClickSilent = onTakeClickSilent;

function getCalmorylEffect() {
	if ((!V.calmoryl || typeof V.calmoryl !== "object") && V.calmorylDissociationUntil !== undefined) {
		const legacyEndsAt = Number(V.calmorylDissociationUntil);
		delete V.calmorylDissociationUntil;
		if (Number.isFinite(legacyEndsAt) && legacyEndsAt > V.timeStamp) {
			const dailyDoses = Number(V.sexStats?.pills?.pills?.["anti-anxiety tablets"]?.doseTaken) || 0;
			V.calmoryl = { endsAt: legacyEndsAt, doses: Math.max(3, dailyDoses) };
		}
	} else if (V.calmorylDissociationUntil !== undefined) {
		delete V.calmorylDissociationUntil;
	}

	const effect = V.calmoryl;
	if (!effect || typeof effect !== "object" || !Number.isFinite(Number(effect.endsAt)) || !Number.isFinite(Number(effect.doses))) return null;
	effect.endsAt = Number(effect.endsAt);
	effect.doses = Math.max(3, Math.floor(Number(effect.doses)));
	return effect;
}
window.getCalmorylEffect = getCalmorylEffect;

function calmorylDissociationActive() {
	const effect = getCalmorylEffect();
	return !!effect && effect.endsAt > V.timeStamp;
}
window.calmorylDissociationActive = calmorylDissociationActive;

function calmorylDissociationRemainingHours() {
	const effect = getCalmorylEffect();
	return effect && effect.endsAt > V.timeStamp ? Math.ceil((effect.endsAt - V.timeStamp) / 3600) : 0;
}
window.calmorylDissociationRemainingHours = calmorylDissociationRemainingHours;

function updateCalmorylDissociation() {
	const effect = getCalmorylEffect();
	if (effect && effect.endsAt > V.timeStamp) {
		V.dissociation = 2;
		return;
	}
	if (V.calmoryl !== undefined) {
		delete V.calmoryl;
		statChange.updatePlayerTraumaState();
	}
}
window.updateCalmorylDissociation = updateCalmorylDissociation;

function takeCalmoryl() {
	const record = V.sexStats?.pills?.pills?.["anti-anxiety tablets"];
	if (!record) return;

	V.trauma *= 0.7;
	statChange.trauma(0);
	statChange.stress(-3);

	const currentEffect = getCalmorylEffect();
	const activeEffect = currentEffect && currentEffect.endsAt > V.timeStamp ? currentEffect : null;
	const doses = activeEffect ? activeEffect.doses + 1 : Number(record.doseTaken) || 0;
	T.calmorylDose = doses;
	if (doses >= 2) {
		statChange.tiredness(doses === 2 ? 10 : 18);
		statChange.awareness(doses === 2 ? -1 : -2);
	}

	if (doses >= 3) {
		V.calmoryl = {
			endsAt: Math.max(activeEffect ? activeEffect.endsAt : 0, V.timeStamp) + 3 * 3600,
			doses,
		};
		V.dissociation = 2;
	}
}
window.takeCalmoryl = takeCalmoryl;

function canAutoTakeDailyPills() {
	if (V.statFreeze || V.molestationstart === 1 || V.combat) return false;

	const badEnds = V.badEndStats;
	const latestBadEnd = Array.isArray(badEnds) && badEnds.length ? badEnds[badEnds.length - 1] : null;
	if (latestBadEnd && !latestBadEnd.trackedEnd) return false;
	if (
		["island", "pirate_ship"].includes(V.location) ||
		(V.location === "cabin" && V.syndromeeden >= 1) ||
		((V.waterdragonJourneyDay || 0) !== 0 && ["sea", "seabeach"].includes(V.location))
	)
		return false;

	return (
		["home", "alex_cottage", "asylum", "prison"].includes(V.location) ||
		(V.location === "temple" && V.wardrobes?.temple?.unlocked) ||
		(V.location === "avery_mansion" && !["fallen", "kicked"].includes(V.avery_fate)) ||
		(V.location === "flats" && V.bus === "poppy_bedroom")
	);
}
window.canAutoTakeDailyPills = canAutoTakeDailyPills;

function autoTakeDailyPills() {
	if (!setup?.pills || !V.sexStats?.pills?.pills || !canAutoTakeDailyPills()) return;

	const categories = ["bottom", "breast", "penis", "pregnancy", "parasite", "hair", "harper"];

	for (const category of categories) {
		let chosen = null;

		for (const pill of setup.pills) {
			if (!pill || pill.type !== category) continue;
			if (typeof pill.autoTake !== "function") continue;
			if (pill.autoTake() !== true) continue;

			chosen = pill;
			break;
		}

		if (!chosen) continue;
		if (typeof chosen.take_condition === "function" && chosen.take_condition() !== 1) continue;

		if (typeof chosen.owned === "function" && chosen.owned() <= 0) {
			V.sexStats.pills.pills[chosen.name].autoTake = false;
			continue;
		}

		if (!onTakeClickSilent(chosen.name)) continue;
		/* Stamp the day, or the per-passage check retakes the pill until take_condition blocks it (a daily overdose). */
		V.pillsTakenOn = Time.monthDay.toString() + Time.month + Time.year.toString();
		V.effectsmessage = 1;
		if (chosen.owned() <= 0) {
			V.sexStats.pills.pills[chosen.name].autoTake = false;
			V.pillsTakenLast = 1;
		}
	}
}
window.autoTakeDailyPills = autoTakeDailyPills;

function onAutoTakeClick(itemName, itemType) {
	if (itemType === "xchange") return;

	for (const item in setup.pills) {
		if (setup.pills[item].name === itemName) {
			V.sexStats.pills["pills"][itemName].autoTake = !V.sexStats.pills["pills"][itemName].autoTake; // toggle auto take
			window.initPillContextButtons(setup.pills[item]); // change "Take every morning" button to "Stop taking them"
		} else if (["breast", "penis", "bottom", "pregnancy"].includes(itemType) && setup.pills[item].type === itemType)
			V.sexStats.pills["pills"][setup.pills[item].name].autoTake = false; // disable auto takes for other similar pills(bottom/penis/breast etc)
	}
	window.syncAutoTakeDisplayedState();
}
window.onAutoTakeClick = onAutoTakeClick;

function syncAutoTakeDisplayedState() {
	// Add or remove [Auto] tag from pill names in the pills menu
	for (const item of setup.pills) {
		const capitalisedName = item.name[0].toUpperCase() + item.name.slice(1);
		if (document.getElementById("hpi_name_" + capitalisedName) != null) {
			document.getElementById("hpi_name_" + capitalisedName).innerHTML = homePillDisplayName(item.name);
			document.getElementById("hpi_name_" + capitalisedName).innerHTML += item.autoTake() === true ? "<span class='hpi_auto_label'> [자동]</span>" : "";
		}
	}
}
window.syncAutoTakeDisplayedState = syncAutoTakeDisplayedState;

function onSecondDoseTakenSetVars() {
	// If player take two doses of anything but blocker/pregnancy/harper/asylum pills, determine the risk stat and
	let doseTaken = { bottom: 0, penis: 0, breast: 0 };

	T.risk = 0;
	T.pillAmountOfCategoriesUsed = 0;
	for (const item of setup.pills) {
		// determine how many pills of each have been taken.
		if (["bottom", "penis", "breast"].includes(item.type)) doseTaken[item.type] += item.doseTaken();
	}
	const sumValues = obj => Object.values(obj).reduce((a, b) => a + b); // count every doses
	let i = -1;
	const doseTakenSum = sumValues(doseTaken); // store the count in this variable
	while (++i < doseTakenSum)
		// for each dose count, increase the overall risk.
		T.risk += random(3, 10); // For each dose found, add 3-10 risk points.
	doseTaken = [
		["bottom", doseTaken["bottom"]],
		["penis", doseTaken["penis"]],
		["breast", doseTaken["breast"]],
	]; // Changed object to array as it's easier to sort.
	for (const array of doseTaken) {
		if (array[1] > 0) T.pillAmountOfCategoriesUsed += 1; // How many different categories of pills we took ?
	}
	i = -1;
	while (++i < doseTaken.length - 1) {
		// sort categories that got the most doses
		if (doseTaken[i][1] < doseTaken[i + 1][1]) {
			const tmp = doseTaken[i];

			doseTaken[i] = doseTaken[i + 1];
			doseTaken[i + 1] = tmp;
			i = -1;
		}
	}
	i = doseTaken[0][1] > doseTaken[1][1] ? 1 : doseTaken[0][1] === doseTaken[1][1] ? 2 : doseTaken[0][1] === doseTaken[2][1] ? 3 : 1; // determine how many have same value
	const chosen = random(0, i - 1);
	V.pillCat = doseTaken[chosen][0]; // select random category among the 1st ones
	T.secondaryPill = chosen > 0 ? doseTaken[chosen - 1][0] : doseTaken[chosen + 1][0]; // select second category
}
window.onSecondDoseTakenSetVars = onSecondDoseTakenSetVars;

function ensurePillInventoryRecords(pills) {
	if (!pills || typeof pills !== "object") return;
	for (const item of setup.pills) {
		if (!pills[item.name] || typeof pills[item.name] !== "object") {
			pills[item.name] = { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 };
		} else {
			Object.assign(pills[item.name], {
				autoTake: pills[item.name].autoTake === true,
				doseTaken: Number.isFinite(Number(pills[item.name].doseTaken)) ? Number(pills[item.name].doseTaken) : 0,
				owned: Number.isFinite(Number(pills[item.name].owned)) ? Number(pills[item.name].owned) : 0,
				overdose: Number.isFinite(Number(pills[item.name].overdose)) ? Number(pills[item.name].overdose) : 0,
			});
		}
	}
}
window.ensurePillInventoryRecords = ensurePillInventoryRecords;

function backCompPillsInventory() {
	/* Return immediately if $sexStats doesn't exist. */
	if (typeof V.sexStats === "undefined") return;
	const oPills = V.sexStats.pills;
	const pills = {};
	if (typeof oPills === "object") {
		/* If our $sexStats.pills is an object and has this property, it is ready for production. */
		/* Man on the internet said this is right */
		if (typeof oPills.mostTaken === "object") {
			oPills.pills ??= {};
			ensurePillInventoryRecords(oPills.pills);
			return;
		}
	}
	Object.assign(pills, {
		"bottom reduction": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"bottom growth": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"bottom blocker": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"breast reduction": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"breast growth": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"breast blocker": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"penis reduction": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"penis growth": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"penis blocker": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"anti-parasite": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"fertility booster": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		contraceptive: { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"asylum's prescription": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"Dr Harper's prescription": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"Anti-Parasite Cream": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"sensitivity-decreasing cream": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
		"sensitivity-increasing cream": { autoTake: false, doseTaken: 0, owned: 0, overdose: 0 },
	});
	if (typeof oPills === "object") {
		try {
			pillsObjectRepair(oPills, pills);
		} catch (error) {
			Errors.report("Compatibility patch for pills object failed: " + error, { oPills, pills });
		}
	}
	ensurePillInventoryRecords(pills);
	if (typeof oPills === "undefined") {
		/* If our $sexStats.pills was empty, simply set the object in preparation to assign. */
		V.sexStats.pills = {};
	}
	Object.assign(V.sexStats.pills, {
		boughtOnce: oPills?.boughtOnce === true,
		lastTaken: { bottom: "", breast: "", penis: "", pregnancy: "" },
		mostTaken: { bottom: "", breast: "", penis: "", pregnancy: "" },
		pills,
	});
}
window.backCompPillsInventory = backCompPillsInventory;

function pillsObjectRepair(oPills, pills) {
	/* if the variable already exist and is not of the new version(new version has "mostTaken" property that's why we check it),
	then we try to port the old one to the new one */
	if (typeof oPills.bottom === "object") {
		Object.assign(pills, {
			"bottom reduction": { autoTake: oPills.bottom.autoTake === "reduction", owned: oPills.bottom.owned.reduction },
			"bottom growth": { autoTake: oPills.bottom.autoTake === "growth", owned: oPills.bottom.owned.growth },
			"bottom blocker": { autoTake: oPills.bottom.autoTake === "blocker", owned: oPills.bottom.owned.blocker },
		});
		delete oPills.bottom;
	}
	if (typeof oPills.breast === "object") {
		Object.assign(pills, {
			"breast reduction": { autoTake: oPills.breast.autoTake === "reduction", owned: oPills.breast.owned.reduction },
			"breast growth": { autoTake: oPills.breast.autoTake === "growth", owned: oPills.breast.owned.growth },
			"breast blocker": { autoTake: oPills.breast.autoTake === "blocker", owned: oPills.breast.owned.blocker },
		});
		delete oPills.breast;
	}
	if (typeof oPills.penis === "object") {
		Object.assign(pills, {
			"penis reduction": { autoTake: oPills.penis.autoTake === "reduction", owned: oPills.penis.owned.reduction },
			"penis growth": { autoTake: oPills.penis.autoTake === "growth", owned: oPills.penis.owned.growth },
			"penis blocker": { autoTake: oPills.penis.autoTake === "blocker", owned: oPills.penis.owned.blocker },
		});
		delete oPills.penis;
	}
	if (typeof V.asylumpills === "number") {
		Object.assign(pills, {
			"asylum's prescription": { owned: Number.isInteger(V.asylumpills) ? V.asylumpills : 0 },
		});
		delete V.asylumpills;
	}
	if (typeof V.pills === "number") {
		Object.assign(pills, {
			"Dr Harper's prescription": { owned: Number.isInteger(V.pills) ? V.pills : 0 },
		});
		delete V.pills;
	}
}

function determineAutoTakePill(category) {
	T.autoTakeDetermined = null;
	if (category === "xchange") return;

	for (const pill of setup.pills) {
		if (pill.type === category && pill.autoTake() === true) {
			T.autoTakeDetermined = pill.name;
			return;
		}
	}
}
window.determineAutoTakePill = determineAutoTakePill;

function resetAllDoseTaken() {
	for (const pill in V.sexStats.pills["pills"]) {
		switch (pill) {
			case "Anti-Parasite Cream":
			case "fertility booster":
			case "contraceptive":
			case "Hair Growth Formula":
				if (V.sexStats.pills["pills"][pill].doseTaken > 0) {
					V.sexStats.pills["pills"][pill].doseTaken--;
				}
				break;
			default:
				V.sexStats.pills["pills"][pill].doseTaken = 0;
				break;
		}
	}
}
window.resetAllDoseTaken = resetAllDoseTaken;

function resetLastTaken() {
	V.sexStats.pills.lastTaken = { bottom: "", breast: "", penis: "", pregnancy: "" };
}
window.resetLastTaken = resetLastTaken;

function resetMostTaken() {
	V.sexStats.pills.mostTaken = { bottom: "", breast: "", penis: "", pregnancy: "" };
}
window.resetMostTaken = resetMostTaken;

function getAllPills() {
	for (const item of Object.keys(V.sexStats.pills.pills)) V.sexStats.pills.pills[item].owned = 14;
}
window.getAllPills = getAllPills;

function hasPillsTaken(type) {
	if (!setup.pills.find(pill => pill.name === type)) return Errors.report("Couldn't find pills", type);
	return V.sexStats.pills.pills?.[type]?.doseTaken || 0;
}
window.hasPillsTaken = hasPillsTaken;
