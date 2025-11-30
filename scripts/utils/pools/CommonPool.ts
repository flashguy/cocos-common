import { _decorator, Component } from 'cc';
const { ccclass, property } = _decorator;

/**
 * Базовый абстрактный класс пула объектов
 * @template T - тип элементов, хранящихся в пуле
 */
@ccclass('CommonPool')
export abstract class CommonPool<T extends object> extends Component
{
    @property
    protected reservedAtStart:number = 0;

    @property
    protected showPoolStat:boolean = false;

    protected _reserveMap:Map<number, T> = new Map();
    protected _activeMap:Map<number, T> = new Map();
    protected _instanceToId:WeakMap<T, number> = new WeakMap();
    protected _nextId:number = 1;

    onLoad()
    {
        this.reserve();
    }

    /**
     * Абстрактный метод для создания нового объекта типа T
     * Должен быть реализован в дочерних классах
     */
    protected abstract createInstance():T;

    /**
     * Абстрактный метод для очистки объекта перед возвращением в пул
     * Должен быть реализован в дочерних классах
     * @param instance - объект для очистки
     */
    protected abstract cleanInstance(instance:T):void;

    /**
     * Инициализирует пул с минимальным количеством объектов указанным в параметре reservedAtStart
     */
    protected reserve():void
    {
        for (let i = 0; i < this.reservedAtStart; i++)
        {
            const instance = this.createInstance();
            const id = this._nextId++;
            this._reserveMap.set(id, instance);
            this._instanceToId.set(instance, id);
        }

        this.showStat();
    }

    /**
     * Получить объект из пула
     * @returns объект из пула типа <T>
     */
    public get():T
    {
        let instance:T = null;
        let instanceId:number = null;

        if (this._reserveMap.size === 0)
        {
            instance = this.createInstance();
            instanceId = this._nextId++;
            this._instanceToId.set(instance, instanceId);
        }
        else
        {
            const firstEntry = this._reserveMap.entries().next().value;
            instanceId = firstEntry[0];
            instance = firstEntry[1];
            this._reserveMap.delete(instanceId);
        }

        this._activeMap.set(instanceId, instance);

        this.showStat();
        return instance;
    }

    /**
     * Вернуть объект в пул
     * @param instance - объект для возврата в пул
     */
    public put(instance:T):void
    {
        this.cleanInstance(instance);

        const instanceId = this._instanceToId.get(instance);
        if (instanceId && this._activeMap.has(instanceId))
        {
            this._activeMap.delete(instanceId);
            this._reserveMap.set(instanceId, instance);

            this.showStat();
            return;
        }
    }

    /**
     * Вернуть все активные объекты в пул
     */
    public returnAll():void
    {
        for (const [id, instance] of this._activeMap)
        {
            this.cleanInstance(instance);
            this._reserveMap.set(id, instance);
        }
        this._activeMap.clear();

        this.showStat();
    }

    /**
     * Получить текущий полный размер пула
     */
    public get size():number
    {
        return this._reserveMap.size + this._activeMap.size;
    }

    /**
     * Получить размер зарезервированных элементов пула
     */
    public get sizeReserved():number
    {
        return this._reserveMap.size;
    }

    /**
     * Получить размер активных элементов пула
     */
    public get sizeActiv():number
    {
        return this._activeMap.size;
    }

    /**
     * Выводит статистику
     */
    private showStat():void
    {
        if (this.showPoolStat)
        {
            console.log(`Pool >${this.node ? this.node.name : (this as any).constructor.name}< reserved: ${this._reserveMap.size}, active: ${this._activeMap.size}`);
        }
    }
}