/**
 * Utilitário centralizado para formatação de moedas
 * Suporta: BRL, USD, EUR, JPY, GBP, CHF, BTC
 */

const currencyLocaleMap = {
  BRL: 'pt-BR',
  USD: 'en-US',
  EUR: 'de-DE',
  JPY: 'ja-JP',
  GBP: 'en-GB',
  CHF: 'de-CH',
  BTC: 'en-US'
}

const currencySymbols = {
  BRL: 'R$',
  USD: '$',
  EUR: '€',
  JPY: '¥',
  GBP: '£',
  CHF: 'CHF',
  BTC: '₿'
}

/**
 * Formata um valor numérico de acordo com a moeda especificada
 * @param {number} value - Valor a ser formatado
 * @param {string} currency - Código da moeda (BRL, USD, EUR, JPY, GBP, CHF, BTC)
 * @returns {string} Valor formatado com símbolo e locale apropriados
 */
export const formatCurrency = (value, currency = 'BRL') => {
  const n = Number(value)
  if (!Number.isFinite(n)) return ''

  // Tratamento especial para Bitcoin
  if (currency === 'BTC') {
    return `₿ ${n.toFixed(8)}`
  }

  const locale = currencyLocaleMap[currency] ?? 'en-US'
  const opts = { style: 'currency', currency }

  // Sem casas decimais para JPY
  if (currency === 'JPY') {
    opts.maximumFractionDigits = 0
  }

  try {
    return new Intl.NumberFormat(locale, opts).format(n)
  } catch (e) {
    return `${currencySymbols[currency] ?? currency} ${n}`
  }
}

/**
 * Retorna apenas o símbolo da moeda
 * @param {string} currency - Código da moeda
 * @returns {string} Símbolo da moeda
 */
export const getCurrencySymbol = (currency = 'BRL') => {
  return currencySymbols[currency] ?? currency
}

/**
 * Retorna o locale apropriado para a moeda
 * @param {string} currency - Código da moeda
 * @returns {string} Locale no formato xx-XX (ex: pt-BR)
 */
export const getCurrencyLocale = (currency = 'BRL') => {
  return currencyLocaleMap[currency] ?? 'en-US'
}
