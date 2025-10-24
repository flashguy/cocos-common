import { _decorator, Color, randomRangeInt } from 'cc';
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

    /**
     * Метод возвращает не прозрачный случайный цвет
     * 
     * @returns 
     */
    public static randomColor():Color
    {
        return new Color(
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255),
                    Math.floor(Math.random() * 255),
                    255
                );
    }

    /**
     * Алгоритм Фишера-Йетса (современная версия) перемешивает массив обеспечивает равномерное распределение.
     * Не изменяет оригинальный массив.
     * 
     * @param array 
     * @returns возвращается новый массив оригинальный не изменяется
     */
    public static shuffleArrayImmutable<T>(array:T[]):T[]
    {
        const shuffled = [...array];

        for (let i = shuffled.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }

        return shuffled;
    }

    /**
     * Алгоритм Фишера-Йетса (современная версия) перемешивает массив обеспечивает равномерное распределение.
     * Изменяет оригинальный массив.
     * 
     * @param array 
     * @returns
     */
    public static shuffleArrayMutable<T>(array:T[]):void
    {
        for (let i = array.length - 1; i > 0; i--)
        {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
    }
}