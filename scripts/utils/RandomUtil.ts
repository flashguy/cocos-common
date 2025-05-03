import { _decorator, randomRangeInt } from 'cc';
const { ccclass } = _decorator;

@ccclass('RandomUtil')
export class RandomUtil
{
    /**
     * Возвращает случайное значение Enum
     *
     * @param enumObj - Enum из которого нужно взять случайное значение
     * @public
     */
    public static randEnumValue<T>(enumObj:T):T[keyof T]
    {
        const index = Math.floor(Math.random() * Object.keys(enumObj).length);
        const value = Object.keys(enumObj)[index];
        
        return enumObj[value];
    }

    /**
     * Возвращает случайное значение из массива
     *
     * @param arrayObj - Массив из которого нужно взять случайное значение
     * @public
     */
    public static randArrayValue<T>(arrayObj:T[]):T
    {
        return arrayObj[randomRangeInt(0, arrayObj.length)];
    }
}