/** Hides emoji from screen readers so they don't get read out loud */
export const H = ({ c }: { c: string }) => <span aria-hidden="true">{c}</span>;
