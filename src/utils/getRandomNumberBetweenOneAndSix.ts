export function getRandomNumberBetweenOneAndSix(): number {
  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    const maxUint32 = 0xffffffff;
    const scaled = Math.floor((array[0] / (maxUint32 + 1)) * 6) + 1;
    return scaled;
  } else {
    // Fallback
    return Math.floor(Math.random() * 6) + 1;
  }
}
