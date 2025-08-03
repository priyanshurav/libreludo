export function getRandomNumberBetweenOneAndSix(): number {
  if (window.crypto?.getRandomValues) {
    const array = new Uint32Array(1);
    window.crypto.getRandomValues(array);
    return (array[0] % 6) + 1;
  } else {
    // Fallback
    return Math.floor(Math.random() * 6) + 1;
  }
}
