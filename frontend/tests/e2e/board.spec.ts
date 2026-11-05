import { test, expect } from "@playwright/test";
import { runBrowserChecks } from "./checks.mjs";
test.beforeEach(async ({ page }) => {
  await page.goto("/");
});
test("complete card and column workflow", async ({ page }) => {
  expect((await runBrowserChecks(page)).length).toBe(39);
});
test("keyboard transfers preserve card contents and return focus", async ({
  page,
}) => {
  const handle = page.getByRole("button", {
    name: "جابه‌جایی کارت یک شروع تازه برای برند",
    exact: true,
  });
  await handle.press("Space");
  await expect(handle).toHaveAttribute("aria-pressed", "true");
  await handle.press("ArrowLeft");
  await expect(
    page.getByText("ستون برای انجام", { exact: true }),
  ).toBeAttached();
  await handle.press("Space");
  await expect(
    page.getByTestId("column-todo").getByTestId("card-c1"),
  ).toBeAttached();
  await expect(page.getByTestId("card-c1")).toHaveCount(1);
  await expect(handle).toBeFocused();
});
test("pointer transfer into an empty column", async ({ page, isMobile }) => {
  test.skip(
    isMobile,
    "Pointer behavior is checked on desktop; mobile uses keyboard workflow.",
  );
  await page.getByRole("button", { name: "حذف کارت مرور وایرفریم‌ها" }).click();
  const handle = page.getByRole("button", {
    name: "جابه‌جایی کارت یک شروع تازه برای برند",
  });
  const from = (await handle.boundingBox())!;
  const to = (await page.getByTestId("column-review").boundingBox())!;
  await page.mouse.move(from.x + from.width / 2, from.y + from.height / 2);
  await page.mouse.down();
  await page.mouse.move(to.x + to.width / 2, to.y + 100, { steps: 20 });
  await page.mouse.up();
  await expect(
    page.getByTestId("column-review").getByTestId("card-c1"),
  ).toBeAttached();
  await expect(
    page.getByTestId("column-review").getByText("فضا برای یک کار تازه"),
  ).toHaveCount(0);
});
test("reload restores sample data", async ({ page }) => {
  await page.getByRole("button", { name: "حذف کارت مرور وایرفریم‌ها" }).click();
  await page.reload();
  await expect(page.getByTestId("card-c8")).toBeAttached();
  await expect(page.getByText("۱۰ کارت", { exact: true })).toBeVisible();
});
test("layout stays within viewport", async ({ page }) => {
  await page.getByRole("button", { name: "کارت جدید" }).waitFor();
  expect(
    await page
      .locator("html")
      .evaluate((el) => el.scrollWidth <= el.clientWidth),
  ).toBe(true);
  await page.getByRole("button", { name: "کارت جدید" }).click();
  const bounds = (await page.getByRole("dialog").boundingBox())!;
  expect(bounds.x).toBeGreaterThanOrEqual(0);
  expect(bounds.x + bounds.width).toBeLessThanOrEqual(
    page.viewportSize()!.width,
  );
});
