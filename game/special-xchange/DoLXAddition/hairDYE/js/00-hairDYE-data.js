setup.dhmod = {
	// extend the dict below if you have more custom gradients
	gradients: {
		"낮은 옴브레": "low-ombre",
		"높은 옴브레": "high-ombre",
		Split: "split",
		"얼굴 주변 하이라이트": "face-frame",
	},
	moddedGradients: {
		"낮은 옴브레": "modded-low-ombre",
		"높은 옴브레": "modded-high-ombre",
		Split: "modded-split",
		"얼굴 주변 하이라이트": "modded-face-frame",
		Scene: "modded-scene",
		"흐려지는 씬 스타일": "modded-scene-fade",
		Checker: "modded-checker",
		"흐려지는 체커 스타일": "modded-checker-fade",
		Wink: "modded-wink",
	},
	filter_cache: {
		tmp0: {},
		tmp1: {},
	},
};

Object.defineProperty(window, "dhmod", { get: () => State.variables.dhmod });
