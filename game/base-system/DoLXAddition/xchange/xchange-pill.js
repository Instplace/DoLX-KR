/* globals npcStartingSexIs npcIsXChanged xchangePillProtectionActive getActivePregnancies canBeMPregnant knowsPregnancy */
/* ============================================================
   X-CHANGE PILL DEFINITIONS  (all of them)
   This file now owns every X-Change pill object, migrated out of bedroom-pills.js so that file stays purely vanilla. 
   It contains:
     1. the gray (effect-only) pills, built from a factory + data table;
     2. the coloured / suspicious / utility pills, as literal objects (appended at the bottom via a second setup.pills.push).

   --- GRAY (effect-only) section ---
   This module contains ONLY the gray pill catalogue. 
   It relies on the surrounding X-Change system rather than re-declaring any of it:
     - Inventory records are created by ensurePillInventoryRecords(), which lives in bedroom-pills.js (it already loops over setup.pills, so the pills pushed below auto-register for new AND existing saves).
     - Effect names resolve through setup.xchangeEffectFlag() (xchange.js) and <<xchange-addeffect>> (xchange.twee).
*/

/* coloured-pill body gate
   X-Change rewrites $player.sex (anatomy) and never touches $player.gender (identity),
   so suitability is judged on sex: cuntboys and dickgirls can take whatever their current body can actually be changed from.
   
   Pills always stay listed in the medicine drawer while owned, an unsuitable pill greys out for the player but can still be fed to NPCs.
   allowDualGenitals keeps the old Alpha/Omega/NOW exception where a body with both sets of genitals may take the pill regardless. */
function xchangePillSuitsBody(color, allowDualGenitals = false) {
	const redundantSex = color === "pink" ? "f" : "m";
	if (V.player.sex !== redundantSex) return true;
	return allowDualGenitals && !!(V.player.penisExist && V.player.vaginaExist);
}
window.xchangePillSuitsBody = xchangePillSuitsBody;

function xchangePillBlockedReason(color, allowDualGenitals = false) {
	if (xchangePillSuitsBody(color, allowDualGenitals)) return "";
	return "이 제형은 지금 당신의 몸에 바꿀 것이 없어서 삼켜 봐야 낭비입니다. 다른 사람에게 먹이는 것은 가능합니다.";
}
window.xchangePillBlockedReason = xchangePillBlockedReason;

/* pregnancy gate
   Any active pregnancy blocks body-changing X-Change doses, no matter how the pill is given.
   This includes vaginal, anal, parasite, and egg pregnancies.
   Invalid pregnancy records are ignored so they cannot block the player forever. If the player does not know they are pregnant yet, keep the reason vague.
*/
function xchangeBlockingPregnancy() {
	for (const pregnancy of getActivePregnancies("pc")) {
		/* A record for an orifice this body no longer has can never end, so it can't be allowed to block doses forever. */
		if (pregnancy.orifice === "vagina" && !V.player?.vaginaExist) continue;
		return pregnancy;
	}
	return undefined;
}
window.xchangeBlockingPregnancy = xchangeBlockingPregnancy;

/* Parasite broods live on $sexStats[orifice].pregnancy rather than in the $pregnancies records, so they need their own look. */
function xchangeParasitesBlockPill() {
	return ["vagina", "anus"].some(orifice => {
		if (orifice === "vagina" && !V.player?.vaginaExist) return false;
		const pregnancy = V.sexStats?.[orifice]?.pregnancy;
		return !!(pregnancy && pregnancy.type === "parasite" && pregnancy.fetus?.length);
	});
}
window.xchangeParasitesBlockPill = xchangeParasitesBlockPill;

function xchangePregnancyBlocksPill() {
	/* A clutch waiting to be laid needs no check of its own: eggs stay an active record until they leave the body. */
	return !!xchangeBlockingPregnancy() || xchangeParasitesBlockPill();
}
window.xchangePregnancyBlocksPill = xchangePregnancyBlocksPill;

/* Drawer message for a blocked dose. Unknown pregnancies and parasite broods use a vague message. */
function xchangePregnancyReason(pregnancy) {
	const vague = "당신 몸의 화학 작용이 이 화합물을 거부합니다. 지금은 효과가 자리 잡지 못할 것입니다.";
	if (!pregnancy) return vague;
	const pregnancyId = pregnancy.pregnancyId ?? V.pregnancies.indexOf(pregnancy);
	/* knowsPregnancy reads the record's awareness lists directly. A half-written record would throw and take the whole drawer with it, so check first. */
	const readable = Array.isArray(V.pregnancies?.[pregnancyId]?.awareOfPregnancy);
	const known = readable && typeof knowsPregnancy === "function" && knowsPregnancy(pregnancyId, "pc");
	return known ? "X-체인지 화합물은 아이를 품은 몸을 바꾸지 못합니다. 알약을 먹어도 아무 일도 일어나지 않습니다." : vague;
}

function xchangePregnancyBlockedReason() {
	if (!xchangePregnancyBlocksPill()) return "";
	return xchangePregnancyReason(xchangeBlockingPregnancy());
}
window.xchangePregnancyBlockedReason = xchangePregnancyBlockedReason;

/* Reverting must preserve carrying bodies just like a new body-changing dose. */

function xchangePregnancyBlocksRevert() {
	return xchangePregnancyBlocksPill();
}
window.xchangePregnancyBlocksRevert = xchangePregnancyBlocksRevert;

function xchangeRevertPregnancyBlockedReason() {
	return xchangePregnancyBlockedReason();
}
window.xchangeRevertPregnancyBlockedReason = xchangeRevertPregnancyBlockedReason;

/* standard transformation check
Used by pills that start a transformation. Checks body requirements, active transformations, and pregnancy. Use null if the pill works with any body. */
function xchangeCanStartTransform(color = null, allowDualGenitals = false) {
	if (color && !xchangePillSuitsBody(color, allowDualGenitals)) return false;
	return !playerIsXChanged() && !xchangePregnancyBlocksPill();
}
window.xchangeCanStartTransform = xchangeCanStartTransform;

function xchangeTransformBlockedReason(color = null, allowDualGenitals = false) {
	if (color) {
		const bodyReason = xchangePillBlockedReason(color, allowDualGenitals);
		if (bodyReason) return bodyReason;
	}
	if (playerIsXChanged()) return "당신은 이미 X-체인지 알약의 효과 아래에 있습니다. 효과가 다할 때까지 기다리거나 해독제를 먹으십시오.";
	return xchangePregnancyBlockedReason();
}
window.xchangeTransformBlockedReason = xchangeTransformBlockedReason;

/* SWP anti-pill gate
   Counter-agents only work on active, tested effects. Untested pills never reveal their effects. */
function xchangeAntiPillBlockedReason(...effectFlags) {
	if (!playerIsXChanged()) return "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
	if (!V.xchange.pill.effectsKnown) return "현재 복용한 알약이 어떤 작용을 하는지 알지 못합니다. 대항제를 먹기 전에 검사부터 하십시오.";
	if (effectFlags.some(flag => !V.xchange.pill[flag])) return "현재 복용한 알약에는 그 효과가 없으므로 이 알약이 취소할 것이 없습니다.";
	return "";
}
window.xchangeAntiPillBlockedReason = xchangeAntiPillBlockedReason;

/* protection gate
   Harper's treatment and the permanent purity trait stop an X-Change pill taking hold, so the drawer reports the dose as neutralised.
   They only apply to pills that would start or extend a transformation. The support pills (antidotes, SWP anti-pills and the test strip)
   act on a session that is already running and keep working normally, so they must not claim to have dissolved to nothing. */
const xchangeSupportSubtypes = ["antidote", "anti-pill", "test"];
function xchangePillNeutralised(item) {
	if (!item || item.type !== "xchange" || xchangeSupportSubtypes.includes(item.subtype)) return false;
	return xchangePillProtectionActive();
}
window.xchangePillNeutralised = xchangePillNeutralised;

/* Sex of the body the player returns to when no pill is active.
Suspicious pills can only be taken untransformed, so sellers picking a colour for the player must use this instead of V.player.sex, which reflects the current (possibly X-Changed) body. */
function xchangePlayerBaseSex() {
	if (playerIsXChanged()) {
		const origSex = V.xchange?.pill?.originalBody?.sex;
		if (["m", "f"].includes(origSex)) return origSex;
	}
	return V.player.sex;
}
window.xchangePlayerBaseSex = xchangePlayerBaseSex;

function makeGrayXChangePill(cfg) {
	return {
		name: cfg.name,
		description: cfg.description,
		onTakeMessage: cfg.onTakeMessage,
		warning_label: cfg.warning_label,
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: cfg.subtype,
		color: "gray",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: cfg.icon || "img/misc/icon/xchange-gray.png",
		/* Owned pills always stay visible in the drawer. If they can't be used yet, they grey out instead of disappearing. This prevents pills like Resistance and Continue from looking lost after purchase. */
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		/* Only standalone gray doses with the optional body swap need the pregnancy gate. */
		take_condition() {
			if (!cfg.canTake()) return 0;
			if (!grayPillIsStackOnly(cfg) && !playerIsXChanged() && V.xchange.grayPillGenderflip && xchangePregnancyBlocksPill()) return 0;
			return 1;
		},
		take_blocked_reason() {
			if (!cfg.canTake()) return cfg.blockedReason || "";
			if (!grayPillIsStackOnly(cfg) && !playerIsXChanged() && V.xchange.grayPillGenderflip) return xchangePregnancyBlockedReason();
			return "";
		},
		effects: cfg.effects,
	};
}
/* Stack-only gray pills act on a dose that's already running (Resistance, Continue), so the pregnancy gate skips them. */
function grayPillIsStackOnly(cfg) {
	return cfg.canTake === grayGate.activeSession;
}

window.makeGrayXChangePill = makeGrayXChangePill;

