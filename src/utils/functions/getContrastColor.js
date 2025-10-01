// Função para obter a cor de contraste (preto ou branco) com base na cor de fundo em hexadecimal
export function getContrastColor(hex) {
  // Caso o valor hexadecimal seja inválido, retorna preto por padrão
  if (!hex) return "black";
  
  // Remove o símbolo '#' se estiver presente
  const value = hex.replace("#", "");

  // Converte o valor hexadecimal para RGB
  const bigint = parseInt(value, 16);

  // Extrai os componentes R, G e B
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  // faz a fórmula W3C YIQ para determinar a cor de contraste
  // https://24ways.org/2010/calculating-color-contrast/
  const yiq = (r * 299 + g * 587 + b * 114) / 1000;

  // Retorna preto para cores claras e branco para cores escuras
  return yiq >= 128 ? "text-black" : "text-white";
}
