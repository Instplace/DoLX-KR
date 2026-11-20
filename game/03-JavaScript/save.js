/* globals autismTalentLimit */

const DoLSave = ((Story, Save) => {
	"use strict";

	const DEFAULT_DETAILS = Object.freeze({
		id: Story.domId,
		autosave: null,
		slots: [null, null, null, null, null, null, null, null],
	});
	const KEY_DETAILS = "dolSaveDetails";

	// Compressed saves are indicated by {jsoncompressed:1} in their metadata
	// The '1' can act as a compression algorithm id.

	// see game/00-framework-tools/03-compression/dictionaries.js
	const COMPRESSOR_DICTIONARIES = DoLCompressorDictionaries;
	// id of the dictionary to use for saving
	const COMPRESSOR_CURRENT_DICTIONARY_ID = "v3";
	/**
	 * When saving, decompress and compare with the original.
	 * If results differ, report an error and save the uncompressed version instead.
	 */
	function shouldVerifyCompression() {
		return true;
	}

	/* Place somewhere to expose globally. */
	function isObject(obj) {
		return typeof obj === "object" && obj != null;
	}

	/* Can also call from backcomp in the future? */
	function getSaveVersion(variables) {
		if (isObject(variables)) {
			if (!variables.saveVersions) {
				return -1;
			}
			return variables.saveVersions.last();
		}
		return -2;
	}

	function marshalVersion(version) {
		return typeof version === "string"
			? version
					.replace(/[^0-9.]+/g, "")
					.split(".")
					.map(v => parseInt(v))
			: [0, 0, 0, 0];
	}

	function parseVersion(version) {
		version = marshalVersion(version);
		return version ? version[0] * 1000000 + version[1] * 10000 + version[2] * 100 + version[3] * 1 : 0;
	}

	/**
	 * The handler which the load button should call.
	 * Contains checks to determine whether the save loads or pops up a confirmation window.
	 *
	 * @param {any} slot The slot ID to get the save from. 0 to 9, or 'auto'.
	 * @param {boolean} confirm Bypass the load confirmation.
	 * @returns {void}
	 */
	function loadHandler(slot, confirm) {
		if (V.ironmanmode === true && V.passage !== "Start") {
			Wikifier.wikifyEval(`<<loadIronmanSafetyCancel ${slot}>>`);
			return;
		}
		if (V.confirmLoad === true && confirm === undefined) {
			Wikifier.wikifyEval(`<<loadConfirm ${slot}>>`);
			return;
		}
		const save = slot === "auto" ? Save.autosave.get() : Save.slots.get(slot);
		// an empty slot gives back null, which is not the same as an empty save. JavaScript treats null as an object.
		// so checking the type alone would let an empty slot through and crash - isObject rules out null
		if (!isObject(save)) {
			Errors.report("해당 슬롯에서 유효한 세이브를 찾을 수 없습니다.", {});
			return;
		}
		const currVersion = parseVersion(StartConfig.version);
		/* Assume the save->variables is valid if an object. */
		const saveVersion = parseVersion(getSaveVersion(save.state.delta[0].variables));
		if (currVersion < saveVersion) {
			Wikifier.wikifyEval(`<<loadconfirmcompat ${slot}>>`);
			return;
		}
		load(slot, save);
	}

	/**
	 * Loads the given saveobj, or the save from the given slot.
	 *
	 * @param {number|string} slot The slot ID to get the save from. 0 to 9, or 'auto'.
	 * @param {object} saveObj The save object if already possessed by the callee.
	 * @param {boolean} overrides
	 * @returns {void}
	 */
	function load(slot, saveObj, overrides) {
		const save = saveObj == null ? (slot === "auto" ? Save.autosave.get() : Save.slots.get(slot)) : saveObj;
		// the details record can be missing (storage cleared) or lack this slot's row, so default to safe empties and don't crash
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS)) ?? { autosave: null, slots: [] };
		const details = slot === "auto" ? saveDetails.autosave : saveDetails.slots[slot];
		const metadata = details?.metadata ?? {};
		/* Check if metadata for save matches the save's computed md5 hash. If it matches, the ironman save was not tampered with.
			Bypass this check if on a mobile, because they are notoriously difficult to grab saves from in the event of issues. */
		if (metadata.ironman && !Browser.isMobile.any()) {
			IronMan.update(save, metadata);
			// (if ironman mode enabled) following checks md5 signature of the save to see if the variables have been modified
			if (!IronMan.compare(metadata, save)) {
				Wikifier.wikifyEval(`<<loadIronmanCheater ${slot}>>`);
				return;
			}
		}
		const loaded = slot === "auto" ? Save.autosave.load() : Save.slots.load(slot);
		// if the load failed, stop here so ironman mode doesn't delete the player's other saves for nothing
		if (!loaded) return;
		if (V.ironmanmode) {
			// (ironman) remove all saves(except auto-save) with the same saveId than loaded save
			[0, 1, 2, 3, 4, 5, 6, 7].forEach(id => {
				const saveDetail = saveDetails.slots[id];
				if (saveDetail == null) return;
				if (saveDetail.metadata.saveId === metadata.saveId) {
					Save.slots.delete(id);
					deleteSaveDetails(id);
				}
			});
		}
	}

	function save(saveSlot, confirm, saveId, saveName) {
		if (saveId == null) {
			Wikifier.wikifyEval(`<<saveConfirm ${saveSlot}>>`);
		} else if ((V.confirmSave === true && confirm !== true) || (V.saveId !== saveId && saveId != null)) {
			Wikifier.wikifyEval(`<<saveConfirm ${saveSlot}>>`);
		} else {
			if (saveSlot != null) {
				const success = Save.slots.save(saveSlot, null, {
					saveId,
					saveName,
					ironman: V.ironmanmode,
				});
				if (success) {
					const save = Save.slots.get(saveSlot);
					// Copy save metadata (it includes the jsoncompressed indicator)
					const metadata = { ...save.metadata, saveId, saveName };
					if (V.ironmanmode) {
						Object.assign(metadata, {
							ironman: V.ironmanmode,
							signature: V.ironmanmode ? IronMan.getSignature(save) : false,
							schema: IronMan.schema,
						});
					}
					setSaveDetail(saveSlot, metadata);
					delete T.currentOverlay;
					// todo: find a better solution
					closeOverlay();
					if (V.ironmanmode === true) Engine.restart();
				}
			}
		}
	}

	function deleteSave(saveSlot, confirm) {
		if (saveSlot === "all") {
			if (confirm === undefined) {
				Wikifier.wikifyEval("<<clearSaveMenu>>");
				return;
			} else if (confirm === true) {
				Save.clear();
				deleteAllSaveDetails();
			}
		} else if (saveSlot === "auto") {
			if (V.confirmDelete === true && confirm === undefined) {
				Wikifier.wikifyEval(`<<deleteConfirm ${saveSlot}>>`);
				return;
			} else {
				Save.autosave.delete();
				deleteSaveDetails("autosave");
			}
		} else {
			if (V.confirmDelete === true && confirm === undefined) {
				Wikifier.wikifyEval(`<<deleteConfirm ${saveSlot}>>`);
				return;
			} else {
				Save.slots.delete(saveSlot);
				deleteSaveDetails(saveSlot);
			}
		}
		Wikifier.wikifyEval("<<resetSaveMenu>>");
	}

	function importSave(saveFile) {
		if (!window.FileReader) return; // Browser is not compatible

		const reader = new FileReader();

		reader.onloadend = function () {
			DeserializeGame(this.result);
		};

		reader.readAsText(saveFile[0]);
	}

	function prepareSaveDetails(forceRun) {
		const saveDetails = getSaveDetails();
		if (saveDetails == null || saveDetails.id !== Story.domId || forceRun) {
			const scSaveDetails = Save.get();
			// clone so we don't fill in the shared template and leave ghost saves
			const dolSaveDetails = clone(DEFAULT_DETAILS);
			/* Search SugarCube's autosave property, if it exists, reflect this in the save details. */
			if (scSaveDetails.autosave != null) {
				dolSaveDetails.autosave = {
					title: scSaveDetails.autosave.title,
					date: scSaveDetails.autosave.date,
					metadata: scSaveDetails.autosave.metadata,
				};
				if (dolSaveDetails.autosave.metadata === undefined) {
					dolSaveDetails.autosave.metadata = { saveName: "" };
				}
				if (dolSaveDetails.autosave.metadata.saveName === undefined) {
					dolSaveDetails.autosave.metadata.saveName = "";
				}
			}
			/* Check whether SugarCube's save slots exist and populate save details with them. */
			for (let i = 0; i < scSaveDetails.slots.length; i++) {
				if (scSaveDetails.slots[i] !== null) {
					dolSaveDetails.slots[i] = {
						title: scSaveDetails.slots[i].title,
						date: scSaveDetails.slots[i].date,
						metadata: scSaveDetails.slots[i].metadata,
					};
					if (dolSaveDetails.slots[i].metadata === undefined) {
						dolSaveDetails.slots[i].metadata = { saveName: "old save", saveId: 0 };
					}
					if (dolSaveDetails.slots[i].metadata.saveName === undefined) {
						dolSaveDetails.slots[i].metadata.saveName = "old save";
					}
				} else {
					dolSaveDetails.slots[i] = null;
				}
			}

			localStorage.setItem(KEY_DETAILS, JSON.stringify(dolSaveDetails));
			return true;
		}
		return false;
	}

	function setSaveDetail(saveSlot, metadata, story) {
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
		if (saveSlot === "autosave") {
			saveDetails.autosave = {
				id: Story.domId,
				title: Story.get(V.passage).description(),
				date: Date.now(),
				metadata,
			};
		} else {
			const slot = parseInt(saveSlot);
			saveDetails.slots[slot] = {
				id: Story.domId,
				title: Story.get(V.passage).description(),
				date: Date.now(),
				metadata,
			};
		}
		localStorage.setItem(KEY_DETAILS, JSON.stringify(saveDetails));
	}

	function getSaveDetails(saveSlot) {
		if (Object.hasOwn(localStorage, KEY_DETAILS)) {
			const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
			if (typeof saveSlot === "number") {
				if (saveDetails != null) {
					return saveDetails.slots[saveSlot];
				}
			} else {
				return saveDetails;
			}
		}
		return null;
	}

	function deleteSaveDetails(saveSlot) {
		const saveDetails = JSON.parse(localStorage.getItem(KEY_DETAILS));
		if (saveSlot === "autosave") {
			saveDetails.autosave = null;
		} else {
			const slot = parseInt(saveSlot);
			saveDetails.slots[slot] = null;
		}
		localStorage.setItem(KEY_DETAILS, JSON.stringify(saveDetails));
	}

	function deleteAllSaveDetails() {
		localStorage.setItem(KEY_DETAILS, JSON.stringify(DEFAULT_DETAILS));
	}

	function returnSaveData() {
		return Save.get();
	}

	function resetSaveMenu() {
		Wikifier.wikifyEval("<<resetSaveMenu>>");
	}

	function ironmanAutoSave() {
		const saveSlot = 8;
		const success = Save.slots.save(saveSlot, null, {
			saveId: V.saveId,
			saveName: V.saveName,
			ironman: V.ironmanmode,
		});
		if (success) {
			const save = Save.slots.get(saveSlot);
			const metadata = { saveId: V.saveId, saveName: V.saveName };
			if (V.ironmanmode) {
				Object.assign(metadata, {
					ironman: V.ironmanmode,
					signature: V.ironmanmode ? IronMan.getSignature(save) : false,
					schema: IronMan.schema,
				});
			}
			setSaveDetail(saveSlot, metadata);
		}
	}

	Macro.add("incrementautosave", {
		handler() {
			if (!V.ironmanmode) V.saveDetails.auto.count++;
		},
	});

	/**
	 * Compress a game state (not delta-encoded: {title, variables, prng, pull}) using most recent dictionary.
	 * Can throw an error.
	 *
	 * @param {object} state
	 */
	function compressState(state) {
		const dictionary = COMPRESSOR_DICTIONARIES[COMPRESSOR_CURRENT_DICTIONARY_ID];
		const compressor = new JsonCompressor(dictionary);
		const zstate = compressor.compress(state);
		zstate.dictionary = COMPRESSOR_CURRENT_DICTIONARY_ID;
		zstate.title =
				"이 세이브는 압축되어 있어 이전 버전의 Degrees of Lewdity와 호환되지 않습니다. 더 오래된 게임 빌드에서 이 세이브를 불러오려면 내보내기 기능을 사용하세요.";
		zstate.variables = {};
		if (shouldVerifyCompression()) {
			// Sanity check
			const uzstate = decompressState(zstate);
			if (JSON.stringify(state) !== JSON.stringify(uzstate)) {
					throw new Error("압축 해제 확인에 실패했습니다");
			}
		}
		return zstate;
	}

	/**
	 * Decompress the saved state using the dictionary it was compressed with.
	 * Can throw an error.
	 *
	 * @param {object} zstate
	 */
	function decompressState(zstate) {
		if (!("dictionary" in zstate)) throw new Error("불러올 수 없습니다 - 압축된 세이브에 사전 정보가 없습니다");
		const dicid = zstate.dictionary;
		if (!(dicid in COMPRESSOR_DICTIONARIES))
			throw new Error(
					"세이브 압축을 해제할 수 없습니다 - 사전 " +
					JSON.stringify(dicid) +
						"이 현재 게임 버전에서 알 수 없습니다. (구버전 게임에서 신버전 세이브를 불러오려는 것입니까?)"
			);
		const dictionary = COMPRESSOR_DICTIONARIES[dicid];
		const decompressor = new JsonDecompressor(dictionary);
		return decompressor.decompress(zstate);
	}
	function enableCompression() {
		V.compressSave = true;
	}
	function disableCompression() {
		V.compressSave = false;
	}
	function isCompressionEnabled() {
		// for now, save compressor and delta-encoder work against each other, leading to bigger saves when both are active
		// todo: make them friends?
		return V.compressSave && State.history.length === 1;
	}

	/**
	 * Compress a SaveObject (the one with metadata and delta-encoded history), if the compression is enabled.
	 * If compression fails, report and error and do nothing.
	 * This function returns nothing, it modifies the saveObj parameter.
	 *
	 * @param {object} saveObj
	 */
	function compressIfNeeded(saveObj) {
		if (!saveObj.metadata) saveObj.metadata = {};
		saveObj.metadata.jsoncompressed = 0;
		if (!isCompressionEnabled()) return;
		try {
			saveObj.state.history = saveObj.state.history.map(state => compressState(state));
			saveObj.metadata.jsoncompressed = 1;
		} catch (e) {
			DOL.Errors.report("압축할 수 없습니다 - " + e);
			console.error(e);
			// Just return, the saveObj won't be modified
		}
	}
	function looksLikeCompressedSave(state) {
		return state.compressed === 1 && Array.isArray(state.values) && typeof state.values === "object" && typeof state.dictionary === "string";
	}
	/**
	 * Decompress a SaveObject (the one with metadata and delta-encoded history), if it is compressed.
	 *
	 * @param {object} saveObj
	 */
	function decompressIfNeeded(saveObj) {
		const isCompressed = (saveObj.metadata && saveObj.metadata.jsoncompressed === 1) || looksLikeCompressedSave(saveObj.state.history[0]);
		if (!isCompressed) return;
		let dictOverride = saveObj.state.history[0].dictionary;
		saveObj.state.history = saveObj.state.history.map(state => {
			state.dictionary = dictOverride;
			if (JsonDecompressor.isCompressed(state)) {
				// decompressing with the wrong dictionary can throw or produce nonsense, treat both as a failed attempt
				const tryDecompress = () => {
					try {
						const result = decompressState(state);
						return result.variables && result.variables.saveVersions ? result : null;
					} catch {
						return null;
					}
				};
				let decompressed = tryDecompress();
				// if that failed, the dictionary might be mislabeled, so try the others until one works
				const otherDicts = Object.keys(COMPRESSOR_DICTIONARIES).filter(d => d !== dictOverride);
				for (let k = 0; k < otherDicts.length && !decompressed; k++) {
					state.dictionary = otherDicts[k];
					decompressed = tryDecompress();
					if (decompressed) dictOverride = otherDicts[k];
				}
				if (!decompressed)
					throw new Error("게임의 어떤 사전으로도 저장 파일을 압축 해제할 수 없습니다 (저장 파일 이름은 " + JSON.stringify(dictOverride) + ") 입니다.)");
				return decompressed;
			} else return state;
		});
	}

	return Object.freeze({
		save,
		load,
		delete: deleteSave,
		import: importSave,
		getSaves: returnSaveData,
		resetMenu: resetSaveMenu,
		getVersion: getSaveVersion,
		loadHandler,
		enableCompression,
		disableCompression,
		isCompressionEnabled,
		compressState,
		decompressState,
		compressIfNeeded,
		decompressIfNeeded,
		SaveDetails: Object.freeze({
			prepare: prepareSaveDetails,
			set: setSaveDetail,
			get: getSaveDetails,
			delete: deleteSaveDetails,
			deleteAll: deleteAllSaveDetails,
		}),
		IronMan: Object.freeze({
			autoSave: ironmanAutoSave,
		}),
		Utils: Object.freeze({
			parseVer: parseVersion,
		}),
	});
})(Story, Save);
window.DoLSave = DoLSave;

