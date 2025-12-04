import { JSDOM } from "jsdom";
import { config } from "@vue/test-utils";
import { setActivePinia, createPinia } from "pinia";

// Cria um DOM simulado
const dom = new JSDOM(`<!DOCTYPE html><html><body></body></html>`, {
  url: "http://localhost",
});

// Configura `window` e `document`
global.window = dom.window;
global.document = dom.window.document;
global.navigator = dom.window.navigator;

// Mock de métodos do DOM que podem ser necessários
global.window.HTMLElement = dom.window.HTMLElement;
global.window.requestAnimationFrame = (cb) => setTimeout(cb, 0);
global.window.cancelAnimationFrame = (id) => clearTimeout(id);

global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}));

global.window.matchMedia = vi.fn().mockImplementation(() => ({
  matches: false,
  addListener: vi.fn(),
  removeListener: vi.fn(),
}));

// Configuração global do Vue Test Utils
config.global.stubs = {
  Popper: true, // Evita erro de componente não encontrado
  VueAwesomePaginate: true, // Stub para VueAwesomePaginate
  SimpleModal: true, // Stub para SimpleModal
  datepicker: true, // Stub para datepicker,
  Svg: { template: "<svg></svg>" },
  Popper: { template: "<div><slot /></div>" },
  putVideo: { template: "<div></div>" },
  VueAwesomePaginate: { template: "<div></div>" },
  SimpleLoader: { template: "<div></div>" },
};

config.global.directives = {
  lazy: () => {},
};

// Ativando Pinia para os testes
setActivePinia(createPinia()); // Certifica que Pinia está disponível nos testes

// Mock de axios para evitar chamadas reais de API
import { vi } from "vitest";

vi.mock("@/router/axios", () => ({
  default: {
    get: vi.fn().mockResolvedValue({ data: [] }), // Return an empty array (or any default data)
    post: vi.fn(),
    delete: vi.fn(),
    patch: vi.fn(),
  },
}));
// Mock de notiwind para evitar notificações em testes
vi.mock("notiwind", () => ({
  notify: vi.fn(),
}));
