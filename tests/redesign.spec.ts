import { test, expect } from "@playwright/test";

test("preserves original local records, unknown macros and the XP system", async ({
  page,
}) => {
  await page.addInitScript(() => {
    const now = new Date(),
      date = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
    localStorage.setItem(
      "levelup-react-v1",
      JSON.stringify({
        history: [
          {
            id: "original-workout",
            date,
            name: "Upper body builder",
            xp: 120,
            exercises: [
              { name: "Bicep curl", sets: [{ reps: 10, weight: 5 }] },
            ],
          },
        ],
        food: [
          {
            id: "original-meal",
            date,
            name: "My original lunch",
            calories: 450,
            protein: 30,
          },
        ],
        steps: { [date]: 8000 },
      }),
    );
  });
  await page.goto("/");
  await expect(
    page.getByRole("progressbar", { name: "Level XP progress" }),
  ).toHaveAttribute("aria-valuenow", "195");
  await page.getByText("Upper body builder", { exact: true }).last().click();
  await expect(page.getByText("Set 1: 10 reps × 5 lb")).toBeVisible();
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  await expect(
    page.getByText("My original lunch", { exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Uncategorized" }),
  ).toBeVisible();
  await expect(page.getByText(/Earlier entries didn’t track/)).toBeVisible();
  await page.getByRole("button", { name: "My targets" }).click();
  await page.getByLabel("Daily calories (kcal)").fill("1800");
  await page.getByRole("button", { name: "Save targets" }).click();
  const stored = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(stored.history[0].exercises[0].sets).toEqual([
    { reps: 10, weight: 5 },
  ]);
  expect(stored.food[0]).toEqual(
    expect.objectContaining({
      name: "My original lunch",
      calories: 450,
      protein: 30,
    }),
  );
  expect(stored.food[0].carbs).toBeUndefined();
  expect(stored.targets.calories).toBe(1800);
});

test("swap, annotate, reschedule and persist a workout without granting XP", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose for today", exact: true })
    .first()
    .click();
  await page.getByRole("button", { name: "Edit plan", exact: true }).click();
  await page
    .getByRole("combobox", { name: "Workout", exact: true })
    .selectOption("1");
  await page.getByLabel("A note for yourself").fill("A comfortable pace");
  const tomorrow = await page.evaluate(() => {
    const d = new Date();
    d.setDate(d.getDate() + 1);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });
  await page.getByLabel("Scheduled date").fill(tomorrow);
  await page.getByRole("button", { name: "Save plan" }).click();
  await expect(
    page.getByRole("button", { name: /Planned for/ }),
  ).toBeDisabled();
  await expect(page.getByText("Your note: A comfortable pace")).toBeVisible();
  await page.reload();
  await expect(
    page.getByRole("progressbar", { name: "Level XP progress" }),
  ).toHaveAttribute("aria-valuenow", "0");
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(s.schedule[tomorrow]).toEqual({
    routine: 1,
    note: "A comfortable pace",
  });
  expect(s.history).toEqual([]);
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await expect(
    page.getByRole("heading", { name: "Recovery looks good on you." }),
  ).toBeVisible();
});

test("search reference foods, adjust servings, change targets, and retain nutrition", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  await page
    .getByRole("button", { name: "Add breakfast", exact: true })
    .click();
  await page.getByLabel("Search foods").fill("Greek yogurt");
  await page.getByRole("button", { name: /Greek yogurt, plain/ }).click();
  await page.getByLabel("Servings", { exact: true }).fill("2");
  await expect(page.getByText("200 kcal · 2 servings")).toBeVisible();
  await page.getByRole("button", { name: "Log meal", exact: true }).click();
  await expect(
    page.getByText("Greek yogurt, plain", { exact: true }),
  ).toBeVisible();
  await page.getByRole("button", { name: "My targets" }).click();
  await page.getByLabel("Daily protein (g)").fill("120");
  await page.getByLabel("Daily carbohydrates (g)").fill("200");
  await page.getByLabel("Daily fat (g)").fill("60");
  await page.getByRole("button", { name: "Save targets" }).click();
  await page.reload();
  await expect(
    page.getByRole("progressbar", { name: "Level XP progress" }),
  ).toHaveAttribute("aria-valuenow", "25");
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  const s = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(s.food[0]).toEqual(
    expect.objectContaining({
      meal: "Breakfast",
      servings: 2,
      calories: 200,
      protein: 34,
      carbs: 12,
      fat: 0,
    }),
  );
  expect(s.targets).toEqual({
    calories: 2000,
    protein: 120,
    carbs: 200,
    fat: 60,
  });
  await page
    .getByRole("button", { name: "Previous week", exact: true })
    .click();
  await expect(
    page.getByText("Greek yogurt, plain", { exact: true }),
  ).not.toBeVisible();
  await page.getByRole("button", { name: "Today", exact: true }).click();
  await expect(
    page.getByText("Greek yogurt, plain", { exact: true }),
  ).toBeVisible();
});

