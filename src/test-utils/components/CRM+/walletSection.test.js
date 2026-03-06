import { flushPromises, mount } from "@vue/test-utils";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createTestingPinia } from "@pinia/testing";
import WalletSection from "~/components/CRM+/clientsComponents/wallet/walletSection.vue";
import api from "~/utils/api.js";

const ATTENDANTS = [
  {
    id: 1,
    name: "Alice",
    is_me: true,
    department: [
      { id: 10, permission: "supervisor" },
      { id: 20, permission: "agent" },
    ],
  },
  { id: 2, name: "Bob" },
  { id: 3, name: "Carol" },
];

const DEPARTMENTS = [
  { id: 10, name: "Chat" },
  { id: 20, name: "Sales" },
  { id: 30, name: "Support" },
];

const walletCardStub = {
  name: "WalletCard",
  props: ["wallet", "canRemove", "isRemoving"],
  template:
    '<div class="wallet-card-stub" :data-department-id="String(wallet.departmentId)" :data-attendant-id="String(wallet.attendantId)" :data-can-remove="String(canRemove)" />',
};

const walletCreateModalStub = {
  name: "WalletCreateModal",
  props: [
    "isOpen",
    "contactId",
    "existingWallets",
    "currentAttendance",
    "attendants",
    "loggedAttendant",
    "loggedAttendantId",
    "hasDepartmentMembership",
    "isDepartmentSupervisor",
  ],
  template:
    '<div data-test="wallet-create-modal" :data-open="String(isOpen)" />',
};

const deferred = () => {
  let resolve;
  let reject;
  const promise = new Promise((res, rej) => {
    resolve = res;
    reject = rej;
  });
  return { promise, resolve, reject };
};

const buildWrapper = (props = {}, options = {}) =>
  mount(WalletSection, {
    props: {
      contactId: 55,
      pageState: "wallet",
      currentAttendance: null,
      ...props,
    },
    global: {
      plugins: [
        createTestingPinia({
          initialState: {
            attendant: {
              loaded: true,
              attendants: options.attendants || ATTENDANTS,
            },
            department: {
              loaded: true,
              departments: options.departments || DEPARTMENTS,
            },
          },
          stubActions: false,
        }),
      ],
      stubs: {
        WalletCard: walletCardStub,
        WalletCreateModal: walletCreateModalStub,
      },
    },
  });

