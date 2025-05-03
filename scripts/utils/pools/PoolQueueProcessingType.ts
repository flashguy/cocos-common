import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

export enum PoolQueueProcessingType
{
    FIFO = "first_in_first_out",
    LIFO = "last_in_first_out",
    RANDOM = "random",
}
Enum(PoolQueueProcessingType);