/* Legacy references, references to the global namespace should be avoided, and thus this is considered deprecated usage. */
window.prepareSaveDetails = DoLSave.SaveDetails.prepare;
window.setSaveDetail = DoLSave.SaveDetails.set;
window.getSaveDetails = DoLSave.SaveDetails.get;
window.deleteSaveDetails = DoLSave.SaveDetails.delete;
window.deleteAllSaveDetails = DoLSave.SaveDetails.deleteAll;
window.returnSaveDetails = DoLSave.getSaves;
window.resetSaveMenu = DoLSave.resetMenu;
window.ironmanAutoSave = DoLSave.IronMan.autoSave;
window.loadSave = DoLSave.load;
window.save = DoLSave.save;
window.deleteSave = DoLSave.delete;
window.importSave = DoLSave.import;
window.SerializeGame = Save.serialize;
window.DeserializeGame = Save.deserialize;

window.getSaveData = function () {
	const compressionWasEnabled = DoLSave.isCompressionEnabled();
	DoLSave.disableCompression();
	const input = document.getElementById("saveDataInput");
	input.value = Save.serialize();
	if (compressionWasEnabled) DoLSave.enableCompression();
};

window.loadSaveData = function () {
	const input = document.getElementById("saveDataInput");
	const result = Save.deserialize(input.value);
	if (result === null) {
		input.value = "유효하지 않은 세이브입니다.";
	}
};

window.clearTextBox = function (id) {
	document.getElementById(id).value = "";
};

window.topTextArea = function (id) {
	const textArea = document.getElementById(id);
	textArea.scroll(0, 0);
};

window.bottomTextArea = function (id) {
	const textArea = document.getElementById(id);
	textArea.scroll(0, textArea.scrollHeight);
};

window.copySavedata = function (id) {
	const saveData = document.getElementById(id);
	saveData.focus();
	saveData.select();

	try {
		document.execCommand("copy");
	} catch (err) {
		const copyTextArea = document.getElementById("CopyTextArea");
		copyTextArea.value = "복사 오류";
		console.log("복사할 수 없습니다: ", err);
	}
};

window.importSettings = function (data, type) {
	let reader;
	switch (type) {
		case "text":
			V.importString = compatibilityConversion(document.getElementById("settingsDataInput")?.value);
			Wikifier.wikifyEval('<<displaySettings "importConfirmDetails">>');
			break;
		case "file":
			reader = new FileReader();
			reader.addEventListener("load", function (e) {
				// eslint-disable-next-line no-undef
				V.importString = compatibilityConversion(e.target?.result);
				Wikifier.wikifyEval('<<displaySettings "importConfirmDetails">>');
			});
			reader.readAsBinaryString(data[0]);
			break;
		case "function":
			importSettingsData(compatibilityConversion(data));
			break;
	}
};

function skinToneSettingsFromDarkChance(darkChance) {
	const dark = Math.clamp(Math.round(darkChance), 0, 100);
	if (dark <= 0) return { skinToneMin: 0, skinToneMode: 0, skinToneMax: 0 };
	if (dark >= 100) return { skinToneMin: 70, skinToneMode: 70, skinToneMax: 70 };
	return { skinToneMin: 0, skinToneMode: dark, skinToneMax: 100 };
}
window.skinToneSettingsFromDarkChance = skinToneSettingsFromDarkChance;

function compatibilityConversion(rawData) {
	let processed;

	try {
		processed = JSON.parse(rawData);
	} catch {
		return rawData;
	}
	if (!processed || typeof processed !== "object" || Array.isArray(processed)) return rawData;
	if (processed.general === undefined && processed.starting && typeof processed.starting === "object" && !Array.isArray(processed.starting))
		processed.general = {};
	if (!processed.general || typeof processed.general !== "object" || Array.isArray(processed.general)) return rawData;
	if (processed.general.settings != null && (typeof processed.general.settings !== "object" || Array.isArray(processed.general.settings))) return rawData;

	const map = {
		alluremod: { key: "allureModifier", invert: false },
		analdisable: { key: "analEnabled", invert: true },
		analdoubledisable: { key: "analDoubleEnabled", invert: true },
		analingusdisablegiving: { key: "analingusGivingEnabled", invert: true },
		analingusdisablereceiving: { key: "analingusReceivingEnabled", invert: true },
		asphyxiaLvl: { key: "asphyxiaLevel", invert: false },
		baseNpcPregnancyChance: { key: "baseNpcPregnancyChance", invert: false },
		basePlayerPregnancyChance: { key: "basePlayerPregnancyChance", invert: false },
		beastmalechance: { key: "beastMaleChance", invert: false },
		beastMaleChanceFemale: { key: "beastMaleChanceFemale", invert: false },
		beastMaleChanceMale: { key: "beastMaleChanceMale", invert: false },
		beastMaleChanceSplit: { key: "beastMaleChanceSplit", invert: false },
		beedisable: { key: "beesEnabled", invert: true },
		bestialitydisable: { key: "bestialityEnabled", invert: true },
		blackchance: { key: "darkSkinChance", invert: false },
		bodywritingLvl: { key: "bodyWritingLevel", invert: false },
		breast_mod: { key: "breastModifier", invert: false },
		breastfeedingdisable: { key: "breastFeedingEnabled", invert: true },
		cbchance: { key: "maleNPCVaginaChance", invert: false },
		cheatdisabletoggle: { key: "cheatsEnabledToggle", invert: true },
		checkstyle: { key: "skillCheckStyle", invert: false },
		clothesPrice: { key: "clothingCostModifier", invert: false },
		clothesPriceLewd: { key: "lewdClothingCostModifier", invert: false },
		clothesPriceSchool: { key: "schoolClothingCostModifier", invert: false },
		clothesPriceUnderwear: { key: "underwearCostModifier", invert: false },
		condomChance: { key: "condomChance", invert: false },
		condomLvl: { key: "condomLevel", invert: false },
		condomUseChanceCon: { key: "condomUseChanceConsensual", invert: false },
		condomUseChanceRape: { key: "condomUseChanceRape", invert: false },
		cycledisable: { key: "fertilityCycleEnabled", invert: true },
		dgchance: { key: "femaleNPCPenisChance", invert: false },
		facesitdisable: { key: "facesitEnabled", invert: true },
		footdisable: { key: "footFetishEnabled", invert: true },
		forcedcrossdressingdisable: { key: "forcedCrossdressingEnabled", invert: true },
		furniturePriceFactor: { key: "furnitureCostModifier", invert: false },
		horsedisable: { key: "horsesEnabled", invert: true },
		humanPregnancyMonths: { key: "humanPregnancyMonths", invert: false },
		hypnosisdisable: { key: "hypnosisEnabled", invert: true },
		incompletePregnancyDisable: { key: "incompletePregnancyEnabled", invert: true },
		lurkerdisable: { key: "lurkersEnabled", invert: true },
		malechance: { key: "maleChance", invert: false },
		maleChanceFemale: { key: "maleChanceFemale", invert: false },
		maleChanceMale: { key: "maleChanceMale", invert: false },
		maleChanceSplit: { key: "maleChanceSplit", invert: false },
		malevictimchance: { key: "maleVictimChance", invert: false },
		monsterchance: { key: "monsterChance", invert: false },
		monsterhallucinations: { key: "monsterHallucinationsOnly", invert: false },
		multipleWardrobes: { key: "multipleWardrobes", invert: false },
		npcPregnancyDisable: { key: "npcPregnancyEnabled", invert: true },
		npcVirginityChance: { key: "npcVirginChanceStudent", invert: false },
		npcVirginityChanceAdult: { key: "npcVirginChanceAdult", invert: false },
		NudeGenderDC: { key: "nudeGenderPerception", invert: false },
		parasitedisable: { key: "parasitesEnabled", invert: true },
		parasitepregdisable: { key: "parasitePregnancyEnabled", invert: true },
		pbdisable: { key: "pubicHairEnabled", invert: true },
		penis_mod: { key: "penisModifier", invert: false },
		plantdisable: { key: "plantsEnabled", invert: true },
		playerPregnancyBeastDisable: { key: "playerPregnancyBeastEnabled", invert: true },
		playerPregnancyEggLayingDisable: { key: "playerPregnancyEggLayingEnabled", invert: true },
		playerPregnancyHumanDisable: { key: "playerPregnancyHumanEnabled", invert: true },
		pregnancyspeechdisable: { key: "pregnancySpeechEnabled", invert: true },
		pregnancytype: { key: "pregnancyType", invert: false },
		rentmod: { key: "rentCostModifier", invert: false },
		ruinedorgasmdisable: { key: "ruinedOrgasmEnabled", invert: true },
		slimedisable: { key: "slimesEnabled", invert: true },
		slugdisable: { key: "slugsEnabled", invert: true },
		spiderdisable: { key: "spidersEnabled", invert: true },
		statdisable: { key: "blindStatsEnabled", invert: false },
		straponchance: { key: "straponChance", invert: false },
		swarmdisable: { key: "swarmsEnabled", invert: true },
		tending_yield_factor: { key: "tendingYieldModifier", invert: false },
		tentacledisable: { key: "tentaclesEnabled", invert: true },
		toydildodisable: { key: "toyDildoEnabled", invert: true },
		toymultiplepenetration: { key: "toyMultiplePenetrationEnabled", invert: true },
		toywhipdisable: { key: "toyWhipEnabled", invert: true },
		transformdisable: { key: "transformAnimalEnabled", invert: true },
		transformdisabledivine: { key: "transformDivineEnabled", invert: true },
		vaginaldoubledisable: { key: "vaginalDoubleEnabled", invert: true },
		voredisable: { key: "voreEnabled", invert: true },
		waspdisable: { key: "waspsEnabled", invert: true },
		watersportsdisable: { key: "watersportsEnabled", invert: true },
		wolfPregnancyWeeks: { key: "wolfPregnancyWeeks", invert: false },
	};

	processed.general.settings ??= {};

	for (const legacyKey in map) {
		if (!(legacyKey in processed.general)) continue;
		const { key, invert } = map[legacyKey];
		const legacyValue = processed.general[legacyKey];

		if (typeof legacyValue === "boolean" && invert) {
			processed.general.settings[key] ??= !legacyValue;
		} else {
			processed.general.settings[key] ??= legacyValue;
		}
		delete processed.general[legacyKey];
	}

	if (!processed.pregnancyChancePercent && !processed.general.settings.beastSettings && processed.general.settings.skinToneMin === undefined) {
		const settings = processed.general.settings;
		if (settings.basePlayerPregnancyChance !== undefined) {
			settings.basePlayerPregnancyChance = legacyPregnancyChanceToPercent(settings.basePlayerPregnancyChance, 100);
		}
		if (settings.baseNpcPregnancyChance !== undefined) {
			settings.baseNpcPregnancyChance = legacyPregnancyChanceToPercent(settings.baseNpcPregnancyChance, 20);
		}
	}

	// A settings file exported before NNPC and generic pregnancy became separate toggles carries only
	// the one flag. It governed both kinds of NPC, so both inherit it.
	const incoming = processed.general.settings;
	if (incoming.darkSkinChance !== undefined && incoming.skinToneMin === undefined) {
		Object.assign(incoming, skinToneSettingsFromDarkChance(incoming.darkSkinChance));
	}
	const legacyBeastKeys = {
		beastMaleChance: "maleChance",
		beastMaleChanceMale: "maleChanceMale",
		beastMaleChanceFemale: "maleChanceFemale",
		beastMaleChanceSplit: "maleChanceSplit",
		monsterChance: "monsterChance",
		monsterHallucinationsOnly: "hallucinationsOnly",
	};
	if (Object.keys(legacyBeastKeys).some(key => incoming[key] !== undefined) || incoming.bestialityEnabled !== undefined) {
		incoming.beastSettings ??= {};
		processed.general.genericBeastSettings ??= {};
		for (const type of C.beastSettingTypes) {
			incoming.beastSettings[type] ??= {};
			for (const [oldKey, key] of Object.entries(legacyBeastKeys)) {
				if (incoming[oldKey] !== undefined) incoming.beastSettings[type][key] ??= incoming[oldKey];
			}
			if (incoming.bestialityEnabled !== undefined)
				incoming.beastSettings[type].bestiality ??= incoming.bestialityEnabled
					? "on"
					: (incoming.monsterChance ?? V.genericBeastSettings.monsterChance) > 0
					? "monsterOnly"
					: "off";
		}
		for (const oldKey of Object.keys(legacyBeastKeys)) {
			if (incoming[oldKey] !== undefined) processed.general.genericBeastSettings[oldKey] ??= incoming[oldKey];
		}
		if (incoming.bestialityEnabled !== undefined)
			processed.general.genericBeastSettings.bestiality ??= incoming.bestialityEnabled
				? "on"
				: (incoming.monsterChance ?? V.genericBeastSettings.monsterChance) > 0
				? "monsterOnly"
				: "off";
	}
	for (const beast of C.namedBeasts) {
		const old = processed.general[beast + "monster"];
		if (old === undefined) continue;
		incoming.namedBeasts ??= {};
		incoming.namedBeasts[beast] ??= {
			monsterChance: old === 2 ? 100 : old === 0 ? 0 : incoming.monsterChance ?? V.genericBeastSettings.monsterChance,
			hallucinationsOnly: old === 2 ? false : incoming.monsterHallucinationsOnly ?? V.genericBeastSettings.monsterHallucinationsOnly,
		};
	}
	if (incoming.npcPregnancyEnabled !== undefined && incoming.nnpcPregnancyEnabled === undefined) {
		incoming.nnpcPregnancyEnabled = incoming.npcPregnancyEnabled;
	}

	// A settings file exported before ear slimes became their own toggle carries only the slime flag.
	// It governed both kinds of slime, so ear slimes inherit it.
	if (incoming.slimesEnabled !== undefined && incoming.earSlimesEnabled === undefined) {
		incoming.earSlimesEnabled = incoming.slimesEnabled;
	}
	const player = processed.starting?.player;
	if (player && typeof player === "object") {
		player.skin ??= {};
		if (player.skinColour !== undefined) player.skin.color ??= player.skinColour;
		if (player.faceFreckles !== undefined) player.skin.faceFreckles ??= player.faceFreckles;
		if (player.freckles !== undefined) player.skin.faceFreckles ??= player.freckles;
		if (player.bodyFreckles !== undefined) player.skin.bodyFreckles ??= player.bodyFreckles;
	}
	if (processed.npc && typeof processed.npc === "object") {
		for (const npc of Object.values(processed.npc)) {
			if (!npc || typeof npc !== "object") continue;
			if (npc.skincolour === "white") npc.skincolour = 0;
			else if (npc.skincolour === "black") npc.skincolour = 70;
			else if (npc.skincolour === "ghost") {
				npc.skincolour = 0;
				npc.skinType = "ghost";
			}
		}
	}

	return JSON.stringify(processed);
}

/**
 * Using the incoming configuration object, replace all active variables (V | $ | State.variables)
 *
 * @param {string} data
 */
function importSettingsData(data) {
	if (data == null) {
		return;
	}
	let overrides;
	// console.log("json",JSON.parse(result));
	if (V.importString) {
		overrides = JSON.parse(V.importString);
		delete V.importString;
	} else {
		overrides = JSON.parse(data);
	}
	if (!overrides || typeof overrides !== "object" || Array.isArray(overrides)) return;
	if (V.passage === "Start" && overrides.starting != null) {
		overrides.starting = settingsConvert(false, "starting", overrides.starting);
	}
	if (overrides.general != null) {
		overrides.general = settingsConvert(false, "general", overrides.general);
	}

	if (V.passage === "Start" && overrides.starting != null) {
		const startingConfig = settingsObjects("starting");
		if (validateValue(startingConfig.facestyle, overrides.starting.facestyle)) {
			V.facestyle = overrides.starting.facestyle;
			startingConfig.facevariant = settingsObjects("starting").facevariant;
		}
		importSettingsWalk(startingConfig, overrides.starting, V);
	}

	if (overrides.general != null) {
		// correct swapped min/max values
		if (overrides.general.breastsizemin > overrides.general.breastsizemax) {
			const temp = overrides.general.breastsizemin;
			overrides.general.breastsizemin = overrides.general.breastsizemax;
			overrides.general.breastsizemax = temp;
		}
		if (overrides.general.penissizemin > overrides.general.penissizemax) {
			const temp = overrides.general.penissizemin;
			overrides.general.penissizemin = overrides.general.penissizemax;
			overrides.general.penissizemax = temp;
		}
		if (overrides.general.bottomsizemin > overrides.general.bottomsizemax) {
			const temp = overrides.general.bottomsizemin;
			overrides.general.bottomsizemin = overrides.general.bottomsizemax;
			overrides.general.bottomsizemax = temp;
		}
		const generalConfig = settingsObjects("general");
		importSettingsWalk(generalConfig, overrides.general, V);
		if (validateValue(generalConfig.options.theme, overrides.general.options?.theme)) {
			Theme.setPreference(overrides.general.options.theme);
		}
	}

	if (overrides.npc != null) {
		if ((setup.modLIRegistry || []).some(name => V.modLIUnlocks?.[name] && overrides.npc[name] && !V.NPCNameList.includes(name))) {
			Wikifier.wikifyEval("<<modLI-init>>");
		}
		const listObject = settingsObjects("npc");
		// eslint-disable-next-line no-var
		const listKey = Object.keys(listObject);
		// eslint-disable-next-line no-var
		for (let i = 0; i < V.NPCNameList.length; i++) {
			if (overrides.npc[V.NPCNameList[i]] != null) {
				const previousGender = V.NPCName[i].gender;
				const carriedGender = getActivePregnancies(V.NPCName[i].nam).length ? V.NPCName[i].gender : undefined;
				// eslint-disable-next-line no-var
				for (let j = 0; j < listKey.length; j++) {
					// Overwrite to allow for "none" default value in the start passage to allow for rng to decide
					if (V.passage === "Start" && ["pronoun", "gender", "skincolour"].includes(listKey[j]) && overrides.npc[V.NPCNameList[i]][listKey[j]] === "none") {
						V.NPCName[i][listKey[j]] = overrides.npc[V.NPCNameList[i]][listKey[j]];
					} else if (validateValue(listObject[listKey[j]], overrides.npc[V.NPCNameList[i]][listKey[j]])) {
						V.NPCName[i][listKey[j]] = overrides.npc[V.NPCNameList[i]][listKey[j]];
					}
				}
				if (carriedGender !== undefined) V.NPCName[i].gender = carriedGender;
				if (carriedGender === undefined && previousGender !== V.NPCName[i].gender && ["m", "f"].includes(V.NPCName[i].gender)) {
					const present = V.NPCName[i].type === "human" ? "clothed" : 0;
					V.NPCName[i].penis = V.NPCName[i].gender === "m" ? present : "none";
					V.NPCName[i].vagina = V.NPCName[i].gender === "f" ? present : "none";
				}
			}
		}
	}

	/* Imported talents are the player's picks now, so the snapshot taken before Insanity forced them all on is out of date. */
	if (overrides.general?.AMCTraits != null) delete V.AMCTraitsPreInsanity;
	setup.seaRemembers.restoreReward();

	/* Reject / Accepted / Preferred are imported as independent flags, so an import or a Random start can leave contradictions behind. */
	if (typeof window.identityNormalisePresentation === "function") window.identityNormalisePresentation();
}
window.importSettingsData = importSettingsData;

