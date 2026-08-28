const puppeteer = require('puppeteer');
const fs = require('fs');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto('https://ecmis-web-ta31.vercel.app/admin/news', { waitUntil: 'networkidle2' });
  
  const cssVars = await page.evaluate(() => {
    const styles = getComputedStyle(document.documentElement);
    const vars = {};
    for (const rule of document.styleSheets) {
      try {
        for (const cssRule of rule.cssRules) {
          if (cssRule.selectorText === ':root') {
             const cssText = cssRule.style.cssText;
             const parts = cssText.split(';');
             for (const part of parts) {
                const [key, val] = part.split(':');
                if (key && key.trim().startsWith('--')) {
                   vars[key.trim()] = val.trim();
                }
             }
          }
        }
      } catch (e) {}
    }
    // Also get specific element styles
    const sidebar = document.querySelector('.sidebar');
    const main = document.querySelector('.main-content');
    
    return {
      vars,
      sidebarBg: sidebar ? getComputedStyle(sidebar).backgroundColor : null,
      sidebarColor: sidebar ? getComputedStyle(sidebar).color : null,
      mainBg: main ? getComputedStyle(main).backgroundColor : null,
    };
  });
  
  fs.writeFileSync('styles.json', JSON.stringify(cssVars, null, 2));
  await browser.close();
})();
