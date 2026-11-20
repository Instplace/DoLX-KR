/* eslint-disable eqeqeq */
/* eslint-disable jsdoc/require-description-complete-sentence */
/* globals hasSexStat, sexStatNameMapper, heatRutSexStatModifier, drunkSexStatModifier */

function overlayShowHide(elementId) {
	const div = document.getElementById(elementId);
	if (div != null) {
		div.classList.toggle("hidden");
		if (elementId === "debugOverlay") {
			V.debugMenu[0] = !V.debugMenu[0];
		}
	}
	window.cacheDebugDiv();
}
window.overlayShowHide = overlayShowHide;

function overlayMenu(elementId, type) {
	if (type === "debug") {
		window.toggleClassDebug(elementId + "Button", "bg-color");
		V.debugMenu[1] = elementId;
		if (document.getElementById(elementId) != null) {
			if (V.debugMenu[2].length > 0) window.toggleClassDebug(elementId, "hideWhileSearching");
			else window.toggleClassDebug(elementId, "classicHide");
		}
		if ((elementId === "debugFavourites" || elementId === "debugAdd") && V.debugMenu[2] != null && V.debugMenu[2].length > 0) {
			V.debugMenu[2] = "";
			document.getElementById("searchEvents").value = "";
			window.researchEvents("");
		}
		if (elementId === "debugFavourites") {
			window.patchDebugMenu();
		}
	}
	window.cacheDebugDiv();
}
window.overlayMenu = overlayMenu;

// Links.disableNumberifyInVisibleElements.push("#passage-testing-room");

$(document).on(":passagerender", function (ev) {
	if (passage() === "GiveBirth") {
		$(ev.content)
			.find("[type=checkbox]")
			.on("propertychange change", function () {
				Wikifier.wikifyEval("<<resetPregButtons>>");
				Links.generateLinkNumbers(ev.content);
			});
	}
});

function ensureIsArray(x, check = false) {
	if (check) x = x != null ? x : [];
	if (Array.isArray(x)) return x;
	return [x];
}
window.ensureIsArray = ensureIsArray;

// feats related widgets
// This needs updating, it's poorly designed.
function closeFeats(id) {
	const div1 = document.getElementById("feat-" + id);
	const div2 = document.getElementById("closeFeat-" + id);
	div1.style.display = "none";
	div2.style.display = "none";
	let otherFeatDisplay;
	let elementId = id + 1;
	let newId = parseInt(div1.classList.value.replace("feat feat", ""));
	do {
		otherFeatDisplay = document.getElementById("feat-" + elementId);
		if (otherFeatDisplay) {
			if (otherFeatDisplay.style.display !== "none" && !isNaN(newId)) {
				otherFeatDisplay.removeAttribute("class");
				otherFeatDisplay.classList.add("feat");
				otherFeatDisplay.classList.add("feat" + newId);
				otherFeatDisplay.classList.add("feat-overlay");
				if (newId >= 3) {
					otherFeatDisplay.classList.add("hiddenFeat");
				}
				newId++;
			}
			elementId++;
		}
	} while (otherFeatDisplay);
}
window.closeFeats = closeFeats;

function getTimeNumber(t) {
	const time = new Date(t);
	const result = time.getTime();
	if (isNaN(result)) {
		return 999999999999999;
	}
	return result;
}
window.getTimeNumber = getTimeNumber;

function extendStats() {
	V.extendedStats = !V.extendedStats;
	const $captionDiv = $("#storyCaptionDiv");
	if ($captionDiv.length === 0) return;

	$captionDiv.toggleClass("statsExtended", V.extendedStats);
	Wikifier.wikifyEval("<<replace #stats>><<statsCaption>><</replace>>");
}
window.extendStats = extendStats;

function customColour(color, saturation, brightness, contrast, sepia) {
	return (
		// eslint-disable-next-line prettier/prettier
		"filter: hue-rotate(" + color + "deg) saturate(" + saturation + ") brightness(" + brightness + ") contrast(" + contrast + ") sepia(" + sepia + ")"
	);
}
window.customColour = customColour;

function zoom(value) {
	const slider = $("[name$='" + Util.slugify("options.zoom") + "']");
	value = Math.clamp(value || slider?.val() || 0, 50, 200);

	$("body").css("zoom", value + "%");
	const zoomScale = value / 100;
	// SVG map
	$(".zoomable").each(function () {
		const $image = $(this);
		const originalWidth = $image.data("original-width") || this.width.baseVal.value;
		const originalHeight = $image.data("original-height") || this.height.baseVal.value;

		$image
			.data({ "original-width": originalWidth, "original-height": originalHeight })
			.attr({ width: originalWidth * zoomScale, height: originalHeight * zoomScale });
	});

	if (slider.length && slider.val() != value) slider.val(value).trigger("change");

	/* The doll popup sizes itself against the zoomed layout, so refit it. No-ops unless it is open. */
	window.sizeDollOverlayCanvases?.();
}
window.zoom = zoom;

function settingsAsphyxiation() {
	const updateText = () => {
		let val = V.asphyxiaLvl;
		let text = null;
		switch (val) {
			case 0:
				text = "내 목은 건드리지 마!";
				break;
			case 1:
				text = "NPC가 당신의 목을 <span class='blue inline-colour'>움켜잡을</span> 수 있습니다. 호흡을 방해하지는 않습니다.";
				break;
			case 2:
				text = "합의된 성관계 중에 NPC가 당신의 숨을 <span class='purple inline-colour'>막으려</span> 할 수 있습니다.";
				break;
			case 3:
				text = "강제적인 성관계 중에 NPC가 당신의 <span class='red inline-colour'>목을 조르려</span> 할 수 있습니다.";
				break;
			case 4:
				text =
					"강제적인 성관계 중에 NPC가 <span class='red inline-colour'>자주</span> 당신의 <span class='red inline-colour'>목을 조르려</span> 합니다.";
				break;
			default:
				text = "오류: 잘못된 값: " + val;
				val = 0;
		}
		jQuery("#numberslider-value-asphyxialvl").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-asphyxialvl").on("input change", function (e) {
			updateText();
		});
	});
}
window.settingsAsphyxiation = settingsAsphyxiation;

