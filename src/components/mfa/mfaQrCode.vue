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
          <div class="loaderMFA"></div>
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
/* HTML: <div class="loader"></div> */
.loaderMFA {
  font-weight: bold;
  font-family: monospace;
  font-size: 30px;
  line-height: 1.2em;
  display: inline-grid;
}
.loaderMFA:before,
.loaderMFA:after {
  content: "aguarde...";
  grid-area: 1/1;
  -webkit-mask: linear-gradient(90deg, #000 50%, #0000 0) 0 50%/2ch 100%;
  color: #0000;
  text-shadow: 0 0 0 #000, 0 calc(var(--s, 1) * 1.2em) 0 #000;
  animation: l15 1s infinite;
}
.loaderMFA:after {
  -webkit-mask-position: 1ch 50%;
  --s: -1;
}
@keyframes l15 {
  80%,
  100% {
    text-shadow: 0 calc(var(--s, 1) * -1.2em) 0 #000, 0 0 0 #000;
  }
}
</style>