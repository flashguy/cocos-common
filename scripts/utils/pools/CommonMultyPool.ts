import { _decorator, Component } from 'cc';
import { PoolQueueProcessingType } from './PoolQueueProcessingType';
const { ccclass, property } = _decorator;

/**
 * Базовый абстрактный класс мульти пула объектов.
 * @template T - тип enum
 * @template E - тип элементов, хранящихся в пуле
 */
@ccclass('CommonMultyPool')
export abstract class CommonMultyPool<T, E> extends Component
{
    @property
    protected reservedAtStart:number = 0;

    @property({type:PoolQueueProcessingType})
    protected queueProcessingType:PoolQueueProcessingType = PoolQueueProcessingType.LIFO;

    @property
    protected showPoolStat:boolean = false;

    private _reserveMap:Map<T, Array<E>> = new Map<T, Array<E>>();
    private _activeMap:Map<T, Array<E>> = new Map<T, Array<E>>();

    onLoad()
    {
        this.reserve();
    }

    /**
     * Абстрактный метод для создания нового объекта типа T
     * Должен быть реализован в дочерних классах
     */
    protected abstract createInstance(type:T):E;

    /**
     * Абстрактный метод для очистки объекта перед возвращением в пул
     * Должен быть реализован в дочерних классах
     * @param instance - объект для очистки
     */
    protected abstract cleanInstance(instance:E):void;

    /**
     * Инициализирует пул с минимальным количеством объектов указанным в параметре reservedAtStart
     */
    private reserve():void
    {
        /* for (let i = 0; i < this.reserveTargets; i++)
        {
            this._reserveList.push(instantiate(this.variants));
            this._reserved++;
        } */

        this.showStat();
    }

    private getArray(map:Map<T, Array<E>>, type:T):Array<E>
    {
        if (!map.has(type))
        {
            map.set(type, []);
        }

        return map.get(type);
    }
    
    /**
     * Получить объект из пула
     * @returns объект из пула типа <E>
     */
    public get(type:T):E
    {
        let instance:E = null;

        if (this.getArray(this._reserveMap, type).length == 0)
        {
            // instance = instantiate(this.variants[type]);
            instance = this.createInstance(type);
            this.getArray(this._activeMap, type).push(instance);
        }
        else
        {
            instance = this.getArray(this._reserveMap, type).pop();
            this.getArray(this._activeMap, type).push(instance);
        }

        this.showStat();
        return instance;
    }

    /**
     * Вернуть объект в пул
     * @param instance - объект для возврата в пул
     */
    public put(type:T, instance:E):void
    {
        this.cleanInstance(instance);

        let index:number = this.getArray(this._activeMap, type).indexOf(instance);

        if (index >= 0)
        {
            this.getArray(this._activeMap, type).splice(index, 1);
            this.getArray(this._reserveMap, type).push(instance);
        }

        this.showStat();
    }

    public returnAll():void
    {
        for (let entry of this._activeMap)
        {
            let activeList:Array<E> = entry[1];
            let reserveList:Array<E> = this.getArray(this._reserveMap, entry[0]);

            while (activeList.length > 0)
            {
                let instance:E = activeList.pop();
                this.cleanInstance(instance);
                reserveList.push(instance);
            }
        }

        this.showStat();
    }

    private showStat():void
    {
        if (this.showPoolStat)
        {
            console.log("=== Instance ===")
            console.log("reserved:")
            for (let entry of this._reserveMap)
            {
                console.log(entry)
            }
            console.log("active:")
            for (let entry of this._activeMap)
            {
                console.log(entry)
            }
        }
    }
}