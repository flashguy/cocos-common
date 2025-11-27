import { _decorator } from 'cc';
import { Token } from './Types';
const { ccclass } = _decorator;

@ccclass('Container')
export class Container
{
    private instances = new Map<Token, any>();
    private factories = new Map<Token, () => any>();

    register<T>(token:Token<T>, factory:() => T):void
    {
        this.factories.set(token, factory);
    }

    resolve<T>(token:Token<T>):T
    {
        if (this.instances.has(token))
        {
            return this.instances.get(token);
        }

        const factory = this.factories.get(token);
        
        if (!factory)
        {
            throw new Error(`No factory found for ${token.toString()}`);
        }

        const instance = factory();
        this.instances.set(token, instance);
        
        return instance;
    }
}

export const container = new Container();