import { provide, inject, computed, ref } from "vue";

/**
 * Injection key for the message context.
 * Each app provides this context so library components
 * can access store data without importing app-specific stores.
 */
export const MESSAGE_CONTEXT_KEY = Symbol("libMessageContext");

/**
 * @typedef {Object} MessageContext
 * @property {import('vue').ComputedRef<string>} deviceType - 'web' | 'ios' | 'android'
 * @property {import('vue').ComputedRef<boolean>} themeMode - true = dark mode
 * @property {import('vue').ComputedRef<Object|null>} attendant - { id, name, photo }
 * @property {import('vue').ComputedRef<Object|null>} currentChat - { group, contact, id, ... }
 * @property {import('vue').Ref<Object>} forwardMode - { active: boolean, selectedMessages: any[] }
 * @property {Function} viewImage - (index, isArray, message) => void
 * @property {Function} viewSingleImage - (src, caption?) => void
 * @property {Function} scrollToMessage - (id, chatId) => void
 * @property {Function} setQuote - (quote | null) => void
 * @property {Function} setListModal - (open, message?) => void
 * @property {Function} showNewContact - (name, telephone) => void
 * @property {Function} downloadFile - (file) => Promise<void>
 * @property {Function} notify - (config, timeout) => void
 * @property {Function} transcriptAudio - (msg) => Promise<void>
 * @property {Function} addReaction - (emoji, message) => Promise<void>
 */

/**
 * Provide the message context from the app to all library message sub-components.
 * Call once in a parent/wrapper component.
 *
 * @param {MessageContext} context
 */
export function provideMessageContext(context) {
    provide(MESSAGE_CONTEXT_KEY, context);
}

/**
 * Inject the message context inside library components.
 * Returns a default no-op context if nothing was provided.
 *
 * @returns {MessageContext}
 */
export function useMessageContext() {
    const fallback = {
        deviceType: computed(() => "web"),
        themeMode: computed(() => false),
        attendant: computed(() => null),
        currentChat: computed(() => null),
        forwardMode: ref({ active: false, selectedMessages: [] }),
        viewImage: () => {},
        viewSingleImage: () => {},
        scrollToMessage: () => {},
        setQuote: () => {},
        setListModal: () => {},
        showNewContact: () => {},
        downloadFile: async () => {},
        notify: () => {},
        transcriptAudio: async () => {},
        addReaction: async () => {}
    };
    return inject(MESSAGE_CONTEXT_KEY, fallback);
}
