import { _decorator, Enum } from 'cc';
const { ccclass, property } = _decorator;

// https://easings.net/ru
// https://docs.cocos.com/creator/3.8/manual/en/tween/tween-function.html

export enum EnumTweenEasing
{
    backIn = "backIn",
    backOut = "backOut",
    backInOut = "backInOut",
    backOutIn = "backOutIn",

    bounceIn = "bounceIn",
    bounceOut = "bounceOut",
    bounceInOut = "bounceInOut",
    bounceOutIn = "bounceOutIn",

    circIn = "circIn",
    circOut = "circOut",
    circInOut = "circInOut",
    circOutIn = "circOutIn",

    constant = "constant",

    cubicIn = "cubicIn",
    cubicOut = "cubicOut",
    cubicInOut = "cubicInOut",
    cubicOutIn = "cubicOutIn",

    elasticIn = "elasticIn",
    elasticOut = "elasticOut",
    elasticInOut = "elasticInOut",
    elasticOutIn = "elasticOutIn",

    expoIn = "expoIn",
    expoOut = "expoOut",
    expoInOut = "expoInOut",
    expoOutIn = "expoOutIn",

    fade = "fade",

    linear = "linear",

    quadIn = "quadIn",
    quadOut = "quadOut",
    quadInOut = "quadInOut",
    quadOutIn = "quadOutIn",

    quartIn = "quartIn",
    quartOut = "quartOut",
    quartInOut = "quartInOut",
    quartOutIn = "quartOutIn",

    quintIn = "quintIn",
    quintOut = "quintOut",
    quintInOut = "quintInOut",
    quintOutIn = "quintOutIn",

    sineIn = "sineIn",
    sineOut = "sineOut",
    sineInOut = "sineInOut",
    sineOutIn = "sineOutIn",

    smooth = "smooth",    
}
Enum(EnumTweenEasing);