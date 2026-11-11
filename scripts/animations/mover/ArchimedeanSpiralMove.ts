import { _decorator, Vec3 } from 'cc';
import { IMoveMethod } from './IMoveMethod';
const { ccclass } = _decorator;

@ccclass('ArchimedeanSpiralMove')
export class ArchimedeanSpiralMove implements IMoveMethod
{
    private _turns: number;
    private _enableRotation: boolean;
    private _actualTurns: number;
    private _totalTime: number = 0;
    private _startPos: Vec3 = new Vec3();
    private _endPos: Vec3 = new Vec3();
    
    constructor(turns: number = 2, enableRotation: boolean = false)
    {
        this._turns = turns;
        this._enableRotation = enableRotation;
        this._actualTurns = turns;
    }
    
    public calculate(currentTime: number, totalTime: number, startPos: Vec3, endPos: Vec3): Vec3
    {
        // Подгоняем количество витков при изменении параметров
        if (this._totalTime !== totalTime || 
            !this._startPos.equals(startPos) || 
            !this._endPos.equals(endPos))
        {
            this._totalTime = totalTime;
            this._startPos = startPos.clone();
            this._endPos = endPos.clone();
            this.calculateActualTurns(startPos, endPos);
        }
        
        const t = currentTime / totalTime;
        
        // Угол: от 0 до 2π * подогнанное количество витков
        const angle = 2 * Math.PI * this._actualTurns * t;
        
        // Расстояние между начальной и конечной точкой
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Радиус линейно растет от 0 до distance
        const radius = distance * t;
        
        // Вычисляем смещение по спирали
        const offsetX = Math.cos(angle) * radius;
        const offsetY = Math.sin(angle) * radius;
        
        // Позиция = стартовая точка + смещение по спирали
        return new Vec3(
            startPos.x + offsetX,
            startPos.y + offsetY,
            startPos.z
        );
    }
    
    /**
     * Подгоняем количество витков так, чтобы конечная точка лежала на спирали
     * При t = 1: угол = 2π * turns, радиус = distance
     * Конечная точка: startPos + (cos(2π*turns) * distance, sin(2π*turns) * distance, 0)
     * Это должно равняться endPos, значит:
     * cos(2π*turns) = dx / distance
     * sin(2π*turns) = dy / distance
     * Отсюда находим угол и подгоняем turns
     */
    private calculateActualTurns(startPos: Vec3, endPos: Vec3): void
    {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.001)
        {
            this._actualTurns = this._turns;
            return;
        }
        
        // Вычисляем нужный угол, чтобы попасть в конечную точку
        let targetAngle = Math.atan2(dy, dx);
        
        // Нормализуем угол в диапазон [0, 2π)
        if (targetAngle < 0)
        {
            targetAngle += 2 * Math.PI;
        }
        
        // Вычисляем ближайшее количество витков, дающее этот угол
        // angle = 2π * turns (mod 2π)
        // targetAngle = 2π * turns - 2π * floor(turns)
        // targetAngle / (2π) = turns - floor(turns) = дробная часть turns
        
        const fractionalPart = targetAngle / (2 * Math.PI);
        
        // Сохраняем целую часть от пользовательских витков, дробную подгоняем
        const integerPart = Math.floor(this._turns);
        this._actualTurns = integerPart + fractionalPart;
        
        // Если пользовательские витки меньше 1, корректируем
        if (this._turns < 1)
        {
            this._actualTurns = fractionalPart;
        }
        
        // Убеждаемся, что хотя бы 0.1 витка
        if (this._actualTurns < 0.1)
        {
            this._actualTurns = 0.1;
        }
    }
    
    public shouldRotate(): boolean
    {
        return this._enableRotation;
    }
    
    public reset(): void
    {
        this._totalTime = 0;
    }
}