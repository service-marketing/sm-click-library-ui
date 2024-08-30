<template>
  <div class="text-center">
    <div class="justify-center uppercase">
      <p>
        Acesse seu aplicativo Google Authenticator e<br />
        escaneie o QRCode
      </p>
    </div>

    <section class="flex justify-center p-2 gap-2">
      <div class="bg-base-200 rounded-lg p-2">
        <img
          class="w-64 h-64 rounded-md"
          v-if="base64"
          :src="base64"
          alt="QRCode"
        />

        <div v-else class="h-64 w-64 items-center justify-center inline-flex">
          <div class="loader"></div>
        </div>
      </div>
    </section>
  </div>
</template>

<script setup>
const props = defineProps({
  base64: {
    type: String,
    default: null,
  },
});
</script>

<style scoped>
</style>