/* shared gate helpers (read at click time) */
const grayGate = {
	always: () => true,
	hasVagina: () => !!V.player.vaginaExist,
	/* These ask only whether the body could conceive at all. Effect-only doses remain available while carrying. */
	canConceive: () => !!V.player.vaginaExist,
	/* Omega (or another mpreg source) lets a vagina-less body conceive anally. */
	canConceiveAnally: () => typeof canBeMPregnant === "function" && canBeMPregnant(),
	canConceiveAnyHole: () => grayGate.canConceive() || grayGate.canConceiveAnally(),
	betaEligible: () => !!V.player.vaginaExist,
	/* The fertility course also potentiates sperm, so a penis qualifies on its own. */
	fertilityCourse: () => grayGate.hasPenis() || grayGate.canConceiveAnyHole(),
	hasPenis: () => !!V.player.penisExist,
	/* xtend pays out on the body you RETURN to, so allow it if you currently have a penis or your saved base body did. */
	xtendEligible: () => !!V.player.penisExist || (V.xchange.pill?.baseGenitals && V.xchange.pill.baseGenitals.penis),
	portalEnabled: () => !!V.portalPantiesEnabled,
	/* Resistance & Continue act on the running session's duration/permanence, so any active session qualifies (stack-only). */
	activeSession: () => playerIsXChanged(),
};

/* the data table: one row per effect
   duration is in days; it's the timer the pill starts/extends to. */
function buildGrayXChangePills() {
	const teal = msg => `<span class="teal">무색 알약을 삼킨다.</span><br><br>${msg}`;
	const rows = [
		{
			name: "X-Change Breeder",
			subtype: "gray breeder",
			description:
				"무색의 X-체인지 캡슐로, 브리더 성분만 들어 있다. 가임력이 높아지고 정액을 받고 싶은 욕구가 강해진다. 지금 가진 몸에 그대로 작용한다.",
			onTakeMessage: teal(
				"처음에는 별일이 없다. 그러다 묵직하고 낮은 온기가 아랫배로 퍼진다. 몸이 결코 잊어서는 안 될 목적을 문득 떠올린 것만 같다. 숨이 얕아진다."
			),
			warning_label: "경고: 효과가 나타나려면 임신할 수 있는 몸이어야 합니다. 임신하면 진행 중인 변화가 영구적으로 굳을 수 있습니다.",
			canTake: grayGate.canConceiveAnyHole,
			blockedReason: "지금 임신할 수 있는 몸이나 가임 상태의 자궁이 필요합니다. 그런 몸이 될 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "breeder" "fertile">>`],
		},
		{
			name: "X-Change Bull",
			subtype: "gray bull",
			description:
				"무색의 X-체인지 캡슐로, 불 성분만 들어 있다. 쉬지 않고 교미하며 번식하고 싶은 충동과 더 많은 기본 최대 정액량을 준다. 지금 가진 몸에 그대로 작용한다.",
			onTakeMessage: teal(
				"다리 사이에 무거운 열기가 모인다. 맥박이 거칠고 다급해진다. 무디고 짐승 같은 확신이 생각 속으로 비집고 들어온 듯하다. 교미하고, 쏟아내고, 무언가에 자신의 흔적을 남길 준비가 된 느낌이다."
			),
			warning_label: "경고: 효과가 나타나려면 자지가 있어야 합니다.",
			canTake: grayGate.hasPenis,
			blockedReason: "지금 가진 몸에 자지가 없으면 아무 효과도 없습니다. 자지가 생길 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "bull">>`],
		},
		{
			name: "X-Change Omega",
			subtype: "gray omega",
			description:
				"무색의 X-체인지 캡슐로, 오메가 성분만 들어 있다. 항문 임신이 가능해지고, 항문에 집중된 삽입 사정 유발형 쾌감이 생긴다. 지금 가진 몸에 그대로 작용한다.",
			onTakeMessage: teal(
				"낮고 따뜻한 기운이 배 깊은 곳에서 감겨 오르더니 더 아래로 가라앉는다. 낯설고 집요하다. 몸에 생명을 품을 새로운 자리가 생기고, 채워 주기를 바라는 새로운 욕구가 생긴 것만 같다."
			),
			warning_label: "경고: 지속되는 동안 항문 임신이 가능해집니다. 임신하면 진행 중인 변화가 영구적으로 굳을 수 있습니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 7 "omega">>`],
		},
		{
			name: "X-Change Alpha",
			subtype: "gray alpha",
			description:
				"무색의 X-체인지 캡슐로, 알파 성분만 들어 있다. 매듭 달린 자지, 사정 전에 상대 안에 파묻혀야 한다는 욕구, 더 많은 기본 최대 정액량을 준다. 지금 가진 몸에 그대로 작용한다.",
			onTakeMessage: teal(
				"자지에 압력이 차오른다. 단순한 흥분이 아니라 형태이자 목적이며, 그대로 맞물려 잠기고 싶다는 묵직한 욕구다. 누군가의 안에 들어가지 않으면 사정이 쉽게 오지 않으리라는 확신에 엉덩이가 저절로 움찔한다."
			),
			warning_label:
				"경고: 효과가 나타나려면 자지가 있어야 합니다. 삽입을 시작하는 것에 대한 평소의 거리낌을 무시하게 하며, 자지를 쓸 수 있는 동안에는 받아들이는 쪽의 발정 충동보다 우선합니다.",
			canTake: grayGate.hasPenis,
			blockedReason: "지금 가진 몸에 자지가 없으면 아무 효과도 없습니다. 자지가 생길 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "alpha">>`],
		},
		{
			name: "X-Change Beta",
			subtype: "gray beta",
			description:
				"무색의 X-체인지 캡슐로, 베타 성분만 들어 있다. 질 쪽 생식관을 각각 따로 임신하고 출산할 수 있는 두 개의 기능하는 자궁으로 나눈다. 지금 가진 질이 있는 몸에 그대로 작용한다.",
			onTakeMessage: teal(
				"보지 뒤쪽에 깊은 압력이 모인다. 압력이 천천히 갈라지며 따뜻한 두 점이 된다. 몸에 생명이 자리 잡을 곳이 이제 두 군데 따로 있다는 기묘한 확신이 든다."
			),
			warning_label: "경고: 질이 있어야 합니다. 두 자궁은 서로 다른 때에 임신할 수 있으며, 임신마다 따로 출산해야 합니다.",
			canTake: grayGate.betaEligible,
			blockedReason: "효과가 나타나려면 질과 쓸 수 있는 자궁이 필요합니다. 그런 몸이 될 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "beta">>`],
		},
		{
			name: "X-Change Swell",
			subtype: "gray swell",
			description: "무색의 X-체인지 캡슐로, 부풀기 성분만 들어 있다. 가장 눈에 띄는 부위를 최대치까지 부풀린다.",
			onTakeMessage: teal(
				"팽팽한 압력이 피부 아래에 모인다. 처음에는 희미하게 따끔거리다가, 몸이 화합물이 좋아하는 모든 부위에서 차오르기 시작하면서 느린 욱신거림으로 깊어진다. 움직일 때마다 자신의 무게와 부드러움, 몸매를 새삼 의식하게 된다."
			),
			warning_label: "경고: 지금 가진 몸에 그대로 작용합니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 1 "swell">>`],
		},
		{
			name: "X-Change Hyper Fertility",
			subtype: "gray hyper fertility",
			description:
				"무색의 캡슐로, 하이퍼 퍼틸리티 과정만 들어 있다. 거의 확실한 임신, 가속된 임신 진행, 높은 다태 확률을 준다. 지금 몸이 가진 기관을 읽어 작용한다. 자궁이 있으면 임신하고, 오메가 성분이 활성이면 대신 항문으로 임신하며, 자지가 있으면 강화된 정액으로 상대를 임신시킨다.",
			onTakeMessage: teal(
				"열병처럼 약효가 덮친다. 배 속에서 열기가 피어나 온몸으로 번지고, 몸 전체가 달아오르고 조율되어, 아주 작은 기회마저 지속되는 무언가로 바꿀 위험한 준비를 마친다."
			),
			warning_label:
				"경고: 임신하면 진행 중인 변화가 영구적으로 굳습니다. 다태 출산이 흔하며 의도된 효과입니다. 자지가 있는 몸에서는 생식 능력이 크게 높아집니다.",
			canTake: grayGate.fertilityCourse,
			blockedReason: "자지가 있거나 지금 임신할 수 있는 몸이 필요합니다.",
			effects: [`<<xchange-gray 7 "fertile" "fertility">>`],
		},
		{
			name: "X-Change Fertility",
			subtype: "gray fertility",
			description:
				"무색의 캡슐로, 지속되는 동안 정상적인 가임 주기만 되돌려 자연스럽게 임신할 수 있게 한다. 욕구도 가속도 없다.",
			onTakeMessage: teal(
				"변화는 생각보다 은은하다. 몸이 조용히 준비를 하면서 따뜻한 기운이 속 깊이 자리 잡는다. 주기가 바뀌는 것이 느껴진다."
			),
			warning_label: "경고: 가임 상태의 몸이어야 합니다. 임신하면 진행 중인 변화가 영구적으로 굳을 수 있습니다.",
			canTake: grayGate.canConceive,
			blockedReason: "지금 임신할 수 있는 가임 상태의 몸이 필요합니다. 그런 몸이 될 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "fertile">>`],
		},
		{
			name: "X-Change Passion",
			subtype: "gray passion",
			description: "무색의 캡슐로, 열정 성분만 들어 있다. 하루 종일 예측할 수 없는 흥분의 물결이 밀려온다.",
			onTakeMessage: teal(
				"홍조가 피부 위로 번진다. 신경이 환하게 곤두서고 안절부절못하게 되어, 옷이 스치는 감촉이며 공기의 움직임이 괜히 더 흥미롭다. 가만히 서 있어도 몸이 쾌락에 정신을 팔릴 순간을 기다리는 것만 같다."
			),
			warning_label: "경고: 억누르기 힘든 흥분이 제멋대로 일어납니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 7 "passion">>`],
		},
		{
			name: "X-Change Innocence",
			subtype: "gray innocence",
			description: "무색의 캡슐로, 순진함 성분만 들어 있다. 지속되는 동안 쌓인 트라우마와 세상에 대한 인식을 잠시 멈춰 둔다.",
			onTakeMessage: teal(
				"세상의 무게가 한꺼번에 느슨해진다. 기억은 그대로 있지만 가장자리가 무뎌지고 의미는 멀고 무해해진다. 더는 이해하지 못하는 책 속의 말처럼. 생각이 깨끗하고 열려 있으며, 너무나 쉽게 잘못된 길로 이끌릴 것 같다."
			),
			warning_label: "경고: 억눌렸던 트라우마는 효과가 끝나면 되돌아옵니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 1 "innocence">>`],
		},
		{
			name: "X-Change Bimbo",
			subtype: "gray bimbo",
			description:
				"무색의 캡슐로, 빔보 성분이 들어 있다. 우둔해지고, 스트레스 증가가 줄며, 부풀어 오른 눈길을 끄는 몸매가 된다. (남성적인 몸에는 '힘보'라는 이름으로 팔리는 같은 화합물이다.)",
			onTakeMessage: teal(
				"따뜻하고 기분 좋은 안개가 머릿속에 번져, 날카로운 생각이 붙잡히기도 전에 매끄럽게 무뎌진다. 걱정이 흩어지고 생각하는 일이 선택 사항처럼 느껴지는 가벼운 여유가 찾아온다. 동시에 몸은 알약에 부드러움으로 답해 부풀고 둥글어지며, 모든 곡선이 거슬릴 만큼 의식된다."
			),
			warning_label: "경고: 학업 능력이 일시적으로 떨어집니다. 지금 가진 몸에 그대로 작용합니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 1 "bimbo" "swell">>`],
		},
		{
			name: "X-Change CumCure",
			subtype: "gray cumcure",
			description: "무색의 캡슐로, 컴큐어 성분만 들어 있다.",
			onTakeMessage: teal(
				"묘한 약 단맛이 혀에 달라붙고, 이어서 속 깊은 곳이 텅 비어 당기는 느낌이 든다. 몸이 무언가 특정한 것을 기다리기 시작한 것 같다. 그게 뭘까...?"
			),
			warning_label: "경고: 지금 가진 몸에 그대로 작용합니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 7 "cumcure">>`],
		},
		{
			name: "X-Change Portal",
			subtype: "gray portal",
			description: "무색의 캡슐로, 포털 성분만 들어 있으며 포털 팬티 시스템과 연결된다.",
			onTakeMessage: teal(
				"잠깐 동안 주위 공기가 얇고 어설프게 꿰매진 듯하다. 속옷 근처 공간이 희미하고 불가능한 떨림을 일으킨다. 현실이 가져서는 안 될 지름길을 찾아낸 것만 같다.<br><br>차가운 오싹함이 피부에 남는다. 포털 성분이 활성화되었고, 세상은 조금 전보다 조금 덜 확실하게 느껴진다."
			),
			warning_label: "경고: 포털 팬티 시스템이 켜져 있어야 합니다.",
			canTake: grayGate.portalEnabled,
			blockedReason: "설정에서 포털 팬티 시스템이 켜져 있어야 합니다.",
			effects: [`<<xchange-gray 1 "portal">>`],
		},
		{
			name: "X-Change Dumb-Bitch",
			subtype: "gray dumb-bitch",
			description: "무색의 캡슐로, 멍청한 암캐 성분만 들어 있다. 흐려지는 판단력, 줄어드는 스트레스 증가, 순하고 열성적인 성향을 준다.",
			onTakeMessage: teal(
				"생각이 비틀거리다가 느슨해지고, 제대로 마치기도 전에 손이 닿지 않는 곳으로 빠져나간다. 복잡한 생각은 무겁다. 경고는 멀게 느껴진다. 나쁜 결정이 점점 훨씬 이해하기 쉽게 들리기 시작한다."
			),
			warning_label: "경고: 지속되는 동안 판단력이 크게 손상됩니다.",
			canTake: grayGate.always,
			effects: [`<<xchange-gray 7 "dumb-bitch">>`],
		},
		{
			/* X-Tend pays out on the body you return to (penis-size gamble on orgasm),
			   so it grants its companion cancel pill exactly like the original. */
			name: "X-Change X-Tend (Gray)",
			subtype: "gray xtend",
			description:
				"무색의 캡슐로, 엑스텐드 성분만 들어 있다. 사정하지 않고 오래 버틸수록 원래 몸으로 돌아갈 때 얻는 것이 커지고, 사정하면 잃는다. 동봉된 취소 알약이 함께 나온다.",
			onTakeMessage: teal(
				"느리고 끈질긴 긴장이 아랫배 밑에 뿌리를 내리고, 숨을 쉴 때마다 더 단단히 감긴다. 신경에 직접 새겨진 내기 같다. 버티면 보상을 받고, 굴복하면 대가를 치른다.<br><br>포장 안에 짝이 되는 알약이 아직 남아 있는 것이 눈에 띈다. | <span class='blue'>+1 X-체인지 엑스텐드 취소</span>"
			),
			warning_label: "경고: 효과가 지속되는 동안 사정하면 얻은 것을 모두 잃습니다. 돌아가는 몸을 기준으로 결과가 정해집니다.",
			canTake: grayGate.xtendEligible,
			blockedReason: "자지가 있는 몸에서 결과가 정해집니다. 지금 자지가 있거나 돌아가는 몸에 자지가 있어야 합니다. 그런 몸이 될 때까지 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 7 "xtend">>`, `<<set V.sexStats.pills["pills"]["X-Change X-Tend Cancel"].owned++>>`],
		},

		/* stack-only: only useful layered onto an active X-Change session */
		{
			name: "X-Change Resistance",
			subtype: "gray resistance",
			description: "무색의 캡슐로, 레지스턴스 성분만 들어 있다. 현재 X-체인지 효과가 풀려야 할 때 풀리지 않을 확률이 생긴다.",
			onTakeMessage: teal(
				"지금의 변화가 기묘하게 떨리더니 시간이 늘어나는 듯하다. 맥박이 남아 있을 때마다 변화에 먹이를 주어 연장하고 떨쳐내기 어렵게 만들 수 있다는 암시가 든다."
			),
			warning_label: "경고: 활성 X-체인지 중이 아니면 효과가 없습니다. 원치 않아도 변화가 연장될 수 있습니다.",
			canTake: grayGate.activeSession,
			blockedReason: "활성 X-체인지 중에만 작용합니다. 활성 중에 먹으십시오. 그때까지는 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 1 "resistance">>`],
		},
		{
			name: "X-Change Continue",
			subtype: "gray continue",
			description:
				"무색의 캡슐로, 컨티뉴 성분만 들어 있다. 절정할 때마다 활성 X-체인지 지속 시간이 16시간씩 늘어난다. 선택 가능한 지속 시간 상한을 두면 컨티뉴가 소진되고, 지금 몸이 임신할 수 있는 경우 가임 상태가 더해진다.",
			onTakeMessage: teal("현재의 몸이 안쪽에서부터 따뜻해지고, 활성 X-체인지 화학 작용이 사그라드는 대신 밝아진다."),
			warning_label: "경고: 활성 X-체인지 중이 아니면 효과가 없습니다. 지속 시간 상한을 끄면 오래 쓸수록 영구적으로 굳을 수 있습니다.",
			canTake: grayGate.activeSession,
			blockedReason: "활성 X-체인지 중에만 작용합니다. 활성 중에 먹으십시오. 그때까지는 서랍에 보관됩니다.",
			effects: [`<<xchange-gray 3 "continue">>`],
		},

		/* the duration extender */
		{
			name: "X-Change Weekly Extension",
			subtype: "gray extension",
			description: "그 자체로는 아무 효과도 없는 무색의 농축액이다. 진행 중인 X-체인지를 약 일주일 연장할 뿐이다.",
			onTakeMessage: teal(
				"익숙한 X-체인지의 온기가 다시 일어나 이미 있던 것을 더 깊게 한다. 활성 제형이 빌려 온 시간을 한 번 더 받은 것처럼 몸에 자리 잡는다. 이제 카운트다운이 더 멀게 느껴진다."
			),
			warning_label: "경고: X-체인지 알약이 이미 활성 상태가 아니면 효과가 없습니다.",
			canTake: () => playerIsXChanged(),
			blockedReason: "활성 X-체인지 중에만 작용합니다. 그때까지는 서랍에 보관됩니다.",
			effects: [`<<xchange-extend 7>>`],
		},
	];
	return rows.map(makeGrayXChangePill);
}
window.buildGrayXChangePills = buildGrayXChangePills;

