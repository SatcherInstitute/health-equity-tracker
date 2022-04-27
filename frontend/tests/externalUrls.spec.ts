import { test } from '@playwright/test';
// import { expect, test } from '@playwright/test';
import { urlMap } from "../src/utils/externalUrls"
import { GOOGLE_FELLOWS, PARTNERS } from "../src/pages/AboutUs/OurTeamData"
import { RESOURCES } from "../src/pages/WhatIsHealthEquity/ResourcesData"



for (const url of Object.values(urlMap)) {
    if (!url) continue
    test(`External URL Test: ${url}`, async ({ page }) => {
        console.log(url);
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response.status() !== 200) console.log(response.status());
        // if (response.status() === 999) return // skip linkedin blocking
        // await expect(response.ok()).toBeTruthy()
    });
}

for (const url of PARTNERS.map(partner => partner.url)) {
    if (!url) continue
    test(`Team Page: Partner External URL Test: ${url}`, async ({ page }) => {
        console.log(url);
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response.status() !== 200) console.log(url, response.status());
        // await expect(response.ok()).toBeTruthy()
    });
}

for (const url of GOOGLE_FELLOWS.filter(fellow => fellow.link).map(fellow => fellow.link)) {
    if (!url) continue
    test(`Team Page: Google Fellow External URL Test: ${url}`, async ({ page }) => {
        console.log(url);
        const response = await page.goto(url, { waitUntil: "domcontentloaded" })
        if (response.status() !== 200) console.log(url, response.status());
        // await expect(response.ok()).toBeTruthy()
    });
}

for (const url of RESOURCES.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url) continue
    test(`Resource Page: External URL Test: ${url}`, async ({ page }) => {
        console.log(url);
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response.status() !== 200) console.log(url, response.status());
        // await expect(response.ok()).toBeTruthy()
    });
}
