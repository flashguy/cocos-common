import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('MathUtil')
export class MathUtil
{
    /**
     * Преобразует значение из одного диапазона в другой
     * @param value значение которое необходимо преобразовать
     * @param oldMin минимальное значение старого диапазона
     * @param oldMax максимально значение старого диапазона
     * @param newMin минимальное значение нового диапазона
     * @param newMax максимально значение нового диапазона
     * @returns значение в новом диапозоне
     * 
     * (value - oldMin) — вычисляет, насколько value отстоит от oldMin.
     * (oldMax - oldMin) — вычисляет ширину старого диапазона.
     * ((value - oldMin) / (oldMax - oldMin)) — нормализует значение в диапазоне [0, 1].
     * (newMax - newMin) — вычисляет ширину нового диапазона.
     * ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) — масштабирует нормализованное значение на новый диапазон.
     * + newMin — сдвигает значение на начало нового диапазона.
     */
    public static mapRange(value:number, oldMin:number, oldMax:number, newMin:number, newMax:number):number
    {
        if (oldMax - oldMin === 0)
        {
            console.warn("Старый диапазон равен нулю. Возвращено текущее значение.");
            return value;
        }
        return ((value - oldMin) / (oldMax - oldMin)) * (newMax - newMin) + newMin;
    }

    /**
     * Преобразует преданный угол в угол от 0 до 360 градусов
     * @param angle угол который нужно превести к углу от 0 до 360
     * @returns 
     */
    public static angleDegreesTo360Range(angle:number):number
    {
        if (angle >= 360)
            return angle - 360;
        else
            return angle;
    }

    /**
     * Проверяет вероятность того что событие произошло
     * @param probabilityPercent вероятность события
     * @returns произошло или не произошло событие
     */
    public static checkProbability(probabilityPercent:number):boolean
    {
        // Если вероятность 0% или меньше - всегда false
        if (probabilityPercent <= 0)
            return false;

        // Если вероятность 100% или больше - всегда true
        if (probabilityPercent >= 100)
            return true;

        // Генерируем случайное число от 0 (включительно) до 100 (не включительно)
        const randomValue = Math.random() * 100;

        // Возвращаем true, если случайное число меньше заданной вероятности
        return randomValue < probabilityPercent;
    }
}