/**
 * @param {object} configuration
 * @param {object} value
 * @returns {boolean}
 */
function validateValue(configuration, value) {
	if (value == null) return false;
	// console.log("validateValue", keys, value);
	const keyArray = Object.keys(configuration);
	let valid = false;
	if (keyArray.length === 0) {
		valid = true;
	}
	if (keyArray.includes("min")) {
		if (typeof value === "number" && Number.isFinite(value) && configuration.min <= value && configuration.max >= value) {
			valid = true;
		}
	}
	if (keyArray.includes("decimals") && value != null) {
		/* A setting holding the wrong type is invalid, not a crash: throwing here aborted the entire export. */
		// eslint-disable-next-line eqeqeq
		if (typeof value !== "number" || value.toFixed(configuration.decimals) != value) {
			valid = false;
		}
	}
	if (keyArray.includes("bool")) {
		if (value === true || value === false) {
			valid = true;
		}
	}
	if (keyArray.includes("boolLetter")) {
		if (value === "t" || value === "f") {
			valid = true;
		}
	}
	if (keyArray.includes("strings") && value != null) {
		if (configuration.strings.includes(value)) {
			valid = true;
		}
	}
	if (keyArray.includes("number")) {
		if (typeof value === "number" && Number.isFinite(value)) {
			valid = true;
		}
	}
	return valid;
}
window.validateValue = validateValue;

/**
 * A config node is a "leaf" (a single setting descriptor) when it declares a value type.
 * Otherwise it is a container whose children are traversed recursively.
 *
 * @param {object} config
 * @returns {boolean}
 */
function isSettingLeaf(config) {
	if (config == null || typeof config !== "object") {
		return false;
	}
	return ["min", "max", "bool", "boolLetter", "strings", "number"].some(key => key in config);
}
window.isSettingLeaf = isSettingLeaf;

/**
 * Recursively copy valid setting values from a live variable tree into an export object,
 * driven by the settings schema so only known keys (never runtime state) are written.
 *
 * @param {object} config schema node
 * @param {object} source live variable node (usually V or a sub-object)
 * @param {object} output destination node
 */
function exportSettingsWalk(config, source, output) {
	if (config == null || source == null || typeof source !== "object") {
		return;
	}
	for (const key of Object.keys(config)) {
		const cfg = config[key];
		if (cfg == null) continue;
		if (isSettingLeaf(cfg)) {
			const value = source[key] ?? cfg.default;
			if (value != null && validateValue(cfg, value)) {
				output[key] = value;
			}
		} else if (source[key] != null && typeof source[key] === "object") {
			const sub = {};
			exportSettingsWalk(cfg, source[key], sub);
			if (Object.keys(sub).length > 0) {
				output[key] = sub;
			}
		}
	}
}
window.exportSettingsWalk = exportSettingsWalk;

/**
 * Recursively write valid setting values from an imported object into the live variable tree,
 * driven by the settings schema.
 *
 * @param {object} config schema node
 * @param {object} override imported node
 * @param {object} target live variable node (usually V or a sub-object)
 */
function importSettingsWalk(config, override, target) {
	if (config == null || override == null || target == null || typeof override !== "object" || typeof target !== "object") {
		return;
	}
	for (const key of Object.keys(config)) {
		const cfg = config[key];
		if (cfg == null) continue;
		if (isSettingLeaf(cfg)) {
			if (override[key] != null && validateValue(cfg, override[key])) {
				target[key] = override[key];
			}
		} else if (override[key] != null && typeof override[key] === "object") {
			target[key] ??= {};
			if (typeof target[key] === "object") importSettingsWalk(cfg, override[key], target[key]);
		}
	}
}
window.importSettingsWalk = importSettingsWalk;

/**
 * Flatten every schema leaf present in an imported data node into a display list,
 * used by the import-confirmation UI for settings groups that are nested.
 *
 * @param {object} config schema node
 * @param {object} data imported node
 * @param {Array<{name: string, value: any, valid: boolean}>} out
 * @returns {Array<{name: string, value: any, valid: boolean}>}
 */
function settingsPreviewLeaves(config, data, out) {
	out = out || [];
	if (config == null || data == null || typeof data !== "object") {
		return out;
	}
	for (const key of Object.keys(config)) {
		const cfg = config[key];
		if (cfg == null) continue;
		if (isSettingLeaf(cfg)) {
			if (data[key] !== undefined) {
				out.push({ name: cfg.displayName || key, value: data[key], valid: validateValue(cfg, data[key]) });
			}
		} else if (data[key] != null && typeof data[key] === "object") {
			settingsPreviewLeaves(cfg, data[key], out);
		}
	}
	return out;
}
window.settingsPreviewLeaves = settingsPreviewLeaves;

function exportSettings(type) {
	const output = {
		general: {},
		npc: {},
	};
	output.starting = {};
	exportSettingsWalk(settingsObjects("starting"), V, output.starting);

	exportSettingsWalk(settingsObjects("general"), V, output.general);
	output.general.options.theme = Theme.getPreference();
	output.general.modLIUnlocks = Object.fromEntries((setup.modLIRegistry || []).map(name => [name, !!V.modLIUnlocks?.[name]]));

	const listObject = settingsObjects("npc");
	const listKey = Object.keys(listObject);
	for (let i = 0; i < V.NPCNameList.length; i++) {
		// The Silver Stranger (Luchifen) is a hidden mystery NPC; never expose their name in exported settings.
		if (V.NPCNameList[i] === "Luchifen") continue;
		output.npc[V.NPCNameList[i]] = {};
		for (let j = 0; j < listKey.length; j++) {
			// Overwrite to allow for "none" default value in the start passage to allow for rng to decide
			if (V.passage === "Start" && ["pronoun", "gender", "skincolour"].includes(listKey[j]) && V.NPCName[i][listKey[j]] === "none") {
				output.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			} else if (validateValue(listObject[listKey[j]], V.NPCName[i][listKey[j]])) {
				output.npc[V.NPCNameList[i]][listKey[j]] = V.NPCName[i][listKey[j]];
			}
		}
	}

	output.starting = settingsConvert(true, "starting", output.starting);
	output.general = settingsConvert(true, "general", output.general);
	output.pregnancyChancePercent = true;

	// console.log(S);
	const result = JSON.stringify(output);
	if (type === "text") {
		const textArea = document.getElementById("settingsDataInput");
		textArea.value = result;
	} else if (type === "file") {
		const blob = new Blob([result], { type: "text/plain;charset=utf-8" });
		saveAs(blob, "DolSettingsExport.txt");
	}
}
window.exportSettings = exportSettings;

/**
 * The demeanours the character creation and mirror menus offer for the current face style, as a { "Display name": value } map.
 * Reading them from setup keeps randomisation in step with whatever face styles and modded demeanours are installed.
 *
 * @returns {object}
 */
function faceVariantsForStyle() {
	const options = setup.faceVariantOptions ?? {};
	const style = options[V.facestyle] ? V.facestyle : "default";
	const variants = options[style];
	if (Array.isArray(variants)) return Object.fromEntries(variants.map(v => [v.toUpperFirst(), v]));
	return variants ?? { Gentle: "default" };
}

/**
 * Empty "Modded" demeanour slots are offered so art packs can fill them, but rolling one at random would leave the face blank.
 *
 * @param {string} variant
 * @returns {boolean}
 */
function faceVariantHasArt(variant) {
	const slot = /^modded(\d+)$/.exec(variant);
	return !slot || Number(slot[1]) <= (setup.moddedFaceVariantsWithArt ?? 0);
}