function settingsCondoms() {
	const updateText = () => {
		let val = V.condomLvl;
		let text = null;
		switch (val) {
			case 0:
				text = "<span class='red inline-colour'>모두가 라텍스와 안전한 성관계에 알레르기가 있습니다.</span>";
				break;
			case 1:
				text = "<span class='green inline-colour'>당신</span>만 콘돔을 쓸 수 있습니다. NPC에게 콘돔을 건네줄 수는 있습니다.";
				break;
			case 2:
				text = "NPC는 자신과 플레이어 사이에 <span class='blue inline-colour'>임신</span>이 가능할 때만 콘돔을 가지고 있습니다.";
				break;
			case 3:
				text = "NPC는 <span class='pink inline-colour'>내키는 대로</span> 콘돔을 가지고 쓸 수 있습니다.";
				break;
			default:
				text = "오류: 잘못된 값: " + val;
				val = 0;
		}
		jQuery("#numberslider-value-condomlvl").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-condomlvl").on("input change", function (e) {
			updateText();
		});
	});
}
window.settingsCondoms = settingsCondoms;

function settingsNudeGenderAppearance() {
	const updateText = () => {
		let val = V.NudeGenderDC;
		let text = null;
		switch (val) {
			case 0:
				text = "NPC는 당신의 성별을 판단할 때 성기를 <span class='blue inline-colour'>무시</span>합니다.";
				break;
			case 1:
				text = "NPC는 당신의 성별을 판단할 때 성기를 <span class='purple inline-colour'>고려</span>합니다.";
				break;
			case 2:
				text = "NPC는 당신의 성기를 <span class='red inline-colour'>기준으로</span> 성별을 판단합니다.";
				break;
			default:
				text = "오류: 잘못된 값: " + val;
				val = 0;
		}
		$("#numberslider-value-nudegenderdc").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		jQuery("#numberslider-input-nudegenderdc")
			.on("input change", function (e) {
				updateText();
			})
			.css("width", "100%");
	});
}
window.settingsNudeGenderAppearance = settingsNudeGenderAppearance;

function settingsBodywriting() {
	const updateText = () => {
		let val = V.bodywritingLvl;
		let text = null;
		switch (val) {
			case 0:
				text = "NPC가 당신의 몸에 글을 쓰는 일은 <span class='green inline-colour'>없습니다</span>.";
				break;
			case 1:
				text = "NPC가 당신의 몸에 글을 써도 되는지 <span class='blue inline-colour'>물어볼</span> 수 있습니다.";
				break;
			case 2:
				text = "NPC가 당신의 몸에 <span class='purple inline-colour'>강제로</span> 글을 쓸 수 있습니다.";
				break;
			case 3:
				text = "NPC가 당신의 몸에 <span class='red inline-colour'>강제로</span> 글을 쓰고 <span class='red inline-colour'>문신</span>을 새길 수 있습니다.";
				break;
			default:
				text = "오류: 잘못된 값: " + val;
				val = 0;
		}
		// delete the below code when $bodywritingdisable is fully replaced by $bodywritingLvl
		V.bodywritingdisable = "f";
		if (val === 0) V.bodywritingdisable = "t";

		$("#numberslider-value-bodywritinglvl").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-bodywritinglvl").on("input change", function (e) {
			updateText();
		});
	});
}
window.settingsBodywriting = settingsBodywriting;

function settingsNamedNpcBreastSize(id, persist) {
	const breastSizes = ["nipple", "budding", "tiny", "small", "pert", "modest", "full", "large", "ample", "massive", "huge", "gigantic", "enormous"];

	const updateText = () => {
		const npc = persist ? V.per_npc[T.pNPCId] : V.NPCName[T.npcId];
		const val = npc.breastsize;

		const text = breastSizes[val];

		if (val > 0) {
			npc.breastdesc = text + " breast";
			npc.breastsdesc = text + " breasts";
		} else {
			npc.breastdesc = text;
			npc.breastsdesc = text + "s";
		}

		$("#numberslider-value-" + id).text(npc.breastsdesc);
	};

	$(() => {
		updateText();
		$("#numberslider-input-" + id).on("input change", function (e) {
			updateText();
		});
	});
}
window.settingsNamedNpcBreastSize = settingsNamedNpcBreastSize;

