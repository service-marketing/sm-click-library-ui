import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import WalletCreateModal from "~/components/CRM+/clientsComponents/wallet/walletCreateModal.vue";
import api from "~/utils/api.js";

const DEPARTMENTS = [
  { id: 10, name: "Chat", wallets_enabled: true },
  { id: 20, name: "Sales", wallets_enabled: true },
  { id: 30, name: "Support", wallets_enabled: false },
];

const ATTENDANTS = [
  { id: 1, name: "Alice" },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

const simpleModalStub = {
  name: "SimpleModal",
  template:
    '<div data-test="simple-modal"><slot name="header" /><slot name="body" /><slot name="footer" /></div>',
};

const departSelectStub = {
  name: "departSelect",
  props: ["disabledItems", "disabledReason", "multiSelect", "preselect"],
  template: '<div data-test="depart-select"></div>',
};

const attendantSelectStub = {
  name: "attendantSelect",
  props: ["department", "disabledItems", "disabledReason", "multiSelect"],
  template: '<div data-test="attendant-select"></div>',
};

const buildWrapper = (props = {}, options = {}) =>
  mount(WalletCreateModal, {
    props: {
      isOpen: true,
      contactId: 99,
      existingWallets: [],
      currentAttendance: {
        department_id: 10,
        department_name: "Chat",
        attendant_name: "Alice",
      },
      attendants: ATTENDANTS,
      loggedAttendant: { id: 1, name: "Alice" },
      loggedAttendantId: 1,
      hasDepartmentMembership: vi.fn(() => true),
      isDepartmentSupervisor: vi.fn(() => false),
      ...props,
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            department: {
              loaded: true,
              departments: options.departments || DEPARTMENTS,
            },
          },
          stubActions: false,
        }),
      ],
      stubs: {
        SimpleModal: simpleModalStub,
        departSelect: departSelectStub,
        attendantSelect: attendantSelectStub,
      },
    },
  });