function settingsObjects(type) {
	let result;
	/* boolLetter type also requires the bool type aswell */
	switch (type) {
		case "starting":
			result = {
				facestyle: { strings: Object.values(setup.faceStyleOptions), displayName: "얼굴 형태:" },
				beauty: { min: 0, max: 10000, decimals: 0, displayName: "미모:" },
				bodysize: {
					min: -1,
					max: 4,
					decimals: 1,
					randomNumbers: [-1, 0, 1, 2, 2.5, 3, 4],
					displayName: "체격:",
					textMap: { "-1": "초소형", 0: "매우 작음", 1: "작음", 2: "보통", 2.5: "장신", 3: "큼", 4: "거대" },
					randomize: "characterAppearance",
				},
				facevariant: {
					strings: Object.values(faceVariantsForStyle()),
					randomStrings: Object.values(faceVariantsForStyle()).filter(faceVariantHasArt),
					displayName: "인상:",
					textMap: Object.fromEntries(Object.entries(faceVariantsForStyle()).map(([name, value]) => [value, name])),
					randomize: "characterAppearance",
				},
				breastsensitivity: {
					min: 1,
					max: 4,
					displayName: "가슴 민감도:",
					decimals: 0,
					textMap: { 1: "보통", 2: "민감함", 3: "매우 민감함", 4: "극도로 민감함" },
					randomize: "characterTrait",
				},
				genitalsensitivity: {
					min: 1,
					max: 4,
					displayName: "생식기 민감도:",
					decimals: 0,
					textMap: { 1: "보통", 2: "민감함", 3: "매우 민감함", 4: "극도로 민감함" },
					randomize: "characterTrait",
				},
				mouthsensitivity: {
					min: 1,
					max: 4,
					decimals: 0,
					displayName: "입 민감도:",
					textMap: { 1: "보통", 2: "민감함", 3: "매우 민감함", 4: "극도로 민감함" },
					randomize: "characterTrait",
				},
				bottomsensitivity: {
					min: 1,
					max: 4,
					decimals: 0,
					displayName: "엉덩이 민감도:",
					textMap: { 1: "보통", 2: "민감함", 3: "매우 민감함", 4: "극도로 민감함" },
					randomize: "characterTrait",
				},
				drunkSensitivity: {
					min: 0.5,
					max: 1.5,
					decimals: 1,
					displayName: "주량:",
					textMap: { 0.5: "주당", 1: "보통", 1.5: "약한 편" },
					randomize: "characterTrait",
				},
				eyeselect: {
					strings: [
						"purple",
						"dark blue",
						"light blue",
						"amber",
						"hazel",
						"brown",
						"green",
						"light green",
						"lime green",
						"red",
						"pink",
						"black",
						"grey",
						"light grey",
						"random",
					],
					randomize: "characterAppearance",
					displayName: "타고난 눈 색:",
				},
				hairselect: {
					strings: setup.colours.hair.filter(c => c.natural || c.dye).map(c => c.variable),
					displayName: "타고난 머리 색:",
					randomize: "characterAppearance",
				},
				hairlength: {
					min: 0,
					max: 900,
					decimals: 0,
					randomNumbers: [0, 200, 400, 600, 700, 900],
					displayName: "머리 길이:",
					randomize: "characterAppearance",
				},
				awareselect: {
					strings: ["innocent", "knowledgeable"],
					displayName: "성지식:",
					randomize: "characterTrait",
				},
				background: {
					nerd: { bool: true, displayName: "범생이 배경:" },
					athlete: { bool: true, displayName: "운동선수 배경:" },
					delinquent: { bool: true, displayName: "불량배 배경:" },
					promiscuous: { bool: true, displayName: "난잡함 배경:" },
					exhibitionist: { bool: true, displayName: "노출증 배경:" },
					deviant: { bool: true, displayName: "일탈자 배경:" },
					crossdresser: { bool: true, displayName: "크로스드레서 배경:" },
					genderAnxious: { bool: true, displayName: "성별 불안 배경:" },
					transgender: { bool: true, displayName: "트랜스젠더 배경:" },
					lustful: { bool: true, displayName: "호색한 배경:" },
					plantlover: { bool: true, displayName: "나무성애자 배경:" },
					insanity: { bool: true, displayName: "광기 배경:" },
					autism: { bool: true, displayName: "자폐 스펙트럼 특성:" },
					detached: { bool: true, displayName: "무덤덤함 배경:" },
				},
				startingseason: {
					strings: ["spring", "summer", "autumn", "winter", "random"],
					displayName: "시작 계절:",
				},
				gamemode: { strings: ["normal", "soft", "hard"], displayName: "게임 모드:" },
				ironmanmode: { bool: false, displayName: "철인 모드:" },
				player: {
					gender: {
						strings: ["m", "f"],
						displayName: "성별:",
						textMap: { m: "남성", f: "여성" },
						randomize: "characterAppearance",
					},
					sex: {
						strings: ["m", "f"],
						displayName: "생식기:",
						textMap: { m: "자지", f: "보지" },
						randomize: "characterAppearance",
					},
					gender_body: {
						strings: ["m", "f", "a"],
						displayName: "신체 유형:",
						textMap: { m: "남성적", f: "여성적", a: "중성적" },
					},
					bodyshape: {
						strings: ["classic", "slender", "andro", "curvy", "soft"],
						textMap: { classic: "평범한", slender: "슬림한", andro: "중성적", curvy: "잘록한", soft: "푹신한" },
						displayName: "체형:",
						randomize: "characterAppearance",
					},
					skin: {
						color: {
							strings: [
								"light",
								"medium",
								"dark",
								"gyaru",
								"rlight",
								"rmedium",
								"rdark",
								"rgyaru",
								"ylight",
								"ymedium",
								"ydark",
								"ygyaru",
								"glight",
								"gmedium",
								"gdark",
								"ggyaru",
								"blight",
								"bmedium",
								"bdark",
								"bgyaru",
							],
							randomize: "characterAppearance",
							displayName: "피부색:",
						},
					},
					ballsExist: { bool: true, displayName: "고환:", textMap: { true: "있음", false: "없음" } },
					freckles: {
						bool: true,
						displayName: "주근깨:",
						textMap: { true: "있음", false: "없음" },
						strings: ["random"],
						randomize: "characterAppearance",
					},
					breastsize: {
						min: 0,
						max: 12,
						decimals: 0,
						displayName: "가슴 크기:",
						textMap: {
							0: "납작한",
							1: "아주 작은",
							2: "작은",
							3: "봉긋한",
							4: "볼륨있는",
							5: "탱탱한",
							6: "풍만한",
							7: "큰",
							8: "커다란",
							9: "큼지막한",
							10: "거대한",
							11: "엄청난",
							12: "어마어마한",
						},
						randomize: "characterAppearance",
					},
					penissize: {
						min: 0,
						max: 6,
						decimals: 0,
						displayName: "자지 크기:",
						textMap: { 0: "극소형", 1: "초소형", 2: "매우 작음", 3: "작음", 4: "보통", 5: "큼", 6: "엄청남" },
						randomize: "characterAppearance",
					},
					bottomsize: {
						min: 0,
						max: 8,
						decimals: 0,
						displayName: "엉덩이 크기:",
						textMap: {
							0: "납작한",
							1: "아담한",
							2: "둥근",
							3: "푹신한",
							4: "부드러운",
							5: "둥근",
							6: "통통한",
							7: "큰",
							8: "거대한",
						},
						randomize: "characterAppearance",
					},
				},
			};
			break;
		case "general":
			result = {
				modLIUnlocks: Object.fromEntries((setup.modLIRegistry || []).map(name => [name, { bool: true, displayName: `${name} 활성화:` }])),
				enemystatstyle: { strings: ["full", "default"], randomize: "gameplay", displayName: "적 능력치 표시:" },
				postCombatStats: { min: 0, max: 1, decimals: 0, displayName: "조우 후 요약:" },
				ModExclusiveLIEnabled: { min: 0, max: 1, decimals: 0, displayName: "모드 전용 연애 대상:" },
				disableAutoSelect: { bool: true, displayName: "설정 입력칸 자동 선택 비활성화:" },
				realisticTransparency: { min: 0, max: 1, decimals: 0, displayName: "현실적인 의류 투명도:" },
				preyTrait: { min: 0, max: 1, decimals: 0, displayName: "먹잇감 특성:" },
				silkyTrait: { min: 0, max: 1, decimals: 0, displayName: "실크 특성:" },
				wardrobeMult: { min: 1, max: 20, decimals: 0, displayName: "옷장 수용량 배율:" },
				bicycle: {
					persistentLocation: { bool: true, displayName: "자전거 위치 유지:" },
					theftEnabled: { bool: true, displayName: "자전거 보안:" },
				},
				depositMax: { min: 0, max: 12, decimals: 0, displayName: "예금 최대 주 수:" },
				depositWithdrawalFee: { min: 0, max: 100, decimals: 0, displayName: "예금 인출 수수료 (%):" },
				parasiteCapMult: { min: 1, max: 10, decimals: 0, displayName: "기생충 탱크·헛간 수용량 배율:" },
				tirednessMaxScalingToggle: { min: 0, max: 1, decimals: 0, displayName: "피로도 최대치 스케일링:" },
				stressMaxScalingToggle: { min: 0, max: 1, decimals: 0, displayName: "스트레스 최대치 스케일링:" },
				athleticsFitnessToggle: { min: 0, max: 1, decimals: 0, displayName: "체육 체력:" },
				fatigueSkillPenaltyToggle: { min: 0, max: 1, decimals: 0, displayName: "피로 스킬 페널티:" },
				fatigueSkillPenaltyMax: { min: 0, max: 100, decimals: 0, displayName: "피로 스킬 페널티 최대치 (%):" },
				mathsTraitBuffs: {
					antiques: { min: 0, max: 1, decimals: 0, displayName: "골동품 가격 보너스:" },
					stolen: { min: 0, max: 1, decimals: 0, displayName: "장물 가격 보너스:" },
					market: { min: 0, max: 1, decimals: 0, displayName: "시장 가판대 가격 보너스:" },
					aphrodisiacPhials: { min: 0, max: 1, decimals: 0, displayName: "최음제 약병 가격 보너스:" },
				},
				historyTraitBuffs: {
					improvedChances: { min: 0, max: 1, decimals: 0, displayName: "골동품 확률 버프:" },
				},
				DoLPTFBuffs: { min: 0, max: 1, decimals: 0, displayName: "동물 변신 버프/너프:" },
				DoLPTFTempTolerance: { min: 0, max: 1, decimals: 0, displayName: "동물 변신 온도 내성:" },
				substanceRebalance: { min: 0, max: 1, decimals: 0, displayName: "기본 게임 약물 재조정:" },
				dancingRebalance: { min: 0, max: 1, decimals: 0, displayName: "춤 재조정:" },
				danceSkillDecay: { min: 0, max: 1, decimals: 0, displayName: "춤 스킬 유지:" },
				foodSpoilage: { min: 0, max: 1, decimals: 0, displayName: "음식 부패:" },
				produce_yield_factor: { min: 10, max: 200, decimals: 0, displayName: "수확량:" },
				combatStressGain: { min: 25, max: 150, decimals: 0, displayName: "전투 스트레스 증가:" },
				easyHousekeeping: { min: 0, max: 1, decimals: 0, displayName: "쉬운 가사:" },
				statGainMult: { min: 10, max: 1000, decimals: 0, displayName: "능력치 상승 배율:" },
				stressBeauty: { min: 0, max: 1, decimals: 0, displayName: "낮은 스트레스 미모 상승:" },
				beautyMult: { min: 1, max: 10, decimals: 0, displayName: "일일 미모 상승:" },
				NNPCMultiOrgasmToggle: { min: 0, max: 1, decimals: 0, displayName: "네임드 NPC 다중 오르가슴:" },
				nnpcHealthMult: { min: 1, max: 1000000, decimals: 0, displayName: "네임드 NPC 최대 체력 배율 (%):" },
				nnpcArousalMult: { min: 1, max: 1000000, decimals: 0, displayName: "네임드 NPC 최대 흥분 배율 (%):" },
				npcHealthMult: { min: 1, max: 1000000, decimals: 0, displayName: "NPC 최대 체력 배율 (%):" },
				npcArousalMult: { min: 1, max: 1000000, decimals: 0, displayName: "NPC 최대 흥분 배율 (%):" },
				npcStealMoneyToggle: { min: 0, max: 1, decimals: 0, displayName: "NPC의 금품 갈취:" },
				npcStealMoneyRandomToggle: { min: 0, max: 1, decimals: 0, displayName: "갈취 비율 무작위:" },
				npcStealMoneyPercentage: { min: 1, max: 100, decimals: 0, displayName: "고정 현금 도난 (%):" },
				npcStealMoneyMin: { min: 1, max: 100, decimals: 0, displayName: "무작위 현금 도난 최소 (%):" },
				npcStealMoneyMax: { min: 1, max: 100, decimals: 0, displayName: "무작위 현금 도난 최대 (%):" },
				npcStealCardChance: { min: 0, max: 100, decimals: 0, displayName: "강도당할 때 카드 도난 확률 (%):" },
				npcStealCardWeeklyLimit: { min: 0, max: 1000, decimals: 0, displayName: "도난 카드 주간 한도 (£):" },
				npcDescGenType: { strings: ["vanilla", "randomized"], displayName: "NPC 묘사 생성:" },
				npcDescDemonDisable: { min: 0, max: 1, decimals: 0, displayName: "악마 묘사 비활성화:" },
				npcBreastGenType: { strings: ["vanilla", "randomized"], displayName: "NPC 가슴 생성:" },
				npcPenisGenType: { strings: ["vanilla", "randomized"], displayName: "NPC 자지 생성:" },
				beastMultiOrgasmToggle: { min: 0, max: 1, decimals: 0, displayName: "짐승 다중 오르가슴:" },
				beastGroupFight: { min: 0, max: 1, decimals: 0, displayName: "짐승 단체:" },
				beastHealthMult: { min: 1, max: 1000000, decimals: 0, displayName: "짐승 최대 체력 배율 (%):" },
				beastArousalMult: { min: 1, max: 1000000, decimals: 0, displayName: "짐승 최대 흥분 배율 (%):" },
				tentacleHealthMult: { min: 1, max: 1000000, decimals: 0, displayName: "촉수 최대 체력 배율 (%):" },
				struggleHealthMult: { min: 1, max: 1000000, decimals: 0, displayName: "발버둥 최대 체력 배율 (%):" },
				combatExtended: {
					standingFights: { min: 0, max: 1, decimals: 0, displayName: "스탠딩 전투:" },
					standingFightsType: { strings: ["normal", "hostile"], displayName: "스탠딩 전투 유형:" },
					reverseRape: { min: 0, max: 1, decimals: 0, displayName: "역강간:" },
					passiveDodging: { min: 0, max: 1, decimals: 0, displayName: "수동 회피:" },
					activeDodging: { min: 0, max: 1, decimals: 0, displayName: "능동 회피:" },
					uncappedDodgeChance: { min: 0, max: 1, decimals: 0, displayName: "회피 확률 상한 해제:" },
					dodgeChanceCap: { min: 0, max: 100, decimals: 0, displayName: "회피 확률 상한:" },
					enemyDamageMult: { min: 25, max: 300, decimals: 0, displayName: "적 피해 배율 (%):", randomize: "encounter" },
					blocking: { min: 0, max: 1, decimals: 0, displayName: "방어:" },
					countering: { min: 0, max: 1, decimals: 0, displayName: "반격:" },
					feinting: { min: 0, max: 1, decimals: 0, displayName: "페인트 동작:" },
					hookpunching: { min: 0, max: 1, decimals: 0, displayName: "훅 펀치:" },
					brawlingToggle: { min: 0, max: 1, decimals: 0, displayName: "난투:" },
					footworkToggle: { min: 0, max: 1, decimals: 0, displayName: "풋워크:" },
					strikingToggle: { min: 0, max: 1, decimals: 0, displayName: "타격:" },
					kickingToggle: { min: 0, max: 1, decimals: 0, displayName: "발차기:" },
					enemyPassiveDodging: { min: 0, max: 1, decimals: 0, displayName: "적의 수동 회피:" },
					enemyActiveDodging: { min: 0, max: 1, decimals: 0, displayName: "적의 능동 회피:" },
					enemyBlocking: { min: 0, max: 1, decimals: 0, displayName: "적의 공격 막기:" },
					enemyCountering: { min: 0, max: 1, decimals: 0, displayName: "적의 반격:" },
					enemyFeinting: { min: 0, max: 1, decimals: 0, displayName: "적의 페인트 공격:" },
					enemyBaseDodgeChance: { min: 0, max: 1, decimals: 0, displayName: "적의 기본 회피 확률:" },
					enemyBaseDodgeChanceMult: { number: true, displayName: "기본 회피 확률 레벨 스케일링 (%):" },
					enemyMartialArts: { min: 0, max: 1, decimals: 0, displayName: "적의 무술:" },
					enemyMartialArtsScaling: { strings: ["random", "level", "both"], displayName: "적 무술 스케일링:" },
					enemyMartialArtsLevelScalingMult: { number: true, displayName: "무술 레벨 스케일링:" },
					enemyMartialArtsBadass: { min: 0, max: 1, decimals: 0, displayName: "적의 무술 강자 모드:" },
					enemyLevelDayScaling: { min: 0, max: 1, decimals: 0, displayName: "적 일수 레벨 스케일링:" },
					enemyLevelDayScalingMult: { min: 1, max: 1000000, decimals: 1, displayName: "적 일수 레벨 버프 스케일링 (레벨):" },
					enemyHealthDayScaling: { min: 0, max: 1, decimals: 0, displayName: "적 일수 체력 스케일링:" },
					enemyHealthDayScalingMult: { min: 1, max: 1000000, decimals: 1, displayName: "적 일수 체력 비율 버프 스케일링 (%):" },
					enemyDayScaling: { min: 1, max: 1000000, decimals: 0, displayName: "적 일수 스케일링 간격 (일):" },
					enemyInfiniteDayScaling: { min: 0, max: 1, decimals: 0, displayName: "적 일수 무한 버프:" },
					enemyDayScalingLimit: { min: 1, max: 1000000, decimals: 0, displayName: "적 일수 스케일링 한도 (버프 횟수):" },
					enemyLevelDefeatScaling: { min: 0, max: 1, decimals: 0, displayName: "적 패배 레벨 스케일링:" },
					enemyLevelDefeatScalingMult: { min: 1, max: 1000000, decimals: 1, displayName: "적 패배 레벨 버프 스케일링 (레벨):" },
					enemyHealthDefeatScaling: { min: 0, max: 1, decimals: 0, displayName: "적 패배 체력 스케일링:" },
					enemyHealthDefeatScalingMult: { min: 1, max: 1000000, decimals: 1, displayName: "적 패배 체력 비율 버프 스케일링 (%):" },
					enemyDefeatScaling: { min: 1, max: 1000000, decimals: 0, displayName: "적 패배 스케일링 기준 (적 수):" },
					enemyInfiniteDefeatScaling: { min: 0, max: 1, decimals: 0, displayName: "적 패배 무한 버프:" },
					enemyDefeatScalingLimit: { min: 1, max: 1000000, decimals: 0, displayName: "적 패배 스케일링 한도 (버프 횟수):" },
				},
				AMCTraits: {
					halfGain: { min: 0, max: 1, decimals: 0, displayName: "획득량 절반:" },
					physique: { min: 1, max: 2, decimals: 0, displayName: "단련된 체격:" },
					willpower: { min: 1, max: 2, decimals: 0, displayName: "단련된 의지력:" },
					milk: { min: 1, max: 2, decimals: 0, displayName: "단련된 모유량:" },
					semen: { min: 1, max: 2, decimals: 0, displayName: "단련된 정액량:" },
					skulduggery: { min: 1, max: 2, decimals: 0, displayName: "단련된 속임수:" },
					dancing: { min: 1, max: 2, decimals: 0, displayName: "단련된 춤:" },
					swimming: { min: 1, max: 2, decimals: 0, displayName: "단련된 수영:" },
					athletics: { min: 1, max: 2, decimals: 0, displayName: "단련된 체육:" },
					tending: { min: 1, max: 2, decimals: 0, displayName: "단련된 관리:" },
					housekeeping: { min: 1, max: 2, decimals: 0, displayName: "단련된 가사:" },
					brawling: { min: 1, max: 2, decimals: 0, displayName: "단련된 난투:" },
					footwork: { min: 1, max: 2, decimals: 0, displayName: "단련된 풋워크:" },
					striking: { min: 1, max: 2, decimals: 0, displayName: "단련된 타격:" },
					kicking: { min: 1, max: 2, decimals: 0, displayName: "단련된 발차기:" },
					science: { min: 1, max: 2, decimals: 0, displayName: "단련된 과학:" },
					maths: { min: 1, max: 2, decimals: 0, displayName: "단련된 수학:" },
					english: { min: 1, max: 2, decimals: 0, displayName: "단련된 영어:" },
					history: { min: 1, max: 2, decimals: 0, displayName: "단련된 역사:" },
					seductionskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 유혹 스킬:" },
					oralskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 구강 스킬:" },
					chestskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 가슴 스킬:" },
					handskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 손 스킬:" },
					bottomskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 엉덩이 스킬:" },
					penileskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 자지 스킬:" },
					vaginalskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 질 스킬:" },
					analskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 항문 스킬:" },
					thighskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 허벅지 스킬:" },
					feetskill: { min: 1, max: 2, decimals: 0, displayName: "단련된 발 스킬:" },
				},
				multiOrgasmToggle: { min: 0, max: 1, decimals: 0, displayName: "NPC 다중 오르가슴:" },
				multiOrgasmChance: { min: 0, max: 100, decimals: 0, displayName: "NPC당 다중 오르가슴 확률:" },
				multiOrgasmGroupDisable: { min: 0, max: 1, decimals: 0, displayName: "그룹 조우에서 다중 오르가슴 비활성화:" },
				multiOrgasmLustScaling: { min: 0, max: 1, decimals: 0, displayName: "네임드 NPC 욕정 스케일링:" },
				settings: {
					analEnabled: { bool: true, displayName: "애널:" },
					analingusGivingEnabled: { bool: true, displayName: "애널링구스 (하기):" },
					analingusReceivingEnabled: { bool: true, displayName: "애널링구스 (받기):" },
					transformAnimalEnabled: { bool: true, displayName: "동물화:" },
					asphyxiaLevel: {
						min: 0,
						max: 5,
						decimals: 0,
						displayName: "질식:",
						textMap: {
							0: "NPC가 당신의 목에 손대지 않습니다",
							1: "NPC가 숨을 막지 않는 선에서 당신의 목을 움켜쥘 수 있습니다",
							2: "합의된 만남 중에 NPC가 당신의 목을 조르려 할 수 있습니다",
							3: "비합의 만남 중에 NPC가 당신의 목을 졸라 숨통을 막으려 할 수 있습니다",
							4: "비합의 만남 중에 NPC가 자주 당신의 목을 졸라 숨통을 막으려 합니다",
							5: "비합의 만남 중에 NPC가 분노와 상관없이 기꺼이 당신의 목을 졸라 숨통을 막으려 합니다",
						},
					},
					penisModifier: { min: -8, max: 8, decimals: 0, displayName: "NPC 평균 자지 크기:", randomize: "encounter" },
					npcColossalPenisChance: { min: 0, max: 100, decimals: 0, displayName: "초거대 NPC 자지의 확률:", randomize: "encounter" },
					breastModifier: { min: -12, max: 12, decimals: 0, displayName: "여성의 평균 가슴 크기:", randomize: "encounter" },
					// DoLX keeps the wider rent range for its inflation economy; the pregnancy chances are
					// now straight percentages on vanilla's rewritten conception model.
					rentCostModifier: {
						min: 0.1,
						max: 10,
						decimals: 1,
						/* Vanilla randomises rent between x0.1 and x3; the slider still allows up to x10. */
						randomNumbers: Array.from({ length: 30 }, (_, i) => (i + 1) / 10),
						displayName: "베일리의 상납금:",
						randomize: "gameplay",
					},
					baseNpcPregnancyChance: { min: 0, max: 100, decimals: 0, displayName: "기본 NPC 임신 확률:", randomize: "gameplay" },
					basePlayerPregnancyChance: { min: 0, max: 100, decimals: 0, displayName: "기본 플레이어 임신 확률:", randomize: "gameplay" },
					beastMaleChanceSplit: { bool: true, displayName: "짐승 성적 지향 설정:" },
					beastMaleChanceMale: { min: 0, max: 100, decimals: 0, displayName: "남성에게 끌리는 짐승:", randomize: "encounter" },
					beastMaleChanceFemale: { min: 0, max: 100, decimals: 0, displayName: "여성에게 끌리는 짐승:", randomize: "encounter" },
					beesEnabled: { bool: true, displayName: "벌:" },
					bestialityEnabled: { bool: true, displayName: "수간:" },
					blindStatsEnabled: { bool: true, displayName: "블라인드 스탯:" },
					bodyWritingLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "몸 낙서:",
						textMap: {
							0: "NPC가 당신의 몸에 글씨를 쓰지 않습니다",
							1: "NPC가 당신의 몸에 글씨를 써도 되는지 물을 수 있습니다",
							2: "NPC가 강제로 당신의 몸에 글씨를 쓸 수 있습니다",
							3: "NPC가 강제로 당신의 몸에 글씨를 쓰거나 문신을 새길 수 있습니다",
						},
					},
					npcMakeupLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "NPC 화장 간섭:",
						textMap: {
							0: "만남 중에 NPC가 당신의 화장을 하거나 지우지 않습니다",
							1: "해당되는 만남에서 NPC가 드물게 당신의 화장을 하거나 지웁니다",
							2: "해당되는 만남에서 NPC가 가끔 당신의 화장을 하거나 지웁니다",
							3: "해당되는 만남에서 NPC가 자주 당신의 화장을 하거나 지웁니다",
						},
						randomize: "encounter",
					},
					npcChastityLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "NPC 정조대:",
						textMap: {
							0: "NPC가 당신에게 정조대를 채우거나 열쇠를 빼앗는 일은 없습니다",
							1: "NPC가 드물게 당신에게 정조대를 강요합니다",
							2: "NPC가 가끔 당신에게 정조대를 강요합니다",
							3: "NPC가 자주 당신에게 정조대를 강요합니다",
						},
						randomize: "encounter",
					},
					breastFeedingEnabled: { bool: true, displayName: "수유:" },
					lactationFlatChestEnabled: { bool: true, displayName: "최소 가슴 크기에서도 허용:" },
					cheatsEnabledToggle: { bool: true, displayName: "치트 모드:" },
					condomLevel: {
						min: 0,
						max: 3,
						decimals: 0,
						displayName: "콘돔:",
						textMap: {
							0: "모두가 라텍스와 안전한 섹스에 알레르기가 있습니다",
							1: "콘돔은 당신만 쓸 수 있지만, NPC에게 콘돔을 건넬 수는 있습니다",
							2: "NPC는 자신과 당신 사이에 임신이 가능한 경우에만 콘돔을 갖고 있습니다",
							3: "NPC는 내키면 언제든 콘돔을 갖고 쓸 수 있습니다",
						},
						randomize: "gameplay",
					},
					condomChance: { min: 0, max: 100, decimals: 0, displayName: "NPC가 콘돔을 소지할 확률:" },
					condomUseChanceRape: { min: 0, max: 100, decimals: 0, displayName: "NPC가 요청받지 않아도 콘돔을 사용할 확률(강간 중):" },
					condomUseChanceConsensual: { min: 0, max: 100, decimals: 0, displayName: "NPC가 요청받지 않아도 콘돔을 사용할 확률(합의된 성관계 중):" },
					playerCondomBreakChance: { min: 0, max: 100, decimals: 0, displayName: "플레이어 콘돔 자동 파손:" },
					npcCondomBreakChance: { min: 0, max: 100, decimals: 0, displayName: "NPC 콘돔 자동 파손:" },
					clothingCostModifier: { min: 1, max: 10, decimals: 1, displayName: "모든 의류 가격:", randomize: "gameplay" },
					furnitureCostModifier: { min: 0.6, max: 5, decimals: 1, displayName: "가구 가격:", randomize: "gameplay" },
					lewdClothingCostModifier: { min: 0.1, max: 2, decimals: 1, displayName: "음란한 옷 가격:", randomize: "gameplay" },
					schoolClothingCostModifier: { min: 1, max: 2, decimals: 1, displayName: "학교 교복 가격:", randomize: "gameplay" },
					underwearCostModifier: { min: 1, max: 2, decimals: 1, displayName: "속옷 가격:", randomize: "gameplay" },
					tendingYieldModifier: { min: 1, max: 10, decimals: 1, displayName: "작물 수확량:", randomize: "gameplay" },
					femaleClimaxAlways: { bool: true, displayName: "여자처럼 절정:" },
					clearClimaxEnabled: { bool: true, displayName: "투명한 절정:" },
					toyDildoEnabled: { bool: true, displayName: "딜도:" },
					smallPenisSemenVolumeLossDisabled: { bool: true, displayName: "정액량 감소 비활성화:" },
					toyVirginityEnabled: { bool: true, displayName: "장난감이 처녀성을 가져갈 수 있음:" },
					transformDivineEnabled: { bool: true, displayName: "신성화:" },
					analDoubleEnabled: { bool: true, displayName: "애널 이중 삽입:" },
					vaginalDoubleEnabled: { bool: true, displayName: "보지 이중 삽입:" },
					earSlimesEnabled: { bool: true, displayName: "귀 슬라임:" },
					earSlimeThoughts: { bool: true, displayName: "귀 슬라임이 불쑥 떠오르는 생각으로 나타남:" },
					allureModifier: { min: 0.2, max: 2, decimals: 1, displayName: "조우 확률:", randomize: "gameplay" },
					allureIgnoresFame: { bool: true, displayName: "매력에서 명성 무시:" },
					facesitEnabled: { bool: true, displayName: "얼굴에 앉기(안면승마):" },
					pregnancySpeechEnabled: { bool: true, displayName: "수정/가임 언급:" },
					footFetishEnabled: { bool: true, displayName: "발 페티시:" },
					forcedCrossdressingEnabled: { bool: true, displayName: "강제 크로스드레싱:" },
					horsesEnabled: { bool: true, displayName: "말:" },
					humanPregnancyMonths: { min: 1, max: 9, decimals: 0, displayName: "인간 임신 기간:" },
					hypnosisEnabled: { bool: true, displayName: "최면:" },
					npcVirginChanceAdult: { min: 0, max: 100, decimals: 0, displayName: "성인이 처녀/동정일 확률:", randomize: "encounter" },
					npcVirginChanceStudent: { min: 0, max: 100, decimals: 0, displayName: "학생이 처녀/동정일 확률:", randomize: "encounter" },
					darkSkinChance: { min: 0, max: 100, decimals: 0, displayName: "NPC가 어두운 피부일 확률:", randomize: "encounter" },
					lurkersEnabled: { bool: true, displayName: "럴커:" },
					fertilityCycleEnabled: { bool: true, displayName: "배란 주기:" },
					arousalMoanEnabled: { bool: true, displayName: "신음과 끙끙거림:" },
					toyMultiplePenetrationEnabled: { bool: true, displayName: "장난감 동시 삽입:" },
					multipleWardrobes: { strings: [false, "isolated", "strict"], displayName: "여러 옷장:" }, //, "all"
					maleChanceSplit: { bool: true, displayName: "성적 지향 설정:" },
					incompletePregnancyEnabled: { bool: true, displayName: "미완성 임신 콘텐츠:" },
					npcPregnancyEnabled: { bool: true, displayName: "일반 NPC 임신:" },
					nnpcPregnancyEnabled: { bool: true, displayName: "네임드 NPC 임신:" },
					analPregnancy: { strings: [false, "exceptional", "always"], displayName: "플레이어 항문 임신:" },
					npcAnalPregnancyEnabled: { bool: true, displayName: "NPC 항문 임신:" },
					maleChanceMale: { min: 0, max: 100, decimals: 0, displayName: "남성에게 끌리는 일반 NPC 비율:", randomize: "encounter" },
					maleChanceFemale: { min: 0, max: 100, decimals: 0, displayName: "여성에게 끌리는 일반 NPC 비율:", randomize: "encounter" },
					nudeGenderPerception: {
						min: 0,
						max: 2,
						decimals: 0,
						displayName: "나체 성별 외형:",
						textMap: {
							"-1": "NPC가 성별을 판단할 때 성기를 무시하며, 여장 경고도 표시되지 않습니다",
							0: "NPC가 성별을 판단할 때 성기를 무시합니다",
							1: "NPC가 당신의 성별을 판단할 때 성기를 고려합니다",
							2: "NPC가 성기를 기준으로 당신의 성별을 판단합니다",
						},
					},
					monsterHallucinationsOnly: {
						bool: true,
						displayName: "수인은 환각 상태에서만 출현:",
						randomize: "encounter",
					},
					parasitePregnancyEnabled: { bool: true, displayName: "기생충 임신:" },
					parasitesEnabled: { bool: true, displayName: "기생충:" },
					beastMaleChance: {
						min: 0,
						max: 100,
						decimals: 0,
						displayName: "짐승 성별:",
						randomize: "encounter",
					},
					monsterChance: {
						min: 0,
						max: 100,
						decimals: 0,
						displayName: "수인 출현 확률:",
						randomize: "encounter",
					},
					maleNPCVaginaChance: { min: 0, max: 100, decimals: 0, displayName: "보지만 가진 남성의 비율:", randomize: "encounter" },
					maleVictimChance: { min: 0, max: 100, decimals: 0, displayName: "다른 피해자 성별:", randomize: "encounter" },
					maleChance: { min: 0, max: 100, decimals: 0, displayName: "일반 NPC 성별:", randomize: "encounter" },
					femaleNPCPenisChance: { min: 0, max: 100, decimals: 0, displayName: "자지만 가진 여성의 비율:", randomize: "encounter" },
					straponChance: { min: 0, max: 100, decimals: 0, displayName: "페니스 밴드 자지를 가진 여성의 비율:", randomize: "encounter" },
					plantsEnabled: { bool: true, displayName: "식물 수인:" },
					playerPregnancyEggLayingEnabled: { bool: true, displayName: "산란:" },
					playerPregnancyBeastEnabled: { bool: true, displayName: "플레이어의 짐승 아이 임신:" },
					playerPregnancyHumanEnabled: { bool: true, displayName: "플레이어의 인간 아이 임신:" },
					pregnancyType: { strings: ["realistic", "fetish", "silly"], displayName: "임신 모드:" },
					pubicHairEnabled: { bool: true, displayName: "음모 성장:" },
					ruinedOrgasmEnabled: { bool: true, displayName: "망가진 절정:" },
					skillCheckStyle: { strings: ["percentage", "words", "skillname"], randomize: "gameplay", displayName: "스킬 판정 표시:" },
					slimesEnabled: { bool: true, displayName: "슬라임:" },
					maggotsEnabled: { bool: true, displayName: "구더기:" },
					slugsEnabled: { bool: true, displayName: "민달팽이:" },
					spidersEnabled: { bool: true, displayName: "거미:" },
					swarmsEnabled: { bool: true, displayName: "군집체(장어 등):" },
					tentaclesEnabled: { bool: true, displayName: "촉수:" },
					voreEnabled: { bool: true, displayName: "소프트 보어물(집어삼키기):" },
					waspsEnabled: { bool: true, displayName: "말벌:" },
					watersportsEnabled: { bool: true, displayName: "워터스포츠(방뇨):" },
					toyWhipEnabled: { bool: true, displayName: "채찍:" },
					wolfPregnancyWeeks: { min: 2, max: 12, decimals: 0, displayName: "늑대 임신 기간:" },
					birdPregnancyWeeks: { min: 1, max: 12, decimals: 0, displayName: "새 임신 기간:" },
					realisticChildbirthEnabled: { bool: true, displayName: "현실적인 출산:" },
					tanningDifficulty: {
						min: 0,
						max: 4,
						decimals: 0,
						displayName: "태닝:",
						textMap: { 0: "매우 잘 탄다", 1: "잘 탄다", 2: "보통으로 탄다", 3: "잘 타지 않는다", 4: "거의 타지 않는다" },
					},
					inflationEnabled: { bool: true, displayName: "경제 인플레이션:" },
					inflationBaileyRelentless: { bool: true, displayName: "집요한 베일리:" },
					inflationOnsetPct: { min: 11, max: 30, decimals: 0, displayName: "인플레이션 초기 (%):" },
					inflationBadPct: { min: 28, max: 100, decimals: 0, displayName: "인플레이션 경기 악화 (%):" },
					inflationCrisisPct: { min: 56, max: 200, decimals: 0, displayName: "인플레이션 위기 (%):" },
					inflationExtremePct: { min: 115, max: 400, decimals: 0, displayName: "인플레이션 극단 (%):" },
					inflationParodyPct: { min: 450, max: 3000, decimals: 0, displayName: "인플레이션 패러디 폭주 (%):" },
					inflationBaileyRentPct: { min: 3, max: 300, decimals: 0, displayName: "인플레이션 추가 집세 시작 (%):" },
					inflationBaileyCrisisTier: { strings: ["onset", "bad", "crisis", "extreme", "parody"], displayName: "인플레이션 거절/추적 시작 단계:" },
					inflationBaileyCapLow: { min: 500000, max: 5000000, decimals: 0, displayName: "인플레이션 저자산 한도:" },
					inflationBaileyCapHigh: { min: 1000000, max: 10000000, decimals: 0, displayName: "인플레이션 고자산 한도:" },
					inflationBaileyDemandJump: { min: 2500000, max: 25000000, decimals: 0, displayName: "인플레이션 도약 단계 한도:" },
					inflationBaileyDemandInvestment: { min: 5000000, max: 100000000, decimals: 0, displayName: "인플레이션 투자 단계 한도:" },
					inflationBaileyStep: { min: 10000, max: 200000, decimals: 0, displayName: "인플레이션 주간 집세 증가폭:" },
					inflationLoanRentSurcharge: { min: 50000, max: 300000, decimals: 0, displayName: "인플레이션 연체 대출 회수:" },
					inflationBlackmailRewardPct: { min: 0, max: 100, decimals: 0, displayName: "인플레이션 협박 퀘스트 보상 (%):" },
				},
				blackwolfmonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "검은 늑대 짐승 유형:",
					textMap: { 0: "항상 짐승", 1: "조건을 충족하면 수인 소녀 또는 소년", 2: "항상 수인 소녀 또는 소년" },
					randomize: "encounter",
				},
				greathawkmonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "거대 매 짐승 유형:",
					textMap: { 0: "항상 짐승", 1: "조건을 충족하면 수인 소녀 또는 소년", 2: "항상 수인 소녀 또는 소년" },
					randomize: "encounter",
				},
				nightmonstermonster: {
					min: 0,
					max: 2,
					decimals: 0,
					displayName: "밤의 괴물 짐승 유형:",
					textMap: { 0: "항상 짐승", 1: "조건을 충족하면 수인 소녀 또는 소년", 2: "항상 수인 소녀 또는 소년" },
					randomize: "encounter",
				},
				breastsizemin: {
					min: 0,
					max: 12,
					decimals: 0,
					displayName: "가슴 크기 최소:",
					textMap: {
						0: "납작한",
						1: "아주 작은",
						2: "작은",
						3: "봉긋한",
						4: "볼륨있는",
						5: "글래머한",
						6: "꽉 찬",
						7: "풍만한",
						8: "큰",
						9: "커다란",
						10: "거대한",
						11: "엄청난",
						12: "어마어마한",
					},
				},
				breastsizemax: {
					min: 0,
					max: 12,
					decimals: 0,
					displayName: "가슴 크기 최대:",
					textMap: {
						0: "납작한",
						1: "아주 작은",
						2: "작은",
						3: "봉긋한",
						4: "볼륨있는",
						5: "글래머한",
						6: "꽉 찬",
						7: "풍만한",
						8: "큰",
						9: "커다란",
						10: "거대한",
						11: "엄청난",
						12: "어마어마한",
					},
				},
				bottomsizemin: {
					min: 0,
					max: 8,
					decimals: 0,
					displayName: "엉덩이 크기 최소:",
					textMap: { 0: "납작한", 1: "아담한", 2: "둥근", 3: "부드러운", 4: "통통한", 5: "꽉 찬", 6: "풍만한", 7: "큰", 8: "거대한" },
				},
				bottomsizemax: {
					min: 0,
					max: 8,
					decimals: 0,
					displayName: "엉덩이 크기 최대:",
					textMap: { 0: "납작한", 1: "아담한", 2: "둥근", 3: "부드러운", 4: "통통한", 5: "꽉 찬", 6: "풍만한", 7: "큰", 8: "거대한" },
				},
				penissizemin: {
					min: 0,
					max: 6,
					decimals: 0,
					displayName: "자지 크기 최소:",
					textMap: { 0: "매우 작은", 1: "약간 작은", 2: "작은", 3: "보통", 4: "큰", 5: "매우 큰", 6: "거대한" },
				},
				penissizemax: {
					min: 0,
					max: 6,
					decimals: 0,
					displayName: "자지 크기 최대:",
					textMap: { 0: "매우 작은", 1: "약간 작은", 2: "작은", 3: "보통", 4: "큰", 5: "매우 큰", 6: "거대한" },
				},
				confirmSave: { bool: true, displayName: "저장 시 확인 필요:" },
				confirmLoad: { bool: true, displayName: "로드 시 확인 필요:" },
				confirmDelete: { bool: true, displayName: "삭제 시 확인 필요:" },
				reducedLineHeight: { bool: true, displayName: "줄 간격 줄이기:" },
				outfitEditorPerPage: { min: 5, max: 20, decimals: 0, displayName: "페이지당 아이템 수:" }, //, "all"
				options: {
					neverNudeMenus: { bool: true, displayName: "메뉴에서 플레이어의 알몸 숨기기:" },
					showCaptionText: { bool: true, displayName: "사이드바에 캡션 텍스트 표시:" },
					showAllStatMeters: { bool: true, displayName: "사이드바 스탯 게이지를 항상 표시:" },
					clothingCaption: { bool: true, displayName: "사이드바에 옷차림 설명 표시:" },
					clothingReplacementWarning: { bool: true, displayName: "의류 교체 경고 활성화:" },
					sidebarStats: { strings: ["disabled", "limited", "all"], displayName: "사이드바가 닫혀 있을 때 스탯 표시:" },
					sidebarTime: { strings: ["disabled", "top", "bottom"], displayName: "사이드바가 닫혀 있을 때 시계 표시:" },
					combatControls: { strings: ["radio", "columnRadio", "lists", "limitedLists"], displayName: "전투 조작계:" },
					mapMovement: { bool: true, displayName: "지도 아이콘을 클릭/터치하여 지도 이동 활성화:" },
					mapTop: { bool: true, displayName: "지도 링크 위로 지도 위치 올리기:" },
					mapMarkers: { bool: true, displayName: "지도에 클릭 가능한 영역 표시:" },
					images: { min: 0, max: 1, decimals: 0, displayName: "이미지:" },
					combatImages: { min: 0, max: 1, decimals: 0, displayName: "전투 이미지:" },
					bodywritingImages: { bool: true, displayName: "낙서 이미지:" },
					silhouetteEnabled: { bool: true, displayName: "NPC 실루엣:" },
					bodySizeScaling: { bool: true, displayName: "사이드바 이미지를 체형 크기에 맞춰 조절:" },
					sidebarAnimations: { bool: true, displayName: "사이드바 캐릭터 애니메이션:" },
					blinkingEnabled: { bool: true, displayName: "눈 깜빡임 애니메이션:" },
					combatAnimations: { bool: true, displayName: "전투 애니메이션:" },
					halfClosedEnabled: { bool: true, displayName: "반쯤 감은 눈:" },
					characterLightEnabled: { bool: true, displayName: "캐릭터 조명:" },
					lightSpotlight: { min: 0, max: 1, decimals: 2, displayName: "스포트라이트:" },
					lightGradient: { min: 0, max: 1, decimals: 2, displayName: "그라데이션:" },
					lightGlow: { min: 0, max: 1, decimals: 2, displayName: "발광:" },
					lightFlat: { min: 0, max: 1, decimals: 2, displayName: "평면:" },
					lightTFColor: { min: 0, max: 1, decimals: 2, displayName: "색상 요소(천사/악마 변신 필요):" },
					combatLightEnabled: { bool: true, displayName: "전투 조명:" },
					combatLightOffsetY: { min: 0, max: 128, decimals: 0, displayName: "Y 오프셋:" },
					combatLightSpotlight: { min: 0, max: 1, decimals: 2, displayName: "스포트라이트 강도:" },
					combatLightSpotlightX: { min: 0, max: 128, decimals: 0, displayName: "스포트라이트 너비:" },
					combatLightSpotlightY: { min: 0, max: 48, decimals: 0, displayName: "스포트라이트 높이:" },
					combatLightGradient: { min: 0, max: 1, decimals: 2, displayName: "그라데이션:" },
					combatLightGlow: { min: 0, max: 1, decimals: 2, displayName: "발광:" },
					combatLightFlat: { min: 0, max: 1, decimals: 2, displayName: "평면:" },
					combatLightTFColor: { min: 0, max: 1, decimals: 2, displayName: "색상 요소(천사/악마 변신 필요):" },
					maxStates: { min: 1, max: 20, decimals: 0, displayName: "히스토리 깊이:" },
					historyControls: { bool: true, displayName: "사이드바에 히스토리 컨트롤 표시:" },
					useNarrowMarket: { bool: true, displayName: "시장 인벤토리의 「좁은 화면」 버전 사용:" },
					skipStatisticsConfirmation: { bool: true, displayName: "추가 통계를 볼 때 확인 건너뛰기:" },
					passageCount: { strings: ["disabled", "changes", "total"], displayName: "화면 우측 상단에 패시지 수 표시:" },
					playtime: { bool: true, displayName: "화면 우측 상단에 플레이 타임 표시:" },
					numberify_enabled: { min: 0, max: 1, decimals: 0, displayName: "번호가 매겨진 링크 네비게이션 활성화:" },
					timestyle: { strings: ["military", "ampm"], displayName: "시간 형식:" },
					tipdisable: { boolLetter: true, bool: true, displayName: "사이드바에 힌트 및 팁 표시:" },
					pepperSprayDisplay: {
						strings: ["none", "sprays", "compact", ...Array.from({ length: 9 }, (_, i) => `modded${i + 1}`)],
						displayName: "후추 스프레이 표시:",
					},
					dragonStarDisplay: { strings: ["none", "show"], displayName: "드래곤 별:" },
					condomsDisplay: { strings: ["none", "standard", ...Array.from({ length: 9 }, (_, i) => `modded${i + 1}`)], displayName: "콘돔 표시:" },
					closeButtonMobile: { bool: true, displayName: "오버레이 메뉴의 닫기 버튼 위치:" },
					showDebugRenderer: { bool: true, displayName: "렌더러 디버거 활성화:" },
					showCombatTools: { bool: true, displayName: "전투 도구 활성화:" },
					numpad: { bool: true, displayName: "숫자 키패드 활성화:" },
					traitOverlayFormat: { strings: ["table", "reducedTable", "list"], displayName: "특성 표시 형식:" },
					font: {
						default: "",
						strings: [
							"",
							"Arial",
							"Verdana",
							"TimesNewRoman",
							"Georgia",
							"Garamond",
							"CourierNew",
							"LucidaConsole",
							"Monaco",
							"ComicSans",
							"OpenDyslexicMono",
							"Lexend",
						],
						displayName: "글꼴 스타일:",
					},
					passageLineHeight: { default: 0, strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "패시지 줄 간격:" },
					overlayLineHeight: { default: 0, strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "오버레이 줄 간격:" },
					sidebarLineHeight: { default: 0, strings: [0, 1, 1.25, 1.5, 1.75, 2], displayName: "사이드바 줄 간격:" },
					passageFontSize: { default: 0, strings: [0, 10, 12, 14, 16, 18, 20], displayName: "패시지 글꼴 크기:" },
					overlayFontSize: { default: 0, strings: [0, 10, 12, 14, 16, 18, 20], displayName: "오버레이 글꼴 크기:" },
					sidebarFontSize: { default: 0, strings: [0, 12, 14, 16, 18, 20], displayName: "사이드바 글꼴 크기:" },
					genderBody: { strings: ["default", "m", "a", "f"], displayName: "표시할 몸 유형:" },
					notesAutoSave: { bool: true, displayName: "메모 자동 저장:" },
					dateFormat: { strings: ["en-GB", "en-US", "zh-CN"], displayName: "날짜 형식:" },
				},
				multiOrgasmGender: { strings: ["all", "f", "m"], displayName: "일반 NPC 다중 오르가슴 적용 대상:" },
				NNPCMultiOrgasmGender: { strings: ["all", "f", "m"], displayName: "네임드 NPC 다중 오르가슴 적용 대상:" },
				xchangeStatSplit: { bool: true, displayName: "음란 스탯 분리:" },
				whackRandom: { bool: true, displayName: "쳐내기 행동이 실패할 수 있음:" },
				portalPantiesEnabled: { min: 0, max: 1, decimals: 0, displayName: "포털 효과:" },
				angryHypnotist: { bool: true, displayName: "최면술사가 화가 나 있으면 당신에게 최면을 걸 가능성이 높아짐:" },
				deviantHypnotist: { bool: true, displayName: "최면에 의한 이상성욕:" },
				hypnotistChance: { min: 0, max: 100, decimals: 0, displayName: "적 최면술사 확률 (%):" },
				willpowerCum: { min: 0, max: 1, decimals: 0, displayName: "기절 효과를 버텨내도 절정에 이름:" },
				xchange: {
					pillPermanence: { min: 0, max: 1, decimals: 0, displayName: "알약 영구화:" },
					continueDurationCapEnabled: { bool: true, displayName: "컨티뉴 지속 시간 제한:" },
					postPermanenceFertilityReset: { min: 0, max: 1, decimals: 0, displayName: "영구화 이후 가임률을 정상으로 되돌림:" },
					grayPillGenderflip: { min: 0, max: 1, decimals: 0, displayName: "그레이 알약이 성별도 뒤집음:" },
					omegaShrinkGenitals: { min: 0, max: 1, decimals: 0, displayName: "핑크 오메가 알약이 성별을 바꾸는 대신 몸을 줄임:" },
					npcPillChangesGender: { min: 0, max: 1, decimals: 0, displayName: "알약이 NPC의 성별도 바꿈:" },
					bodyAdjustmentEnabled: { min: 0, max: 1, decimals: 0, displayName: "몸이 바뀐 뒤 적응 기간:" },
					omegaNeedsNoVagina: { min: 0, max: 1, decimals: 0, displayName: "질이 없을 때만 엉덩이에 영향:" },
					alphaGrowsPenis: { min: 0, max: 1, decimals: 0, displayName: "자지가 없으면 자지가 자라남:" },
					aboDrivesHeat: { min: 0, max: 1, decimals: 0, displayName: "알파와 오메가가 수컷 발정기와 발정기를 일으킴:" },
					pheromoneAllure: { min: 0, max: 1, decimals: 0, displayName: "알파, 베타, 오메가가 매력을 높임:" },
					nonconEnabled: { min: 0, max: 1, decimals: 0, displayName: "비동의 알약 몰래 먹이기:" },
					spikeSideEffectsEnabled: { min: 0, max: 1, decimals: 0, displayName: "수상한 알약에 부작용 있음:" },
					disregardGender: { min: 0, max: 1, decimals: 0, displayName: "성별 조건 무시:" },
					faceChangesEnabled: { min: 0, max: 1, decimals: 0, displayName: "알약으로 인한 얼굴 변화:" },
					genitalAddictTraitsEnabled: { min: 0, max: 1, decimals: 0, displayName: "자지/구멍 중독 특성:" },
					oralFixationTraitEnabled: { min: 0, max: 1, decimals: 0, displayName: "구강 집착 특성:" },
					oralFixationSwallowRelief: { min: 0, max: 1, decimals: 0, displayName: "구강 집착 - 정액을 삼키면 오르가슴 가능:" },
					heatBlocksScream: { min: 0, max: 1, decimals: 0, displayName: "발정기에는 비명을 지를 수 없음:" },
					critterMagnetTraitEnabled: { min: 0, max: 1, decimals: 0, displayName: "동물 자석 특성:" },
					chastityAcclimatedTraitEnabled: { min: 0, max: 1, decimals: 0, displayName: "정조대 적응 특성:" },
					arousalAcclimatedTraitEnabled: { min: 0, max: 1, decimals: 0, displayName: "흥분 적응 특성:" },
					insanityDisturbedTraitsEnabled: { min: 0, max: 1, decimals: 0, displayName: "전체 해리:" },
					insanityBecomesPermanent: { min: 0, max: 1, decimals: 0, displayName: "자연 발생한 광기는 영구적:" },
					blindAdaptabilityKeep: { strings: ["fade", "gwylan", "auto"], displayName: "적응력 유지:" },
					blindAdaptabilityNoLove: { min: 0, max: 1, decimals: 0, displayName: "호감도 없이도 그윌란이 도와줌:" },
					useHermBalls: { min: 0, max: 1, decimals: 0, displayName: "퍼플 알약 복용자는 고환이 있음:" },
					chastityKeepBeltShape: { min: 0, max: 1, decimals: 0, displayName: "성별이 바뀌어도 정조대 모양 유지:" },
					combatPillingEnabled: { min: 0, max: 1, decimals: 0, displayName: "전투 중 알약 투여:" },
					restrictedSexCombatPilling: { min: 0, max: 1, decimals: 0, displayName: "전투 중 알약을 같은 성별 NPC로 제한:" },
					NNPCcombatPillingEnabled: { min: 0, max: 1, decimals: 0, displayName: "네임드 NPC의 비동의 전투 알약 투여:" },
					combatPillingIfPilled: { min: 0, max: 1, decimals: 0, displayName: "이미 알약을 먹은 상태에서도 전투 알약 허용:" },
					combatPillingBeastsEnabled: { min: 0, max: 1, decimals: 0, displayName: "짐승이 전투 알약을 가질 수 있음:" },
					combatPillingMonsterPeopleEnabled: { min: 0, max: 1, decimals: 0, displayName: "수인이 전투 알약을 가질 수 있음:" },
					combatPillingChance: { min: 0, max: 100, decimals: 0, displayName: "NPC 알약 확률 (%):" },
					combatPillingDrawChance: { min: 1, max: 50, decimals: 0, displayName: "턴당 알약 사용 확률:" },
					combatPillingPureRatio: { min: 0, max: 100, decimals: 0, displayName: "깨끗한 알약 비율 (%):" },
					bodySizeLimitsEnabled: { min: 0, max: 1, decimals: 0, displayName: "X-체인지 몸에 별도 한도 사용:" },
					bodyBreastSizeMin: {
						min: 0,
						max: 12,
						decimals: 0,
						displayName: "X-체인지 최소 가슴 크기:",
						textMap: {
							0: "납작한",
							1: "아주 작은",
							2: "작은",
							3: "봉긋한",
							4: "볼륨있는",
							5: "글래머한",
							6: "꽉 찬",
							7: "풍만한",
							8: "큰",
							9: "커다란",
							10: "거대한",
							11: "엄청난",
							12: "어마어마한",
						},
					},
					bodyBreastSizeMax: {
						min: 0,
						max: 12,
						decimals: 0,
						displayName: "X-체인지 최대 가슴 크기:",
						textMap: {
							0: "납작한",
							1: "아주 작은",
							2: "작은",
							3: "봉긋한",
							4: "볼륨있는",
							5: "글래머한",
							6: "꽉 찬",
							7: "풍만한",
							8: "큰",
							9: "커다란",
							10: "거대한",
							11: "엄청난",
							12: "어마어마한",
						},
					},
					bodyBottomSizeMin: {
						min: 0,
						max: 8,
						decimals: 0,
						displayName: "X-체인지 최소 엉덩이 크기:",
						textMap: { 0: "납작한", 1: "아담한", 2: "둥근", 3: "부드러운", 4: "통통한", 5: "꽉 찬", 6: "풍만한", 7: "큰", 8: "거대한" },
					},
					bodyBottomSizeMax: {
						min: 0,
						max: 8,
						decimals: 0,
						displayName: "X-체인지 최대 엉덩이 크기:",
						textMap: { 0: "납작한", 1: "아담한", 2: "둥근", 3: "부드러운", 4: "통통한", 5: "꽉 찬", 6: "풍만한", 7: "큰", 8: "거대한" },
					},
					bodyPenisSizeMin: {
						min: 0,
						max: 6,
						decimals: 0,
						displayName: "X-체인지 최소 자지 크기:",
						textMap: { 0: "초소형", 1: "매우 작은", 2: "아주 작은", 3: "작은", 4: "보통", 5: "큰", 6: "엄청난" },
					},
					bodyPenisSizeMax: {
						min: 0,
						max: 6,
						decimals: 0,
						displayName: "X-체인지 최대 자지 크기:",
						textMap: { 0: "초소형", 1: "매우 작은", 2: "아주 작은", 3: "작은", 4: "보통", 5: "큰", 6: "엄청난" },
					},
					customisedEyeColour: {
						strings: [
							"nochange",
							"black",
							"purple",
							"dark blue",
							"light blue",
							"amber",
							"hazel",
							"green",
							"lime green",
							"red",
							"pink",
							"grey",
							"light grey",
							"random",
						],
						displayName: "성별 전환 후 눈 색:",
					},
					customisedHairColour: {
						strings: ["nochange", ...setup.colours.hair.filter(c => c.natural || c.dye).map(c => c.variable)],
						displayName: "성별 전환 후 머리 색:",
					},
					customisedSkinColour: {
						strings: [
							"nochange",
							"light",
							"medium",
							"dark",
							"gyaru",
							"rlight",
							"rmedium",
							"rdark",
							"rgyaru",
							"glight",
							"gmedium",
							"gdark",
							"ggyaru",
							"ylight",
							"ymedium",
							"ydark",
							"ygyaru",
							"blight",
							"bmedium",
							"bdark",
							"bgyaru",
							"random",
						],
						displayName: "성별 전환 후 피부 톤:",
					},
					customisedDemeanour: {
						strings: [
							"nochange",
							"docile",
							"meek",
							"shy",
							"polite",
							"neutral",
							"confident",
							"bratty",
							"cruel",
							"flamboyant",
							"special",
							"capricious",
							"fickle",
							"random",
						],
						displayName: "성별 전환 후 태도:",
					},
					sizeOverride: {
						strings: ["default", "miniature", "tiny", "small", "normal", "tall", "large", "giant"],
						displayName: "체격 변화:",
					},
					physiqueChangePercent: { number: true, displayName: "변신 배율 (%):" },
					pillSensitivityChange: { number: true, displayName: "알약으로 인한 민감도 증가:" },
					impuritySensitivityBonus: { number: true, displayName: "불순함으로 인한 민감도 증가:" },
					pregnancyMultPercent: { number: true, displayName: "알약 복용 시 확률 보정 (%):" },
					resistanceOrgasmPenalty: { min: 0.5, max: 0.99, decimals: 2, displayName: "오르가슴당 확률 감소 계수:" },
					resistanceDaysPenalty: { number: true, displayName: "알약 종료 실패 페널티 (일):" },
					portalFrequency: { number: true, displayName: "포털 빈도 (%):" },
					cumcureTime: { min: 1, max: 24, decimals: 0, displayName: "컴큐어 시간 단축 계수:" },
					breederFreeOrgasm: { bool: true, displayName: "브리더 - 질내사정 없이도 오르가슴 허용:" },
					omegaFreeOrgasm: { bool: true, displayName: "오메가 - 채워지지 않아도 오르가슴 허용:" },
					alphaFreeOrgasm: { bool: true, displayName: "알파 - 매듭 없이도 오르가슴 허용:" },
					genitalAddictFreeOrgasm: { bool: true, displayName: "자지/구멍 중독 - 삽입 없이도 오르가슴 허용:" },
					oralFixationFreeOrgasm: { bool: true, displayName: "구강 집착 - 오럴 없이도 오르가슴 허용:" },
					breederInfertile: { bool: true, displayName: "브리더가 가임력을 높이지 않음:" },
					alwaysFertile: { bool: true, displayName: "X-체인지 중에는 항상 가임:" },
					fertilityStrengthPercent: { min: 25, max: 400, decimals: 0, displayName: "가임력 강도 (%):" },
					willpowerSystemEnabled: { min: 0, max: 1, decimals: 0, displayName: "의지력 시스템:" },
					willpowerSuccessCost: { number: true, displayName: "의지력 성공 비용:" },
					willpowerFailureCost: { number: true, displayName: "의지력 실패 비용:" },
					willpowerRestEnabled: { min: 0, max: 1, decimals: 0, displayName: "휴식과 진정이 의지력을 회복시킴:" },
					willpowerRestPercent: { min: 0, max: 300, decimals: 0, displayName: "휴식 회복 강도 (%):" },
					giAutoEnabled: { bool: true, displayName: "정체성 시스템을 바탕으로 성 정체성 갱신:" },
					audienceDysphoriaEnabled: { bool: true, displayName: "같은 성별 집단에서의 성별 반응:" },
					euphoriaAcclimationEnabled: { bool: true, displayName: "선호 특성에 익숙해지기:" },
					giTransformEnabled: { bool: true, displayName: "느린 신체 변화가 성 정체성을 따름:" },
					giBreastSizeEnabled: { bool: true, displayName: "몸 정체성 항목 - 가슴 크기:" },
					giAssSizeEnabled: { bool: true, displayName: "몸 정체성 항목 - 엉덩이 크기:" },
					giGenitalsEnabled: { bool: true, displayName: "몸 정체성 항목 - 성기:" },
					giHairLengthEnabled: { bool: true, displayName: "몸 정체성 항목 - 머리카락 길이:" },
					giBodySizeEnabled: { bool: true, displayName: "몸 정체성 항목 - 체격:" },
					giFecundityEnabled: { bool: true, displayName: "몸 정체성 항목 - 가임력:" },
					heat: {
						systemOn: { min: 0, max: 1, decimals: 0, displayName: "강제 발정:" },
						permanentOn: { min: 0, max: 1, decimals: 0, displayName: "영구 발정기 시스템:" },
						resistWithWillpower: { min: 0, max: 1, decimals: 0, displayName: "의지력으로 발정 저항:" },
					},
					spikepool: {
						herm: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 퍼플(헤름):" },
						crossdresser: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 시시 / 부치:" },
						bull: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 불:" },
						breeder: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 브리더:" },
						resistance: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 레지스턴스:" },
						continue: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 컨티뉴:" },
						passion: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 열정:" },
						dumbbitch: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 멍청한 암캐:" },
						innocence: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 이노센스:" },
						feartoxin: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 공포 독소:" },
						swell: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 부풀기:" },
						bimbo: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 빔보:" },
						cumcure: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 컴큐어:" },
						fertility: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 하이퍼 퍼틸리티:" },
						omega: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 오메가:" },
						alpha: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 알파:" },
						beta: { min: 0, max: 1, decimals: 0, displayName: "몰래 먹이기 후보 - 베타:" },
					},
					spikerates: {
						herm: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 퍼플(헤름):" },
						crossdress: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 시시 / 부치:" },
						bull: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 불:" },
						breeder: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 브리더:" },
						resistance: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 레지스턴스:" },
						continue: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 컨티뉴:" },
						passion: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 열정:" },
						"dumb-bitch": { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 멍청한 암캐:" },
						innocence: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 이노센스:" },
						feartoxin: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 공포 독소:" },
						swell: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 부풀기:" },
						bimbo: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 빔보:" },
						cumcure: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 컴큐어:" },
						fertility: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 하이퍼 퍼틸리티:" },
						portal: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 포털:" },
						omega: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 오메가:" },
						alpha: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 알파:" },
						beta: { min: 1, max: 10, decimals: 0, displayName: "몰래 먹이기 빈도 - 베타:" },
					},
				},
				identity: {
					presentation: {
						pronouns: {
							masculine: {
								reject: { bool: true, displayName: "남성적 대명사 거부:" },
								acceptance: { bool: true, displayName: "남성적 대명사 수용:" },
							},
							feminine: {
								reject: { bool: true, displayName: "여성적 대명사 거부:" },
								acceptance: { bool: true, displayName: "여성적 대명사 수용:" },
							},
							neutral: {
								reject: { bool: true, displayName: "중성적 대명사 거부:" },
								acceptance: { bool: true, displayName: "중성적 대명사 수용:" },
							},
							preferredMasculine: { bool: true, displayName: "남성적 대명사 선호:" },
							preferredFeminine: { bool: true, displayName: "여성적 대명사 선호:" },
							preferredNeutral: { bool: true, displayName: "중성적 대명사 선호:" },
							pronounDynamicMode: { strings: ["", "body", "clothing", "appearance", "posture"], displayName: "선호 대명사의 기준:" },
						},
						makeup: {
							wearing: {
								reject: { bool: true, displayName: "화장함 거부:" },
								acceptance: { bool: true, displayName: "화장함 수용:" },
							},
							bare: {
								reject: { bool: true, displayName: "민낯 거부:" },
								acceptance: { bool: true, displayName: "민낯 수용:" },
							},
							preferred: { strings: ["wearing", "bare", "n"], displayName: "선호 화장:" },
						},
						appearance: {
							masculine: {
								reject: { bool: true, displayName: "남성적 외모 거부:" },
								acceptance: { bool: true, displayName: "남성적 외모 수용:" },
							},
							feminine: {
								reject: { bool: true, displayName: "여성적 외모 거부:" },
								acceptance: { bool: true, displayName: "여성적 외모 수용:" },
							},
							neutral: {
								reject: { bool: true, displayName: "중성적 외모 거부:" },
								acceptance: { bool: true, displayName: "중성적 외모 수용:" },
							},
							preferred: { strings: ["m", "f", "n"], displayName: "선호 성별 외모:" },
						},
						clothing: {
							masculine: {
								reject: { bool: true, displayName: "남성적 의상 거부:" },
								acceptance: { bool: true, displayName: "남성적 의상 수용:" },
							},
							feminine: {
								reject: { bool: true, displayName: "여성적 의상 거부:" },
								acceptance: { bool: true, displayName: "여성적 의상 수용:" },
							},
							neutral: {
								reject: { bool: true, displayName: "중성적 의상 거부:" },
								acceptance: { bool: true, displayName: "중성적 의상 수용:" },
							},
							preferred: { strings: ["m", "f", "u", "n"], displayName: "선호 의상:" },
						},
					},
				},
				wli: {
					cfg: {
						bodywritinglvl: { min: 0, max: 2, decimals: 0, displayName: "원혼의 초자연적 몸 낙서:" },
						tattoodream: { bool: true, displayName: "원혼 문신 - 악몽을 꾸는 중에도:" },
						tattoobypass: { bool: true, displayName: "원혼의 기존 문신 덮어쓰기 허용:" },
						nosocialrng: { bool: true, displayName: "원혼 소셜 탭 무작위 등장 끄기:" },
						notentacles: { bool: true, displayName: "원혼 촉수 끄기:" },
					},
				},
				shopDefaults: {
					alwaysBackToShopButton: { bool: true },
					color: {
						strings: ["black", "blue", "brown", "green", "pink", "purple", "red", "tangerine", "teal", "white", "yellow", "custom", "random"],
					},
					colourItems: { strings: ["disable", "random", "default"] },
					compactMode: { bool: true },
					disableReturn: { bool: true },
					highContrast: { bool: true },
					mannequinGender: { strings: ["same", "opposite", "male", "female"] },
					mannequinGenderFromClothes: { bool: true },
					noHelp: { bool: true },
					noTraits: { bool: true },
					secColor: {
						strings: ["black", "blue", "brown", "green", "pink", "purple", "red", "tangerine", "teal", "white", "yellow", "custom", "random"],
					},
				},
				wardrobeDefaults: {
					showTraits: { bool: false },
					extraInfo: { bool: false },
				},
			};
			const optKr = { fahrenheit: "온도 단위로 화씨(F) 사용", mapLegacy: "SVG 지도 비활성화", autosaveDisabled: "잠잘 때 자동 저장 비활성화", listboxOutfitsEnabled: "기상 후 옷차림 메뉴 스타일", lowerHalo: "우산을 들고 있을 때 후광 낮추기", showUiBar: "사이드바에 화살표 버튼 표시", bigCanvas: "사이드뷰 캔버스 확대", showSidebarEffects: "플레이어 캔버스 주변에 효과 표시", showExactMeasurements: "정확한 수치 표시", targetYourself: "대상을 '자신'으로 지정", scrollRemember: "전투 중 스크롤 위치 복구", textAnimsAll: "모든 텍스트 애니메이션", textAnimsDrunk: "취기 흔들림 애니메이션", textAnimsHeat: "발정기/러트 떨림 애니메이션", textAnimsHypno: "최면 나선 애니메이션", textAnimsGlitch: "글리치 효과 애니메이션", weatherUpdate: "사이드바 날씨 렌더러 사용", reflections: "물 반사 렌더링", topdownBreastjob: "하향식 파이즈리 활성화", confirmDialogUponTabClose: "탭을 닫을 때 확인 대화창 표시", showGameVersion: "오른쪽 위에 게임 버전 표시", postureAffectsVoice: "성별 자세가 목소리에 영향", muteonhide: "화면이 가려지면 음소거", audio: "오디오 활성화", voiceoverAudio: "플레이어 음성 활성화", npcVoiceoverAudio: "NPC 음성 활성화", useAltImg: "성별에 따라 스프라이트 세트 교체", altImgAlways: "대체 스프라이트 세트를 항상 사용", showCombatImgWhileStanding: "서 있는 동안에도 전투 이미지 표시", showCurrentSexIcon: "사이드바에 성별 기호 표시", currentSexIconIdentity: "사이드바 기호", showPortalXray: "포털 엑스레이 컷인 표시", mastervolume: "전체 음량", bgm_volume: "배경 음악", bgs_volume: "배경 효과음", ambience_volume: "환경음", voice_volume: "음성", nonCombatMoanVolume: "전투 외 흥분 신음", male: "남성", female: "여성", sissy: "시시", butch: "부치", herm: "헤름" }; Object.assign(result.options, {
				theme: {
					strings: ["system-default", "dark", "light", "arctic", "zen", "monokai", "storm", "latte", "frappe", "macchiato", "mocha", "sea"],
					displayName: "테마:",
				},
				passageMaxWidth: { default: 0, strings: [0, 50, 55, 60, 65, 70, 75], displayName: "본문 너비:" },
				thermometerDisplay: { strings: ["", ...Array.from({ length: 9 }, (_, i) => `modded${i + 1}`)], displayName: "온도계 표시:" },
				NnpcDisplaySystem: { strings: ["none", "vanilla", "dolp"], displayName: "네임드 NPC 표시 방식:" },
				nnpcDisplay: {
					strings: [0, ...setup.NPCNameList.filter(name => name !== "Luchifen").map(name => name.toLowerCase().replaceAll(" ", "_")), "others"],
					displayName: "네임드 NPC 스프라이트:",
				},
				nnpcDisplayGender: { strings: ["male", "female", "monster"], displayName: "NPC 스프라이트 성별:" },
				nnpcDisplayLayer: { strings: ["front", "back"], displayName: "NPC 스프라이트 레이어:" },
				nnpcDisplaySkin: { strings: ["pale", "dark", "monster"], displayName: "NPC 스프라이트 피부:" },
				nnpcDisplaySlot: { min: 0, max: 9, decimals: 0, displayName: "NPC 스프라이트 슬롯:" },
				altImgGender: { strings: ["m", "f"], displayName: "대체 스프라이트 세트 성별:" },
				showCombatImgWhenGender: { strings: ["both", "m", "f"], displayName: "성별이 다음일 때 전투 이미지 표시:" },
				fishingBaitSelection: { strings: ["sidebar", "dropdown"], displayName: "미끼 선택 방식:" },
				debugdisable: { bool: true, boolLetter: true, displayName: "추가 에러 메시지:" },
				statNerf: { min: 0, max: 100, decimals: 0, displayName: "능력치 너프 배율:" },
				zoom: { min: 50, max: 200, decimals: 0, displayName: "확대 크기:" },
			});
			for (const key of [
				"fahrenheit",
				"mapLegacy",
				"autosaveDisabled",
				"listboxOutfitsEnabled",
				"lowerHalo",
				"showUiBar",
				"bigCanvas",
				"showSidebarEffects",
				"showExactMeasurements",
				"targetYourself",
				"scrollRemember",
				"textAnimsAll",
				"textAnimsDrunk",
				"textAnimsHeat",
				"textAnimsHypno",
				"textAnimsGlitch",
				"weatherUpdate",
				"reflections",
				"topdownBreastjob",
				"confirmDialogUponTabClose",
				"showGameVersion",
			]) {
				result.options[key] = { bool: true, displayName: `${optKr[key] || key}:` };
			}
			for (const key of [
				"postureAffectsVoice",
				"muteonhide",
				"audio",
				"voiceoverAudio",
				"npcVoiceoverAudio",
				"useAltImg",
				"altImgAlways",
				"showCombatImgWhileStanding",
				"showCurrentSexIcon",
				"currentSexIconIdentity",
				"showPortalXray",
			]) {
				result.options[key] = { min: 0, max: 1, decimals: 0, displayName: `${optKr[key] || key}:` };
			}
			for (const key of ["mastervolume", "bgm_volume", "bgs_volume", "ambience_volume", "voice_volume", "nonCombatMoanVolume"]) {
				result.options[key] = { min: 0, max: 1, decimals: 2, displayName: `${optKr[key] || key}:` };
			}
			result.options.voiceConfig = Object.fromEntries(
				["male", "female", "sissy", "butch", "herm"].map(key => [
					key,
					{
						enabled: { bool: true, displayName: `${optKr[key] || key} 음성 사용:` },
						voice: { strings: ["v1", "v2", "m"], displayName: `${optKr[key] || key} 음성:` },
						npc: { strings: ["all", "m", "f", "off"], displayName: `${optKr[key] || key} NPC 음성:` },
					},
				])
			);
			result.options.autoNNPCDisplay = { enabled: { bool: true, displayName: "자동 모드:" } };
			for (const name of [...setup.NPCNameList.filter(name => name !== "Luchifen"), "Others"]) { const nameKr = name === "Others" ? "기타" : window.KR && window.KR.gatPersonNameDictKR ? window.KR.gatPersonNameDictKR(name) : name;
				result.options.autoNNPCDisplay[name.toLowerCase().replaceAll(" ", "_")] = {
					genderOverride: { bool: true, displayName: `${nameKr} 스프라이트 성별 지정:` },
					gender: { strings: ["", "male", "female", "monster"], displayName: `${nameKr} 스프라이트 성별:` },
					skin: { strings: ["pale", "dark", "monster"], displayName: `${nameKr} 스프라이트 피부:` },
					slot: { min: 0, max: 9, decimals: 0, displayName: `${nameKr} 스프라이트 슬롯:` },
					layer: { strings: ["front", "back"], displayName: `${nameKr} 스프라이트 레이어:` },
				};
			}
			result.identity.body = {}; const giKr = { chest: "가슴 크기", bottom: "엉덩이 크기", genitals: "성기", hairlength: "머리카락 길이", bodysize: "체격", lactation: "모유 분비", pregnancy: "임신" }, giChoiceKr = { chest: { flat: "납작", small: "작음", medium: "보통", big: "큼" }, bottom: { small: "작음", medium: "보통", big: "큼" }, genitals: { vagina: "보지", tinypenis: "아주 작은 자지", smallpenis: "작은 자지", mediumpenis: "보통 자지", bigpenis: "큰 자지" }, hairlength: { short: "짧음", medium: "중간", long: "긺" }, bodysize: { miniature: "소형", tiny: "아주 작음", small: "작음", normal: "보통", tall: "장신", large: "대형", giant: "거대" } };
			for (const [group, choices] of Object.entries({
				chest: ["flat", "small", "medium", "big"],
				bottom: ["small", "medium", "big"],
				genitals: ["vagina", "tinypenis", "smallpenis", "mediumpenis", "bigpenis"],
				hairlength: ["short", "medium", "long"],
				bodysize: ["miniature", "tiny", "small", "normal", "tall", "large", "giant"],
			})) {
				result.identity.body[group] = Object.fromEntries(
					choices.map(choice => [
						choice,
						{
							reject: { bool: true, displayName: `${giKr[group] || group} ${(giChoiceKr[group] || {})[choice] || choice} 거부:` },
							acceptance: { bool: true, displayName: `${giKr[group] || group} ${(giChoiceKr[group] || {})[choice] || choice} 수용:` },
						},
					])
				);
				result.identity.body[group].preferred = { strings: choices, displayName: `선호 ${giKr[group] || group}:` };
			}
			result.identity.body.genitals.preferred = { strings: [false, "vagina", "tinypenis", "smallpenis", "mediumpenis", "bigpenis"] };
			result.identity.body.genitals.preferredPenis = { strings: [false, "tinypenis", "smallpenis", "mediumpenis", "bigpenis"] };
			result.identity.body.genitals.preferredVagina = { bool: true };
			for (const group of ["lactation", "pregnancy"]) {
				result.identity.body[group] = {
					reject: { bool: true, displayName: `${giKr[group] || group} 거부:` },
					acceptance: { bool: true, displayName: `${giKr[group] || group} 수용:` },
					preferred: { strings: ["none", group], displayName: `${giKr[group] || group} 선호:` },
				};
			}
			break;
		case "npc":
			result = {
				pronoun: { strings: ["m", "f"], displayName: "성별: ", textMap: { none: "해당 없음", m: "남성", f: "여성" } },
				gender: { strings: ["m", "f"], displayName: "생식기: ", textMap: { none: "해당 없음", m: "자지", f: "보지" } },
				skincolour: {
					strings: ["white", "black", "ghost"],
					displayName: "피부 톤: ",
					textMap: { none: "해당 없음", white: "창백함", black: "짙음", ghost: "유령처럼 창백함" },
				},
				penissize: {
					min: 0,
					max: 5,
					decimals: 0,
					displayName: "자지 크기: ",
					textMap: {
						0: "없음",
						1: "작은",
						2: "보통",
						3: "큰",
						4: "거대한",
						5: "초거대한",
					},
				},
				breastsize: {
					min: 0,
					max: 12,
					decimals: 0,
					displayName: "가슴 크기: ",
					textMap: {
						none: "해당 없음",
						0: "납작한",
						1: "아주 작은",
						2: "작은",
						3: "봉긋한",
						4: "볼륨있는",
						5: "글래머한",
						6: "꽉 찬",
						7: "풍만한",
						8: "큰",
						9: "커다란",
						10: "거대한",
						11: "엄청난",
						12: "어마어마한",
					},
				},
				maxOrgasms: {
					min: 1,
					max: 5,
					decimals: 0,
					displayName: "기본 최대 절정 횟수: ",
				},
			};
			break;
	}
	if (type === "starting") {
		result.player.skin.faceFreckles = result.player.freckles;
		delete result.player.freckles;
		result.player.skin.bodyFreckles = { strings: ["none", "upper", "full", "random"], displayName: "몸 주근깨:", randomize: "characterAppearance" };
	} else if (type === "general") {
		for (const key of [
			"beastMaleChance",
			"beastMaleChanceMale",
			"beastMaleChanceFemale",
			"beastMaleChanceSplit",
			"bestialityEnabled",
			"monsterChance",
			"monsterHallucinationsOnly",
			"darkSkinChance",
		])
			delete result.settings[key];
		for (const beast of C.namedBeasts) delete result[beast + "monster"];
		result.options.tipdisable = { bool: true, displayName: "사이드바 힌트 및 팁:" };
		result.settings.granularBeastControl = { bool: true, displayName: "세부 짐승 선호 설정:" };
		result.settings.skinToneMin = { min: 0, max: 100, decimals: 0, displayName: "가장 밝은 NPC 피부 톤:", randomize: "encounter" };
		result.settings.skinToneMode = { min: 0, max: 100, decimals: 0, displayName: "가장 흔한 NPC 피부 톤:", randomize: "encounter" };
		result.settings.skinToneMax = { min: 0, max: 100, decimals: 0, displayName: "가장 어두운 NPC 피부 톤:", randomize: "encounter" };
		result.settings.beastSettings = {};
		for (const beast of C.beastSettingTypes) {
			result.settings.beastSettings[beast] = {
				monsterChance: { min: 0, max: 100, decimals: 0 },
				hallucinationsOnly: { bool: true },
				maleChance: { min: 0, max: 100, decimals: 0 },
				maleChanceMale: { min: 0, max: 100, decimals: 0 },
				maleChanceFemale: { min: 0, max: 100, decimals: 0 },
				maleChanceSplit: { bool: true },
				bestiality: { strings: ["on", "off", "monsterOnly"] },
				victimsAlwaysMonster: { bool: true },
			};
		}
		result.settings.namedBeasts = Object.fromEntries(
			C.namedBeasts.map(beast => [
				beast,
				{
					monsterChance: { min: 0, max: 100, decimals: 0, displayName: `${({ blackwolf: "검은 늑대", greathawk: "거대 매", nightmonster: "밤의 괴물" })[beast] || beast} 수인 출현 확률:`, randomize: "encounter" },
					hallucinationsOnly: { bool: true, displayName: `${({ blackwolf: "검은 늑대", greathawk: "거대 매", nightmonster: "밤의 괴물" })[beast] || beast} 수인은 환각 상태에서만 출현:`, randomize: "encounter" },
				},
			])
		);
		result.genericBeastSettings = {
			beastMaleChance: { min: 0, max: 100, decimals: 0, displayName: "당신에게 끌리는 짐승 중 수컷의 비율:", randomize: "encounter" },
			beastMaleChanceMale: { min: 0, max: 100, decimals: 0, displayName: "남성에게 끌리는 짐승:", randomize: "encounter" },
			beastMaleChanceFemale: { min: 0, max: 100, decimals: 0, displayName: "여성에게 끌리는 짐승:", randomize: "encounter" },
			beastMaleChanceSplit: { bool: true, displayName: "외모 성별에 따라 짐승의 끌림 구분:" },
			monsterHallucinationsOnly: { bool: true, displayName: "수인은 환각 상태에서만 출현:", randomize: "encounter" },
			monsterChance: {
				min: 0,
				max: 100,
				decimals: 0,
				displayName: "짐승이 수인으로 대체되는 비율:",
				randomize: "encounter",
			},
			bestiality: { strings: ["on", "off", "monsterOnly"], displayName: "수간:" },
			victimsAlwaysMonster: { bool: true, displayName: "피해자가 되는 짐승은 항상 수인으로 나타남:", randomize: "encounter" },
		};
	} else if (type === "npc") {
		result.skincolour = { min: 0, max: 100, decimals: 0, displayName: "피부 톤:" };
		result.skinType = { strings: ["normal", "ghost"], displayName: "피부 유형:" };
	}
	return result;
}
window.settingsObjects = settingsObjects;

