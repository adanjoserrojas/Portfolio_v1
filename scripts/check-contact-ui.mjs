import assert from "node:assert/strict";
import { mkdir } from "node:fs/promises";
import { chromium } from "playwright";

// Run against a local preview configured with any nonempty public Turnstile key.
// All form submissions and the widget are mocked; this never sends notifications.
const baseURL = process.env.CONTACT_UI_URL || "http://127.0.0.1:3100";
const browser = await chromium.launch({ headless: true });
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (error) => errors.push(error.message));
let status = 403;
let submissions = 0;
await page.route("https://challenges.cloudflare.com/turnstile/v0/api.js*", (route) => route.fulfill({
  contentType: "application/javascript",
  body: `window.turnstile = {
    render(container, options) {
      const button = document.createElement('button');
      button.type = 'button';
      button.textContent = 'Complete test security check';
      button.onclick = () => options.callback('browser-token');
      container.appendChild(button);
      window.testChallenge = { container, options };
      return 'test-widget';
    },
    remove() { window.testChallenge?.container.replaceChildren(); }
  };`,
}));
await page.route("**/api/contact", async (route) => {
  submissions++;
  const body = route.request().postDataJSON();
  assert.equal(body.turnstileToken, "browser-token");
  assert.equal(body.website, "");
  assert.equal(body.message, "Testing form recovery without sending an email.");
  await route.fulfill({ status, headers: { "Content-Type": "application/json", "Retry-After": "2" },
    body: JSON.stringify({ success: status === 200 }) });
});
try {
  await page.goto(`${baseURL}/contact`);
  await page.getByRole("button", { name: "Complete test security check" }).waitFor();
  await page.getByRole("button", { name: "Send message" }).click();
  assert.equal(await page.locator("#contact-name").evaluate((element) => element === document.activeElement), true);
  await page.getByLabel("Name", { exact: true }).fill("UI Test");
  await page.getByLabel("Email address", { exact: true }).fill("ui-test@example.com");
  await page.getByLabel("Message", { exact: true }).fill("Testing form recovery without sending an email.");
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("alert").filter({ hasText: "Please complete the security check" }).waitFor();
  assert.equal(submissions, 0);
  await page.getByRole("button", { name: "Complete test security check" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("alert").filter({ hasText: "request could not be verified" }).waitFor();
  assert.equal(await page.getByLabel("Name", { exact: true }).inputValue(), "UI Test");
  status = 429;
  await page.getByRole("button", { name: "Complete test security check" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("alert").filter({ hasText: "Too many messages" }).waitFor();
  assert.equal(await page.getByRole("button", { name: /Try again in/ }).isDisabled(), true);
  assert.equal(await page.getByLabel("Email address", { exact: true }).inputValue(), "ui-test@example.com");
  await page.getByRole("button", { name: "Send message" }).waitFor();
  status = 503;
  await page.getByRole("button", { name: "Complete test security check" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("alert").filter({ hasText: "Could not send your message" }).waitFor();
  await mkdir("screenshots/contact-security", { recursive: true });
  for (const width of [320, 768, 1440]) {
    await page.setViewportSize({ width, height: 1000 });
    for (const theme of ["light", "dark"]) {
      await page.evaluate((value) => { document.documentElement.dataset.theme = value; }, theme);
      assert.equal(await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth), false);
      await page.screenshot({ path: `screenshots/contact-security/form-${width}-${theme}.png`, fullPage: true });
    }
  }
  status = 200;
  await page.getByRole("button", { name: "Complete test security check" }).click();
  await page.getByRole("button", { name: "Send message" }).click();
  await page.getByRole("status").filter({ hasText: "Your message has been submitted" }).waitFor();
  assert.equal(submissions, 4);
  assert.deepEqual(errors, []);
  console.log("Contact UI passed: validation, challenge required, 403/429/503 recovery, retry countdown, success, 320/768/1440 layouts, no page errors. Submissions mocked.");
} finally {
  await browser.close();
}