describe("WalletSection", () => {
  beforeEach(() => {
    vi.restoreAllMocks();
    vi.spyOn(api, "post").mockResolvedValue({ data: {} });
  });

  it("shows the no-contact state and disables actions without a contact id", async () => {
    const wrapper = buildWrapper({ contactId: "" });

    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain(
      "Salve o contato para visualizar e editar a carteira.",
    );

    const buttons = wrapper.findAll("button");
    expect(buttons[0].attributes("disabled")).toBeDefined();
    expect(buttons[1].attributes("disabled")).toBeDefined();
  });

  it("shows the loading state while wallet relations are being fetched", async () => {
    vi.spyOn(api, "get").mockReturnValue(new Promise(() => {}));

    const wrapper = buildWrapper();
    await wrapper.vm.$nextTick();

    expect(wrapper.text()).toContain("Carregando carteira...");
  });

  it("shows the error state when fetching wallet relations fails", async () => {
    vi.spyOn(api, "get").mockRejectedValue({
      response: {
        data: {
          message: "Request failed",
        },
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain("Request failed");
    expect(wrapper.text()).toContain("Tentar novamente");
  });

  it("retries the fetch when the retry button is clicked", async () => {
    const getSpy = vi
      .spyOn(api, "get")
      .mockRejectedValueOnce({
        response: { data: { message: "Request failed" } },
      })
      .mockResolvedValueOnce({
        data: { wallet: [] },
      });

    const wrapper = buildWrapper();
    await flushPromises();

    await wrapper.find(".wallet-retry-btn").trigger("click");
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(2);
    expect(wrapper.text()).toContain(
      "Nenhuma relação de carteira encontrada para este contato.",
    );
  });

  it("shows the empty state when the contact has no wallet relations", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    expect(wrapper.text()).toContain(
      "Nenhuma relação de carteira encontrada para este contato.",
    );
  });

  it("computes removal permissions for supervisors, self-owned wallets, and other attendants", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [
          { attendant_id: 1, department_id: 10 },
          { attendant_id: 1, department_id: 20 },
          { attendant_id: 2, department_id: 20 },
          { attendant_id: 3, department_id: 30 },
        ],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const cards = wrapper.findAllComponents({ name: "WalletCard" });
    expect(cards).toHaveLength(4);
    expect(cards[0].props("canRemove")).toBe(true);
    expect(cards[1].props("canRemove")).toBe(true);
    expect(cards[2].props("canRemove")).toBe(false);
    expect(cards[3].props("canRemove")).toBe(false);
  });

  it("uses fallback labels when attendant or department metadata is missing", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [{ attendant_id: 99, department_id: 999 }],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const card = wrapper.findComponent({ name: "WalletCard" });
    expect(card.props("wallet")).toMatchObject({
      attendantName: "Atendente não encontrado",
      departmentName: "Departamento não encontrado",
    });
  });

  it("opens the create modal when the add button is clicked", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const addButton = wrapper.findAll("button")[0];
    await addButton.trigger("click");

    const modal = wrapper.findComponent({ name: "WalletCreateModal" });
    expect(modal.props("isOpen")).toBe(true);
  });

  it("forces a new fetch when the refresh button is clicked", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: { wallet: [] },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    await wrapper.findAll("button")[1].trigger("click");
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(2);
  });

  it("replaces the attendant for an existing department when a saved wallet is emitted", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [
          { attendant_id: 2, department_id: 20 },
          { attendant_id: 3, department_id: 30 },
        ],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const modal = wrapper.findComponent({ name: "WalletCreateModal" });
    modal.vm.$emit("saved", {
      attendant_id: 1,
      department_id: 20,
    });
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAllComponents({ name: "WalletCard" });
    expect(cards).toHaveLength(2);
    expect(cards[0].props("wallet")).toMatchObject({
      attendantId: 1,
      departmentId: 20,
      attendantName: "Alice",
    });
  });

  it("adds a new wallet item when a saved department does not exist yet", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [{ attendant_id: 2, department_id: 20 }],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const modal = wrapper.findComponent({ name: "WalletCreateModal" });
    modal.vm.$emit("saved", {
      attendant_id: 1,
      department_id: 10,
    });
    await wrapper.vm.$nextTick();

    const cards = wrapper.findAllComponents({ name: "WalletCard" });
    expect(cards).toHaveLength(2);
  });

  it("accepts wallet arrays from the wallet payload key", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [{ attendant_id: 1, department_id: 10 }],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: "WalletCard" })).toHaveLength(1);
  });

  it("accepts wallet arrays from the results payload key", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        results: [{ attendant_id: 1, department_id: 10 }],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: "WalletCard" })).toHaveLength(1);
  });

  it("accepts wallet arrays returned directly from the api", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: [{ attendant_id: 1, department_id: 10 }],
    });

    const wrapper = buildWrapper();
    await flushPromises();

    expect(wrapper.findAllComponents({ name: "WalletCard" })).toHaveLength(1);
  });

  it("removes a wallet only when the user is allowed to manage that department", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [
          { attendant_id: 1, department_id: 10 },
          { attendant_id: 2, department_id: 20 },
        ],
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const cards = wrapper.findAllComponents({ name: "WalletCard" });

    cards[1].vm.$emit("remove", cards[1].props("wallet"));
    await flushPromises();
    expect(api.post).not.toHaveBeenCalled();

    cards[0].vm.$emit("remove", cards[0].props("wallet"));
    await flushPromises();

    expect(api.post).toHaveBeenCalledTimes(1);
    expect(api.post).toHaveBeenCalledWith(expect.any(String), {
      department_id: 10,
      attendant_id: null,
    });

    const remainingCards = wrapper.findAllComponents({ name: "WalletCard" });
    expect(remainingCards).toHaveLength(1);
    expect(remainingCards[0].props("wallet").departmentId).toBe(20);
  });

  it("does not remove the wallet when the api request fails", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [{ attendant_id: 1, department_id: 10 }],
      },
    });
    vi.spyOn(api, "post").mockRejectedValue({
      response: {
        data: {
          message: "Remove failed",
        },
      },
    });

    const wrapper = buildWrapper();
    await flushPromises();

    const card = wrapper.findComponent({ name: "WalletCard" });
    card.vm.$emit("remove", card.props("wallet"));
    await flushPromises();

    expect(wrapper.text()).toContain("Remove failed");
    expect(wrapper.findAllComponents({ name: "WalletCard" })).toHaveLength(0);
    expect(wrapper.text()).toContain("Tentar novamente");
  });

  it("blocks repeated removal requests while a department is already being removed", async () => {
    vi.spyOn(api, "get").mockResolvedValue({
      data: {
        wallet: [{ attendant_id: 1, department_id: 10 }],
      },
    });
    const pending = deferred();
    const postSpy = vi.spyOn(api, "post").mockReturnValue(pending.promise);

    const wrapper = buildWrapper();
    await flushPromises();

    const card = wrapper.findComponent({ name: "WalletCard" });
    card.vm.$emit("remove", card.props("wallet"));
    await wrapper.vm.$nextTick();
    card.vm.$emit("remove", card.props("wallet"));
    await wrapper.vm.$nextTick();

    expect(postSpy).toHaveBeenCalledTimes(1);

    pending.resolve({ data: {} });
    await flushPromises();
  });

  it("refetches when the contact id changes on the wallet page", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: { wallet: [] },
    });

    const wrapper = buildWrapper({ contactId: 55 });
    await flushPromises();
    const initialCalls = getSpy.mock.calls.length;

    await wrapper.setProps({ contactId: 77 });
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(initialCalls + 2);
  });

  it("fetches when the page state changes to wallet", async () => {
    const getSpy = vi.spyOn(api, "get").mockResolvedValue({
      data: { wallet: [] },
    });

    const wrapper = buildWrapper({ pageState: "data" });
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(0);

    await wrapper.setProps({ pageState: "wallet" });
    await flushPromises();

    expect(getSpy).toHaveBeenCalledTimes(1);
  });
});
