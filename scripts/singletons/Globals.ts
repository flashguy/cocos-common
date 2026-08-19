import { _decorator } from 'cc';
const { ccclass } = _decorator;

// File Globals.ts created am_empty
// Date of creation Mon Aug 17 2026 22:08:39 GMT+0300 (Москва, стандартное время)

@ccclass('Globals')
export class Globals
{
    private static instances = new Map<Function, object>();

    // public static get<T extends object>(ctor: new (...args:any[]) => T):T | undefined
    // {
    //     return this.instances.get(ctor) as T | undefined;
    // }

    // public static set<T extends object>(ctor: new (...args:any[]) => T, instance:T):T
    // {
    //     this.instances.set(ctor, instance);

    //     return instance;
    // }

    // public static has<T extends object>(ctor:new (...args:any[]) => T):boolean
    // {
    //     return this.instances.has(ctor);
    // }

    public static set<T extends object>(ctor:new (...args:any[]) => T, instance:T):T;
    public static set<T extends object>(cls:any, instance:T):T;
    public static set<T extends object>(ctorOrClass:any, instance:T):T
    {
        // Если передан конструктор или класс
        if (typeof ctorOrClass === 'function')
        {
            this.instances.set(ctorOrClass, instance);
        }
        else
        {
            // Запасной вариант - используем конструктор объекта
            this.instances.set(ctorOrClass.constructor || ctorOrClass, instance);
        }

        return instance;
    }

    public static get<T extends object>(ctor:new (...args:any[]) => T):T | undefined;
    public static get<T extends object>(cls:any):T | undefined;
    public static get<T extends object>(ctorOrClass:any):T | undefined
    {
        // Если передан конструктор или класс
        if (typeof ctorOrClass === 'function')
        {
            return this.instances.get(ctorOrClass) as T | undefined;
        }
        else
        {
            // Запасной вариант - используем конструктор объекта
            return this.instances.get(ctorOrClass.constructor || ctorOrClass) as T | undefined;
        }
    }

    public static getOrCreate<T extends object>(ctor:new (...args:any[]) => T):T
    {
        let instance = this.instances.get(ctor) as T | undefined;

        if (!instance)
        {
            instance = new ctor();
            this.instances.set(ctor, instance);
        }

        return instance;
    }

    public static has(ctor:new (...args:any[]) => any):boolean;
    public static has(cls:any):boolean;
    public static has(ctorOrClass:any):boolean
    {
        if (typeof ctorOrClass === 'function')
        {
            return this.instances.has(ctorOrClass);
        }
        else
        {
            return this.instances.has(ctorOrClass.constructor || ctorOrClass);
        }
    }
}