/* Dome Broadcast's wording. Turns a saved article record into a headline, body, byline and comments.
   Only reads the record and static island data; it never decides what happened. */
setup.arcologyNewsText = {
	cap: s => s.charAt(0).toUpperCase() + s.slice(1),

	/* A fixed choice for this article and purpose. */
	pick(rec, key, list) {
		return list[Math.floor(setup.arcologyNews.seed(rec.id + "|" + key + "|" + (rec.n ?? 0)) * list.length)];
	},

	district(id) {
		return setup.arcology.districts[id]?.name ?? "섬";
	},

	reporters: ["Ines Corva", "Tomas Reyl", "Hana Moreau", "Dex Okafor", "Lio Brandt", "Mara Kade", "Sun-Yi Park", "Ade Varga"],
	/* The reporter's note under each article, written in their own voice. */
	reporterBios: {
		"Ines Corva": "저는 유닛 환전소에서 사이퍼 시세를 지켜보고 마켓 가에서 거래인들을 만납니다. 시세가 바뀌면 무엇 때문인지 알고 싶습니다.",
		"Tomas Reyl":
			"저는 집행국, 법원, 등록소를 취재합니다. 매일 아침 체포와 고소 보고서를 읽는데, 권한 있는 누구도 설명하려 들지 않는 사건도 빠뜨리지 않습니다.",
		"Hana Moreau":
			"저는 대부분의 시간을 이 섬 주민 다수가 사는 아파트 단지와 스택에서 보냅니다. 이곳 사람들은 당국이 발표하기 전에 무슨 일이 있었는지 먼저 알려 주곤 합니다.",
		"Dex Okafor": "저는 기자가 되기 전 6년 동안 아이언웍스에서 일했습니다. 지금도 공장을 직접 찾아가고 근무 일정표를 직접 읽습니다.",
		"Lio Brandt": "셔틀 정류장이 폐쇄되면 가장 가까운 운행 정류장까지 직접 걸어갑니다. 독자에게는 이동에 시간이 얼마나 더 걸리는지 알 권리가 있습니다.",
		"Mara Kade": "저는 클리닉을 찾아다니고 임플란트를 만드는 사람들과 이야기합니다. 광고가 빼놓은 위험, 비용, 제한 사항을 묻습니다.",
		"Sun-Yi Park": "저는 저녁 시간을 술집과 클럽 취재로 보냅니다. 어떤 곳은 등록소가 목록을 갱신하기도 전에 문을 열고 닫습니다.",
		"Ade Varga":
			"저는 유출된 문서와 회사 장부, 특히 누군가 숨기려 한 것들을 조사합니다. 제보는 돔 방송국 데스크로 보내 주세요.",
	},

	/* Everything a writer needs, from the record alone. */
	context(rec) {
		const N = setup.arcologyNews;
		const c = {
			D: this.district(rec.d),
			O: N.orgName(rec.o),
			O2: N.orgName(rec.o2),
			O3: N.orgName(rec.o3),
			P: N.places[rec.p]?.name ?? "",
		};
		c.Oc = this.cap(c.O);
		c.O2c = this.cap(c.O2);
		c.O3c = this.cap(c.O3);
		c.Pc = this.cap(c.P);
		return c;
	},

	/* "the second ... in five weeks" lines when the same thing happened here before. */
	again(rec, noun) {
		if (!rec.prev) return "";
		const [ago, out] = rec.prev;
		const span = ago < 14 ? `${ago} days` : `${Math.round(ago / 7)} weeks`;
		const how =
			{
				reopened: "수리를 마치고 다시 문을 열었다",
				fined: "운영자들이 벌금을 물었다",
				takeover: "다른 패거리가 길모퉁이를 차지했다",
				truce: "패거리들이 서로 떨어져 지내기로 합의했다",
				"broken up": "집행국이 해산시켰다",
				recovered: "물건을 되찾았다",
				unresolved: "책임을 진 사람은 없었다",
				exposed: "처음의 설명이 틀린 것으로 드러났다",
				overstated: "공식 설명이 나중에 반박당했다",
				faded: "더 이상 보도가 나오지 않았다",
			}[out] ?? "그 뒤에 어떻게 됐는지 보도한 사람은 거의 없었다";
		return `이곳에서 ${span} 사이에 ${noun}【이가】 두 번째로 벌어졌다. 지난번에는 ${how}.`;
	},

	write(rec, discussion = true) {
		const out = { story: this.story, notice: this.notice, reminder: this.reminder, weekly: this.weekly, break: this.breaking }[rec.k].call(this, rec);
		// Each desk has its own reporter, so the byline and the bio under the article agree with the story.
		out.byline ??=
			out.tone === "investigation"
				? "Ade Varga"
				: ["nightlife", "glasshouse"].includes(rec.f)
				? "Sun-Yi Park"
				: {
						MARKETS: "Ines Corva",
						BUSINESS: "Ines Corva",
						SECURITY: "Tomas Reyl",
						CRIME: "Tomas Reyl",
						SOCIETY: "Hana Moreau",
						PEOPLE: "Hana Moreau",
						INDUSTRY: "Dex Okafor",
						TRANSIT: "Lio Brandt",
						CYBERNETICS: "Mara Kade",
				  }[out.cat] ?? this.pick(rec, "by", this.reporters);
		const publicDistrict = setup.arcologyNews.publicSubject(rec).d;
		out.place ??= publicDistrict ? this.district(publicDistrict) : "";
		out.heat ??= 0.4 + 0.2 * (rec.sev ?? 1);
		if (discussion) out.residents = rec.rc ?? out.residents ?? this.residents(rec, out);
		out.options ??= this.options(rec, out);
		return out;
	},

	story(rec) {
		const fam = this.families[rec.f];
		const c = this.context(rec);
		const w = fam[rec.ph].call(this, rec, c);
		const body = w.body.filter(Boolean);
		if (rec.f === "business") {
			const context = {
				expansion:
					rec.ph === "withdrawn"
						? "회사는 새 층을 여는 계획을 취소했다. 기존 지점은 가격과 영업시간이 그대로인 채 계속 문을 연다."
						: "회사는 새 가격이나 영업시간을 발표하지 않았다. 일자리에 지원한 사람들도 모집 인원이 몇 명인지 듣지 못했다.",
				contract: "두 회사가 계약을 두고 다투고 있다. 이 분쟁이 고객이 내는 값이나 고객에게 제공되는 서비스를 바꾸지는 않았다.",
				wages: "논쟁은 노동자의 급여에서 빠져나가는 돈에 관한 것이다. 고객 가격과 영업시간은 바뀌지 않았다.",
				leak: ["outcome", "unresolved"].includes(rec.ph)
					? "등록소는 이 분쟁에 관련된 문서를 확인했다. 회사의 모든 구매를 조사한 것은 아니다. 환불이나 가격 변경은 발표되지 않았다."
					: "송장에 적힌 금액이 서로 다르지만, 그것이 누군가 부정직하게 행동했다는 증거는 되지 않는다. 조사관들은 배송 내역을 확인하고 문서가 진짜인지 가려야 한다.",
				recall:
					"리콜은 공지에 명시된 부품 묶음에만 적용된다. 고객은 교체 비용을 내기 전에 자신의 부품이 대상에 들어 있는지 확인해야 한다.",
				stake: "한 회사가 이제 다른 회사의 지분을 쥐고 있다. 이번 매입으로 가격, 영업시간, 서비스가 바뀌지는 않았다.",
				irregular:
					"문제가 된 송금에는 고객의 돈이 얽혀 있다. 회사는 자체 계좌를 확인하고 있으며, 독립된 검토자가 내놓은 결과는 아직 없다.",
			}[rec.s];
			if (context) body.push(context);
		} else if (rec.f === "implant") {
			body.push(
				{
					trial:
						rec.ph === "fixed"
							? "클리닉은 이번 시험의 지원자를 더는 받지 않는다. 예전 광고를 보고 연락한 사람은 다음 공지를 기다려야 한다. 게스트는 여전히 새 신체 임플란트를 받을 수 없다."
							: "클리닉은 게스트가 지원할 수 있는지 밝히지 않았다. 임플란트가 정확히 무슨 작용을 하는지, 어떤 위험이 있는지, 지원자가 시험을 그만두려 하면 어떻게 되는지도 설명하지 않았다.",
					malfunction: "환자는 클리닉 공지를 확인해 이번 문제가 자신의 임플란트에 영향을 주는지 알아봐야 한다.",
					backup:
						"게스트는 등록소에서 자신의 기록을 확인할 수 있지만 그곳에서 백업본을 만들 수는 없다. 직원에게 적용되는 새 규정도 이 제한을 바꾸지 않는다.",
					unlicensed:
						"클리닉은 허가 없이 설치된 임플란트를 검사할 수 있다. 그렇다고 게스트가 새 임플란트를 설치받아도 된다는 뜻은 아니다.",
					xchange:
						"게스트들이 릴레이 가의 X-체인지 스테이션 밖에서 기다리고 있다. 게스트 창구는 여전히 게스트용으로 정해진 제품만, 정해진 하루 한도 안에서 판매한다. 직원은 제한 서비스를 제안하기 전에 방문객마다 권한을 확인한다.",
				}[rec.s]
			);
		} else if (rec.f === "industry" && rec.ph === "reopen") {
			body.push(
				setup.arcologyNews.places[rec.p]?.closable
					? `${c.D}의 ${c.Pc}【은는】 다시 일자리 예약을 받는다. 다른 작업장은 영향을 받지 않는다.`
					: `이번 소식은 ${c.D}의 ${c.P}에만 해당한다. 위에서 설명한 것 말고 급여 변경은 발표되지 않았다.`
			);
		} else if (rec.f === "transit" && rec.ph !== "reopen") {
			body.push(
				"승객은 집을 나서기 전에 셔틀 화면을 확인해야 한다. 폐쇄된 정류장은 목적지로 선택할 수 없다. 대체 도보 경로는 표시되지 않았다. 승객은 걸어서 지나갈 구역에 자신의 계정으로 들어갈 수 있는지도 확인해야 한다."
			);
		} else if (rec.f === "sweep" && rec.ph === "announce") {
			body.push(
				"집행국은 종료 날짜를 발표하지 않았다. 집행관들은 사람들이 계정으로 출입할 수 있는 구역을 지나가는 중에도 임플란트를 검사하고 있다."
			);
		} else if (rec.f === "idcheck" && ["found", "tighten"].includes(rec.ph)) {
			body.push(
				"집행관들이 구역을 지나는 모든 사람에게 추가 검사를 하고 있다. 등록소는 복제된 기록의 출처를 찾지 못했고, 검사받는 게스트 전원이 연루되었다는 증거도 없다."
			);
		} else if (rec.f === "feud" && ["clash", "retaliation"].includes(rec.ph)) {
			body.push(
				`싸움은 사람들이 살고 장사하고 일하는 거리에서 벌어지고 있다. 어느 패거리와도 관계없는 사람이라도 ${c.D}【을를】 지나가다가 다칠 수 있다.`
			);
		} else if (rec.f === "smuggle" && rec.ph === "missing") {
			body.push("사라진 물건은 아직 찾지 못했다. 조사관들은 누가 가져갔는지, 어디로 갔는지 밝혀내지 못했다.");
		} else if (rec.f === "nightlife" && rec.ph === "notice") {
			body.push(
				rec.s === "raid"
					? "이번 검사는 이 업소에만 적용된다. 도시 전체 폐쇄는 없고 게스트 권한도 바뀌지 않는다."
					: "이번 행사는 이 업소에 관한 것이며 구역의 영업시간에는 영향이 없다. 귀갓길을 계획하기 전에 셔틀 안내판을 확인해야 한다."
			);
		} else if (rec.f === "glasshouse") {
			body.push(
				"초대받은 손님만 글래스하우스에 들어갈 수 있다. 전용 엘리베이터 옆의 스캐너가 방문객마다 계정을 확인한다. 누군가 도착하는 모습을 봤다고 해서 다른 사람이 들어갈 권한이 생기는 것은 아니다."
			);
		}
		const history = this.chronology(rec);
		if (history.length) body.splice(w.body.filter(Boolean).length, 0, ...history);
		body.push(...this.explanation(rec, c));
		// A follow-up keeps the new account and chronology, rather than printing the same explainer again.
		const explained = new Set();
		for (const [ph, at, n, sp, id, q] of rec.h ?? []) {
			const earlier = this.story(Object.assign({}, rec, { ph, at, n, sp, id, q, h: [] }));
			for (const p of earlier.body) explained.add(setup.arcologyNews.normalize(p));
		}
		const tone = w.tone ?? (rec.sp === 2 ? "investigation" : "routine");
		return {
			cat: setup.arcologyNews.families[rec.f].cat,
			title: w.title,
			dek: w.dek ?? "",
			body: body.filter((p, i) => p && (i < w.body.filter(Boolean).length || !explained.has(setup.arcologyNews.normalize(p)))),
			tone,
			lean: fam.lean,
			byline: w.byline,
		};
	},

	/* Writers for each family and stage. Each returns { title, dek, body[] } and may set tone or byline. */
	chronology(rec) {
		const history = rec.h ?? [];
		// One newsroom-style line naming the earlier reports by date and headline; the full text stays under "More on this story".
		const told = history
			.filter((x, i) => i === 0 || i >= history.length - 2)
			.map(([ph, at, n, sp, id, q]) => {
				const earlier = Object.assign({}, rec, { ph, at, n, sp, id, q, h: [] });
				const d = new DateTime(at);
				const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][d.month - 1];
				return `${d.day} ${month}, “${this.families[rec.f][ph].call(this, earlier, this.context(earlier)).title}”`;
			});
		if (!told.length) return [];
		const later = told.slice(1);
		return [`이 기사는 우리 보도(${told[0]})${later.length ? `와 우리 ${later.length > 1 ? "후속 보도들" : "후속 보도"}(${later.join(", ")})` : ""}에 이어지는 내용이다.`];
	},

	/* The numbered summary above a longer report: the opening sentence of each longer paragraph, so a point never just
	   repeats a one-line paragraph. Short reports and the line about earlier reports are left out. */
	keyPoints(art) {
		if (art.k !== "story" || art.list) return [];
		const points = art.body
			.filter(p => !p.startsWith("This follows our report"))
			.map(p => p.split(/(?<=[.!?])\s+(?=[A-Z])/))
			.filter(parts => parts.length > 1)
			.map(parts => parts[0])
			.slice(0, 3);
		return points.length > 1 ? points : [];
	},

	/* Links only point to retained, already published reporting inside the reader. */
	linkedText(text, id) {
		const N = setup.arcologyNews;
		const current = N.state().arts.find(a => a.id === id);
		if (!current) return [{ text }];
		const candidates = N.state()
			.arts.filter(a => a.id !== id && a.k === "story" && a.at <= Math.min(current.at, N.now()))
			.sort((a, b) => b.at - a.at);
		const names = [];
		for (const o of [N.publicSubject(current).o, current.o2, current.o3].filter(Boolean)) {
			const target = candidates.find(a => [a.o, a.o2, a.o3].includes(o));
			if (target) names.push({ name: N.orgName(o), id: target.id });
		}
		const publicDistrict = N.publicSubject(current).d;
		const district = candidates.find(a => N.publicSubject(a).d === publicDistrict);
		if (district && publicDistrict) names.push({ name: this.district(publicDistrict), id: district.id });
		const parts = [];
		let remaining = text;
		while (remaining) {
			const matches = names
				.map(x => ({ ...x, pos: remaining.toLowerCase().indexOf(x.name.toLowerCase()) }))
				.filter(x => x.pos >= 0)
				.sort((a, b) => a.pos - b.pos || b.name.length - a.name.length);
			const next = matches[0];
			if (!next) {
				parts.push({ text: remaining });
				break;
			}
			if (next.pos) parts.push({ text: remaining.slice(0, next.pos) });
			parts.push({ text: remaining.slice(next.pos, next.pos + next.name.length), id: next.id });
			remaining = remaining.slice(next.pos + next.name.length);
			names.splice(
				names.findIndex(x => x.id === next.id && x.name === next.name),
				1
			);
		}
		return parts;
	},

	explanation(rec, c) {
		const finished = Boolean(setup.arcologyNews.families[rec.f]?.stages[rec.ph]?.out);
		if (rec.f === "business" && rec.s === "expansion" && rec.ph === "withdrawn")
			return [
				`회사는 새 층을 열고 직원을 더 뽑으려던 계획을 취소했다. 그 일자리에 지원한 사람들은 근무 시작일을 받지 못한다. 회사는 사업에 비용이 너무 많이 든다고 하지만 어떤 비용이 늘었는지는 설명하지 않았다. 기존 지점은 계속 문을 연다.`,
			];
		if (rec.f === "business" && rec.s === "expansion" && rec.ph === "outcome")
			return [
				`회사는 앞선 보도에서 다룬 새 층을 열었다. 그곳에서 몇 명이 일할지, 고객의 대기 시간이 줄어들지는 밝히지 않았다. 가격은 바뀌지 않았다.`,
			];
		if (rec.f === "business")
			return [
				{
					expansion: `추가된 층 덕분에 회사는 ${c.D}에서 더 넓은 공간을 쓰게 됐지만, 그 공간을 쓰려면 직원이 더 필요하다. 회사는 새 직원이나 영업시간을 확인해 주지 않았다. 그래서 고객은 늘어난 공간이 대기 시간을 줄여 줄지 알 수 없다.`,
					contract: `${c.O}【은는】 ${c.O2}【이가】 대가를 받은 작업을 끝내지 못했다고 주장한다. 공급업체는 동의하지 않으며 대금은 여전히 분쟁 중이다. 두 회사는 누구 책임인지 밝히지 않고 비공개로 합의할 수도 있다. 어느 쪽도 걸린 금액을 밝히지 않았고 공공 서비스는 바뀌지 않았다.`,
					wages: `직원들은 계속 일하고 있지만 장비 사용료가 급여에서 빠져나가고 있다. 노동자들은 공제 내역에 의문을 제기하며 그 청구가 허용된 것인지 알고 싶어 한다. 공제 항목이 적힌 급여 명세서와 서명된 계약서가 있다면 그 의문에 답하는 데 도움이 될 수 있다.`,
					leak: `조사관들은 서로 다른 송장이 같은 물품을 가리키는지 확인해야 한다. 배송비, 나뉘어 들어온 배송, 회계 실수가 금액 차이를 설명할 수도 있다. 송장을 하나씩 배송 기록과 맞춰 보면 회사가 대금을 두 번 냈는지 알 수 있다. 시민 등록소는 문서를 제공한 사람의 주장을 확인해 주지 않았다.`,
					irregular: `고객들은 어느 계좌가 영향을 받았는지, 돈이 돌아왔는지 알고 싶어 한다. 회사가 기록을 바로잡더라도 고객이 환불을 받았는지는 알 수 없다. 돔 방송국은 회사의 설명을 자신들이 확인한 문서와 대조하고 있다.`,
					recall: `고객은 회사에 교체 부품이 리콜 대상 묶음에 속하는지 확인해 달라고 요청할 수 있다. 마켓 가에서 싸게 팔리는 부품은 출처를 믿을 만한 기록이 없을 수도 있다. 알려진 결함이 회사가 파는 모든 부품에서 보고된 것은 아니다.`,
					stake: `${c.O}【은는】 ${c.O2}의 일부를 사들였지만, 매입 규모가 회사에 대한 지배권을 줄 만큼 크지 않을 수도 있다. 어느 쪽도 지불한 금액이나 고객에게 달라지는 점을 발표하지 않았다. 앞으로 지켜볼 일은 직원들에게 알려지는지, 소유권이 공식으로 기록되는지, ${c.O}【이가】 더 큰 지분을 사들이는지다.`,
				}[rec.s],
			].filter(Boolean);
		if (rec.f === "industry") {
			if (rec.sp === 1)
				return [
					`${c.Oc}【은는】 사고가 끝났고 교대 근무가 평소처럼 돌아가고 있다고 밝혔다. 어떤 점검을 했는지는 밝히지 않았고, 독립된 점검관의 보고도 없다. ${c.P}에서 근무를 맡을 생각이 있는 사람이 믿을 것은 지금으로서는 회사의 말뿐이다.`,
				];
			return [
				{
					press: `The press that split during the shift is out of use. Repairing it will get production moving again; finding out why it failed means examining its condition and the warnings workers say they gave. ${
						rec.ph === "incident"
							? "노동자 두 명이 화상 치료를 받았다."
							: (rec.h ?? []).some(([ph, , , sp]) => ph === "incident" && !sp)
							? "우리의 첫 보도는 노동자 두 명이 화상 치료를 받았다고 전했으며, 그 뒤로 이들에 대한 소식은 없다."
							: "확인된 부상 사례는 없다."
					}`,
					power: `공장이 한 교대를 온전히 돌리려면 안정적인 전기 공급이 필요하다. 기술자들은 손상된 연결부를 고칠 수 있지만, 왜 고장 났는지는 조사관들이 따로 밝혀야 한다. 노동자와 관리자는 장비가 과부하였는지, 정비가 부실했는지를 두고 의견이 갈린다. 점검관이 내놓은 결론은 아직 없다.`,
					shortage: `아직 도착하지 않은 자재를 기다리느라 생산이 더뎌졌다. ${c.D}의 다른 작업장에서는 같은 문제가 보고되지 않았다.`,
					walkout: `노동자들은 이미 한 초과 근무의 수당을 받지 못했다며 일손을 놓았다. 회사가 수당 지급에 합의하면 이들을 복귀시킬 수 있지만, 노동자들이 그 돈을 실제로 받아야 한다. 어느 쪽도 밀린 금액을 공개하지 않았고, 기사에 이름이 실려도 좋다고 한 노동자는 없다.`,
				}[rec.s],
				finished
					? ""
					: `Workers planning to travel to ${c.P} need to know whether their shift is running today. ${
							rec.shut ? "교대 근무가 중단됐으며, 회사는 언제 다시 시작할지 밝히지 않았다." : "이번 차질로 모든 교대 근무가 멈춘 것은 아니다."
					  } Nobody has said how much pay has been lost.`,
			].filter(Boolean);
		}
		if (rec.f === "transit")
			return [
				rec.sp === 1
					? `도시 교통국은 운행이 정상이라고 밝혔지만, 수정된 시간표를 내놓지도 노선의 화물 운송을 설명하지도 않았다. 승객은 이 발표에 기대지 말고 탑승 화면을 확인하라는 권고를 받는다.`
					: `${
							rec.ph === "reopen"
								? "승객은 이 정류장을 다시 예약할 수 있다."
								: "셔틀이 다시 정차하기 전까지 승객은 이 정류장에서 탈 수도, 예약할 수도 없다."
					  } Passengers who decide to walk will have to travel through the district themselves.`,
				rec.ph === "exposed"
					? "도시 교통국은 정류장이 운행 중이라고 승객들에게 안내하던 때에도 화물 차량이 그 노선을 이용했다고 인정했다. 화물 회사가 그 이용료를 냈는지는 밝히지 않았고, 승객에게 보상이 제안된 적도 없다. 승객은 셔틀이 다시 그곳에 정차하는지 여전히 직접 확인해야 한다."
					: "문제는 이 정류장에 한정되며 나머지 셔틀 노선은 운행 중이다. 요금은 그대로이고 보상은 발표되지 않았다.",
			];
		if (rec.f === "implant")
			return [
				{
					malfunction: `환자들은 업데이트 이후 임플란트 인터페이스가 계속 재시작된다고 말한다. 인터페이스는 매번 다시 작동하지만 중단은 예고 없이 일어날 수 있다. 클리닉은 직원들이 시험 중에 문제를 재현했는지, 해결 방법을 찾았는지 밝히지 않았다.`,
					backup: `이번 항의는 환자의 저장된 백업 기록을 허락 없이 연 사람들에 관한 것이다. 클리닉은 기록에 접근한 사람의 명단을 확인했다고 하지만 확인 결과를 공개하지 않았다. 공개적으로 신원이 밝혀진 환자는 없으며, 모든 백업에 접근이 있었다는 증거도 없다.`,
					unlicensed: `등록소 기록 없이 설치된 임플란트는 공식으로 승인된 시술과 비교할 수 없다. 클리닉이 부품을 살펴 문제를 찾을 수는 있지만, 그 검사가 임플란트의 안전이나 설치한 사람의 권한을 입증하지는 않는다. 환자들의 상태에 관한 정보는 공개되지 않았다.`,
					trial: `클리닉은 지원자들에게 돈을 주고 새 임플란트 부품을 시험하게 하지만 효과가 있다는 증거를 내놓지 않았다. 지원자들은 참여에 동의하는 서류에 서명한다. 클리닉이 알려진 위험이나 이전 시험 결과를 공개하지 않아서, 지원을 고민하는 사람들은 결정하기 전에 그 정보를 검토할 수 없다.`,
					xchange: `스테이션은 고객 응대 직원을 더 뽑았다. 이것으로 대기 시간이 얼마나 줄어들지는 밝히지 않았다.`,
				}[rec.s],
			].filter(Boolean);
		if (rec.f === "sweep")
			return [
				finished
					? `${c.D} 작전 중 집행관들은 수상한 짓을 하지 않은 사람까지 포함해 지나가는 모든 사람을 세웠다. 집행국은 이제 작전이 어떻게 끝났는지 설명했다.`
					: `${c.D} 작전 중 집행관들은 수상한 짓을 하지 않은 사람까지 포함해 지나가는 모든 사람을 세우고 있다. 작전이 끝날 때까지 이 구역을 건너는 사람은 누구나 그 검사를 거쳐야 한다.`,
				`집행국은 작전을 시작한 이유를 설명했지만, 주민들은 검사 중 집행관들이 사람들을 어떻게 대했는지도 묻고 있다. 체포된 사람 가운데 아직 법원에서 유죄를 받은 사람은 없다. 검사에 항의한 사람들은 여전히 답을 기다리고 있다.`,
			];
		if (rec.f === "idcheck")
			return [
				finished && rec.ph !== "traced"
					? `${c.D}의 추가 검사는 등록소가 복제된 기록의 출처를 밝히지 못한 채 흐지부지 끝났다. 이 구역을 지나던 사람들은 추가 검사 때문에 계속 발이 묶였다.`
					: finished
					? `등록소는 ${c.D}에서 복제된 신원 기록이 어디서 나왔는지 찾아냈다. 복제본은 누구나 쓸 수 있었으므로 진짜 계정 주인을 늘 가려낼 수 있었던 것은 아니다. 집행관들은 합법적으로 이동하던 사람들도 세웠다.`
					: `조사관들은 ${c.D}의 신원 기록이 몇 건이나, 누구에 의해 복제됐는지 밝히려 하고 있다. 복제된 기록을 쓰는 사람이 진짜 계정 주인이 아닐 수도 있다. 집행관들은 합법적으로 이동하는 사람들도 세우고 있다.`,
				`등록소는 기록이 복제된 사람을 한 명도 밝히지 않았고, 돔 방송국도 밝히지 않을 것이다. 등록소가 검사를 줄이더라도 복제된 기록이 모두 발견됐다는 증거는 되지 않는다.`,
			];
		if (rec.f === "feud")
			return [
				`${c.Oc}【와과】 ${c.O2}【이가】 사람들이 살고, 장사하고, 날마다 지나다니는 ${c.D}의 거리를 두고 싸우고 있다. 어느 패거리도 그곳에 사는 사람들을 대표하지 않는다. 한쪽 패거리가 길모퉁이를 차지했다고 주장하더라도 싸움 때문에 그 일대는 여전히 위험할 수 있다.`,
				finished
					? "싸움은 끝났다. 패거리들이 멈추기로 합의했든, 다른 패거리가 차지했든, 집행국이 개입했든 마찬가지다. 그중 어느 것도 한쪽 패거리가 이 구역을 포기했다는 뜻은 아니다."
					: "싸움이 끝날 기미는 아직 없다. 패거리들은 언제든 다시 시작할 수 있고, 어느 쪽이든 거리를 지배한다는 주장은 확인되지 않았다.",
			];
		if (rec.f === "smuggle")
			return [
				`${c.Oc}【은는】 화물 한 건을 잃었지만 그것만으로는 어느 패거리가 가져갔는지 알 수 없다. 조사관들은 비난이 옳은지 판단하기 전에 사라진 화물에서 나온 증거가 필요하다.`,
				"물건이 발견되면 상인들은 사라진 화물이 회수되었음을 알게 될 것이다. 더 넓은 범위의 물량 부족 조짐은 없고, 이 사건과 연결된 다른 업체도 없다.",
			];
		if (rec.f === "nightlife")
			return [
				rec.s === "raid"
					? "출입구 검사가 누가 들어가고 이미 안에 있는 사람들이 어떻게 되는지를 정한다. 섬의 권한 등급은 바뀌지 않는다. 혐의를 받은 게스트는 없고, 이름이 밝혀진 사람도 없다."
					: `이번 행사는 ${c.O}【와과】 그 주변 거리에 영향을 준다. ${c.D}의 다른 업소들은 영업시간 변경을 발표하지 않았다. 입장했다고 해서 다른 곳에도 들어갈 수 있다는 보장은 없으며, 귀갓길을 위해 셔틀을 늘리겠다고 약속한 사람도 없다.`,
			];
		if (rec.f === "glasshouse")
			return [
				`글래스하우스는 손님 명단을 공개하지 않는다. 바깥에서는 방문객이 도착하는 모습이 가끔 보이지만, 그렇다고 안에서 무슨 일이 벌어지는지, 손님들이 본명을 쓰는지, 누군가 왜 빠졌는지가 드러나는 것은 아니다.`,
				"돔 방송국은 거리에서 어떤 방문객이 도착하는 모습이 보였는지는 보도할 수 있다. 글래스하우스 안에서 무슨 이야기가 오갔는지는 누구도 확인해 주지 않았다.",
			];
		if (rec.f === "market" || rec.f === "crash") {
			const kind =
				rec.ph === "first" && ["accumulate", "selloff", "pump"].includes(rec.s)
					? "rumour"
					: ["announce", "denied", "deny", "cancelled", "statement"].includes(rec.ph)
					? "statement"
					: ["result", "report", "aftermath", "depressed"].includes(rec.ph)
					? "analysis"
					: "confirmed";
			return [
				{
					rumour: "지금까지는 소문일 뿐이다. 소문을 믿고 거래하는 사람은 그 소문이 사실이라는 것과 가격이 이미 움직이지 않았다는 것, 두 가지에 걸고 있는 셈이다.",
					statement:
						"회사 발표는 회사가 알리고 싶은 내용만 알려 주며, 계획은 바뀔 수 있다. 실제로 무엇이 오가고 팔렸는지는 거래소의 거래 기록이 보여 준다.",
					confirmed:
						"거래소는 이 거래가 실제로 이루어졌음을 확인했다. 그 거래가 가격에 미치는 영향은 다른 거래인들이 사이퍼를 얼마나 사고파는지, 그 소식을 예상했는지에도 달려 있다.",
					analysis: "과거의 상승이 또 다른 상승을 보장하지는 않는다. 가격은 계속 오를 수도, 갑자기 떨어질 수도, 예고 없이 하락을 멈출 수도 있다.",
				}[kind],
				"이 보도의 가격은 발행 시점에는 정확했다. 사이퍼 가격은 언제든 바뀔 수 있다. 사이퍼는 살 때 내는 돈이 팔 때 받는 돈보다 많으므로, 거래하기 전에 단말기에서 현재 가격 두 가지를 모두 확인해야 한다.",
			];
		}
		return [];
	},

	families: {
		sweep: {
			lean: { agree: 1.4, worried: 1.2 },
			why: {
				robberies: "잇따른 길거리 강도",
				crews: "패거리 사이의 잇단 싸움",
				complaints: "상점 주인들의 항의",
				missing: "지난주 임플란트 응답이 끊긴 주민 두 명의 실종",
			},
			how: {
				patrol: ["도보 순찰", "모퉁이마다 서 있는 집행관"],
				checkpoint: ["임플란트 검문", "거리 양쪽 끝에 설치된 스캐너"],
				drones: ["드론 순찰", "옥상 위를 나는 카메라 드론"],
			},
			announce(rec, c) {
				const why = this.families.sweep.why[rec.c];
				const how = this.families.sweep.how[rec.s];
				return {
					title: this.pick(rec, "t", [
						`집행국, ${c.D}에 ${how[0]} 계획`,
						`${c.D}, 내일부터 ${how[0]}`,
						`${c.D}의 ${why}에 집행국 대응`,
					]),
					dek: `이번 작전은 ${why}에 이어 시작됐다.`,
					body: [
						this.pick(rec, "a", [
							`섬 집행국은 ${why}【을를】 이유로 내일 아침부터 ${c.D}에서 ${how[0]}【을를】 시작한다.`,
							`내일부터 ${c.D} 주민은 ${how[1]}【을를】 보게 될 것이다. 섬 집행국은 이번 작전이 ${why}에 대한 대응이라고 밝혔다.`,
						]),
						rec.s === "checkpoint"
							? "지나가는 사람은 누구나 임플란트를 제시하라는 요구를 받는다. 게스트는 등록을 최신 상태로 유지해야 한다."
							: this.pick(rec, "b", ["종료 날짜는 정해지지 않았다.", "대변인은 집행관이 몇 명 투입됐는지 밝히지 않았다."]),
						this.again(rec, "operation"),
					],
				};
			},
			active(rec, c) {
				const how = this.families.sweep.how[rec.s];
				const first = {
					patrol: "순찰대가 큰길뿐 아니라 골목에서도 움직이고 있다.",
					checkpoint: "검문소에서 보행자를 한 명도 빠짐없이 스캔하고 있다.",
					drones: "동트기 전부터 카메라 드론이 옥상 위를 날고 있었다.",
				}[rec.s];
				return {
					title: this.pick(rec, "t", [`${this.cap(how[0])} 시작, ${c.D}`, `${how[1]}에 눈뜬 ${c.D}`, `${c.D} 작전 시작`]),
					dek: this.pick(rec, "d", ["첫날 이 구역에서 접수된 거리 신고가 크게 줄었다.", "주민들은 거리가 더 조용하고 더뎌졌다고 말한다."]),
					body: [
						`집행관들이 동이 트자마자 ${c.D}에 도착했다. ${first}`,
						this.pick(rec, "b", [
							"상점 주인들은 가게 앞을 늘 지키던 무리가 오전 중반쯤 사라졌다고 말했다.",
							"여러 주민은 출근하는 데 평소보다 두 배 걸렸다고 말했다.",
							"집행국은 작전이 얼마나 계속될지 밝히지 않았다.",
						]),
					],
				};
			},
			arrests(rec, c) {
				const n = 3 + (rec.n % 9);
				return {
					title: this.pick(rec, "t", [`${c.D} 작전에서 ${n}명 연행`, `집행국, ${c.D}에서 ${n}명 체포 발표`]),
					body: [
						`섬 집행국은 ${c.D}의 작전이 시작된 뒤 ${n}명이 구금됐다고 밝혔다. 어떤 혐의인지는 밝히지 않았다.`,
						this.pick(rec, "b", [
							"구금된 사람 가운데 두 명의 가족이 시빅 대로의 집행국 사무소 밖에 모였다.",
							"집행관들은 적어도 하루 더 구역에 남을 것이다.",
						]),
					],
				};
			},
			complaint(rec, c) {
				return {
					tone: "investigation",
					title: this.pick(rec, "t", [`${c.D} 주민들, 작전 운영 방식에 의문`, `${c.D} 불심검문에 항의 이어져`]),
					body: [
						`${c.D} 주민들은 자기 동네 거리에서 거듭 제지당한다고 말한다. 한 노동자는 교대 근무 한 번을 위해 출근하는 길에 네 번이나 스캔을 받았다고 돔 방송국에 털어놓았다.`,
						"섬 집행국은 이번 검사가 통상적인 것이며 유효한 등록을 갖춘 사람은 걱정할 일이 없다고 밝혔다.",
					],
				};
			},
			review(rec, c) {
				return {
					tone: "investigation",
					title: `${c.D} 작전, 시민 기관이 검토한다`,
					body: [
						`시민 등록소는 ${c.D}에서 이뤄진 검문을 검토해 달라고 요청했다. 집행관들은 구역을 떠났다.`,
						"섬 집행국은 전적으로 협조하겠다고 밝혔다.",
					],
				};
			},
			ends(rec, c) {
				if (rec.sp)
					return {
						title: this.pick(rec, "t", [`집행국 "${c.D} 정리 완료"`, `작전 종료, ${c.D}【은는】 "다시 통제 아래"`]),
						dek: "섬 집행국은 이 구역에 더는 추가 집행관이 필요 없다고 밝혔다.",
						body: [
							`섬 집행국은 소동을 일으킨 무리가 이 구역을 영영 떠났다며 ${c.D} 작전을 끝냈다.`,
							"대변인은 이번 작전을 완벽한 성공이라 평가하며 주민들의 인내에 감사를 전했다.",
						],
						byline: "섬 집행국 성명",
					};
				return {
					title: this.pick(rec, "t", [`${c.D} 작전 마무리 국면`, `${c.D}에서 집행관 철수`]),
					body: [
						`섬 집행국이 ${c.D} 작전을 끝냈다. 순찰은 오늘부터 평소 일정으로 돌아간다.`,
						this.pick(rec, "b", [
							"상점 주인들은 작전이 이어진 동안은 더 조용했지만 그 상태가 오래가지는 않을 것이라고 말했다.",
							"작전에 관한 수치는 공표되지 않았다.",
						]),
					],
				};
			},
			exposed(rec, c) {
				return {
					title: `"성공" 선언 며칠 만에 ${c.D}에 되돌아온 패거리`,
					dek: "주민들이 공유한 영상이 공식 설명과 어긋난다.",
					body: [
						`섬 집행국이 ${c.D} 정리를 마쳤다고 밝힌 지 며칠 뒤, 주민들이 같은 무리가 큰길에 돌아와 있는 영상을 공유했다.`,
						"영상에 대해 묻자 섬 집행국은 확인하지 못한 자료에는 논평하지 않겠다고 답했다.",
					],
				};
			},
		},

		idcheck: {
			lean: { worried: 1.6, angry: 1.1 },
			what: { copies: "복제된 신원 칩", cloned: "복제된 게스트 ID", backups: "도난당한 등록소 백업 사본" },
			found(rec, c) {
				const what = this.families.idcheck.what[rec.s];
				return {
					title: this.pick(rec, "t", [`등록소, 사용 중인 ${what} 적발`, `${c.D}에서 ${this.cap(what)} 발견`, `${what} 발견 후 신원 검사 강화`]),
					body: [
						`시민 등록소는 이번 주 ${c.D}에서 ${what}【이가】 출입문 스캐너를 통과하는 데 쓰였다고 밝혔다.`,
						rec.s === "copies"
							? "복제된 칩은 원본과 같은 권한을 지닌다. 주인의 칩이 파괴돼도 계속 작동한다."
							: "등록소 직원들은 복제본이 일반 스캐너를 속일 만큼 정교하다고 말한다.",
						`${c.D}에서는 오늘부터 임플란트 추가 검사가 시행된다.`,
					],
				};
			},
			tighten(rec, c) {
				return {
					title: this.pick(rec, "t", [
						`${c.D} 검사 계속, 줄은 더 길어져`,
						`등록소, ${c.D}에 2차 스캔 추가`,
						`${c.D}, 이틀째 ID 검사`,
						`${c.D} 검사 연장`,
					]),
					body: [
						`시민 등록소가 ${this.families.idcheck.what[rec.s]}【을를】 조사하는 동안 ${c.D} 방문객은 두 번씩 스캔을 받는다.`,
						"게스트는 임플란트 신호를 복제하거나 차단하는 물건을 지니지 말라는 권고를 받았다.",
					],
				};
			},
			traced(rec, c) {
				const src = { market: "마켓 가 뒤편의 가판대", insider: "등록소 접근 권한을 가진 직원", unknown: "아무도 이름을 대지 못한 판매자" }[rec.c];
				return {
					title: this.pick(rec, "t", [`등록소 추적 결과, 가짜 ID 출처는 ${src}`, `${c.D} 가짜 ID 출처 확인`, `출처 확인으로 ${c.D} ID 검사 종료`]),
					body: [`시민 등록소는 ${c.D}에서 발견된 ${this.families.idcheck.what[rec.s]}【은는】 ${src} 쪽에서 나왔다고 밝혔다.`, "추가 검사는 끝났다."],
				};
			},
			quiet(rec, c) {
				return {
					title: this.pick(rec, "t", [
						`${c.D} 검사, 답 없이 종료`,
						`등록소, ${c.D} 복제본 추적 포기`,
						`${c.D} 가짜 ID 출처 못 찾아`,
					]),
					body: [`The extra implant checks in ${c.D} have ended. The Civic Registry has not said where the ${this.families.idcheck.what[rec.s]} came from.`],
				};
			},
		},

		feud: {
			lean: { worried: 1.5, angry: 1.2, funny: 0.6 },
			over: { corner: "길모퉁이", debt: "갚지 않은 빚", route: "배달 경로" },
			clash(rec, c) {
				const over = this.families.feud.over[rec.s];
				const holds = rec.hold ? ` ${c.Oc}【은는】 한동안 ${c.D}의 그 일대를 장악해 왔다.` : "";
				return {
					tone: rec.sev === 3 ? "alert" : "routine",
					title: this.pick(rec, "t", [
						`${over}【을를】 두고 패거리가 갈라서며 ${c.D}에서 싸움`,
						`${c.Oc}【와과】 ${c.O2}, ${c.D}에서 충돌`,
						`패거리 분쟁에 ${c.D} 거리 마비`,
					]),
					dek: `목격자들은 ${over}【을를】 둘러싸고 시작된 일이라고 말한다.`,
					body: [
						`어젯밤 늦게 ${c.D}에서 ${c.O}【와과】 ${c.O2} 조직원들이 싸웠다. 목격자들은 말다툼이 ${over}【을를】 둘러싼 것이었다고 말한다.${holds}`,
						this.pick(rec, "b", ["세 명이 부상 치료를 받았다.", "체포된 사람은 없다.", "모퉁이 상점의 진열창이 깨졌다."]),
						this.again(rec, "패거리 간 싸움"),
					],
				};
			},
			retaliation(rec, c) {
				return {
					tone: "alert",
					title: this.pick(rec, "t", [
						`${c.D}에서 이틀째 밤 소란`,
						`${c.D}의 알력, 골목으로 번져`,
						`${c.D}에서 반격 나선 ${c.Oc}`,
						`${c.D} 분쟁 계속, 가판대 불타`,
					]),
					body: [
						`${c.O}【와과】 ${c.O2} 사이의 분쟁이 어젯밤에도 ${c.D}에서 이어졌다. ${c.O}【와과】 연결된 사람이 가진 가판대에 누군가 불을 질렀다.`,
						"주민들은 해가 지면 집 안에 머문다고 말한다.",
					],
				};
			},
			enforcement(rec, c) {
				return {
					title: this.pick(rec, "t", [
						`패거리 싸움 끝내려 집행국 ${c.D} 진입`,
						`${c.O}【와과】 ${c.O2} 떼어놓으려 집행관 투입`,
						`${c.D} 알력 길어지자 순찰대 도착`,
					]),
					body: [
						`섬 집행국은 ${c.O}【와과】 ${c.O2} 사이에 이틀 밤 싸움이 이어진 뒤 ${c.D}에 집행관들을 보냈다.`,
						"순찰은 며칠간 이어질 것이다.",
					],
				};
			},
			truce(rec, c) {
				return {
					title: this.pick(rec, "t", [`${c.D}에 돌아온 평온`, `${c.D}의 패거리들, 분쟁 접어`]),
					body: [
						`${c.D}의 싸움이 멈췄다. 두 패거리를 아는 사람들은 ${c.O}【와과】 ${c.O2}【이가】 각자의 거리를 지키기로 합의했다고 말한다.`,
						"어느 쪽 사람도 돔 방송국과 이야기하려 하지 않았다.",
					],
				};
			},
			takeover(rec, c) {
				return {
					tone: "alert",
					title: `${c.O2c}, ${c.D} 장악`,
					body: [
						`가판 상인들은 두 쪽 가운데 한쪽에 돈을 내는데, 이들에 따르면 ${c.O}【이가】 운영하던 ${c.D}의 구역을 이제 ${c.O2c}【이가】 통제한다.`,
						"새 질서가 자리 잡는 동안 며칠간은 더 많은 소란이 예상된다.",
					],
				};
			},
		},

		smuggle: {
			lean: { worried: 1.1, funny: 1.2 },
			goods: { crates: "화물 상자", parts: "임플란트 부품", medical: "클리닉 물품" },
			missing(rec, c) {
				const g = this.families.smuggle.goods[rec.s];
				return {
					title: this.pick(rec, "t", [
						`${c.D}에서 사라진 ${this.cap(g)}`,
						`${c.Oc}, ${g} 분실 신고`,
						`${c.D}에서 ${c.Oc} 배송품 증발`,
						`${c.D}, 선박과 상점 사이에서 물건 증발`,
					]),
					body: [
						`${c.Oc}【은는】 ${c.D}에서 하역과 수령 사이에 ${g}【이가】 사라졌다고 밝혔다.`,
						this.pick(rec, "b", ["회사는 안에 무엇이 들어 있었는지 밝히지 않았다.", "집행국에는 이미 알렸다."]),
						"주민들은 밤마다 낯선 배달원들이 구역을 오간다고 전한다.",
					],
				};
			},
			statement(rec, c) {
				if (rec.sp)
					return {
						title: `${c.Oc}, 실종된 물건은 ${c.O2} 짓이라 주장`,
						body: [
							`${c.Oc}【은는】 ${c.O2}【이가】 ${c.D}에서 사라진 ${this.families.smuggle.goods[rec.s]}【을를】 가져갔다며 집행국에 조치를 요청했다.`,
							"회사는 어떤 증거가 있는지 밝히지 않았다.",
						],
						byline: `${c.Oc} 성명`,
					};
				return {
					title: this.pick(rec, "t", [
						`${c.Oc}, 사라진 물건에 현상금`,
						`사라진 ${this.families.smuggle.goods[rec.s]} 수색 계속`,
						`${c.D} 화물 두고 배달원들 조사`,
						`${c.Oc}, ${c.D}에 물건 찾는 일 도움 요청`,
					]),
					body: [
						`${c.Oc}【은는】 ${c.D}에서 사라진 물건에 관한 정보에 현상금을 내걸었다.`,
						"이 구역의 배달원들은 그 일로 여러 차례 질문을 받았다고 말한다.",
					],
				};
			},
			found(rec, c) {
				return {
					title: this.pick(rec, "t", [
						`사라졌던 ${this.families.smuggle.goods[rec.s]} 발견`,
						`${c.Oc}, 물건 대부분 되찾아`,
						`창고 수색에서 ${c.O} 화물 발견`,
					]),
					body: [`The goods ${c.O} reported missing were found in a storage unit near ${c.D}. Some of the contents are still unaccounted for.`],
				};
			},
			unresolved(rec, c) {
				return {
					title: this.pick(rec, "t", [`${c.Oc}, 사라진 물건 손실 처리`, `${c.D} 화물 끝내 못 찾아`, `${c.Oc}, 수색 중단`]),
					body: [`${c.Oc} has stopped looking for the ${this.families.smuggle.goods[rec.s]} that disappeared in ${c.D}.`],
				};
			},
			exposed(rec, c) {
				return {
					title: `사라진 물건, ${c.O2} 아닌 ${c.O3}【와과】 연관`,
					dek: `${c.Oc}의 앞선 주장은 설득력을 잃었다.`,
					body: [
						`${c.D}의 배달원들은 ${this.families.smuggle.goods[rec.s]}【을를】 ${c.O3} 소속 사람들이 옮겼다고 말한다. ${c.Oc}【은는】 ${c.O2}【을를】 탓했었다.`,
						`${c.Oc}【은는】 성명을 철회했다.`,
					],
				};
			},
		},

		industry: {
			lean: { worried: 1.2, angry: 1.2 },
			noun: { press: "프레스 고장", power: "전력 장애", shortage: "물자 공급 부족", walkout: "집단 파업" },
			incident(rec, c) {
				if (rec.sp)
					return {
						title: rec.s === "walkout" ? `${c.P}의 짧은 회의, 작업은 계속` : `${c.P}의 경미한 고장, 작업은 계속`,
						body: [
							rec.s === "walkout"
								? `${c.Oc}【은는】 ${c.P} 직원들이 오늘 아침 짧은 회의를 열었으며 모든 교대 근무가 평소처럼 돌아간다고 밝혔다.`
								: `${c.Oc}【은는】 ${c.P}의 작은 고장이 한 시간 안에 수리됐고 교대 근무가 평소처럼 돌아간다고 밝혔다.`,
						],
						byline: `${c.Oc} 성명`,
					};
				const noun = this.families.industry.noun[rec.s];
				const what = {
					press: `${c.D}의 ${c.P}에서 오전 근무 중 프레스 한 대가 갈라졌다. 노동자 두 명이 화상 치료를 받았다.`,
					power: `${c.D}의 ${c.Pc}【은는】 오전 근무 대부분 동안 전기가 끊겼다.`,
					shortage: `${c.D}의 ${c.Pc}【은는】 자재가 모자란다.`,
					walkout: `${c.D}의 ${c.P}에서 노동자들이 교대 시작과 함께 일손을 놓았다.`,
				}[rec.s];
				const why = {
					wear: "노동자들은 그 문제가 전에도 보고됐다고 말한다.",
					overload: "운영자들은 장비가 정격 이상으로 돌아가고 있었다고 말한다.",
					supplier: "납품이 늦어진 탓이라는 설명이다.",
					pay: "지난달부터 초과 근무 수당을 받지 못했다고 한다.",
				}[rec.c];
				const shut = rec.shut ? `${c.Pc}【은는】 별도 공지가 있을 때까지 모든 교대 근무를 중단했다.` : `${c.P}의 작업은 느린 속도로 계속된다.`;
				return {
					title: this.pick(rec, "t", [
						`${c.Pc}, ${noun} 발생`,
						`${this.cap(noun)} at ${c.P}`,
						rec.s === "walkout" ? `${c.P}의 작업 중단` : `${c.D}: ${c.P}에 문제 발생`,
					]),
					dek: shut,
					body: [`${what} ${why}`, shut, this.again(rec, "stoppage")],
				};
			},
			exposed(rec, c) {
				return {
					title: `회사 성명과 달리 ${c.Pc} 가동 중단`,
					body: [
						`Workers turned away from ${c.P} say every shift has been cancelled since ${this.families.industry.noun[rec.s]}. ${
							c.Oc
						} had said work was continuing as normal.`,
						"입구에 붙은 공지에는 재개 날짜가 없다.",
					],
				};
			},
			dispute(rec, c) {
				if (rec.s === "shortage")
					return {
						tone: "investigation",
						title: `${c.Pc} 노동자들, 자재 조달 방식에 의문`,
						body: [
							`${c.P} 노동자들은 자재 부족이 몇 주 전에 보고됐지만 처리 없이 건이 종결됐다고 말한다.`,
							`${c.Oc}【은는】 모든 기계가 마지막 점검을 통과했다고 밝혔다. 이 발언은 자재에 관한 항의가 아니라 장비 점검에 관한 답이다.`,
						],
					};
				if (rec.s === "walkout")
					return {
						tone: "investigation",
						title: this.pick(rec, "t", [`${c.Pc} 임금 협상 교착`, `${c.P}, 아직 타결 없어`]),
						body: [`${c.P} 노동자들은 ${c.O}【이가】 못 받은 초과 근무 수당에 관한 논의를 거부했다고 말한다.`, `${c.Oc}【은는】 임금이 올바르게 계산됐다고 밝혔다.`],
					};
				return {
					tone: "investigation",
					title: this.pick(rec, "t", [`${c.Pc} 노동자들, 안전 기록에 의문`, `${c.P} 문제는 몇 주 전 보고됐다고 노동자들 주장`]),
					body: [
						`오늘 아침 ${c.P} 밖에 노동자들이 모였다. 여럿이 돔 방송국에 그 문제가 몇 주 전에 보고됐지만 처리 없이 건이 종결됐다고 말했다.`,
						`${c.Oc}【은는】 모든 기계가 마지막 점검을 통과했다고 밝혔다.`,
					],
				};
			},
			inspection(rec, c) {
				return {
					title: this.pick(rec, "t", [`${c.P}에 점검관 파견`, `${c.P} 시민 점검`]),
					body: [
						`시민 점검관들이 집행국 호위를 받으며 ${c.P}에 도착했다. 집행관들은 ${c.D} 일대에서 출입증을 확인하고 있다.`,
						"점검관들이 도착한 뒤 이 구역의 거리 사건이 줄었다.",
					],
				};
			},
			repair(rec, c) {
				const t = {
					press: [`${c.P} 수리 진행 중`, `${c.P}에 새 프레스 주문`],
					power: [`${c.P}에 기술자 투입`, `${c.P} 전력 복구 중`],
					shortage: [`${c.Pc}: 납품 오는 중`, `${c.Pc}, 자재 기다리는 중`],
					walkout: [`${c.P} 협상 시작`, `${c.Oc}, 노동자와 면담`],
				}[rec.s];
				const b = {
					press: "기술자들이 교체용 프레스를 설치하고 있다.",
					power: "기술자들이 손상된 공급선을 교체하고 있다.",
					shortage: "며칠 안에 납품이 있을 예정이다.",
					walkout: `${c.Oc}【와과】 노동자 대표들이 오늘 아침 만났다.`,
				}[rec.s];
				return {
					title: this.pick(rec, "t", t),
					body: [
						`${b} ${
							rec.shut ? (rec.s === "walkout" ? "합의가 나올 때까지 교대 근무는 계속 취소된다." : "그때까지 교대 근무는 계속 취소된다.") : "일부 작업은 재개됐다."
						}`,
					],
				};
			},
			reopen(rec, c) {
				return {
					title: this.pick(rec, "t", [`${c.Pc} 정상화`, `${c.Pc} 다시 문 열어`, `${c.P} 작업 재개`, `${c.D} 노동자들, ${c.P}로 복귀`]),
					body: [
						rec.s === "walkout" ? `${c.O}【이가】 초과 근무 수당 지급에 합의해 노동자들이 ${c.P}로 돌아왔다.` : `${c.Pc}【은는】 다시 정상 가동 중이다.`,
						rec.shut ? "오늘부터 다시 일자리를 예약할 수 있다." : "",
					],
				};
			},
			report(rec, c) {
				return {
					tone: "investigation",
					title:
						rec.s === "shortage"
							? `점검관들, ${c.P}에서 무시된 자재 경고 발견`
							: rec.s === "walkout"
							? `점검관들, ${c.P}에서 미지급 초과 근무 수당 발견`
							: `점검 보고서, ${c.P} 문제 원인으로 ${rec.c === "wear" ? "부품 마모" : "부실한 정비"} 지목`,
					body: [`The civic report into ${c.P} found that the operators ignored earlier warnings. ${c.Oc} has been fined.`],
				};
			},
		},

		transit: {
			lean: { angry: 1.3, funny: 1.1 },
			out(rec, c) {
				if (rec.sp)
					return {
						title: this.pick(rec, "t", [`${c.D} 노선 신호 장애 잠깐 발생, 현재 복구`, `짧은 지연 뒤 ${c.D} 셔틀 정상 운행`]),
						body: [`City Transit says a short signal fault delayed shuttles near ${c.D} this morning. The stop is back in service.`],
						byline: "도시 교통국 공지",
					};
				const why = { maintenance: "정비를 위해", inspection: "점검관이 승강장을 점검하는 동안", interference: "셔틀이 그곳에 서지 못하게 된 뒤" }[
					rec.s
				];
				return {
					tone: "notice",
					title: this.pick(rec, "t", [`${c.D} 셔틀 정류장 폐쇄`, `${c.D} 건너뛰는 셔틀`]),
					body: [
						`${c.D}의 셔틀 정류장은 ${why} 폐쇄됐다. 따로 공지가 있을 때까지 셔틀은 그곳에 서지 않는다.`,
						"승객은 가장 가까운 운행 정류장에서 걸어갈 수 있다. 이동 시간이 더 걸릴 수 있다.",
						this.again(rec, "closure"),
					],
					byline: "도시 교통국 공지",
				};
			},
			statement(rec, c) {
				if (rec.sp)
					return {
						title: this.pick(rec, "t", [
							"도시 교통국: 모든 공공 정류장 운행 중",
							`도시 교통국, ${c.D} 노선 운행 중이라 밝혀`,
							`운영사 밝혀: ${c.D} 노선 차질 없음`,
						]),
						body: [`City Transit says every public stop, including ${c.D}, is running to timetable.`],
						byline: "도시 교통국 공지",
					};
				return {
					title: rec.s === "interference" ? `도시 교통국, ${c.D} 폐쇄 원인 설명 못 해` : `${c.D} 정류장 곧 재개`,
					body: [
						rec.s === "interference"
							? `도시 교통국은 셔틀이 저절로 ${c.D}【을를】 건너뛴다고 밝혔다. 기술자들은 결함을 찾지 못했다.`
							: `도시 교통국은 ${c.D} 정류장을 곧 재개할 것으로 예상한다.`,
					],
				};
			},
			conflicting(rec, c) {
				return {
					tone: "investigation",
					title: this.pick(rec, "t", [`주민들, ${c.D} 정류장이 꺼져 있다고 제보`, `${c.D} 노선, 엇갈린 안내`]),
					body: [
						`${rec.sp ? "도시 교통국은 정류장이 운행 중이라고 밝혔다" : "도시 교통국은 기술자들이 현장에 있다고 밝혔다"}지만, ${
							c.D
						} say no shuttle has stopped there for days and the stop screen is dark.`,
						rec.sp
							? "여럿이 밤이면 셔틀 승강장에 화물 수레가 주차된 것을 봤다고 말했다."
							: "기술자들이 승강장에서 목격됐지만 무엇을 발견했는지는 아무도 말하지 않았다.",
					],
				};
			},
			suspect(rec, c) {
				return {
					tone: "investigation",
					title: `${c.D} 셔틀 승강장에서 목격된 화물 수레`,
					body: [`주민들은 폐쇄된 ${c.D} 정류장을 밤에 화물 수레가 이용하는 영상을 공유했다.`, "도시 교통국은 이 제보를 살펴보고 있다고 밝혔다."],
				};
			},
			exposed(rec, c) {
				return {
					title: `타이드워터 화물, ${c.D} 노선 이용했다고 교통국 시인`,
					dek: "앞선 공지는 정류장이 운행 중이라고 했다.",
					body: [
						`도시 교통국은 타이드워터 화물 호송대가 밤에 ${c.D} 노선을 배정받았고, 그러기 위해 공공 셔틀이 보류됐음을 확인했다.`,
						"앞선 공지는 정류장이 운행 중이라고 했다. 도시 교통국은 그 공지가 화물 회사에서 받은 정보에 근거한 것이었다고 밝혔다.",
					],
				};
			},
			reopen(rec, c) {
				return {
					tone: "notice",
					title: `${c.D} 셔틀 정류장 운행 재개`,
					body: [`Shuttles are stopping at ${c.D} again.`],
					byline: "도시 교통국 공지",
				};
			},
		},

		business: {
			lean: { agree: 0.8, disagree: 1.2, funny: 1.1 },
			mediation(rec, c) {
				return {
					title: `등록소, ${c.O} 분쟁 두고 협의 진행`,
					body: [
						rec.s === "wages"
							? `직원 대표들과 ${c.O}【이가】 급여 기록을 시민 등록소에 가져왔다. 양쪽은 협의에 합의했으며 지급이 확정된 것은 없다.`
							: `${c.Oc}【와과】 ${c.O2}【은는】 조정에 합의했다. 등록소가 작업 기록을 검토하는 동안 다툼이 된 송장은 계속 미지급 상태다.`,
					],
				};
			},
			withdrawn(rec, c) {
				return {
					title: `${c.Oc} withdraws ${rec.s === "stake" ? "investment offer" : "expansion plan"}`,
					body: [
						rec.s === "stake"
							? `${c.Oc}【은는】 ${c.O2}의 보유 지분을 늘리려던 계획을 포기했다. 이미 등록된 지분은 그대로다.`
							: `${c.Oc}【은는】 비용을 검토한 뒤 계획했던 개점을 취소했다. 늘어난 공간은 쓰이지 않은 채 남게 되며, 지원자들은 채용이 보류됐다는 통보를 받았다.`,
					],
				};
			},
			audit(rec, c) {
				return {
					tone: "investigation",
					title: `등록소, ${c.O} 조달 기록 요청`,
					body: [
						`시민 등록소는 유출된 구매 문서를 ${c.O}의 송장과 대조하고 있다. 규정 위반이 있었는지는 아직 판단하지 않았다.`,
					],
				};
			},
			unresolved(rec, c) {
				return {
					title: `${c.Oc} 검토, 합의 없이 종료`,
					body: [
						rec.s === "leak"
							? `등록소는 유출된 문서를 모두 진본으로 확인하지 못했다. 결론 없이 이번 검토를 마쳤으며, 다툼이 된 구매는 설명되지 않은 채 남아 있다.`
							: `${c.O}【이가】 관여한 협의가 합의 없이 끝났다. 다툼이 된 대금은 여전히 남아 있다. 추가 회동은 발표되지 않았다.`,
					],
				};
			},
			news(rec, c) {
				const t = {
					expansion: [`${c.Oc}, ${c.D}에서 확장`, `${c.Oc}, ${c.D}에 두 번째 층 개설`],
					contract: [`${c.Oc}【와과】 ${c.O2}, 계약 분쟁`, `${c.Oc}, ${c.O2}에 대금 지급 중단`],
					irregular: [`${c.O}의 계좌 의혹`, `${c.O}에서 사이퍼 실종?`],
					recall: [`${c.Oc}, 부품 한 묶음 리콜`, `${c.Oc}, 불량 부품 반납 요청`],
					stake: [`${c.Oc}, ${c.O2}에 지분 투자`, `${c.Oc}, ${c.O2} 지분 확보`],
					wages: [`직원들, ${c.O} 급여 공제에 이의`, `${c.O} 급여 분쟁`],
					leak: [`${c.O}에서 구매 기록 유출`, `${c.Oc}, 납품업체 송장 의혹에 직면`],
				}[rec.s];
				const b = {
					expansion: `${c.Oc}【은는】 ${c.D}에 더 많은 공간을 확보했으며 채용하겠다고 밝혔다. 몇 명인지는 밝히지 않았다.`,
					contract: `${c.Oc}【은는】 작업이 이뤄지지 않았다며 ${c.O2}에 대한 서비스 계약 대금 지급을 중단했다. ${c.O2c}【은는】 동의하지 않는다.`,
					irregular: `전직 직원들은 ${c.O}【을를】 거친 송금이 몇 달 동안 엉뚱한 계좌로 기록됐다고 말한다.`,
					recall: `${c.Oc}【은는】 알려진 결함이 있는 부품 한 묶음을 고객들에게 반납해 달라고 요청했다. 마켓 가의 판매상들은 교체품의 값싼 복제품을 벌써 내놓고 있다.`,
					stake: `${c.Oc}【은는】 ${c.O2}의 지분 일부를 사들였다. 어느 쪽도 얼마를 냈는지 밝히지 않았다.`,
					wages: `${c.O} 직원들은 장비 공제 항목이 설명 없이 급여 명세서에 올라왔다고 말한다. 이들은 공제된 돈의 반환을 요구하는 한편 일은 계속하고 있다.`,
					leak: `돔 방송국에 전달된 문서에는 한 납품업체에서 같은 물품을 서로 다른 가격으로 거듭 구매한 내용이 담겨 있는 것으로 보인다. 제보자는 문서가 ${c.O}에서 나왔다고 하며, 문서 전체는 진위가 확인되지 않았다.`,
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b], tone: ["leak", "irregular"].includes(rec.s) ? "investigation" : "routine" };
			},
			response(rec, c) {
				if (rec.sp)
					return {
						title: `${c.Oc}: 내부 검토 결과 위법 없음`,
						body: [`${c.Oc} says its own review found every transfer correctly recorded. It will not publish the review.`],
						byline: `${c.Oc} 성명`,
					};
				const b = {
					contract: `${c.O2c}【은는】 이번 주에 대금을 받지 못하면 분쟁을 시민 등록소에 가져가겠다고 밝혔다.`,
					wages: `${c.Oc}【은는】 공제가 자사의 고용 조건을 따른 것이라고 밝혔다. 직원 대표들은 서명된 계약서와 항목별 산정 내역을 요구했다.`,
					leak: `${c.Oc}【은는】 유출된 송장에 배송비가 빠져 있다며 등록소에 기록을 제공하겠다고 했다. 그 기록을 공개하지는 않았다.`,
					irregular: `${c.Oc}【은는】 송금이 시스템 오류였으며 바로잡았다고 밝혔다.`,
					recall: "반납된 부품은 창구에서 교체해 준다. 고객은 노점상에게서 교체품을 사지 말아야 한다.",
					stake: `${c.O2} 직원들은 계약이 체결된 뒤에야 그 소식을 들었다고 말한다.`,
					expansion: `${c.Oc}【은는】 첫 신규 직원이 다음 주에 출근한다고 밝혔다.`,
				}[rec.s];
				const t = {
					contract: [`${c.O2c}, ${c.O}【을를】 등록소에 넘기겠다고 위협`, `${c.Oc} 계약 다툼 깊어져`],
					wages: [`${c.Oc}, 장비 공제 옹호`, `직원들, ${c.O}에 서명된 급여 조건 요구`],
					leak: [`${c.Oc}, 유출된 송장 비교에 반박`, `${c.Oc}, 등록소에 구매 기록 제공 제안`],
					irregular: [`${c.Oc}, 시스템 오류 탓`, `${c.Oc}, 계좌 바로잡았다고 밝혀`],
					recall: [`리콜: 부품은 거리가 아닌 창구에 반납`, `${c.Oc}, 리콜 부품 교체`],
					stake: [`${c.O2c} 직원들, 거래 소식 뒤늦게 들어`, `${c.O2} 내부, 새 소유주 두고 의문`],
					expansion: [`${c.Oc}, 다음 주부터 채용 시작`, `${c.Oc}, 시작 날짜 밝혀`],
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b] };
			},
			exposed(rec, c) {
				return {
					tone: "investigation",
					title: `기록과 어긋나는 ${c.O}의 검토 결과`,
					body: [`Records seen by Dome Broadcast show transfers through ${c.O} still logged under the wrong accounts after its review said otherwise.`],
				};
			},
			outcome(rec, c) {
				const b = {
					contract: `${c.Oc}【와과】 ${c.O2}【은는】 분쟁을 합의로 마무리했다. 조건은 공개되지 않는다.`,
					wages: `${c.Oc}【은는】 다툼이 된 장비 공제액을 환불하기로 합의했다. 직원 대표들은 다음 급여 명세서를 합의 내용과 대조해 보겠다고 말한다.`,
					leak: `등록소는 송장을 배송 기록과 맞춰 보았다. 가격 차이에는 화물 운송비가 포함돼 있었으며, 검토한 문서에서는 이중 지급의 증거가 나오지 않았다.`,
					irregular: `${c.Oc}【은는】 잘못된 송금으로 피해를 입은 고객들에게 돈을 돌려주었다.`,
					recall: `${c.Oc}【은는】 리콜이 완료됐다고 밝혔다.`,
					stake: `${c.O2}에 대한 ${c.Oc}의 지분이 등록됐다.`,
					expansion: `${c.Oc}의 새 층이 문을 열었다.`,
				}[rec.s];
				const t = {
					contract: [`${c.Oc}【와과】 ${c.O2}, 합의`, `${c.Oc}【와과】 ${c.O2}, 계약 다툼 마무리`],
					wages: [`${c.Oc}, 급여 공제 환불에 합의`, `${c.O} 급여 합의 타결`],
					leak: [`등록소, ${c.O} 송장 대조 완료`, `배송 기록으로 설명된 ${c.O} 가격 차이`],
					irregular: [`${c.Oc}, 피해 고객에 상환`, `${c.Oc} 계좌 오류 상환 완료`],
					recall: [`${c.Oc} 리콜 완료`, `리콜 부품 마지막 반납`],
					stake: [`${c.O2} 지분 ${c.Oc} 명의로 등록`, `${c.Oc} 거래 마무리`],
					expansion: [`${c.Oc}, 새 층 개장`, `${c.Oc} 확장 완료`],
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b] };
			},
		},

		implant: {
			lean: { worried: 1.6 },
			report(rec, c) {
				const w = {
					malfunction: [`환자들, ${c.O} 임플란트 결함 제보`, "최근 업데이트 이후 임플란트가 예고 없이 재시작된다고 여러 환자가 말한다."],
					backup: ["내 임플란트 백업은 누가 볼 수 있나?", "전직 등록소 직원들은 볼 이유가 없는 사람들이 백업 사본을 열람했다고 말한다."],
					unlicensed: [
						"언더패스에 퍼지는 무허가 임플란트 시술",
						"언더패스 사람들이 시민 등록소에 등록하지 않고 임플란트를 설치하고 있다.",
					],
					trial: [`${c.Oc}, 유급 시험 참가자 모집`, `${c.Oc}【은는】 새 임플란트 부품을 시험할 지원자들에게 돈을 지급한다.`],
					xchange: ["X-체인지 스테이션 앞 대기 행렬", "릴레이 가의 X-체인지 스테이션 밖에 방문객들이 줄을 서 있다."],
				}[rec.s];
				return { title: w[0], body: [w[1], rec.s === "trial" ? "클리닉 직원들이 거리에서 사람들에게 접근하고 있다." : ""] };
			},
			response(rec, c) {
				if (rec.sp)
					return {
						title: `${c.Oc}: 임플란트에서 결함 발견되지 않아`,
						body: [`${c.Oc} says its tests found nothing wrong and the restarts were caused by patients' own settings.`],
						byline: `${c.Oc} 성명`,
					};
				const b = {
					malfunction: `${c.Oc}【은는】 해당 부품이 있는 모든 사람에게 무료 점검을 제공하겠다고 밝혔다.`,
					backup: "시민 등록소는 백업 접근이 기록되며 검토를 마쳤다고 밝혔다.",
					unlicensed: "메드테크 가의 클리닉들이 다른 곳에서 설치한 부품도 점검해 주겠다고 한다.",
					trial: `${c.Oc}【은는】 모든 지원자가 동의서에 서명한다고 밝혔다.`,
					xchange: "X-체인지 스테이션은 창구 직원을 늘렸다고 밝혔다.",
				}[rec.s];
				const t = {
					malfunction: [`${c.Oc}, 무료 점검 제공`, `${c.Oc}, 환자들에게 답하다`],
					backup: ["등록소, 백업 접근 옹호", "등록소: 열람은 모두 기록된다"],
					unlicensed: ["클리닉들, 거리 임플란트 점검 제공", "메드테크 가, 칩 절단업자에 대응"],
					trial: [`${c.Oc}, 시험 옹호`, `${c.Oc}, 시험 관련 질문에 답하다`],
					xchange: ["X-체인지 스테이션, 직원 증원", "릴레이 가 대기 줄 짧아진다고 약속"],
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b] };
			},
			exposed(rec, c) {
				return {
					tone: "investigation",
					title: `${c.Oc} 환자들, 여전히 재시작 호소`,
					body: [`More patients have come forward since ${c.O} said its implants had no fault. Two say the restarts started after their check-up.`],
				};
			},
			fixed(rec, c) {
				return {
					title: this.pick(
						rec,
						"t",
						{
							malfunction: [`${c.Oc} 업데이트로 재시작 해결`, "임플란트 재시작 해결됐다고 환자들 말해"],
							backup: ["등록소, 백업 열람 권한자 변경", "백업 접근 강화"],
							unlicensed: ["언더패스 칩 절단업자들 자리 옮겨", "거리 임플란트 신고 줄어"],
							trial: [`${c.Oc}, 시험 종료`, `${c.Oc} 시험, 지원자 모집 마감`],
							xchange: ["X-체인지 스테이션 대기 줄 줄어", "릴레이 가 대기 줄 짧아져"],
						}[rec.s]
					),
					body: [
						{
							malfunction: `${c.Oc}【은는】 새 업데이트로 재시작이 멈췄다고 밝혔다.`,
							backup: "시민 등록소는 백업을 열 수 있는 직원 수를 줄였다.",
							unlicensed: "클리닉들은 이번 주 미등록 부품을 단 환자가 줄었다고 전한다.",
							trial: `${c.Oc}【은는】 지원자 모집을 중단했다.`,
							xchange: "X-체인지 스테이션 앞 대기 줄이 평소 수준으로 돌아왔다.",
						}[rec.s],
					],
				};
			},
			ongoing(rec, c) {
				return {
					title: this.pick(rec, "t", [
						"임플란트 항의 계속",
						"임플란트 환자들, 답을 듣지 못해",
						"환자들 여전히 답 기다려",
						"임플란트 문제 길어져",
					]),
					body: ["The complaints have not stopped, and nobody has taken responsibility."],
				};
			},
		},

		nightlife: {
			lean: { funny: 1.4, agree: 1.1 },
			notice(rec, c) {
				const t = {
					opening: [`${c.Oc}, 성대한 밤 예고`, `${c.Oc}, 이번 시즌 가장 시끄러운 밤 약속`],
					noise: [`${c.Oc}, 영업시간 연장`, `${c.Oc}, 새벽까지 영업`],
					betting: ["스태틱 룸의 대형 경기의 밤", "스태틱 룸, 이달 최대 대결"],
					raid: [`집행국, ${c.O}에 경고`, `${c.Oc}, 손님 임플란트 확인 지시받아`],
				}[rec.s];
				const b = {
					opening: `${c.D}의 ${c.Oc}【은는】 내일 밤이 이번 시즌 가장 붐빌 것이라고 밝혔다.`,
					noise: `${c.D}의 ${c.Oc}【은는】 내일 아침까지 문을 연다. 이웃들은 벌써 항의했다.`,
					betting: "스태틱 룸은 내일 밤 이달 최대 대결을 연다고 발표했다. 내기는 이미 열려 있다.",
					raid: `섬 집행국은 ${c.D}의 ${c.O}에 출입구에서 손님 모두의 임플란트를 스캔하라고 지시했다.`,
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b] };
			},
			night(rec, c) {
				const b = {
					opening: `${c.O} 앞 줄이 ${c.D}의 끝까지 이어졌다. 소매치기들이 줄을 노렸다.`,
					noise: `${c.Oc}【은는】 아침까지 문을 열었다. 이웃들은 소음과 밖에 몰린 인파에 항의했다.`,
					betting:
						"스태틱 룸의 메인 경기가 끝난 뒤 내기를 건 사람 몇 명이 서로 싸우기 시작했다. 다툼은 바깥 거리에서도 이어졌다.",
					raid: `집행관들이 ${c.O}【을를】 나서는 손님을 모두 검사했다. 몇몇은 뒷문으로 빠져나갔다.`,
				}[rec.s];
				const t = {
					opening: [`${c.O} 앞 블록을 감싼 대기 줄`, `새벽까지 가득 찬 ${c.Oc}`],
					noise: [`${c.O}의 늦은 밤에 이웃들 항의`, `${c.D}【을를】 잠 못 들게 하는 ${c.Oc}`],
					betting: ["스태틱 룸 경기, 난투로 끝나", "스태틱 룸에서 내기 건 사람들 사이에 싸움"],
					raid: [`${c.O}에서 손님 전원 검사`, `${c.Oc} 단속, 손님 스캔`],
				}[rec.s];
				return { title: this.pick(rec, "t", t), body: [b] };
			},
			after(rec, c) {
				return {
					title: this.pick(rec, "t", [`${c.D}, 긴 밤 뒤 정리`, `${c.D}의 이튿날 아침`, `붐볐던 밤 뒤 조용한 ${c.Oc}`]),
					body: [`Street cleaners worked through the morning in ${c.D}. ${c.Oc} has not commented.`],
				};
			},
		},

		/* Cipher market stories. rec.q holds the real figures at publication: [price in pence, % since the first report, % over the last day]. */
		market: {
			lean: { worried: 1.3, disagree: 1.1 },
			price(rec) {
				return rec.q ? setup.arcologyFx.gbp(rec.q[0]) : "";
			},
			move(v) {
				if (v === null || v === undefined) return "";
				if (v <= -99.9) return "99.9% 넘게 하락";
				return Math.abs(v) < 0.5 ? "거의 변동 없음" : `${Math.abs(v).toFixed(1)}% ${v > 0 ? "상승" : "하락"}`;
			},
			/* The price sentence every market report carries, from the publication snapshot. */
			quote(rec, since) {
				const M = setup.arcologyNewsText.families.market;
				if (!rec.q) return "";
				const [, s, day] = rec.q;
				if (since && s !== null && Math.abs(s) >= 0.5)
					return `발행 시점에 1사이퍼는 유닛 환전소에서 ${M.price(rec)}에 거래됐다(첫 보도 이후 ${M.move(s)}).`;
				if (since) return `발행 시점에 1사이퍼는 유닛 환전소에서 ${M.price(rec)}에 거래됐다(첫 보도 이후 거의 변동 없음).`;
				return day === null
					? `발행 시점에 1사이퍼는 유닛 환전소에서 ${M.price(rec)}에 거래됐다.`
					: `발행 시점에 1사이퍼는 유닛 환전소에서 ${M.price(rec)}에 거래됐다(전날 대비 ${M.move(day)}).`;
			},
			first(rec, c) {
				const M = this.families.market;
				if (rec.s === "accumulate")
					return {
						title: this.pick(rec, "t", [`${c.O}의 사이퍼 매입설, 거래인들 전해`, `${c.Oc}, 사이퍼 매입 준비한다는 소문`]),
						dek: "확인되지 않음. 주문은 확인되지 않았다.",
						body: [
							`유닛 환전소의 거래인 여럿은 ${c.O}【이가】 대량의 사이퍼를 사들이는 일을 문의하고 다녔다고 말한다. 회사는 매입을 확인해 주지 않았으며, 돔 방송국도 주문을 확인하지 못했다.`,
							rec.sp
								? `${c.O}【와과】 가까운 사람들은 거래인들에게 그 계획을 올해 최대 규모 가운데 하나로 설명했다. 금액도, 날짜도 말하지 않았다.`
								: this.pick(rec, "b", ["얼마나 되는 사이퍼가 걸려 있는지는 아무도 말하려 하지 않았다.", "거래인들은 정보가 어디서 나왔는지 밝히지 않았다."]),
							M.quote(rec),
						],
					};
				if (rec.s === "selloff")
					return {
						title: this.pick(rec, "t", [`대규모 사이퍼 매도, ${c.O} 연관이라고 거래인들 주장`, `거래인들, 사이퍼 대량 매도를 ${c.O}【와과】 연결`]),
						dek: "확인되지 않음. 회사는 논평하지 않았다.",
						body: [
							`유닛 환전소의 거래인들은 지난 하루 이어진 대량 매도 주문이 ${c.O}【와과】 연결된 계좌에서 나왔다고 말한다. 회사는 논평하지 않았고, 주문은 어떤 공개 기록에서도 이 회사와 대조되지 않았다.`,
							M.quote(rec),
						],
					};
				if (rec.s === "withdraw")
					return {
						title: this.pick(rec, "t", [`${c.Oc}, 사이퍼 거래 부서 축소`, `${c.Oc}, 사이퍼 시장에서 준비금 인출`]),
						dek: "회사가 확인함.",
						body: [
							`${c.Oc} has confirmed it is reducing the reserves it uses to buy and sell Cipher at the Unit Exchange. It says the move concerns its own ${
								{ reserves: "준비금 규정", contracts: "계약 대금 지급", confidence: "위험 한도" }[rec.c]
							}.`,
							"사이퍼를 사겠다는 구매자가 환전소에 줄었다. 그 때문에 매수가와 매도가의 차이가 벌어져 소액 거래도 큰 변동을 일으킬 수 있다.",
							M.quote(rec),
						],
					};
				if (rec.s === "scandal")
					return {
						title: this.pick(rec, "t", [`${c.O}의 사이퍼 실종 의혹`, `문서로 본 ${c.Oc}의 준비금, 보고보다 적어`]),
						dek: "의혹 제기. 아직 결론은 없다.",
						body: [
							`돔 방송국이 확인한 문서에 따르면 ${c.O}【은는】 고객에게 밝힌 것보다 적은 사이퍼를 준비금으로 갖고 있는 것으로 보인다. 회사는 문서가 불완전하다고 말한다.`,
							"감독 기관은 아직 결론을 내리지 않았다. 장부상의 차이는 자금이 사라져서가 아니라 시기나 회계 처리에서 비롯될 수도 있다. 그 차이를 가려낼 기록은 공개되지 않았다.",
							M.quote(rec),
						],
					};
				return {
					title: this.pick(rec, "t", [`${c.O2}의 사이퍼 매입 임박 주장하는 게시글`, `${c.O2} 사이퍼 매입 예측하는 채널 게시글`]),
					dek: "익명 계정의 확인되지 않은 주장.",
					body: [
						`공개 채널의 게시글들은 ${c.O2}【이가】 사이퍼를 대량으로 사들일 참이라고 주장한다. 글을 올린 계정은 익명이다. ${c.O2c}【은는】 논평하지 않았고 주문도 확인되지 않았다.`,
						M.quote(rec),
					],
				};
			},
			announce(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(
						rec,
						"t",
						rec.sp
							? [`${c.Oc}, 대규모 사이퍼 매입 장담`, `${c.Oc}, 사이퍼 매입 계획 띄워`]
							: [`${c.Oc}, 사이퍼 매입 계획 확정`, `${c.Oc}, 준비금에 사이퍼 추가`]
					),
					dek: "회사 발표. 매입은 확인되지 않았다.",
					body: [
						rec.sp
							? `${c.Oc}【은는】 "섬에서 본 가운데 가장 큰 규모의 사이퍼 매입 가운데 하나"를 하겠다고 밝혔다. 성명에는 금액도 일정도 없다.`
							: `${c.Oc}【은는】 앞으로 며칠에 걸쳐 준비금용으로 사이퍼를 사들일 생각임을 확인했다. 금액은 밝히지 않았다.`,
						"발표는 의도를 밝힌 것일 뿐이다. 일부 거래인은 가격이 오르기를 바라며 회사가 계획을 발표하자마자 사이퍼를 산다. 그런 거래인들은 회사가 사들이기 시작한 뒤 자신의 사이퍼를 회사에 팔 수도 있다.",
						M.quote(rec, true),
					],
				};
			},
			buying(rec, c) {
				const M = this.families.market;
				const s = rec.q?.[1] ?? 0;
				return {
					title:
						s >= 2 ? `기관의 매수에 사이퍼 상승` : s <= -2 ? `${c.O}의 매수에도 사이퍼 하락` : `${c.O} 매수 속에 사이퍼 보합`,
					dek: "확인된 거래.",
					body: [
						`유닛 환전소 기록에 따르면 지난 하루 동안 대량 매수 주문이 ${c.O}의 계좌로 체결됐다. 회사는 매수는 확인했지만 총액은 확인하지 않았다.`,
						M.quote(rec, true),
						"회사가 사들이는 동안에는 사이퍼 수요가 늘어난다. 회사가 매수를 멈추면 그 추가 수요는 사라진다. 기록에는 회사가 사이퍼를 얼마나 더 살 계획인지 나와 있지 않다.",
					],
				};
			},
			scaled(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", [`${c.Oc}, 발표보다 적은 사이퍼 매수`, `${c.Oc} 사이퍼 매입, 약속보다 작아`]),
					dek: "환전소 기록과 회사 성명 대조.",
					body: [
						`환전소 기록에 따르면 ${c.O}【은는】 발표가 시사한 것보다 훨씬 적은 사이퍼를 샀다. 회사는 이제 그 매수를 "이번 기간 완료"라고 부른다.`,
						rec.sp
							? "원래 성명은 이례적으로 큰 주문을 암시하는 표현을 썼다. 금액을 밝힌 적이 없으므로 기록이 그것을 거짓이라고 보여 줄 수는 없고, 많은 거래인이 짐작한 것보다 훨씬 작았다는 점만 보여 준다."
							: "",
						M.quote(rec, true),
					],
				};
			},
			cancelled(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", [`${c.Oc}, 사이퍼 매입 계획 철회`, `${c.Oc}, 예정된 사이퍼 매수 취소`]),
					dek: "회사 발표.",
					body: [
						`${c.Oc} says it will no longer buy Cipher as planned, citing ${
							{ reserves: "준비금 검토", contracts: "계약 지연", confidence: "시장 상황" }[rec.c]
						}.`,
						M.quote(rec, true),
					],
				};
			},
			denied(rec, c) {
				const M = this.families.market;
				const who = rec.s === "pump" ? c.O2 : c.O;
				return {
					title: this.pick(rec, "t", [`${this.cap(who)}, 사이퍼 매입 계획 부인`, `${this.cap(who)}: "사이퍼 매입 계획 없다"`]),
					dek: "회사 성명.",
					body: [
						`${this.cap(who)}【은는】 사이퍼를 살 계획이 없으며 그런 주문도 낸 적이 없다고 밝혔다.`,
						rec.s === "pump"
							? "처음 주장을 편 계정들은 여전히 익명이다. 누구의 계정인지 밝힌 사람은 없다."
							: "그 계획을 설명한 거래인들은 정보가 어디서 나왔는지 밝히지 않았다.",
						M.quote(rec, true),
					],
				};
			},
			deny(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", [`${c.Oc}, 사이퍼를 팔고 있지 않다고 밝혀`, `${c.Oc}, 준비금 매각 보도 일축`]),
					dek: "회사 성명.",
					body: [
						`${c.Oc}【은는】 사이퍼 준비금에 변화가 없다며 매도 보도를 "추측"이라고 일축했다.`,
						"계좌 잔액은 공개하지 않았다.",
						M.quote(rec, true),
					],
				};
			},
			exposed(rec, c) {
				const M = this.families.market;
				if (rec.s === "pump")
					return {
						title: this.pick(rec, "t", [`사이퍼 매입 주장의 출처는 ${c.O}`, `등록소, 사이퍼 게시글을 ${c.O}【와과】 연결`]),
						dek: "시민 등록소 조사 결과.",
						tone: "investigation",
						body: [
							`시민 등록소는 ${c.O2}의 매입을 주장한 익명 게시글을 ${c.O}【와과】 관련된 계정과 연결했다. 그 계정들은 게시글이 올라오기 전에 사이퍼를 샀고 가격이 오른 뒤 팔았다.`,
							`${c.O2c}【은는】 관여하지 않았다. 게시글이 묘사한 매입을 계획한 적도 없다.`,
							M.quote(rec, true),
						],
					};
				return {
					title: this.pick(rec, "t", [`부인하던 ${c.Oc}, 사이퍼 팔았다고 기록이 보여 줘`, `${c.O}의 사이퍼 매도 성명, 기록과 어긋나`]),
					dek: "환전소 기록과 회사 성명 대조.",
					tone: "investigation",
					body: [
						`돔 방송국이 검토한 환전소 기록에 따르면 ${c.O}【은는】 준비금에 변화가 없다고 밝힌 뒤에도 사이퍼를 계속 팔았다.`,
						`${c.Oc}【은는】 이제 그 매도가 "통상적인 조정"이었다고 말한다. 앞선 성명에 대해서는 설명하지 않았다.`,
						M.quote(rec, true),
					],
				};
			},
			selling(rec, c) {
				const M = this.families.market;
				const s = rec.q?.[1] ?? 0;
				return {
					title: s <= -3 ? `${c.O}【이가】 준비금을 팔자 사이퍼 급락` : `${c.Oc}, 사이퍼 준비금 매각 확인`,
					dek: "확인된 거래.",
					body: [
						`${c.Oc} has confirmed it is selling part of its Cipher reserves. It says the sales cover ${
							{ reserves: "준비금 규정 변경", contracts: "파운드로 만기가 돌아오는 계약 대금", confidence: "사이퍼 노출 축소" }[rec.c]
						}.`,
						M.quote(rec, true),
						"회사는 앞으로 얼마나 더 팔 생각인지 밝히지 않았다.",
					],
				};
			},
			rout(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["사이퍼 시장 전반으로 번지는 매도", "사이퍼 팔려는 거래인 더 몰려"]),
					dek: "시장 보도.",
					tone: "alert",
					body: [
						`${c.O}의 매각이 확인된 뒤 다른 보유자들도 매도에 가세했다. 환전소 직원들은 매도 주문은 줄을 잇는데 사려는 사람은 거의 없다고 설명한다.`,
						M.quote(rec, true),
					],
				};
			},
			absorbed(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", [`${c.O} 매각 뒤 사이퍼 안정`, `${c.O} 매각 뒤 돌아온 매수세`]),
					dek: "시장 보도.",
					body: [`Buyers have taken up the Cipher ${c.O} sold, and trading has calmed.`, M.quote(rec, true)],
				};
			},
			intervene(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", [`${c.O2c}, 사이퍼 매수에 나서`, `${c.O2c}, 시장 진정시키려 사이퍼 매수`]),
					dek: "확인된 거래.",
					body: [
						`${c.O2c} says it has bought Cipher on the Unit Exchange to steady prices after ${
							rec.s === "withdraw" ? `${c.O}의 시장 철수` : `${c.O}의 매도`
						}.`,
						"얼마나 오래 계속 사들일지는 밝히지 않았다.",
						M.quote(rec, true),
					],
				};
			},
			audit(rec, c) {
				const M = this.families.market;
				return {
					title: `등록소, ${c.O}의 사이퍼 준비금 검토`,
					dek: "검토 진행 중.",
					body: [`The Civic Registry has started a review of the Cipher reserves ${c.O} reports. ${c.Oc} says it will cooperate.`, M.quote(rec, true)],
				};
			},
			cleared(rec, c) {
				const M = this.families.market;
				return {
					title: `검토 결과 ${c.O}의 사이퍼 준비금 이상 없음`,
					dek: "시민 등록소 조사 결과.",
					body: [
						`시민 등록소는 ${c.O}의 준비금이 기록과 일치한다고 확인했다. 처음 보도된 문서는 오래된 것이었다고 밝혔다.`,
						M.quote(rec, true),
					],
				};
			},
			confirmed(rec, c) {
				const M = this.families.market;
				return {
					title: `검토 결과 ${c.O}의 사이퍼 준비금 차이 확인`,
					dek: "시민 등록소 조사 결과.",
					tone: "investigation",
					body: [
						`시민 등록소는 ${c.O}【이가】 고객에게 보고한 것보다 적은 사이퍼를 보유하고 있음을 확인했다. 차이가 어떻게 생겼는지, 누구의 책임인지는 아직 밝히지 않았다.`,
						M.quote(rec, true),
					],
				};
			},
			dump(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["매입설 뒤 대량 매도에 사이퍼 하락", "소문난 매입 뒤 사이퍼에 몰린 대량 매도"]),
					dek: "시장 보도.",
					body: [`A run of large sell orders hit the Unit Exchange today. No purchase by ${c.O2} has been confirmed.`, M.quote(rec, true)],
				};
			},
			result(rec, c) {
				const M = this.families.market;
				const s = rec.q?.[1];
				const subject = {
					accumulate: `${c.O}'s purchase`,
					selloff: `${c.O}의 준비금 매각`,
					withdraw: `${c.O}'s withdrawal`,
					scandal: `${c.O}에 대한 검토`,
					pump: "허위 매입 주장",
				}[rec.s];
				return {
					title: `${subject} 동안의 사이퍼 움직임`,
					dek: "Analysis.",
					body: [
						s === null || s === undefined
							? M.quote(rec)
							: `Across the reports on ${subject}, Cipher went from ${setup.arcologyFx.gbp(rec.q[0] / (1 + s / 100))} to ${M.price(rec)}, ${M.move(s)}.`,
						"이 수치는 이 기간 동안 가격이 어떻게 달라졌는지를 보여 준다. 같은 시간에 다른 거래도 이루어지고 있었으므로, 이 보도로는 가격 변동의 모든 이유를 설명할 수 없다.",
					],
				};
			},
			report(rec) {
				const M = this.families.market;
				const day = rec.q?.[2] ?? 0;
				return {
					title: this.pick(rec, "t", [
						`하루 새 사이퍼 ${M.move(day)}`,
						day > 0 ? "환전소, 사이퍼에 이례적 매수세 보고" : "환전소, 사이퍼에 이례적 매도세 보고"
					]),
					dek: "유닛 환전소 수치.",
					body: [
						`최근 하루 사이퍼 시세: ${M.move(day)}. 발행 시점에 1사이퍼는 유닛 환전소에서 ${M.price(rec)}에 거래됐다.`,
						"이 변동을 설명할 만한 발표를 한 회사나 기관은 없다. 환전소 직원들은 평소보다 활발한 통상적인 매매라고 설명한다.",
					],
				};
			},
		},
		/* The collapse. rec.s is the cause, rec.q the real price at publication, rec.cz how far the crisis had reached
		   into the city then (setup.arcologyFx.crisis), so consequences are only reported once they exist. */
		crash: {
			lean: { worried: 1.8, angry: 1.4 },
			cause(rec, c) {
				return {
					liquidity: `${c.Oc}【와과】 ${c.O2}【이가】 판매자에게서 사이퍼를 평소 사 주던 상시 주문을 거두어들였다`,
					reserve: `${c.O}【이가】 고객 잔액에 필요한 양보다 훨씬 적은 사이퍼를 준비금으로 보유한 것으로 드러났다`,
					counterfeit: `시민 등록소 밖에서 만들어진 사이퍼가 거래소에서 대량으로 팔렸다`,
				}[rec.s];
			},
			signs(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["기관 계좌의 사이퍼 매도 이례적 급증", "거래소 기록에 기관 계좌의 대량 매도"]),
					dek: "시장 보도. 원인은 확인되지 않았다.",
					body: [
						`Several institutional accounts placed unusually large sell orders on the Unit Exchange overnight. ${
							rec.s === "counterfeit"
								? "매도 계좌 가운데 일부는 며칠 전에 개설됐다."
								: `거래인들은 매도 일부를 ${c.O}【와과】 거래하는 계좌와 연결한다.`
						}`,
						M.quote(rec),
						"어느 조직도 이 매도를 설명하지 않았고, 환전소는 누가 주문을 냈는지 공개하지 않았다.",
					],
				};
			},
			liquidity(rec, c) {
				const M = this.families.market;
				/* The Unit Exchange and the Halden Trust run the standing orders; whoever is at fault speaks for the market. */
				const speaker = rec.s === "reserve" ? c.Oc : "유닛 환전소";
				return {
					title: "유닛 환전소, 매수세 사라지자 거래 지원 축소",
					dek: "환전소가 확인함.",
					tone: "alert",
					body: [
						"유닛 환전소는 준비금이 압박을 받고 있다며 사이퍼를 사들이는 자체 상시 주문을 중단했다. 할든 트러스트도 같은 조치를 했다.",
						rec.sp
							? `${speaker}【은는】 이번 조치가 "통상적인 예방 조치"이며 고객 잔액은 전액 보전돼 있다고 밝혔다.`
							: "가장 큰 매수세가 빠지면서 매수가와 매도가의 차이가 크게 벌어졌다.",
						M.quote(rec),
					],
				};
			},
			collapse(rec, c) {
				const M = this.families.market;
				const below = rec.q && rec.q[0] < 100;
				return {
					title: below ? `사이퍼, 1파운드 아래로 폭락` : this.pick(rec, "t", ["공포 매도 속에 사이퍼 폭락", "가치 대부분 잃은 사이퍼"]),
					dek: "속보. 하락 중 거래 중단.",
					tone: "breaking",
					body: [
						`Cipher's value collapsed after it emerged that ${this.families.crash.cause(
							rec,
							c
						)}. The Unit Exchange suspended trading for fifteen minutes as the price fell.`,
						M.quote(rec, true),
						below || (rec.q && rec.q[0] < 300000)
							? "시민 등록소는 긴급 명령을 내렸다. 시장이 안정될 때까지 게스트 계정은 사이퍼를 팔 수는 있어도 살 수는 없다. 주문 규모는 제한되며 매수가와 매도가의 차이는 매우 크다."
							: "주문 규모는 제한되며 매수가와 매도가의 차이가 크게 벌어졌다.",
						"섬의 서비스는 여전히 사이퍼로 요금을 받는다. 지갑 잔액의 수량은 그대로지만 사이퍼 한 개로 살 수 있는 파운드 가치가 훨씬 줄었고, 사이퍼로 임금을 받는 사람은 임금을 파운드로 바꿀 때 훨씬 적게 받는다.",
					],
				};
			},
			statement(rec, c) {
				const M = this.families.market;
				return {
					title:
						rec.s === "reserve"
							? `${c.Oc}, 준비금 부족 부인`
							: rec.s === "counterfeit"
							? "유닛 환전소, 시스템 침해 부인"
							: `${c.Oc}, 시장 철수 옹호`,
					dek: "회사 성명.",
					body: [
						rec.s === "reserve"
							? `${c.Oc}【은는】 준비금이 "건실하다"며 하락의 원인을 "제3자의 투기적 매도"로 돌렸다. 계좌 잔액은 공개하지 않았다.`
							: rec.s === "counterfeit"
							? `유닛 환전소는 매도된 사이퍼를 만든 것은 "자사가 통제하는 어떤 시스템도" 아니며 문제는 "외부 계좌"에 있다고 밝혔다. 그 계좌들이 기록된 만큼의 양을 어떻게 팔 수 있었는지는 설명하지 않았다.`
							: `${c.Oc}【은는】 자사 준비금을 지키려고 철수했으며 "여건이 허락하면" 돌아오겠다고 밝혔다. 날짜는 밝히지 않았다.`,
						M.quote(rec, true),
					],
				};
			},
			runs(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["할든 트러스트 앞에 줄 선 주민들", "할든 트러스트 밖에 몰려든 인파"]),
					dek: "거리 보도.",
					body: [
						"수백 명의 주민이 익스체인지 광장의 할든 트러스트 밖에 모였고, 상당수가 저축을 인출하거나 환전하려 했다. 집행관들은 줄을 광장 한쪽으로 몰아세웠다.",
						rec.cz >= 2
							? "트러스트는 계좌당 하루 인출을 소액으로 제한했다. 여러 상점과 술집이 사이퍼를 받지 않게 됐다."
							: "트러스트는 지금까지 인출을 제한하지 않았지만, 직원들은 고객에게 바뀔 수 있다고 말했다.",
						M.quote(rec, true),
					],
				};
			},
			probe(rec, c) {
				const M = this.families.market;
				return {
					title:
						rec.s === "counterfeit"
							? `위조 사이퍼 추적한 조사관들, ${c.O} 지목`
							: rec.s === "reserve"
							? `등록소, ${c.O}의 준비금 실종 확인`
							: "등록소, 환전소의 시장 철수 검토",
					dek: "시민 등록소 조사.",
					tone: "investigation",
					body: [
						{
							counterfeit: `시민 등록소는 붕괴를 일으킨 사이퍼가 환전소 발행 시스템의 결함으로 만들어졌고 ${c.O}【와과】 연결된 계좌를 통해 팔렸다고 밝혔다. 시스템이 관련되지 않았다는 유닛 환전소의 앞선 성명은 등록소의 조사 결과와 어긋난다.`,
							reserve: `시민 등록소는 준비금이 건실하다는 성명과 달리 ${c.O}【이가】 고객 잔액보다 훨씬 적은 사이퍼를 보유했음을 확인했다. 사라진 사이퍼가 어디로 갔는지는 밝히지 않았다.`,
							liquidity: `시민 등록소는 ${c.O}【와과】 ${c.O2}【이가】 같은 때에 시장에서 철수한 이유를 조사하고 있다. 위법 판단은 내리지 않았다.`,
						}[rec.s],
						"확인된 것은 거래의 순서와 하락의 규모다. 다투고 있는 것은 누가 먼저 알았는지, 대중이 듣기 전에 팔아 치운 사람이 있는지다.",
						M.quote(rec, true),
					],
				};
			},
			scams(rec) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["집행국, 사이퍼 사기 경고", "사이퍼 하락 속 가짜 환전 제안 확산"]),
					dek: "공개 경고.",
					tone: "alert",
					body: [
						"집행국은 붕괴 이후 사기 신고가 늘었다고 밝혔다. 가장 흔한 것은 옛 환율을 내세우는 임시 환전 단말기, 복구 기금의 자리를 파는 사람들, 할든 트러스트 직원을 사칭하는 수금원이다.",
						"트러스트는 직원을 거리로 보내지 않으며 계좌를 지켜 주는 대가로 수수료를 받는 일도 없다고 밝혔다. 사이퍼를 바꿀 수 있는 곳은 유닛 환전소뿐이다.",
						M.quote(rec, true),
					],
				};
			},
			raids(rec) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["통화 위기 깊어지며 털리는 상점", "가난한 구역에서 늘어나는 습격과 길거리 강도"]),
					dek: "도시 보도.",
					tone: "alert",
					body: [
						"아파트 단지, 언더패스, 마켓 가 일대의 상점 주인들은 무리가 침입해 물건을 가져간다고 신고한다. 결제 단말기 앞에서 강도를 당한 주민도 여럿이며, 패거리들은 보급품 배송을 두고 싸웠다.",
						"집행국은 순찰을 익스체인지 광장과 시빅 대로로 옮겼다. 치안이 미치는 구역 바깥에서는 주민들이 도움을 청해도 응답이 없다고 말한다. 민간 경비가 문을 닫은 금융 사무소 앞의 인파를 막고 있다.",
						M.quote(rec, true),
					],
				};
			},
			strain(rec) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["위기 길어지자 사이퍼 거부하는 업소들", "사이퍼 바닥에서 밀린 임금, 닫힌 계산대"]),
					dek: "도시 보도.",
					body: [
						"술집, 카페, 몇몇 상점이 사이퍼를 받지 않게 됐다. 커머스 워크의 건강용품점은 파운드만 받고, 루멘 클리닉은 치료비에 위기 수수료를 얹었다. 할든 트러스트는 인출을 제한하고 있으며, 방파제 공사 업자들은 하루 일당이 절반으로 깎였다고 말한다.",
						"집행국은 사기와 길거리 절도가 늘었다고 전하며, 상당수는 가짜 환율로 사이퍼를 바꿔 주겠다는 사람들이 얽혀 있다.",
						M.quote(rec, true),
					],
				};
			},
			services(rec) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["통화 위기 깊어지며 줄어드는 일자리와 셔틀", "컴퓨트 플로어와 주조소, 유급 근무 중단"]),
					dek: "도시 보도.",
					tone: "alert",
					body: [
						"컴퓨트 플로어와 주조소는 급여를 줄 수 없다며 유급 교대 근무를 중단했다. 도시 교통국은 비용을 줄이려고 브레이크워터 길, 아파트, 시그널 가의 정류장을 닫았다.",
						rec.cz >= 4
							? "패거리들이 더는 순찰이 닿지 않는 거리로 들어섰고, 여러 구역에서 현금과 물건을 둘러싼 싸움이 보고됐다."
							: "집행국은 익스체인지 광장 일대의 순찰을 늘렸다.",
						M.quote(rec, true),
					],
				};
			},
			backstop(rec, c) {
				const M = this.families.market;
				return {
					title: "긴급 매수에 힘입어 회복세 보이는 사이퍼",
					dek: "확인된 거래.",
					body: [
						`The Civic Registry and ${
							rec.s === "reserve" ? "유닛 환전소" : "할든 트러스트"
						} have started buying Cipher with emergency funds and say they will keep doing so.`,
						M.quote(rec, true),
						"긴급 매수가 가격에 도움이 되었지만 사이퍼의 가치는 여전히 이전보다 훨씬 낮다. 상점과 일터가 다시 정상적으로 돌아가기 시작했으나 일부 결제와 근무 제한은 남아 있다.",
					],
				};
			},
			depressed(rec) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["사이퍼에 긴급 지원 발표 없어", "긴급 지원 없는 사이퍼, 최저가 근처 머물러"]),
					dek: "시장 보도.",
					tone: "alert",
					body: [
						"사이퍼 가격 회복을 돕겠다고 사들이기 계획을 밝힌 조직은 없다. 거래인들은 사이퍼의 가치가 한동안 이전보다 훨씬 낮은 채로 있을 것으로 본다.",
						M.quote(rec, true),
						"사이퍼 결제를 중단한 업소들은 가격이 며칠 동안 안정되기 전에는 재개하지 않겠다고 말한다.",
					],
				};
			},
			restored(rec) {
				const M = this.families.market;
				return {
					title: "사이퍼 회복에 거래 지원 복귀",
					dek: "환전소가 확인함.",
					body: [
						"유닛 환전소와 할든 트러스트는 독립 기관의 준비금 검토를 거쳐 상시 주문을 재개했다. 사이퍼는 이전 가격을 향해 오르기 시작했다.",
						M.quote(rec, true),
						"상점과 고용주들이 차츰 다시 문을 열고 있다. 붕괴에 대한 조사는 계속된다.",
					],
				};
			},
			aftermath(rec, c) {
				const M = this.families.market;
				return {
					title: this.pick(rec, "t", ["사이퍼 붕괴 이후: 여전히 남은 혼란", "사이퍼 위기의 대가를 따져 보는 도시"]),
					dek: "Analysis.",
					body: [
						M.quote(rec, true),
						rec.cz > 0
							? "일부 영향은 아직 눈에 띈다. 할든 트러스트의 인출 한도, 사이퍼 결제를 재개하지 않은 업소, 거리에서 늘어난 사기가 그렇다. 앞으로 며칠 안에 누그러질 것으로 예상된다."
							: "눈에 띄던 영향은 대부분 가라앉았다. 상점은 다시 사이퍼를 받고 유급 일자리도 재개됐다.",
						rec.s === "liquidity" ? `${c.O}의 철수에 대한 등록소의 검토 결과는 공개되지 않았다.` : `${c.O}에 대한 조사는 계속되고 있다.`,
					],
				};
			},
		},
		glasshouse: {
			lean: { funny: 1.2, agree: 0.9 },
			announce(rec, c) {
				return {
					title: this.pick(
						rec,
						"t",
						rec.s === "absence"
							? ["글래스하우스 모임, 주인 불참 예상", "주인 없이 문 여는 글래스하우스", "글래스하우스의 빈자리?"]
							: ["모임 준비하는 글래스하우스", "불 켜진 글래스하우스", "글래스하우스의 밤 초대장 돌아"],
					),
					body: [
						`릴레이 가의 글래스하우스에서 직원들이 초대받은 사람만 들어가는 저녁을 준비하는 모습이 목격됐다. 손님 명단은 공개된 적이 없다.`,
						rec.s === "absence" ? `글래스하우스를 아는 사람들은 ${c.O}【이가】 참석하지 않을 수도 있다고 말한다.` : "",
					],
				};
			},
			held(rec, c) {
				return {
					title: this.pick(rec, "t", [
						"글래스하우스에 도착하는 개인 보트들",
						"글래스하우스 손님 도착으로 북적이는 릴레이 가",
						"글래스하우스의 밤, 늦게까지 이어져",
					]),
					body: [
						"손님들은 어젯밤 개인 보트를 타고 글래스하우스에 도착했다. 릴레이 가는 새벽까지 북적였다.",
						rec.s === "absence" ? `손님들은 ${c.O}【이가】 나타나지 않았다고 말했다.` : `${c.Oc}【이가】 테라스에서 잠깐 목격됐다.`,
					],
				};
			},
			gossip(rec, c) {
				return {
					title: this.pick(rec, "t", ["글래스하우스에 있던 사람은 누구?", "글래스하우스 손님 명단은 비밀", "글래스하우스 손님 짐작하는 주민들"]),
					tone: "gossip",
					body: ["Residents spent the morning guessing who had been on the guest list. Dome Broadcast was not able to confirm any names."],
				};
			},
		},
	},

	/* Written at publication, not when opened. Only implemented public services belong in these editions. */
	reminderEdition(topic, st) {
		const a = setup.arcology;
		const closed = Object.keys(a.districts)
			.filter(id => a.districts[id].bus && setup.arcologyNews.stopClosed(id, st))
			.map(id => this.district(id));
		const fx = setup.arcologyFx.sync();
		const rate = setup.arcologyFx.gbp(setup.arcologyFx.mid(fx));
		const editions = {
			identity: {
				title: "당신의 섬 핸들과 디지털 신원",
				body: [
					"섬 핸들은 아콜로지의 디지털 서비스와 공개 계정에서 쓰는 이름이다. 귀 뒤에 심은 임플란트가 당신을 홀로에 연결하며 섬 신원 기록을 담고 있다. 다른 이름을 쓴다고 해서 도시 시스템에서 당신의 기록이 지워지지는 않는다.",
					"저널 → 홀로를 열어 핸들, 권한 등급, 숙소, 지갑을 확인한다. 섬 안에서는 인터페이스가 도시 네트워크에 연결된다. 섬 밖에서는 홀로가 마지막으로 접속했을 때 저장해 둔 정보를 보여 준다. 뉴스 댓글을 달려면 도시 네트워크에 접속해 있어야 한다.",
					"시빅 대로의 시민 등록소에서는 게스트가 하루에 한 번 자신의 공개 기록을 확인할 수 있다. 다른 사람들이 당신의 신원을 스캔하거나 공개된 사건에 연루된 모습을 보면 당신의 계정은 더 알아보기 쉬워질 수 있다. 게스트 기록 백업은 이용할 수 없으며, 자신의 기록을 확인하는 것이 백업을 만들지는 않는다.",
				],
				question: "핸들을 쓰면 원래 신원이 가려지나요?",
				answer:
					"핸들은 섬에서 쓰는 사용자 이름입니다. 신원 검사나 공개된 사건 보도를 통해 다른 사람이 당신의 계정을 알아볼 수도 있습니다.",
				where: "저널 → 홀로에서 디지털 신원을 확인하거나, 시빅 대로의 시민 등록소를 찾아 공개 기록을 확인할 수 있습니다.",
				comments: [
					"핸들은 쓸모 있지만 새 신원 기록으로 여기지는 않을 거예요.",
					"캐시된 화면과 실시간 연결의 차이는 놓치기 쉬워요.",
				],
			},
			dome: {
				title: "돔이 바깥에 막아 주는 것",
				body: [
					"아콜로지의 거리는 거대한 투명 돔 아래에 있다. 돔은 그 아래의 거리와 건물에 비와 바닷물이 들어오지 못하게 막는다. 돔 가장자리에서는 몸이 젖지 않은 채 유리를 타고 흐르는 빗물을 볼 수 있다.",
					"유리는 바깥 바다에서 오는 소리도 상당 부분 막는다. 돔 가장자리에서는 파도가 유리에 부딪히는 모습이 보여도 안쪽에서는 들리지 않는다. 물소리가 들리지 않아도 안에서 파도가 유리를 치는 것을 볼 수 있다.",
					"노동자들은 브레이크워터 길을 따라 패널을 점검하고 수리한다. 공공 돔 가장자리 전망대는 이 길에서 갈 수 있다. 돔은 거리를 비와 바닷물로부터 지켜 준다. 일부 구역은 여전히 지나기에 위험할 수 있다.",
				],
				question: "왜 파도는 보이는데 소리는 안 들리나요?",
				answer:
					"유리 구조물이 거리와 바다를 갈라놓기 때문입니다. 돔 가장자리에서는 파도가 바깥에서 보여도 그 소리는 안쪽의 당신에게 닿지 않습니다.",
				where: "브레이크워터 길에서 공공 돔 가장자리 전망대를 찾아갈 수 있습니다. 거리 상황과 구역의 안전은 따로 확인해야 합니다.",
				comments: [
					"유리 반대편의 비는 아직도 적응이 안 돼요.",
					"거리가 마른다고 돔 바깥을 건너는 길까지 조용하리란 뜻은 아니에요.",
				],
			},
			xchange: {
				title: "X-체인지 스테이션에서 게스트가 살 수 있는 것",
				body: [
					"X-체인지 스테이션은 릴레이 가에 있다. 게스트 창구에서는 핑크와 블루 베이직 3개들이 묶음을 약 6사이퍼에, 핑크 또는 블루 나우 알약 한 알을 약 2.5사이퍼에 판다. 게스트는 하루에 목록에 있는 제품 하나를 살 수 있다.",
					"몸을 바꾸면 원래 모습을 알던 사람이 당신을 알아보기 어려워질 수 있다. 그렇다고 임플란트 계정이 대체되거나 공개된 사건으로 쏠린 관심이 사라지지는 않는다. 원래 몸으로 다니면 일부 신원 확인이 더 쉬워질 수도 있다.",
					"고급 제제, 신체 맞춤, 알약 변형에는 별도의 승인 요건이 있다. 고급 창구는 예약을 받지 않는다. 화면에 시술이 올라 있다고 해서 게스트 창구가 예약을 받아 준다는 뜻은 아니다.",
				],
				question: "게스트 창구에서 오늘 여러 제품을 살 수 있나요?",
				answer: "게스트 한도는 하루에 목록 제품 하나입니다. 베이직 묶음에는 알약이 세 알 들어 있지만, 그 묶음을 사도 오늘의 구매 횟수 하나를 쓴 것으로 칩니다.",
				where: "릴레이 가의 게스트 창구에서 현재 제품 목록과 오늘의 구매 상태를 확인할 수 있습니다. 고급 예약은 받지 않습니다.",
				comments: [
					"묶음 크기와 하루 구매 한도는 서로 다른 거예요. 그 설명이 필요했어요.",
					"얼굴이 달라진다고 공개된 싸움이 기록에서 사라지지는 않아요.",
				],
			},
			cipher: {
				title: "사이퍼 결제와 게스트 금고, 어떻게 돌아가나",
				body: [
					"사이퍼로 게스트 숙소, 셔틀 요금, 게스트 창구 제품 등 섬의 서비스 요금을 낸다. 본토 현금은 그 서비스에 직접 내지 않고 익스체인지 광장의 유닛 환전소에서 바꾼다.",
					`환전소는 하루 동안 움직이는 실시간 시세를 제시한다. 발행 시점에 1사이퍼 = ${rate}. 살 때는 그 시세보다 조금 더 들고 팔 때는 조금 덜 돌려받으므로, 거래를 확정하기 전에 단말기에서 두 가격을 모두 확인해야 한다.`,
					"할든 트러스트도 익스체인지 광장에 있으며, 쓸 수 있는 지갑과는 별도로 게스트 금고를 운영한다. 부스에서 지갑의 돈을 전부 금고로 옮기거나 금고의 돈을 전부 꺼낼 수 있다. 지갑에서 빠져나가는 요금을 내기 전에 돈을 꺼내야 한다. 보관된 돈은 자동으로 쓰이지 않는다.",
				],
				question: "셔틀 요금이 금고에서 자동으로 빠져나가나요?",
				answer: "아니요. 섬의 요금은 사이퍼 지갑에서 나갑니다. 지갑에 돈이 부족하면 결제하기 전에 할든 트러스트에서 금고 잔액을 꺼내야 합니다.",
				where: "Check prices at the Unit Exchange and wallet/vault balances at Halden Trust in Exchange Square. Journal → Holo also shows your wallet.",
				comments: [
					"금고에 돈을 넣어 둔 것과 바로 쓸 수 있게 갖고 있는 것은 달라요.",
					"파는 가격이 사는 가격보다 낮아요. 두 번 바꿀 거면 먼저 둘 다 확인해 보세요.",
				],
			},
			forex: {
				title: "사이퍼 환율 이해하기",
				body: [
					`익스체인지 광장의 유닛 환전소는 사이퍼 가격을 "1사이퍼 = £X"로 표시한다. 금액은 사이퍼의 천분의 일 단위까지 사고팔 수 있다. 이것이 기준 가격이다. 살 때는 조금 더 내고 팔 때는 조금 덜 받는다. 그 차이가 거래에 대한 환전소의 수수료다. 발행 시점에 1사이퍼 = ${rate}.`,
					"단말기를 쓰는 동안에도 사람과 회사가 쉬지 않고 사이퍼를 사고팔기 때문에 가격은 바뀔 수 있다. 큰 주문은 작은 주문보다 가격을 더 크게 움직이며, 회사의 계획에 관한 소식은 아직 아무것도 사들이기 전에도 가격을 움직일 수 있다.",
					"파운드로 사이퍼를 사서 곧바로 팔면 사는 가격과 파는 가격이 달라서 돌려받는 파운드가 더 적다. 거래가 산 값보다 많이 돌아오려면 먼저 가격이 당신에게 유리하게 충분히 움직여야 하며, 가격은 오를 수도 내릴 수도 있다. 이 기사는 어떤 거래도 수익이 난다고 권하지 않는다.",
					"지갑이나 할든 트러스트 금고에 든 사이퍼는 시장이 움직여도 수량이 변하지 않는다. 파운드로 환산한 가치만 달라진다.",
				],
				question: "단말기를 보는 동안 가격이 왜 바뀌었나요?",
				answer:
					"환전소는 이루어지는 거래를 바탕으로 몇 초마다 가격을 갱신합니다. 주문이 처리되기 전에 가격이 당신에게 불리하게 움직이면, 단말기가 새 총액을 보여 주고 다시 확인을 요청합니다.",
				where: "익스체인지 광장의 유닛 환전소에 있는 실시간 단말기를 이용할 수 있습니다. 시장 기사는 돔 방송국의 시장 코너에 실립니다.",
				comments: [
					"매매가 차이가 있다는 걸 알았더라면 그날 오후를 망치지 않았을 거예요.",
					"금고에 든 사이퍼 수는 그대로예요. 움직이는 건 파운드 가치예요.",
				],
			},
			transit: {
				title: "이동하기 전에 셔틀 운행 확인하기",
				body: [
					"자율 셔틀은 도시 노선 안내판에 표시된 공공 정류장을 오간다. 탑승 전에 출입문 스캐너가 임플란트를 확인한다. 기본 요금은 1사이퍼이며, 자격이 있는 유효한 후원이 있으면 면제될 수 있다. 요금을 낼 수 있는지는 탑승 화면에 표시된다.",
					"도시에 사건이 생기면 정류장이 일시적으로 닫힐 수 있다. 탑승 화면에서 폐쇄된 정류장은 목적지로 선택할 수 없다. 제한 구역은 공공 셔틀 노선이 닿지 않는다. 계정으로 들어갈 수 있는 구역이라면 걸어서 다른 구역으로 갈 수도 있다. 계정으로 이용할 수 있다면 도시 지도가 갈 길을 보여 줄 수 있지만, 그곳까지는 직접 걸어야 한다.",
					closed.length
						? `발행 시점 노선 안내판 현황: ${closed.join(", ")} ${closed.length === 1 ? "" : ""}운행 중단.`
						: "발행 시점 노선 안내판 현황: 운행 중단으로 표시된 공공 정류장 없음.",
					"이 기사는 발행 시점의 현황을 그대로 담고 있다. 특히 오래된 기사를 읽은 뒤에는 탑승하기 전에 현재 정류장 안내판을 확인해야 한다. 운영사의 예전 발표는 지금 그 정류장에서 벌어지는 일과 다를 수 있다.",
				],
				question: "이 기사가 지금 내 정류장이 열려 있다고 보장하나요?",
				answer: "아니요. 노선 안내판 현황은 발행 시점의 것입니다. 현재 정류장 안내판을 확인해야 합니다. 기사가 나온 뒤에 폐쇄가 바뀔 수 있습니다.",
				where: "공공 셔틀 정류장의 화면을 이용합니다. 화면에는 현재 탑승할 수 있는 목적지, 운행 중단된 정류장, 요금 또는 면제 여부가 표시됩니다.",
				comments: ["교대 근무가 끝나고 귀가 계획을 세우기 전에 정류장 안내판부터 확인해요.", "요금이 면제된다고 닫힌 정류장에 셔틀이 서는 건 아니에요."],
			},
			safety: {
				title: "새 경로를 타기 전에 구역 안전 등급을 읽어 두자",
				body: [
					"아콜로지는 구역을 치안, 감시, 분쟁, 적대, 무법의 다섯 등급으로 나눈다. 이 등급은 순찰이 미치는 정도와 거리의 위험이 얼마나 다른지를 나타낼 뿐, 어떤 이동이든 안전하다는 약속이 아니다. 패거리 분쟁 중에는 상황이 나빠질 수 있고 순찰대가 도착하면 달라질 수 있다.",
					"낯선 경로를 타기 전에 구역 설명, 현재 거리 공지, 최근 보고를 확인한다. 한적한 골목과 적대 구역에는 북적이는 공공 대로에는 없는 위험이 있다. 게스트는 집행국이 주민에게 주는 것과 같은 보호를 받는다고 생각해서는 안 된다.",
					"돔 방송국은 성명과 함께 독립적인 증언도 보도한다. 조직은 문제를 축소할 수 있다. 운행 안내판이나 거리 자체가 앞선 보도와 어긋난다면 그 보도를 안전의 보증으로 여기지 않는다.",
				],
				question: "치안 등급이면 아무 일도 일어나지 않나요?",
				answer:
					"어떤 등급도 안전을 보장하지 않습니다. 등급은 구역의 일반적인 상황을 설명할 뿐이며, 사건, 당신의 공개 프로필, 선택한 경로는 여전히 중요합니다.",
				where:
					"현재 거리 설명과 최근 구역 보고를 읽습니다. 지도 사용 권한이 있는 사람은 기록된 구역 정보도 살펴볼 수 있지만, 그 정보는 현재 상황보다 오래됐을 수 있습니다.",
				comments: [
					"안전 등급이 도움은 되지만, 그래도 거리에서 무슨 일이 벌어지는지 보겠어요.",
					"공식 성명과 주민의 이야기가 늘 같지는 않아요.",
				],
			},
			assessment: {
				title: "알아보는 것과 위협 평가는 다르다",
				body: [
					"알아보는 정도는 당신의 외모나 계정이 얼마나 쉽게 식별되는지를 말한다. 아콜로지의 위협 평가는 당신이 얼마나 위험한 존재로 여겨지는지를 말한다. 기록 열람, 공개된 소동, 최근의 싸움은 당신에게 쏠리는 관심에 영향을 줄 수 있지만 모두 같은 뜻은 아니다.",
					"공개 위협 프로필이 높으면 민간인이 경계하고, 범죄자가 접근하는 방식이 바뀌며, 보안 대응도 더 철저해질 수 있다. 위험한 존재로 여겨진다고 해서 권한 등급이 올라가거나 사람들이 당신을 내버려 둔다는 보장은 없다.",
					"공개 상황이 달라지면 소셜 → 홀로의 섬 위협 평가를 확인한다. 외모를 바꾸는 것은 계정 상태와 현재 권한을 확인하는 일을 대신하지 못한다.",
				],
				question: "위험하다는 평판이 있으면 권한 등급이 높아지나요?",
				answer:
					"아니요. 위협 평가와 접근 권한은 별개입니다. 위험하다는 공개 프로필은 더 강한 저항을 부를 수 있지만 게스트 제한 서비스를 열어 주지는 않습니다.",
				where: "소셜 → 홀로의 섬 위협 평가를 확인하고, 권한 등급은 저널 → 홀로의 디지털 신원 패널에서 따로 확인합니다.",
				comments: [
					"보안이 나에게 더 신경 쓰는 때를 존중으로 착각하느니 차라리 그걸 알고 싶어요.",
					"사람들이 당신을 알아보는 것과 당신을 두려워하는 것은 서로 다른 문제예요.",
				],
			},
			cybernetics: {
				title: "당신의 임플란트는 계정이지, 모든 서비스의 승인이 아니다",
				body: [
					"아콜로지에서는 임플란트와 사이버네틱 장비가 흔하다. 직원들은 스캐너로 계정 정보를 읽고, 일부 주민은 일할 때 강화된 눈이나 팔다리 등 장비를 쓴다. 겉모습이 비슷한 사람도 능력이 아주 다를 수 있다.",
					"기본 시민 임플란트는 섬 신원과 홀로 접속을 제공한다. 게스트 등록이 클리닉이나 등록소가 광고하는 모든 시술을 승인하는 것은 아니다. 시빅 대로의 공개 기록 확인은 게스트도 이용할 수 있지만, 기록 백업은 게스트 계정에서 명시적으로 이용할 수 없다.",
					"클리닉 시험에 관한 뉴스 보도는 그 조직의 활동을 설명할 뿐이다. 당신의 계정으로 증강이나 백업을 예약할 수 있다는 확인이 아니다. 계획을 세우기 전에 실제 서비스 창구의 승인 안내를 읽어야 한다.",
				],
				question: "게스트도 등록소 백업을 만들 수 있나요?",
				answer: "게스트 기록 백업은 이용할 수 없습니다. 게스트는 시민 등록소에서 공개 기록을 확인할 수 있으며, 그 확인이 백업을 만들지는 않습니다.",
				where:
					"시빅 대로의 시민 등록소에는 당신의 기록과 게스트 제한이 표시됩니다. 클리닉과 스테이션 창구는 각자의 승인 한도를 안내합니다.",
				comments: [
					"기본 임플란트로는 접속이 될 뿐이에요. 모든 서비스를 쓸 수 있게 해 주진 않아요.",
					"광고를 예약으로 착각하기 전에 승인 안내부터 읽어 볼래요.",
				],
			},
			hotel: {
				title: "후원이 끝나기 전에 호텔 승인 확인하기",
				body: [
					"호텔 메리디안은 릴레이 가에서 방문객에게 객실을 제공한다. 후원을 받았거나 요금을 낸 객실은 홀로에 표시된 만료 시각까지만 이용할 수 있다. 후원에는 기한이 있으며, 오래된 기사에 후원이 언급되어 있다고 해서 체류가 연장되는 것은 아니다.",
					`At publication, a standard paid night cost ${a.cx(
						setup.arcologyPrice.peek("night").q
					)} and provides 24 hours of room authorization. Payment comes from the wallet. If sponsorship has ended, check the reception desk for the options your account is offered rather than assuming the room remains covered.`,
					"방문객 숙소를 이용한다고 해서 거주자 권한이나 제한 서비스 이용권, 제한 구역 출입의 영구 허가가 생기는 것은 아니다. 별도의 후원 조건과 검문소 조건이 적용될 수 있다. 취소된 방문객 계정은 사이퍼를 넉넉히 가지고 있다는 이유만으로 출입을 갱신할 수 있다고 여겨서는 안 된다.",
				],
				question: "방이 있으면 나도 거주자가 되나요?",
				answer: "아니다. 요금을 냈든 후원을 받았든 방문객 객실은 숙소일 뿐 거주자 권한이 아니다. 이용 권한도 홀로에 표시된 시각에 만료된다.",
				where: "숙소 상태와 만료 시각은 저널 → 홀로에서 확인하고, 결제나 출입에 문제가 있으면 호텔 메리디안 프런트 데스크에 문의한다.",
				comments: [
					"하룻밤 더 묵을 형편이 되는지 따져 보기 전에 만료 시각부터 확인해요.",
					"방값을 내는 것과 거주자 출입 권한을 얻는 것은 별개의 거래예요.",
				],
			},
			shocks: {
				title: "사이퍼의 움직임을 따라 함께 움직이는 도시",
				body: [
					"섬의 모든 가격은 사이퍼로 매겨지므로, 유닛 환전소에서 큰 변동이 일어나면 몇 시간 안에 거리에까지 미친다. 크게 오르면 게시된 가격이 싸 보이고, 떨어지면 같은 물건이 그날 아침보다 더 많은 사이퍼를 요구한다.",
					"가게마다 반응하는 방식은 다르다. 어떤 곳은 계산대에서 그때그때 가격을 다시 매기고, 어떤 곳은 인쇄된 가격표를 며칠씩 그대로 둔다. 가격표가 시세에 뒤처진 것을 눈치챈 판매자는 그 가격을 그대로 받아 줄 수도, 계산 전에 바꿀 수도, 아예 판매를 거절할 수도 있다. 크게 폭락하면 일부 계산대는 사이퍼를 받지 않고 파운드를 요구한다.",
					"변동이 클수록 피해도 넓어진다. 급격한 폭락은 과거에 금융 사무소 앞에 인파를 모았고, 파운드를 쌓아 둔 상점에 대한 약탈과 긴급 환전을 미끼로 한 사기, 셔틀 정류장 폐쇄, 임금 체불을 불러왔다. 작은 하락에서는 이 가운데 어느 것도 시작되지 않지만, 시세가 회복되는 순간 곧바로 끝나는 것도 아니다.",
				],
				question: "사이퍼가 회복되면 물가도 곧바로 정상으로 돌아오나요?",
				answer:
					"곧바로는 아니다. 인쇄된 가격표와 밀린 임금, 닫힌 서비스는 며칠에 걸쳐 따라잡으며, 큰 폭락 뒤에는 한동안 도시의 긴장이 가라앉지 않는다.",
				where:
					"유닛 환전소의 실시간 단말기와 돔 방송의 시장·도시 면을 지켜보면 된다. 상점 계산대에는 가격이 정정되었는지 표시되어 있다.",
				comments: [
					"지난번 폭락 때는 우리 동네 가게가 오후에 벌써 파운드를 달라고 했어요.",
					"폭락장에 가격이 싸 보인다면 판매자도 이미 눈치챈 거예요.",
				],
			},
			streets: {
				title: "걷기 전에 거리를 읽을 것",
				body: [
					"거주자는 구역의 분위기가 바뀌는 것을 알아차리는 법을 배운다. 순찰이 도는 대로는 붐빈다. 쇼핑객과 차량이 오가고, 광고 화면이 켜져 있고, 몇 분마다 순찰대가 지나간다. 분쟁 구역과 무법 구역에서는 화면도 열린 가게도 적고, 문간에 서서 지나가는 사람을 지켜보는 이들이 많다.",
					"익숙한 거리가 갑자기 텅 비고 노점상이 일찍 짐을 싸고 가게들이 셔터를 내린다면 그곳을 떠나라. 이곳에서 무사히 지내는 거주자들은 아직 아무 일도 없더라도 그런 징후를 경고로 받아들인다.",
					"돌아서는 데는 몇 분이 들 뿐이지만, 집행국이 순찰하지 않는 구역에서 궁지에 몰리면 훨씬 큰 대가를 치를 수 있다.",
				],
				question: "위험한 거리와 조용한 거리는 어떻게 구별하나요?",
				answer:
					"조용한 거리에도 제 볼일을 보는 사람들이 있다. 위험한 거리에서는 사람들이 자리를 뜨고, 셔터가 내려오고, 아무도 멈춰 서서 말을 걸지 않는다. 확신이 서지 않으면 사람이 많고 밝은 대로로 돌아가라.",
				where: "도시 지도가 있다면 구역의 안전 등급을 확인하고, 최근 구역 보고서를 읽고, 거리 자체의 분위기에도 주의를 기울인다.",
				comments: ["아파트 구역이 밤에 조용해지면 우리 층 사람들은 다 집에 틀어박혀요.", "노점이 일찍 접으면 나도 접어요."],
			},
			prices: {
				title: "섬의 모든 것이 이토록 비싼 이유",
				body: [
					"아콜로지는 이곳에서 살 수 있는 사람들에게 맞춰 값이 매겨진다. 커피 한 잔이나 바에서 마시는 술 한 잔에도 사이퍼 1개가 통째로 들고, 호텔 메리디안에서 하룻밤을 묵는 비용은 본토의 웬만한 아파트 한 달 월세보다 비싸다.",
					"게시된 가격은 환율을 따른다. 가격이 유난히 높거나 낮아 보이면 판매자에게 이유를 물어보라. 답은 대개 오늘의 환율이거나 갱신되지 않은 가격표, 품귀, 또는 위기 동안 파운드만 받는 계산대 가운데 하나다.",
					"사이퍼를 조금만 들고 도착한 방문객은 금방 바닥난다. 돈을 내야 할 일이 생기기 전에 유닛 환전소에서 파운드를 바꿔 두고, 방값과 셔틀 요금에 쓸 만큼은 지갑에 넣어 두라.",
				],
				question: "섬에 싼 것이 있기는 한가요?",
				answer:
					"거의 없다. 계산대에서 파는 가장 싼 물건이 대략 사이퍼 1개부터 시작한다. 그보다 낮은 가격이 붙어 있다면 대개 시세 하락 중에 갱신되지 않은 가격표이고, 판매자들은 그것을 알아챈다.",
				where: "가격이 붙은 계산대마다 현재 가격이 표시되어 있다. 이상한 가격 옆의 질문 링크로 판매자에게 이유를 물어볼 수 있다.",
				comments: ["커피 한 잔에 사이퍼 1개를 냈는데 서서 마셔야 했어요.", "여기 오는 사람 중에 돈 아끼려는 사람은 없어요."],
			},
			enforcement: {
				title: "집행국이 방문객에게 해 주는 일과 해 주지 않는 일",
				body: [
					"방문객은 비상시에 임플란트로 집행국을 호출할 수 있다. 상황실은 계정당 하루 두 번까지 호출을 받으며, 그 뒤로는 다음 날까지 호출을 받지 않는다.",
					"도움은 보장되지 않는다. 순찰대는 순찰 구역과 감시 구역에는 빨리, 분쟁 구역에는 느리게 도착하고, 무법 구역에는 좀처럼 오지 않는다. 위기 때는 모든 순찰대가 인력난에 시달린다. 도시가 요주의로 표시한 계정이 호출하면 신원 확인이나 의심을 받거나, 사건이 아니라 호출한 사람을 겨냥한 순찰대가 출동할 수도 있다.",
					"집행국은 거주자를 보호하기 위해 존재한다. 후원자가 있는 방문객은 먼저 그 후원자에게 의지하리라고 여겨진다. 후원자가 없는 방문객은 불이 켜진 대로를 따라 움직이고, 낯선 사람이 자신을 자세히 살펴볼 빌미를 주지 않는 편이 좋다.",
				],
				question: "호출하면 순찰대가 항상 오나요?",
				answer:
					"아니다. 도착 여부는 구역과 도시 상황, 계정에 붙은 표시에 달려 있다. 호출은 하루 두 번이 한도이며, 거절되었거나 늦어진 호출도 횟수에 포함된다.",
				where: "호출에 의지하기 전에 소셜 → 홀로에서 위협 평가를 확인하고, 도시 지도에서 구역 등급을 확인한다.",
				comments: [
					"이웃을 위해서는 4분 만에 왔어요. 언더패스에는 아예 오지 않았고요.",
					"하루 두 번이면 충분하다 싶다가도 세 번째가 필요해지면 얘기가 달라져요.",
				],
			},
			work: {
				title: "파운드를 바꾸지 않고 사이퍼 벌기",
				body: [
					"방문객도 얼마간 유급 일자리를 구할 수 있다. 커머스 워크의 연산실은 한 시간 동안 퍼즐을 푸는 대가를 지급하고, 브레이크워터 길의 방파제 작업반은 일용직을 받으며, 아이언웍스 주조소는 가장 힘든 교대에 가장 많이 준다. 각각 하루에 한 번 지급한다.",
					"이 임금은 섬 기준으로는 소박하다. 한 번의 교대로 술 몇 잔 값을 벌 뿐, 호텔 하룻밤에는 못 미친다. 통화 위기 동안에는 도시의 계정이 정리될 때까지 임금 일부를 보류하는 고용주도 있고, 아예 문을 닫는 곳도 있다.",
					"일은 당신의 기록에 남는다. 정직한 소득이라 위협 프로필을 높이지는 않지만, 오래 머물 생각이라면 파운드 환전을 대신할 수는 없다.",
				],
				question: "방문객이 섬의 임금만으로 살 수 있나요?",
				answer: "편하게는 어렵다. 하루 교대로는 소소한 것을 살 수 있을 뿐, 객실이나 큰 지출에는 여전히 유닛 환전소에서 산 사이퍼가 필요하다.",
				where: "연산실은 커머스 워크에, 방파제 해치는 브레이크워터 길에, 주조소 정문은 아이언웍스에 있다.",
				comments: [
					"방파제 일이 생각보다 벌이가 좋지만 손이 며칠씩 아파요.",
					"지난 위기 때 주조소가 문을 닫아서 우리 거리 사람 절반이 하나뿐인 일자리를 잃었어요.",
				],
			},
		};
		return Object.assign(editions[topic], {
			dek: {
				identity: "핸들과 임플란트, 공개 기록이 다른 사람들에게 알려 줄 수 있는 것.",
				dome: "유리 외피가 거리를 바깥의 날씨와 소음으로부터 지켜 준다.",
				xchange: "방문객용 제품, 일일 구매 한도, 계속 제한되는 서비스.",
				cipher: "본토 현금을 바꾸는 곳, 그리고 보관된 사이퍼가 지갑과 별개인 이유.",
				forex: "표시 가격의 의미, 매수가와 매도가가 다른 이유, 환율이 계속 움직이는 이유.",
				transit: "요금, 후원자 면제, 날짜가 찍힌 정류장 운행 현황.",
				safety: "등급을 보장으로 착각하지 않고 구역 분류를 이해하기.",
				assessment: "공개 인지도, 위협 평가, 출입 권한은 저마다 효과가 다르다.",
				cybernetics: "기본 홀로 접속만으로 광고된 모든 클리닉이나 등록소 서비스가 허가되지는 않는다.",
				hotel: "객실 결제, 후원 만료, 방문객 숙소의 한계.",
				shocks: "거래소의 큰 변동이 상점 계산대와 임금, 교통, 거리에까지 미친다.",
				streets: "갑자기 분위기가 달라진 구역은 무언가를 말해 주고 있다.",
				prices: "부유한 방문객을 위한 값비싼 도시, 그리고 이상해 보이는 가격을 읽는 법.",
				enforcement: "하루 두 번의 호출, 고르지 않은 순찰 범위, 요주의 계정이 답을 바꾸는 이유.",
				work: "방문객을 위한 일일 유급 교대, 그 보수, 위기 때 벌어지는 일.",
			}[topic],
		});
	},

	reminder(rec) {
		const edition = rec.x;
		const voices = this.people.filter(p => ["worker", "loyal"].includes(p[1]));
		return {
			cat: "CITIZEN REMINDER",
			tone: "reminder",
			byline: "돔 방송 · 공공 정보",
			heat: 0.25,
			title: edition.title,
			dek: edition.dek || edition.body[0],
			body: edition.body,
			note: "정기 시민 안내. 규칙과 서비스 현황은 이번 호의 발행일을 기준으로 하며, 변경 사항은 현재의 안내 창구에서 확인하십시오.",
			options: [
				[edition.question, "", "question"],
				["Where should I check if this changes?", "", "question"],
			],
			residents: edition.comments.map((line, i) => [voices[(Math.floor(setup.arcologyNews.seed(rec.id) * voices.length) + i) % voices.length][0], line]),
		};
	},

	/* Daily notices. */
	notice(rec) {
		const a = setup.arcology;
		const out = { cat: "NOTICE", tone: "notice", byline: "돔 방송 편집부", heat: 0.3 };
		if (rec.f === "safety") {
			const d = a.districts[rec.d];
			const tier = a.tierNames[d.tier].toLowerCase();
			const extra = (rec.x ?? []).includes("patrol")
				? " 이번 주에는 구역에 추가 집행관이 배치되어 있다."
				: (rec.x ?? []).includes("rough")
				? " 이번 주에는 조직 간 충돌 신고가 늘었다."
				: "";
			out.title = this.pick(rec, "t", [`${d.name}: ${({ policed: "순찰 구역", monitored: "감시 구역", contested: "분쟁 구역", hostile: "적대 구역", lawless: "무법 구역" })[tier] || tier}`, `${d.name} 안전 등급`]);
			out.body = [
				`섬 집행국은 ${d.name}【을를】 ${({ policed: "순찰 구역", monitored: "감시 구역", contested: "분쟁 구역", hostile: "적대 구역", lawless: "무법 구역" })[tier] || tier}【으로로】 평가한다.${extra}`,
				[
					"순찰이 잦고 대응이 빠르다.",
					"순찰이 정기적으로 돈다.",
					"순찰이 드물다. 해가 진 뒤에는 한적한 길을 피하라.",
					"순찰이 거의 없다. 여럿이 함께 다녀라.",
					"집행국은 이곳을 순찰하지 않는다.",
				][d.tier],
			];
			out.place = d.name;
		} else if (rec.f === "transit") {
			const shut = (rec.x ?? []).map(d => this.district(d));
			const stops = Object.values(a.districts).filter(d => d.bus).length;
			out.title = shut.length ? `셔틀 노선망: ${shut.join(", ")} 운행 중단` : `공용 셔틀 정류장 ${stops}곳 모두 운행 중`;
			out.body = [
				shut.length
					? `공용 정류장 ${stops}곳 중 ${stops - shut.length}곳이 운행 중이다. ${shut.join(" 및 ")}【은는】 ${shut.length > 1 ? "" : ""}운행이 중단되었다.`
					: "모든 공용 정류장이 운행 중이다.",
				"제한 구역에는 공용 노선이 다니지 않는다.",
			];
			out.byline = "도시 교통국 공지";
		} else if (rec.f === "drift") {
			const [km, dir] = rec.x;
			const way = ["north", "north-east", "east", "south-east", "south", "south-west", "west", "north-west"][dir];
			out.title = `섬이 밤새 ${({ north: "북쪽", "north-east": "북동쪽", east: "동쪽", "south-east": "남동쪽", south: "남쪽", "south-west": "남서쪽", west: "서쪽", "north-west": "북서쪽" })[way] || way}으로 ${km}km 표류`;
			out.body = [
				this.pick(rec, "b", [`섬이 밤새 ${km}킬로미터를 ${({ north: "북쪽", "north-east": "북동쪽", east: "동쪽", "south-east": "남동쪽", south: "남쪽", "south-west": "남서쪽", west: "서쪽", "north-west": "북서쪽" })[way] || way}으로 이동했다.`, `밤사이 표류: ${({ north: "북쪽", "north-east": "북동쪽", east: "동쪽", "south-east": "남동쪽", south: "남쪽", "south-west": "남서쪽", west: "서쪽", "north-west": "북서쪽" })[way] || way} 방향으로 ${km}킬로미터.`]),
				"본토에서 오는 항로는 며칠 동안 시간이 더 걸릴 수 있다.",
			];
		} else if (rec.f === "registry") {
			out.title = "등록소: 방문객 기록 확인과 백업 제한";
			out.body = [
				"방문객은 시빅 대로의 시민 등록소에서 하루에 한 번 자신의 공개 기록을 확인할 수 있다. 방문객 기록 화면에는 기록 백업을 이용할 수 없다고 안내되어 있으며, 기록 확인은 백업이 되지 않는다.",
			];
			out.byline = "시민 등록소 공지";
		} else if (rec.f === "exchange") {
			out.title = "유닛 환전소: 거래 전에 두 가격을 모두 확인할 것";
			out.body = [
				"익스체인지 광장의 유닛 환전소는 사이퍼의 실시간 가격을 파운드로 고시한다. 살 때는 고시가보다 조금 더 들고 팔 때는 조금 덜 돌려받는다. 가격은 보는 동안에도 움직이므로 확정하기 전에 단말기를 확인하라.",
			];
			out.cat = "BUSINESS";
		} else {
			const [t, b] = this.pick(rec, "dome", [
				[
					"바깥의 비는 돔 밖에 머문다",
					"돔 가장자리 전망대에서 바깥 유리를 타고 흐르는 빗물이 보인다. 돔 안의 거리는 비를 맞지 않는다.",
				],
				[
					"브레이크워터 길 따라 돔 점검",
					"작업자들이 브레이크워터 길을 따라 바깥 유리 패널을 점검하고 수리한다. 공개 돔 가장자리 전망대는 이 길에서 갈 수 있다.",
				],
				[
					"시빅 대로 스캐너, 지나가는 임플란트 검사",
					"시빅 대로의 보안 드론이 대로를 지나는 사람들을 스캔한다. 방문객 계정은 시민 등록소에서 자신의 공개 기록을 확인할 수 있다.",
				],
			]);
			out.title = t;
			out.body = [b];
		}
		out.residents = [];
		return out;
	},

	weekly(rec) {
		const reports = (rec.x ?? []).map(x => Object.assign({}, x, { id: x.id ?? rec.id + x.ph + x.d }));
		const sections = reports.map(x => {
			const c = this.context(x);
			const w = this.families[x.f][x.ph].call(this, x, c);
			const previous = x.h?.at(-1);
			const history = previous
				? (() => {
						const [ph, at, n, sp, id, q] = previous;
						const earlier = Object.assign({}, x, { ph, at, n, sp, id, q, h: [] });
						const d = new DateTime(at);
						const month = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"][
							d.month - 1
						];
						return [`Last reported ${d.day} ${month}: “${this.families[x.f][ph].call(this, earlier, this.context(earlier)).title}”.`];
				  })()
				: [];
			const explanation = this.explanation(x, c);
			const sentence = p => p.match(/^.*?[.!?](?:\s|$)/)?.[0].trim() ?? p;
			return { title: w.title, id: x.id, paragraphs: [...history, ...w.body.filter(Boolean).slice(0, 1), ...explanation.slice(0, 1).map(sentence)] };
		});
		const places = [...new Set(reports.map(x => this.district(x.d)))];
		const where = places.length > 1 ? `${places.slice(0, -1).join(", ")}${places.length > 2 ? ", " : "【와과】 "}${places.at(-1)}` : places[0];
		const intro = reports.length
			? `이번 주의 주요 소식은 ${where}에서 나왔다. 아래 각 소식에는 지난 보도 이후의 진행 상황이 담겨 있다.`
			: "이번 주에는 이어지는 소식 가운데 눈에 띄는 것이 없었다. 일상 공지와 시민 안내는 보관소에 있다.";
		const connections = [];
		for (let i = 0; i < reports.length; i++)
			for (let j = i + 1; j < reports.length; j++) {
				const a = reports[i];
				const b = reports[j];
				const shared = [a.o, a.o2].filter(Boolean).find(o => [b.o, b.o2].includes(o));
				if (a.d === b.d)
					connections.push(
						`이번 주 소식 가운데 ${this.context(a).O || "한 건"}【와과】 ${this.context(b).O || "다른 한 건"}【은는】 모두 ${this.district(
							a.d
						)}에서 일어났다. 그곳으로 가는 사람은 두 소식을 모두 염두에 두어야 하지만, 지금까지는 둘을 잇는 것이 아무것도 없다.`
					);
				else if (shared)
					connections.push(
						`${setup.arcologyNews.orgName(
							shared
						)} turns up in two of this week's stories. That is worth noticing, but nothing published so far shows the two are connected.`
					);
			}
		if (connections.length) sections.push({ title: "눈여겨볼 점", paragraphs: connections.slice(0, 2) });
		return {
			cat: "WEEKLY",
			tone: "digest",
			byline: "돔 방송 편집부",
			title: this.pick(rec, "t", ["섬의 한 주", "7일 돌아보기", "돔 안의 이번 주"]),
			dek: sections.length ? "이번 주에 무엇이 달라졌는지, 거주자에게 어떤 의미인지, 아직 모르는 것은 무엇인지." : "이번 주의 발행 기록.",
			body: [intro, ...sections.flatMap(s => s.paragraphs)],
			sections,
			note: rec.i ? `돔 방송은 방문객이 연루된 공개 사건 ${rec.i}건도 보도했다.` : "",
			heat: 0.5,
		};
	},

	breakingTypes: {
		assault: [
			"방문객, 메리디안 경비와 몸싸움",
			"호텔 메리디안의 방문객 한 명이 로비에서 호텔 경비원 두 명과 몸싸움을 벌였다. 집행국이 조사에 착수했다.",
		],
		leak: [
			"방문객의 신원 기록, 공개 채널에서 판매",
			"섬 사용자 이름과 연결된 본토 신원 기록이 오늘 여러 구매자에게 전송되었다. 등록소는 방문객에게 협박을 당하면 신고하라고 당부했다.",
		],
		raid: [
			"사이퍼 위기가 이어지는 가운데 상점 약탈",
			"한 무리가 소규모 업체에 억지로 들어가 목격자들 앞에서 재고와 현금을 가져갔다. 업주는 며칠째 사이퍼 매출이 거의 가치가 없었다고 말했다. 목격자가 약탈을 신고했다.",
		],
		fraud: [
			"집행국, 위기 틈탄 사기 경고",
			"한 주민이 가짜 환전 서비스를 이용한 사기 시도를 신고했다. 집행국은 할든 트러스트와 유닛 환전소는 직원을 거리로 보내지 않으며 저축을 지켜 주겠다며 돈을 받는 일도 없다고 밝혔다.",
		],
		brawl: [
			"혼자인 방문객, 훈련된 싸움꾼들을 제압",
			"집행국 드론이 방문객 한 명이 무장한 전문가들을 제압한 싸움을 촬영했다. 영상은 삭제되기 전에 널리 퍼졌다.",
		],
	},

	breaking(rec) {
		const [title, body] = this.breakingTypes[rec.f] ?? ["사건 보고", "집행국이 사건을 조사하고 있다."];
		return {
			cat: "BREAKING",
			tone: "breaking",
			title,
			body: [body, rec.d ? `${this.district(rec.d)}에서 벌어진 일이다.` : ""].filter(Boolean),
			heat: 1,
			lean: { worried: 1.3, funny: 1.2 },
			byline: "돔 방송 뉴스룸",
		};
	},

	/* Resident handles. home: district where the resident lives, so they can describe what they saw there. */
	people: [
		["kettle_9", "worker", "ironworks"],
		["rivet.and.rust", "worker", "ironworks"],
		["dock.saint", "local", "pier"],
		["tidecaller", "local", "breakwater"],
		["saltglass", "local", "flats"],
		["mothlight", "night", "neon"],
		["nullpoint", "skeptic", "underpass"],
		["drip-feed", "local", "market"],
		["grey.wire", "worker", "forge"],
		["sable.r", "worried", "medtech"],
		["ana.plume", "loyal", "exchange"],
		["lux.ember", "loyal", "skyline"],
		["calla.bright", "loyal", "commerce"],
		["hollis.grade", "loyal", "civic"],
		["vanta.mode", "skeptic", "signal"],
		["bitrot", "joker", ""],
		["mira.west", "worried", "relay"],
		["sato.k", "skeptic", ""],
		["quiet.harbour", "worried", "pier"],
		["fennel", "joker", "neon"],
		["ozone.kid", "rumour", "underpass"],
		["paper.moth", "rumour", ""],
		["juniper.n", "loyal", ""],
		["lowlight", "night", "neon"],
		["copperhead", "worker", "forge"],
		["mx.tallow", "joker", ""],
		["static.wren", "rumour", "neon"],
		["harrow.v", "skeptic", "flats"],
		["oriel", "worried", "commerce"],
		["bluegill", "local", "breakwater"],
		["shard77", "rumour", "market"],
		["noor.k", "worker", "commerce"],
	],

	/* What each kind of resident says: [text, categories it fits, or none for any]. {D} district, {O} organisation.
	   Workers only talk about work and night regulars about nights out, so nobody comments off topic. */
	voices: {
		loyal: [
			["일을 처리하는 사람이 있어서 다행이에요.", "SECURITY CRIME INDUSTRY CYBERNETICS"],
			["일하게 두세요.", "SECURITY CRIME"],
			["Thanks for the update."],
			["그래서 제가 등록된 주소에 돈을 내는 거예요.", "SECURITY CRIME CYBERNETICS"],
			["우린 그냥 조용한 거리가 좋을 뿐이에요.", "SECURITY CRIME SOCIETY"],
			["합리적인 조치네요.", "BUSINESS TRANSIT"],
			["I'm waiting to see whether the price stops changing so much.", "MARKETS"],
			["재난 아닌 글을 읽으니 좋네요.", "BUSINESS SOCIETY PEOPLE"],
		],
		skeptic: [
			["Whose statement is this, exactly?"],
			["I'll believe it when I see it."],
			["아무도 이름이 안 나오는 거 봤어요?", "SECURITY CRIME BUSINESS CYBERNETICS MARKETS"],
			["I want to see the actual trade records, not another company statement.", "MARKETS"],
			["Whoever posted it first has already sold.", "MARKETS"],
			["Funny how these always come out on a quiet news day."],
			["누구한테 이득인지 물어봐요.", "BUSINESS SECURITY CRIME TRANSIT"],
			["이거 어느 부서가 썼대?", "SECURITY TRANSIT"],
			["자기네 검토에서 자기네가 무혐의라네. 당연하지.", "BUSINESS CYBERNETICS INDUSTRY"],
		],
		worried: [
			["거기 사는 사람들은 누가 챙기고 있나요?", "SECURITY CRIME"],
			["내일 {D}【을를】 지나가야 해요.", "SECURITY CRIME TRANSIT"],
			["This keeps happening."],
			["다들 몸조심해요.", "SECURITY CRIME SOCIETY"],
			["Should I be worried about mine?", "CYBERNETICS"],
			["Half my savings are in Cipher.", "MARKETS"],
			["My wages are paid in Cipher. What are they worth today?", "MARKETS"],
			["사촌이 거기서 일해요. 아직 연락이 없어요.", "INDUSTRY CRIME"],
		],
		joker: [
			["Another day in paradise."],
			["At this point I'd watch it as a series."],
			["Somebody give the drones a raise.", "SECURITY"],
			["우리 집주인은 어떻게든 월세를 올릴 방법을 찾겠지.", "BUSINESS INDUSTRY"],
			["Walking is good for you, apparently.", "TRANSIT"],
			["껐다 켜 봤대?", "CYBERNETICS INDUSTRY TRANSIT"],
			["내가 초대받았나? 아니. 서운한가? 그것도 아니고.", "PEOPLE SOCIETY"],
			["Bought high, sold low. Living the dream.", "MARKETS"],
		],
		rumour: [
			["A friend says there's more to this."],
			["{O}【이가】 일주일 전에 알고 있었다던데요.", "BUSINESS INDUSTRY CRIME CYBERNETICS"],
			["{D} 사람들은 며칠째 이 얘기를 하고 있었어요.", "SECURITY CRIME TRANSIT INDUSTRY"],
			["Wait for the second story. There's always a second story."],
			["부두에 있는 누가 그러는데 화물 건이래요.", "CRIME TRANSIT"],
			["A friend at the exchange says there's a bigger order coming.", "MARKETS"],
		],
		worker: [
			["Somebody always has to clean up after these things.", "INDUSTRY"],
			["Will we get paid for the lost days?", "INDUSTRY"],
			["철마다 똑같은 얘기예요.", "INDUSTRY BUSINESS"],
			["Half my shift gets here by shuttle.", "TRANSIT"],
			["Contracts like this always end with fewer jobs.", "BUSINESS"],
			["We get paid in Cipher. Nobody asked us about any of this.", "MARKETS"],
		],
		night: [
			["The strip was packed anyway.", "SOCIETY"],
			["{D}【이가】 그렇게 붐비는 건 처음 봐요.", "SOCIETY PEOPLE"],
			["경비들이 밤새 날이 서 있었어요.", "SOCIETY CRIME"],
			["Best night out this month.", "SOCIETY"],
		],
		local: [["저는 {D}에 살아요. 한 주 내내 이상했어요."], ["오늘 아침에 지나갔어요."], ["우리 거리 사람들은 아무도 놀라지 않았어요.", "SECURITY CRIME"]],
	},

	/* What a resident of the district can actually see during each stage. Spun stages put the true picture here. */
	seen: {
		sweep: {
			active: e => (e.s === "drones" ? "새벽 다섯 시부터 우리 건물 위에 드론이 떠 있어요." : "오늘 아침 거리 양쪽 끝에 집행관들이 있었어요."),
			ends: e => (e.sp ? "벌써 모퉁이에 다시 나와 있어요. 한 시간쯤 걸렸네요." : "순찰이 사라졌어요. 아직은 조용해요."),
			exposed: "그럴 줄 알았어요.",
		},
		feud: {
			clash: "창문으로 싸움 소리가 들렸어요.",
			retaliation: "밤새 모퉁이에서 연기가 올라왔어요.",
			takeover: "오늘은 다른 사람들이 노점에서 돈을 걷고 있어요.",
		},
		transit: {
			out: e => (e.sp ? "정류장 화면이 꺼져 있어요. 오늘 여기 선 셔틀이 한 대도 없어요." : "다음 정류장까지 걸어갔어요. 20분 걸렸어요."),
			statement: e => (e.sp ? "아직도 꺼져 있어요. 헛되이 40분을 기다렸어요." : "아직도 닫혀 있어요."),
			conflicting: e => (e.sp ? "어젯밤에 또 승강장에 수레들이 있었어요." : "여기는 아직도 서는 게 없어요."),
		},
		industry: {
			incident: e => (e.sp && e.shut ? "문에 붙은 공지에 작업이 전부 취소됐다고 써 있어요." : e.shut ? "우리는 집에 보내졌어요." : ""),
			dispute: e => (e.s === "walkout" ? "초과근무 수당은 아직도 없어요. 아직도 밖에 있고요." : "접수한 건이 아무 설명 없이 종결됐어요."),
		},
		smuggle: {
			missing: "새벽 두 시에 배달원들이 상자를 옮기는 걸 봤어요.",
			statement: e => (e.sp ? "제가 본 수레들은 그 조직과는 아무 상관이 없었어요." : ""),
		},
		implant: { response: e => (e.sp ? "제 건 오늘 두 번 재시작됐어요." : "") },
		nightlife: { night: "줄이 우리 집 문 앞까지 이어졌어요." },
		crash: {
			runs: "오늘 아침 여섯 시부터 트러스트 앞에 줄이 서 있어요.",
			strain: "단골 바에 '사이퍼 불가'라는 팻말이 붙었어요.",
			services: "오늘은 교대가 없고, 언제 한다는 공지도 없어요.",
			scams: "정류장에서 어떤 남자가 복구 기금을 팔고 있었어요. 누가 운영하냐고 물었더니 가 버렸어요.",
			raids: "우리 블록 끝에 있는 식료품점이 어젯밤에 싹 털렸어요.",
			depressed: "우리 거리에서는 이제 아무도 사이퍼를 안 받아요.",
		},
	},

	commentIntent(rec, line) {
		if (rec.f === "business" && rec.s === "wages" && rec.ph === "outcome" && /agreement/i.test(line) && /statement/i.test(line) && /check/i.test(line))
			return "business|wages|result|settlement-check";
		const topic = /guest list|invit|attend|host/.test(line.toLowerCase())
			? "attendance"
			: /record|evidence|invoice|proof|finding|verif|review/i.test(line)
			? "evidence"
			: /pay|wage|deduction|refund/i.test(line)
			? "pay"
			: /guest|eligib|authoriz|permission|consent|trial/i.test(line)
			? "eligibility"
			: /queue|counter|opening|reopen|closed|stop|shuttle|boarding|service/i.test(line)
			? "availability"
			: /shift|work|hours/i.test(line)
			? "work"
			: "opinion";
		const end = setup.arcologyNews.families[rec.f]?.stages[rec.ph]?.out ? "result" : "developing";
		return [rec.f, rec.s, end, topic, line.includes("?") ? "ask" : "say"].join("|");
	},

	discussion(rec, candidates, st) {
		const N = setup.arcologyNews;
		const recent = st.arts.filter(a => a.id !== rec.id && a.at >= rec.at - N.KEEP * N.DAY).flatMap(a => a.rc ?? []);
		const out = this.write(rec, false);
		const range =
			rec.k === "notice"
				? [1, 4]
				: rec.k === "reminder"
				? [2, 5]
				: rec.k === "weekly"
				? [3, 8]
				: rec.k === "break" || out.tone === "investigation"
				? [6, 12]
				: rec.sev === 3
				? [5, 10]
				: [3, 7];
		const target = range[0] + Math.floor(N.seed(rec.id + "discussion") * (range[1] - range[0] + 1));
		const chosen = (rec.rc ?? []).filter(c => c[3] === undefined);
		// Every candidate is checked against weeks of earlier comments, so each text is split once and kept across articles.
		if ((this.wordCache?.size ?? 0) > 8192) this.wordCache = this.wordSets = null;
		const split = (this.wordCache ??= new Map());
		const words = text => {
			if (!split.has(text))
				split.set(
					text,
					text
						.toLowerCase()
						.replace(/don't/g, "do not")
						.replace(/[^a-z가-힣\s]/g, " ")
						.trim()
						.split(/\s+/)
				);
			return split.get(text);
		};
		const sets = (this.wordSets ??= new Map());
		const setOf = text => sets.get(text) ?? sets.set(text, new Set(words(text))).get(text);
		const redundant = (a, b) => {
			const left = words(a);
			const right = words(b);
			// The same statement explicitly negated is disagreement, not a redundant contribution.
			if (
				left.includes("not") !== right.includes("not") &&
				left.filter(w => !["not", "do"].includes(w)).join(" ") === right.filter(w => !["not", "do"].includes(w)).join(" ")
			)
				return false;
			if (N.similar(a, b)) return true;
			const x = setOf(a);
			const y = setOf(b);
			const common = [...x].filter(w => y.has(w)).length;
			return Math.min(x.size, y.size) >= 5 && common / (x.size + y.size - common) >= 0.78;
		};
		const stats = (this.discussionStats ??= { generated: 0, examined: 0, archive: 0, thread: 0, handle: 0, published: 0 });
		stats.generated += candidates.length;
		for (const candidate of candidates) {
			if (chosen.length >= target) break;
			/* Subjects such as "the opening night" land in templates that already say "the". */
			candidate[1] = candidate[1].replace(/\b(the) the\b/gi, "$1");
			stats.examined++;
			const intent = this.commentIntent(rec, candidate[1]);
			if (intent === "business|wages|result|settlement-check" && chosen.some(c => c[2] === intent)) {
				stats.thread++;
				continue;
			}
			if (chosen.some(c => c[0] === candidate[0])) {
				stats.handle++;
				continue;
			}
			if (chosen.some(c => redundant(c[1], candidate[1]))) {
				stats.thread++;
				continue;
			}
			if (recent.some(c => redundant(c[1], candidate[1]))) {
				stats.archive++;
				continue;
			}
			chosen.push([candidate[0], candidate[1], intent]);
			stats.published++;
		}
		return chosen;
	},

	/* Replies between residents: [line, categories or none for any]. Answers only use what the article or the
	   replier's own home district can show; without that, the replier says nobody knows. */
	threadLines: {
		unknown: [
			["Nobody's said. I'd check again tomorrow."],
			["Report doesn't say. I asked the same thing."],
			["No idea. Nothing's been posted."],
			["Haven't heard anything either."],
		],
		evidence: [
			["아직 발표된 게 없어요. 성명뿐이에요.", "SECURITY CRIME BUSINESS CYBERNETICS INDUSTRY TRANSIT MARKETS"],
			["They haven't released anything. I looked."],
		],
		thanks: [["Thanks."], ["Cheers, that helps."], ["Good to know."], ["Right. Thanks."]],
		shrug: [["Great. So nobody knows."], ["Figures."], ["Brilliant. Thanks anyway."]],
		/* Pushback, keyed by the kind of comment it answers. A third entry is a pattern the parent must match. */
		against: {
			loyal: [
				["They said that last time too.", "", /statement|announce|promis|explain|report|dealing|성명|발표|약속|설명|보도|대응/i],
				["제 할 일을 하는 것만 해도 달라진 모습이겠네요.", "SECURITY CRIME TRANSIT", /job|dealing|patrol|enforcement|arrest|일자리|대응|순찰|집행국|체포/i],
				["Wait for the second report before you thank anyone.", "", /thank|good to|glad|sensible|nice|고마|감사|다행|현명|좋네/i],
				["Easy to say when it's not your savings.", "MARKETS"],
				["이중 교대로 일해 보고 그런 말을 해 봐요.", "INDUSTRY BUSINESS", /let them|calm|steady|quiet|내버려|차분|침착|조용/i],
				["You've more faith in them than I do."],
				["That's what they want you to think."],
			],
			skeptic: [
				["아니면 그냥 자기 일을 하는 걸 수도 있잖아요.", "SECURITY CRIME TRANSIT"],
				["Not everything's a cover-up.", "", /statement|record|review|operation|official|registry|enforcement|evidence|check|explain|성명|기록|검토|작전|공식|등록소|집행국|증거|확인|설명/i],
				["You'd complain whatever they did.", "", /statement|record|review|operation|official|registry|enforcement|evidence|check|explain|성명|기록|검토|작전|공식|등록소|집행국|증거|확인|설명/i],
				["Prices go up and down. Calm down.", "MARKETS"],
				["Bit early to call it a scandal."],
				["Give it a day before you decide."],
			],
			joker: [
				["내 거리 얘기면 웃기지 않아요.", "SECURITY CRIME", /\bha\b|joke|laugh|at least|bet |guess I'll|my list|after rent|souvenir|free |하하|ㅋㅋ|농담|웃|적어도|내기|월세|기념품|공짜/i],
				[
					"다칠 수도 있는 일이에요. 농담하기엔 아직 일러요.",
					"SECURITY CRIME INDUSTRY TRANSIT BREAKING",
					/\bha\b|joke|laugh|at least|bet |guess I'll|my list|after rent|souvenir|free /i,
				],
				["Funny until it's you.", "", /\bha\b|joke|laugh|at least|bet |guess I'll|my list|after rent|souvenir|free |하하|ㅋㅋ|농담|웃|적어도|내기|월세|기념품|공짜/i],
			],
			worker: [
				["그래도 투덜댈 교대라도 있잖아요.", "INDUSTRY BUSINESS", /shift|wage|pay|work|hours|교대|임금|급여|월급|근무|시간/i],
				["Everyone's got it hard. Not just you.", "", /\b(I|my|we|our)\b.*(hard|tired|again|cut|late)|(저|제|우리|내).*(힘들|지쳤|또|깎|늦)/i],
			],
			worried: [
				["You worry too much.", "", /worr|scared|afraid|hope|careful|걱정|무서|두려|바라|조심/i],
				["It's one report. Breathe.", "", /worr|scared|afraid|panic|걱정|무서|두려|공황|패닉/i],
			],
			local: [["Living there doesn't make you right.", "", /\b(my|our) (street|block|floor|building)\b|(우리|제|내) (동네|거리|블록|층|건물)/i]],
		},
		back: {
			loyal: [["좋아요. 검토에서 뭐라고 하는지 보죠.", "SECURITY CRIME BUSINESS INDUSTRY CYBERNETICS TRANSIT MARKETS"], ["두고 보죠."]],
			skeptic: [["Name one time they told us everything."], ["Sure. And the next statement will be true as well."]],
			worker: [["Easy for you to say."], ["Come work a shift and say that."]],
			worried: [["I'll stop worrying when it stops happening."]],
			joker: [["Somebody has to laugh."], ["Lighten up."]],
			rumour: [["Believe what you want."], ["You'll see."]],
			local: [["I live here. You don't."]],
			night: [["Whatever you say."]],
		},
		help: [
			["며칠은 돌아서 가요. 저는 그렇게 하고 있어요.", "SECURITY CRIME", /route|go(?:ing)? through|walk|home|street|경로|지나|걸어|집|거리/i],
			["해 진 뒤에는 큰길로만 다니면 괜찮아요.", "SECURITY CRIME", /route|go(?:ing)? through|walk|home|street|after dark|night|경로|지나|걸어|집|거리|밤|어두워/i],
			["Don't sell in a panic. That's exactly when it costs you most.", "MARKETS", /savings|wages|sell|worth|저축|임금|급여|팔|가치/i],
			["Shuttles were running on the other line this morning.", "TRANSIT", /shuttle|stop|trip|route|travel|셔틀|정류장|운행|노선|경로|이동/i],
		],
		source: [["Source?"], ["Which friend?"], ["Your friend says a lot of things."]],
		same: [
			["우리 쪽도 마찬가지예요.", "INDUSTRY BUSINESS MARKETS"],
			["우리한테도 아무 얘기가 없었어요.", "INDUSTRY BUSINESS", /nothing|no notice|haven't|not told|no answer|아무것도|공지도 없|못 들었|안 알려|답이 없/i],
		],
		agree: [["Ha. Accurate."], ["Honestly."], ["This."], ["Not wrong."], ["Said it better than I would have."], ["Ha. Fair."]],
		nod: [
			["Fair point."],
			["Agreed."],
			["That's what I'm doing too.", "", /\bI'(ll|m)\b/],
			["Sensible. Half this thread hasn't read past the headline.", "", /check|wait|read|compare|확인|기다|읽|비교/i],
			["Wish more people thought like that."],
			["Exactly what I was going to say."],
			["Glad someone said it."],
			["Same thought here."],
			["Agree with every word of that."],
		],
		close: [["Agree to disagree."], ["Whatever you say."], ["Not worth arguing about."]],
		/* How an argument winds down after the first poster answers back: [replier's line, then optionally the first
		   poster's last word]. Each pair reads as one person answering the other. */
		windDown: [
			["좋아요. 내일이면 알겠죠.", "그러겠죠."],
			["Suit yourself.", ""],
			["여기서 그만할게요.", "그게 낫겠네요."],
			["그럼 우린 그냥 보는 눈이 다른 거네요.", "그런가 봐요."],
			["Not going to change your mind, am I?", "No."],
		],
		/* A third resident ending a long exchange, and the first poster conceding to that. */
		referee: [
			["두 분은 보고마다 이 논쟁을 하시네요.", "맞아요. 그만할게요."],
			["실제로 일어난 일만 가지고 얘기하면 안 될까요?", "그래요."],
			["Both of you, wait for the next report before deciding.", "Fine."],
		],
		welcome: [["No problem."], ["Any time."], ["Stay safe out there."], ["Glad it helped."]],
		/* Following up on a question nobody could answer yet. */
		follow: [["I'll post here if I hear anything."], ["Someone on my floor might know. I'll ask."], ["Watching this too."], ["Same question. Following."]],
	},

	/* Replies under the residents' comments, chosen once when the article is written: [handle, text, intent,
	   parent index, days after publication]. Most comments stand alone; one or two start a short conversation. */
	thread(rec, rc, st) {
		const N = setup.arcologyNews;
		if (rec.k === "weekly" || rc.length < 2) return [];
		const cat = this.write(rec, false).cat;
		const roll = N.seed(rec.id + "thread");
		/* Nearly every story gets talked about: two or three conversations, a notice at least one when it can. */
		const count = rec.k === "notice" ? (roll < 0.85 ? 1 : 0) : rc.length < 4 ? 2 : roll < 0.5 ? 2 : 3;
		if (!count) return [];
		const kindOf = h => this.people.find(p => p[0] === h)?.[1] ?? "";
		const fits = line => !line[1] || line[1].split(" ").includes(cat);
		let parentText = "";
		const recent = new Set(
			st.arts.filter(a => a.id !== rec.id && a.at >= rec.at - N.DAY).flatMap(a => (a.rc ?? []).filter(c => c[3] !== undefined).map(c => c[1]))
		);
		const used = new Set(rc.map(c => c[1]));
		const take = (key, list) => {
			const ok = list.filter(l => fits(l) && (!l[2] || l[2].test(parentText)) && !used.has(l[0]) && !recent.has(l[0]));
			if (!ok.length) return null;
			const line = ok[Math.floor(N.seed(rec.id + key) * ok.length)][0];
			used.add(line);
			return line;
		};
		const seenFn = this.seen[rec.f]?.[rec.ph];
		const seen = typeof seenFn === "function" ? seenFn(rec) : seenFn;
		const outcome = N.families[rec.f]?.stages[rec.ph]?.out;
		/* A reply to `parent` from someone with a reason to answer it, or null when nobody plausibly would. */
		const answer = (parent, n) => {
			const text = parent[1];
			parentText = text;
			const pk = kindOf(parent[0]);
			const others = this.people
				.filter(p => p[0] !== parent[0] && (p[1] !== "night" || ["SOCIETY", "PEOPLE"].includes(cat)))
				.sort((a, b) => N.seed(rec.id + n + a[0]) - N.seed(rec.id + n + b[0]));
			const pickBy = test => others.find(test);
			if (text.includes("?")) {
				if (rec.q && /how much|what (is|was|was it)|worth now|price now|current (price|rate)|price (at|when)|얼마|시세|가격|환율/i.test(text)) {
					const who = pickBy(p => ["worker", "local", "skeptic"].includes(p[1]));
					return who && [who[0], `이게 올라왔을 때는 ${setup.arcologyFx.gbp(rec.q[0])} 선이었어요.`, "fact"];
				}
				if (/when did|when was|since when|how long has|what time did|started|언제|몇 시|얼마나 됐|시작됐|시작했/i.test(text)) {
					const who = pickBy(p => p[2] && p[2] === rec.d) ?? pickBy(p => p[1] === "local");
					const t = new DateTime(rec.at);
					const clock = String(t.hour).padStart(2, "0") + ":" + String(t.minute).padStart(2, "0");
					return who && [who[0], `제가 본 첫 보도는 ${clock}에 올라왔어요. 그보다 이른 건 없었어요.`, "fact"];
				}
				/* Someone who lives there answers with what they saw. */
				const local = seen && rec.d && /\b(still|happening|going on|safe|open|closed|busy|running)\b|아직|지금도|무슨 일|안전|열려|열었|닫혔|닫았|붐비|운행/i.test(text) ? pickBy(p => p[2] === rec.d) : null;
				if (local && !used.has(seen)) {
					used.add(seen);
					return [local[0], seen, "fact"];
				}
				if (/record|evidence|proof|review|finding|statement|check/i.test(text) && !outcome) {
					const who = pickBy(p => p[1] === "skeptic");
					const line = who && take(n + "ev", this.threadLines.evidence);
					return line && [who[0], line, "unknown"];
				}
				const who = pickBy(p => ["local", "worried", "worker"].includes(p[1]));
				const line = who && take(n + "un", this.threadLines.unknown);
				return line && [who[0], line, "unknown"];
			}
			/* Hearsay gets asked for its source; "which friend" only when there is a friend to ask about. */
			if (pk === "rumour" && /a friend|heard|someone at|says there|saying this/i.test(text) && !/wait for|checked|source/i.test(text)) {
				const who = pickBy(p => p[1] === "skeptic");
				const line =
					who &&
					take(
						n + "src",
						this.threadLines.source.filter(l => l[0] === "Source?" || /a friend/i.test(text))
					);
				return line && [who[0], line, "against"];
			}
			/* Notice comments are handed out in rotation, not by personality, so only their questions get answers. */
			if (rec.k === "notice") return null;
			if (pk === "worried") {
				const who = pickBy(p => ["local", "loyal", "worker"].includes(p[1]));
				const line = who && take(n + "help", this.threadLines.help);
				return line && [who[0], line, "help"];
			}
			/* "Same at ours" only answers someone describing their own work or pay. */
			if (pk === "worker" && ["INDUSTRY", "BUSINESS", "MARKETS"].includes(cat) && /\b(we|our|my|us)\b/i.test(text)) {
				const who = pickBy(p => p[1] === "worker");
				const line = who && take(n + "same", this.threadLines.same);
				return line && [who[0], line, "agree"];
			}
			/* A long, careful comment gets a nod from someone who sees it the same way; a short opinion draws the opposite camp. */
			if (text.length > 70) {
				const who = pickBy(p => p[1] === pk || (p[1] === "loyal" && pk === "worried") || (p[1] === "local" && pk === "worker"));
				const line = who && take(n + "nod", this.threadLines.nod);
				return line && [who[0], line, "agree"];
			}
			const rival = /glad|good to|useful|helps|thanks/i.test(text)
				? null
				: { loyal: ["skeptic", "worker"], skeptic: ["loyal"], joker: ["worried"], worker: ["loyal"] }[pk];
			if (rival) {
				const who = pickBy(p => rival.includes(p[1]));
				const line = who && take(n + "vs", this.threadLines.against[pk]);
				if (line) return [who[0], line, "against"];
			}
			/* Only a joke or a jab gets a one-word agreement. */
			if (["joker", "skeptic"].includes(pk)) {
				const who = pickBy(p => p[1] === "joker");
				const line = who && take(n + "ag", this.threadLines.agree);
				if (line) return [who[0], line, "agree"];
			}
			/* Otherwise someone weighs in anyway: a nod from a like mind, or pushback from the opposite camp. */
			const camp = {
				loyal: ["skeptic", "worker"],
				skeptic: ["loyal", "worried"],
				worried: ["local", "loyal"],
				worker: ["loyal", "local"],
				local: ["worker", "skeptic"],
			}[pk];
			const vs = camp && this.threadLines.against[pk] && pickBy(p => camp.includes(p[1]));
			const push = vs && take(n + "fb", this.threadLines.against[pk]);
			if (push) return [vs[0], push, "against"];
			const ally = pickBy(p => p[1] !== "night");
			const nod = ally && take(n + "fn", this.threadLines.nod);
			return nod && [ally[0], nod, "agree"];
		};
		/* Questions first, then the rest, in a stable order. */
		const order = rc
			.map((c, i) => i)
			.sort((a, b) => (rc[b][1].includes("?") ? 1 : 0) - (rc[a][1].includes("?") ? 1 : 0) || N.seed(rec.id + "p" + a) - N.seed(rec.id + "p" + b));
		const out = [];
		let started = 0;
		for (const i of order) {
			if (started >= count) break;
			const r = answer(rc[i], "a" + i);
			if (!r) continue;
			started++;
			const late = N.seed(rec.id + "late" + i) < 0.35 ? 1 : 0;
			out.push([r[0], r[1], "reply|" + r[2], i, late]);
			const at = rc.length + out.length - 1;
			/* The first poster sometimes answers back: thanks for an answer, a reply in kind to an argument. */
			const turn = N.seed(rec.id + "turn" + i);
			let back = null;
			if (["fact", "help"].includes(r[2]) && turn < 0.5) back = take("t" + i, this.threadLines.thanks);
			else if (r[2] === "unknown" && turn < 0.4) back = take("s" + i, this.threadLines.shrug);
			else if (r[2] === "against" && turn < 0.6) back = take("b" + i, this.threadLines.back[kindOf(rc[i][0])] ?? this.threadLines.close);
			if (!back) continue;
			out.push([rc[i][0], back, "reply|back", at, late]);
			/* Longer chains: each post answers the one above it, up to six deep. A third resident may step in, and an
			   argument always ends on a closing line rather than in the middle. */
			const chain = [];
			const z = k => N.seed(rec.id + "ch" + i + k);
			const pickPair = (list, k) => {
				const ok = list.filter(l => !used.has(l[0]));
				const pair = ok.length ? ok[Math.floor(z(k) * ok.length)] : null;
				if (pair) used.add(pair[0]);
				return pair;
			};
			if (r[2] === "against") {
				/* Either a third resident steps in and the first poster concedes, or the two wind it down themselves. */
				const by = this.people.find(p => ![r[0], rc[i][0]].includes(p[0]) && p[1] !== "night" && N.seed(rec.id + "by" + i + p[0]) < 0.3);
				const pair = by && z(3) < 0.4 ? pickPair(this.threadLines.referee, 8) : pickPair(this.threadLines.windDown, 9);
				if (pair) {
					const third = by && this.threadLines.referee.some(l => l[0] === pair[0]);
					chain.push([third ? by[0] : r[0], pair[0], third ? "referee" : "wind"]);
					if (pair[1]) chain.push([rc[i][0], pair[1], "concede"]);
				}
			} else if (["fact", "help"].includes(r[2])) {
				if (z(5) < 0.7) chain.push([r[0], take("w" + i, this.threadLines.welcome), "welcome"]);
			} else if (r[2] === "unknown") {
				const other = this.people.find(p => ![r[0], rc[i][0]].includes(p[0]) && N.seed(rec.id + "fo" + i + p[0]) < 0.3);
				if (other && z(6) < 0.75) chain.push([other[0], take("fo" + i, this.threadLines.follow), "follow"]);
				if (other && z(7) < 0.5) chain.push([r[0], take("f2" + i, this.threadLines.follow), "follow"]);
			}
			let parent = at + 1;
			for (const [h, text, kind] of chain) {
				if (!text || h === out[parent - rc.length]?.[0]) continue;
				out.push([h, text, "reply|" + kind, parent, Math.max(late, N.seed(rec.id + "cl8" + parent) < 0.3 ? 1 : 0)]);
				parent = rc.length + out.length - 1;
			}
		}
		return out;
	},

	residents(rec, out) {
		const N = setup.arcologyNews;
		if (rec.k === "reminder") return [];
		if (rec.k === "weekly") {
			return (out.sections ?? []).flatMap((section, i) => {
				const fact = section.paragraphs.find(p => !p.startsWith("Last reported"));
				return fact
					? [
							[this.people[(i * 3) % this.people.length][0], `“${section.title}” 후속 소식이 제가 따라가고 있는 소식이에요. ${fact}`],
							[
								this.people[(i * 3 + 1) % this.people.length][0],
								`“${section.title}”에 대해서는 이 점검과 함께 원래 보도도 곁에 두겠어요. 공유할 때는 날짜가 중요하니까요.`,
							],
					  ]
					: [];
			});
		}
		if (rec.k === "notice") {
			const lines = {
				safety: [
					`밤에 길을 고르기 전에 ${out.place} 등급부터 확인할게요.`,
					`${out.place} 등급은 쓸모 있지만, 거리마다의 보장으로 받아들이지는 않겠어요.`,
					`상황이 달라지면 집행국이 ${out.place} 공지를 갱신할까요?`,
					`이 ${out.place} 공지는 발행 날짜와 함께 방문하는 사람에게 보내겠어요.`,
				],
				transit: [
					`“${out.body[0]}” 내일 이동 계획을 세우기 전에 필요했던 정보예요.`,
					"공용 노선은 제한 구역에 다니지 않아요. 타기 전에 알아 두는 게 낫겠어요.",
					"이동할 때 출발 표시판을 다시 확인할게요. 보관된 노선 공지는 낡았을 수 있으니까요.",
					"교통국이 이런 공지를 승차 표시판 옆에도 붙여 줄 수 있을까요? 저는 거기를 가장 먼저 보거든요.",
				],
				drift: [
					`“${out.body[0]}” 항로에 시간을 더 넉넉히 잡겠어요.`,
					"항로와 도시 안 이동을 구분해 줘서 좋네요. 섬이 움직인다고 셔틀 정류장이 닫히는 건 아니니까요.",
					"선착장 창구에 수정된 소요 시간이 있나요? 표류 거리만으로는 언제 도착해야 하는지 알 수 없어요.",
				],
				registry: [
					"기록 확인은 백업이 아니에요. 공지가 그걸 분명히 말해 줘서 다행이에요.",
					"공개 기록을 확인하는 데는 하루 한 번이면 충분해요. 이 글타래에 올리지는 않겠어요.",
					"방문객 화면에 백업 접근이 제한되는 이유가 설명돼 있나요?",
				],
				exchange: [
					"사이퍼를 살 때와 팔 때 드는 금액이 달라요. 두 번 바꾸기 전에 둘 다 확인하겠어요.",
					"보관된 본토 돈은 지갑 속 사이퍼가 아니에요. 그래도 창구는 거쳐야 해요.",
					"단말기 앞에 서 있는 동안 환율이 두 번 움직였어요. 그만큼 여유를 두고 예산을 짜겠어요.",
				],
			}[rec.f] ?? [
				`“${out.body[0]}” 전해 들은 제목 말고 실제 공지가 여기 있어서 유용해요.`,
				`“${out.title}”에 대해 거주자는 어디서 문의할 수 있나요?`,
			];
			return lines.map((line, i) => [this.people[(Math.floor(N.seed(rec.id) * this.people.length) + i) % this.people.length][0], line]);
		}
		/* Without a named organisation, lines that need one are dropped below rather than printed as "they". */
		const publicSubject = N.publicSubject(rec);
		const vals = { D: this.district(publicSubject.d), O: N.orgName(publicSubject.o) || "\u0000" };
		const subject = {
			sweep: { patrol: "도보 순찰", checkpoint: "임플란트 검문", drones: "카메라 드론" },
			idcheck: { copies: "복제된 신원", cloned: "복제된 칩", backups: "백업 기록" },
			feud: { corner: "거리 모퉁이", debt: "조직 간 빚", route: "수금 경로" },
			industry: { press: "프레스 정비", power: "전력 공급", shortage: "물자 납품 지연", walkout: "미지급 초과근무" },
			business: {
				wages: "임금 공제",
				leak: "공급업체 청구서",
				contract: "미지급 계약",
				expansion: "신규 채용",
				irregular: "장부 기록",
				recall: "회수된 부품",
				stake: "회사 소유권",
			},
			transit: { maintenance: "승강장 정비", inspection: "정류장 점검", interference: "정류장을 건너뛰는 셔틀" },
			implant: { malfunction: "임플란트 재시작", backup: "백업 접근", unlicensed: "미등록 부품", trial: "유료 시험", xchange: "스테이션 대기줄" },
			nightlife: { opening: "개장 첫날 밤", noise: "업소 소음", betting: "내기의 밤", raid: "업소 단속" },
			glasshouse: { gathering: "비공개 초대", absence: "주최자의 부재" },
			market: {
				accumulate: "사이퍼 매입",
				selloff: "비축분 매각",
				withdraw: "환전 호가 차이",
				scandal: "사라진 비축분",
				pump: "매입 주장",
				move: "사이퍼 시세",
			},
			crash: { liquidity: "사이퍼 붕괴", reserve: "사라진 비축분", counterfeit: "위조 사이퍼" },
			smuggle: { crates: "사라진 상자", parts: "사라진 부품", medical: "의료품 수송" },
		}[rec.f]?.[rec.s];
		const fill = s => s.replace(/\{(\w)\}/g, (m, k) => vals[k] ?? m);
		const fits = line => !line[1] || line[1].split(" ").includes(out.cat);
		const usedPeople = new Set();
		const recentByHandle = new Map();
		for (const earlier of N.state().arts.filter(x => x.at < rec.at && x.at > rec.at - 28 * N.DAY)) {
			for (const [handle, line] of earlier.rc ?? []) {
				if (!recentByHandle.has(handle)) recentByHandle.set(handle, new Set());
				recentByHandle.get(handle).add(line);
			}
		}
		/* Lines already used earlier in the same story are off limits, so follow-ups don't echo the first article. */
		const usedLines = new Set(
			rec.e
				? N.state()
						.arts.filter(x => x.e === rec.e && x.at < rec.at)
						.flatMap(x => (x.rc ?? []).map(c => c[1]))
				: []
		);
		const list = [];
		const seenFn = this.seen[rec.f]?.[rec.ph];
		const seen = typeof seenFn === "function" ? seenFn(rec) : seenFn;
		const local = this.people.filter(p => p[2] === publicSubject.d);
		if (seen && local.length) {
			const p = this.pick(rec, "local", local);
			usedPeople.add(p[0]);
			list.push([p[0], seen]);
		}
		const people = this.people.slice().sort((a, b) => N.seed(rec.id + a[0]) - N.seed(rec.id + b[0]));
		for (let i = 0; i < people.length; i++) {
			const p = people[i];
			if (usedPeople.has(p[0])) continue;
			const kind = p[1] === "local" && p[2] !== publicSubject.d ? "skeptic" : p[1];
			if (kind === "night" && !["nightlife", "glasshouse", "transit"].includes(rec.f)) continue;
			const contextual =
				{
					loyal: [
						[`I'd rather ${vals.O} explain the arrangements on ${vals.D} before people start guessing.`],
						[`Keeping the notices for ${vals.D} current would help the people following them.`],
					],
					skeptic: [
						[`Has anyone outside ${vals.O} checked the account of what happened on ${vals.D}?`],
						[`I want to see the records behind this report about ${vals.D}, not another statement.`],
					],
					worried: [
						[`My route home goes through ${vals.D}. I need to know what this changes for people passing through.`],
						[`Does the public desk on ${vals.D} have any advice for residents yet?`],
					],
					worker: [
						[`I work shifts near ${vals.D}. We need notices before we leave home, not after we arrive.`],
						[`I'd like ${vals.O} to explain what this means for the next shift.`],
					],
					night: [
						[`People leaving the venues on ${vals.D} will want to know about this before closing time.`],
						[`I usually meet friends on ${vals.D}. We're checking the notices before going tonight.`],
					],
					local: [
						[`I live near ${vals.D}. The report doesn't say what residents should do next.`],
						[`I'd check the street notices on ${vals.D} before making the trip.`],
					],
					joker: [[`I'll put "check ${vals.D} notices" on tomorrow's list. Again.`], [`Somewhere on ${vals.D}, someone is already printing the next notice.`]],
					rumour: [
						[`People keep passing around different versions of the ${vals.D} story. Which ones have actually been checked?`],
						[`I'd wait for a named source before sharing more about ${vals.O}.`],
					],
				}[kind] ?? [];
			let topic = subject
				? {
						loyal: [
							`사람들이 짐작하기 시작하기 전에 ${vals.O}【이가】 ${subject} 조치를 설명해 줬으면 해요.`,
							`가기 전에 ${subject} 관련 게시된 안내부터 확인할게요.`,
						],
						skeptic: [`이게 올라오기 전에 ${subject} 기록은 누가 확인했나요?`, `성명만이 아니라 ${subject} 기록을 보고 싶어요.`],
						worried: [
							`${vals.D}에 ${subject} 질문을 받는 공개 창구가 있나요?`,
							`이 ${subject} 보도가 내일 이동에 어떤 영향을 주는지 살피는 중이에요.`,
						],
						worker: [
							`${vals.O}【은는】 교대 근무자에게 ${subject} 관련 서면 공지를 줄까요?`,
							`${vals.D} 근처에서 일하는 사람들은 다음 교대 전에 ${subject} 관련 답을 들어야 해요.`,
						],
						night: [
							`${vals.D}에서 누굴 만나기 전에 ${subject} 최신 소식부터 확인할게요.`,
							`업소에서 나오는 사람들도 ${subject} 소식을 들어야 해요.`,
						],
						local: [
							`${vals.D}에 있는 우리 건물 근처 공지로는 ${subject}에 대한 제 의문이 풀리지 않아요.`,
							`${vals.D} 근처에 살아요. 거주자는 ${subject}에 대해 어디에 물어봐야 하나요?`,
						],
						joker: [
							`${vals.D}의 셔틀 줄에서 나눌 ${subject} 얘깃거리가 또 하나 생겼네요.`,
							`${subject}도 월세 낸 뒤에 걱정할 목록에 추가해야겠어요.`,
						],
						rumour: [
							`${subject} 얘기를 세 가지 버전으로 들었어요. 확인된 걸 기다리는 편이 낫겠어요.`,
							`${subject} 주장에 이름이 밝혀진 출처가 있나요?`,
						],
				  }[kind]
				: null;
			if (rec.f === "glasshouse")
				topic = {
					loyal: ["비공개 파티잖아요. 누구를 초대하든 그쪽 마음이에요.", "주최자가 남들에게 손님 명단을 공개하길 기대하진 않아요."],
					skeptic: ["기사에는 아무도 이름을 확인해 주지 않았다고 하는데, 왜 다들 명단을 돌리고 있죠?", "선착장에 배가 한 척 닿았다고 누가 탔는지 알 수는 없어요."],
					worried: [
						"사람들이 직원들한테 이름을 캐묻지 말고 그냥 내버려 두길 바라요.",
						"이런 공개 글타래에서 제 이름이 짐작당하는 건 싫어요.",
					],
					worker: [
						"다들 떠난 뒤에 누군가는 식탁을 치워야 해요. 제가 물어보고 싶은 건 그 교대예요.",
						"손님들은 보도에 오르고, 뒷정리하는 사람들은 이른 출근을 얻죠.",
					],
					night: [
						"안에서 뭘 틀었는지 알고 싶어요. 음악은 아무도 보도하지 않으니까요.",
						"저기 누가 초대받아 올라갔는지 몰라도 밤 외출은 즐길 수 있어요.",
					],
					local: ["저는 릴레이 가에 살아요. 도착하는 사람들은 보지만 손님 명단은 못 봐요.", "거리에서는 누가 글래스하우스 안에 있는지 알 수 없어요."],
					joker: ["제 초대장은 아직 우편 배달 중인가 봐요.", "음식 마무리할 사람이 필요하면 저 시간 돼요."],
					rumour: [
						"제가 본 손님 명단은 버전마다 이름이 달라요. 출처가 있는 건 하나도 없고요.",
						"꼭 친구가 초대받았다는 사람이 나오는데, 그 친구가 나타나길 아직도 기다리는 중이에요.",
					],
				}[kind];
			if (rec.f === "business" && rec.s === "expansion")
				topic = {
					loyal: [
						"영업시간이 발표되지 않았어요. 퇴근하고 가기 전에 다시 확인해 볼게요.",
						"추가 공간에 고객 창구가 들어갔으면 하지만, 발표에는 그런 약속이 없네요.",
					],
					skeptic: [
						"일자리가 몇 개고 근무 시간은 어떻게 되나요? 더 넓은 매장이 둘 중 어느 쪽에도 답을 주지 않아요.",
						"채용 붐이라고 부르기 전에 빈 일자리부터 보고 싶어요.",
					],
					worried: [
						"새 자리는 정해진 근무 시간을 줄까요? 교대가 또 한 주 취소되는 건 감당 못 해요.",
						"기존 직원들이 이걸 위해 근무 시간을 뺏기는 게 아니길 바라요.",
					],
					worker: [
						"자리가 몇 개인지는 말하지 않았어요. 실제 채용 공고를 기다릴게요.",
						"발표에 채용 얘기는 나오지만, 지원하려면 보수와 교대를 알아야 해요.",
					],
					night: ["늦게까지 열면 퇴근 후에 드디어 갈 수 있을지도요.", "층이 하나 더 느는 것보다 문 닫는 시간이 늦어지는 쪽이 저한테는 더 나아요."],
					local: [`${vals.D}의 출입구는 지금 자리에 그대로 있을까요?`, "보도를 더 차지하지 말고 줄 설 자리를 남겨 두었으면 해요."],
					joker: ["더 넓어진 매장. 줄은 그대로인데 이제 기지개 켤 공간은 생겼네요.", "대기 공간에 의자 하나만 놔 주세요. 그게 제 확장안이에요."],
					rumour: [
						"어딘가에 채용 공지가 있나요, 아니면 다들 이 기사만 돌려 보는 건가요?",
						"제 정보를 보내기 전에 실제 구인 광고부터 확인하겠어요.",
					],
				}[kind];
			if (rec.f === "business" && rec.s === "expansion" && rec.ph === "withdrawn")
				topic =
					kind === "worker"
						? [
								"지원한 사람들 모두에게 채용이 중단됐다고 알려 주길 바라요.",
								"면접 때문에 교대를 또 포기하기 전에 서면 확인을 받고 싶어요.",
						  ]
						: [
								"계획이 취소됐어요. 새 발표가 나올 때까지는 기존 창구를 계속 쓸게요.",
								"적어도 이번 소식은 개장이 없다고 알려 주네요. 옛 채용 공지는 이제 오해를 부를 거예요.",
						  ];
			if (rec.f === "implant" && rec.s === "trial")
				topic = {
					loyal: [
						"모집 공고를 예약 확정으로 받아들이기 전에 클리닉 약관부터 확인하겠어요.",
						"방문객 계정이 모든 시술을 허가하지는 않는다는 점을 분명히 해 줘서 좋아요.",
					],
					skeptic: [
						"부품 이름을 밝히지 않았어요. 서명하기 전에 그 정보가 필요해요.",
						"동의서도 중요하지만 무엇을 시험하는지에 대한 설명도 여전히 듣고 싶어요.",
					],
					worried: [
						"보도에는 누가 지원 자격이 되는지 나와 있지 않아요. 저를 받아 줄 거라 믿고 찾아가지는 않겠어요.",
						"보수가 그럴 가치가 있는지 정하려면 가능한 부작용부터 알아야 해요.",
					],
					worker: [
						"다음 교대에 영향을 줄 수 있는지 모르는 채로 시험에 동의할 순 없어요.",
						"이 일로 휴가를 내기 전에 조건을 서면으로 받아 달라고 하겠어요.",
					],
					night: ["시험 얘기를 읽는다고 해서 자원하게 되는 건 아니죠.", "광고만 보고 결정하느니 클리닉의 전체 설명을 기다릴래요."],
					local: [
						"모집 광고만으로는 제 계정으로 뭘 예약할 수 있는지 알 수 없어요.",
						"클리닉 근처에 살아요. 그래도 가기 전에 실제 서비스 공지부터 읽겠어요.",
					],
					joker: [
						"그 부품의 시험 결과물이 되기로 하기 전에 부품이 뭔지부터 알고 싶어요.",
						"보수는 이해하기 쉬운 부분이에요. 조건에도 그만큼 지면을 할애해야죠.",
					],
					rumour: [
						"전달받은 광고가 방문객 자격의 확인은 아니에요.",
						"시험에 대한 추측을 퍼 나르기보다 공개된 조건을 기다릴게요.",
					],
				}[kind];
			if (rec.f === "implant" && rec.s === "trial" && rec.ph === "fixed")
				topic =
					kind === "worker"
						? [
								"휴가를 내기 전에 모집 날짜부터 확인하겠어요. 이번 차수는 마감됐어요.",
								"다음 차수를 위해 휴가를 낼 생각이 들기 전에 이번 차수 결과부터 보고 싶어요.",
						  ]
						: [
								"클리닉이 자원자 모집을 중단했어요. 옛 광고를 공유하는 사람들은 이 소식도 함께 올려야 해요.",
								"앞으로 모집 공지를 생각해 보기 전에 결과부터 읽고 싶어요.",
						  ];
			if (rec.f === "business" && rec.s === "leak" && ["audit", "outcome", "unresolved"].includes(rec.ph))
				topic =
					rec.ph === "outcome"
						? [
								"납품 기록으로 이 청구서들의 가격 차이가 설명되네요. 첫 성명보다 훨씬 쓸모 있어요.",
								"결론은 검토한 문서에 한정돼요. 모든 구매에 대한 주장이 아니라 그렇게 읽겠어요.",
						  ]
						: rec.ph === "audit"
						? [
								"등록소가 청구서를 납품 내역과 대조하고 있어요. 그 결과가 나올 때까지는 누가 맞다고 말하지 않을래요.",
								"문서 진위 확인이 중요해요. 유출된 총액만으로는 구매를 설명할 수 없어요.",
						  ]
						: [
								"검토로는 분쟁이 정리되지 않았어요. 누구 설명이 옳은지 여전히 몰라요.",
								"이야기를 그냥 덮어 버리지 말고 어떤 문서가 진위 확인이 안 됐는지 설명해 주길 바라요.",
						  ];
			if (rec.f === "transit" && rec.ph === "exposed")
				topic =
					kind === "loyal"
						? ["At least Transit has now explained why the freight carts were there. I still need to know when the shuttles return."]
						: kind === "worker"
						? ["The explanation matters, but I can't get to a shift on an admission. I'll check the boarding screen."]
						: [
								"앞선 공지에서는 정류장이 열려 있다고 했어요. 화물 인정으로 사람들이 다른 광경을 본 이유가 설명되네요.",
								"화물에 자리를 내주는 건 하나의 결정이에요. 누가 허가했는지 알고 싶어요.",
						  ];
			if (rec.f === "business" && rec.s === "wages")
				topic =
					rec.ph === "outcome"
						? [
								"공제액을 환불하기로 한 합의는 쓸모 있어요. 돈을 돌려받았다고 하기 전에 다음 명세서를 확인하겠어요.",
								"직원들이 합의를 봐서 다행이에요. 항목별 명세서로 확인하기 쉬웠으면 좋겠어요.",
						  ]
						: [
								"공제는 이미 번 돈에 영향을 줘요. 고용 조건뿐 아니라 항목별 계산서도 보고 싶어요.",
								"공제를 두고 다투는 동안에도 일은 계속되고 있어요. 그렇다고 직원들이 받아들였다는 뜻은 아니에요.",
						  ];
			if (rec.f === "industry" && rec.ph === "report")
				topic =
					kind === "loyal"
						? ["The inspectors have published what went wrong. I hope the company deals with the warnings this time."]
						: [
								"회사가 벌금을 물었지만, 저는 다음 교대가 예정대로 열리는지 여전히 알아야 해요.",
								"직원들은 경고가 묵살됐다고 하고, 회사는 기계가 점검을 통과했다고 해요. 왜 두 얘기가 맞지 않는지 알고 싶어요.",
						  ];
			const practical = {
				industry: {
					press: "프레스 점검이 설명되기 전에는 교체만으로 안전 문제가 해결되었다고 보면 안 돼요.",
					power: "전력 복구와 원인 규명은 별개의 일이에요. 고장 조사가 후속 보도됐으면 해요.",
					shortage: "자재가 아직 도착하지 않았어요. 일하러 가기 전에 다시 확인할게요.",
					walkout: "분쟁은 이미 한 초과근무에 대한 것이에요. 지급 합의는 다음 급여 명세서와 대조해 봐야 해요.",
				},
				implant: {
					malfunction: "모든 임플란트가 같은 재시작 문제를 겪는다고 생각하기 전에 공지가 어떤 부품을 다루는지부터 물어보겠어요.",
					backup: "보호해야 할 비공개 기록을 공개하지 않으면서 접근 검토를 설명해 줬으면 해요.",
					unlicensed: "거리에서 단 부품을 점검해 주겠다는 제안으로는 그 부품이 안전한지 알 수 없어요. 그건 클리닉에 물어볼 거예요.",
					xchange: "창구 직원이 늘면 줄에 도움이 되겠죠. 한 제품 한도가 바뀐다는 뜻으로 읽지는 않겠어요.",
				},
				business: {
					contract: "편을 정하기 전에 계약이 어떤 일을 요구했고 무엇이 납품됐는지부터 알고 싶어요.",
					irregular: "회사가 장부를 바로잡았는지, 고객이 정말로 돈을 돌려받았는지 알고 싶어요.",
					recall: "거리 상인에게 대체품 값을 내기 전에 창구에서 해당 묶음부터 확인하겠어요.",
					stake: "등록된 지분은 소유 관계를 알려 줄 뿐이에요. 고객 약관이 바뀌었다고 여기기 전에 실제 서비스 공지를 기다리겠어요.",
				},
				transit: {
					maintenance: "정비 예상을 도착 확정으로 여기지 않고 현재 승차 표시판을 보겠어요.",
					inspection: "승강장 점검에는 결과가 필요해요. 재개 공지에 무엇을 점검했는지 설명이 들어갔으면 해요.",
					interference: "교통국은 한 가지를 말하는데 승객들은 정류장에서 다른 광경을 봐요. 이유를 알고 싶어요.",
				},
				sweep: {
					patrol: "순찰 검토에 집행국이 발표한 체포 건뿐 아니라 거주자의 불만도 들어갔으면 해요.",
					checkpoint: "검문은 지나가는 모든 사람에게 영향을 줘요. 집행국이 왜 어떤 사람들은 또 붙잡는지 설명해 줬으면 해요.",
					drones: "드론 감시는 눈에 보여요. 여기서 보도된 사건을 막아 주는지는 후속 보도로 따라갔으면 해요.",
				},
				idcheck: {
					copies: "복제된 기록을 찾았다고 그걸 쓴 사람이 다 드러나는 건 아니에요. 출처에 대한 증거를 기다리겠어요.",
					cloned: "댓글에 누구의 신원 기록도 돌리지 않으면서 스캐너 점검이 설명됐으면 해요.",
					backups: "접근 문제는 중요하지만 노출된 기록을 다시 올리면 상황만 더 나빠져요. 계정 주인 이름은 밝히지 말고 유출을 신고하세요.",
				},
				feud: {
					corner: "노점을 이용하는 사람들은 여전히 그 모퉁이를 지나야 해요. 어느 조직이 차지하든 싸움이 멈추는지가 중요해요.",
					debt: "조직끼리의 빚이 지나가는 모두에게 위험이 되어서는 안 돼요. 다음 보도가 거리 상황을 확인해 줬으면 해요.",
					route: "수금 경로의 장악은 상인들에게 중요해요. 장악했다는 주장만으로는 지나가도 안전한지 알 수 없어요.",
				},
				smuggle: {
					crates: "누굴 탓한다고 상자가 돌아오진 않아요. 실제로 무엇을 되찾았는지 알고 싶어요.",
					parts: "조사관이 사라진 부품을 찾더라도 누가 가져갔는지는 여전히 밝혀야 해요.",
					medical: "사라진 클리닉 물품이 현실적인 걱정거리예요. 한 번의 수송으로 전반적인 부족을 짐작하지는 않겠어요.",
				},
				nightlife: {
					opening: "개장 발표를 입장 보장으로 여기기 전에 실제 출입 방식부터 확인하겠어요.",
					noise: "업소 옆에 사는 사람들에게는 소음 민원을 낼 방법이 필요해요. 손님들에 대한 추측으로 흘러서는 안 되고요.",
					betting: "누가 싸움에서 이겼는지, 거기에 돈을 건 사람들이 왜 그 뒤에 싸우기 시작했는지 알고 싶어요.",
					raid: "문 앞에서 모두의 임플란트를 검사한다고 해서 모든 손님이 규칙을 어긴 건 아니에요.",
				},
			}[rec.f]?.[rec.s];
			if (practical && !(rec.f === "transit" && rec.ph === "exposed") && !(rec.f === "industry" && rec.ph === "report")) {
				topic = [...(topic ?? []), ...(kind === "skeptic" || kind === "local" ? [practical] : [])];
			}
			const lines = (topic ? topic.map(t => [t]) : [...this.voices[kind].filter(l => l[1]), ...contextual]).filter(
				l => fits(l) && !usedLines.has(fill(l[0])) && !recentByHandle.get(p[0])?.has(fill(l[0]))
			);
			if (!lines.length) continue;
			usedPeople.add(p[0]);
			const offset = (Math.floor(rec.at / N.DAY) + Math.floor(N.seed(p[0]) * 1000) + i) % lines.length;
			for (let j = 0; j < lines.length; j++) list.push([p[0], fill(lines[(offset + j) % lines.length][0])]);
		}
		/* Match follow-up perspectives to what changed, rather than recycling the opening incident's questions. */
		const development =
			{
				business: {
					mediation: [
						["worker", `${subject}의 영향을 받는 사람들이 협의에서 나중에 통보만 받는 게 아니라 대표로 참여했으면 해요.`],
						["skeptic", `${subject} 중재는 과정이지 합의된 결과가 아니에요. 조건이 나올 때까지 기다리겠어요.`],
						["worried", `${subject} 협의에 대한 다음 공개 소식이 언제 나오는지 아는 분 있나요?`],
						["loyal", `${subject}【을를】 두고 당사자들이 얘기하게 된 건 성명을 또 주고받는 것보다 나아요.`],
					],
					audit: [
						["skeptic", "감사는 문서를 실제 납품된 것과 대조해야 해요. 글타래에 복사한 총액만으로는 부족해요."],
						["worker", "납품 기록을 관리한 사람들이 검토자들에게 설명할 시간을 얻었으면 해요."],
						["worried", "유출된 청구서에 누군가의 이름이 나온다고 해서 그 사람이 여기서 표적이 되어서는 안 돼요."],
						["loyal", "유출이 전체 내용이라고 여기기 전에 검토자들이 기록의 진위를 확인하게 두겠어요."],
					],
					outcome: [
						["worker", `${subject} 결과를 원래의 불만과 견주어 읽고서 아직 갚아야 할 게 무엇인지 따져 보겠어요.`],
						["skeptic", `${subject}에 대한 결과는 조사한 사안에만 해당돼요. 모든 거래에 대한 판단은 아니에요.`],
						["worried", `${subject}의 직접 영향을 받는 사람들이 전달받은 제목이 아니라 조건을 서면으로 받았으면 해요.`],
						["loyal", `${subject}에 결과가 나와서 유용해요. 앞선 보도에 이 링크를 달아야 해요.`],
					],
					unresolved: [
						["worker", `${subject}에 합의가 없어도 일하는 사람들은 계획을 세워야 해요.`],
						["skeptic", `${subject} 건이 해결되지 않았다고 해서 어느 쪽 주장이든 전부 옳았다는 뜻은 아니에요.`],
						["worried", `${subject}의 영향을 받는 사람들이 추가 문의할 연락처가 있었으면 해요.`],
						["loyal", `당사자들이 논의로 돌아올 경우를 대비해 ${subject} 문서를 계속 열어 두겠어요.`],
					],
					withdrawn: [
						["worker", `${subject} 발표를 믿고 계획을 세운 사람들에게는 이 철회 소식이 직접 전달돼야 해요.`],
						["skeptic", `${subject} 계획이 철회됐다고 해서 그 결정에 이른 모든 과정이 설명되는 건 아니에요.`],
						["worried", `옛 ${subject} 공지만 믿고 기존에 하던 걸 그만두는 사람이 없길 바라요.`],
						["loyal", `적어도 이제 철회됐으니 ${subject} 제안에 기대는 사람은 없겠죠.`],
					],
					exposed: [
						["skeptic", `${subject}에 대해 정정된 설명은 원래 성명과 같은 비중으로 다뤄야 해요.`],
						["worker", `처음 ${subject} 공지대로 움직인 사람들은 변경에 대한 직접적인 설명을 들을 자격이 있어요.`],
						["worried", `${subject}【을를】 얘기할 때는 두 날짜를 다 남겨 두겠어요. 옛 캡처가 계속 돌아다닐 테니까요.`],
						["loyal", `부정확했던 ${subject} 설명을 인정해야 사람들에게 다음 설명을 믿어 달라고 할 수 있어요.`],
					],
				},
				sweep: {
					announce: [
						["loyal", `${subject} 작전이 보고에 나온 문제를 해결했으면 해요.`],
						["worker", `가게 직원들이 아침 교대에 오기 전에 ${subject} 지침을 볼 수 있었으면 해요.`],
						["worried", `추가 ${subject} 활동이 언제 끝나는지 거주자들이 알 수 있나요?`],
						["skeptic", `${subject} 작전은 발표 규모가 아니라 거주자에게 무엇이 달라지는지로 판단하겠어요.`],
					],
					active: [
						["loyal", `${subject}【이가】 진행 중인 건 시작일 뿐이에요. 사람들이 문제를 신고할 방법은 여전히 필요해요.`],
						["worker", `${subject} 작전은 평범한 배달과 출근하는 사람들이 지나갈 여지를 남겨야 해요.`],
						["worried", `${subject} 구역을 지나기 전에 현재 지침부터 확인하겠어요.`],
						["skeptic", `눈에 보이는 ${subject} 활동 자체는 성과가 아니에요. 나중의 검토가 무엇을 이뤘는지 말해 줬으면 해요.`],
					],
					arrests: [
						["loyal", "체포가 거주자들이 신고한 사건을 막는 데 도움이 되길 바라요."],
						["skeptic", "체포는 유죄 판결이 아니에요. 각자 무슨 혐의인지 증거를 기다리겠어요."],
						["worried", "이 글타래에서 구금된 사람들의 이름을 추측하지 말아 주세요."],
						["worker", "가게 직원들은 이번 체포 뒤에도 추가 검문이 계속되는지 알아야 해요."],
					],
					complaint: [
						["skeptic", "거주자들의 불만은 공식 결과와 함께 검토에 들어가야 해요."],
						["worker", "출근하려면 작전 구역을 지나야 하는 사람들은 그것이 자신에게 어떤 영향을 주는지 신고할 수 있어야 해요."],
						["worried", "여기 있는 모두에게 신원을 공개하지 않고 불만을 제출할 수 있나요?"],
						["loyal", "불만은 확인되어야 해요. 집행국을 옹호한다고 해서 그 얘기를 안 들어서는 안 돼요."],
					],
					review: [
						["skeptic", "사람들이 비교할 수 있도록 검토 결과를 거주자들의 원래 불만 곁에 두고 싶어요."],
						["loyal", "작전 검토는 중요해요. 다음 작전을 짤 때 그 결과를 활용했으면 해요."],
						["worried", "우려를 제기한 사람들이 직접 답을 받았으면 해요."],
						["worker", "작업자들에게 실질적인 질문은 이번 검토 뒤에 지침이 바뀌는지예요."],
					],
					ends: [
						["loyal", `추가 ${subject} 작전에 종료 공지가 있어서 다행이에요. 상황이 바뀔 때는 분명한 지침이 필요해요.`],
						["skeptic", `${subject} 작전의 결과를 영구적인 것으로 받아들이지 말고 나중에 다시 점검했으면 해요.`],
						["worker", `영향받는 거리를 이용하는 직원들에게는 원래 ${subject} 경고뿐 아니라 종료 공지도 필요해요.`],
						["worried", `${subject}【이가】 끝났다고 안전이 약속된 것은 아니니 그래도 상황은 직접 확인하겠어요.`],
					],
					exposed: [
						["skeptic", "새 관찰 내용은 앞선 안심 발표를 뒷받침하지 않아요. 정정에서 그 점을 분명히 말해야 해요."],
						["worried", "구역이 안전하다는 발표를 믿은 사람들은 이 소식을 봐야 해요."],
						["loyal", "집행을 지지하지만, 그렇다고 나중의 보도가 뒤집은 결과를 옹호한다는 뜻은 아니에요."],
						["worker", "상인들에게는 첫 발표보다 덜 듣기 좋더라도 현재 상황에 대한 정확한 설명이 필요해요."],
					],
				},
				industry: {
					exposed: [
						["worker", "취소된 교대는 정상 운영이 아니에요. 처음 회사 공지를 본 사람은 누구나 이 정정이 필요해요."],
						["skeptic", "작업이 계속되고 있다는 성명은 누가 승인했나요? 작업자들이 고용주를 공개적으로 바로잡아야 하는 상황이면 안 돼요."],
						["worried", "취소된 교대 때문에 이동한 사람들이 허비한 시간에 대한 답을 듣길 바라요."],
						["loyal", "운영사는 아직 이걸 바로잡을 수 있지만, 폐쇄를 분명히 인정해야 해요."],
					],
					dispute: [
						["worker", `${subject}에 대한 작업자들의 설명은 원래 공지와 함께 보관해야 해요. 운영사의 해명을 읽는 방식이 달라지니까요.`],
						["skeptic", `누가 더 자신 있게 들리는지가 아니라 ${subject}에 대한 날짜가 찍힌 불만과 취해진 조치를 비교해 보겠어요.`],
						["worried", `${subject}에 대해 우려를 제기하는 사람들은 교대를 잃을 위험 없이 그럴 수 있어야 해요.`],
						["loyal", `${subject}에 대한 경영진의 답변이 도움이 될 거예요. 침묵하면 직원들이 모든 걸 스스로 설명해야 해요.`],
					],
					inspection: [
						["worker", `조사관들이 도착했을 때 마침 있던 사람만이 아니라 매 교대에 ${subject}【을를】 다루는 사람들에게도 묻기를 바라요.`],
						["skeptic", `${subject}에 대한 조사에는 발표된 결과가 필요해요. 호위가 도착한 것이 결과는 아니에요.`],
						["worried", "작업자들은 공개 글타래에 이름을 올리지 않고 정보를 제출하는 방법을 안내받게 될까요?"],
						["loyal", `조사관들이 ${subject}【을를】 점검하는 건 유익한 단계예요. 기록을 살펴볼 시간을 주겠어요.`],
					],
					repair: [
						["worker", `${subject}에 대한 조치와 교대 복귀 허가를 다음 작업 공지에서 구분해 줬으면 해요.`],
						["skeptic", `${subject} 작업은 진전이에요. 그래도 다음 주에 또 이 자리로 돌아오지 않도록 원인이 해결되길 바라요.`],
						["worried", `운영사에 ${subject} 작업 완료 예상 시점이 있나요? 시작을 끝으로 여기지는 않겠어요.`],
						["loyal", `정상 운영을 너무 일찍 알리라는 압박보다는 ${subject}에 대한 신중한 대응을 보고 싶어요.`],
					],
					reopen: [
						["worker", `${vals.O}【이가】 운영을 재개했다고 하니 제 교대 공지를 직접 확인해 볼게요. 재개한다고 모두의 근무표가 정리되는 건 아니에요.`],
						["skeptic", `${vals.O}의 정상 생산이 앞선 ${subject} 문제에 대한 모든 의문에 답해 주지는 않아요.`],
						["worried", `${subject}의 영향을 받은 직원들이 복귀 공지뿐 아니라 설명도 들었으면 해요.`],
						["loyal", `${vals.O}【이가】 다시 가동되어 다행이에요. 중단 공지를 퍼 나르는 사람들은 이 소식도 함께 올려야 해요.`],
						["rumour", `${subject} 관련 메시지의 날짜를 확인하고 있어요. 아직도 아무것도 안 바뀐 것처럼 첫 보도를 공유하는 사람들이 있어요.`],
					],
				},
				transit: {
					out: [
						["worker", "운휴 공지는 출근 전에 사람들에게 닿아야 해요. 교대에 늦으면 우리는 손해예요."],
						["worried", "다른 정류장까지 걸어갈 수는 있겠지만 그 사이 거리를 지날 시간을 잡아야 해요."],
						["loyal", "민원을 피하려고 열어 두기보다 제대로 점검하려고 정류장을 운행 중단하는 쪽이 낫다고 생각해요."],
						["skeptic", "정류장이 폐쇄된 이유를 나중의 재개 공지 곁에 남겨 뒀으면 해요."],
					],
					statement: [
						["worker", "'재개 예정'은 승차 시각이 아니에요. 다음 교대는 현재 표시판에 맞춰 짜겠어요."],
						["worried", "재개 시각을 못 알려 주더라도 교통국이 다음 소식 시각은 정해 줄 수 있을까요?"],
						["loyal", "예상은 도움이 돼요. 셔틀이 선다는 확인과 구별할 수 있다면요."],
						["skeptic", "그 정류장을 쓰라고 남에게 말하기 전에 실제로 도착하는 걸 기다리겠어요."],
					],
					conflicting: [
						["skeptic", "공지와 관찰은 같은 시각을 기준으로 맞춰 봐야 해요. 안 그러면 다들 딴소리를 해요."],
						["worker", "일하러 못 간 승객들에게는 같은 공지를 되풀이하지 말고 교통국이 어긋남에 답해야 해요."],
						["worried", "엇갈리는 설명이 해명되기 전에는 아무도 거기에 기다리러 보내지 않겠어요."],
						["loyal", "교통국은 운행 주장을 무엇에 근거했는지 보여 줘야 해요. 또 다른 장담보다 훨씬 유용할 거예요."],
					],
					suspect: [
						["skeptic", "의심되는 우회에는 누가 승인했는지에 대한 증거가 필요해요. 제목만 보고 운전사를 탓하진 않겠어요."],
						["worker", "자리가 화물에 간다면 승객들은 자기 출퇴근이 어떻게 되는지 들어야 해요."],
						["worried", "조사가 계속되는 동안 승차 방법을 계속 확인하겠어요."],
						["loyal", "운영사가 검토에 협조하고 분명한 운행 공지를 하나로 내놓았으면 해요."],
					],
					reopen: [
						["worker", "이 정류장이 돌아왔으니 더 짧은 출근길을 다시 짤 수 있겠어요. 그래도 나서기 전에 표시판은 확인할게요."],
						["loyal", "승차가 복구돼서 다행이에요. 폐쇄 공지도 교체해 주세요."],
						["skeptic", "운행 재개는 오늘의 이동 문제에 답해 줘요. 폐쇄 동안 제기된 의문이 지워지지는 않아요."],
						["worried", "다른 정류장까지 걸어가던 사람들에게 이제 재개 공지가 있다고 알려 줄게요."],
						["night", "정류장이 열려 있는 건 집에 돌아가는 데도 중요해요. 업소가 문 닫을 때 경로를 확인할게요."],
					],
				},
				smuggle: {
					missing: [
						["worker", `짐을 내리는 사람들을 탓하기 전에 ${subject}의 납품 기록부터 확인하겠어요.`],
						["skeptic", `${subject} 보도에는 재고 목록이 필요해요. 화물이 사라졌다고 해서 누가 가져갔는지가 밝혀지지는 않아요.`],
						["worried", `${subject}【을를】 기다리는 고객이 영향을 받는지 주인이 설명해 줬으면 해요.`],
						["loyal", `${subject}【이가】 사라졌다고 알리면 사람들이 찾을 구체적인 대상이 생겨요. 글타래에서 낯선 사람을 비난한다고 되찾아지진 않아요.`],
					],
					statement: [
						["skeptic", `이 ${subject} 성명을 원래 납품 서류와 대조해 보겠어요.`],
						["worker", `${subject}【을를】 다루는 배달원들은 여기 모두에게 용의자 취급을 받지 않고 정보를 줄 방법이 필요해요.`],
						["worried", `증거 없이 ${subject}에 얽힌 이름을 전하지는 않겠어요.`],
						["loyal", `${subject}에 대한 다음 소식이 실제로 무엇이 발견됐는지 알려 줬으면 해요.`],
					],
					found: [
						["worker", `${subject}【을를】 찾은 건 진전이에요. 받는 쪽 작업반은 여전히 화물 내용물을 확인해야 해요.`],
						["skeptic", "일부 내용물은 아직 행방이 불분명해요. 되찾았다고 해서 아무것도 잃지 않았다는 제목이 나가서는 안 돼요."],
						["worried", "아직 물건을 기다리는 사람은 이 보도에서 짐작하지 않고 직접 소식을 들었으면 해요."],
						["loyal", "수색으로 뭔가 되찾아서 다행이에요. 사건을 닫기 전에 남은 재고를 확인했으면 해요."],
					],
					unresolved: [
						["skeptic", `${subject}에 결론이 없다고 해서 첫 비난이 옳았다는 증거는 아니에요.`],
						["worker", `${subject}【을를】 기다리는 사람들은 배송에 대한 답을 여전히 들어야 해요.`],
						["worried", "해결되지 않은 의혹이 배달원을 평생 따라다니는 건 싫어요."],
						["loyal", "누군가 화물을 알아볼 수 있을지 모르니 분실물 보고는 계속 열어 두겠어요."],
					],
					exposed: [
						["skeptic", `${subject}에 대한 정정은 첫 비난을 공유한 모두에게 닿아야 해요.`],
						["worker", "화물을 다루는 사람들의 평판을 주인의 첫 성명으로 결정해서는 안 돼요."],
						["worried", "앞선 설명에서 비난받은 사람들이 이번 정정을 전해 들었으면 해요."],
						["loyal", "정정은 필요해요. 그래도 주인은 물건이 어디 있는지 분명히 설명할 빚이 있어요."],
					],
				},
				implant: {
					response: [
						["worried", `${subject} 관련 질문은 클리닉에 가져가겠어요. 공개 답변으로는 제 임플란트에 맞는 게 뭔지 알 수 없어요.`],
						["worker", `${subject} 때문에 휴가를 내기 전에 제안된 예약에 실제로 무엇이 포함되는지 물어보겠어요.`],
						["skeptic", `${subject}에 대한 대응은 사람들이 바라는 의미가 아니라 약속하는 내용으로 판단해야 해요.`],
						["loyal", `${subject}에 대한 대응이 나와서 유용해요. 어떤 권고든 클리닉의 실제 조건을 함께 보관하겠어요.`],
					],
					fixed: [
						["worried", `${subject} 관련 소식에 아직 문제를 겪는 사람을 위한 조언도 들어 있나요? 제 경우에도 해당된다고 생각하기 전에 물어보겠어요.`],
						["worker", `클리닉에 문의할 때는 ${subject} 공지 날짜를 챙겨 두겠어요. 옛 광고가 아직 돌아다닌다면 특히요.`],
						["skeptic", `이건 ${subject}에 관한 진전일 뿐, 모든 환자의 상황이 정리됐다는 확인은 아니에요.`],
						["loyal", `${subject}에 결과가 나와서 다행이에요. 앞선 공지가 독자를 여기로 안내해야 해요.`],
					],
					ongoing: [
						["worried", `${subject}에 대한 답을 기다리는 사람들이 의학적 조언을 이 댓글란에 기대서는 안 돼요.`],
						["skeptic", `${subject}에 결론이 없다는 건 의문이 열려 있다는 뜻이에요. 가장 불안한 버전이 사실이라는 확인은 아니에요.`],
						["worker", `소문 때문에 근무 계획을 바꾸기 전에 ${subject}에 대한 서면 조언을 요청하겠어요.`],
						["loyal", `해결되지 않은 ${subject} 문의를 위해 클리닉이 연락처를 계속 두었으면 해요.`],
					],
					exposed: [
						["skeptic", `${subject}에 대한 앞선 설명은 원래 공지가 게시된 곳마다 정정해야 해요.`],
						["worried", `${subject}의 영향을 받은 사람에게는 공개 성명의 정정만이 아니라 직접적인 조언이 필요해요.`],
						["worker", `첫 ${subject} 공지 때문에 휴가를 낸 사람이 있다면 클리닉이 변경을 설명해 주길 바라요.`],
						["loyal", `${subject} 성명의 문제를 인정하는 건 시작이에요. 다음 지침에는 날짜가 분명히 적혔으면 해요.`],
					],
				},
				feud: {
					clash: [
						["worried", `${vals.D}【을를】 지나는 사람들은 이 싸움 가까이에 있을지 말지 고를 수 없어요.`],
						["worker", "상인들은 손님이 조직 다툼에 휘말리지 않고 노점에 올 수 있어야 해요."],
						["skeptic", "한 조직이 거리를 지배한다고 말해도 거주자가 안전하게 쓸 수 있는지는 알 수 없어요."],
						["loyal", "싸움이 멈추길 바라요. 어느 조직이든 더 큰 관객을 주는 건 거기 사는 사람들한테 도움이 안 돼요."],
					],
					retaliation: [
						["worried", "보복이란 첫 싸움에 끼지 않은 사람들도 여전히 위험하다는 뜻이에요."],
						["worker", "조직들이 번갈아 서로를 공격하는데 상인들은 하루 일을 어떻게 계획하라는 거예요?"],
						["skeptic", "이건 어느 조직이 지배를 확정했다는 증거가 아니라 또 한 번의 공격으로 읽겠어요."],
						["loyal", "누가 먼저 시작했든 조직 사이에 낀 사람들은 보호받아야 해요."],
					],
					truce: [
						["worried", "멈추기로 합의해서 마음이 놓여요. 경로를 되돌리기 전에 거리 상황부터 지켜볼게요."],
						["worker", "휴전이 지켜진다면 장사에 좋아요. 가게 직원들은 그래도 내일 문을 열어야 하고요."],
						["skeptic", "다툼이 영영 끝났다고 여기지 말고 합의가 지켜지는지 나중에 보도해 줬으면 해요."],
						["loyal", "싸움을 멈추기로 한 합의는 또 한 번의 보복보다 거주자들에게 낫죠."],
					],
					takeover: [
						["worker", "다른 조직이 거리를 차지했다고 해서 상인이 내일 얼마를 내야 하는지는 알 수 없어요."],
						["worried", "모퉁이에 어느 이름이 칠해지는지보다 사람들이 지나다닐 수 있는지가 더 중요해요."],
						["skeptic", "지배 주장은 보도할 가치가 있지만, 상황이 안정됐다고 하기 전에 증거를 기다리겠어요."],
						["loyal", "거주자가 집에 가려고 어느 편을 들어야 해서는 안 돼요."],
					],
					enforcement: [
						["loyal", "싸움을 말리는 건 중요해요. 거주자들이 평소 일상으로 돌아갈 수 있길 바라요."],
						["worried", "조직들이 구역을 떠났다고 여기기 전에 그래도 지역 공지부터 확인하겠어요."],
						["worker", "가게 직원들은 개입 뒤에 안전하게 문을 열어도 되는지 알아야 해요."],
						["skeptic", "집행관들이 한 번의 충돌을 말렸다고 해서 그 조직들 사이의 분쟁이 해결되는 건 아니에요."],
					],
				},
				idcheck: {
					found: [
						["worried", `${subject} 보도 밑에 신원 정보를 올리기보다 제 기록은 혼자서 확인하겠어요.`],
						["skeptic", `${subject}【이가】 쓰이는 걸 찾았다고 해서 스캐너를 통과하는 모든 계정이 의심스럽다는 뜻은 아니에요.`],
						["loyal", `정당한 계정 주인이 ${subject}에 대해 무엇을 해야 하는지 등록소가 설명해 줬으면 해요.`],
						["worker", `${subject} 관련 추가 검문에는 출근하는 사람들을 위한 분명한 지침이 필요해요.`],
					],
					tighten: [
						["worker", `${subject} 때문에 스캔이 두 번이면 교대 전에 시간을 더 잡아야 할 수도 있어요. 고용주들에게도 공지가 필요해요.`],
						["worried", "스캐너가 누군가의 기록에 의문을 제기하면 여기에 올리지 않고 어디서 정정을 요청할 수 있나요?"],
						["skeptic", `${subject} 조사에서 두 번째 스캔이 무엇을 더하는지 등록소가 설명해 줬으면 해요.`],
						["loyal", "검사에는 협조하겠지만, 지나가는 모두에게 지침이 같아야 해요."],
					],
					traced: [
						["skeptic", `${subject}의 출처를 추적했다고 해서 영향을 받은 모든 계정이 드러나는 건 아니에요.`],
						["worried", "영향받은 계정 주인들이 소문으로 알게 되지 않고 비공개로 통지받았으면 해요."],
						["loyal", "출처를 밝혀낸 건 유용해요. 등록소는 재발 방지를 위해 무엇을 했는지 설명해야 해요."],
						["worker", "이제 출처가 추적됐으니 추가 심사가 언제 끝날 수 있는지 알고 싶어요."],
					],
					quiet: [
						["skeptic", "조사가 잠잠해졌다고 해서 신원 문제가 해결됐다는 뜻은 아니에요."],
						["worried", "자기 기록이 걱정되는 사람들은 아직 질문할 곳이 필요해요."],
						["loyal", "오늘 발표가 없더라도 등록소가 새 증거에 열린 채로 사건을 유지했으면 해요."],
					],
				},
			}[rec.f]?.[rec.ph] ?? [];
		const extra = development.flatMap(([kind, line]) => people.filter(p => p[1] === kind).map(p => [p[0], line]));
		return [...extra, ...list.sort((x, y) => N.seed(rec.id + x[0]) - N.seed(rec.id + y[0]))].filter(x => !x[1].includes("\u0000"));
	},

	/* The player's three replies. Some are risky: threats or claims of involvement draw attention to the commenter. */
	replies: {
		SECURITY: [
			["얼마나 오래 가나요?", "잘됐네요. 이 거리에 필요한 일이었어요.", "집행관들은 자기 일이나 신경 써야죠.|watched"],
			["누가 누구를 세울지 결정하나요?|critical", "누군가 뭐라도 해서 다행이에요.", "한번 막아 보라고 해요.|watched"],
		],
		CRIME: [
			["더는 아무도 다치지 않길 바라요.", "집행국이 나서야 해요.", "재밌겠네요. 정확히 어디예요?|watched"],
			["며칠은 그쪽에 가지 마세요.", "두 조직 다 서로한테 딱이에요.", "누가 이기든 저는 그쪽에 돈을 낼 거예요.|watched"],
		],
		INDUSTRY: [
			["작업자들은 괜찮나요?", "쉰 날만큼 작업반에 임금을 주세요.", "나머지 기계도 누가 부숴 버려야 할지도 모르죠.|watched"],
			["언제쯤 다시 열리나요?", "다음엔 작업자들 말을 들으세요.|critical", "사고는 일어나는 법이죠."],
		],
		TRANSIT: [
			["대신 가장 가까운 정류장은 어디예요?", "공지가 사람들이 보는 것과 달라요.|critical", "그냥 걸어가세요."],
			["정류장이 열렸나요, 닫혔나요?", "교통국이 이걸 설명해야 해요.|critical", "그래도 셔틀이 걷는 것보단 나아요."],
		],
		BUSINESS: [
			["고객에게는 어떤 의미인가요?", "평소와 다름없는 일 같네요.", "저는 그쪽 수치를 안 믿어요.|critical"],
			["그쪽 장부는 누가 확인하나요?|critical", "잘됐네요, 그쪽엔.", "그 일로 감옥 갈 사람은 아무도 없을 거예요."],
		],
		CYBERNETICS: [
			["제 임플란트도 점검받아야 할까요?", "클리닉에는 더 엄격한 규칙이 필요해요.", "값만 맞으면 뭐든 시험해 보라고 하겠어요."],
			["점검은 어디서 받을 수 있나요?", "그래서 저는 계속 등록해 두는 거예요.", "제 백업은 누가 볼 수 있나요?|critical"],
		],
		SOCIETY: [
			["다친 사람 있나요?", "좋은 밤이었나 보네요.", "다음엔 저도 갈래요."],
			["이웃들 말에도 일리가 있어요.", "클럽은 가만히 두세요.", "저도 거기 있었으면 좋았을 텐데요."],
		],
		PEOPLE: [
			["누가 초대받았나요?", "사람들 사생활은 지켜 주세요.", "좋겠네요."],
			["주최자가 누군지 아는 사람 있나요?", "그냥 내버려 두세요.", "저도 초대받고 싶네요."],
		],
		BREAKING: [
			["크게 다친 사람이 없길 바라요.", "집행국이 조사해야 해요.", "그거 저예요.|watched"],
			["누구였나요?", "위험해 보여요. 가까이 가지 마세요.", "그거 저예요.|watched"],
		],
		MARKETS: [
			["지금 사야 할까요?", "그 발표가 진짜인가요?|critical", "가진 건 그대로 들고 있을래요."],
			["얼마나 더 떨어질 수 있나요?", "거래소 기록은 누가 확인하나요?|critical", "먼저 안 사람한테는 쉬운 돈이네요."],
		],
		WEEKLY: [["Busy week.", "Nothing ever really changes.", "Thanks for the summary."]],
		NOTICE: [
			["공지 고마워요.", "이거 최신인가요?|critical", "이런 건 누가 정하나요?"],
			["알아 둬서 좋네요.", "이런 거 아무도 안 읽어요.", "이거 정확한가요?|critical"],
		],
	},

	options(rec, out) {
		if (rec.f === "implant" && rec.s === "trial")
			return [
				["Can guests join this trial?", "", "question"],
				["What are volunteers being asked to test?", "", "question"],
				["I would read the consent terms first.", "", "concern"],
			];
		if (rec.f === "implant" && rec.s === "backup")
			return [
				["Can a guest make a Registry backup?", "", "question"],
				["Who is allowed to read existing backups?", "critical", "question"],
				["A record check is not a backup.", "", "opinion"],
			];
		if (rec.f === "implant" && ["xchange", "unlicensed"].includes(rec.s))
			return [
				["Does my guest implant authorize new body parts?", "", "question"],
				["I would check the service desk's restrictions first.", "", "opinion"],
			];
		if (rec.f === "nightlife" && rec.s === "raid")
			return [
				["Why are guests being scanned?", "", "question"],
				["I want the door policy explained.", "", "concern"],
			];
		const sets = this.replies[out.cat];
		if (!sets) return [];
		return this.pick(rec, "opt", sets).map(s => {
			const option = s.split("|");
			if (rec.f === "industry" && rec.s === "walkout" && option[0] === "사고는 일어나는 법이죠.") option[0] = "임금 분쟁은 합의될까요?";
			if (rec.f === "industry" && !rec.shut && option[0] === "언제쯤 다시 열리나요?") option[0] = "다음 교대에는 어떤 의미인가요?";
			option[2] = option[0].endsWith("?") ? "question" : option[1] === "watched" ? "provocation" : option[1] === "critical" ? "evidence" : "opinion";
			return option;
		});
	},

	/* Official accounts that answer when a comment concerns them. */
	accounts: {
		enforcement: "island.enforcement",
		registry: "civic.registry",
		transit: "city.transit",
		halden: "halden.trust",
		unitx: "unit.exchange",
		kessler: "kessler.arms",
		printworks: "printworks.forge",
		foundry: "arcology.foundry",
		compute: "computefloor.mgmt",
		lumen: "lumen.clinic",
		meridian: "hotel.meridian",
		tidewater: "tidewater.freight",
	},

	/* Reply lines by category and mood. {D} district, {O} organisation, {N} nearest open shuttle stop.
	   A thread never uses one mood twice, so two replies can't say the same thing in different words. */
	talk: {
		TRANSIT: {
			ask: [
				"{N}【이가】 가장 가까운 운행 정류장이에요. 걸어서 10분쯤 걸려요.",
				"{N}까지 걸어가세요. 공지를 기다리는 것보다 빨라요.",
				"{N}에 가 보세요. 거기 화면은 오늘 아침에 맞았어요.",
			],
			agree: [
				"저도 그래요. {D}에서 헛되이 20분을 기다렸어요.",
				"정비 계약이 바뀐 뒤로 요금이 두 번 올랐어요. 그것도 아무도 공지하지 않았고요.",
				"그 정류장이 서면 제 교대 전체가 늦어요.",
				"꼭 셔틀을 놓친 다음에야 지연을 공지하더라고요.",
			],
			differ: [
				"그래도 셔틀은 이 섬에서 가장 좋은 점이에요. 나쁜 한 주 때문에 달라지진 않아요.",
				"솔직히 저는 괜찮았어요. 그냥 {D}만 그런 걸지도요.",
				"제시간에 오는 날이 더 많아요. 사람들은 안 올 때만 글을 올리고요.",
			],
			joke: [
				"제 다리가 이렇게 튼튼했던 적이 없어요. 도시 교통국 덕분이에요.",
				"셔틀 시간을 이웃집 개랑 비교하기 시작했어요. 개가 이겨요.",
				"시간표 덕분에 공짜로 {D} 도보 관광을 하네요.",
			],
			critical: ["{D}의 게시판은 한 가지를 말하고 문 위의 화면은 다른 걸 말했어요.", "밤에 그 노선을 또 누가 쓰는지 물어보세요."],
		},
		SECURITY: {
			ask: [
				"지난번엔 나흘 갔어요. 끝난다고는 절대 공지 안 해요.",
				"시빅 대로의 집행국 사무소에 물어보세요. 대답은 안 해 줘도 기록은 해요.",
				"보통 카메라에 거리가 하루 종일 조용한 걸로 찍힐 때까지예요.",
			],
			agree: [
				"누가 말해 줘서 다행이에요. {D}에 이게 필요했어요.",
				"그들이 나타난 뒤로 우리 가게가 조용해졌어요. 감수할게요.",
				"사람들이 뭐라 하든 밤 순찰은 차이를 만들어요.",
			],
			differ: [
				"누구한테 조용해졌다는 거죠? 말썽을 두 거리 옆으로 옮길 뿐이에요.",
				"출근하다가 세 번이나 스캔당했어요. 누구도 더 안전해지지 않았어요.",
				"일주일이면 떠나고 또 똑같아질 거예요.",
			],
			joke: [
				"누가 드론한테 월급 좀 올려 줘요.",
				"제 임플란트는 너무 자주 스캔당해서 이제 그들한테 손을 흔들기 시작했어요.",
				"이쯤 되니 검문소 집행관이 제 점심 메뉴까지 알아요.",
			],
			critical: ["이런 작전 뒤의 수치는 아무도 못 봐요.", "좋았던 날만 발표하죠."],
		},
		CRIME: {
			ask: [
				"며칠 기다려 보세요. 이런 건 사그라들거나 누가 나서요.",
				"큰길로만 다니면 괜찮아요. 말썽은 골목에 있어요.",
				"노점상한테 물어보세요. 이번 주에 누가 돈을 걷는지 늘 알아요.",
			],
			agree: ["그 사람들은 한 달 내내 서로 맴돌고 있었어요.", "{D} 사람들은 다 이럴 줄 알았어요.", "고개 숙이고 다니고 지갑은 장화 속에 넣어 둬요."],
			differ: ["기사에서 말하는 것만큼 심하진 않아요.", "절반은 싸운 게 아니라 촬영하는 사람들이었어요.", "{D}【은는】 더한 일도 겪었어요. 가라앉을 거예요."],
			joke: [
				"집에 가는 길목만 아니면 표를 사서 보겠어요.",
				"적어도 노점들은 새 유리창을 얻겠네요.",
				"스태틱 룸에서는 이런 거 돈 받는다고 누가 말 좀 해 주세요.",
			],
			critical: ["The crew names in these articles are always a guess."],
		},
		INDUSTRY: {
			ask: [
				"아무도 말 안 해 줬어요. 문에 붙은 공지는 어제 그대로예요.",
				"제가 듣기로는 다들 빠져나왔대요. 나머지는 소문이에요.",
				"교대 게시판에는 조사관들이 승인할 때까지 아무 말도 없어요.",
			],
			agree: [
				"벌써 이틀 치 임금을 날렸어요. 당신도 그렇겠죠.",
				"맞아요. 제가 시작했을 때도 기계는 낡았어요.",
				"작업반들은 몇 달째 그 얘길 하고 있어요.",
			],
			differ: [
				"이번에는 운영사가 빨리 고쳤어요. 그건 인정해 줘야죠.",
				"힘든 일에는 사고가 나는 법이에요. 사고마다 탓할 사람이 있는 건 아니에요.",
				"대부분은 다음 날 복귀했어요.",
			],
			joke: [
				"껐다가 다시 켜 봤을까요?",
				"안전 표시 화면에는 무사고 일수가 나와요. 제 건 커피 없는 일수가 나오고요.",
				"새 프레스, 낡은 장갑은 그대로.",
			],
			critical: ["접수한 건이 아무 설명 없이 종결됐어요. 제 것도요.", "마지막 점검을 누가 승인했는지 물어보세요."],
		},
		BUSINESS: {
			ask: [
				"고객은 거의 눈치 못 채요. 가격은 일주일 뒤에, 오르더라도 그때 올라요.",
				"누구한테 묻느냐에 따라 달라요. 직원들이 제일 마지막에 알았어요.",
				"등록소 서류를 읽어 보세요. 공개돼 있어요, 잘 숨겨 놨을 뿐.",
			],
			agree: [
				"자세히 보면 그쪽 수치는 맞아떨어진 적이 없어요.",
				"맞아요. 그런 계약은 늘 일자리가 줄어드는 걸로 끝나요.",
				"저도 같은 이유로 작년에 거기 계좌를 닫았어요.",
			],
			differ: [
				"여기서 제때 지급하는 몇 안 되는 회사예요.",
				"큰 회사는 다 분쟁 하나쯤 안고 있어요. 뉴스도 아니에요.",
				"경쟁사가 누군지 보면 그 거래가 이해돼요.",
			],
			joke: [
				"우리 집주인은 어떻게든 월세를 올릴 방법을 찾을 거예요.",
				"합의했고, 조건은 비공개, 다들 웃는 얼굴. 전형적이네요.",
				"사백 쪽짜리만 아니었으면 전체 보고서를 읽었을 텐데요.",
			],
			critical: ["자기네 검토에서 자기네가 무혐의래요. 당연하죠.", "서류는 성명과 다른 얘기를 해요."],
		},
		CYBERNETICS: {
			ask: [
				"메드테크 가에서 점검을 해요. 루멘은 돈을 받고, 작은 곳들은 안 받아요.",
				"시빅 대로의 등록소 창구요. 게스트 ID를 챙겨 가세요.",
				"문에 공개 면허가 붙은 클리닉이면 어디서든 오류 기록을 읽을 수 있어요.",
			],
			agree: ["저는 지난주에 두 번 재시작됐어요. 착각이 아니에요.", "그래서 저는 백업을 항상 최신으로 해 둬요.", "싼 부품, 비싼 교훈."],
			differ: [
				"제 건 업데이트 뒤로 멀쩡해요.",
				"불만 대부분은 정기 점검을 건너뛴 사람들이에요.",
				"메드테크 가의 클리닉들은 사람들 말보다 나아요.",
			],
			joke: [
				"제 임플란트는 상사가 전화할 때마다 재시작돼요. 불만은 없어요.",
				"저를 껐다 켜 봤어요. 여전히 피곤하네요.",
				"삑 소리가 나면 작동하는 거예요. 그게 제 방침이에요.",
			],
			critical: ["누가 백업을 볼 수 있느냐가 진짜 문제예요.", "클리닉들이 또 자기네 숙제를 자기네가 채점하네요."],
		},
		SOCIETY: {
			ask: ["제가 본 바로는 별일 없었어요.", "문지기한테 물어보세요. 다 보지만 말은 안 해요.", "해 뜨기 전에 끝났어요. 대부분의 밤이 그래요."],
			agree: ["이번 달 번화가 최고의 밤이었어요.", "줄만 해도 볼 만했어요.", "맞아요. {D}【은는】 이 섬에서 유일하게 살아 있는 느낌이 나는 곳이에요."],
			differ: ["우리 중에는 그 클럽들 위에 사는 사람도 있어요.", "저녁 한때는 즐겁지만 한 주 내내 골치예요.", "다음 날 아침 거리가 엉망이었어요."],
			joke: [
				"안에 들어가지도 않았는데 아직도 귀가 울려요.",
				"다음엔 의자를 가져갈래요.",
				"소매치기가 바 직원들보다 더 좋은 밤을 보냈어요.",
			],
			critical: ["Ask who pays for the cleanup."],
		},
		PEOPLE: {
			ask: [
				"명단 밖에 있는 사람은 아무도 몰라요. 그게 바로 요점이죠.",
				"이름은 절대 공개 안 해요. 짐작하는 게 재미의 절반이에요.",
				"부두에서 출항하는 배를 보세요. 그게 얻을 수 있는 유일한 손님 명단이에요.",
			],
			agree: [
				"초대장 한 장이면 일주일 치 임금도 내겠어요.",
				"릴레이 가가 밤새 절반은 막혔어요. 또요.",
				"글래스하우스에 불이 켜질 때마다 호텔이 차요.",
			],
			differ: [
				"비공개 행사였어요. 그냥 내버려 두세요.",
				"그곳에 대한 소문 절반은 근처에도 가 본 적 없는 사람들이 지어낸 거예요.",
				"저 위의 모든 게 수수께끼인 건 아니에요. 가끔은 그냥 저녁 식사예요.",
			],
			joke: [
				"제 초대장은 우편 배달 중에 분실됐나 봐요. 매번요.",
				"배를 봤어요. 외투를 봤어요. 제 보고는 그게 전부예요.",
				"손님 명단: 부자, 더 부자, 그리고 몹시 초조한 누군가의 비서.",
			],
			critical: ["주최자는 건드리지 마세요. 여기 아무도 아무것도 몰라요.", "글래스하우스를 캐고 다니면 아무도 도와주지 않을 거예요."],
		},
		NOTICE: {
			ask: [
				"시빅 대로의 등록소 창구에서 더 알려 줄 수 있어요.",
				"승강기 옆 공용 게시판에도 붙어 있어요.",
				"묵고 있는 호텔 데스크에 물어보세요. 거기가 제일 먼저 받아요.",
			],
			agree: ["알아 두면 도움 되겠네요.", "어딘가에 적어 둬서 다행이에요.", "고마워요. 지난 건 놓쳤거든요."],
			differ: ["이런 거 아무도 안 읽어요.", "일이 벌어진 뒤에야 이런 걸 붙여요.", "공지 절반은 정오쯤이면 낡아 있어요."],
			joke: ["공지에 대한 또 하나의 공지네요.", "다른 마흔 장 옆에 이것도 붙여 둘게요.", "흥미진진하네요."],
			critical: ["These are only as accurate as whoever typed them."],
		},
		BREAKING: {
			ask: ["제가 아는 한 크게 다친 사람은 없어요.", "아직 이름은 없어요. 집행국 뜻대로라면 앞으로도 없을 거예요.", "영상은 한 시간 안에 내려갔어요."],
			agree: ["길 건너에서 봤어요. 대단했어요.", "사람들이 아직도 그 얘기를 해요.", "평범한 밤이 아니었어요."],
			differ: ["영상에는 어떻게 시작됐는지가 안 나와요.", "편 가르기 전에 전체 이야기를 기다리세요.", "싸움은 카메라에 찍히면 다 더 심해 보여요."],
			joke: ["누가 저 사람 좀 고용해요. 아니면 숨든가.", "이제 길을 조금 더 빨리 건너겠어요.", "새 규칙: 메리디안에서 낯선 사람을 건드리지 말 것."],
			critical: ["Enforcement only posts the footage that suits them."],
		},
		MARKETS: {
			ask: [
				"익스체인지 광장의 단말기가 실시간 가격을 보여 줘요. 글타래에 있는 건 이미 옛날 거예요.",
				"아무도 몰라요. 안다고 하는 사람은 뭔가를 팔고 있는 거예요.",
				"성명 말고 체결된 거래를 보세요.",
			],
			agree: ["저도요. 절반 팔고 절반 남겼어요.", "거래소 홀에서 지켜봤어요. 대단한 한 시간이었어요.", "그래서 저는 월세 돈을 금고에 넣어 둬요."],
			differ: [
				"이곳의 상승장은 다 똑같이 끝나요. 결국엔요.",
				"전에도 이만큼 움직였다가 돌아왔어요.",
				"그 움직임의 대부분은 기사가 올라가기 전에 일어났어요.",
			],
			joke: [
				"제 포트폴리오는 사이퍼 3개와 커피 쿠폰 카드예요.",
				"단타 매매는 조명이 더 좋은 도박일 뿐이에요.",
				"거래소 화면에는 스트레스 경고가 붙어야 해요.",
			],
			critical: ["그 성명을 쓴 사람이 먼저 샀어요.", "거래소는 그 주문을 누가 냈는지 알아요. 말을 안 할 뿐이죠."],
		},
		WEEKLY: {
			ask: ["Same as every week, mostly."],
			agree: ["바쁜 한 주였네요.", "요약 잘 됐어요."],
			differ: ["Missed half of what actually happened."],
			joke: ["Seven days, seven reasons to stay indoors."],
			critical: ["Funny what never makes the weekly."],
		},
	},

	/* Lines any thread can fall back on, so a reply never goes missing. */
	fallback: {
		agree: ["오늘 아침에 이웃한테도 똑같은 말을 했어요.", "기사보다 말씀을 더 잘하셨네요."],
		differ: ["맞는 말이지만 다른 면도 있어요.", "제가 본 건 달랐지만 그렇게 말씀하시는 이유는 알겠어요."],
		joke: ["Put it on the wall at Dome Broadcast. They need new material."],
		ask: ["Nobody official has said yet."],
		critical: ["A few of us have been asking the same thing."],
	},

	/* Direct answers to each comment the player can post, so the first reply responds to what was actually said. */
	responses: {
		"사고는 일어나는 법이죠.": ["이렇게 한 현장에서 이렇게 많이는 안 일어나요.", "화상 입은 두 사람한테 가서 그 말을 해 보세요.", "맞아요, 근데 어떤 건 아무도 귀 기울이지 않아서 일어나요."],
		"작업자들은 괜찮나요?": [
			"제가 듣기로는 두 명이 치료받고 집에 보내졌어요.",
			"괜찮아요. 화는 났지만 괜찮아요.",
			"제 사촌이 그 교대였어요. 놀랐지만 다치진 않았어요.",
		],
		"두 조직 다 서로한테 딱이에요.": [
			"노점 주인이 둘 사이에 끼기 전까진 그렇죠.",
			"심하지만, {D}에서 저 둘 때문에 우는 사람은 없어요.",
			"둘한테 돈 내는 사람들은 생각이 다를 수도 있어요.",
		],
		"바쁜 한 주였네요.": ["그리고 다음 주는 더 나빠 보여요.", "돔 방송한테는 바쁘고, 나머지한테는 대체로 조용했죠."],
		"교통국이 이걸 설명해야 해요.": [
			"안 할 거예요. 한 번도 안 했어요.",
			"신호 고장 탓을 할 거예요. 늘 신호 고장 탓이에요.",
			"시빅 대로 사무소에 물어보세요. 인내심은 챙겨 가고요.",
		],
		"클리닉에는 더 엄격한 규칙이 필요해요.": [
			"규칙은 있어요. 아무도 확인을 안 할 뿐이에요.",
			"더 엄격한 규칙은 사람들을 언더패스의 칩 커터들한테 밀어 넣을 뿐이에요.",
			"좋은 클리닉은 이미 따르고 있어요. 싼 곳은 절대 안 따를 거예요.",
		],
		"주최자가 누군지 아는 사람 있나요?": [
			"다들 안다고 생각해요. 실제로 아는 사람은 없어요.",
			"일부는 크라운 가의 절반을 소유한다고 하고, 일부는 임대 계약서 위의 이름일 뿐이라고 해요.",
			"물어봐야 한다면 초대는 못 받아요.",
		],
		"집행국이 조사해야 해요.": [
			"들여다보고는 있죠. 뭘 발표할지는 다른 문제지만요.",
			"영상은 이미 갖고 있어요. 그게 문제죠.",
			"돈 주는 사람이 시키면 하겠죠.",
		],
		"집행국이 나서야 해요.": [
			"그러고는 지난번처럼 일주일 뒤에 빠지겠죠.",
			"다음 거리로 옮겨 놓을 뿐이에요.",
			"{D}에서요? 큰길도 겨우 순찰하는데요.",
		],
		"누군가 뭐라도 해서 다행이에요.": [
			"뭔가 하는 것과 고치는 건 달라요.",
			"저도요. 정말 긴 한 달이었어요.",
			"고마워하는 건 일주일 지켜보고 하세요.",
		],
		"잘됐네요, 그쪽엔.": ["적어도 주주들에게는 잘된 일이죠.", "나머지 우리가 얼마를 치르는지 보고 나서 말해요.", "맞아요. 좋은 한 주를 보낼 만했어요."],
		"알아 둬서 좋네요.": ["퍼뜨려 줘요. 이런 걸 보는 사람은 많지 않아요.", "솔직히 헛걸음 안 하게 됐어요."],
		"잘됐네요. 이 거리에 필요한 일이었어요.": ["그 길에서 불심검문 안 당하면 말하기 쉽죠.", "맞아요. 우리 가게도 조용해졌어요.", "한 달 전에 했어야 했어요."],
		"더는 아무도 다치지 않길 바라요.": [
			"저도요. 집에 걸어가던 사람이 꼭 당하더라고요.",
			"며칠 밤만 뒷골목을 피하면 괜찮을 거예요.",
			"메드테크 가의 클리닉은 긴 밤을 보냈어요.",
		],
		"크게 다친 사람이 없길 바라요.": ["대부분 멍이에요. 자존심도 좀 다쳤고요.", "제가 듣기론 클리닉에 간 사람은 없어요."],
		"언제쯤 다시 열리나요?": [
			"공지엔 아무 말이 없어요. 제 짐작엔 사흘이에요.",
			"조사관들이 떠나면요. 그게 언제인지는 아무도 몰라요.",
			"지난번엔 나흘 걸렸어요.",
		],
		"얼마나 오래 가나요?": [
			"보통 카메라에 조용한 날이 찍힐 때까지요.",
			"끝났다고 알려 주는 일은 없어요. 그냥 안 나타나요.",
			"예전 단속을 보면 일주일쯤이에요.",
		],
		"저는 그쪽 수치를 안 믿어요.": [
			"공시를 읽어 본 사람은 아무도 못 믿어요.",
			"거짓말은 아니에요. 전부 말하지 않을 뿐이죠.",
			"자체 검토에서 문제없다고 나왔죠. 당연히 그랬겠죠.",
		],
		"값만 맞으면 뭐든 시험해 보라고 하겠어요.": [
			"동의서부터 읽어요. 전부 다요.",
			"지난 시험의 지원자 두 명은 돌아오지 않았어요. 그냥 하는 말이에요.",
			"보수는 좋아요. 부작용은 광고에 안 나오고요.",
		],
		"저도 초대받고 싶네요.": [
			"줄 서세요. 섬보다 더 길어요.",
			"초대장은 돈으로 못 사요. 그게 핵심이죠.",
			"거기서는 소원 조심해요.",
		],
		"정류장이 열렸나요, 닫혔나요?": [
			"정류장 화면은 아니라고 하고 공지는 맞다고 해요. 화면을 믿어요.",
			"오늘 아침에 지나갈 땐 아니었어요.",
			"둘 중 어느 쪽을 믿느냐에 달렸죠.",
		],
		"이거 정확한가요?": ["대체로요. 이런 건 아무도 확인하기 전에 올라가요.", "올라온 시점엔 맞았어요. 정오쯤이면 달라져요."],
		"이거 최신인가요?": ["오늘 아침까진 그랬어요.", "아마 아닐걸요. 올려 놓고 잊어버리거든요."],
		"그냥 걸어가세요.": [
			"{D} 끝자락에 안 살면 쉽죠.",
			"밤에 그런 길을 걸으라는 건 좋은 조언이 아니에요.",
			"맞아요. 어떤 날은 그게 더 빨라요.",
		],
		"클럽은 가만히 두세요.": [
			"네 시 넘어서 조용히만 해 주면 기꺼이요.",
			"클럽이 {D}의 유일한 버팀목이에요.",
			"클럽을 건드리는 사람은 없어요. 문제는 바깥 거리예요.",
		],
		"그냥 내버려 두세요.": [
			"맞아요. 그 위에서 무슨 일이 있든 그들 일이죠.",
			"귀찮게 하는 사람은 없어요. 다들 궁금할 뿐이에요.",
			"릴레이 가가 하룻밤 막히면 말처럼 쉽지 않죠.",
		],
		"사람들 사생활은 지켜 주세요.": [
			"글래스하우스는 섬 나머지를 다 합친 것보다 사생활이 보장돼요.",
			"부두에 연락선이 줄지어 서는데 비밀이 지켜지겠어요.",
			"맞아요. 소문은 대부분 헛소리고요.",
		],
		"다음엔 작업자들 말을 들으세요.": [
			"절대 안 들어요. 듣는 건 벌금뿐이에요.",
			"작업자들이 두 번이나 적어 냈어요. 읽은 사람은 없고요.",
			"이번엔 들을지도요. 벌금이 더 컸으니까요.",
		],
		"좋겠네요.": ["정말 좋겠죠.", "거리에서 보기엔 즐거워 보였어요.", "그 많은 연락선 값은 누군가 내야죠."],
		"다음엔 저도 갈래요.": ["{D} 사람들 전부 그렇게 말해요.", "줄이 모퉁이까지 닿기 전에 가요.", "귀마개 챙겨 가요."],
		"이런 거 아무도 안 읽어요.": ["방금 읽었어요. 마지못해서요.", "읽어야 할 사람들이 안 읽는 건 사실이죠."],
		"그 일로 감옥 갈 사람은 아무도 없을 거예요.": [
			"벌금 한 번에 성명 하나죠. 늘 똑같아요.",
			"어쨌든 중요한 사람은 아니겠죠.",
			"말단 누군가가 잘리겠죠. 늘 그렇듯이요.",
		],
		"달라지는 건 사실 없어요.": ["이름은 바뀌어도 이야기는 그대로예요.", "조용한 주도 있어요. 그것만 해도 어디예요."],
		"쉰 날만큼 작업반에 임금을 주세요.": [
			"맞아요. 그 사람들 잘못이 아니에요.",
			"조사관이 시키면 주겠죠.",
			"여기선 쉰 날은 절대 안 쳐줘요. 아무한테나 물어봐요.",
		],
		"제 임플란트도 점검받아야 할까요?": [
			"두 번 이상 재시작됐다면 받아요.",
			"해될 건 없죠. 작은 클리닉이 더 싸요.",
			"최근 업데이트를 받았을 때만요.",
		],
		"그래도 셔틀이 걷는 것보단 나아요.": [
			"서 줄 때는 그렇죠.",
			"맞아요. 늦게 오는 셔틀도 언더패스를 걷는 것보단 낫죠.",
			"어두운 정류장에 서 있는 게 본인이 되기 전까진요.",
		],
		"위험해 보여요. 가까이 가지 마세요.": [
			"좋은 조언이에요. 저는 멀리 돌아가요.",
			"휘말린 사람들에게만 위험하죠. 나머지는 구경만 해요.",
			"지금은 끝났어요. 아마도요.",
		],
		"좋은 밤이었나 보네요.": ["청소부들이 오기 전까진요.", "이번 달 최고였어요.", "안에 있던 사람들에겐 그랬겠죠."],
		"평소와 다름없는 일 같네요.": ["그게 걱정이에요.", "평소와 같다는 게 문제예요.", "거의요. 볼 건 없어요."],
		"며칠은 그쪽에 가지 마세요.": ["현명하네요. 보통 주말쯤이면 가라앉아요.", "거기 살면 말처럼 쉽지 않죠.", "이미 그러고 있어요."],
		"공지 고마워요.": ["저도요. 아니었으면 놓쳤을 거예요."],
		"요약 고마워요.": ["솔직히 한 주 치를 다 읽지 않아도 돼서 좋아요."],
		"이웃들 말에도 일리가 있어요.": ["고마워요. 우리도 잠은 자야죠.", "클럽 위에 살기로 한 건 그쪽이잖아요.", "맞아요. 소음이 점점 심해져요."],
		"공지가 사람들이 보는 것과 달라요.": [
			"원래 안 맞아요. 정류장 화면을 믿어요.",
			"저도 느꼈어요. 게시판은 한 소리를 하고 거리는 다른 소리를 하죠.",
			"그 공지는 아주 먼 데서 누가 쓰나 봐요.",
		],
		"그래서 저는 계속 등록해 두는 거예요.": ["등록한 사람이 스캔도 더 자주 당하지만요.", "현명하네요. 백업 덕에 일자리를 지킨 적 있어요."],
		"다친 사람 있나요?": ["제가 듣기론 심하진 않았어요.", "한 명이고 경상이에요. 뉴스엔 안 나왔어요."],
		"고객에게는 어떤 의미인가요?": [
			"결국엔 가격이 오르겠죠.",
			"몇 주는 아무 일 없어요. 그다음엔 느끼게 될 거예요.",
			"다음 청구서의 작은 글씨를 읽어 봐요.",
		],
		"점검은 어디서 받을 수 있나요?": ["메드테크 가의 아무 클리닉이나요.", "작은 클리닉이 루멘보다 싸고 빨라요."],
		"대신 가장 가까운 정류장은 어디예요?": ["{N}요. 걸어서 십 분쯤이에요.", "{N}에 가 봐요. 거기 화면은 오늘 아침에 맞았어요."],
		"제 백업은 누가 볼 수 있나요?": ["등록소는 직원만 본다고 해요. 등록소는 별말을 다 하죠.", "그건 아무도 시원하게 답해 주지 않아요."],
		"그쪽 장부는 누가 확인하나요?": ["이론상으론 등록소죠.", "자기네 감사관들이요. 알아서 판단해요."],
		"이런 건 누가 정하나요?": ["시빅 대로의 어느 사무실에 있는 누군가요.", "평생 만날 일 없는 사람이요."],
		"누가 누구를 세울지 결정하나요?": [
			"카메라가 고르고 집행관이 따라가요.",
			"게스트 칩 가진 사람에게 물어봐요. 무작위가 아니에요.",
			"공식적으론 아무도 아니에요. 비공식적으론 짐작이 가죠.",
		],
		"누가 초대받았나요?": [
			"43층 아래 사람은 아무도 없다는 건 확실해요.",
			"이름은 건물 밖으로 안 나가요.",
			"부두에서 연락선 타고 나가는 사람들을 봐요. 그게 명단이에요.",
		],
		"누구였나요?": ["아직 이름은 안 나왔어요. 아마 영영 안 나오겠죠.", "섬에 새로 온 사람이래요."],
		"저도 거기 있었으면 좋았을 텐데요.": ["줄 서는 건 질색이었을 거예요.", "다음에요. {D}에는 늘 다음이 있죠."],
	},

	/* Boilerplate from official accounts, in a few wordings so one account doesn't post the same sentence twice in a month. */
	official: {
		refer: [
			"이 계정의 정보를 시민 등록소에 전달했습니다. 직원이 소유자를 확인할 것입니다.",
			"이 게시물은 기록되었습니다. 계정 소유자는 신원 확인을 요청받을 수 있습니다.",
			"공개적인 위협은 기록되어 시민 등록소로 전달됩니다.",
			"이 게시물과 관련해 시빅 대로의 집행국 사무소를 방문해 주십시오.",
		],
		threat: [
			"당사 직원이나 시설에 대한 위협은 섬 집행국에 전달됩니다.",
			"이 댓글은 섬 집행국에 신고되었습니다.",
			"당사 시설에 대한 위협을 엄중히 받아들입니다. 이 게시물은 신고되었습니다.",
		],
		stand: [
			"당사의 성명은 유효합니다. 서비스 정보는 자체 기록에 근거합니다.",
			"당사는 게시한 정보를 그대로 유지합니다.",
			"게시한 공지는 정확합니다. 추가 문의는 공보실로 보내 주십시오.",
		],
		query: [
			"이 건에 대한 문의는 공보실로 보내 주십시오.",
			"해당 논의를 인지하고 있으며, 변경 사항이 있으면 갱신 소식을 게시하겠습니다.",
			"이 건에 대해서는 공보실에서 답변해 드립니다.",
		],
	},

	/* The player's comment, answered the next in-game day. Returns [{ h: handle, t: text, at, o: official, n: network notice }].
	   Rules: the first reply answers what the player said; no line repeats inside a thread; no handle repeats a line within
	   28 days; one thread never uses the same mood twice, so two replies can't say the same thing in different words. */
	reply(rec, cm, day) {
		const N = setup.arcologyNews;
		const st = N.state();
		const view = this.write(rec);
		const [selected = "", flag] = view.options[cm.i] ?? [];
		const said = cm.t || selected;
		const intent = flag || (said.endsWith("?") ? "ask" : "say");
		const r = k => N.seed(`${rec.id}|reply|${k}`);
		const pick = (k, list) => list[Math.floor(r(k) * list.length)];
		const at = day * N.DAY + Math.floor(8 + r("h") * 12) * 3600 + Math.floor(r("m") * 6) * 600;
		if (rec.k === "reminder") {
			const answer = cm.i === 0 ? rec.x.answer : rec.x.where;
			const signature = Math.floor(N.seed(N.normalize(answer)) * 1e5);
			const used =
				(st.said ?? []).some(x => x[0] >= day - N.KEEP && x[3] === signature) ||
				Object.entries(st.comments)
					.filter(([id]) => id !== rec.id)
					.map(([, c]) => c)
					.flatMap(c => c.r ?? [])
					.some(x => x.at >= (day - N.KEEP) * N.DAY && N.similar(x.t, answer));
			return [{ h: "dome.broadcast", t: used ? `${rec.x.title}: ${answer} ${rec.x.body[0]}` : answer, at, o: 1 }];
		}
		const me = V.xchange.arcology.handle || "Guest";
		const thread = view.residents.map(x => x[0]);
		const publicSubject = N.publicSubject(rec);
		const locals = this.people.filter(p => p[2] === publicSubject.d).map(p => p[0]);
		const stops = (setup.arcology.neighbours(publicSubject.d ?? "relay") ?? []).filter(
			id => setup.arcology.districts[id]?.bus && !setup.arcology.districts[id].hidden
		);
		const vals = {
			D: this.district(publicSubject.d),
			O: N.orgName(publicSubject.o) || "they",
			N: stops.length ? this.district(pick("stop", stops)) : "릴레이 가",
		};
		const fill = s => s.replace(/\{(\w)\}/g, (m, k) => vals[k] ?? m);
		const hash = t => Math.floor(N.seed(t) * 1e5);
		const recent = {};
		for (const [d, h, x] of st.said ?? []) if (d >= day - N.KEEP) (recent[h] ??= new Set()).add(x);
		const recentText = new Set(
			(st.said ?? [])
				.filter(x => x[0] >= day - N.KEEP)
				.map(x => x[3])
				.filter(x => x !== undefined)
		);
		const recentReplies = Object.values(st.comments)
			.flatMap(c => c.r ?? [])
			.filter(x => x.at >= (day - N.KEEP) * N.DAY)
			.map(x => x.t);
		const usedText = new Set(view.residents.map(x => x[1]));
		const usedHandle = new Set([me]);
		const usedMood = new Set();
		const out = [];
		const add = (h, t, extra) => {
			usedHandle.add(h);
			usedText.add(t);
			/* About half the resident replies address the player by handle, so they read as answers. */
			const shown = !extra?.o && r(`${h}|at`) < 0.5 ? `@${me} ${t}` : t;
			out.push(Object.assign({ h, t: shown, at: at + out.length * 1800 }, extra));
		};
		/* The first line in a seeded order that this thread and this handle haven't used. */
		const fresh = (k, list, h) =>
			list
				.map(fill)
				.map((t, i) => [t, N.seed(`${rec.id}|${k}|${i}`)])
				.sort((x, y) => x[1] - y[1])
				.map(x => x[0])
				.find(
					t =>
						!usedText.has(t) &&
						!recent[h]?.has(hash(t)) &&
						!recentText.has(hash(N.normalize(t))) &&
						![...recentReplies, ...usedText].some(old => N.similar(old, t))
				);
		const someone = (k, mood) => {
			const mix = list => [...list].sort((x, y) => N.seed(rec.id + k + x) - N.seed(rec.id + k + y));
			const profiles = {
				agree: ["loyal", "local"],
				critical: ["skeptic"],
				joke: ["joker"],
				differ: ["skeptic", "worried"],
				ask: ["worker", "local", "worried"],
			};
			const people = mix(this.people.filter(p => !mood || profiles[mood]?.includes(p[1])).map(p => p[0]));
			const order = r(k + "t") < 0.6 ? [...mix(thread.filter(h => people.includes(h))), ...people] : people;
			return order.find(h => !usedHandle.has(h)) ?? "paper.moth";
		};
		/* A resident line in a mood: this category's lines first, the shared fallback only when they're used up. */
		const resident = (k, mood) => {
			if (usedMood.has(mood)) return false;
			const h = someone(k, mood);
			const t = fresh(k, this.talk[view.cat]?.[mood] ?? [], h) ?? fresh(k + "f", this.fallback[mood] ?? [], h);
			if (!t) return false;
			usedMood.add(mood);
			add(h, t);
			return true;
		};
		const answer = k => {
			let h = someone(k);
			const facts = {
				"방문객도 이 시험에 참여할 수 있어요?": [
					rec.ph === "fixed"
						? "클리닉은 이번 차수의 지원자 모집을 중단했어요. 예전 모집 광고는 지금 참여하라는 초대가 아니에요."
						: "기사는 방문객의 자격 여부를 확인해 주지 않아요. 발표를 당신 계정에 대한 제안으로 받아들이기 전에 클리닉의 실제 서비스 공지부터 확인해요.",
				],
				"지원자들은 무엇을 시험해 보라고 요청받아요?": [
					"기사는 새 임플란트 부품을 다루고 있어요. 정확한 부품 이름도, 효과를 가늠할 만한 자세한 내용도 없어요.",
				],
				"동의서 조항부터 읽어 보겠어요.": ["저도 그럴 거예요. 동의서가 있다는 클리닉의 말은 조항을 충분히 설명한 게 아니에요."],
				"방문객도 등록소 백업을 만들 수 있어요?": [
					"방문객 기록 백업은 이용할 수 없어요. 시민 등록소는 방문객에게 공개 기록 조회만 제공하고, 그건 백업을 만들지 않아요.",
				],
				"기존 백업은 누가 열람할 수 있어요?": [
					rec.ph === "fixed"
						? "갱신 기사에 따르면 등록소가 백업을 열 수 있는 직원 수를 줄였어요. 전체 열람 명단은 공개되지 않았고요."
						: "이 기사는 기존 기록의 열람 권한에 의문을 제기해요. 열람이 허가된 사람의 전체 명단은 확인해 주지 않아요.",
				],
				"기록 조회는 백업이 아니에요.": ["맞아요. 방문객 기록 화면에도 백업은 이용할 수 없다고 분명히 적혀 있어요."],
				"내 게스트 임플란트로 새 신체 부위를 허가받을 수 있어요?": [
					"아니요. 기본 게스트 임플란트는 신원과 홀로 접근만 제공해요. 거주자의 구매 권한이나 고급 시술 예약 권한은 주지 않아요.",
				],
				"안내 데스크의 제한 사항부터 확인해 보겠어요.": [
					"그게 쓸모 있는 확인이에요. 뉴스 기사나 광고가 당신 계정의 권한을 바꿔 주지는 않아요.",
				],
				"왜 방문객을 스캔해요?": [
					"기사에 따르면 집행국이 이 장소에서 임플란트 검사를 요구했어요. 방문객 권한 등급이 전반적으로 바뀐다는 발표는 아니에요.",
				],
				"출입 규정을 설명해 줬으면 해요.": [
					"보도된 요구 사항은 임플란트 검사예요. 기사에는 출입 규정이 더 나와 있지 않으니, 가기 전에 그 장소에 확인해 보겠어요.",
				],
				"임금 분쟁은 합의될까요?": [
					rec.ph === "reopen"
						? "갱신 기사에 따르면 초과 근무 수당 지급이 합의된 뒤 작업자들이 복귀했어요."
						: "이번 갱신 기사에서는 합의가 확인되지 않았어요. 분쟁은 초과 근무 수당 문제니까, 후속 기사에서 지급 합의가 나오는지 지켜보겠어요.",
				],
				"사고는 일어나는 법이죠.": [
					rec.s === "shortage"
						? "이 기사는 배송 지연에 관한 거예요. 피할 수 있었는지는 공급 체계에 달렸는데, 갱신 기사는 그걸 밝히지 않았어요."
						: "막을 수 있는 결함도 있어요. 손쓸 방법이 없었다고 단정하기 전에 장비 점검 내용부터 설명을 듣고 싶어요.",
				],
				"쉰 날만큼 작업반에 임금을 주세요.": [
					"기사에는 쉰 교대에 대한 확정된 보상 방안이 없어요. 작업 복귀가 그 문제를 해결하는 건 아니에요.",
				],
				"고객에게는 어떤 의미인가요?": [
					rec.s === "expansion" && rec.ph === "withdrawn"
						? "예정된 개장은 취소됐어요. 기존 고객 서비스나 가격이 바뀐다는 발표는 기사에 없어요."
						: rec.s === "expansion"
						? "공간을 늘린다고 발표했지만, 가격이나 영업 시간이 바뀌는지는 기사에 안 나와요."
						: rec.s === "wages"
						? "이 분쟁은 직원 임금 공제에 관한 거예요. 고객에게 생기는 변화는 기사에 없어요."
						: rec.s === "leak"
						? "기사는 구매 기록에 관한 거예요. 고객 청구서에 영향이 있다고 확인된 건 없어요."
						: rec.s === "recall"
						? "결함 부품 한 묶음에 관한 거예요. 교체품을 사기 전에 판매자에게 당신 부품이 해당되는지 확인해요."
						: "고객 약관이 바뀐다고 확정된 내용은 기사에 없어요. 가격이 오른다고 단정하지 말고 다음 서비스 공지를 확인해 보겠어요.",
				],
				"누가 초대받았나요?": [
					"공개된 초대 명단은 본 적 없어요. 기사에도 손님 이름은 안 나와요.",
					"기사로는 비공개 초대였어요. 누구 이름이 있었는지는 저도 몰라요.",
					"기사는 모임을 묘사할 뿐, 누가 초대를 받았는지는 알려 주지 않아요.",
				],
				"사람들 사생활은 지켜 주세요.": ["사생활 얘기엔 동의해요. 도착하는 사람을 본다고 안에서 무슨 얘기가 오갔는지 알 수는 없어요."],
				"그냥 내버려 두세요.": ["비공개로 참석했다고 해서 누군가의 신원을 퍼뜨릴 이유가 되진 않아요. 기사가 실제로 확인한 내용만 얘기하겠어요."],
				"그냥 걸어가세요.": [
					rec.ph === "reopen"
						? "갱신 기사에 따르면 셔틀이 다시 그곳에 서요. 걸어갈지는 여전히 지나야 하는 거리에 달렸어요."
						: "걸어가는 것도 방법이지만 결국 중간에 그 거리들을 지나야 해요. 기사에는 확인된 안전한 우회로가 없어요.",
				],
				"좋은 밤이었나 보네요.": [
					rec.s === "noise"
						? "기사에는 소음과 바깥 인파에 대한 불만도 실려 있어요. 행사 자체뿐 아니라 그것도 고려하겠어요."
						: "계획을 세우기 전에 그 장소의 출입 방식을 확인하겠어요. 행사 기사가 입장을 보장하지는 않아요.",
				],
				"이웃들 말에도 일리가 있어요.": [
					"행사는 참석하지 않는 이웃 주민에게도 영향을 줄 수 있어요. 그분들의 우려도 들어 줄 만해요.",
				],
				"다음엔 저도 갈래요.": [
					"나서기 전에 현재 출입 규정, 특히 임플란트 검사가 있는지 확인하겠어요. 하룻밤 기사가 다음에도 입장이 된다는 보장은 아니에요.",
				],
				"그 일로 감옥 갈 사람은 아무도 없을 거예요.": [
					"이번 갱신 기사는 공표된 상업 분쟁만 다뤄요. 형사 기소나 법원 판단은 발표된 게 없으니 그 문제는 따로 보겠어요.",
				],
				"주최자가 누군지 아는 사람 있나요?": ["기사는 주최자의 공개 이름만 써요. 그 이상은 저도 몰라요."],
				"지금 사야 할까요?": [
					"댓글에서는 아무도 그걸 알려 줄 수 없어요. 기사는 게재 시점의 가격만 알려 주고, 지금 가격은 단말기에 나와요. 샀다가 되팔면 매매 차액만큼 손해예요.",
				],
				"그 발표가 진짜인가요?": [
					["announce", "deny", "denied"].includes(rec.ph)
						? "회사가 실제로 낸 성명이에요. 거래가 이루어질지는 별개 문제고, 환전 기록에 나타날 거예요."
						: rec.ph === "first"
						? "아직 발표는 없어요. 이 기사는 아무도 확인하지 못한 주장에 관한 거예요."
						: "이번 갱신 기사는 성명만이 아니라 환전 기록이나 공식 판정에 근거해요.",
				],
				"가진 건 그대로 들고 있을래요.": ["좋아요. 들고 있으면 사이퍼는 그대로고, 파운드로 환산한 가치만 시세에 따라 움직여요."],
				"얼마나 더 떨어질 수 있나요?": ["아무도 몰라요. 기사는 지금까지 일어난 일만 알려 주고, 어디서 멈출지는 말하지 않아요."],
				"거래소 기록은 누가 확인하나요?": [
					"분쟁 중인 기록은 시민 등록소가 검토해요. 유닛 환전소는 체결된 거래를 공개하지만 주문을 낸 사람까지 전부 공개하진 않아요.",
				],
				"먼저 안 사람한테는 쉬운 돈이네요.": [
					"그들이 안 게 사실이고 남들보다 먼저 팔았을 때만요. 소문 듣고 샀다가 잃는 사람도 많아요.",
				],
				"작업자들은 괜찮나요?": [
					rec.s === "press" && view.body.some(p => /two workers.*treated.*burns|노동자 두 명이 화상 치료/i.test(p))
						? "작업자 두 명이 화상 치료를 받았다고 보도됐어요. 그 뒤 의료 소식은 여기 없어서 회복 상황은 몰라요."
						: "누구의 상태도 확인된 내용이 없어요. 짐작하기보다 갱신 소식을 기다리겠어요.",
				],
				"다친 사람 있나요?": ["이 기사에서 확인된 부상자는 못 봤어요. 그 이상은 몰라요."],
				"다음 교대에는 어떤 의미인가요?": [
					"여기서는 작업이 중단됐다는 보도가 없어요. 나서기 전에 교대 감독에게 사정을 물어보겠어요.",
				],
				"누가 누구를 세울지 결정하나요?": ["기사는 사람을 어떻게 고르는지 설명하지 않아요. 저도 집행국이 그걸 답해 줬으면 해요."],
				"얼마나 오래 가나요?": ["이번 갱신 기사에는 확실한 종료일이 없어요. 계획을 세우기 전에 후속 기사를 확인하겠어요."],
				"크게 다친 사람이 없길 바라요.": ["저도요. 확인된 부상 보도는 못 봤어요."],
				"제 임플란트도 점검받아야 할까요?": [
					"클리닉에 당신 부품이 해당되는지 물어봐요. 이 댓글을 읽는 누구도 당신 임플란트에 그 문제가 있는지는 몰라요.",
				],
				"값만 맞으면 뭐든 시험해 보라고 하겠어요.": ["결정하기 전에 동의서 조항을 읽어 보겠어요. 광고가 모든 질문에 답해 주진 않아요."],
				"언제쯤 다시 열리나요?": [
					rec.ph === "reopen"
						? "이 기사에 따르면 작업이 재개됐어요. 오늘 예약 방식은 입구 공지에서 확인해요."
						: "이 기사에는 재개 시각이 확정돼 있지 않아요. 가기 전에 입구 공지를 확인하겠어요.",
				],
				"정류장이 열렸나요, 닫혔나요?": [
					rec.ph === "reopen"
						? "갱신 기사에 따르면 셔틀이 다시 그곳에 서요."
						: rec.sp === 1
						? "운영사는 열려 있다고 해요. 그쪽 주장일 뿐이라, 정류장이 운행 중인지 독자적으로 확인할 수는 없어요."
						: "이 기사는 운행 중단을 다뤄요. 나서기 전에 현재 정류장 표시부터 확인하겠어요.",
				],
				"대신 가장 가까운 정류장은 어디예요?": [
					"기사에는 확인된 도보 우회로가 없어요. 고르기 전에 노선도와 현재 정류장 공지를 확인해요.",
				],
				"누구였나요?": ["기사는 관련된 사람을 밝히지 않았어요. 누구였는지 저도 모르고, 짐작하고 싶지도 않아요."],
				"다음엔 작업자들 말을 들으세요.": ["작업자들 말을 들어야 한다는 데 동의해요. 후속 기사에서 그들의 우려에 답이 나오길 바라요."],
				"저는 그쪽 수치를 안 믿어요.": ["저도 근거 기록을 보고 싶어요. 어느 수치가 틀렸는지 확인하려면 실제 기록이 필요해요."],
				"그쪽 장부는 누가 확인하나요?": [
					rec.ph === "audit" || (rec.s === "leak" && ["outcome", "unresolved"].includes(rec.ph))
						? "이 기사에서 검토자로 지목된 곳은 시민 등록소예요. 검토 대상은 구매 서류이고, 회사의 모든 장부가 아니에요."
						: "이름이 밝혀진 검토자와 공개된 결과가 있는지 보겠어요. 회사가 자기 장부를 직접 검사하는 건 외부인의 검토를 대신할 수 없어요.",
				],
			};
			const current = rec.k === "story" ? this.families[rec.f][rec.ph].call(this, rec, this.context(rec)).body.filter(Boolean)[0] : view.body[0];
			const first = rec.h?.[0];
			let background = "";
			if (first) {
				const [ph, timestamp, n, sp, id, q] = first;
				const earlier = Object.assign({}, rec, { ph, at: timestamp, n, sp, id, q, h: [] });
				background = this.families[rec.f][ph].call(this, earlier, this.context(earlier)).body.filter(Boolean)[0];
			}
			const lines = facts[said] ?? [`Regarding “${said}”: ${current} The published account gives no further confirmation of that point.`];
			let t = fresh(k, lines, h);
			/* Exhausting one account's wording must never turn a direct question into an unrelated category reply. */
			if (!t) {
				for (const person of this.people) {
					if (usedHandle.has(person[0])) continue;
					const candidate = fresh(k, lines, person[0]);
					if (candidate) {
						h = person[0];
						t = candidate;
						break;
					}
				}
			}
			if (!t)
				t = facts[said]
					? `${fill(pick(k, lines))} ${current}${background ? ` Earlier coverage reported: ${background}` : ""}`
					: `“${said}”에 관해: ${current}${background ? ` 처음 보도된 내용: ${background}` : ""}`;
			usedMood.add(intent === "ask" ? "ask" : "agree");
			add(h, t);
			return true;
		};
		const officialSays = (h, kind, extra) => {
			const t = fresh("off" + kind, this.official[kind], h) ?? `“${view.title}” 기사의 “${said}”에 관해: ${this.official[kind][0]}`;
			add(h, t, Object.assign({ o: 1 }, extra));
		};
		const official =
			this.accounts[publicSubject.o] ?? this.accounts[{ SECURITY: "enforcement", CRIME: "enforcement", TRANSIT: "transit", BREAKING: "enforcement" }[view.cat]];

		if (intent === "watched") {
			if (["SECURITY", "BREAKING"].includes(view.cat) || !official) officialSays("island.enforcement", "refer", { n: 1 });
			else if (view.cat === "CRIME") {
				const h = pick("crime", ["static.wren", "ozone.kid", "shard77"]);
				const t = fresh(
					"crime",
					[
						"진심이라면 스태틱 룸에 뒷문이 있어. 자정 넘어서 와.",
						"게스트 칩치고 배짱 좋네. 널 만나고 싶어 할 사람이 있겠는걸.",
						"그런 말은 눈에 띄는 법이지. 눈에 띄는 걸 좋아하는 사람도 있고.",
					],
					h
				);
				if (t) add(h, t);
			} else officialSays(official, "threat", { n: 1 });
			if (r("second") < 0.6) {
				const h = someone("w2");
				const t = fresh(
					"w2",
					[
						"공개 채널에 올리기엔 용감한 글이네요.",
						"저쪽에서 이런 거 읽는 거 알죠?",
						"지우는 게 현명할 거예요.",
						"그 핸들이 소중한 무언가와 엮여 있지 않길 바라요.",
					],
					h
				);
				if (t) add(h, t);
			}
		} else if (intent === "critical") {
			answer("direct");
			const seenFn = this.seen[rec.f]?.[rec.ph];
			const seen = typeof seenFn === "function" ? seenFn(rec) : seenFn;
			const local = locals.find(h => !usedHandle.has(h));
			const opener = ["거기 근처에 살아요.", "저는 매일 그 거리에 있어요.", "오늘 아침에 거기 지나갔어요."];
			const closer = ["눈치챈 사람이 당신만은 아니에요.", "공지는 믿지 마요.", "직접 가서 봐요."];
			const lines = seen ? opener.flatMap(o => closer.map(c => `${o} ${seen} ${c}`)) : [];
			const t = rec.sp === 1 && local && fresh("loc", lines, local);
			if (t) {
				usedMood.add("critical");
				add(local, t);
			} else if (!out.length && !answer("c0")) resident("c1", "critical");
			if (official && r("off") < (rec.sp === 1 ? 0.7 : 0.35)) officialSays(official, rec.sp === 1 ? "stand" : "query");
			else if (r("susp") < 0.25) {
				const h = someone("c3");
				const s = fresh(
					"c3",
					["질문하는 사람은 하나같이 등록 정보를 요구받게 되는 게 웃기죠.", "조심해요. 그런 질문은 눈에 띄어요."],
					h
				);
				if (s) add(h, s);
			}
		} else {
			if (!answer("a0")) resident("a1", intent === "ask" ? "ask" : pick("mood", ["agree", "differ", "joke"]));
		}
		/* Every comment gets at least one reply. */
		if (!out.length) answer("guaranteed");
		return out;
	},

	/* What a visitor sees of a Cipher crisis (level from setup.arcologyFx.crisis), where no story has its own street line. */
	crisisStreet(district, level) {
		if (!level) return "";
		if (district === "exchange")
			return level >= 2
				? "사람들이 할든 트러스트 밖에 환전 광장을 가로질러 길게 줄을 서 있다. 집행관들이 입구 쪽으로 사람들을 안내하는 동안, 문 근처의 고객들은 안으로 들어가겠다고 언쟁을 벌인다."
				: "할든 트러스트 밖에 군중이 모여 있다. 사람들은 임플란트로 계속 지갑을 확인한다.";
		if (level >= 3 && ["ironworks", "commerce"].includes(district))
			return "작업자들이 일터 밖에 모여 있다. 문에 붙은 공지에는 유급 교대가 중단되었다고 적혀 있어, 오늘 그곳에서 할 수 있는 유급 일이 없다.";
		if (level >= 2 && ["market", "commerce", "neon", "relay", "flats"].includes(district))
			return "상점 진열창의 화면에 사이퍼 결제 중단이라고 떠 있다. 몇몇 상인은 형편없는 환율로 사이퍼를 물건과 맞바꿔 주겠다고 한다.";
		if (level >= 4) return "여러 무리가 거리를 따라 걸으며 문 닫힌 가게 앞에서 걸음을 멈춘다. 평소보다 집행국 경관이 적게 보인다.";
		return "";
	},

	/* What a visitor sees in a district while a story is running there. Always the truth. */
	street(e, fx) {
		const D = this.district(e.d);
		if (fx.stop) {
			const base = "셔틀 정류장의 화면에 운행 중단이라고 떠 있다.";
			return fx.smuggle ? `${base} 타이드워터 화물 표식이 달린 화물 수레들이 셔틀 승강장에 세워져 있다.` : base;
		}
		if (fx.closed) return `${setup.arcologyNews.places[fx.closed].name} 입구의 공지에 당분간 모든 작업이 취소되었다고 적혀 있다.`;
		if (fx.patrol) return `집행관들이 ${D} 일대에서 임플란트를 검사하고 있다. 평소 길모퉁이에 모여 있던 무리는 더는 보이지 않는다.`;
		if (fx.checkpoint) return "휴대용 스캐너를 든 등록소 직원들이 거리 끝에서 임플란트를 검사하고 있다.";
		if (fx.rough)
			return e.f === "sweep"
				? "집행국 작전 중에 떠났던 무리가 다시 길모퉁이로 돌아왔다."
				: "라이벌 패거리 조직원들이 길모퉁이에 모여 있다. 사람들이 지나가는 동안 무리끼리 서로를 지켜본다.";
		if (fx.smuggle) return "운반책들이 천으로 덮은 수레를 밀며 거리를 지나간다. 보안 카메라를 피해서다.";
		if (fx.scams) return "판매상들이 길가에 놓은 상자에서 값싼 교체 부품을 팔고 있다.";
		if (fx.trials) return "클립보드를 든 클리닉 직원들이 거리에서 방문객을 붙잡고 유료 시험을 권한다.";
		if (fx.crowd) return "오늘 밤 거리는 사람들로 가득하다. 지나가다 보면 사람들과 부딪힌다.";
		return "";
	},
};
