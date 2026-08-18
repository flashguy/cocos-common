import { _decorator, EventTarget } from 'cc';

// File IEventBus.ts created am_empty
// Date of creation Tue Aug 18 2026 20:40:53 GMT+0300 (Москва, стандартное время)

export interface IEventBus
{
    eventTarget:EventTarget;
}
export const IEventBus = Symbol("IEventBus");