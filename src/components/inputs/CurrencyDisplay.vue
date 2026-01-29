<script setup>
import { computed } from 'vue'

const props = defineProps({
  currency: { type: String, default: 'BRL' },
  value: { type: Number, default: null },
  symbolOnly: { type: Boolean, default: false }
})

const currencyInfo = {
  BRL: { locale: 'pt-BR', currency: 'BRL', symbol: 'R$' },
  USD: { locale: 'en-US', currency: 'USD', symbol: '$' },
  EUR: { locale: 'de-DE', currency: 'EUR', symbol: '€' },
  JPY: { locale: 'ja-JP', currency: 'JPY', symbol: '¥' },
  GBP: { locale: 'en-GB', currency: 'GBP', symbol: '£' },
  CHF: { locale: 'de-CH', currency: 'CHF', symbol: 'CHF' },
  BTC: { locale: 'en-US', currency: 'BTC', symbol: '₿' }
}

const info = computed(() => currencyInfo[props.currency] ?? currencyInfo.BRL)

const formatted = computed(() => {
  if (props.value === null || props.value === undefined) return ''
  const v = Number(props.value)
  if (!Number.isFinite(v)) return ''

  if (props.currency === 'BTC') {
    // Bitcoin: show up to 8 decimal places and append BTC
    return `${info.value.symbol} ${v.toFixed(8)}`
  }

  // For JPY, no decimals
  const opts = { style: 'currency', currency: info.value.currency }
  if (props.currency === 'JPY') opts.maximumFractionDigits = 0

  try {
    return new Intl.NumberFormat(info.value.locale, opts).format(v)
  } catch (e) {
    return `${info.value.symbol} ${v}`
  }
})

const symbol = computed(() => info.value.symbol)
</script>

<template>
  <span v-if="props.symbolOnly">{{ symbol }}</span>
  <span v-else-if="props.value !== null">{{ formatted }}</span>
  <span v-else>{{ symbol }}</span>
</template>

<style scoped>
/* minimal styling; parent should provide layout styling */
</style>
