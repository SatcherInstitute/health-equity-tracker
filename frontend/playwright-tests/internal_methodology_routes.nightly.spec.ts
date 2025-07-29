import AxeBuilder from "@axe-core/playwright";
import { expect, test } from "@playwright/test";

test.describe.configure({ mode: "parallel" });

test("Methodology Introduction Tab Loads", async ({ page }) => {
	await page.goto("/methodology", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Methodology Introduction" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Methodology Data Sources Tab Loads", async ({ page }) => {
	await page.goto("/methodology/data-sources", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Data Sources" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Topic Categories Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Topic Categories" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Behavioral Health Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/behavioral-health", {
		waitUntil: "commit",
	});
	await page
		.getByRole("heading", { name: "Behavioral Health", exact: true })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Chronic Diseases Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/chronic-disease", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Chronic Diseases" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Community Safety Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/community-safety", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Community Safety" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("COVID-19 Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/covid", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "COVID-19", exact: true }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("HIV Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/hiv", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "HIV", exact: true }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Political Determinants Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/pdoh", {
		waitUntil: "commit",
	});
	await page
		.getByRole("heading", {
			name: "Political Determinants of Health",
			exact: true,
		})
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Social Determinants Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/sdoh", {
		waitUntil: "commit",
	});
	await page
		.getByRole("heading", {
			name: "Social Determinants of Health",
			exact: true,
		})
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Medication Utilization Tab Loads", async ({ page }) => {
	await page.goto("/methodology/topic-categories/medication-utilization", {
		waitUntil: "commit",
	});
	await page
		.getByRole("heading", { name: "Medication Utilization", exact: true })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Data Methods Tab Loads", async ({ page }) => {
	await page.goto("/methodology/definitions", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Data Methods" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Limitations Tab Loads", async ({ page }) => {
	await page.goto("/methodology/limitations", { waitUntil: "commit" });
	await page
		.getByRole("heading", { name: "Limitations and Missing Data" })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Metrics Tab Loads", async ({ page }) => {
	await page.goto("/methodology/definitions/metrics", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Metrics" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Topic Definitions Tab Loads", async ({ page }) => {
	await page.goto("/methodology/definitions/topic-definitions", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Topic Definitions" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Races and Ethnicities Definitions Tab Loads", async ({ page }) => {
	await page.goto("/methodology/definitions/races-and-ethnicities", {
		waitUntil: "commit",
	});
	await page.getByRole("heading", { name: "Races and Ethnicities" }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Age-Adjustment Tab Loads", async ({ page }) => {
	await page.goto("/ageadjustment", { waitUntil: "commit" });
	await page
		.getByRole("heading", { name: "Age-Adjustment", exact: true })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Recommended Citation Tab Loads", async ({ page }) => {
	await page.goto("/methodology/recommended-citation", { waitUntil: "commit" });
	await page
		.getByRole("heading", { name: "Recommended Citation", exact: true })
		.click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});

test("Glossary Tab Loads", async ({ page }) => {
	await page.goto("/methodology/glossary", { waitUntil: "commit" });
	await page.getByRole("heading", { name: "Glossary", exact: true }).click();
	const accessibilityScanResults = await new AxeBuilder({ page }).analyze();
	expect(accessibilityScanResults.violations).toEqual([]);
});
