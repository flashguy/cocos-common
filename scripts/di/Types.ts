export type Constructor<T = any> = new (...args: any[]) => T;
export type Token<T = any> = string | symbol | Constructor<T>;