function settingsGenericGenders(id) {
	let slider = null;
	const updateText = () => {
		let val = null;
		let attraction = null;
		let men = null;
		let women = null;

		if (id === "beasts") {
			val = V.beastmalechance;
			slider = "beastmalechance";
		} else if (id === "NPCs") {
			val = V.malechance;
			slider = "malechance";
		} else if (id === "mlm") {
			val = V.maleChanceMale;
			slider = "malechancemale";
			attraction = "<span class='blue inline-colour'>남성에게 끌립니다</span>";
			men = "남성";
			women = "여성";
		} else if (id === "wlw") {
			val = V.maleChanceFemale;
			slider = "malechancefemale";
			attraction = "<span class='pink inline-colour'>여성에게 끌립니다</span>";
			men = "남성";
			women = "여성";
		} else if (id === "blm") {
			val = V.beastMaleChanceMale;
			slider = "beastmalechancemale";
			attraction = "<span class='blue inline-colour'>남성에게 끌립니다</span>";
			men = "수컷 짐승";
			women = "암컷 짐승";
		} else if (id === "blw") {
			val = V.beastMaleChanceFemale;
			slider = "beastmalechancefemale";
			attraction = "<span class='pink inline-colour'>여성에게 끌립니다</span>";
			men = "수컷 짐승";
			women = "암컷 짐승";
		} else {
			val = V.malevictimchance;
			slider = "malevictimchance";
		}

		let text = null;

		if (id === "mlm" || id === "wlw" || id === "blw" || id === "blm") {
			switch (val) {
				case 100:
					text = `<span class='pink inline-colour'>${women}</span>【은는】 <span class='gold inline-colour'>아무도</span>, <span class='blue inline-colour'>${men}</span>【은는】 <span class='gold inline-colour'>모두</span> ${attraction}.`;
					break;
				case 0:
					text = `<span class='pink inline-colour'>${women}</span>【은는】 <span class='gold inline-colour'>모두</span>, <span class='blue inline-colour'>${men}</span>【은는】 <span class='gold inline-colour'>아무도</span> ${attraction}.`;
					break;
				default:
					text = `<span class='gold inline-colour'>${
						100 - val
					}%</span>의 <span class='pink inline-colour'>${women}</span>【와과】 <span class='gold inline-colour'>${val}%</span>의 <span class='blue inline-colour'>${men}</span>【이가】 ${attraction}.`;
					break;
			}
		} else {
			if (val === 100) {
				text = `<span class='gold inline-colour'>모든</span> ${(({beasts:'짐승',NPCs:'NPC'})[id] || id)}【이가】 <span class='blue inline-colour'>남성</span>이 됩니다.`;
			} else if (val === 0) {
				text = `<span class='gold inline-colour'>모든</span> ${(({beasts:'짐승',NPCs:'NPC'})[id] || id)}【이가】 <span class='pink inline-colour'>여성</span>이 됩니다.`;
			} else if (val === 50) {
				text =
					(({beasts:'짐승',NPCs:'NPC'})[id] || id) +
					"" +
					"의 성비가 <span class='blue inline-colour'>남성</span>과 <span class='pink inline-colour'>여성</span>으로 <span class='gold inline-colour'>균등하게</span> 나뉩니다.";
			} else if (val > 50) {
				text = `${(({beasts:'짐승',NPCs:'NPC'})[id] || id)}의 <span class='gold inline-colour'>${val}%</span>가 <span class='blue inline-colour'>남성</span>이 됩니다.`;
			} else {
				text = `${(({beasts:'짐승',NPCs:'NPC'})[id] || id)}의 <span class='gold inline-colour'>${100 - val}%</span>가 <span class='pink inline-colour'>여성</span>이 됩니다.`;
			}
		}

		jQuery("#numberslider-value-" + slider)
			.text("")
			.append(text)
			.addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-" + slider).on("input change", function (e) {
			updateText();
		});
	});
}

window.settingsGenericGenders = settingsGenericGenders;

function settingsMonsterChance() {
	const updateText = () => {
		const val = V.monsterchance;
		let text = null;

		switch (val) {
			case 100:
				text = "짐승은 <span class='gold inline-colour'>항상</span> 수인으로 나타납니다.";
				break;
			case 0:
				text = "짐승은 환각 상태에서 허용된 경우가 아니라면 <span class='gold inline-colour'>절대</span> 수인으로 나타나지 않습니다.";
				break;
			case 50:
				text = "전체 짐승의 <span class='gold inline-colour'>절반</span>이 수인으로 대체됩니다.";
				break;
			default:
				text = `짐승의 <span class='gold inline-colour'>${val}%</span>가 수인으로 대체됩니다.`;
				break;
		}

		jQuery("#numberslider-value-monsterchance").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-monsterchance").on("input change", function (e) {
			updateText();
		});
	});
}

window.settingsMonsterChance = settingsMonsterChance;

function settingsBeastGenders(singleUpdate) {
	const updateText = () => {
		const val = T.beastmalechance;
		let text = null;
		switch (val) {
			case 100:
				if (T.beastMaleChanceSplit === "t") {
					text = "<span class='gold inline-colour'>모든</span> 짐승이 <span class='gold inline-colour'>이성</span>에게 끌립니다.";
				} else {
					text = "<span class='gold inline-colour'>모든</span> 짐승이 <span class='blue inline-colour'>수컷</span>이 됩니다.";
				}
				break;
			case 75:
				if (T.beastMaleChanceSplit === "t") {
					text = "짐승의 <span class='gold inline-colour'>75%</span>가 <span class='gold inline-colour'>이성</span>에게 끌립니다.";
				} else {
					text = "짐승의 <span class='gold inline-colour'>75%</span>가 <span class='blue inline-colour'>수컷</span>이 됩니다.";
				}
				break;
			case 50:
				if (T.beastMaleChanceSplit === "t") {
					text = "짐승의 성적 지향이 <span class='gold inline-colour'>무작위로</span> 나뉩니다.";
				} else {
					text =
						"짐승의 성비가 <span class='blue inline-colour'>수컷</span>과 <span class='pink inline-colour'>암컷</span>으로 <span class='gold inline-colour'>균등하게</span> 나뉩니다.";
				}
				break;
			case 25:
				if (T.beastMaleChanceSplit === "t") {
					text = "짐승의 <span class='gold inline-colour'>75%</span>가 <span class='gold inline-colour'>동성</span>에게 끌립니다.";
				} else {
					text = "짐승의 <span class='gold inline-colour'>75%</span>가 <span class='pink inline-colour'>암컷</span>이 됩니다.";
				}
				break;
			case 0:
				if (T.beastMaleChanceSplit === "t") {
					text = "<span class='gold inline-colour'>모든</span> 짐승이 <span class='gold inline-colour'>동성</span>에게 끌립니다.";
				} else {
					text = "<span class='gold inline-colour'>모든</span> 짐승이 <span class='pink inline-colour'>암컷</span>이 됩니다.";
				}
				break;
			default:
				if (T.beastMaleChanceSplit === "t") {
					text = "짐승의 성적 지향이 <span class='gold inline-colour'>무작위로</span> 나뉩니다.";
				} else {
					text = "<span class='gold inline-colour'>" + V.beastmalechance + "%</span>의 짐승이 <span class='blue inline-colour'>수컷</span>입니다.";
				}
				break;
		}
		jQuery("#numberslider-value--beastmalechance").text("").append(text).addClass("small-description");
	};

	if (!singleUpdate) {
		$(() => {
			updateText();
			$("#numberslider-input--beastmalechance").on("input change", function (e) {
				updateText();
			});
		});
	} else {
		updateText();
	}
}
window.settingsBeastGenders = settingsBeastGenders;

