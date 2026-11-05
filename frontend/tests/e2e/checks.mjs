// Shared Playwright-compatible checks; also runnable against the browser QA API.
export async function runBrowserChecks(page) {
  const results = [];
  const check = (name, value) => {
    if (!value) throw new Error(name);
    results.push(name);
  };
  await page
    .getByRole("button", { name: "کارت جدید", exact: true })
    .waitFor({ state: "visible" });
  check(
    "Exactly five columns",
    (await page.getByRole("textbox", { name: /نام ستون/ }).count()) === 5,
  );
  check(
    "Ten initial sample cards",
    (await page.getByRole("button", { name: /حذف کارت/ }).count()) === 10,
  );
  const columns = ["ideas", "todo", "doing", "review", "done"];
  for (const [index, id] of columns.entries()) {
    const column = page.getByTestId(`column-${id}`);
    await column
      .getByRole("button", { name: "افزودن کارت", exact: true })
      .click();
    const submit = page
      .getByRole("dialog")
      .getByRole("button", { name: "افزودن کارت", exact: true });
    check(`Empty title blocked in ${id}`, !(await submit.isEnabled()));
    await page.getByLabel(/عنوان کارت/).fill("   ");
    check(`Whitespace title blocked in ${id}`, !(await submit.isEnabled()));
    await page.getByLabel(/عنوان کارت/).fill(`  آزمون ${index}  `);
    if (index === 0) await page.getByLabel(/جزئیات/).fill("خط اول\nخط دوم");
    await submit.click();
    await column
      .getByRole("heading", { name: `آزمون ${index}`, exact: true })
      .waitFor({ state: "attached" });
    check(
      `Card added to selected column ${id}`,
      (await column
        .getByRole("heading", { name: `آزمون ${index}`, exact: true })
        .count()) === 1,
    );
  }
  check(
    "Counter increments after five additions",
    (await page.getByText("۱۵ کارت", { exact: true }).count()) === 1,
  );
  check(
    "Multiline details preserved",
    (await page.getByTestId("card-c11").locator("p").textContent()) ===
      "خط اول\nخط دوم",
  );
  check(
    "Optional details accepted",
    (await page.getByText("بدون جزئیات", { exact: true }).count()) === 4,
  );
  for (let index = 0; index < 5; index++) {
    await page
      .getByRole("button", { name: `حذف کارت آزمون ${index}`, exact: true })
      .click();
    await page
      .getByRole("heading", { name: `آزمون ${index}`, exact: true })
      .waitFor({ state: "detached" });
  }
  check(
    "Deletes preserve sample cards and counts",
    (await page.getByRole("button", { name: /حذف کارت/ }).count()) === 10,
  );
  for (let index = 1; index <= 5; index++) {
    const input = page.getByLabel(`نام ستون ${index}`, { exact: true });
    await input.fill(`  مرحله ${index}  `);
    await input.press("Enter");
    check(
      `Column ${index} rename trimmed`,
      (await input.evaluate((el) => el.value)) === `مرحله ${index}`,
    );
    await input.fill("");
    await input.press("Tab");
    check(
      `Column ${index} rejects empty name`,
      (await input.evaluate((el) => el.value)) === `مرحله ${index}`,
    );
    await input.fill("لغو");
    await input.press("Escape");
    check(
      `Column ${index} cancels rename`,
      (await input.evaluate((el) => el.value)) === `مرحله ${index}`,
    );
  }
  await page.getByRole("button", { name: "کارت جدید", exact: true }).click();
  await page.getByLabel(/عنوان کارت/).fill("نباید ذخیره شود");
  await page.getByRole("button", { name: "انصراف", exact: true }).click();
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check(
    "Cancel does not add a card",
    (await page.getByText("۱۰ کارت", { exact: true }).count()) === 1,
  );
  await page.getByRole("button", { name: "کارت جدید", exact: true }).click();
  check(
    "Form resets on reopen",
    (await page.getByLabel(/عنوان کارت/).evaluate((el) => el.value)) === "",
  );
  await page.getByLabel(/عنوان کارت/).press("Escape");
  await page.getByRole("dialog").waitFor({ state: "detached" });
  check(
    "Dialog dismisses with Escape",
    (await page.getByRole("dialog").count()) === 0,
  );
  return results;
}
