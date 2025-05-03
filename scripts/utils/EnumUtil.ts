import { _decorator } from 'cc';
const { ccclass } = _decorator;

@ccclass('EnumUtil')
export class EnumUtil
{
    /**
     * Возвращает текстовое представление Enum
     *
     * @param enumObj - Enum из которого нужно взять случайное значение
     * @public
     */
    public static enumValueAsString<T extends Record<string, string | number>>(
        enumObj: T,
        value: T[keyof T]
    ): string
    {
        // Проверяем, является ли значение числовым (для числовых enum)
        if (typeof value === "number")
        {
            return enumObj[value] as string;
        }
        // Для строковых enum просто возвращаем значение
        return value as string;
    }
}