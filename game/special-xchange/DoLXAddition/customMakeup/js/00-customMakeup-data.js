setup.ccmod = {
	categories: ["lipstick", "blusher", "eyeshadow", "mascara"],
	version: 201,
};

for (const category of setup.ccmod.categories) {
	setup.ccmod[`${category}_cache`] = { tmp: {}, tmp1: {} };
	if (category === "blusher") {
		setup.ccmod[`${category}_cache`]["rosy pink"] = {
			name: "장밋빛 분홍",
			blend: "#4372FF", // yes. that's blue. do NOT ask
		};
	}
}

Object.defineProperty(window, "ccmod", { get: () => State.variables.ccmod });
