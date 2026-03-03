// Main Components
export { default as ContactMergeModal } from "./contactMergeModal.vue";
export { default as MergeConfirmationPanel } from "./MergeConfirmationPanel.vue";
export { default as MergeContactCard } from "./contactCard.vue";

// Composables
export { useContactSearch } from "./useContactSearch.js";
export {
  validateContactMerge,
  generateMergePreview,
  compareTelephones,
  parseWhatsAppId,
  extractJid,
  extractLid,
  normalizeString,
  normalizeDigits,
  resolveMergedTelephone,
} from "./useContactMergeValidation.js";
