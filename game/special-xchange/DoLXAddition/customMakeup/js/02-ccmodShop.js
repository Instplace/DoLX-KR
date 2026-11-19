const ccmShop = {
	// shop-related tools
	picker: {},

	/**
	 * @param {string} category
	 */
	newSession(category) {
		ccmUtils.ensurePickerSlots();
		// create a temporary item
		//
		const _choice =
			!!V.cosmeticsChoice &&
			setup.colours[`${category}_map`] &&
			setup.colours[`${category}_map`][V.cosmeticsChoice] &&
			setup.colours[`${category}_map`][V.cosmeticsChoice].canvasfilter?.blend
				? setup.colours[`${category}_map`][V.cosmeticsChoice].canvasfilter.blend
				: "#FFFFFF";
		ccmod.tmp = {
			category,
			choice: _choice,
			waterproof: false,
		};
	},

	buy(tmp, count = 0, apply = false) {
		const newItem = ccmUtils.itemGen(setup.colours[`${tmp.category}_map`].tmp.canvasfilter, tmp.waterproof, count);
		const type = tmp.category;

		if (apply) {
			const _tmp = clone(setup.colours[`${tmp.category}_map`].tmp.canvasfilter);
			// i have no idea why i needed to stringify. but it didn't work if i did not.
			Wikifier.wikifyEval(`<<ccmodApply ${type} ${JSON.stringify(newItem)}>>`);
			setup.colours[`${tmp.category}_map`].tmp.canvasfilter = _tmp;
		}

		ccmUtils.itemAdd(newItem, type);
	},

	/**
	 *PRESETS UI
	 *{{{
	 */
	presetBtnSave() {
		const filter = clone(setup.colours[`${ccmod.tmp.category}_map`].tmp.canvasfilter);
		const filterString = ccmUtils.filterEncode(filter);
		const name = prompt("프리셋 이름을 입력하십시오", "프리셋");

		if (name) {
			if (ccmod.userPresets[name]) {
				alert("이미 사용 중인 이름입니다.");
				return;
			}

			const duplicate = ccmUtils.presetCheckDuplicate(filterString);
			if (duplicate) {
				alert(`이미 '${duplicate}' 이름으로 저장된 프리셋입니다.`);
				return;
			}

			ccmUtils.presetAdd(name, filterString);
			Wikifier.wikifyEval("<<replace '#presets-container'>><<ccmodShopPresetBox>><</replace>>");
		}
	},

	/**
	 * @param {string} selected
	 */
	presetAutoload(selected) {
		const newFilter = ccmUtils.presetLoad(selected);
		this.syncPicker(newFilter.blend);
		this.syncBrightnessSlider(newFilter.brightness);
	},

	/**
	 * @param {string} selected
	 */
	presetBtnDelete(selected) {
		ccmUtils.presetDelete(selected);
		Wikifier.wikifyEval("<<replace '#presets-container'>><<ccmodShopPresetBox>><</replace>>");
	},
	// }}}

	// color picker
	setColorHex() {
		const hex = prompt("새 16진수 색상 코드를 입력하십시오", "#FFFFFF");
		if (!!hex && tinycolor(hex).getFormat() === "hex") {
			this.syncPicker(hex);
		} else if (hex) {
			alert("올바르지 않은 16진수 코드입니다 :(");
		}
	},

	/**
	 * @param {string} color
	 */
	syncPicker(color) {
		this.picker.color.hexString = color.toUpperCase();
		this.syncColor(color);
	},

	// throttled live-preview re-render; keeps the heavy canvas render from firing
	// on every picker / slider tick (lazily built so it works regardless of
	// script load order)
	mannequinUpdate() {
		if (!this._mannequinUpdate) {
			this._mannequinUpdate = colorUtils.throttle(() => {
				Wikifier.wikifyEval('<<ccmodMannequinUpdate $ccmod.tmp.category "custom">>');
			}, 150);
		}
		this._mannequinUpdate();
	},

	/**
	 * @param {string} color
	 */
	syncColor(color) {
		setup.colours[`${ccmod.tmp.category}_map`].tmp.canvasfilter.blend = color;
		this.mannequinUpdate();
		$("#hexString").text("").append(color.toUpperCase());
	},

	/**
	 * @param {number} brightness
	 */
	syncBrightness(brightness = 0) {
		setup.colours[`${ccmod.tmp.category}_map`].tmp.canvasfilter.brightness = brightness;
		this.mannequinUpdate();
	},

	/**
	 * @param {number} brightness
	 */
	syncBrightnessSlider(brightness = 0) {
		this.syncBrightness(brightness);
		Wikifier.wikifyEval(`<<replace #brightness-slider>><<numberslider "_ccbrightness" ${brightness} -1 1 0.1>><</replace>>`);
		$("#numberslider-input--ccbrightness").on("input change", function (e) {
			ccmShop.syncBrightness(T.ccbrightness);
		});
	},

	pickerGen(color = "FFFFFF") {
		this.picker = new iro.ColorPicker("#picker", {
			color,
			width: this.pickerAutoWidth(),
			layout: [
				{
					component: iro.ui.Box,
				},
				{
					component: iro.ui.Slider,
					options: { sliderType: "hue" },
				},
			],
		});
		this.picker.on(["color:change"], function (color) {
			ccmShop.syncColor(color.hexString);
		});
	},

	// The picker shares a grid column, so size it to the column rather than the window.
	pickerAutoWidth() {
		const available = $("#color-controls").width() || window.innerWidth;
		return Math.clamp(Math.floor(available) - 4, 120, 250);
	},
};

Object.defineProperty(window, "ccmShop", { get: () => ccmShop });
