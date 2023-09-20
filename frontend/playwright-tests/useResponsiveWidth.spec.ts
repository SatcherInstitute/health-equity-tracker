import { test, expect } from '@playwright/test';

test.describe('useResponsiveWidth', () => {
  test('initial width', async ({page}) => {
    console.log('Starting test...');
    
    console.log('Navigating to page...');
    await page.goto('http://localhost:3000/exploredata?mls=1.covid-3.00&group1=All');
    
    const elementSelector = '#hi';
    
    console.log('Waiting for element to be visible...');
    await page.waitForSelector(elementSelector, { state: 'visible', timeout: 5000 });
    
    console.log('Checking if element exists...');
    const elementExists = await page.$(elementSelector) !== null;
    console.log(`Element exists: ${elementExists}`);
    
    console.log('Waiting for width to be set...');
    await page.waitForFunction(({selector, expectedWidth}) => {
      const element = document.querySelector(selector) as HTMLElement;
      if (element) {
        console.log('Current width:', element.offsetWidth);
      } else {
        console.log('Element not found');
      }
      return element && element.offsetWidth === expectedWidth;
    }, {selector: elementSelector, expectedWidth: 100, timeout: 5000 });
    
  
    console.log('Getting initial width...');
    const initialWidth = await page.evaluate((selector) => {
      const element = document.querySelector(selector) as HTMLElement;
      return element ? element.offsetWidth : null;
    }, elementSelector);
    
    console.log(`Initial width is: ${initialWidth}`);
    expect(initialWidth).toBe(100);
  });
});
