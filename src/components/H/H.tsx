/** Renders decorative content, hidden from screen readers so it isn't announced */
export const H = ({ c }: { c: string }) => <span aria-hidden="true">{c}</span>;