/* Converts specific settings to so they don't look so chaotic to players */
function settingsConvert(exportType, type, settings) {
	const listObject = settingsObjects(type);
	const result = settings;
	const keys = Object.keys(listObject);
	for (let i = 0; i < keys.length; i++) {
		if (result[keys[i]] === undefined) continue;
		if (["map", "player", "shopDefaults", "options", "wardrobeDefaults", "combatExtended", "AMCTraits"].includes(keys[i])) {
			const itemKey = Object.keys(listObject[keys[i]]);
			for (let j = 0; j < itemKey.length; j++) {
				if (result[keys[i]][itemKey[j]] === undefined) continue;
				const keyArray = Object.keys(listObject[keys[i]][itemKey[j]]);
				if (exportType) {
					if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
						if (result[keys[i]][itemKey[j]] === "t") {
							result[keys[i]][itemKey[j]] = true;
						} else if (result[keys[i]][itemKey[j]] === "f") {
							result[keys[i]][itemKey[j]] = false;
						}
					}
				} else {
					if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
						if (result[keys[i]][itemKey[j]] === true) {
							result[keys[i]][itemKey[j]] = "t";
						} else if (result[keys[i]][itemKey[j]] === false) {
							result[keys[i]][itemKey[j]] = "f";
						}
					}
				}
			}
		} else {
			const keyArray = Object.keys(listObject[keys[i]]);
			if (exportType) {
				if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
					if (result[keys[i]] === "t") {
						result[keys[i]] = true;
					} else if (result[keys[i]] === "f") {
						result[keys[i]] = false;
					}
				}
			} else {
				if (keyArray.includes("boolLetter") && keyArray.includes("bool")) {
					if (result[keys[i]] === true) {
						result[keys[i]] = "t";
					} else if (result[keys[i]] === false) {
						result[keys[i]] = "f";
					}
				}
			}
		}
	}
	return result;
}
window.settingsConvert = settingsConvert;