test("barcode lookup fills reviewable values and unavailable camera has a manual fallback", async ({
  page,
}) => {
  await page.addInitScript(() =>
    Object.defineProperty(window, "BarcodeDetector", {
      value: undefined,
      configurable: true,
    }),
  );
  await page.route("https://world.openfoodfacts.org/**", (route) =>
    route.fulfill({
      json: {
        status: 1,
        product: {
          product_name: "Test oats",
          nutriments: {
            "energy-kcal_100g": 380,
            proteins_100g: 13,
            carbohydrates_100g: 60,
            fat_100g: 7,
          },
        },
      },
    }),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  await page.getByRole("button", { name: /Scan a barcode/ }).click();
  await page.getByRole("button", { name: "Use camera" }).click();
  await expect(page.getByText(/Live scanning isn’t supported/)).toBeVisible();
  await page.getByLabel("Product barcode").fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();
  await expect(page.getByLabel("Food or meal")).toHaveValue("Test oats");
  await page.getByLabel("Servings", { exact: true }).fill("0.5");
  await page.getByRole("button", { name: "Log meal", exact: true }).click();
  await expect(page.getByText("Test oats", { exact: true })).toBeVisible();
  const saved = await page.evaluate(
    () => JSON.parse(localStorage.getItem("levelup-react-v1")!).food[0],
  );
  expect(saved).toEqual(
    expect.objectContaining({
      calories: 190,
      protein: 6.5,
      carbs: 30,
      fat: 3.5,
      servings: 0.5,
      meal: "Snacks",
    }),
  );
});

test("profile personalization and compact iPhone layout", async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 740 });
  await page.goto("/");
  await page.getByRole("button", { name: "Edit your profile" }).click();
  await page.getByLabel("Your name").fill("Alex");
  await page.getByRole("button", { name: "Save profile" }).click();
  await expect(page.getByRole("heading", { name: /Alex/ })).toBeVisible();
  for (const name of ["Home", "Workout", "Meal"]) {
    await page.getByRole("button", { name, exact: true }).click();
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
    ).toBe(true);
    await page.screenshot({
      path: `/tmp/level-up-${name.toLowerCase()}-compact.png`,
      fullPage: true,
    });
  }
});

test("failed barcode lookup keeps manual logging available", async ({
  page,
}) => {
  await page.route("https://world.openfoodfacts.org/**", (route) =>
    route.abort("failed"),
  );
  await page.goto("/");
  await page.getByRole("button", { name: "Meal", exact: true }).click();
  await page.getByRole("button", { name: /Scan a barcode/ }).click();
  await page.getByLabel("Product barcode").fill("1234567890123");
  await page.getByRole("button", { name: "Look up barcode" }).click();
  await expect(
    page.getByText(/Couldn’t connect to the food database/),
  ).toBeVisible();
  await page.getByLabel("Food or meal").fill("My own snack");
  await page.getByLabel("Calories (kcal)", { exact: true }).fill("100");
  await page.getByLabel("Protein (g)", { exact: true }).fill("5");
  await page.getByLabel("Carbohydrates (g)", { exact: true }).fill("15");
  await page.getByLabel("Fat (g)", { exact: true }).fill("2");
  await page.getByRole("button", { name: "Log meal", exact: true }).click();
  await expect(page.getByText("My own snack", { exact: true })).toBeVisible();
});
