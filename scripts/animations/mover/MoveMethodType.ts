import { _decorator } from 'cc';
const { ccclass, property } = _decorator;

export enum MoveMethodType
{
    LINEAR = 'linear',
    SINUSOIDAL = 'sinusoidal',
    COSINE = 'cosine',
    PARABOLIC = 'parabolic',
    ARCHIMEDEAN_SPIRAL = 'archimedean_spiral',
    LOGARITHMIC_SPIRAL = 'logarithmic_spiral'
}