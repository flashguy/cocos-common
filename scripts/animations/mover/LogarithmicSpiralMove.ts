import { _decorator, Vec3 } from 'cc';
import { IMoveMethod } from './IMoveMethod';
const { ccclass } = _decorator;

@ccclass('LogarithmicSpiralMove')
export class LogarithmicSpiralMove implements IMoveMethod
{
    private _turns: number;
    private _logarithmicGrowthFactor: number; // фактор роста (b в формуле r = a * exp(b * angle))
    private _enableRotation: boolean;
    private _actualTurns: number;
    private _totalTime: number = 0;
    private _startPos: Vec3 = new Vec3();
    private _endPos: Vec3 = new Vec3();
    private _a: number; // начальный радиус (нормировочный коэффициент)
    
    constructor(turns: number = 2, logarithmicGrowthFactor: number = 0.5, enableRotation: boolean = false)
    {
        this._turns = turns;
        this._logarithmicGrowthFactor = logarithmicGrowthFactor;
        this._enableRotation = enableRotation;
        this._actualTurns = turns;
        this._a = 1;
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
            this.calculateActualParams(startPos, endPos);
        }
        
        const t = currentTime / totalTime;
        
        // Угол: от 0 до 2π * подогнанное количество витков
        const angle = 2 * Math.PI * this._actualTurns * t;
        
        // Логарифмическая спираль: r = a * exp(b * angle)
        // где b = logarithmicGrowthFactor
        const radius = this._a * Math.exp(this._logarithmicGrowthFactor * angle);
        
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
     * Подгоняем параметры так, чтобы конечная точка лежала на спирали
     * При t = 1: angle = 2π * turns, radius = a * exp(b * 2π * turns) = distance
     * Отсюда a = distance / exp(b * 2π * turns)
     */
    private calculateActualParams(startPos: Vec3, endPos: Vec3): void
    {
        const dx = endPos.x - startPos.x;
        const dy = endPos.y - startPos.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance < 0.001)
        {
            this._actualTurns = this._turns;
            this._a = 0;
            return;
        }
        
        // Вычисляем нужный угол, чтобы попасть в конечную точку
        let targetAngle = Math.atan2(dy, dx);
        
        // Нормализуем угол в диапазон [0, 2π)
        if (targetAngle < 0)
        {
            targetAngle += 2 * Math.PI;
        }
        
        // Вычисляем дробную часть витков
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
        
        // Вычисляем нормировочный коэффициент a
        // При конечном угле радиус должен равняться distance
        const maxAngle = 2 * Math.PI * this._actualTurns;
        this._a = distance / Math.exp(this._logarithmicGrowthFactor * maxAngle);
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