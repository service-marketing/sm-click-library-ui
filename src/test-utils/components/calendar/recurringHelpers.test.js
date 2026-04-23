import { describe, it, expect } from "vitest";
import {
  buildRecurringGroupForDay,
  getRecurringDayStats,
} from "~/components/calendar/useScheduledEvents";

function makeRecurringEvent({
  id = "rec-1",
  date = new Date(2026, 2, 26, 17, 59, 59, 999),
  cron = "0 */3 * * *",
} = {}) {
  return {
    id,
    type: "scheduled_messages",
    date,
    scheduled_by: "att-1",
    contactName: "Joao Santos",
    departmentName: "FINANCEIRO",
    raw: {
      id,
      params: {
        scheduled_by: "att-1",
        schedule: {
          type: "cron",
          timezone: "America/Sao_Paulo",
          cron,
        },
      },
    },
  };
}

describe("calendar recurring helpers", () => {
  it("expands an every-3-hours cron from next_execution_at onward", () => {
    const event = makeRecurringEvent();

    const sameDay = getRecurringDayStats(event, new Date(2026, 2, 26));
    const nextDay = getRecurringDayStats(event, new Date(2026, 2, 27));
    const previousDay = getRecurringDayStats(event, new Date(2026, 2, 25));

    expect(sameDay.count).toBe(2);
    expect(sameDay.previewTimes).toEqual(["18:00", "21:00"]);
    expect(nextDay.count).toBe(8);
    expect(nextDay.previewTimes).toEqual(["00:00", "03:00", "06:00", "09:00"]);
    expect(previousDay.count).toBe(0);
  });

  it("only includes daily executions after the anchor time", () => {
    const event = makeRecurringEvent({
      date: new Date(2026, 2, 26, 10, 0, 0, 0),
      cron: "30 9 * * *",
    });

    expect(getRecurringDayStats(event, new Date(2026, 2, 26)).count).toBe(0);

    const nextDay = getRecurringDayStats(event, new Date(2026, 2, 27));
    expect(nextDay.count).toBe(1);
    expect(nextDay.previewTimes).toEqual(["09:30"]);
  });

  it("respects weekly and monthly boundaries", () => {
    const weeklyEvent = makeRecurringEvent({
      date: new Date(2026, 2, 23, 7, 0, 0, 0),
      cron: "15 8 * * 1",
    });
    const monthlyEvent = makeRecurringEvent({
      date: new Date(2026, 2, 10, 8, 0, 0, 0),
      cron: "0 9 15 * *",
    });

    expect(getRecurringDayStats(weeklyEvent, new Date(2026, 2, 23)).count).toBe(1);
    expect(getRecurringDayStats(weeklyEvent, new Date(2026, 2, 24)).count).toBe(0);
    expect(getRecurringDayStats(monthlyEvent, new Date(2026, 2, 15)).count).toBe(1);
    expect(getRecurringDayStats(monthlyEvent, new Date(2026, 2, 14)).count).toBe(0);
  });

  it("builds a grouped recurring item with preview overflow", () => {
    const event = makeRecurringEvent({
      cron: "0 * * * *",
      date: new Date(2026, 2, 26, 9, 10, 0, 0),
    });

    const group = buildRecurringGroupForDay(event, new Date(2026, 2, 26), {
      previewLimit: 3,
    });

    expect(group.count).toBe(14);
    expect(group.previewTimes).toEqual(["10:00", "11:00", "12:00"]);
    expect(group.previewOverflow).toBe(11);
  });
});
