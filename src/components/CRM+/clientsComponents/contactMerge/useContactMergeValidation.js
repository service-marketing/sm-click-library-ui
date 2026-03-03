/**
 * Contact Merge Validation Composable
 *
 * Handles all validation logic for merging contacts including:
 * - Phone number normalization and comparison
 * - JID/LID extraction and validation
 * - Brazilian 9th digit variant detection
 * - Merge compatibility checks
 */

// ========== STRING UTILITIES ==========
export const normalizeString = (value) => (value ?? "").toString().trim();
export const normalizeComparableValue = (value) =>
  normalizeString(value).toLowerCase();
export const normalizeDigits = (value) =>
  normalizeString(value).replace(/\D/g, "");

// ========== WHATSAPP ID PARSING ==========
/**
 * Parse whatsapp_id to extract JID or LID
 * @param {string} whatsappId - The whatsapp_id field (e.g., "5511913376994@c.us" or "187269315072041@lid")
 * @returns {{ type: 'jid' | 'lid' | null, value: string | null }}
 */
export const parseWhatsAppId = (whatsappId) => {
  const normalized = normalizeString(whatsappId);
  if (!normalized) return { type: null, value: null };

  if (normalized.endsWith("@c.us")) {
    return { type: "jid", value: normalized.replace("@c.us", "") };
  }
  if (normalized.endsWith("@lid")) {
    return { type: "lid", value: normalized.replace("@lid", "") };
  }
  return { type: null, value: null };
};

/**
 * Extract JID value from whatsapp_id if it's a JID format
 */
export const extractJid = (whatsappId) => {
  const parsed = parseWhatsAppId(whatsappId);
  return parsed.type === "jid" ? parsed.value : null;
};

/**
 * Extract LID value from whatsapp_id if it's a LID format
 */
export const extractLid = (whatsappId) => {
  const parsed = parseWhatsAppId(whatsappId);
  return parsed.type === "lid" ? parsed.value : null;
};

// ========== PHONE NUMBER UTILITIES ==========
export const removeBrazilCountryCode = (digits) => {
  if (digits.startsWith("55") && digits.length >= 12) {
    return digits.slice(2);
  }
  return digits;
};

export const splitBrazilianPhone = (phone) => {
  const normalized = removeBrazilCountryCode(normalizeDigits(phone));
  if (normalized.length < 10) {
    return null;
  }
  return {
    areaCode: normalized.slice(0, 2),
    localNumber: normalized.slice(2),
    normalized,
  };
};

/**
 * Compare two phone numbers to check if they're compatible for merge
 * Checks for 9th digit variant (Brazilian phones)
 */
export const compareTelephones = (phoneA, phoneB) => {
  const normalizedA = removeBrazilCountryCode(normalizeDigits(phoneA));
  const normalizedB = removeBrazilCountryCode(normalizeDigits(phoneB));

  // If either is empty, they're compatible (no conflict)
  if (!normalizedA || !normalizedB) {
    return {
      isCompatible: true,
      isSame: normalizedA === normalizedB,
      isNineDigitVariant: false,
      normalizedParent: normalizedA,
      normalizedChild: normalizedB,
    };
  }

  // Exact match
  if (normalizedA === normalizedB) {
    return {
      isCompatible: true,
      isSame: true,
      isNineDigitVariant: false,
      normalizedParent: normalizedA,
      normalizedChild: normalizedB,
    };
  }

  const parsedA = splitBrazilianPhone(phoneA);
  const parsedB = splitBrazilianPhone(phoneB);

  // Different area codes = different phones
  if (!parsedA || !parsedB || parsedA.areaCode !== parsedB.areaCode) {
    return {
      isCompatible: false,
      isSame: false,
      isNineDigitVariant: false,
      normalizedParent: normalizedA,
      normalizedChild: normalizedB,
    };
  }

  // Check 9th digit variant
  // Phone A has 9 digits (with 9) and B has 8 digits (without 9)
  const isVariantAtoB =
    parsedA.localNumber.length === 9 &&
    parsedB.localNumber.length === 8 &&
    parsedA.localNumber.startsWith("9") &&
    parsedA.localNumber.slice(1) === parsedB.localNumber;

  // Phone B has 9 digits (with 9) and A has 8 digits (without 9)
  const isVariantBtoA =
    parsedB.localNumber.length === 9 &&
    parsedA.localNumber.length === 8 &&
    parsedB.localNumber.startsWith("9") &&
    parsedB.localNumber.slice(1) === parsedA.localNumber;

  const isNineDigitVariant = isVariantAtoB || isVariantBtoA;

  return {
    isCompatible: isNineDigitVariant,
    isSame: false,
    isNineDigitVariant,
    normalizedParent: normalizedA,
    normalizedChild: normalizedB,
  };
};

/**
 * Resolve which telephone to use after merge
 * Prefers the one with 9th digit
 */
