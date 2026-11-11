import { _decorator, v3, Vec3 } from 'cc';
import { IMoveMethod } from './IMoveMethod';
const { ccclass } = _decorator;

@ccclass('LinearMove')
export class LinearMove implements IMoveMethod
{
    private _enableRotation:boolean;
    
    constructor(enableRotation:boolean = false)
    {
        this._enableRotation = enableRotation;
    }
    
    public calculate(currentTime:number, totalTime:number, startPos:Vec3, endPos:Vec3):Vec3
    {
        const t:number = Math.min(1, currentTime / totalTime);

        return v3(
            startPos.x + (endPos.x - startPos.x) * t,
            startPos.y + (endPos.y - startPos.y) * t,
            startPos.z + (endPos.z - startPos.z) * t
        );
    }
    
    public shouldRotate():boolean
    {
        return this._enableRotation;
    }
    
    public reset():void
    {

    }
}