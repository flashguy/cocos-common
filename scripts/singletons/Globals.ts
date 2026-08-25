import { _decorator } from 'cc';
const { ccclass } = _decorator;

// File Globals.ts created am_empty
// Date of creation Mon Aug 17 2026 22:08:39 GMT+0300 (Москва, стандартное время)

@ccclass('Globals')
export class Globals
{
    private static instances = new Map<Function | string | symbol, object>();

    public static has(key:Function | string | symbol):boolean
    {
        return this.instances.has(key);
    }

    public static set<T extends object>(key:Function | string | symbol, instance:T):T
    {
        this.instances.set(key, instance);

        return instance;
    }

    public static get<T extends object>(key:Function | string | symbol):T | undefined
    {
        return this.instances.get(key) as T | undefined;
    }

    public static getOrCreate<T extends object>(key:Function | string | symbol, ctor?: new (...args:any[]) => T):T
    {
        let instance = this.instances.get(key) as T | undefined;

        if (!instance && ctor)
        {
            instance = new ctor();
            
            this.instances.set(key, instance);
        }
        else if (!instance)
        {
            throw new Error(`No instance found for key: ${String(key)} and no constructor provided`);
        }

        return instance;
    }
}