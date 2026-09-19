import assert from 'node:assert/strict';
import { mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { resolve } from 'node:path';
import { chromium } from 'playwright';
import sharp from 'sharp';

// Run against the existing development server on port 3200.
export async function verifyBranding(page) {
  const output = 'screenshots/rind';
  mkdirSync(output, { recursive: true });
  const results = [];
  async function checkIcons(theme) {
    const visible = page.locator('#rind-workspace [data-rind-icon] img:visible');
    const count = await visible.count();
    assert.ok(count >= 2, 'Header and welcome/agent icons must be visible');
    for (const img of await visible.all()) {
      assert.equal(await img.getAttribute('src'), `/rind/icon-${theme}.svg`);
      assert.equal(await img.evaluate(el => el.complete && el.naturalWidth > 0), true);
      const background = await img.evaluate(el => {
        for (let p = el.parentElement; p; p = p.parentElement) {
          const color = getComputedStyle(p).backgroundColor;
          if (color !== 'rgba(0, 0, 0, 0)' && color !== 'transparent') return color;
        }
        return '';
      });
      const channels = background.match(/\d+/g).slice(0, 3).map(Number);
      assert.ok(channels.every(c => theme === 'dark' ? c < 40 : c > 230), `Inverted logo surface: ${background}`);
      // Inspect the supplied icon's solid first bar in the actual browser raster.
      const { data, info } = await sharp(await img.screenshot({ animations: 'disabled', scale: 'css' })).removeAlpha().raw().toBuffer({ resolveWithObject: true });
      const offset = (Math.floor(info.height / 2) * info.width + Math.floor(info.width * 210 / 800)) * info.channels;
      const pixel = [...data.subarray(offset, offset + 3)];
      assert.ok(pixel.every(c => theme === 'dark' ? c > 200 : c < 55), `Incorrect rendered icon color: ${pixel}`);
    }
    assert.equal(await page.locator('#rind-workspace').evaluate(root => [...root.querySelectorAll('*')].some(el => getComputedStyle(el).maskImage.includes('wordmark'))), false);
    return count;
  }
  for (const width of [320, 390, 768, 1440]) {
    await page.setViewportSize({ width, height: 900 });
    await page.goto('http://localhost:3200/RIND');
    await page.getByRole('button', { name: /Switch to .* theme/ }).waitFor();
    for (const theme of ['light', 'dark']) {
      if (await page.locator('html').getAttribute('data-theme') !== theme) {
        await page.getByRole('button', { name: `Switch to ${theme} theme` }).click();
      }
      const count = await checkIcons(theme);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > innerWidth), false);
      await page.screenshot({ path: `${output}/favicon-${width}-${theme}.png`, fullPage: true, animations: 'disabled' });
      results.push({ width, theme, icons: count, passed: true });
    }
  }
  // Include agent avatars, which do not appear until a sample run starts.
  await page.getByRole('button', { name: /Build something/ }).click();
  await page.getByText('Sample run complete', { exact: true }).waitFor({ timeout: 15000 });
  for (const theme of ['dark', 'light']) {
    if (await page.locator('html').getAttribute('data-theme') !== theme) await page.getByRole('button', { name: `Switch to ${theme} theme` }).click();
    await checkIcons(theme);
  }
  return { results, agentAvatars: 'passed in both themes' };
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const browser = await chromium.launch();
  try {
    console.log(JSON.stringify(await verifyBranding(await browser.newPage()), null, 2));
  } finally {
    await browser.close();
  }
}