window.loadExternalExportFile = function () {
	importScripts("DolSettingsExport.js")
		.then(function () {
			const textArea = document.getElementById("settingsDataInput");
			textArea.value = JSON.stringify(DolSettingsExport);
		})
		.catch(function () {
			// console.log(err);
			const button = document.getElementById("LoadExternalExportFile");
			button.value = "불러오기 오류";
		});
};

/**
 * Background traits that the character creation UI (settings.twee) treats as mutually exclusive within each group (its checkboxes grey each other out via data-disabledif).
 * Independently randomizing every background boolean can otherwise select several traits from the same group at once (e.g. Nerd + Athlete, or Crossdresser + Transgender + Gender-Anxious),
 * which locks the player out of ever unchecking them since each one's checkbox is disabled by the others.
 *
 * @type {string[][]}
 */
const exclusiveBackgroundTraitGroups = [
	["nerd", "athlete", "delinquent"],
	["crossdresser", "genderAnxious", "transgender"],
];

/**
 * Collapse each mutually-exclusive background trait group down to at most one active trait, keeping a random one from those the walk happened to roll true.
 *
 * @param {object} starting the "starting" branch of a randomizeSettings() result
 */
function resolveExclusiveBackgroundTraits(starting) {
	const background = starting?.background;
	if (!background) return;

	for (const group of exclusiveBackgroundTraitGroups) {
		const active = group.filter(key => background[key] === true);
		if (active.length <= 1) continue;
		const keep = active.random();
		for (const key of active) {
			if (key !== keep) background[key] = false;
		}
	}
}

