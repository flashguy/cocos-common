import { _decorator, Component, randomRangeInt } from 'cc';
import { PoolQueueProcessingType } from './PoolQueueProcessingType';
const { ccclass, property } = _decorator;

/**
 * Базовый абстрактный класс пула объектов
 * @template T - тип элементов, хранящихся в пуле
 */
@ccclass('CommonPool')
export abstract class CommonPool<T> extends Component
{
    @property
    protected reservedAtStart:number = 0;

    @property({type:PoolQueueProcessingType})
    protected queueProcessingType:PoolQueueProcessingType = PoolQueueProcessingType.LIFO;

    @property
    protected showPoolStat:boolean = false;

    protected _reserveList:Array<T> = [];
    protected _activeList:Array<T> = [];

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
            this._reserveList.push(this.createInstance());
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

        if (this._reserveList.length == 0)
        {
            instance = this.createInstance();
        }
        else
        {
            switch (this.queueProcessingType)
            {
                case PoolQueueProcessingType.FIFO:   instance = this._reserveList.pop(); break;
                case PoolQueueProcessingType.LIFO:   instance = this._reserveList.shift(); break;
                case PoolQueueProcessingType.RANDOM: instance = this._reserveList.splice(randomRangeInt(0, this._reserveList.length), 1)[0]; break;
            }
        }

        this._activeList.push(instance);

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

        let index:number = this._activeList.indexOf(instance);

        if (index >= 0)
        {
            this._activeList.splice(index, 1);
            this._reserveList.push(instance);

            this.showStat();
            return;
        }
    }

    /**
     * Вернуть все активные объекты в пул
     */
    public returnAll():void
    {
        while (this._activeList.length > 0)
        {
            let instance:any = this._activeList.pop();
            this.cleanInstance(instance);

            this._reserveList.push(instance);
        }

        this.showStat();
    }

    /**
     * Получить текущий полный размер пула
     */
    public get size():number
    {
        return this._reserveList.length + this._activeList.length;
    }

    /**
     * Получить размер зарезервированных элементов пула
     */
    public get sizeReserved():number
    {
        return this._reserveList.length;
    }

    /**
     * Получить размер активных элементов пула
     */
    public get sizeActiv():number
    {
        return this._activeList.length;
    }

    private showStat():void
    {
        if (this.showPoolStat)
        {
            console.log(this.node.name, "reserved:", this._reserveList.length, "active:", this._activeList.length)
        }
    }
}