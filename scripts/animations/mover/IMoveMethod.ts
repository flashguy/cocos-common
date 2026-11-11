import { _decorator, Vec3 } from 'cc';
const { ccclass, property } = _decorator;

export interface IMoveMethod
{
    calculate(currentTime:number, totalTime:number, startPos:Vec3, endPos:Vec3):Vec3;
    shouldRotate?():boolean;
    reset():void;
}