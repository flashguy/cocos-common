// https://chat.deepseek.com/a/chat/s/b6fac63a-f38c-48c3-8ba0-c75bfd578336
import { Container } from "./Container";

export type Constructor<T = any> = new (...args:any[]) => T;
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
    useFactory:(container:Container) => T;
}

export type Provider<T = any> = ClassProvider<T> | ValueProvider<T> | FactoryProvider<T>;