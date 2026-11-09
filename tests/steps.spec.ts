import { test, expect } from "@playwright/test";
import {
  estimateSteps,
  saveStepEntry,
  setManualSteps,
  type StepEntry,
} from "../src/steps";
import { emptyState, xpTotal } from "../src/data";

test("step estimates use measured distance or cadence, retain seconds, and do not infer steps from calories or incline", () => {
  const input = {
    minutes: 54,
    seconds: 20,
    distance: 2.74,
    incline: 4,
    calories: 398,
    stepLength: 28,
  };
  expect(estimateSteps(input)?.steps).toBe(6200);
  expect(estimateSteps({ ...input, incline: 0, calories: 0 })?.steps).toBe(
    6200,
  );
  expect(
    estimateSteps({ ...input, method: "cadence", cadence: 110 })?.steps,
  ).toBe(5977);
  expect(
    estimateSteps({ minutes: 54, seconds: 20, speed: 3, stepLength: 28 }),
  ).toEqual(expect.objectContaining({ steps: 6147, distanceSource: "speed" }));
  expect(estimateSteps({ ...input, stepLength: 0 })).toBeNull();
  expect(estimateSteps({ minutes: 0, seconds: 0, distance: 2.74 })).toBeNull();
  expect(estimateSteps({ minutes: 54, incline: 4, calories: 398 })).toBeNull();
});

test("editing an estimate replaces its contribution and a manual total resets contributions without duplicate XP", () => {
  const date = "2026-11-09",
    input = { minutes: 54, seconds: 20, distance: 2.74, stepLength: 28 };
  const entry: StepEntry = {
    id: "walk",
    date,
    input,
    estimate: estimateSteps(input)!,
    included: true,
  };
  let state = saveStepEntry(
    { ...emptyState(), steps: { [date]: 1800 } },
    entry,
  );
  expect(state.steps[date]).toBe(8000);
  expect(xpTotal(state)).toBe(50);
  state = saveStepEntry(state, entry);
  expect(state.steps[date]).toBe(8000);
  expect(xpTotal(state)).toBe(50);
  state = saveStepEntry(state, {
    ...entry,
    estimate: { steps: 5977, method: "cadence", cadence: 110 },
  });
  expect(state.steps[date]).toBe(7777);
  expect(xpTotal(state)).toBe(0);
  state = setManualSteps(state, date, 9000);
  expect(state.steps[date]).toBe(9000);
  expect(state.stepEntries?.[0].included).toBe(false);
  state = saveStepEntry(state, { ...entry, included: false });
  expect(state.steps[date]).toBe(9000);
});

test("calculator saves readings, estimates steps, and updates the daily total only once", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Calculate treadmill steps" }).click();
  await page.getByLabel("Minutes completed").fill("54");
  await page.getByLabel("Seconds", { exact: true }).fill("20");
  await page.getByLabel("Distance (miles, optional)").fill("2.74");
  await page.getByLabel("Speed (mph, optional)").fill("3");
  await page.getByLabel("Incline (%, optional)").fill("4");
  await page.getByLabel("Treadmill calories (optional)").fill("398");
  await expect(page.getByText("≈ 6,200", { exact: true })).toBeVisible();
  await page.getByLabel("Add this estimate to the daily step total").check();
  await page
    .getByRole("button", { name: "Save estimate", exact: true })
    .click();
  await page.reload();
  let state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(state.history).toEqual([]);
  expect(Object.values(state.steps)).toEqual([6200]);
  expect(state.stepEntries[0].input).toEqual(
    expect.objectContaining({
      minutes: 54,
      seconds: 20,
      incline: 4,
      calories: 398,
    }),
  );
  await page.getByRole("button", { name: /Edit step estimate/ }).click();
  await page
    .getByRole("button", { name: "Save estimate", exact: true })
    .click();
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(Object.values(state.steps)).toEqual([6200]);
  expect(state.stepEntries).toHaveLength(1);
  await page.getByRole("button", { name: /Edit step estimate/ }).click();
  await page.getByLabel("Step estimation method").selectOption("cadence");
  await page
    .getByLabel("Measured steps per minute", { exact: true })
    .fill("110");
  await expect(page.getByText("≈ 5,977", { exact: true })).toBeVisible();
  await page
    .getByRole("button", { name: "Save estimate", exact: true })
    .click();
  state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(Object.values(state.steps)).toEqual([5977]);
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});

test("saved treadmill readings can be reused without counting the workout or its steps twice", async ({
  page,
}) => {
  await page.goto("/");
  await page.getByRole("button", { name: "Workout", exact: true }).click();
  await page
    .getByRole("button", { name: "Choose for today", exact: true })
    .last()
    .click();
  await page
    .getByRole("button", { name: "Start workout", exact: true })
    .click();
  await page.getByLabel("Minutes completed").fill("54");
  await page.getByLabel("Seconds", { exact: true }).fill("20");
  await page.getByLabel("Distance (miles, optional)").fill("2.74");
  await page.getByLabel("Add this estimate to the daily step total").check();
  await page.getByRole("button", { name: "Finish workout" }).click();
  await page.getByRole("button", { name: "Calculate treadmill steps" }).click();
  await page
    .getByLabel("Use a saved treadmill workout")
    .selectOption({ index: 1 });
  await page
    .getByRole("button", { name: "Save estimate", exact: true })
    .click();
  await page.reload();
  const state = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("levelup-react-v1")!),
  );
  expect(state.history).toHaveLength(1);
  expect(state.stepEntries).toHaveLength(1);
  expect(state.history[0].cardio.seconds).toBe(20);
  expect(Object.values(state.steps)).toEqual([6200]);
  await expect(
    page.getByRole("progressbar", { name: "Level XP progress" }),
  ).toHaveAttribute("aria-valuenow", "120");
});
