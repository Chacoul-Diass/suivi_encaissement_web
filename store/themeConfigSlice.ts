import { createSlice } from "@reduxjs/toolkit";
import themeConfig from "@/theme.config";
import { safeLocalStorage, isClient } from "@/hooks/useLocalStorage";

const initialState = {
	isDarkMode: false,
	sidebar: false,
	theme: themeConfig.theme,
	menu: themeConfig.menu,
	layout: themeConfig.layout,
	rtlClass: themeConfig.rtlClass,
	animation: themeConfig.animation,
	navbar: themeConfig.navbar,
	locale: themeConfig.locale,
	semidark: themeConfig.semidark,
	languageList: [
		{ code: "zh", name: "Chinese" },
		{ code: "da", name: "Danish" },
		{ code: "en", name: "English" },
		{ code: "fr", name: "French" },
		{ code: "de", name: "German" },
		{ code: "el", name: "Greek" },
		{ code: "hu", name: "Hungarian" },
		{ code: "it", name: "Italian" },
		{ code: "ja", name: "Japanese" },
		{ code: "pl", name: "Polish" },
		{ code: "pt", name: "Portuguese" },
		{ code: "ru", name: "Russian" },
		{ code: "es", name: "Spanish" },
		{ code: "sv", name: "Swedish" },
		{ code: "tr", name: "Turkish" },
		{ code: "ae", name: "Arabic" },
	],
};

const themeConfigSlice = createSlice({
	name: "theme",
	initialState,
	reducers: {
		toggleTheme(state, { payload }) {
			if (!isClient) return;
			payload = payload || state.theme; // light | dark | system
			safeLocalStorage.setItem("theme", payload);
			state.theme = payload;
			if (payload === "light") {
				state.isDarkMode = false;
			} else if (payload === "dark") {
				state.isDarkMode = true;
			} else if (payload === "system") {
				if (
					window.matchMedia &&
					window.matchMedia("(prefers-color-scheme: dark)").matches
				) {
					state.isDarkMode = true;
				} else {
					state.isDarkMode = false;
				}
			}

			if (state.isDarkMode) {
				document.querySelector("body")?.classList.add("dark");
			} else {
				document.querySelector("body")?.classList.remove("dark");
			}
		},
		toggleMenu(state, { payload }) {
			state.menu = payload;
		},
		toggleLayout(state, { payload }) {
			state.layout = payload;
		},
		toggleRTL(state, { payload }) {
			state.rtlClass = payload;
			document.querySelector("html")?.setAttribute("dir", payload || "");
		},
		toggleAnimation(state, { payload }) {
			if (!isClient) return;
			state.animation = payload;
			safeLocalStorage.setItem("animation", payload);
		},
		toggleNavbar(state, { payload }) {
			state.navbar = payload;
		},
		toggleSemidark(state, { payload }) {
			state.semidark = payload;
		},
		toggleSidebar(state) {
			state.sidebar = !state.sidebar;
		},
		resetToggleSidebar(state) {
			state.sidebar = false;
		},
	},
});

export const {
	toggleTheme,
	toggleMenu,
	toggleLayout,
	toggleRTL,
	toggleAnimation,
	toggleNavbar,
	toggleSemidark,
	toggleSidebar,
	resetToggleSidebar,
} = themeConfigSlice.actions;

export default themeConfigSlice.reducer;
