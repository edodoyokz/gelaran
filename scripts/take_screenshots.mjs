import { chromium } from 'playwright';
import fs from 'fs';
import path from 'path';

(async () => {
  const stitchDir = path.resolve('stitch-designs');
  const files = fs.readdirSync(stitchDir).filter(f => f.endsWith('.html')).sort();
  
  if (files.length === 0) {
    console.log("No HTML files found.");
    process.exit(1);
  }

  console.log(`Taking high-res screenshots for ${files.length} HTML files...`);
  
  const browser = await chromium.launch();
  const page = await browser.newPage();
  
  // Set a large viewport for high quality
  await page.setViewportSize({ width: 1440, height: 1080 });
  
  for (const file of files) {
    const fpath = path.join(stitchDir, file);
    const outpath = path.join(stitchDir, file.replace('.html', '_highres.png'));
    
    try {
        await page.goto(`file://${fpath}`, { waitUntil: 'networkidle' });
        // take full page screenshot
        await page.screenshot({ path: outpath, fullPage: true });
        console.log(`Saved high-res screenshot: ${file}`);
    } catch(e) {
        console.error(`Error on ${file}:`, e);
    }
  }

  await browser.close();
  console.log("Done taking screenshots.");
})();
