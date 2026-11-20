setup.seaRemembers = {
	access: () => V.temple_spear_mission === 2,
	exclusive() {
		return this.access() && Transformations.isFullWaterDragon();
	},
	noteMarkings() {
		if (!this.access()) return;
		const q = this.init();
		if (!q.clues.includes(0)) q.clues.push(0);
		if (this.exclusive() && q.chapter === 0) {
			q.chapter = 1;
		}
	},
	init() {
		if (!V.seaRemembers)
			V.seaRemembers = {
				chapter: 0,
				clues: [],
				route: false,
				current: 0,
				stone: 0,
				echo: 0,
				reward: null,
				complete: false,
			};
		return V.seaRemembers;
	},
	isRestored() {
		const q = V.seaRemembers;
		return !!(q && (q.restored || q.complete || q.reward));
	},
	operate(action) {
		const q = V.seaRemembers;
		if (!this.exclusive() || !q?.route || q.current !== 5 || q.stone !== 3 || q.echo !== 3 || this.isRestored()) return false;
		if (action === "vent" && !q.mechanism) q.mechanism = "vented";
		else if (action === "brace" && q.mechanism === "vented") q.mechanism = "supported";
		else if (action === "open" && q.mechanism === "supported") {
			q.restored = true;
			delete q.mechanism;
		} else {
			delete q.mechanism;
			return false;
		}
		return true;
	},
	ready(skill) {
		const q = V.seaRemembers;
		const cap = skill === "physique" ? V.physiquesize : skill === "willpower" ? V.willpowermax : 1000;
		return (
			this.exclusive() &&
			!!q &&
			!q.reward &&
			this.isRestored() &&
			q.current === 5 &&
			q.stone === 3 &&
			q.echo === 3 &&
			["physique", "athletics", "willpower"].includes(skill) &&
			V.swimmingskill >= 1000 &&
			cap > 0 &&
			V[skill] >= cap &&
			!!V.AMCTraits
		);
	},
	claim(skill) {
		if (!this.ready(skill)) return false;
		V.AMCTraits[skill] = 2;
		if (V.AMCTraitsPreInsanity) V.AMCTraitsPreInsanity[skill] = 2;
		V.seaRemembers.reward = skill;
		delete V.seaRemembers.pending;
		V.seaRemembers.chapter = Math.max(6, V.seaRemembers.chapter);
		return true;
	},
	restoreReward() {
		const skill = V.seaRemembers?.reward;
		if (["physique", "athletics", "willpower"].includes(skill) && V.AMCTraits) {
			if (V.AMCTraits[skill] !== 2) V.AMCTraits[skill] = 2;
			if (V.AMCTraitsPreInsanity) V.AMCTraitsPreInsanity[skill] = 2;
		}
	},
	objective() {
		const q = V.seaRemembers;
		if (!q || !q.chapter) return "섬의 해변과 숲을 탐험하십시오.";
		if (q.complete || q.reward)
			return q.reward
				? `바다의 통로를 되살렸습니다. 얻은 보상: 단련된 ${({ physique: "체격", athletics: "체육", willpower: "의지력" })[q.reward] || q.reward}.`
				: "바다의 통로를 되살렸습니다. 장로나 늙은 섬 주민에게 말을 걸거나, 마지막 방으로 돌아가 단련의 돌파를 시도하십시오.";
		if (this.isRestored()) return "수면으로 돌아가 만의 위험한 물살이 멎었는지 확인하십시오.";
		if (q.echo === 3) return "부서진 수중 문으로 돌아가십시오. 기억의 방에서 배운 것을 써서 문을 고치십시오.";
		if (q.stone === 3) return "기억의 방에 들어가 메아리의 시련을 완료하십시오.";
		if (q.current === 5) return "손상된 방벽을 보강해 돌의 시련을 완료하십시오.";
		if (q.route) return "발견한 수중 경로를 따라가 해류의 시련을 완료하십시오.";
		if (q.chapter >= 3)
			return "늙은 섬 주민의 지도를 보고 만을 찾으십시오. 잠수하기 전에 부서진 수중 문을 살펴보고 위험한 물살을 조사하십시오.";
		if (q.chapter >= 2) return "성 아래에 있는 늙은 섬 주민을 찾아 이곳에 살았던 전사들에 대해 물어보십시오.";
		return "장로에게 발견한 손상과 표식에 대해 알리십시오.";
	},
};
