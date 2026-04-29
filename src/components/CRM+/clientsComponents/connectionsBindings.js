import { computed } from "vue";

export function useWhatsappBindings(getContact) {
  return computed(() => {
    const contact = typeof getContact === "function" ? getContact() : getContact?.value;
    const items = contact?.whatsapp_infos || [];
    return items
      .filter((item) => item?.meta_business_acc_id || item?.whatsapp_bsuid)
      .map((item, index) => ({
        id: item.id || `wa-${index}`,
        instanceName: item.instance || "",
        bsuid: item.whatsapp_bsuid || "",
        user_name: item.whatsapp_user_name || "",
      }))
      .filter((item) => item.instanceName);
  });
}

export function useInstagramBindings(getContact) {
  return computed(() => {
    const contact = typeof getContact === "function" ? getContact() : getContact?.value;
    const items = contact?.instagram_infos || [];
    return items
      .filter((item) => item?.instagram_account_id || item?.instagram_bsuid)
      .map((item, index) => ({
        id: item.id || `ig-${index}`,
        instanceName: item.instance || "",
        bsuid: item.instagram_bsuid || "",
        user_name: item.instagram_user_name || "",
      }))
      .filter((item) => item.instanceName);
  });
}

export function useHasContactBindings(whatsappBindings, instagramBindings) {
  return computed(
    () => whatsappBindings.value.length > 0 || instagramBindings.value.length > 0,
  );
}