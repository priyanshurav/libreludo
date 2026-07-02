export type TResult<T, E> =
  | { success: true; data: T; error: null }
  | { success: false; data: null; error: E };
