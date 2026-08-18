import { _decorator, EventTarget } from 'cc';
import { IEventBus } from './IEventBus';
const { ccclass } = _decorator;

// File EventBus.ts created am_empty
// Date of creation Tue Aug 18 2026 20:41:04 GMT+0300 (Москва, стандартное время)

@ccclass('EventBus')
export class EventBus implements IEventBus
{
    public eventTarget:EventTarget = new EventTarget();
}