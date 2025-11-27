import { Container } from "./Container";

export type Constructor<T = any> = new (...args: any[]) => T;
export type Token<T = any> = string | symbol | Constructor<T>;

export interface ClassProvider<T = any>
{
    useClass:Constructor<T>;
}

export interface ValueProvider<T = any>
{
    useValue:T;
}

export interface FactoryProvider<T = any>
{
    useFactory:(container: Container) => T;
}

export type Provider<T = any> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>;