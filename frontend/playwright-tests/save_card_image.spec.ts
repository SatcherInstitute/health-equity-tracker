import { test } from "@playwright/test";

test("Built in card-option screenshot functionality", async ({ page }) => {
	await page.goto("/exploredata?mls=1.hiv-3.00&group1=All&dt1=hiv_prevalence");
	await page
		.locator("#rate-map")
		.getByRole("button", { name: "Card export options" })
		.click();
	await page.getByText("Copy Image To Clipboard").click();
	await page.getByText("Copied Rate map Image to").click();
	await page.getByRole("img", { name: "Preview of Rate map Image" }).click();
	await page.getByRole("button", { name: "Close" }).click();
});

test("Built in compare mode card-option screenshot functionality", async ({
	page,
}) => {
	await page.goto(
		"/exploredata?mls=1.hiv-3.poverty-5.00&group1=All&mlp=comparevars",
	);

	await page
		.locator("#rate-map2")
		.getByRole("button", { name: "Card export options" })
		.click();
	await page.getByText("Copy Side-by-Side Images To").click();
	await page.getByText("Copied Rate map Side-by-Side").click();
	await page.getByRole("img", { name: "Preview of Rate map Side-by-" }).click();
	await page.getByRole("button", { name: "Close" }).click();
});
