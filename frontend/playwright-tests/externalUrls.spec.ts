import { test } from '@playwright/test';
import { urlMap } from "../src/utils/externalUrls.js"
import { RESOURCES, PDOH_RESOURCES, ECONOMIC_EQUITY_RESOURCES, EQUITY_INDEX_RESOURCES, AIAN_RESOURCES, API_RESOURCES, HISP_RESOURCES, MENTAL_HEALTH_RESOURCES, COVID_RESOURCES, COVID_VACCINATION_RESOURCES } from "../src/pages/WhatIsHealthEquity/ResourcesData.js"


const knownFlakyUrls = [
    "https://satcherinstitute.github.io/analysis/cdc_case_data",
    "https://satcherinstitute.github.io/analysis/cdc_death_data",
    "https://doi.org/10.1111/j.1540-5907.2011.00512.x",
    "https://doi.org/10.1146/annurev.polisci.11.053106.123839",
    "https://www.ncbi.nlm.nih.gov/pmc/articles/PMC3222512/",
    "https://www.linkedin.com/in/satcherhealth",
    "https://twitter.com/SatcherHealth",
    "https://twitter.com/repjohnlewis/status/758023941998776321?lang=en",
    "https://www.apha.org/topics-and-issues/communicable-disease/coronavirus/equity",
    "https://www.policylink.org/health-equity-resources",
    "https://www.uihi.org/resources/best-practices-for-american-indian-and-alaska-native-data-collection/",
    "https://www.atsdr.cdc.gov/placeandhealth/svi/documentation/pdf/SVI2018Documentation_01192022_1.pdf"

]

test.describe.configure({ mode: 'parallel' });

// TEST Headless Wordpress Endpoint
test(`Fetch First 100 Blog Posts`, async ({ page }) => {
    const url = "https://hetblog.dreamhosters.com/wp-json/wp/v2/posts?_embed&per_page=100"
    const response = await page.goto(url, { waitUntil: "domcontentloaded" });
    if (response?.status() !== 200) console.log(url, response?.status());
});


for (const url of Object.values(urlMap)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Resource Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of PDOH_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`PDOH_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of EQUITY_INDEX_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`EQUITY_INDEX_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of ECONOMIC_EQUITY_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`ECONOMIC_EQUITY_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of AIAN_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`AIAN_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of API_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`API_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of HISP_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`HISP_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}

for (const url of MENTAL_HEALTH_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`MENTAL_HEALTH_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}
for (const url of COVID_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`COVID_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
} for (const url of COVID_VACCINATION_RESOURCES.resources.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`COVID_VACCINATION_RESOURCES Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        if (response?.status() !== 200) console.log(url, response?.status());
    });
}
