import { test } from "@playwright/test";

test("National Vaccination Full Test", async ({ page }) => {
	await page.goto("/exploredata?mls=1.covid_vaccinations-3.00&group1=All");
	await page
		.locator("#rate-map")
		.getByRole("heading", { name: "COVID-19 vaccination rates in" })
		.click();
	await page.getByText("Percentages Over 100%").click();
	await page
		.locator("#rate-chart")
		.getByRole("heading", { name: "COVID-19 vaccination rates in" })
		.click();
	await page.getByLabel("Bar Chart Showing COVID-19").click();
	await page
		.getByLabel("Bar Chart Showing COVID-19")
		.getByText("% vaccinated (at least one")
		.click();
	await page.getByRole("heading", { name: "Share of total COVID-19" }).click();
	await page.getByRole("button", { name: "Unknown demographic map" }).click();
	await page.getByText("% unknown", { exact: true }).click();
	await page.locator("#unknown-demographic-map").getByText("no data").click();
	await page
		.getByRole("heading", { name: "Population vs. distribution" })
		.click();
	await page
		.getByLabel("light green bars represent %")
		.getByText("% of population")
		.click();
	await page
		.getByLabel("dark green bars represent %")
		.getByText("% of all vaccinations")
		.click();
	await page.getByLabel("Comparison bar chart showing").locator("svg").click();
	await page.getByRole("heading", { name: "Summary for COVID-19" }).click();
	await page
		.getByRole("columnheader", { name: "COVID-19 vaccination rates" })
		.click();
	await page
		.getByRole("columnheader", { name: "Share of total COVID-19" })
		.click();
	await page.getByRole("columnheader", { name: "Population share" }).click();
	await page
		.getByRole("columnheader", { name: "Population percentage" })
		.click();
});

test("State Vaccination Quick Test", async ({ page }) => {
	await page.goto("/exploredata?mls=1.covid_vaccinations-3.06&group1=All");
	await page
		.locator("#rate-map")
		.getByRole("heading", { name: "COVID-19 vaccination rates in" })
		.click();
	await page.getByText("Percentages Over 100%").click();
	await page
		.locator("#madlib-box")
		.getByRole("button", { name: "California" })
		.click();
	await page.getByRole("combobox").click();
	await page.getByRole("combobox").fill("los");
	await page
		.getByRole("option", { name: "Los Angeles County, California" })
		.click();
});

test("County Vaccination Quick Test", async ({ page }) => {
	await page.goto("/exploredata?mls=1.covid_vaccinations-3.06037&group1=All");
	await page
		.getByRole("heading", {
			name: "COVID-19 vaccination rates in Los Angeles County, California",
			exact: true,
		})
		.click();
	await page
		.getByRole("img", { name: "Map showing COVID-19" })
		.getByLabel("Map showing COVID-19");
	await page.getByText("This county has a social").click();
});
