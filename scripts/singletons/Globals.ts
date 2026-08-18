import { _decorator } from 'cc';
const { ccclass } = _decorator;

// File Globals.ts created am_empty
// Date of creation Mon Aug 17 2026 22:08:39 GMT+0300 (Москва, стандартное время)

@ccclass('Globals')
export class Globals
{
    private static instances = new Map<Function, object>();

    public static getOrCreate<T extends object>(ctor: new (...args:any[]) => T):T
    {
        let instance = this.instances.get(ctor) as T | undefined;

        if (!instance)
        {
            instance = new ctor();
            this.instances.set(ctor, instance);
        }

        return instance;
    }

    public static get<T extends object>(ctor: new (...args:any[]) => T):T | undefined
    {
        return this.instances.get(ctor) as T | undefined;
    }

    public static set<T extends object>(ctor: new (...args:any[]) => T, instance:T):T
    {
        this.instances.set(ctor, instance);

        return instance;
    }

    public static has<T extends object>(ctor: new (...args:any[]) => T):boolean
    {
        return this.instances.has(ctor);
    }
}