export const resolveMergedTelephone = (
  parentContact,
  childContact,
  phoneComparison,
) => {
  const parentPhone = normalizeString(parentContact?.telephone);
  const childPhone = normalizeString(childContact?.telephone);

  if (!parentPhone && !childPhone) return "";
  if (!parentPhone) return childPhone;
  if (!childPhone) return parentPhone;

  if (phoneComparison?.isNineDigitVariant) {
    const parentLength = phoneComparison.normalizedParent?.length || 0;
    const childLength = phoneComparison.normalizedChild?.length || 0;
    // Return the longer one (with 9th digit)
    if (childLength > parentLength) return childPhone;
  }
  return parentPhone;
};

// ========== MERGE VALIDATION ==========
/**
 * Validates if two contacts can be merged
 *
 * Rules:
 * 1. If BOTH contacts have phone:
 *    - Check if one has 9 and other doesn't (9th digit variant)
 *    - If phones are distinct (not 9th digit variant), DON'T merge
 *
 * 2. If ONLY ONE contact has phone (A has phone, B doesn't):
 *    - Check whatsapp_lid: if BOTH have LID and they're different, DON'T merge
 *    - Check whatsapp_jid: if BOTH have JID and they're different, DON'T merge
 *
 * @returns {object} Validation result with canMerge, reasons, mergeableFields, phoneComparison
 */
export const validateContactMerge = (parentContact, childContact) => {
  if (!parentContact || !childContact) {
    return {
      canMerge: false,
      reasons: [],
      mergeableFields: [],
      phoneComparison: null,
    };
  }

  const reasons = [];
  const mergeableFields = [];

  // Get phone numbers
  const parentPhone = normalizeString(parentContact.telephone);
  const childPhone = normalizeString(childContact.telephone);
  const hasParentPhone = Boolean(parentPhone);
  const hasChildPhone = Boolean(childPhone);

  // Get JID and LID from whatsapp_id
  const parentJid = extractJid(parentContact.whatsapp_id);
  const childJid = extractJid(childContact.whatsapp_id);
  const parentLid = extractLid(parentContact.whatsapp_id);
  const childLid = extractLid(childContact.whatsapp_id);

  let phoneComparison = null;

  // RULE 1: Both contacts have phone registered
  if (hasParentPhone && hasChildPhone) {
    phoneComparison = compareTelephones(parentPhone, childPhone);

    if (!phoneComparison.isCompatible) {
      // Phones are different and not 9th digit variant
      reasons.push(
        "Os telefones são diferentes e não são variação de 9º dígito",
      );
    } else if (phoneComparison.isNineDigitVariant) {
      // Can merge - one with 9, one without
      mergeableFields.push("telephone");
    }
    // If isSame, phones are identical - no conflict, no special merge needed
  }

  // RULE 2: Only one contact has phone (check JID/LID)
  if (
    (hasParentPhone && !hasChildPhone) ||
    (!hasParentPhone && hasChildPhone)
  ) {
    // Check LID: if BOTH have LID and they're different, don't merge
    if (parentLid && childLid && parentLid !== childLid) {
      reasons.push("WhatsApp LID diferente entre os contatos");
    }

    // Check JID: if BOTH have JID and they're different, don't merge
    if (parentJid && childJid && parentJid !== childJid) {
      reasons.push("WhatsApp JID diferente entre os contatos");
    }
  }

  // MERGEABLE: If both have JID and it's the same
  if (parentJid && childJid && parentJid === childJid) {
    mergeableFields.push("whatsapp_jid");
  }

  // MERGEABLE: If both have LID and it's the same
  if (parentLid && childLid && parentLid === childLid) {
    mergeableFields.push("whatsapp_lid");
  }

  return {
    canMerge: reasons.length === 0,
    reasons,
    mergeableFields,
    phoneComparison,
  };
};

// ========== MERGE PREVIEW ==========
/**
 * Generate a preview of the merged contact data
 */
export const generateMergePreview = (
  parentContact,
  childContact,
  phoneComparison,
) => {
  if (!parentContact || !childContact) return null;

  const parentJid = extractJid(parentContact.whatsapp_id);
  const childJid = extractJid(childContact.whatsapp_id);
  const parentLid = extractLid(parentContact.whatsapp_id);
  const childLid = extractLid(childContact.whatsapp_id);

  // Determine final whatsapp_id
  let whatsappId = parentContact.whatsapp_id || childContact.whatsapp_id;

  // Prefer JID over LID if available
  if (parentJid || childJid) {
    const jidValue = parentJid || childJid;
    whatsappId = `${jidValue}@c.us`;
  } else if (parentLid || childLid) {
    const lidValue = parentLid || childLid;
    whatsappId = `${lidValue}@lid`;
  }

  return {
    name:
      normalizeString(parentContact.name) || normalizeString(childContact.name),
    telephone: resolveMergedTelephone(
      parentContact,
      childContact,
      phoneComparison,
    ),
    whatsapp_id: whatsappId,
    instagram_user_name:
      normalizeString(parentContact.instagram_user_name) ||
      normalizeString(childContact.instagram_user_name),
    tags: [...(parentContact.tags || []), ...(childContact.tags || [])],
  };
};