/**
 * Random talents can exceed the normal character creation limit.
 * Trim each talent group to a random valid amount so random characters keep a legal set of talents.
 *
 * @param {object} general Randomised general settings
 * @param {object} starting Randomised starting settings, including background
 */
function resolveRandomizedTalents(general, starting) {
	const traits = general?.AMCTraits;
	const groups = window.autismTalentGroups;
	if (!traits || !groups) return;

	const bonusActive = starting?.background?.autism ?? V.background?.autism ?? false;
	for (const [group, stats] of Object.entries(groups)) {
		const taken = stats.filter(stat => traits[stat] === 2);
		const limit = autismTalentLimit(group, bonusActive === true);
		while (taken.length > limit) traits[taken.pluck()] = 1;
	}
}

/**
 * gender_body is not set directly during character creation, but "randomize everything" can still randomize it separately from sex.
 * This can give it the wrong value, including "a" (herm), even when the character only has one set of genitals.
 * Keep gender_body matched to the randomized sex, or the current sex if sex was not randomized.
 *
 * @param {object} starting The "starting" branch returned by randomizeSettings().
 */
function resolveRandomizedGenderBody(starting) {
	const player = starting?.player;
	if (!player) return;
	player.gender_body = player.sex ?? V.player?.sex;
}

/**
 * Body part sizes and the min/max growth limits are separate settings, so a full random start can roll a character whose breasts,
 * bottom or penis start outside their own growth range - a size that can then never change. Clamp the starting sizes into the limits.
 *
 * @param {object} general Randomised general settings
 * @param {object} starting Randomised starting settings
 */
