import { describe, it, expect, beforeEach } from "vitest";
import { mount } from "@vue/test-utils";
import AttendantSelect from "~/components/selects/attendantSelect/attendantSelect.vue";
import { createTestingPinia } from "@pinia/testing";

const attendantsMock = [
  {
    id: 1,
    name: "John Doe",
    status: true,
    department: [{ id: "dept1" }],
    photo: "",
    selected: false,
  },
  {
    id: 2,
    name: "Jane Smith",
    status: true,
    department: [{ id: "dept1" }],
    photo: "",
    selected: false,
  },
];

describe("AttendantSelect Component", () => {
  let wrapper;
  beforeEach(() => {
    wrapper = mount(AttendantSelect, {
      props: {
        attendance: [],
        multiSelect: true,
        department: [{ id: "dept1" }],
        modal_filter: null,
        attDel: { id: null },
        method: null,
      },
      global: {
        plugins: [
          createTestingPinia({
            initialState: {
              attendant: {
                attendants: attendantsMock,
                loaded: true,
              },
            },
            stubActions: false,
          }),
        ],
      },
    });
  });

  it("renders the correct number of attendants", () => {
    const attendantItems = wrapper.findAll(".department-item");
    expect(attendantItems.length).toBe(2);
  });

  it("selects an attendant on click", async () => {
    // Instead of triggering click on the .department-item,
    // we find the .department-name element inside it:
    const firstItemName = wrapper
      .findAll(".department-item")
      .at(0)
      .find(".department-name");

    await firstItemName.trigger("click");

    const emits = wrapper.emitted("attend");
    expect(emits).toBeDefined();

    const selected = emits[emits.length - 1][0];
    expect(selected).toHaveLength(1); // ...
  });

  it("removes an attendant when the erase button is clicked", async () => {
    // Find the correct child that has the @click.
    const firstItemName = wrapper
      .findAll(".department-item")
      .at(0)
      .find(".department-name");
    await firstItemName.trigger("click");

    // Wait for selection to render
    await wrapper.vm.$nextTick();

    // Now .close-btn should appear
    const eraseButton = wrapper.find(".close-btn");
    await eraseButton.trigger("click");

    // Check latest emitted array
    const emits = wrapper.emitted("attend");
    const currentSelection = emits[emits.length - 1][0];
    expect(currentSelection).toHaveLength(0);
  });

  it("filters attendants based on the search input", async () => {
    const input = wrapper.find("input");
    await input.setValue("Jane");
    await wrapper.vm.$nextTick();

    // After filtering, only Jane Smith should be displayed.
    const filteredItems = wrapper.findAll(".department-item");
    expect(filteredItems.length).toBe(1);
    expect(filteredItems[0].text()).toContain("Jane Smith");
  });
});
