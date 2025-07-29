import { test } from "@playwright/test";

test(`Site Loads`, async ({ page, baseURL }) => {
	console.info(`Running tests against: ${baseURL}`);
	await page.goto("/", { waitUntil: "commit" });
});
