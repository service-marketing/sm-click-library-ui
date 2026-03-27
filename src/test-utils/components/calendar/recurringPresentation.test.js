import { describe, it, expect, beforeAll, beforeEach, vi } from "vitest";
import { mount } from "@vue/test-utils";
import { createTestingPinia } from "@pinia/testing";
import CalendarGrid from "~/components/calendar/components/CalendarGrid.vue";
import EventsList from "~/components/calendar/components/EventsList.vue";
import AgendaList from "~/components/calendar/components/AgendaList.vue";
import CalFilter from "~/components/calendar/components/CalFilter.vue";

const representativeEvent = {
  id: "rec-1",
  type: "scheduled_messages",
  status: true,
  scheduled_by: "att-1",
  date: new Date(2026, 2, 26, 18, 0, 0, 0),
  time: "18:00",
  contactName: "Joao Santos",
  departmentName: "FINANCEIRO",
  raw: {
    id: "rec-1",
    params: {
      scheduled_by: "att-1",
      schedule: {
        cron: "0 */3 * * *",
        type: "cron",
        timezone: "America/Sao_Paulo",
      },
      message: {
        text: [{ type: "text", content: "oi" }],
        files: [],
      },
    },
  },
};

const recurringGroup = {
  key: "rg:rec-1:2026-03-26",
  kind: "recurring-group",
  sourceId: "rec-1",
  representative: representativeEvent,
  date: new Date(2026, 2, 26),
  count: 2,
  previewTimes: ["18:00", "21:00"],
  previewOverflow: 0,
  firstExecutionAt: new Date(2026, 2, 26, 18, 0, 0, 0),
  lastExecutionAt: new Date(2026, 2, 26, 21, 0, 0, 0),
};

const singleEvent = {
  id: "single-1",
  type: "scheduled_messages",
  status: true,
  scheduled_by: "att-1",
  date: new Date(2026, 2, 26, 12, 11, 0, 0),
  time: "12:11",
  contactName: "ablublube",
  departmentName: "FINANCEIRO",
  raw: {
    id: "single-1",
    params: {
      scheduled_by: "att-1",
      schedule: {
        time: "2026-03-26 12:11",
      },
      message: {
        text: [{ type: "text", content: "oi" }],
        files: [],
      },
    },
  },
};

beforeAll(() => {
  global.ResizeObserver = class {
    constructor(cb) {
      this.cb = cb;
    }
    observe(el) {
      this.cb([{ target: el }]);
    }
    disconnect() {}
    unobserve() {}
  };

  Object.defineProperty(HTMLElement.prototype, "clientWidth", {
    configurable: true,
    get() {
      return 96;
    },
  });

  Object.defineProperty(HTMLElement.prototype, "clientHeight", {
    configurable: true,
    get() {
      return 42;
    },
  });
});

function withPinia(component, options = {}) {
  return mount(component, {
    ...options,
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            attendant: {
              attendants: [{ id: "att-1", name: "Voce", is_me: true }],
              loaded: true,
            },
          },
          stubActions: false,
        }),
      ],
      ...(options.global || {}),
    },
  });
}

describe("calendar recurring presentation", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it("keeps the month grid compact and shows a recurring badge", () => {
    const wrapper = mount(CalendarGrid, {
      props: {
        startOffset: 0,
        monthDays: [{ key: "d26", date: new Date(2026, 2, 26) }],
        viewDate: new Date(2026, 2, 1),
        isCompact: false,
        isSameMonthFn: () => true,
        isSelectedDayFn: () => false,
        isTodayFn: () => false,
        selectDayFn: () => {},
        daySummaryFn: () => ({
          totalOccurrences: 5,
          recurringRulesCount: 1,
          recurringOccurrencesCount: 8,
          singleCount: 3,
          peakGroupCount: 8,
          visualCount: 4,
        }),
        dayVisualEntriesFn: () => [
          recurringGroup,
          singleEvent,
          { ...singleEvent, id: "single-2", time: "12:14" },
          { ...singleEvent, id: "single-3", time: "16:17" },
        ],
      },
    });

    expect(wrapper.find(".recurring-badge").text()).toBe("1");
    expect(wrapper.find(".bars-wrap").exists()).toBe(true);
  });

  it("renders recurring groups beside punctual events in the sidebar list", () => {
    const wrapper = withPinia(EventsList, {
      props: {
        loading: false,
        selectedLabel: "26/03/2026",
        selectedLabelLong: "QUINTA 26",
        recurringGroups: [recurringGroup],
        singleEvents: [singleEvent],
        mode: "sidebar",
      },
    });

    expect(wrapper.text()).toContain("Eventos em 26/03/2026");
    expect(wrapper.text()).toContain("Joao Santos");
    expect(wrapper.text()).toContain("ablublube");
    expect(wrapper.findAll("li").length).toBeGreaterThan(0);
  });

  it("renders agenda days with recurring and punctual entries together", () => {
    const wrapper = withPinia(AgendaList, {
      props: {
        days: [
          {
            key: "ag-2026-03-26",
            date: new Date(2026, 2, 26),
            leadEvent: representativeEvent,
            recurringGroups: [recurringGroup],
            singles: [singleEvent],
            visualEntries: [recurringGroup, singleEvent],
          },
        ],
        weekdayLong: () => "quinta",
        weekdayShort: () => "QUI",
        monthShort: () => "MAR",
        monthLabelOf: () => "marco",
        year: 2026,
      },
    });

    expect(wrapper.text()).toContain("QUINTA 26");
    expect(wrapper.text()).toContain("Joao Santos");
    expect(wrapper.text()).toContain("ablublube");
    expect(wrapper.findAll(".event-item").length).toBe(2);
  });

  it("emits a recurring-only filter toggle from the filter popover", async () => {
    const wrapper = withPinia(CalFilter, {
      props: {
        open: true,
        filters: {},
      },
    });

    const recurringToggle = wrapper.find(
      'input[aria-label="Exibir somente eventos recorrentes"]',
    );

    await recurringToggle.setValue(true);

    expect(wrapper.emitted("update:filters")).toEqual([
      [{ recurring_only: true }],
    ]);
  });
});