function resolveRandomizedBodySizes(general, starting) {
	const player = starting?.player;
	if (!player) return;

	for (const size of ["breastsize", "bottomsize", "penissize"]) {
		if (player[size] == null) continue;
		const min = general?.[size + "min"] ?? V[size + "min"];
		const max = general?.[size + "max"] ?? V[size + "max"];
		if (!Number.isFinite(min) || !Number.isFinite(max)) continue;
		player[size] = Math.clamp(player[size], Math.min(min, max), Math.max(min, max));
	}
}

/**
 * The three NPC skin tone settings are rolled independently, so put them back in order: lightest <= most common <= darkest.
 *
 * @param {object} general Randomised general settings
 */
function resolveRandomizedSkinTones(general) {
	const settings = general?.settings;
	if (!settings) return;
	const keys = ["skinToneMin", "skinToneMode", "skinToneMax"];
	const rolled = keys.filter(key => settings[key] != null);
	if (!rolled.length) return;
	const tones = keys.map(key => settings[key] ?? V.settings[key]).sort((a, b) => a - b);
	keys.forEach((key, i) => (settings[key] = tones[i]));
}

/**
 * Randomised generic beast settings apply to every beast type, the same way the settings menu's "all beasts" controls do.
 *
 * @param {object} general Randomised general settings
 */
function resolveRandomizedBeasts(general) {
	const generic = general?.genericBeastSettings;
	if (!generic) return;
	const map = {
		beastMaleChance: "maleChance",
		beastMaleChanceMale: "maleChanceMale",
		beastMaleChanceFemale: "maleChanceFemale",
		monsterChance: "monsterChance",
		monsterHallucinationsOnly: "hallucinationsOnly",
		victimsAlwaysMonster: "victimsAlwaysMonster",
	};
	general.settings ??= {};
	general.settings.beastSettings ??= {};
	for (const type of C.beastSettingTypes) {
		const target = (general.settings.beastSettings[type] ??= {});
		for (const [from, to] of Object.entries(map)) {
			if (generic[from] != null) target[to] = generic[from];
		}
	}
}

/**
 * @param {string} filter
 * @returns {string}
 */
function randomizeSettings(filter) {
	const result = {};

	/**
	 * Recursively randomise every setting with a concrete set of valid values.
	 * A filter keeps the existing category links scoped to explicitly tagged settings;
	 * the full random game mode deliberately includes every toggle, slider and choice.
	 *
	 * @param {object} config
	 * @returns {object}
	 */
	const randomizeSettingsWalk = config => {
		const output = {};
		for (const key of Object.keys(config)) {
			const setting = config[key];
			if (setting == null) continue;
			if (isSettingLeaf(setting)) {
				if (filter && filter !== setting.randomize) continue;
				const randomValue = randomizeSettingSet(setting);
				if (randomValue !== undefined) output[key] = randomValue;
			} else {
				const group = randomizeSettingsWalk(setting);
				if (Object.keys(group).length > 0) output[key] = group;
			}
		}
		return output;
	};

	if (V.passage === "Start") {
		result.starting = randomizeSettingsWalk(settingsObjects("starting"));
		resolveExclusiveBackgroundTraits(result.starting);
		resolveRandomizedGenderBody(result.starting);
	}

	result.general = randomizeSettingsWalk(settingsObjects("general"));
	resolveRandomizedTalents(result.general, result.starting);
	resolveRandomizedBodySizes(result.general, result.starting);
	resolveRandomizedSkinTones(result.general);
	resolveRandomizedBeasts(result.general);

	return JSON.stringify(result);
}
window.randomizeSettings = randomizeSettings;

const randomNumber = function (min, max, decimals = 0) {
	const decimalsMult = Math.pow(10, decimals);
	const minMult = Math.ceil(min * decimalsMult);
	const maxMult = Math.floor(max * decimalsMult);
	const rn = (Math.floor(Math.random() * (maxMult - minMult + 1)) + minMult) / decimalsMult;
	return parseFloat(rn.toFixed(decimals));
};

const randomizeSettingSet = function (setting) {
	let result;
	const keys = Object.keys(setting);
	if (keys.includes("min")) {
		/* randomNumbers narrows a numeric setting to the discrete values the menu actually offers, without narrowing what is valid to set or import */
		result = setting.randomNumbers ? setting.randomNumbers.random() : randomNumber(setting.min, setting.max, setting.decimals);
	}
	if (keys.includes("strings")) {
		/* randomStrings narrows what a randomised game may roll without narrowing what is valid to set or import */
		result = (setting.randomStrings ?? setting.strings).pluck();
	}
	if (keys.includes("boolLetter")) {
		result = ["t", "f"].pluck();
	}
	if (keys.includes("bool")) {
		result = [true, false].pluck();
	}
	return result;
};

/**
 * instantly moves changes made in the passage into save data without changing the passage
 * WARNING: the game __will__ re-apply passage effects after reload, be sure to account for that or avoid using it
 */
function updateMoment() {
	State.history[State.activeIndex].variables = JSON.parse(JSON.stringify(V));
}
window.updateMoment = updateMoment;

window.isJsonString = function (s) {
	try {
		JSON.parse(s);
	} catch (e) {
		return false;
	}
	return true;
};

/**
 * Recursively traverses an object, reporting an error for any NaN values or null objects or functions\
 * Example: `let result = recurseNaN(a, "a");`.
 *
 * @param {object} obj The head of the object tree.
 * @param {string} path A string to indicate the path, put the object name in quotes.
 * @param {object} result An object to store the results in. - leave blank.
 * @param {Set} hist A set used for Cycle history. - leave blank.
 */

function recurseNaN(obj, path, result = null, hist = null) {
	result = Object.assign({ nulls: [], nan: [], functions: [], cycle: [] }, result);
	if (hist == null) hist = new Set([obj]);
	/* let result = {"nulls" : [], "nan" : [], "cycle" : []}; */
	for (const [key, val] of Object.entries(obj)) {
		const newPath = `${path}.${key}`;
		if (Number.isNaN(val)) {
			result.nan.push(newPath);
			continue;
		}
		if (typeof val === "function") result.functions.push(newPath);
		if (typeof val === "object") {
			if (val === null) {
				result.nulls.push(newPath);
				continue;
			}
		} else {
			continue;
		}
		if (hist.has(val)) {
			result.cycle.push(newPath);
			continue;
		}
		hist.add(val);
		recurseNaN(val, `${newPath}`, result, hist);
	}
	return result;
}
window.recurseNaN = recurseNaN;

/**
 * Recursively traverse target object, finding and returning an object containing all the NaN vars inside.
 *
 * Use with nukeNaNs to re-assign 0 to all bad NaN'd vars.	Use with caution.
 *
 * @param {object} target The object to traverse.	Defaults to V ($).
 * @returns {object} An object containing all the properties/sub-props that were NaN.
 */
function scanNaNs(target = V) {
	// If this gets set to true during function, a NaN was hit within scope.
	let isMutated = false;
	const current = Object.create({});
	// Loop through all properties of the target for NaNs and objects to scan.
	for (const [key, value] of Object.entries(target)) {
		// If value is an object, scan that property.
		if (value && typeof value === "object") {
			const resp = scanNaNs(value);
			// If scanNaNs returns a non-null object, there was a NaN somewhere, so make sure to update current obj.
			if (resp && typeof resp === "object") {
				current[key] = resp;
				isMutated = true;
			}
		} else if (typeof value === "number") {
			// Does what it says on the tin, make sure you only test numbers.
			if (isNaN(value)) {
				// Set property to a default value, likely zero.
				current[key] = 0;
				isMutated = true;
			}
		}
	}
	// Return a fully realised object, indicating there were NaNs, or null, which can be ignored.
	// isMutated controls whether we have encountered NaNs, remember to update where necessary.
	return isMutated ? current : null;
}
window.scanNaNs = scanNaNs;

function nukeNaNs(target = V) {
	for (const key in target) {
		const value = target[key];
		if (typeof value === "object" && value !== null) nukeNaNs(value);
		else if (Number.isNaN(value)) target[key] = 0;
	}
}
window.nukeNaNs = nukeNaNs;
