import { mount } from "@vue/test-utils";
import { describe, it, expect, vi, beforeEach } from "vitest";
import listProducts from "../../../components/CRM+/clientsComponents/listProducts.vue";

describe("Listagem de produtos - incrementação e decrementação", () => {
  let wrapper;

  const sampleProducts = {
    results: [
      { id: 1, name: "Produto A", price: 10, recurrence: "unique" },
      { id: 2, name: "Produto B", price: 5, recurrence: "monthly" },
    ],
    next: null,
    previous: null,
  };

  beforeEach(() => {
    wrapper = mount(listProducts, {
      props: {
        // começa sem selecionados
        modelValue: [],
        // injeta produtos locais para evitar chamada à API
        allProducts: sampleProducts,
      },
    });
  });

  it("Incrementa a quantidade ao clicar em '+'", async () => {
    const items = wrapper.findAll("li");
    expect(items.length).toBeGreaterThan(0);

    // Primeiro produto da lista
    const firstItem = items[0];
    const plusBtn = firstItem.findAll("button").at(1); // ordem: '-' , qty , '+'
    const qtyDisplay = firstItem.find("p.w-5");

    expect(qtyDisplay.text()).toBe("0");

    await plusBtn.trigger("click");
    await wrapper.vm.$nextTick();

    // quantidade deve ser 1
    expect(qtyDisplay.text()).toBe("1");

    // evento emitido com modelo atualizado
    const emits = wrapper.emitted("update:modelValue");
    expect(emits).toBeTruthy();
    const lastEmit = emits[emits.length - 1][0];
    expect(Array.isArray(lastEmit)).toBe(true);
    expect(lastEmit[0]).toMatchObject({
      product: expect.objectContaining({ id: 1 }),
      quantity: 1,
    });
  });

  it("Decrementa a quantidade ao clicar em '-' sem ir abaixo de 0", async () => {
    const items = wrapper.findAll("li");
    const firstItem = items[0];
    const minusBtn = firstItem.findAll("button").at(0); // '-'
    const plusBtn = firstItem.findAll("button").at(1); // '+'
    // console.log("minusBtn:", minusBtn.html());
    const qtyDisplay = firstItem.find("p.w-5");

    // Sobe para 2
    await plusBtn.trigger("click");
    await plusBtn.trigger("click");
    await wrapper.vm.$nextTick();
    expect(qtyDisplay.text()).toBe("2");

    // Desce para 1
    await minusBtn.trigger("click");
    await wrapper.vm.$nextTick();
    expect(qtyDisplay.text()).toBe("1");

    // Desce para 0
    await minusBtn.trigger("click");
    await wrapper.vm.$nextTick();
    expect(qtyDisplay.text()).toBe("0");

    // Tenta descer abaixo de 0 (deve continuar 0)
    await minusBtn.trigger("click");
    await wrapper.vm.$nextTick();
    expect(qtyDisplay.text()).toBe("0");
  });
});
