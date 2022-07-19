import { test } from '@playwright/test';
import { urlMap } from "../src/utils/externalUrls"
import { GOOGLE_FELLOWS, PARTNERS } from "../src/pages/AboutUs/OurTeamData"
import { RESOURCES } from "../src/pages/WhatIsHealthEquity/ResourcesData"

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


for (const url of Object.values(urlMap)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        // @ts-ignore: Object is possibly 'null'.
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of PARTNERS.map(partner => partner.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Team Page - Partner: ${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" });
        // @ts-ignore: Object is possibly 'null'.
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of GOOGLE_FELLOWS.filter(fellow => fellow.link).map(fellow => fellow.link)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Team Page - Google Fellow: ${url}`, async ({ page }) => {
        const response = await page.goto(url, { waitUntil: "domcontentloaded" })
        // @ts-ignore: Object is possibly 'null'.
        if (response.status() !== 200) console.log(url, response.status());
    });
}

for (const url of RESOURCES.filter(resource => resource.url).map(fellow => fellow.url)) {
    if (!url || knownFlakyUrls.includes(url)) continue
    test(`Resource Page: ${url}`, async ({ page }) => {
        const response = await page.goto(url);
        // @ts-ignore: Object is possibly 'null'.
        if (response.status() !== 200) console.log(url, response.status());
    });
}