describe("WalletCreateModal", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, "post").mockResolvedValue({ data: {} });
  });

  it("locks the current attendance department and the logged attendant for non-supervisors", async () => {
    const wrapper = buildWrapper();

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Departamento da conversa");
    expect(wrapper.text()).toContain("Chat");
    expect(wrapper.text()).toContain("Atendente responsável");
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain(
      "Neste fluxo, o atendente responsável deve ser você.",
    );
    expect(wrapper.find("[data-test='depart-select']").exists()).toBe(false);
    expect(wrapper.find("[data-test='attendant-select']").exists()).toBe(false);

    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeUndefined();
  });

  it("shows department selection and lets supervisors choose an attendant in manager flow", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Como este vínculo está sendo criado fora de um atendimento",
    );
    expect(wrapper.find("[data-test='depart-select']").exists()).toBe(true);
    expect(wrapper.find("[data-test='attendant-select']").exists()).toBe(false);

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    expect(attendantSelect.exists()).toBe(true);
    expect(wrapper.text()).not.toContain("Permissões deste vínculo");

    attendantSelect.vm.$emit("attend", [ATTENDANTS[1]]);
    await wrapper.vm.$nextTick();

    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeUndefined();
  });

  it("warns when the selected department does not have wallets enabled", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[2]]);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "O departamento selecionado não possui carteiras habilitadas.",
    );
    expect(wrapper.text()).toContain(
      "Selecione um departamento para liberar os atendentes",
    );
    expect(wrapper.find("[data-test='attendant-select']").exists()).toBe(false);
  });

  it("shows a note when the locked department does not support wallets", async () => {
    const wrapper = buildWrapper(
      {
        currentAttendance: {
          department_id: 30,
          department_name: "Support",
          attendant_name: "Alice",
        },
      },
      {
        departments: DEPARTMENTS,
      },
    );

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "não suporta encarteiramento porque não possui carteiras habilitadas",
    );
    expect(wrapper.find("[data-test='attendant-select']").exists()).toBe(false);
  });

  it("passes already linked attendants as disabled options for supervisors", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      existingWallets: [{ attendant_id: 2, department_id: 20 }],
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    expect(attendantSelect.props("disabledItems")).toEqual(["2"]);
    expect(attendantSelect.props("disabledReason")).toBe("Já encarteirado");
  });

  it("keeps the attendant selector disabled until a department is selected in manager flow", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Selecione um departamento para liberar os atendentes",
    );
    expect(wrapper.find("[data-test='attendant-select']").exists()).toBe(false);
  });

  it("passes only the logged attendant as enabled for non-supervisors", async () => {
    const wrapper = buildWrapper();

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Atendente responsável");
    expect(wrapper.text()).toContain("Alice");
    expect(wrapper.text()).toContain("Permissões deste vínculo");
    expect(wrapper.text()).toContain(
      "Neste fluxo, o atendente responsável deve ser você.",
    );
  });

  it("blocks non-supervisors when the department is already linked", async () => {
    const wrapper = buildWrapper({
      existingWallets: [{ attendant_id: 2, department_id: 10 }],
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Este contato já possui um vínculo de carteira nesse departamento.",
    );
    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    expect(attendantSelect.exists()).toBe(false);
    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeDefined();
  });

  it("blocks non-supervisors when they do not belong to the selected department", async () => {
    const wrapper = buildWrapper({
      hasDepartmentMembership: vi.fn(() => false),
    });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Você não pertence ao departamento selecionado, então não pode criar carteira nele.",
    );
    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeDefined();
  });

  it("shows the supervisor permission message only for non-supervisors", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).not.toContain("Permissões deste vínculo");
    expect(wrapper.text()).not.toContain(
      "Neste fluxo, você pode atribuir qualquer atendente do departamento selecionado.",
    );
  });

  it("blocks duplicate wallet creation for the same attendant and department", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      existingWallets: [{ attendant_id: 2, department_id: 20 }],
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    attendantSelect.vm.$emit("attend", [ATTENDANTS[1]]);
    await wrapper.vm.$nextTick();

    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeDefined();
  });

  it("prevents submission when there is no contact id", async () => {
    const wrapper = buildWrapper({
      contactId: "",
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    attendantSelect.vm.$emit("attend", [ATTENDANTS[2]]);
    await wrapper.vm.$nextTick();

    const saveButton = wrapper.findAll("button")[1];
    expect(saveButton.attributes("disabled")).toBeDefined();
    await saveButton.trigger("click");
    expect(api.post).not.toHaveBeenCalled();
  });

  it("submits the selected attendant and department when the form is valid", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    attendantSelect.vm.$emit("attend", [ATTENDANTS[2]]);
    await wrapper.vm.$nextTick();

    const saveButton = wrapper.findAll("button")[1];
    await saveButton.trigger("click");

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(expect.any(String), {
      attendant_id: 3,
      department_id: 20,
    });

    const savedEvents = wrapper.emitted("saved");
    expect(savedEvents).toBeTruthy();
    expect(savedEvents[0][0]).toEqual({
      attendant_id: 3,
      department_id: 20,
    });
  });

  it("emits update:isOpen when cancel is clicked", async () => {
    const wrapper = buildWrapper();

    await wrapper.findAll("button")[0].trigger("click");

    expect(wrapper.emitted("update:isOpen")).toBeTruthy();
    expect(wrapper.emitted("update:isOpen")[0]).toEqual([false]);
  });

  it("resets the selected attendant after closing and reopening the modal", async () => {
    const wrapper = buildWrapper({
      currentAttendance: null,
      isDepartmentSupervisor: vi.fn(() => true),
    });

    const departSelect = wrapper.findComponent({ name: "departSelect" });
    departSelect.vm.$emit("depart", [DEPARTMENTS[1]]);
    await wrapper.vm.$nextTick();

    const attendantSelect = wrapper.findComponent({ name: "attendantSelect" });
    attendantSelect.vm.$emit("attend", [ATTENDANTS[2]]);
    await wrapper.vm.$nextTick();

    expect(wrapper.findAll("button")[1].attributes("disabled")).toBeUndefined();

    await wrapper.setProps({ isOpen: false });
    await wrapper.setProps({ isOpen: true });
    await flushPromises();

    expect(wrapper.findAll("button")[1].attributes("disabled")).toBeDefined();
  });

  it("resyncs the locked department when the current attendance changes", async () => {
    const wrapper = buildWrapper({
      currentAttendance: {
        department_id: 10,
        department_name: "Chat",
        attendant_name: "Alice",
      },
    });

    await wrapper.setProps({
      currentAttendance: {
        department_id: 20,
        department_name: "Sales",
        attendant_name: "Alice",
      },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Sales");
    expect(wrapper.text()).not.toContain("Chat");
  });

  it("updates the locked attendant name when the logged attendant changes for non-supervisors", async () => {
    const wrapper = buildWrapper({
      loggedAttendant: { id: 1, name: "Alice" },
    });

    await wrapper.setProps({
      loggedAttendant: { id: 1, name: "Diana" },
    });
    await flushPromises();

    expect(wrapper.text()).toContain("Diana");
  });
});