function settingsPlayerGender() {
	const updateText = () => {
		const val = V.genderidentity;
		let text = "겉모습과 달리, 당신은 스스로를 이렇게 여깁니다: ";

		if (val === 1000) text += "<span class='pink inline-colour'>팜므</span>";
		else if (val >= 875) text += "<span class='pink inline-colour'>여성</span>";
		else if (val >= 750) text += "<span class='pink inline-colour'>말괄량이</span>";
		else if (val >= 625) text += "<span class='pink inline-colour'>부치</span>";
		else if (val >= 375) text += "<span class='green inline-colour'>논바이너리</span>";
		else if (val >= 250) text += "<span class='blue inline-colour'>시시</span>";
		else if (val >= 125) text += "<span class='blue inline-colour'>트윙크</span>";
		else if (val >= 1) text += "<span class='blue inline-colour'>남성</span>";
		else text += "<span class='blue inline-colour'>마초</span>";

		jQuery("#numberslider-value-genderidentity").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-genderidentity").on("input change", function (e) {
			updateText();
		});
	});
}

window.settingsPlayerGender = settingsPlayerGender;

function settingsNpcGenders(singleUpdate) {
	const updateText = () => {
		const val = T.malechance;
		let text = null;
		switch (val) {
			case 100:
				if (T.maleChanceSplit === "t") {
					text = "NPC 전원이 <span class='gold inline-colour'>이성</span>에게 끌립니다.";
				} else {
					text = "NPC 전원이 <span class='blue inline-colour'>남성</span>이 됩니다.";
				}
				break;
			case 75:
				if (T.maleChanceSplit === "t") {
					text = "NPC의 <span class='gold inline-colour'>75%</span>가 <span class='gold inline-colour'>이성</span>에게 끌립니다.";
				} else {
					text = "NPC의 <span class='gold inline-colour'>75%</span>가 <span class='blue inline-colour'>남성</span>이 됩니다.";
				}
				break;
			case 50:
				if (T.maleChanceSplit === "t") {
					text = "NPC의 성적 지향이 <span class='gold inline-colour'>무작위로</span> 나뉩니다.";
				} else {
					text =
						"NPC의 성비가 <span class='blue inline-colour'>남성</span>과 <span class='pink inline-colour'>여성</span>으로 <span class='gold inline-colour'>균등하게</span> 나뉩니다.";
				}
				break;
			case 25:
				if (T.maleChanceSplit === "t") {
					text = "NPC의 <span class='gold inline-colour'>75%</span>가 <span class='gold inline-colour'>동성</span>에게 끌립니다.";
				} else {
					text = "NPC의 <span class='gold inline-colour'>75%</span>가 <span class='pink inline-colour'>여성</span>이 됩니다.";
				}
				break;
			case 0:
				if (T.maleChanceSplit === "t") {
					text = "NPC 전원이 <span class='gold inline-colour'>동성</span>에게 끌립니다.";
				} else {
					text = "NPC 전원이 <span class='pink inline-colour'>여성</span>이 됩니다.";
				}
				break;
			default:
				if (T.maleChanceSplit === "t") {
					text = "NPC의 성적 지향이 <span class='gold inline-colour'>무작위로</span> 나뉩니다.";
				} else {
					text = "<span class='gold inline-colour'>" + V.malechance + "%</span>의 NPC가 <span class='blue inline-colour'>남성</span>입니다.";
				}
				break;
		}
		jQuery("#numberslider-value--malechance").text("").append(text).addClass("small-description");
	};

	if (!singleUpdate) {
		$(() => {
			updateText();
			$("#numberslider-input--malechance").on("input change", function (e) {
				updateText();
			});
		});
	} else {
		updateText();
	}
}
window.settingsNpcGenders = settingsNpcGenders;

function settingsPlayerBeauty() {
	const updateText = () => {
		const val = V.beauty;
		let text = "당신을 보는 사람이라면 누구나 당신이 이런 사람이라는 데 동의할 겁니다: ";

		if (val >= (V.beautymax / 7) * 6) text += "<span class='gold inline-colour'>신성한 사람</span>";
		else if (val >= (V.beautymax / 7) * 5) text += "<span class='pink inline-colour'>황홀한 사람</span>";
		else if (val >= (V.beautymax / 7) * 4) text += "<span class='purple inline-colour'>아름다운 사람</span>";
		else if (val >= (V.beautymax / 7) * 3) text += "<span class='blue inline-colour'>매력적인 사람</span>";
		else if (val >= (V.beautymax / 7) * 2) text += "<span class='lblue inline-colour'>예쁜 사람</span>";
		else if (val >= (V.beautymax / 7) * 1) text += "<span class='teal inline-colour'>귀여운 사람</span>";
		else text += "<span class='green inline-colour'>평범한 사람</span>";

		jQuery("#numberslider-value-beauty").text("").append(text).addClass("small-description");
	};

	$(() => {
		updateText();
		$("#numberslider-input-beauty").on("input change", function (e) {
			updateText();
		});
	});
}