/* Append the gray pills to the catalogue. */
setup.pills.push(...buildGrayXChangePills());

/*
 * Coloured, suspicious and utility pill definitions, kept out of bedroom-pills.js so the vanilla file stays vanilla.
 * Inventory records auto-register via ensurePillInventoryRecords() (bedroom-pills.js), which loops over setup.pills.
 */
setup.pills.push(
	{
		name: "X-Change Pink Hyper Fertility",
		description:
			"임시 알약으로, 극단적인 가임력과 가속된 임신 진행을 일으킨다. 지속되는 동안 피임하지 않은 접촉에서는 거의 반드시 임신하고, 이미 진행 중인 임신은 눈에 띄게 빠르게 진행되며, 임신에 성공하면 쌍둥이, 세쌍둥이, 네쌍둥이일 확률이 훨씬 높아진다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>가임 성분이 자리를 잡으면서, 더 깊은 온기가 아랫배에 내려앉는다.',
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 다태 출산이 흔하며 의도된 효과입니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink hyper fertility",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 7 "fertile" "fertility">>`],
	},

	{
		name: "X-Change Pink NOW",
		description:
			"X-체인지 베이직을 크게 희석한 제품으로, 일정이 빠듯한 사람을 위한 것이다. 약 6시간 동안 지속된다. 베이직과 마찬가지로 임신할 수 없다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink", true) ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink", true);
		},
		effects: [`<<xchange-pink 0.25>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 0.25 "genderflip">>`],
	},

	{
		name: "X-Change Pink Basic",
		description:
			"X-체인지의 간판 제품이다. 가격이 저렴하고 보통 24시간 이내로 지속되며, 이후 원래 몸으로 돌아온다. 베이직으로는 임신이 불가능하다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 1>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip">>`],
	},

	{
		name: "X-Change Pink Weekly",
		description:
			"X-체인지 베이직을 훨씬 진하게 만든 제품이다. 더 긴 지속 시간을 원하지만 엑스트라 스트렝스의 약속과 위험까지는 아직 부담스러운 사람을 위한 것이다. 약 7일간 지속된다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 7>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip">>`],
	},

	{
		name: "X-Change Pink Xtra Strength",
		description:
			"더 값비싼 용량으로, 보통 30일간 지속된다. 엑스트라 스트렝스로도 임신할 수는 있지만 그럴 확률은 아주 낮다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink xtra",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 30 "fertile">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 30 "genderflip" "fertile">>`],
	},

	{
		name: "X-Change Pink Continue",
		description:
			"임시 알약으로, 절정할 때마다 지속 시간이 늘어난다. 처음 지속 시간은 72시간 이하이다. 절정할 때마다 지속 시간이 16시간씩 늘어난다. 선택 가능한 지속 시간 상한을 두면 컨티뉴가 소진되고, 지금 몸과 가임 설정이 허용할 때 가임 상태가 더해진다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 지속 시간 상한을 끄면, 남은 지속 시간이 30일을 넘은 뒤 거듭된 절정으로 변화가 영구적으로 굳을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink continue",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 3 "continue">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 3 "genderflip" "continue">>`],
	},

	{
		name: "X-Change X-Tend",
		description:
			"꿈에 그리던 자지 크기를 얻을 기회를 주는 성별 전환 알약이다. 이 알약을 먹으면 다른 인간 남성들의 우월한 유전 암호를 받아들이는 기이한 능력을 가진 여자로 일시적으로 변한다. 굵고 큰 자지의 정액을 자궁에 받아내면, 한 번 받을 때마다 그 크기와 굵기에 가까워진다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다. 거울을 보니 당신은 대단히 아름답기까지 하다.<br><br>내려다보니 포장 안에 작은 알약이 하나 더 남아 있다. | <span class='blue'>+1 X-체인지 엑스텐드 취소</span>",
		warning_label:
			"경고: 이 알약의 효과 아래에서 절정하면 남성기가 줄어듭니다. 이 알약에는 임신에 대한 보호 장치가 없으며, 임신하면 성별 전환이 영구적으로 굳을 수 있습니다. 또한 일부 기생 감염(특히 생식기에 영향을 주는 감염)은 이 알약이 자연스럽게 풀리지 않게 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink xtend",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 7 "xtend" "fertile">>`, `<<set V.sexStats.pills["pills"]["X-Change X-Tend Cancel"].owned++>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip" "xtend" "fertile">>`, `<<set V.sexStats.pills["pills"]["X-Change X-Tend Cancel"].owned++>>`],
	},

	{
		name: "X-Change X-Tend Cancel",
		description:
			"X-체인지 엑스텐드의 짝 알약으로, 얻은 것을 포기하는 대가로 변화를 일찍 끝낼 수 있다. 주된 용도는 엑스텐드의 효과 아래에서 이미 절정해 버렸을 때 손실을 줄이는 것이다. 얻을 기회도 없이 더 큰 손실을 입는 일을 막아 준다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>한동안 성별이 뒤바뀐 채 지내다 원래 몸으로 돌아오니 꽤 그리운 느낌이 든다.',
		warning_label:
			"경고: 이 알약은 짝 알약이 작용하는 동안 이미 입은 성기 크기 손실을 되돌리지 못합니다. 이른 시점에 이익을 챙길 수도 없습니다. 짝 알약의 효과를 취소하려고 이 알약을 먹으면 그전에 얻은 크기 증가분은 사라집니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink xtend",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && !xchangePregnancyBlocksRevert() && V.xchange.pill.xtendEffect ? 1 : 0;
		},
		take_blocked_reason() {
			if (!playerIsXChanged()) return "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
			if (!V.xchange.pill.xtendEffect) return "현재 복용한 알약에는 엑스텐드 성분이 없으므로 되돌릴 것이 없습니다.";
			return xchangeRevertPregnancyBlockedReason();
		},
		effects: [`<<xchange-restore>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-xchange-restore>>`],
	},

	{
		name: "X-Change Pink Resistance",
		description:
			"임시 알약이지만 절정하면 영구적으로 굳을 수 있다. 절정할 때마다 영구화 가능성이 높아진다. 알약 효과는 최대 24시간 이내로 지속된다. 레지스턴스의 영구적이지 않은 효과 아래에서는 임신할 수 없다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 일반적인 임신의 위험은 없지만, 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink resistance",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 1 "resistance">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "resistance">>`],
	},

	{
		name: "X-Change Pink Breeder",
		description: "임시 알약으로, 가임력이 높아지고 질 내 사정 중 쾌감이 커진다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다. 사정을 받고 싶은 강렬한 욕구를 일으키는 것으로 알려져 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink breeder",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 7 "breeder" "fertile">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip" "breeder" "fertile">>`],
	},

	{
		name: "X-Change Pink Omega",
		description:
			"임시 알약으로, 오메가 성분을 적용한다. 항문 임신이 가능해지고 항문 내 사정 중 쾌감이 커진다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다.<br><br>속 깊은 곳에 낮은 온기가 내려앉는다. 평소 X-체인지가 끌어당기는 것보다도 더 아래다. 항문이 예민하고 간절해지고, 오메가 성분이 당신에게 무엇을 바라는지 지독하게 의식하게 된다.',
		warning_label:
			"경고: 항문 임신이 가능해집니다. 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink omega",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink", true) ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink", true);
		},
		effects: [`<<if $xchange.omegaShrinkGenitals>><<take-xchange 7 "crossdress" "omega">><<else>><<xchange-pink 7 "omega">><</if>>`],
	},

	{
		name: "X-Change Pink Beta",
		description:
			"임시 알약으로, 질이 있는 몸에 베타 성분을 적용해 각각 따로 임신하고 아이를 품을 수 있는 두 개의 기능하는 자궁을 만든다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>보지 안쪽 깊은 곳에 압력이 모인다. 그것이 서서히 두 개의 뚜렷한 온기로 갈라지고, 이제 몸에 생명이 뿌리내릴 수 있는 자리가 따로 두 곳 생겼다는 기묘한 확신이 든다.',
		warning_label:
			"경고: 질이 있어야 합니다. 두 자궁은 서로 다른 때에 임신할 수 있으며, 임신마다 따로 출산해야 합니다. 임신 중에는 임신 기간이 끝날 때까지 알약 타이머가 멈춥니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink beta",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return V.player.vaginaExist && xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			if (!V.player.vaginaExist) return "베타 성분이 짝을 이룬 자궁을 만들려면 질이 필요합니다.";
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "beta">>`],
	},

	{
		name: "X-Change Pink Innocence",
		description: "임시 알약으로, 복용자의 머릿속에서 성에 관한 지식을 모두 지우도록 만들어졌다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink innocence",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 1 "innocence">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "innocence">>`],
	},

	{
		name: "X-Change Pink Swell",
		description: "임시 알약으로, 복용자를 글래머러스한 여자로 바꾸도록 만들어졌다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink swell",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 1 "swell">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "swell">>`],
	},

	{
		name: "X-Change Pink Bimbo",
		description: "지능과 스트레스 증가를 낮추는 대신 음란함을 높인다. 부풀기 효과가 내장되어 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink bimbo",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 1 "bimbo" "swell">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "bimbo" "swell">>`],
	},

	{
		name: "X-Change Pink CumCure",
		description: "몸 안에 정액이 들어올 때마다 변화의 지속 시간을 줄여 준다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 질에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink cumcure",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-pink 7 "cumcure">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip" "cumcure">>`],
	},

	{
		name: "X-Change Sissy",
		description:
			"X-체인지 베이직의 변형 제품이다. 표준 제형의 변신 효과가 변화가 끝나기 전에 중간에 멈춰, 겉모습은 여성적이지만 엄밀히는 여전히 남성인 몸이 된다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 도중에 고환과 자지가 가장 작은 크기로 줄어들더니 변화가 갑자기 멈춘다. 당신은 여자의 몸이 가진 별난 점과 이점 대부분을 갖추었지만, 여전히 남성이다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 여성스러운 방식으로 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 중화제의 부작용으로 복용자가 이성의 옷차림을 하고 싶어 하며, 본래 성별의 옷을 입고 있는 시간이 길어질수록 스트레스를 받습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink crossdress",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<take-xchange 1 "crossdress">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "crossdress">>`],
	},

	{
		name: "X-Change Choice (F)",
		description: "임시 성별 전환 알약으로, 동봉된 반대 알약을 먹을 때까지 효과가 무기한 지속된다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label:
			"경고: 임신 중이거나 기생충에 감염된 상태에서는 먹지 마십시오. 포장에 동봉된 리버설 알약을 잃어버리지 마십시오. 다른 어떤 알약도(같은 종류라 해도) 이 초이스 알약의 효과를 되돌릴 수 없습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink choice",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-choice>>`, `<<set V.sexStats.pills["pills"]["X-Change Choice Reversal (F)"].owned++>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		// TODO: Revise how Choice pills work on NPCs
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "choice">>`, `<<set V.sexStats.pills["pills"]["X-Change Choice Reversal (NPC)"].owned++>>`],
	},

	{
		name: "X-Change Choice Reversal (F)",
		description: "이전에 먹은 초이스 알약의 효과를 되돌리는 성별 전환 알약이다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>한동안 성별이 뒤바뀐 채 지내다 원래 몸으로 돌아오니 꽤 그리운 느낌이 든다.',
		warning_label:
			"경고: 임신 중이거나 기생충에 감염된 상태에서는 먹지 마십시오. 이 알약을 잃어버리지 마십시오. 다른 어떤 알약도(같은 종류라 해도) 이 포장에 동봉된 초이스 알약의 효과를 되돌릴 수 없습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink choice",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 && V.xchange.pill.choiceEffect ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && !xchangePregnancyBlocksRevert() && V.xchange.pill.choiceEffect ? 1 : 0;
		},
		take_blocked_reason() {
			if (!playerIsXChanged()) return "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
			if (!V.xchange.pill.choiceEffect) return "현재 복용한 알약에는 초이스 성분이 없으므로 되돌릴 것이 없습니다.";
			return xchangeRevertPregnancyBlockedReason();
		},
		effects: [`<<xchange-restore>>`],
	},

	{
		name: "Suspicious Pink Pill",
		description: "출처와 제조처를 알 수 없는 라벨 없는 핑크색 알약이다. 효과를 예측할 수 없다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 작고 가벼우며, 묘하게 감촉에 예민하다.<br><br>거울을 보니 당신은 대단히 아름답기까지 하다.',
		warning_label: "경고: 이 알약이 어디서 왔는지, 무슨 작용을 하는지 알지 못합니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "pink unknown",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("pink") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("pink");
		},
		effects: [`<<xchange-suspicious-pill>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "m") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange random(1,3) "random">>`],
	},

	{
		name: "Suspicious Purple Pill",
		description: "출처와 제조처를 알 수 없는 라벨 없는 보라색 알약이다. 효과를 예측할 수 없다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label: "경고: 이 알약이 어디서 왔는지, 무슨 작용을 하는지 알지 못합니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple unknown",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<xchange-suspicious-pill>>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange random(1,3) "herm" "random">>`],
	},

	{
		name: "X-Change Blue Hyper Fertility",
		description:
			"임시 성별 전환 알약으로, 극단적인 가임력과 가속된 생식 능력을 일으킨다. 지속되는 동안 정자가 임신을 일으킬 가능성이 훨씬 높아지고, 임신에 성공하면 쌍둥이, 세쌍둥이, 네쌍둥이일 확률이 훨씬 높아진다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>가임 성분이 자리를 잡으면서, 더 깊은 온기가 온몸에 번진다.',
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 가임 제형은 생식 능력을 크게 높입니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue hyper fertility",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 7 "fertile" "fertility">>`],
	},

	{
		name: "X-Change Blue NOW",
		description: "X-체인지 베이직을 크게 희석한 제품으로, 일정이 빠듯한 사람을 위한 것이다. 약 6시간 동안 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue", true) ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue", true);
		},
		effects: [`<<xchange-blue 0.25>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 0.25 "genderflip">>`],
	},

	{
		name: "X-Change Blue Basic",
		description: "X-체인지의 간판 제품이다. 가격이 저렴하고 보통 24시간 이내로 지속되며, 이후 원래 몸으로 돌아온다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 1>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip">>`],
	},

	{
		name: "X-Change Blue Weekly",
		description:
			"X-체인지 베이직을 훨씬 진하게 만든 제품이다. 더 긴 지속 시간을 원하지만 엑스트라 스트렝스의 약속과 위험까지는 아직 부담스러운 사람을 위한 것이다. 약 7일간 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 7>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip">>`],
	},

	{
		name: "X-Change Blue Xtra Strength",
		description: "더 값비싼 용량으로, 보통 30일간 지속된다. 이후 원래 몸으로 돌아온다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label: "경고: 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue xtra",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 30>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 30 "genderflip">>`],
	},

	{
		name: "X-Change Blue Continue",
		description:
			"임시 알약으로, 절정할 때마다 지속 시간이 늘어난다. 처음 지속 시간은 72시간 이하이다. 절정할 때마다 지속 시간이 16시간씩 늘어난다. 선택 가능한 지속 시간 상한을 두면 한도에 이르렀을 때 컨티뉴가 소진되어 타이머가 정상적으로 줄어든다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 지속 시간 상한을 끄면, 남은 지속 시간이 30일을 넘은 뒤 거듭된 절정으로 변화가 영구적으로 굳을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue continue",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 3 "continue">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 3 "genderflip" "continue">>`],
	},

	{
		name: "X-Change Blue Resistance",
		description:
			"임시 알약이지만 절정하면 영구적으로 굳을 수 있다. 절정할 때마다 영구화 가능성이 높아진다. 알약 효과는 최대 24시간 이내로 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 임신 중에는 먹을 수 없습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue resistance",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 1 "resistance">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "resistance">>`],
	},

	{
		name: "X-Change Blue Bull",
		description: "임시 성별 전환 알약으로, 생식 능력이 높아지고 기본 최대 정액량이 늘어난다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다. 사정을 받고 싶은 강렬한 욕구를 일으키는 것으로 알려져 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue bull",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 7 "bull">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "genderflip" "bull">>`],
	},

	{
		name: "X-Change Blue Alpha",
		description:
			"임시 성별 전환 알약으로, 복용자의 자지에 매듭이 생기고, 사정 전에 상대 안에 들어가 있어야 한다는 욕구와 더 많은 기본 최대 정액량을 준다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>이윽고 자지에 압력이 모이면서, 욕구가 더 묵직하고 소유욕 짙은 무언가로 바뀐다. 몸이 누군가의 안에 단단히 맞물리고 싶어 한다.',
		warning_label:
			"경고: 자지가 있어야 의미가 있습니다. 삽입을 시작하는 것에 대한 복용자의 평소 거리낌을 무시하게 하는 강한 삽입 충동을 일으키는 것으로 알려져 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue alpha",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue", true) ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue", true);
		},
		effects: [`<<xchange-blue 7 "alpha">>`],
	},

	{
		name: "X-Change Blue Omega",
		description:
			"임시 성별 전환 알약으로, 오메가 성분을 적용한다. 항문 임신이 가능해지고 항문 내 사정 중 쾌감이 커진다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>속 깊은 곳에 낮은 온기가 내려앉는다. 평소 X-체인지가 끌어당기는 것보다도 더 아래다. 항문이 예민하고 간절해지고, 오메가 성분이 당신에게 무엇을 바라는지 지독하게 의식하게 된다.',
		warning_label:
			"경고: 항문 임신이 가능해집니다. 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue omega",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue", true) ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue", true);
		},
		effects: [`<<xchange-blue 7 "omega">>`],
	},

	{
		name: "X-Change Blue Innocence",
		description: "임시 알약으로, 복용자의 머릿속에서 성에 관한 지식을 모두 지우도록 만들어졌다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue innocence",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 1 "innocence">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "innocence">>`],
	},

	{
		name: "X-Change Blue Swell",
		description: "임시 알약으로, 복용자를 거대한 남자로 바꾸도록 만들어졌다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue swell",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 1 "swell">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "swell">>`],
	},

	{
		name: "X-Change Blue Himbo",
		description: "지능과 스트레스 증가를 낮추는 대신 음란함을 높인다. 부풀기 효과가 내장되어 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue himbo",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 1 "bimbo" "swell">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "bimbo" "swell">>`],
	},

	{
		name: "X-Change Blue CumCure",
		description: "몸 안에 정액이 들어올 때마다 변화의 지속 시간을 줄여 준다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 천천히 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue cumcure",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-blue 7 "cumcure">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 7 "cumcure">>`],
	},

	{
		name: "X-Change Butch",
		description:
			"X-체인지 베이직의 변형 제품이다. 표준 제형의 변신 효과가 변화가 끝나기 전에 중간에 멈춰, 겉모습은 남성적이지만 엄밀히는 여전히 여성인 몸이 된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 도중에 가슴이 납작해질 때까지 줄어든 뒤 변화가 갑자기 멈춘다. 당신은 남자의 몸이 가진 별난 점과 이점 대부분을 갖추었지만, 여전히 여성이다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 거칠고 다부진 인상이다. 남성적인 방식으로 꽤 매력적으로 보인다.",
		warning_label:
			"경고: 중화제의 부작용으로 복용자가 이성의 옷차림을 하고 싶어 하며, 본래 성별의 옷을 입고 있는 시간이 길어질수록 스트레스를 받습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue crossdress",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<take-xchange 1 "crossdress">>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange 1 "crossdress">>`],
	},

	{
		name: "X-Change Choice (M)",
		description: "임시 성별 전환 알약으로, 동봉된 반대 알약을 먹을 때까지 효과가 무기한 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label:
			"경고: 임신 중이거나 기생충에 감염된 상태에서는 먹지 마십시오. 포장에 동봉된 리버설 알약을 잃어버리지 마십시오. 다른 어떤 알약도(같은 종류라 해도) 이 초이스 알약의 효과를 되돌릴 수 없습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue choice",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-choice>>`, `<<set V.sexStats.pills["pills"]["X-Change Choice Reversal (M)"].owned++>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		// TODO: Revise how choice works on NPCs
		npcEffects: [`<<npc-take-xchange 1 "genderflip" "choice">>`, `<<set V.sexStats.pills["pills"]["X-Change Choice Reversal (NPC)"].owned++>>`],
	},

	{
		name: "X-Change Choice Reversal (M)",
		description: "이전에 먹은 초이스 알약의 효과를 되돌리는 성별 전환 알약이다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 여자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>한동안 성별이 뒤바뀐 채 지내다 원래 몸으로 돌아오니 꽤 그리운 느낌이 든다.',
		warning_label:
			"경고: 임신 중이거나 기생충에 감염된 상태에서는 먹지 마십시오. 이 알약을 잃어버리지 마십시오. 다른 어떤 알약도(같은 종류라 해도) 이 포장에 동봉된 초이스 알약의 효과를 되돌릴 수 없습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue choice",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-pink.png",
		display_condition() {
			return this.owned() > 0 && V.xchange.pill.choiceEffect ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && !xchangePregnancyBlocksRevert() && V.xchange.pill.choiceEffect ? 1 : 0;
		},
		take_blocked_reason() {
			if (!playerIsXChanged()) return "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
			if (!V.xchange.pill.choiceEffect) return "현재 복용한 알약에는 초이스 성분이 없으므로 되돌릴 것이 없습니다.";
			return xchangeRevertPregnancyBlockedReason();
		},
		effects: [`<<xchange-restore>>`],
	},

	{
		name: "X-Change Purple Basic",
		description:
			"X-체인지의 간판 제품이다. 가격이 저렴하고 보통 24시간 이내로 지속되며, 이후 원래 몸으로 돌아온다. 베이직으로는 임신이 불가능하다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 1 "herm">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 1 "herm">>`],
	},

	{
		name: "X-Change Purple Xtra Strength",
		description:
			"더 값비싼 용량으로, 보통 30일간 지속된다. 엑스트라 스트렝스로도 임신할 수는 있지만 그럴 확률은 아주 낮다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple xtra",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 30 "herm">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 30 "herm">>`],
	},

	{
		name: "X-Change Purple Continue",
		description:
			"임시 알약으로, 절정할 때마다 지속 시간이 늘어난다. 처음 지속 시간은 72시간 이하이다. 절정할 때마다 지속 시간이 16시간씩 늘어난다. 선택 가능한 지속 시간 상한을 두면 컨티뉴가 소진되고, 지금 몸과 가임 설정이 허용할 때 가임 상태가 더해진다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 지속 시간 상한을 끄면, 남은 지속 시간이 30일을 넘은 뒤 거듭된 절정으로 변화가 영구적으로 굳을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple continue",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 3 "herm" "continue">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 3 "herm" "continue">>`],
	},

	{
		name: "X-Change Purple Resistance",
		description:
			"임시 알약이지만 절정하면 영구적으로 굳을 수 있다. 절정할 때마다 영구화 가능성이 높아진다. 알약 효과는 최대 24시간 이내로 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple resistance",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 1 "herm" "resistance">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 1 "herm" "resistance">>`],
	},

	{
		name: "X-Change Purple NOW",
		description: "X-체인지 베이직을 크게 희석한 제품으로, 일정이 빠듯한 사람을 위한 것이다. 약 6시간 동안 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 0.25 "herm">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 0.25 "herm">>`],
	},

	{
		name: "X-Change Purple Weekly",
		description:
			"X-체인지 베이직을 훨씬 진하게 만든 제품이다. 더 긴 지속 시간을 원하지만 엑스트라 스트렝스의 약속과 위험까지는 아직 부담스러운 사람을 위한 것이다. 약 7일간 지속된다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple basic",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 7 "herm">>`],
	},

	{
		name: "X-Change Purple Breeder",
		description: "임시 알약으로, 가임력이 높아지고 질 내 사정 중 쾌감이 커진다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple breeder",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "breeder" "fertile">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 7 "herm" "breeder" "fertile">>`],
	},

	{
		name: "X-Change Purple Bull",
		description: "임시 성별 전환 알약으로, 생식 능력이 높아지고 기본 최대 정액량이 더 늘어난다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>새 몸은 원래 몸과 분명히 다른데도 묘하게 낯익다. 여러모로 낯설지만, 여전히 틀림없이 당신의 몸이다. 마음만 먹으면 옷을 걸친 동안에는 원하는 어떤 성별로든 통할 수 있을 것이다.<br><br>마지막으로 거울 앞에 다가가 찬찬히 살펴보니, 당신은 대단히 아름답기까지 하다.",
		warning_label:
			"경고: 변화하는 동안 가벼운 불편함이 있을 수 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple bull",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "bull">>`],
		npc_display_condition() {
			return this.owned() > 0 && !npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) && !npcIsPregnant(V.xchange.npcTargetName);
		},
		npcEffects: [`<<npc-take-xchange 7 "herm" "bull">>`],
	},

	{
		name: "X-Change Purple Omega",
		description:
			"임시 알약으로, 양성구유의 몸과 함께 오메가 성분을 준다. 항문 임신이 가능해지고 항문 내 사정 중 쾌감이 커진다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>속 깊은 곳에 낮은 온기가 내려앉는다. 평소 X-체인지가 끌어당기는 것보다도 더 아래다. 항문이 예민하고 간절해지고, 오메가 성분이 당신에게 무엇을 바라는지 지독하게 의식하게 된다.",
		warning_label:
			"경고: 항문 임신이 가능해집니다. 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple omega",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "omega">>`],
	},

	{
		name: "X-Change Purple Alpha",
		description:
			"임시 알약으로, 양성구유의 몸과 함께 알파 성분을 준다. 매듭 달린 자지, 사정 전에 상대 안에 들어가 있어야 한다는 욕구, 더 많은 기본 최대 정액량이 생긴다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>이윽고 자지에 압력이 모이면서, 욕구가 더 묵직하고 소유욕 짙은 무언가로 바뀐다. 몸이 누군가의 안에 단단히 맞물리고 싶어 한다.",
		warning_label:
			"경고: 삽입을 시작하는 것에 대한 평소의 거리낌과, 자지를 쓸 수 있는 동안의 받아들이는 쪽 발정 충동을 무시하게 하는 강한 삽입 충동을 일으키는 것으로 알려져 있습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple alpha",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "alpha">>`],
	},

	{
		name: "X-Change Purple Alpha-Omega",
		description:
			"임시 알약으로, 알파와 오메가 성분을 함께 적용해 양성구유의 몸, 항문 임신 가능성, 강한 삽입 충동이 따르는 매듭 달린 자지, 더 많은 기본 최대 정액량을 준다. 알약 효과는 최대 일주일간 지속될 수 있다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>속 깊은 곳에 낮은 온기가 내려앉고, 자지에는 압력이 모인다. 몸은 채워지고 싶고, 채우고 싶고, 사정하기 전에 누군가의 안에 단단히 맞물리고 싶어 한다.",
		warning_label:
			"경고: 항문 임신이 가능해지며, 알파 효과를 위해서는 자지가 있어야 합니다. 자지를 쓸 수 있는 동안에는 알파의 지배적인 충동이 받아들이는 쪽의 발정 충동보다 우선합니다. 임신하면 변화가 영구적으로 굳습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple alpha-omega",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "omega" "alpha">>`],
	},

	{
		name: "X-Change Purple Hyper Fertility",
		description:
			"임시 성별 전환 알약으로, 양성구유의 몸과 함께 극단적인 가임력과 가속된 생식 능력을 준다. 지속되는 동안 자궁과 정자 모두 훨씬 강력해져, 피임하지 않은 접촉 한 번이면 거의 확실히 임신하고, 임신 기간이 훨씬 빨리 진행되며, 임신에 성공하면 쌍둥이, 세쌍둥이, 네쌍둥이일 확률이 훨씬 높아진다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자와 여자의 몸이 가진 온갖 별난 점과 이점을 모두 갖추고 있다.<br><br>가임 성분이 자리를 잡으면서, 깊은 온기가 온몸에 번진다.",
		warning_label:
			"경고: 임신하면 변화가 영구적으로 굳습니다. 가임 제형은 생식 능력을 크게 높입니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염도 변화를 영구적으로 만들 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "purple hyper fertility",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-purple.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<take-xchange 7 "herm" "fertile" "fertility">>`],
	},

	{
		name: "Suspicious Blue Pill",
		description: "출처와 제조처를 알 수 없는 라벨 없는 파란색 알약이다. 효과를 예측할 수 없다.",
		onTakeMessage:
			"<span class=\"teal\">알약을 삼킨다.</span><br><br>갑자기 온몸으로 열기가 치달리고, 몸이 뒤틀리고 꿈틀대며 매끄럽게 스스로를 재배열하기 시작한다. 변화가 마침내 끝나자, 당신은 남자의 몸이 가진 온갖 별난 점과 이점을 고스란히 갖추고 있다.<br><br>새 몸은 더 크고 강하며, 거칠게 몰아붙이고 받아낼 준비가 충분히 되어 있다.<br><br>거울을 보니 당신은 꽤 잘생기기까지 했다!",
		warning_label: "경고: 이 알약이 어디서 왔는지, 무슨 작용을 하는지 알지 못합니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "blue unknown",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/xchange-blue.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform("blue") ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason("blue");
		},
		effects: [`<<xchange-suspicious-pill>>`],
		npc_display_condition() {
			return (
				this.owned() > 0 &&
				npcStartingSexIs(V.xchange.npcTargetNo, V.xchange.npcTargetName, "f") &&
				!npcIsXChanged(V.xchange.npcTargetNo ?? V.xchange.npcTargetName) &&
				!npcIsPregnant(V.xchange.npcTargetName)
			);
		},
		npcEffects: [`<<npc-take-xchange random(1,3) "random">>`],
	},

	{
		name: "X-Change Clone: Whitney",
		description:
			"휘트니의 유전 물질을 바탕으로 맞춤 제작한 임시 알약이다. 효과는 최대 24시간 이내로 지속된다. 복용자의 성별과 상관없이 이 알약의 효과 아래에서는 임신할 수 없다.",
		onTakeMessage:
			'알약을 <span class="teal">한입에 털어 넣는다</span>.<br><br>변화를 기다리며 눈을 감자, 알약 특유의 열기가 몸속으로 퍼져 나간다. 존재의 구석구석까지 닿는다. 갑작스러운 분노의 파도가 덮치고, 강간과 학대와 자기혐오에 대한 생각이 머릿속을 채운다. 잠시 동안 <span class="red">당신은 세상에 대해 완전히 격분한다</span>.<br><br>하지만 감정의 소용돌이가 가라앉고 거울을 들여다보니, 거기서 당신을 마주 보는 것은 휘트니뿐이다. 알약이 제 일을 해냈다.',
		warning_label:
			"경고: 극도로 미완성인 콘텐츠입니다. 몹시 우스꽝스러운 상황이 벌어질 수 있습니다. 임신 중에는 먹을 수 없습니다. 일부 기생 감염, 특히 생식기에 영향을 주는 감염은 변화를 영구적으로 만들 수 있습니다. 주의해서 사용하십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "clone",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillpremium.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return xchangeCanStartTransform() ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeTransformBlockedReason();
		},
		effects: [`<<xchange-clone 3 "Whitney">>`],
	},

	{
		name: "SWP Anti-crossdress Pill",
		description:
			'시시화/부치화 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음에는 이상하고 공허한 고요함이 몸속으로 퍼질 뿐이다. 그러다 반동이 덮친다. <span class="red">따끔거리는 가려움이 피부 위를 기어 다니고</span>, 이내 온몸이 지나치게 예민해져서 옷이 스치는 것조차 거의 아플 지경이 된다.<br><br>불편함을 이를 악물고 견디며, 적어도 정신을 괴롭히던 그 끔찍한 효과들은 더 겪지 않아도 되리라는 희망에 매달린다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.genderflipEffect && V.xchange.pill.genderificationEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("genderflipEffect", "genderificationEffect");
		},
		effects: [`<<xchange-removeeffect "crossdress">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-breeder Pill",
		description: '브리더 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>잠시 동안은 몸속의 압력이 갑자기 잠잠해진 안도감뿐이다. 그러다 피부 밑에서 <span class="red">뜨거운 가려움</span>이 시작되어, 온몸이 날것처럼 예민해지며 천이 스치고 움직일 때마다 거의 아플 정도가 된다.<br><br>숨을 들이쉬며 반동을 견딘다. 정신을 괴롭히고 몸을 바꾸던 그 끔찍한 브리더 효과를 더는 겪지 않게 되리라는 희망으로.',
		warning_label:
			"경고: 가임력을 완전히 없애지는 못합니다. 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.breederEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("breederEffect");
		},
		effects: [`<<xchange-removeeffect "breeder">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-omega Pill",
		description: '오메가 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>아랫배의 간절한 온기가 가장 먼저 사라지고, 그 자리에 차가운 공허가 남는다. 그러다 반동이 덮친다. <span class="red">따끔거리는 과민함이 피부 밑으로 퍼져</span> 천이 스치는 것만으로도 감당하기 힘들 정도다.<br><br>숨을 고르며 이 비참한 후유증이 오메가의 압박이 사라졌다는 뜻이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.omegaEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("omegaEffect");
		},
		effects: [`<<xchange-removeeffect "omega">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-bull Pill",
		description: '불 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음에는 열에 들뜬 압박이 마침내 놓아준 듯한 축복 같은 안도감이 든다. 하지만 평온은 금세 <span class="red">스멀거리는 가려움과 날것 같은 과민함</span>으로 변해 온몸에 퍼지고, 자신의 움직임조차 불쾌할 만큼 강렬하게 느껴진다.<br><br>자세를 가다듬으며 이 비참한 후유증이 정신을 괴롭히고 몸을 바꾸던 그 끔찍한 불 효과에서 마침내 벗어났다는 뜻이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.bullEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("bullEffect");
		},
		effects: [`<<xchange-removeeffect "bull">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-alpha Pill",
		description: '알파 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>자지를 누르던 묵직한 압력이 빠져나가고, 갑자기 사라진 빈자리가 욕구 그 자체만큼이나 신경을 건드린다. <span class="red">그러자 후유증이 피부 위를 기어 다니며</span> 모든 감촉을 날카롭고 지나치게 예민하게 만든다.<br><br>이를 악물며 그것이 알파 표지가 중화되었다는 뜻이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.alphaEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("alphaEffect");
		},
		effects: [`<<xchange-removeeffect "alpha">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-beta Pill",
		description: '베타 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>보지 안쪽의 둘로 갈라졌던 온기가 하나로 모여 다시 안정된 중심 하나가 된다. <span class="red">그러자 후유증이 피부 위를 기어 다니며</span> 모든 감촉을 날카롭고 지나치게 예민하게 만든다.<br><br>이를 악물며 그것이 베타 표지가 중화되었다는 뜻이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 어느 쪽 자궁이든 이미 자리 잡은 임신은 되돌리지 못합니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.betaEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("betaEffect");
		},
		effects: [`<<xchange-removeeffect "beta">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-continue Pill",
		description: '컨티뉴 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음에는 너무 오래 너무 시끄러웠던 방에서 마침내 걸어 나온 듯한, 이상하고 먹먹한 안도감뿐이다. 그러다 부작용이 시작된다. <span class="red">피부 밑의 안절부절못하는 가려움과 과민함</span>이 모든 감촉과 천의 주름 하나하나를 불쾌할 만큼 날카롭고 거의 아프게 만든다.<br><br>할 수 있는 만큼 버티며, 이 비참한 반동이 그 지독히 위험한 컨티뉴 효과를 더는 겪지 않게 된다는 뜻이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.continueEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("continueEffect");
		},
		effects: [`<<xchange-removeeffect "continue">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-resistance Pill",
		description:
			'레지스턴스 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음 느낌은 안도감이다. 두 번째는 훨씬 나쁘다. <span class="red">따끔거리는 가려움이 피부 위를 내달리고, 뒤이어 날것 같은 과민함</span>이 밀려와 해롭지 않은 접촉마저 불쾌하고 아프기 직전으로 느껴진다.<br><br>침을 꿀꺽 삼키며 이 반동이 지나가고 나면 그 지독히 위험한 레지스턴스 효과를 더는 겪지 않아도 된다는 생각에 집중하려 한다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.resistanceEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("resistanceEffect");
		},
		effects: [`<<xchange-removeeffect "resistance">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-portal Pill",
		description: '포털 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>먼저 안도감이 찾아온다. 무언가 잘못된 것이 마침내 몸에서 빠져나간 듯하다. 그러다 신경이 곤두선다. <span class="red">가려운 열기가 피부를 따라 퍼지고</span>, 이내 몸이 너무 예민해져서 가벼운 손길조차 불쾌해진다.<br><br>적어도 그 지독히 위험한 포털 효과는 더 겪지 않아도 되리라 믿으며 불편함을 견뎌 내려 한다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.portalEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("portalEffect");
		},
		effects: [`<<xchange-removeeffect "portal">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-fertile Pill",
		description: '가임 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>잠깐 동안은 머리 위에 드리웠던 위험이 조용히 물러간 듯한 안도감뿐이다. 그러다 후유증이 되물어뜯는다. <span class="red">끈질긴 가려움과 온몸의 과민함</span>이 옷이 스치는 것조차 아프게 만든다.<br><br>숨을 고르며, 이게 효과가 있었다면 임신의 위험은 더 걱정하지 않아도 된다고 스스로에게 되된다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.fertile && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("fertile");
		},
		effects: [`<<xchange-removeeffect "fertile">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-passion Pill",
		description: '열정 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>안도감이 먼저 몰려온다. 그러고는 신경이 한꺼번에 깨어나는 듯하다. <span class="red">미칠 듯한 가려움이 피부 위를 기어 다니고</span>, 몸이 너무 예민해져서 모든 감촉이 거슬리고 불쾌하고 희미하게 아프다.<br><br>그 지독히 위험한 열정 효과를 더는 겪지 않아도 되리라는 희망으로 견딘다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.passionEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("passionEffect");
		},
		effects: [`<<xchange-removeeffect "passion">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-dumb-bitch Pill",
		description:
			'멍청한 암캐 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음에는 머릿속 어딘가에서 안개가 걷히는 듯한 안도감만 느껴진다. 그러다 나머지 부작용이 한꺼번에 들이닥친다. <span class="red">가려운 피부, 날것 같은 신경, 온몸의 과민함</span>이 사소한 감각마저 불쾌하고 거의 아프게 만든다.<br><br>이를 악물고, 운이 좋다면 그 지독히 위험한 멍청한 암캐 효과를 더는 겪지 않아도 될 것이라는 생각을 붙든다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.dumbBitchEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("dumbBitchEffect");
		},
		effects: [`<<xchange-removeeffect "dumb-bitch">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-swell Pill",
		description: '부풀기 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>잠시 동안은 몸을 파고들던 팽만감이 마침내 물러나는 듯한 안도감뿐이다. 그러다 <span class="red">따끔거리는 가려움이 피부 전체에 피어나고, 뒤이어 날것 같은 과민함</span>이 밀려와 자기 몸이 쓰리고 불편해서 움직이기조차 거의 아프게 느껴진다.<br><br>반동을 애써 무시하며, 정신을 괴롭히고 몸을 바꾸던 그 끔찍한 부풀기 효과를 더는 겪지 않아도 된다는 생각으로 위안을 삼는다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.swellEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("swellEffect");
		},
		effects: [`<<xchange-removeeffect "swell">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-bimbo Pill",
		description:
			'빔보(힘보 포함) 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>처음 느낌은 안도감이다. 두 번째는 <span class="red">번져 가는 가려움과 날것 같은 온몸의 과민함</span>으로, 모든 감촉이 짜증스럽고 불쾌하고 거의 아프게 느껴진다.<br><br>억지로 숨을 고르며, 이 불편함이 정신을 괴롭히고 몸을 바꾸던 그 끔찍한 빔보 효과를 떨쳐 낸 대가이기를 바란다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.bimboEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("bimboEffect");
		},
		effects: [`<<xchange-removeeffect "bimbo">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-cumcure Pill",
		description: '컴큐어 효과를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>잠깐 동안은 안도감뿐이다. <span class="red">그러다 피부가 따끔거리기 시작한다.</span> 가려움이 날것 같은 과민함으로 깊어지며 온몸에 퍼지고, 아주 살짝 닿는 것조차 불쾌할 만큼 날카롭게 느껴진다.<br><br>정신을 괴롭히고 몸을 바꾸던 그 끔찍한 컴큐어 효과를 더는 겪지 않아도 되리라는 희망으로 비참한 여파를 견딘다.',
		warning_label: "경고: 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.cumcureEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("cumcureEffect");
		},
		effects: [`<<xchange-removeeffect "cumcure">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "X-Change Premium",
		description: "출처와 제조처를 알 수 없는 '프리미엄' X-체인지 알약이다. 되돌릴 수 없는 무언가를 고르려 하고 있다는 기분이 든다.",
		onTakeMessage:
			"프리미엄 알약을 손가락 사이에서 한순간 너무 오래 굴리다가... 결국 삼킨다.<br><br><span class=\"red\">반응은 거의 즉각적이다. 불덩이의 창이 배를 꿰뚫고 바깥으로 폭발하듯 퍼지면서, 줄 끊긴 꼭두각시처럼 당신을 무릎 꿇린다. 피부가 식은땀으로 번들거리고, 목이 조여들고, 맥박이 시야가 흐려질 만큼 세차게 때린다.<<gggpain>><br><br>모든 신경이 한꺼번에 불타오른다. 당신이 아직 그 안에 있는 채로 몸이 한 줄 한 줄 <i>다시 쓰이는</i> 것 같다. 어리석게도 잠시, 이게 새로운 무언가의 대가인지, 아니면 정말로 실험동물 취급을 당하고 있는 것인지 의문이 든다. <<ggstress>><<gtrauma>><br><br></span>마침내 가라앉자, 당신은 떨면서 얕게 숨을 쉬고 있다. 하지만 몸은 무엇이든 될 수 있을 것만 같다... 무엇이 될지 몸에게 말해 준다면.",
		warning_label: "경고: 실험적 제형입니다. 효과는 사람마다 다를 수 있습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_pills() {
			return "알약 먹기";
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "premium",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillpremium.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return !playerIsXChanged() ? 1 : 0;
		},
		take_blocked_reason() {
			return playerIsXChanged() ? xchangeTransformBlockedReason() : "";
		},
		effects: ["<<if !xchangePillProtectionActive()>><<pain 180>><<stress 130>><<trauma 80>><<gpain>><<gstress>><<gtrauma>><</if>>", "<<xchange-premium 7>>"],
	},

	{
		name: "SWP Anti-fertility Pill",
		description:
			"하이퍼 퍼틸리티 과정에 대응하는 X-체인지 대항제다. 자극제와 가속제를 몸에서 씻어 내어 진행 중인 임신을 본래 속도로 되돌리고 다태 확률 상승을 없앤다. 이미 이루어진 임신을 되돌리지는 않는다.",
		onTakeMessage:
			'<span class="purple">대항 알약을 삼킨다.</span><br><br>하이퍼 퍼틸리티의 작용이 중화되면서 몸에 남아 있던 온기가 가라앉는다.',
		warning_label: "경고: 이 알약은 하이퍼 퍼틸리티 과정만 취소합니다. 피임약이 아니며 임신을 끝내거나 막지 못합니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.hyperFertilityEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("hyperFertilityEffect");
		},
		effects: [`<<xchange-removeeffect "fertility">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "SWP Anti-feartoxin Pill",
		description: '공포 독소를 없애 준다고 광고하는 수상한 알약으로, 만족도 100% 보장이란다. <span class="red">부작용에 주의하라!</span>',
		onTakeMessage:
			'수상쩍은 출처를 아는 터라 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>두려움이 가장 먼저 옅어진다. 심장이 느려지고 손떨림이 멎는다. 그러다 반동이 덮친다. <span class="red">따끔거리는 가려움이 피부 위를 기어 다니고</span>, 이내 온몸이 너무 예민해져서 옷이 스치는 것조차 아프다.<br><br>숨을 고른다. 독소가 강요하던 공포는 사라졌지만, 이미 정신에 입힌 상처는 그대로이며 시간이 지나야만 흐려질 것이다.',
		warning_label:
			"경고: 독소만 취소합니다. 트라우마와 자제력은 독소가 남긴 상태 그대로 남아 평소 속도로 회복됩니다. 부작용이 생길 수 있습니다. 해당 효과가 있다고 검사에서 확인되지 않았다면 먹지 마십시오.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "anti-pill",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && V.xchange.pill.feartoxinEffect && V.xchange.pill.effectsKnown ? 1 : 0;
		},
		take_blocked_reason() {
			return xchangeAntiPillBlockedReason("feartoxinEffect");
		},
		effects: [`<<xchange-removeeffect "feartoxin">>`, '<<xchange-addsideeffect "antipill">>'],
	},

	{
		name: "X-Change Antidote",
		description:
			"감당할 의지와 돈이 있는 사람을 위한 값비싼 해결책이다. 현재 복용 중인 알약의 남은 지속 시간을 하루 줄여 주지만, 심각한 부작용이 따른다. 남은 지속 시간이 0이 되면 한 시간 안에 알약 효과가 끝난다.",
		onTakeMessage:
			'경고 라벨을 읽어 본 뒤 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>거의 곧바로 <span class="red">무릎을 꿇게 만드는 타는 듯한 통증</span>이 덮친다. 지옥처럼 타오르고 아프다. 머리가 쪼개질 듯한 두통, 메스꺼움, 갑작스러운 열, 숨 가쁨. 증상은 끝이 없다. 얼마나 끔찍한 기분인지 말로는 설명조차 되지 않는다.<<gggpain>><<ggstress>><br><br>그렇게 몇 분이 흐르자, 당신은 바닥에 웅크린 채 한 손으로 머리를, 다른 손으로 가슴을 움켜쥐고 있다. 몇 번이나 정신을 잃을 뻔하다가, 마침내 서서히 잦아들기 시작한다.<<gpain>><<gstress>><br><br>몸이 마침내 진정되자, 혹독한 경험에도 불구하고 간신히 몸을 일으킨다. 정말 어쩔 수 없는 경우가 아니라면 제정신인 사람이 누가 이런 고통을 스스로 겪으려 하겠는가?<<gstress>>',
		warning_label:
			"경고: 극심한 통증과 메스꺼움을 일으킵니다. 스트레스를 받는 상태에서는 권장하지 않습니다. 영구적이지 않은 알약의 효과 아래에서만 먹을 수 있습니다. 임신한 복용자나 기생충에 생식기가 감염된 복용자에게는 효과가 없습니다. 몸 곳곳에 박힌 X-체인지 화합물을 노리는 생물학적 제제를 방출합니다. 스스로 증식하지는 않습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "antidote",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() ? 1 : 0;
		},
		take_blocked_reason() {
			return playerIsXChanged() ? "" : "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
		},
		effects: [`<<xchange-antidote 1>>`],
	},

	{
		name: "X-Change Antidote Forte",
		description:
			"감당할 의지와 돈이 있는 사람을 위한 아주 값비싼 해결책이다. 현재 복용 중인 알약의 남은 지속 시간을 일주일 줄여 주지만, 극단적인 부작용이 따른다. 남은 지속 시간이 0이 되면 한 시간 안에 알약 효과가 끝난다.",
		onTakeMessage:
			'경고 라벨을 읽어 본 뒤 <span class="purple">망설이다가</span> 알약을 삼킨다.<br><br>거의 곧바로 <span class="red">무릎을 꿇게 만드는 타는 듯한 통증</span>이 덮친다. 지옥처럼 타오르고 아프다. 머리가 쪼개질 듯한 두통, 메스꺼움, 갑작스러운 열, 숨 가쁨. 증상은 끝이 없다. 얼마나 끔찍한 기분인지 말로는 설명조차 되지 않는다.<<gggpain>><<gggstress>><br><br>그렇게 몇 분이 흐르자, 당신은 바닥에 웅크린 채 한 손으로 머리를, 다른 손으로 가슴을 움켜쥐고 있다. 몇 번이나 정신을 잃을 뻔하다가, 마침내 서서히 잦아들기 시작한다.<<ggpain>><<ggstress>><br><br>몸이 마침내 진정되자, 혹독한 경험에도 불구하고 간신히 몸을 일으킨다. 정말 어쩔 수 없는 경우가 아니라면 제정신인 사람이 누가 이런 고통을 스스로 겪으려 하겠는가?<<gstress>>',
		warning_label:
			"경고: 살을 에는 듯한 통증과 메스꺼움을 일으킵니다. 어떤 종류든 스트레스를 받는 상태에서는 권장하지 않습니다. 영구적이지 않은 알약의 효과 아래에서만 먹을 수 있습니다. 임신한 복용자나 기생충에 생식기가 감염된 복용자에게는 효과가 없습니다. 몸 곳곳에 박힌 X-체인지 화합물을 노리는 생물학적 제제를 방출합니다. 스스로 증식하지는 않습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "antidote",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillcure.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() ? 1 : 0;
		},
		take_blocked_reason() {
			return playerIsXChanged() ? "" : "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
		},
		effects: [`<<xchange-antidote 7>>`],
	},

	{
		name: "Silver Reversal",
		description: "은빛 낯선 이가 준 라벨 없는 은색 알약이다. 무엇 때문에 영구화되었든, 영구적이 된 변화를 되돌린다.",
		onTakeMessage:
			'<span class="teal">알약을 삼킨다.</span><br><br>쇳맛이 난다. 위장에서 열기가 퍼져 나가고 몸이 원래대로 돌아가기 시작한다. 그것이 멈추면, 당신은 다시 자기 몸으로 돌아와 있다.',
		warning_label: "라벨이 없다. 은빛 낯선 이는 이 알약이 한 번만 듣는다고 했다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "antidote",
		shape: "pill",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pillsilver.png",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return playerIsXChanged() && pillIsPermanent() && !xchangePregnancyBlocksRevert() ? 1 : 0;
		},
		take_blocked_reason() {
			if (!playerIsXChanged()) return "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 작용할 대상이 없습니다.";
			if (!pillIsPermanent()) return "변화가 영구적이지 않습니다. 이 알약은 영구적인 변화에만 듣습니다.";
			return xchangeRevertPregnancyBlockedReason();
		},
		effects: [`<<xchange-restore>>`],
	},

	{
		name: "X-Change Test",
		description:
			"X-체인지 알약의 효과를 알아내고 남은 지속 시간을 더 정확하게 추정해 주는 일회용 검사기다. 사용하려면 끝부분을 사용자의 소변에 대고 화면에 메시지가 뜨기를 기다리면 된다.",
		onTakeMessage: "사용 설명서대로 한 뒤, 화면이 깜박이기 시작하는 것을 잠시 기다린다.",
		warning_label: "경고: 재사용하지 마십시오. 재사용하면 판독값이 정확하지 않습니다.",
		autoTake() {
			return false;
		},
		doseTaken() {
			return V.sexStats.pills.pills[this.name].doseTaken;
		},
		owned() {
			return V.sexStats.pills.pills[this.name].owned;
		},
		hpi_take_pills() {
			return "검사하기";
		},
		hpi_take_every_morning() {
			return "";
		},
		type: "xchange",
		subtype: "test",
		shape: "spray",
		overdose() {
			return V.sexStats.pills.pills[this.name].overdose;
		},
		icon: "img/misc/icon/pregnancy-test.gif",
		display_condition() {
			return this.owned() > 0 ? 1 : 0;
		},
		take_condition() {
			return V.xchange.pill && V.xchange.pill.active ? 1 : 0;
		},
		take_blocked_reason() {
			return playerIsXChanged() ? "" : "당신은 어떤 X-체인지 알약의 효과도 받고 있지 않습니다. 검사할 대상이 없습니다.";
		},
		effects: [`<<set V.xchange.pill.testPending to true>>`],
	}
);
