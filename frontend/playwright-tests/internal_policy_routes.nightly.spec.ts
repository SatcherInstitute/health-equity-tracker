import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

// use prefers-reduced-motion to prevent a11y constrast failures on unfinished fade-in animations
test.beforeEach(async ({ page }) => {
	await page.emulateMedia({ reducedMotion: "reduce" });
});

test("Gun Violence Policy Home Link Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence", { waitUntil: "commit" });
	await page
		.getByRole("heading", {
			name: "Understanding the Crisis of Gun Violence in Atlanta",
		})
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Crisis Overview Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/crisis-overview", {
		waitUntil: "commit",
	});

	await page.getByRole("heading", { name: "Crisis Overview" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Data Collection Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/data-collection", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Data Collection" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Our Findings Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/our-findings", { waitUntil: "commit" });
	await page
		.getByRole("heading", { name: "Georgia's Youth Fatality Rates" })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Current Efforts Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/current-efforts", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Current Efforts" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Reform Opportunities Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/reform-opportunities", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Reform Opportunities" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("How to Use the Data Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/how-to-use-the-data", {
		waitUntil: "commit",
	});
	await page
		.getByRole("heading", { name: "HET Data Visualization Maps and Charts" })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Community Safety FAQs Tab Loads", async ({ page }) => {
	await page.goto("/policy/gun-violence/faqs", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Community Safety FAQs" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});
