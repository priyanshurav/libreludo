export function getRandomNumberBetweenOneAndSix(): number {
  let attempts = 0;
  const MAX_ATTEMPTS = 500;
  if (window.crypto?.getRandomValues) {
    const array = new Uint8Array(1);
    window.crypto.getRandomValues(array);
    let randomValue = array[0];
    while (randomValue > 251 && attempts < MAX_ATTEMPTS) {
      window.crypto.getRandomValues(array);
      randomValue = array[0];
      attempts++;
    }
    if (attempts >= MAX_ATTEMPTS) console.error('RNG failure: exceeded maximum attempts');
    return (randomValue % 6) + 1;
  } else {
    // Fallback
    return Math.floor(Math.random() * 6) + 1;
  }
}
