import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('FuncUtil')
export class FuncUtil
{
    /**
     * Проверяет параметр на то что это функцию и она не равна null или undefined
     *
     * @param func - функция для проверки
     * @public
     */
    public static isFunc(func:any):boolean
    {
        return (func && (typeof func === 'function'));
    }

    /**
     * Проверяет параметр на то что это функцию и она не равна null или undefined и вызывает её
     *
     * @param func - функция для вызова
     * @public
     */
    public static callIfFunc(func:any):void
    {
        if (FuncUtil.isFunc(func))
        {
            func();
        }
    }
}