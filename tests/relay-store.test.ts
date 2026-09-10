import { afterEach, describe, expect, it, vi } from "vitest";

import { formatDateLabel, isDueToday } from "../lib/relay-store";

describe("Relay follow-up dates", () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it("recognizes the current local day as due today", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T09:00:00"));

    expect(isDueToday("2026-09-10")).toBe(true);
    expect(isDueToday("2026-09-11")).toBe(false);
  });

  it("formats today and upcoming dates for the compact timeline", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-09-10T09:00:00"));

    expect(formatDateLabel("2026-09-10")).toBe("Today");
    expect(formatDateLabel("2026-09-14")).toBe("Sep 14");
  });
});
