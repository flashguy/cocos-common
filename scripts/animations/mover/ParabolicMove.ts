import { _decorator, Node, Vec3 } from 'cc';
import { IMoveMethod } from './IMoveMethod';
const { ccclass, property } = _decorator;

@ccclass('ParabolicMove')
export class ParabolicMove implements IMoveMethod
{
    private _height:number; // высота параболы (положительная - выпуклость вверх, отрицательная - вниз)
    private _enableRotation:boolean; // поворот в сторону движения
    
    constructor(height:number = 100, enableRotation:boolean = false)
    {
        this._height = height;
        this._enableRotation = enableRotation;
    }
    
    public calculate(currentTime:number, totalTime:number, startPos:Vec3, endPos:Vec3):Vec3
    {
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
        
        // Формула параболы: y = -4 * height * (x * (x - 1))
        // При x = 0 (начало) и x = 1 (конец) значение равно 0
        // При x = 0.5 (середина) значение равно height
        const parabolaValue:number = -4 * this._height * (t * (t - 1));
        
        // Применяем смещение перпендикулярно направлению движения
        const result:Vec3 = new Vec3(
            baseX + perpendicular.x * parabolaValue,
            baseY + perpendicular.y * parabolaValue,
            baseZ + perpendicular.z * parabolaValue
        );
        
        return result;
    }
    
    public shouldRotate():boolean
    {
        return this._enableRotation;
    }
    
    public reset():void
    {

    }
}