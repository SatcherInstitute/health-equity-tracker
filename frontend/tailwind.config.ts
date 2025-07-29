import type { Config } from "tailwindcss";
import {
	het,
	ThemeBorderRadii,
	ThemeBoxShadows,
	ThemeFontSizes,
	ThemeFonts,
	ThemeLineHeights,
	ThemeStandardScreenSizes,
	ThemeZIndexValues,
} from "./src/styles/DesignTokens";

export default {
	content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
	important: true,
	theme: {
		screens: ThemeStandardScreenSizes,
		maxHeight: ThemeStandardScreenSizes,
		maxWidth: ThemeStandardScreenSizes,
		borderRadius: ThemeBorderRadii,
		boxShadow: ThemeBoxShadows,
		colors: het,
		fontSize: ThemeFontSizes,
		fontFamily: ThemeFonts,
		lineHeight: ThemeLineHeights,

		// TODO: improve this hack that convinces TS that Tailwind can use z index numbers (not only strings)
		zIndex: ThemeZIndexValues as Record<string, unknown> as Record<
			string,
			string
		>,
		extend: {
			maxHeight: {
				aimToGo: "255px",
				articleLogo: "700px",
			},
			maxWidth: {
				aimToGo: "255px",
				menu: "320px",
				onThisPageMenuDesktop: "200px",
				articleLogo: "700px",
				teamHeadshot: "181px",
				teamLogo: "250px",
				exploreDataPage: "1500px",
				exploreDataTwoColumnPage: "2500px",
				newsText: "800px",
				equityLogo: "400px",
				helperBox: "1200px",
			},
			minHeight: {
				multimapMobile: "125px",
				multimapDesktop: "175px",
				"preload-article": "750px",
			},
			height: {
				littleHetLogo: "30px",
				joinEffortLogo: "720px",
			},
			width: {
				littleHetLogo: "30px",
				joinEffortLogo: "600px",
				"90p": "90%",
				"98p": "98%",
				onThisPageMenuDesktop: "192px",
			},
			padding: {
				"1p": "1%",
				"15p": "15%",
			},
			// for use w/spacing utilities: 'm', 'p', 'gap', etc.
			spacing: {
				cardGutter: "8px",
				footer: "10rem",
			},
			strokeWidth: {
				"2.5": "2.5",
				"5.5": "5.5",
			},
		},
	},
	plugins: [],
} satisfies Config;
