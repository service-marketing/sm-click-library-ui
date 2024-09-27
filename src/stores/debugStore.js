import { defineStore } from 'pinia';

export const useDebugStore = defineStore('debug', {
    state: () => ({
        message: 'Debug store initialized',
    }),
    actions: {
        logMessage() {
            console.log(this.message);
        }
    }
});
