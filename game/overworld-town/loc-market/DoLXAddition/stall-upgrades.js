/* The player's market stall upgrades, saved in V.pcStall (owned ids, paper bag and tote bag stock).
 * Costs are in player money units (100 per £). A fully upgraded stall should earn about a third more. */

setup.pcStall = {
	upgrades: [
		/* Pushing stock and overpricing cost 20 trust each, so +15 starting trust never covers two of them. */
		{ id: "tablecloth", track: "impression", tier: 1, cost: 15000, name: "식탁보와 가격표", note: "손님이 조금 더 호의적으로 시작합니다" },
		{ id: "sign", track: "impression", tier: 2, cost: 50000, name: "페인트칠한 간판과 차양", note: "손님이 더 호의적으로 시작합니다" },
		{ id: "lights", track: "impression", tier: 3, cost: 120000, name: "전구 장식과 고리버들 바구니", note: "손님이 훨씬 더 호의적으로 시작합니다" },
		{ id: "lavender", track: "safety", tier: 1, cost: 30000, name: "화분에 심은 라벤더", note: "손님이 더 천천히 흥분합니다" },
		{ id: "cameras", track: "safety", tier: 2, cost: 100000, name: "시장 보안 카메라", note: "음란한 사건이 줄고 흥분이 더 느려집니다" },
		{ id: "fridge", track: "profit", tier: 1, cost: 40000, name: "미니 냉장고", note: "과일, 해산물, 고기, 채소류 +10%" },
		{ id: "microwave", track: "profit", tier: 1, cost: 30000, name: "전자레인지", note: "조리된 요리 +10%" },
		{ id: "showcase", track: "profit", tier: 2, cost: 80000, name: "유리 진열장", note: "모든 품목 +5%" },
		{ id: "toteRack", track: "quantity", tier: 1, cost: 20000, name: "토트백 진열대", note: "재사용 가방을 비치할 수 있습니다" },
	],
	disposablePack: { amount: 50, cost: 500 },
	/* Customers pay a tote back at cost, so totes only cost you while they sit unsold. */
	reusableCost: 150,
	reusablePack: 20,
	returningChance: 0.25,
	disposableBoost: 0.15,
	reusableBoost: 0.25,
	coldCategories: ["fruit", "seafood", "meat", "produce"],
};

function ensurePcStall() {
	if (!V.pcStall || typeof V.pcStall !== "object") V.pcStall = {};
	const stall = V.pcStall;
	if (!Array.isArray(stall.owned)) stall.owned = [];
	if (!Number.isFinite(stall.bagsDisposable)) stall.bagsDisposable = 0;
	if (!Number.isFinite(stall.bagsReusable)) stall.bagsReusable = 0;
	return stall;
}
window.ensurePcStall = ensurePcStall;

function pcStallHas(id) {
	return !!V.pcStall && Array.isArray(V.pcStall.owned) && V.pcStall.owned.includes(id);
}
window.pcStallHas = pcStallHas;

function pcStallTier(track) {
	return setup.pcStall.upgrades.filter(upgrade => upgrade.track === track && pcStallHas(upgrade.id)).length;
}
window.pcStallTier = pcStallTier;

/* Upgrades not owned yet whose earlier tier in the same track is owned. */
function pcStallAvailable() {
	return setup.pcStall.upgrades.filter(upgrade => !pcStallHas(upgrade.id) && pcStallTier(upgrade.track) >= upgrade.tier - 1);
}
window.pcStallAvailable = pcStallAvailable;

function pcStallBuy(id) {
	const stall = ensurePcStall();
	if (!stall.owned.includes(id) && setup.pcStall.upgrades.some(upgrade => upgrade.id === id)) stall.owned.push(id);
}
window.pcStallBuy = pcStallBuy;

function pcStallStartTrust() {
	return [0, 5, 10, 15][pcStallTier("impression")];
}
window.pcStallStartTrust = pcStallStartTrust;

/* Added to the customer attention roll (out of 10000 for events, 15000 for auto sales). */
function pcStallAttentionBonus() {
	return pcStallTier("impression") * 250;
}
window.pcStallAttentionBonus = pcStallAttentionBonus;

function pcStallArousalMult() {
	return [1, 0.8, 0.65][pcStallTier("safety")];
}
window.pcStallArousalMult = pcStallArousalMult;

/* Widens the lewd incident roll: 1/6-1/3 with no cameras, about 1/8-1/4 with them. */
function pcStallIncidentRange() {
	return pcStallHas("cameras") ? 24 : 18;
}
window.pcStallIncidentRange = pcStallIncidentRange;

function pcStallPriceMult(key) {
	const category = setup.foodstuff[key]?.category;
	let mult = 1;
	if (pcStallHas("fridge") && setup.pcStall.coldCategories.includes(category)) mult += 0.1;
	if (pcStallHas("microwave") && category === "dish") mult += 0.1;
	if (pcStallHas("showcase")) mult += 0.05;
	return mult;
}
window.pcStallPriceMult = pcStallPriceMult;

/* Stock is only taken when the sale goes through (pcStallUseBag), since customers can still walk away. */
function pcStallBagAmount(amount) {
	let boost = 0;
	V.stall_bag = "";
	if (V.pcStall?.bagsReusable > 0) {
		V.stall_bag = Math.random() < setup.pcStall.returningChance ? "own" : "reusable";
		boost = setup.pcStall.reusableBoost;
	} else if (V.pcStall?.bagsDisposable > 0) {
		V.stall_bag = "disposable";
		boost = setup.pcStall.disposableBoost;
	}
	return Math.floor(amount * (1 + boost) + Math.random());
}
window.pcStallBagAmount = pcStallBagAmount;

/* Returns what the customer pays back for a tote, matching the inflated price you paid for it. */
function pcStallUseBag() {
	const stall = V.pcStall;
	const bag = V.stall_bag;
	delete V.stall_bag;
	if (bag === "reusable" && stall?.bagsReusable > 0) {
		stall.bagsReusable--;
		return Math.round(setup.inflation.price(setup.pcStall.reusableCost));
	}
	if (bag === "disposable" && stall?.bagsDisposable > 0) stall.bagsDisposable--;
	return 0;
}
window.pcStallUseBag = pcStallUseBag;
