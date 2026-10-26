import { test, expect } from "@playwright/test";
test("log actual workouts, meals and steps; persist XP and history", async ({
  page,
}) => {
  const errors: string[] = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.goto("/");
  await expect(page.getByText("0 / 500 XP")).toBeVisible();
  await page.getByRole("button", { name: "Start workout" }).click();
  await expect(page.getByRole("button", { name: "Close workout" })).toBeFocused();
  await page.keyboard.press("Shift+Tab");
  await expect(page.getByRole("button", { name: "Finish workout" })).toBeFocused();
  await page.keyboard.press("Tab");
  await expect(page.getByRole("button", { name: "Close workout" })).toBeFocused();
  await page.getByRole("button", { name: "Finish workout" }).click();
  await expect(page.getByRole("alert")).toContainText(
    "at least one completed set",
  );
  await page
    .getByRole("spinbutton", { name: "Goblet squat set 1 reps", exact: true })
    .fill("10");
  await page
    .getByRole("spinbutton", {
      name: "Goblet squat set 1 weight in pounds",
      exact: true,
    })
    .fill("10");
  await page
    .getByRole("checkbox", {
      name: "Goblet squat set 1 completed",
      exact: true,
    })
    .check();
  await page.getByRole("button", { name: "Finish workout" }).click();
  await expect(page.getByText("First chapter", { exact: true })).toBeVisible();
  await page.getByText("Full body foundations", { exact: true }).click();
  await expect(page.getByText("Set 1: 10 reps × 10 lb")).toBeVisible();
  await page.reload();
  await expect(page.getByText("120 / 500 XP")).toBeVisible();
  await page.getByLabel("Today’s total steps").fill("8000");
  await page.getByRole("button", { name: "Save step total" }).click();
  await expect(page.getByText("170 / 500 XP")).toBeVisible();
  await page.getByRole("button", { name: "Save step total" }).click();
  await expect(page.getByText("170 / 500 XP")).toBeVisible();
  await page.getByRole("button", { name: "Fuel", exact: true }).click();
  await page.getByLabel("Food or meal").fill("Greek yogurt");
  await page.getByLabel("Calories (kcal)").fill("150");
  await page.getByLabel("Protein (g)").fill("20");
  await page.getByRole("button", { name: "Log meal", exact: true }).click();
  await expect(page.getByText("Greek yogurt", { exact: true })).toBeVisible();
  await page.reload();
  await expect(page.getByText("195 / 500 XP")).toBeVisible();
  await page.getByRole("button", { name: "Progress", exact: true }).click();
  await page.getByText("Full body foundations", { exact: true }).click();
  await expect(page.getByText("Set 1: 10 reps × 10 lb")).toBeVisible();
  expect(errors).toEqual([]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
test("navigation and empty data render without overflow", async ({ page }) => {
  await page.goto("/");
  for (const name of ["Today", "Train", "Fuel", "Progress"]) {
    await page.getByRole("button", { name, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
  }
  await expect(page.getByText("Your first chapter awaits.")).toBeVisible();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await page.screenshot({
    path: `/tmp/level-up-${test.info().project.name}.png`,
    fullPage: true,
  });
});
