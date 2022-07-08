import { test } from '@playwright/test';
import { urlMap } from "../src/utils/externalUrls"
import { GOOGLE_FELLOWS, PARTNERS } from "../src/pages/AboutUs/OurTeamData"
import { RESOURCES } from "../src/pages/WhatIsHealthEquity/ResourcesData"

const knownFlakyUrls = [
    "https://satcherinstitute.github.io/analysis/cdc_case_data",
    "https://satcherinstitute.github.io/analysis/cdc_death_data",
]

for (const url of Object.values(urlMap)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of PARTNERS.map(partner => partner.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Team Page - Partner: ${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of GOOGLE_FELLOWS.filter(fellow => fellow.link).map(fellow => fellow.link)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Team Page - Google Fellow: ${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" })
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of RESOURCES.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Resource Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response.status() !== 200) console.log(url, response.status());
    });
}
