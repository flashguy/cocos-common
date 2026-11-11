import { _decorator, Node, Vec3 } from 'cc';
import { IMoveMethod } from './IMoveMethod';
const { ccclass, property } = _decorator;

@ccclass('SinusoidalMove')
export class SinusoidalMove implements IMoveMethod
{
    private _a:number; // амплитуда
    private _b:number; // частота
    private _enableDecay:boolean; // затухание к концу
    private _enableRotation:boolean; // поворот в сторону движения
    private _actualA:number; // реальная амплитуда после подгонки
    private _actualB:number; // реальная частота после подгонки
    private _totalTime:number = 0; // общее время движения
    
    constructor(a:number = 100, b:number = Math.PI * 2, enableDecay:boolean = true, enableRotation:boolean = false)
    {
        this._a = a;
        this._b = b;
        this._enableDecay = enableDecay;
        this._enableRotation = enableRotation;
        this._actualA = a;
        this._actualB = b;
    }
    
    public calculate(currentTime:number, totalTime:number, startPos:Vec3, endPos:Vec3):Vec3
    {
        // Сохраняем totalTime для расчета частоты
        if (this._totalTime !== totalTime)
        {
            this._totalTime = totalTime;
            this.calculateActualParams(totalTime);
        }
        
        const t:number = currentTime / totalTime; // прогресс от 0 до 1
        
        // Вектор направления движения
        const direction:Vec3 = new Vec3();
        Vec3.subtract(direction, endPos, startPos);
        
        // Базовое линейное перемещение вдоль оси движения
        const baseX:number = startPos.x + direction.x * t;
        const baseY:number = startPos.y + direction.y * t;
        const baseZ:number = startPos.z + direction.z * t;
        
        // Находим перпендикулярный вектор для смещения
        let perpendicular:Vec3 = new Vec3();
        
        // Если направление почти вертикальное, используем горизонтальный перпендикуляр
        const dirNormalized:Vec3 = direction.clone().normalize();
        if (Math.abs(dirNormalized.x) < 0.707 && Math.abs(dirNormalized.y) > 0.707)
        {
            // Вертикальное движение - смещаем по X
            perpendicular.set(1, 0, 0);
        }
        else
        {
            // Горизонтальное или диагональное движение - смещаем перпендикулярно (поворот на 90 градусов)
            perpendicular.set(-dirNormalized.y, dirNormalized.x, 0);
        }
        
        // Нормализуем перпендикулярный вектор
        perpendicular.normalize();
        
        // Синусоидальное смещение с подогнанной частотой
        const x:number = this._actualB * currentTime;
        const sinValue:number = Math.sin(x);
        
        // Затухание к концу пути
        const decay:number = this._enableDecay ? (1 - t) : 1;
        
        // Применяем подогнанную амплитуду с затуханием
        const offset:number = this._actualA * sinValue * decay;
        
        // Применяем смещение перпендикулярно направлению движения
        const result:Vec3 = new Vec3(
            baseX + perpendicular.x * offset,
            baseY + perpendicular.y * offset,
            baseZ + perpendicular.z * offset
        );
        
        return result;
    }
    
    /**
     * Подгоняем параметры, чтобы начало и конец движения были в точках старта и финиша
     */
    private calculateActualParams(totalTime:number):void
    {
        // Частота подгоняется так, чтобы за время totalTime уложилось целое количество полуволн
        // Чтобы sin(b * totalTime) = 0, нужно чтобы b * totalTime = k * PI, где k - целое число
        const targetHalfWaves:number = this._b * totalTime / Math.PI;
        let k:number = Math.max(1, Math.round(targetHalfWaves));
        
        // Корректируем частоту
        this._actualB = (k * Math.PI) / totalTime;
        
        // Амплитуда остается пользовательской
        this._actualA = this._a;
    }
    
    public shouldRotate():boolean
    {
        return this._enableRotation;
    }
    
    public reset():void
    {
        this._totalTime = 0;
    }
}