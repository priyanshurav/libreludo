export const logError = (context: string): ((err: unknown) => void) => {
  return (err: unknown) => {
    console.error(`[${context}]`, err);
  };
};
