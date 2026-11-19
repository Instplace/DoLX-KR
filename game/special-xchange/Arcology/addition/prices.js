/* Arcology shop prices. Amounts are thousandths of a Cipher, as everywhere on the island.
   Each item has a pound value at Cipher's normal price; its vendor's behaviour turns that into the Cipher price shown.
   A shown price is saved as a quote and charged exactly, or not at all once it has expired. */
setup.arcologyPrice = {
	/* How long a shown price stays valid, in real milliseconds. */
	HOLD: 120000,

	/* kind: "spot" reprices with the live market, "list" keeps a price list and reprices it once Cipher has moved more than
	   15% and `lag` in-game days have passed. cheap: what happens when an old list makes Cipher prices a bargain.
	   crisis: what the vendor does from crisis level 2. temper: how the staff answer a question about the price. */
	vendors: {
		xstation: { who: "clerk", kind: "spot", temper: "helpful" },
		health: { who: "pharmacist", kind: "spot", crisis: "pounds", temper: "curt" },
		lumen: { who: "receptionist", kind: "spot", crisis: "surcharge", temper: "helpful" },
		training: { who: "instructor", kind: "spot", temper: "curt" },
		hotel: { who: "clerk", kind: "list", lag: 1, cheap: "update", temper: "helpful" },
		calibration: { who: "technician", kind: "list", lag: 3, cheap: "honour", temper: "helpful" },
		ballast: { who: "bartender", kind: "list", lag: 2, cheap: "accept", crisis: "refuse", temper: "irritated" },
		halcyon: { who: "bartender", kind: "list", lag: 1, cheap: "update", crisis: "refuse", temper: "irritated" },
		cafe: { who: "kiosk", kind: "list", lag: 2, cheap: "honour", crisis: "refuse" },
		dealer: { who: "dealer", kind: "list", lag: 2, cheap: "hostile", black: true, crisis: "pounds", temper: "irritated", stock: 2 },
	},

	/* [vendor, pence at Cipher's normal price]. Shop prices never go below 1 Cipher: the island is priced for the rich. */
	items: {
		pinkBasic: ["xstation", 9000000],
		blueBasic: ["xstation", 9000000],
		pinkNow: ["xstation", 3750000],
		blueNow: ["xstation", 3750000],
		painkillers: ["health", 2250000],
		treatment: ["lumen", 4500000],
		training: ["training", 6000000],
		night: ["hotel", 45000000],
		calibration: ["calibration", 7500000],
		drinkBallast: ["ballast", 1500000],
		drinkHalcyon: ["halcyon", 2250000],
		coffee: ["cafe", 1500000],
		stim: ["dealer", 4500000],
	},

	/* Pence per thousandth of a Cipher at the normal price. */
	unit() {
		return setup.arcologyFx.ANCHOR / 1000;
	},

	/* Today's day number in game time. */
	day() {
		return Math.floor(Time.date.timeStamp / 86400);
	},

	/* The rate a list vendor's prices were last set at, repriced once Cipher has moved far enough for long enough. */
	listRate(id, v, mid) {
		const lists = (V.xchange.arcology.lists ??= {});
		const l = lists[id];
		const today = this.day();
		if (!l || (today - l.d >= v.lag && Math.abs(mid / l.r - 1) > 0.15)) lists[id] = { r: Math.round(mid), d: today };
		return lists[id].r;
	},

	/* How unsettled the city is, from the market and the crisis it is in: 0 normal, 1 disturbed, 2 severe, 3 prolonged collapse. */
	stress() {
		if (!V.xchange?.arcology?.arrived) return 0;
		const level = setup.arcologyFx.crisis();
		if (level >= 3) return 3;
		if (level === 2) return 2;
		if (level === 1) return 1;
		const fx = setup.arcologyFx.sync();
		const day = setup.arcologyFx.change(fx, 86400);
		return Math.abs(day ?? 0) > 15 || setup.arcologyFx.boost(fx) >= 2.5 ? 1 : 0;
	},

	/* The price as it stands now, without saving a quote. */
	peek(id) {
		const [vid, base] = this.items[id];
		const v = this.vendors[vid];
		const fx = setup.arcologyFx.sync();
		const mid = setup.arcologyFx.mid(fx);
		const level = setup.arcologyFx.crisis();
		const normal = Math.max(1000, Math.ceil(base / this.unit()));
		const out = { id, vendor: vid, v, base, normal, ok: true, cheap: null, mult: 1 };
		if (level >= 2 && v.crisis === "refuse") return Object.assign(out, { ok: false, why: "refuse" });
		if (level >= 2 && v.crisis === "pounds") {
			/* Paid in pounds through money(), so town inflation applies once there. A dealer adds a premium for cash. */
			out.pounds = Math.round(base * (v.black ? 1.3 : 1));
			out.charge = setup.inflation?.price?.(out.pounds) ?? out.pounds;
			out.label = setup.arcologyFx.gbp(out.charge, true);
			return out;
		}
		const rate = v.kind === "list" ? this.listRate(vid, v, mid) : mid;
		if (v.crisis === "surcharge" && level >= 2) out.mult *= 1 + 0.1 * level;
		if (v.black) {
			const swing = Math.abs(setup.arcologyFx.change(fx, 86400) ?? 0) / 100;
			out.mult *= 1.15 + Math.min(0.6, swing + (setup.arcologyFx.boost(fx) - 1) * 0.1);
		}
		out.q = Math.max(1, Math.ceil((base * out.mult) / (rate / 1000)));
		out.worth = (out.q * mid) / 1000;
		if (v.cheap && out.worth < base * 0.6) out.cheap = v.cheap;
		/* Only a list left behind by the exchange rate can show less than 1 Cipher; that is what the seller reacts to. */
		if (!out.cheap) out.q = Math.max(1000, out.q);
		out.worth = (out.q * mid) / 1000;
		out.label = setup.arcology.cx(out.q);
		out.high = !out.cheap && out.q >= Math.ceil(normal * 1.3) && out.q > normal + 1;
		/* A clerk who notices an old list reprices at the market before taking payment. */
		if (out.cheap === "update") {
			out.q = Math.max(1000, Math.ceil((base * out.mult) / (mid / 1000)));
			out.label = setup.arcology.cx(out.q);
			out.corrected = true;
		}
		return out;
	},

	/* The price shown on a link. Saved so the click charges this amount, for HOLD milliseconds. */
	quote(id) {
		const p = this.peek(id);
		const pq = (V.xchange.arcology.pq ??= {});
		if (p.ok) pq[id] = { q: p.q, p: p.pounds, charge: p.charge, exp: Date.now() + this.HOLD };
		else delete pq[id];
		return p;
	},

	/* Whether the player can cover the quote. */
	affordable(p) {
		if (!p.ok) return false;
		if (p.pounds) return V.money >= p.charge;
		return (V.xchange.arcology.cipher ?? 0) >= p.q;
	},

	/* Charges a saved quote once. False, and nothing charged, when the quote is missing, expired or unaffordable. */
	pay(id) {
		const a = V.xchange.arcology;
		const h = a.pq?.[id];
		if (h) delete a.pq[id];
		if (!h || Date.now() > h.exp) {
			this.notice = "이 가격은 더 이상 유효하지 않습니다. 요금은 청구되지 않았습니다. 가격을 다시 확인하십시오.";
			return false;
		}
		if (h.p) {
			if (h.charge !== (setup.inflation?.price?.(h.p) ?? h.p)) {
				this.notice = "이 가격은 더 이상 유효하지 않습니다. 요금은 청구되지 않았습니다. 가격을 다시 확인하십시오.";
				return false;
			}
			if (V.money < h.charge) return false;
			statChange.money(-h.p, "arcologyShop", { cashOnly: true });
			return true;
		}
		if ((a.cipher ?? 0) < h.q) return false;
		a.cipher -= h.q;
		return true;
	},

	/* `units` is whole Cipher at its normal value; the returned demand is in wallet thousandths at today's rate. */
	demand(units) {
		const mid = setup.arcologyFx.mid(setup.arcologyFx.sync());
		return Math.max(1, Math.ceil((units * setup.arcologyFx.ANCHOR) / (mid / 1000)));
	},

	/* An item's price at the live market with the vendor's premium, ignoring any old list. */
	fair(id) {
		const p = this.peek(id);
		const mid = setup.arcologyFx.mid(setup.arcologyFx.sync());
		return Math.max(1000, Math.ceil((p.base * p.mult) / (mid / 1000)));
	},

	/* Bargain stock: how many more a vendor will sell today at an old price. */
	stockLeft(vid) {
		const v = this.vendors[vid];
		return (v.stock ?? 99) - (V.daily.arcologyBargain?.[vid] ?? 0);
	},

	noteBargain(vid) {
		(V.daily.arcologyBargain ??= {})[vid] = (V.daily.arcologyBargain[vid] ?? 0) + 1;
	},

	/* Why a price is unusual, from conditions that really hold. */
	cause(p) {
		const fx = setup.arcologyFx.sync();
		const level = setup.arcologyFx.crisis();
		const week = setup.arcologyFx.change(fx, 604800) ?? 0;
		const story = setup.arcologyNews.state().ev.find(e => ["market", "crash"].includes(e.f));
		if (p.pounds) return "pounds";
		if (p.cheap) return "old";
		if (level >= 2 && p.v.crisis === "surcharge") return "surcharge";
		if (level >= 1) return "crisis";
		if (story && week < -10) return "news";
		if (p.v.black) return "risk";
		if (setup.arcologyFx.mid(fx) < setup.arcologyFx.ANCHOR * 0.85) return "weak";
		return "list";
	},

	/* What the staff do and say when asked about the price: [action, line], picked by vendor and by the real cause.
	   The narration around it adds nothing the speaker has already said. */
	explainLines: {
		weak: {
			health: [
				[
					"계산대에 뜬 가격을 쳐다본다.",
					"사이퍼 가치는 떨어졌지만, 저희 공급처는 여전히 같은 금액을 파운드로 요구해요. 그래서 사이퍼를 더 내셔야 해요.",
				],
			],
			xstation: [
				[
					"카운터 화면을 당신 쪽으로 돌려 가격이 보이게 한다.",
					"가격은 본사가 파운드로 정해요. 사이퍼 가치가 떨어져서 기계가 사이퍼를 더 요구하는 거예요. 가격은 하루 중에도 바뀔 수 있어요.",
				],
			],
			lumen: [
				[
					"대답하기 전에 화면에서 치료 가격을 확인한다.",
					"치료비는 파운드 기준으로 그대로입니다. 지금은 사이퍼 가치가 떨어져서 결제하시려면 더 많은 사이퍼가 필요합니다.",
				],
			],
			training: [
				["손가락으로 수업 목록을 톡톡 두드린다.", "사이퍼 가치가 떨어졌어요. 교육비는 파운드 기준으로 그대로라서 사이퍼가 더 필요해요. 알겠죠?"],
			],
			hotel: [
				[
					"예약 화면에서 가격을 보여 준다.",
					"저희는 매일 아침 가격을 점검해요. 마지막으로 확인했을 때 사이퍼 가치가 떨어져 있어서, 이제 객실 요금이 사이퍼로 더 나와요.",
				],
			],
			calibration: [
				[
					"부스 옆 가격표를 톡톡 두드린다.",
					"사이퍼 가치가 떨어진 뒤에 그 목록을 고쳤어요. 부품값이랑 전기세는 여전히 내야 하니까 가격이 올랐어요.",
				],
			],
			ballast: [["천으로 계속 잔을 닦는다.", "사이퍼 가치가 떨어져서 가격을 올렸어. 살 거야, 말 거야?"]],
			halcyon: [["바 뒤쪽 화면의 음료 가격을 가리킨다.", "뉴스도 안 봤어? 사이퍼 가치가 떨어져서 음료값이 사이퍼로 더 나가."]],
			dealer: [["의자에 등을 기대고 당신을 쳐다본다.", "사이퍼 가치가 떨어졌어. 네가 옛날 가격으로 내겠다고 내가 손해 볼 순 없지."]],
			cafe: [["화면에 현재 가격을 띄운다.", "사이퍼 가치가 하락했습니다. 사이퍼 기준 가격이 이전보다 높을 수 있습니다."]],
		},
		news: {
			health: [
				[
					"문 근처의 돔 방송 화면을 힐끗 본다.",
					"뉴스에서 사람들이 사이퍼를 많이 팔고 있다던데요. 가치가 떨어져서 저희 납품 단가도 사이퍼로 더 올랐어요.",
				],
			],
			xstation: [
				[
					"대답하기 전에 당신 뒤의 대기 줄을 본다.",
					"사이퍼를 파는 사람이 늘어서 가치가 떨어졌어요. 그래서 사이퍼 기준 가격이 올랐어요. 돔 방송에서도 계속 보도하고 있고요.",
				],
			],
			training: [["수업 목록을 내려놓는다.", "뉴스 봐요. 사람들이 사이퍼를 팔아서 이제 교육비가 사이퍼로 더 들어요."]],
			halcyon: [
				["잔을 바 위에 내려놓는다.", "뉴스도 안 봤어? 사람들이 사이퍼를 팔아서 가치가 떨어지고 있잖아. 옛날 가격으로는 안 받아."],
			],
			ballast: [["음료 가격을 가리킨다.", "뉴스 봐. 사람들이 계속 사이퍼를 팔아 대서 가격을 올릴 수밖에 없었어."]],
			cafe: [["화면에 가격을 띄운다.", "사이퍼를 파는 사람이 늘어 가치가 떨어졌습니다. 결제하기 전에 표시된 가격을 확인하십시오."]],
			any: [["화면에 표시된 가격을 확인한다.", "사람들이 사이퍼를 팔아서 가치가 떨어졌어요. 그래서 가격이 올랐어요."]],
		},
		crisis: {
			health: [
				[
					"대답하기 전에 계산대를 다시 확인한다.",
					"폭락 이후로 사이퍼 가치가 계속 바뀌어요. 지금 가격은 알려 드릴 수 있지만, 그대로일 거란 보장은 못 해요.",
				],
			],
			xstation: [
				[
					"화면에서 가격을 확인한다.",
					"본사가 지금은 가격을 한 시간마다 바꿔요. 제가 바꿀 수는 없고요. 나중에 다시 오시면 더 쌀 수도 있어요.",
				],
			],
			lumen: [
				[
					"책상 옆 안내문을 읽는다.",
					"죄송하지만 사이퍼 기준 가격은 하루 중에도 바뀔 수 있습니다. 결제하시기 전에 화면의 금액을 확인해 주십시오.",
				],
			],
			training: [["수업 목록에서 고개를 든다.", "사이퍼가 폭락했어요. 수업을 예약하기 전에 가격부터 확인해요."]],
			hotel: [["오늘의 객실 요금을 화면에 띄운다.", "죄송해요. 저희는 매일 아침 가격을 점검하는데, 이게 오늘 요금이에요. 제가 바꿀 수는 없어요."]],
			dealer: [["가격을 보고 짧게 웃는다.", "사이퍼 가치는 계속 떨어져. 그걸로 낼 거면 훨씬 더 많이 내야 할걸."]],
			cafe: [["화면에 현재 가격을 띄운다.", "사이퍼 가치가 계속 변하고 있습니다. 결제하기 전에 표시된 가격을 확인하십시오."]],
			any: [["화면에서 현재 가격을 확인한다.", "사이퍼 가치가 크게 떨어졌어요. 그래서 지금 가격이 더 높아요."]],
		},
		surcharge: {
			lumen: [
				[
					"책상 옆 안내문을 가리킨다.",
					"통화 위기 동안에는 치료에 추가 요금이 붙습니다. 결제가 무산될 위험을 클리닉이 감당해야 하기 때문입니다.",
				],
			],
		},
		pounds: {
			health: [
				[
					"카운터 위의 손글씨 안내판을 보여 준다.",
					"죄송해요, 지금은 파운드만 받아요. 공급처가 사이퍼 가치가 안정될 때까지는 사이퍼를 안 받겠대요.",
				],
			],
			dealer: [["탁자 위의 물건 위에 한 손을 얹는다.", "파운드만 받아. 게다가 웃돈도 얹어야지. 지금은 다들 파운드를 원하거든."]],
			any: [["계산대 옆 안내판을 가리킨다.", "사이퍼 가치가 진정될 때까지는 파운드만 받아요."]],
		},
		risk: {
			dealer: [
				["금속 손가락으로 가격을 톡톡 두드린다.", "내가 쓰기도 전에 사이퍼 가치가 더 떨어지면 난 손해야. 그래서 웃돈을 받는 거지."],
				["물건을 조금 더 멀리 밀어 놓는다.", "영수증에 가격 고정까지 원해? 그럼 제대로 된 가게로 가. 거기서 이걸 팔아 주는 사람이 있는지 보든가."],
			],
		},
		old: {
			hotel: [
				[
					"프런트 화면을 확인하고 인쇄된 가격표를 바꿔 끼운다.",
					"죄송해요, 그 카드는 갱신이 안 됐네요. 오늘 밤에는 화면에 나온 가격으로 내셔야 해요.",
				],
			],
			halcyon: [["계산서 화면의 금액을 톡 두드린다.", "그건 옛날 가격이야. 사이퍼 가치가 떨어졌으니까 지금 가격으로 받을 거야."]],
			calibration: [["부스 옆 가격표를 가리킨다.", "네, 사이퍼 가치가 바뀌긴 했어요. 그래도 저 목록에 있는 가격으로 받을게요."]],
			ballast: [["옛 가격표를 보고 어깨를 으쓱한다.", "그래, 옛날 가격이야. 그래도 그 가격에 팔아 줄게."]],
			cafe: [["화면에 게시된 가격을 보여 준다.", "메뉴에 적힌 가격은 아직 유효합니다. 그 금액을 내시면 됩니다."]],
			dealer: [["물건을 당신에게서 멀리 치운다.", "내가 그 가격에 팔 거라고 생각해? 다시 물어봐."]],
			any: [["가격표를 확인한다.", "그건 옛날 가격이에요. 결제하기 전에 판매자에게 확인해 보세요."]],
		},
		list: {
			cafe: [["화면에 가격을 띄운다.", "메뉴에 적힌 가격이 결제 금액입니다."]],
			any: [["가격표를 가리킨다.", "그게 목록에 적힌 가격이에요. 누구나 똑같이 내요."]],
		},
	},

	explain(p) {
		const why = this.cause(p);
		const set = this.explainLines[why] ?? this.explainLines.list;
		const options = set[p.vendor] ?? set.any ?? Object.values(set)[0];
		const [action, line] = options[Math.floor(setup.arcologyNews.seed(p.id + this.day()) * options.length)];
		/* Pounds are paid at town prices, which the player may not expect on the island. */
		const town = p.pounds && setup.inflation?.multiplier?.() > 1.05;
		return { why, action, line, town };
	},
};

/* An expired quote disables the links it priced and offers a fresh look; a refused payment explains itself once. */
$(document).on(":passagestart.arcologyPrice", () => clearTimeout(setup.arcologyPrice.timer));
$(document).on(":passagedisplay.arcologyPrice", () => {
	const P = setup.arcologyPrice;
	if (P.notice) {
		$("<div class='arc-price-notice' role='status'></div>").text(P.notice).prependTo(".passage");
		delete P.notice;
	}
	const priced = $(".passage .arc-priced");
	if (!priced.length) return;
	P.timer = setTimeout(() => {
		priced.addClass("expired").find("a").attr({ "aria-disabled": "true", tabindex: "-1" });
		const box = $("<div class='arc-price-notice' role='status'>That price is no longer valid. </div>");
		box.wiki('<<link "Check the prices again" `passage()`>><</link>>');
		box.insertBefore(priced.first());
	}, P.HOLD);
});