window.settingsPlayerBeauty = settingsPlayerBeauty;

// Checks current settings page for data attributes
// Run only when settings tab is changed (probably in "displaySettings" widget)
// data-target is the target element that needs to be clicked for the value to be updated
// data-disabledif is the conditional statement (e.g. data-disabledif="V.per_npc[T.pNPCId].gender==='f'")

// Adds event listeners to input on current page
// mainly used for options overlay
function onInputChanged(func) {
	if (!func || typeof func !== "function") return;
	$(() => {
		$("input, select").on("change", function () {
			func();
		});
	});
}
window.onInputChanged = onInputChanged;

function closeOverlay() {
	journalNotesSaveTextarea(true);
	updateOptions();
	T.buttons.reset();
	$("#customOverlay").addClass("hidden").parent().addClass("hidden");
	$.event.trigger(":oncloseoverlay", [T.currentOverlay]);
	document.getElementById("ui-bar-toggle").style.opacity = V.options.showUiBar ? "1" : "0";
	delete T.optionsEnabled;
	delete T.currentOverlay;
	delete V.tempDisable;
}
window.closeOverlay = closeOverlay;

function journalNotesReplacer(name) {
	return name.replace(/[^a-zA-Z0-9\u4e00-\u9fa5\uac00-\ud7a3\u3131-\u318e' _-]+/g, "").trim();
}
window.journalNotesReplacer = journalNotesReplacer;

/*
	Journal notes are player-written, so they should not be lost after rewinds, refreshes, or saves.
	All $journalNotes reads and writes use the helpers below.
*/

/* make sure the notes exist and that the current page is one of them */
function journalNotesInit() {
	if (!V.journalNotes || typeof V.journalNotes !== "object") V.journalNotes = { default: "" };
	if (typeof V.journalNotes.default !== "string") V.journalNotes.default = "";
	if (V.options.notesAutoSave === undefined) V.options.notesAutoSave = true;

	/* Keep the page name while editing so notes aren't accidentally saved under an undefined page. */
	["undefined", "null", ""].forEach(key => {
		if (!Object.hasOwn(V.journalNotes, key)) return;
		const orphaned = V.journalNotes[key];
		delete V.journalNotes[key];
		if (!orphaned) return;
		let name = "recovered";
		for (let i = 2; Object.hasOwn(V.journalNotes, name); i++) name = `recovered ${i}`;
		V.journalNotes[name] = orphaned;
	});

	if (!V.journalNotesPage || !Object.hasOwn(V.journalNotes, V.journalNotesPage)) V.journalNotesPage = "default";
	return V.journalNotesPage;
}
window.journalNotesInit = journalNotesInit;

let journalNotesSessionTimer = null;

/* the session snapshot is what a refreshed or restored tab loads, but rewriting it is expensive */
function journalNotesSyncSession() {
	journalNotesSessionTimer = null;
	try {
		const sessionState = State.getSessionState();
		if (!sessionState || !Array.isArray(sessionState.history)) return;
		sessionState.history.forEach(moment => {
			moment.variables.journalNotes = clone(V.journalNotes);
			moment.variables.journalNotesPage = V.journalNotesPage;
		});
		State.setSessionState(sessionState);
	} catch (ex) {
		console.warn("journalNotes: unable to update the session state", ex);
	}
}

/**
 * Push the notes out of the active moment and into everything that outlives it.
 *
 * @param {boolean} immediate update the session snapshot now instead of once typing stops
 */
function journalNotesPersist(immediate) {
	/* V is the current copy, but saves use history,
	so update older moments too to prevent changes reverting when going back. */
	State.history.forEach(moment => {
		moment.variables.journalNotes = clone(V.journalNotes);
		moment.variables.journalNotesPage = V.journalNotesPage;
	});
	if (journalNotesSessionTimer) clearTimeout(journalNotesSessionTimer);
	if (immediate) journalNotesSyncSession();
	else journalNotesSessionTimer = setTimeout(journalNotesSyncSession, 3000);
}
window.journalNotesPersist = journalNotesPersist;

/* text of a page, ready to be shown in the textarea */
function journalNotesText(page) {
	journalNotesInit();
	const stored = V.journalNotes[page];
	if (!stored) return "";
	return LZString.decompress(stored) || "";
}
window.journalNotesText = journalNotesText;

/**
 * Save the notes textarea into the page it was rendered for.
 *
 * @param {boolean} immediate save the session snapshot now, for deliberate saves
 * @returns {boolean} whether anything was saved
 */
function journalNotesSaveTextarea(immediate) {
	const element = document.getElementById("textarea--displayedtextarea");
	/* no textarea, or one left over from an overlay that has already been replaced */
	if (!element || !element.isConnected) return false;
	journalNotesInit();
	/* the page is read off the element itself,
	so a save that fires late can never write the text into whichever page happens to be open by then */
	const page = element.dataset.notePage || V.journalNotesPage;
	if (!Object.hasOwn(V.journalNotes, page)) return false;
	V.journalNotes[page] = element.value ? LZString.compress(element.value) : "";
	journalNotesPersist(immediate);
	return true;
}
window.journalNotesSaveTextarea = journalNotesSaveTextarea;

/* switch to an existing page */
function journalNotesSetPage(page) {
	journalNotesInit();
	if (Object.hasOwn(V.journalNotes, page)) V.journalNotesPage = page;
	journalNotesPersist(true);
	return V.journalNotesPage;
}
window.journalNotesSetPage = journalNotesSetPage;

/* create a page and open it, returning its name, or "" if the name was empty or taken */
function journalNotesNewPage(name) {
	journalNotesInit();
	const cleaned = journalNotesReplacer(String(name ?? ""))
		.trim()
		.slice(0, 20);
	if (!cleaned || Object.hasOwn(V.journalNotes, cleaned)) return "";
	V.journalNotes[cleaned] = "";
	V.journalNotesPage = cleaned;
	journalNotesPersist(true);
	return cleaned;
}
window.journalNotesNewPage = journalNotesNewPage;

/* delete a page, or empty it if it's the one page that always exists */
function journalNotesDeletePage(name) {
	journalNotesInit();
	if (!Object.hasOwn(V.journalNotes, name)) return false;
	if (name === "default") V.journalNotes.default = "";
	else delete V.journalNotes[name];
	if (!Object.hasOwn(V.journalNotes, V.journalNotesPage)) V.journalNotesPage = "default";
	journalNotesPersist(true);
	return true;
}
window.journalNotesDeletePage = journalNotesDeletePage;

function updatehistorycontrols() {
	// if undefined, initiate new variable based on engine config
	if (V.options.maxStates === undefined) V.options.maxStates = Config.history.maxStates;
	else Config.history.maxStates = V.options.maxStates; // update engine config

	// enable fast rng re-roll on "keypad *" for debug and testing
	if (V.debug || V.cheatsEnabled === true || V.testing) Links.disableRNGReload = false;
	else Links.disableRNGReload = true;

	// option to still record history without showing the controls, for better debugging
	if (V.options.maxStates === 1 || !V.options.historyControls || V.ironmanmode) {
		// hide nav panel when it's useless or set to not be displayed
		Config.history.controls = false;
		jQuery("#ui-bar-history").hide();
	} else if (Config.history.maxStates > 1) {
		// or unhide it otherwise, if config allows
		Config.history.controls = true;
		jQuery("#ui-bar-history").show();
	}
}
window.updatehistorycontrols = updatehistorycontrols;
DefineMacro("updatehistorycontrols", updatehistorycontrols);

/*
	Refreshes the game when exiting options menu - applying the options object after State has been restored.
	It is done this way to prevent exploits by re-rendering the same passage
*/
function updateOptions() {
	if (T.currentOverlay === "options" && T.optionsRefresh && V.passage !== "Start") {
		updatehistorycontrols();
		const optionsData = clone(V.options);
		const tmpButtons = T.buttons;
		const tmpTab = T.tab;
		const tmpKey = T.key;

		/*
			Do not force-refresh a rewound/history state.

			In SugarCube, State.length is the active past-history length and State.size is the full in-play history size.
			During normal forward play they match. If State.size is greater than State.length,
			the player is viewing a rewound/history moment with future moments still present.

			Re-rendering that moment can re-run stateful passage code after combat/NPC state has already moved on
			or been cleared.
		*/
		const viewingHistory = State.size > State.length;

		if (viewingHistory) {
			V.options = optionsData;

			console.warn("Skipped options passage refresh while viewing history state.", {
				passage: V.passage,
				statePassage: State.passage,
				stateLength: State.length,
				stateSize: State.size,
			});
		} else {
			if (!State.restore(true)) return; // don't do anything if state couldn't be restored
			V.options = optionsData;
			State.show();
		}
		// Saves serialise State.history, not the active variables; without this, saving before the next passage stores the old options.
		State.history[State.length - 1].variables.options = clone(optionsData);

		T.key = tmpKey;
		T.buttons = tmpButtons;
		if (T.key !== "options") {
			T.buttons.setActive(T.buttons.activeTab);
		}
		if (tmpTab) {
			T.tab = tmpTab;
			T.tab.setActive(T.tab.activeTab);
		}
		Weather.Observables.checkForUpdate();
	}
}
window.updateOptions = updateOptions;

$(document).on("click", "#cbtToggleMenu .cbtToggle", function (e) {
	$("#cbtToggleMenu").toggleClass("visible");
});

function elementExists(selector) {
	return document.querySelector(selector) !== null;
}
window.elementExists = elementExists;

window.getCharacterViewerDate = () => {
	const textArea = document.getElementById("characterViewerDataInput");
	textArea.value = JSON.stringify(V.characterViewer);
};

window.loadCharacterViewerDate = () => {
	const textArea = document.getElementById("characterViewerDataInput");
	let data;
	try {
		data = JSON.parse(textArea.value);
	} catch (e) {
		textArea.value = "잘못된 JSON";
	}
	const original = clone(V.characterViewer);

	if (typeof data === "object" && !Array.isArray(data) && data !== null) {
		V.characterViewer = {
			...original,
			...data.clothesEquipped,
			...data.clothesIntegrity,
			...data.bodyState,
			...data.colours,
			...data.skinColour,
			...data.controls,
		};
		State.display(V.passage);
	} else {
		textArea.value = "잘못된 불러오기 데이터";
	}
};

function updateCaptionTooltip() {
	$(document).off("mousemove.captionTooltip");
	const elementId = "#characterTooltip";
	const element = $(elementId);
	const content = $("<div>");
	const canvas = $("#img canvas");
	const fragment = document.createDocumentFragment();
	const updateTooltip = () => {
		if (V.intro) return;
		fragment.append(wikifier("clothingCaptionText"));
		content.append(fragment);
		element.tooltip({
			message: content,
			delay: 200,
			position: "cursor",
		});
	};

	let isMouseOverElement = false;

	// Workaround for trickle-through on the canvas
	// So that the contextmenu works while having tooltips in an element below it (to define the area where tooltip shows up)
	const checkMousePosition = e => {
		if (!e || typeof e.clientX !== "number" || typeof e.clientY !== "number") {
			return;
		}

		// Prevent recursion by ignoring events triggered by the tooltip itself
		if ($(e.target).is("#characterTooltip")) {
			return;
		}

		const isCurrentlyOverElement = $(document.elementsFromPoint(e.clientX, e.clientY)).is("#characterTooltip");

		// Only trigger events if the status has changed
		if (isCurrentlyOverElement && !isMouseOverElement) {
			element.trigger("mouseenter");
			canvas.css("cursor", "help");
			isMouseOverElement = true;
		} else if (!isCurrentlyOverElement && isMouseOverElement) {
			element.trigger("mouseleave");
			$(".tooltip-popup").remove();
			canvas.css("cursor", "");
			isMouseOverElement = false;
		}

		// If the mouse is currently over the element, trigger mousemove as well
		if (isCurrentlyOverElement) {
			element.trigger({
				type: "mousemove",
				clientX: e.clientX,
				clientY: e.clientY,
			});
		}
	};

	updateTooltip();
	$(document).off(":passageend", updateCaptionTooltip);
	$(document).on(":passageend", updateCaptionTooltip);
	// Add event listeners only when the mouse is over the canvas
	canvas.off(".captionTooltip").on("mouseenter.captionTooltip", () => {
		$(document).off("mousemove.captionTooltip").on("mousemove.captionTooltip", checkMousePosition);
	});

	canvas.on("mouseleave.captionTooltip", () => {
		$(document).off("mousemove.captionTooltip");
		if (isMouseOverElement) {
			// Cleanup if mouse leaves the canvas while over the tooltip element
			element.trigger("mouseleave");
			$(".tooltip-popup").remove();
			canvas.css("cursor", "");
			isMouseOverElement = false;
		}
	});
}
$(() => updateCaptionTooltip());
window.updateCaptionTooltip = updateCaptionTooltip;

function returnTimeFormat() {
	return V?.options?.dateFormat ?? "en-GB";
}
window.returnTimeFormat = returnTimeFormat;

/* Temporary until npc rework */
function sensitivityString(value) {
	if (value >= 3.5) return "민감함";
	if (value >= 2.5) return "예민함";
	if (value >= 1.5) return "반응함";
	return "보통";
}

window.sensitivityString = sensitivityString;

function moneyStatsProcess(stats) {
	const keys = [];
	Object.entries(stats).forEach(([type, value]) => {
		if (!T.moneyStatsDetailed) {
			let compressTo;
			if (type.includes("DanceTip")) {
				compressTo = "danceTips";
			} else if (type.includes("DanceJob")) {
				compressTo = "danceJobs";
			} else if (type.includes("Prostitution")) {
				compressTo = "prostitution";
			} else {
				switch (type) {
					case "libraryBooks":
					case "schoolProject":
					case "schoolCondoms":
					case "schoolStimulant":
					case "schoolPoolParty":
						compressTo = "school";
						break;
					case "bus":
						compressTo = "town";
						break;
					case "avery":
					case "bailey":
					case "baileyRent":
					case "robin":
					case "sydney":
					case "whitney":
					case "gwylan":
						compressTo = "peopleOfInterest";
						break;
					case "hairdressers":
					case "tailor":
					case "clothes":
					case "sexToys":
					case "tattoo":
					case "furniture":
					case "cosmetics":
					case "supermarket":
						compressTo = "shopping";
						break;
					case "flatsCanal":
					case "flatsCleaning":
					case "flatsHookah":
						compressTo = "flats";
						break;
					case "hotelCleaning":
					case "hotelRent":
						compressTo = "hotel";
						break;
					case "cafeWaiter":
					case "cafeChef":
					case "cafeBuns":
						compressTo = "cafe";
						break;
					case "brothelShow":
					case "brothelVendingMachine":
					case "brothelCondoms":
						compressTo = "brothel";
						break;
					case "hospitalPaternityTest":
					case "hospitalPenisReduction":
					case "hospitalPenisEnlargement":
					case "hospitalBreastReduction":
					case "hospitalBreastEnlargement":
					case "hospitalParasiteRemoval":
					case "hospitalParasitesSold":
					case "hospitalDanceInjury":
						compressTo = "hospital";
						break;
					case "pharmacyCondoms":
					case "pharmacyCream":
					case "pharmacyPills":
					case "pharmacyPregnancyTest":
					case "pharmacyBreastPump":
					case "pharmacyAfterPill":
						compressTo = "pharmacy";
						break;
					case "museumAntique":
						compressTo = "museum";
						break;
					case "pubAlcohol":
						compressTo = "pub";
						break;
					case "docksWage":
						compressTo = "docks";
						break;
					case "stripClubBartender":
					case "stripClubDancer":
						compressTo = "stripClub";
						break;
				}
			}

			if (compressTo) {
				if (!stats[compressTo]) {
					stats[compressTo] = { earned: 0, earnedCount: 0, spent: 0, spentCount: 0 };
				}
				if (value.earned) {
					stats[compressTo].earned = (stats[compressTo].earned || 0) + value.earned;
					stats[compressTo].earnedCount = (stats[compressTo].earnedCount || 0) + value.earnedCount;
					stats[compressTo].earnedTimeStamp = Math.max(0, stats[compressTo].earnedTimeStamp || 0, value.earnedTimeStamp || 0);
				}
				if (value.spent) {
					stats[compressTo].spent = (stats[compressTo].spent || 0) + value.spent;
					stats[compressTo].spentCount = (stats[compressTo].spentCount || 0) + value.spentCount;
					stats[compressTo].spentTimeStamp = Math.max(0, stats[compressTo].spentTimeStamp || 0, value.spentTimeStamp || 0);
				}
				delete stats[type];
				keys.pushUnique(compressTo);
				return;
			}
		}
		keys.pushUnique(type);
	});
	const total = { earned: 0, earnedCount: 0, spent: 0, spentCount: 0 };
	Object.values(stats).forEach(stat => {
		if (stat.earned) total.earned += stat.earned;
		if (stat.earnedCount) total.earnedCount += stat.earnedCount;
		if (stat.spent) total.spent += stat.spent;
		if (stat.spentCount) total.spentCount += stat.spentCount;

		if (stat.earnedTimeStamp) total.earnedTimeStamp = Math.max(stat.earnedTimeStamp, total.earnedTimeStamp || 0);
		if (stat.spentTimeStamp) total.spentTimeStamp = Math.max(stat.spentTimeStamp, total.spentTimeStamp || 0);
	});

	return [keys, stats, total];
}
window.moneyStatsProcess = moneyStatsProcess;

/**
 * If hasSexStat() modifiers are allowing the player to see an aditional option, return the css class for the largest individual modifier.
 * If the modifiers are not high enough to show a new option, don't return a class.
 * Passing in 0 or nothing for requiredLevel returns the classes for the largest modifier regardless of if the player is being shown an aditional option.
 *
 * Returns the sexStat Modifer CSS classes drunk-text / jitter-text and the level of the effect (drunk-1, jitter-2...)
 *
 * When text animations are turned off, this will only return drunk-text or jitter-text without the animation level.
 *
 * @param {string} input
 * @param {number} requiredLevel
 */
function getLargestSexStatModifierCssClasses(input, requiredLevel = 0) {
	const statName = sexStatNameMapper(input);
	// check if stat name is valid.
	if (statName == null) {
		Errors.report(`[getLargestSexStatModifierCssClasses]: 입력값 '${statName}'【이가】 null입니다.`, {
			Stacktrace: Utils.GetStack(),
			statName,
		});
		return "";
	}

	const drunkSexStatModifierValue = drunkSexStatModifier(V[statName]);
	const hallucinogenSexStatModifierValue = hallucinogenSexStatModifier(V[statName]);
	const heatRutSexStatModifierValue = heatRutSexStatModifier(statName);
	const innocenceSexStatModifierValue = innocenceSexStatModifier();

	// If there is a modifier and either requiredLevel is 0 or the modifiers put the player up a level of the sexStat.
	if (
		(drunkSexStatModifierValue + hallucinogenSexStatModifierValue + heatRutSexStatModifierValue > 0 || innocenceSexStatModifierValue > 0) &&
		(requiredLevel === 0 || (!hasSexStat(statName, requiredLevel, false) && hasSexStat(statName, requiredLevel, 2)))
	) {
		const modifiers = [
			{ value: drunkSexStatModifierValue, class: "drunk" },
			{ value: hallucinogenSexStatModifierValue, class: "drunk" },
			{ value: heatRutSexStatModifierValue, class: "jitter" },
			{ value: innocenceSexStatModifierValue, class: "innocence" },
		];

		// Gets the largest modifier.
		const largestModifier = modifiers.reduce((max, current) => (current.value > max.value ? current : max), modifiers[0]);

		// Gets the base class for effect.
		let modifierClasses = `${largestModifier.class}-text`;

		if (
			V.options.textAnimsAll &&
			((largestModifier.class === "jitter" && V.options.textAnimsHeat) || (largestModifier.class === "drunk" && V.options.textAnimsDrunk))
		) {
			// Sets the animation based on how large the modifier is.
			if (largestModifier.value > 20) {
				modifierClasses += ` ${largestModifier.class}-3`;
			} else if (largestModifier.value > 10) {
				modifierClasses += ` ${largestModifier.class}-2`;
			} else {
				modifierClasses += ` ${largestModifier.class}-1`;
			}

			modifierClasses += ` animation-offset-${Math.floor(Math.random() * 10)}`;
		}

		return modifierClasses;
	} else {
		return "";
	}
}
window.getLargestSexStatModifierCssClasses = getLargestSexStatModifierCssClasses;

/**
 * Used to display the drunk text, with animations if enabled, otherwise just the glow effect.
 *
 * Use "level" to set the strength of the effect (1-3). Defaults to 1.
 *
 * @param {number} level
 * @returns {string}
 */
function basicDrunkCss(level = 1) {
	switch (level) {
		case 3:
			return V.options.textAnimsAll && V.options.textAnimsDrunk ? "drunk-text drunk-3" : "drunk-text";
		case 2:
			return V.options.textAnimsAll && V.options.textAnimsDrunk ? "drunk-text drunk-2" : "drunk-text";
		case 1:
			return V.options.textAnimsAll && V.options.textAnimsDrunk ? "drunk-text drunk-1" : "drunk-text";
		default:
			return "";
	}
}
window.basicDrunkCss = basicDrunkCss;

/**
 * Used to display the jitter text, with animations if enabled, otherwise just the glow effect.
 *
 * @returns {string}
 */
function basicJitterCss() {
	return V.options.textAnimsAll && V.options.textAnimsHeat ? "jitter-text jitter-1" : "jitter-text";
}
window.basicJitterCss = basicJitterCss;

/**
 * Used to display the innocence text, with with animations if enabled, otherwise just the glow effect.
 *
 * @returns {string}
 */
function basicInnocenceCss() {
	return V.options.textAnimations ? "innocence-text innocence-1" : "innocence-text";
}
window.basicInnocenceCss = basicInnocenceCss;

/**
 * Used to display the hypnosis text, with animations if enabled, otherwise just the gradient.
 *
 * @returns {string}
 */
function basicHypnoCss() {
	return V.options.textAnimsAll && V.options.textAnimsHypno ? "hypno-text hypno" : "hypno-text";
}
window.basicHypnoCss = basicHypnoCss;

function toggleRelationCollapse(element) {
	const box = element.closest(".relation-box");
	const npcName = box.dataset.npc;
	const idx = V.collapsedRelationBoxes.indexOf(npcName);
	if (idx >= 0) {
		V.collapsedRelationBoxes.splice(idx, 1);
		box.classList.remove("is-collapsed");
	} else {
		V.collapsedRelationBoxes.push(npcName);
		box.classList.add("is-collapsed");
	}
}
window.toggleRelationCollapse = toggleRelationCollapse;
