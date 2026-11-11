import { _decorator, Component, Enum, sys } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

// Расчет позиции по формуле кривой Лиссажу
// x(t) = A * sin(a * t + δ)
// y(t) = B * sin(b * t)

export enum LissajousShateType
{
    NONE,
    LINE_LT_RB,
    LINE_LB_RT,
    LINE_UP_DOWN,
    LINE_LEFT_RIGHT,
    ELLIPSE,
    PARABOLA_RIGHT,
    PARABOLA_LEFT,
    PARABOLA_UP,
    PARABOLA_DOWN,
    SHAPE_1,
    SHAPE_2,
    SHAPE_3,
    SHAPE_4,
    SHAPE_5,
    SHAPE_6,
    CHEBYSHEV_POLYNOMIAL
}
Enum(LissajousShateType);

@ccclass('LissajousShapeMovement')
@executeInEditMode(true)
export class LissajousShapeMovement extends Component
{
    @property
    private _A:number = 100;

    @property({ displayName: "A (амплитуда X)", tooltip: "Амплитуда колебаний по оси X" })
    public get A():number
    {
        return this._A;
    }
    public set A(value:number)
    {
        this._A = value;
        this.updatePosition();
    }

    @property
    private _B:number = 100;

    @property({ displayName: "B (амплитуда Y)", tooltip: "Амплитуда колебаний по оси Y" })
    public get B():number
    {
        return this._B;
    }
    public set B(value:number)
    {
        this._B = value;
        this.updatePosition();
    }

    @property
    private _a:number = 1;

    @property({ displayName: "a (частота X, рад/с)", tooltip: "Угловая частота по оси X (радиан в секунду)" })
    public get a():number
    {
        return this._a;
    }
    public set a(value:number)
    {
        this._a = value;
        this.updatePosition();
    }

    @property
    private _b:number = 2;

    @property({ displayName: "b (частота Y, рад/с)", tooltip: "Угловая частота по оси Y (радиан в секунду)" })
    public get b():number
    {
        return this._b;
    }
    public set b(value:number)
    {
        this._b = value;
        this.updatePosition();
    }
    
    @property
    private _delta:number = Math.PI / 2;

    @property({ displayName: "δ (разность фаз)", tooltip: "Разность фаз между колебаниями по X и Y (радианы)" })
    public get delta():number
    {
        return this._delta;
    }
    public set delta(value:number)
    {
        this._delta = value;
        this.updatePosition();
    }

    @property
    private _speed:number = 1;

    @property({ tooltip: "Скорость движения по траектории (множитель времени)" })
    public get speed():number
    {
        return this._speed;
    }
    public set speed(value:number)
    {
        this._speed = value;
    }

    @property
    private _stopOnCycleComplete:boolean = false;

    @property({ tooltip: "Останавливать анимацию по завершении полного цикла траектории" })
    public get stopOnCycleComplete():boolean
    {
        return this._stopOnCycleComplete;
    }
    public set stopOnCycleComplete(value:boolean)
    {
        this._stopOnCycleComplete = value;
    }

    @property
    private _rotateBy90Degrees:boolean = false;

    @property({ tooltip: "Повернуть фигуру на 90 градусов" })
    public get rotateBy90Degrees():boolean
    {
        return this._rotateBy90Degrees;
    }
    public set rotateBy90Degrees(value:boolean)
    {
        this._rotateBy90Degrees = value;

        if (this._rotateBy90Degrees)
        {
            this.restartInEditor();
            this.play();
        }
    }

    @property
    private _playOnLoad:boolean = true;

    @property({ tooltip: "Будет ли анимация проигрываться после загрузки компонента" })
    public get playOnLoad():boolean
    {
        return this._playOnLoad;
    }
    public set playOnLoad(value:boolean)
    {
        this._playOnLoad = value;
    }

    @property
    private _enableInEditor:boolean = true;

    @property({ tooltip: "Будет ли анимация проигрываться в редакторе" })
    public get enableInEditor():boolean
    {
        return this._enableInEditor;
    }
    public set enableInEditor(value:boolean)
    {
        this._enableInEditor = value;

        if (this._enableInEditor)
        {
            this.restartInEditor();
            this.play();
        }
    }

    @property({type:LissajousShateType})
    private _type:LissajousShateType = LissajousShateType.NONE;

    @property({ type:LissajousShateType, tooltip: "Преднастройки типа фигуры" })
    public get type():LissajousShateType
    {
        return this._type;
    }
    public set type(value:LissajousShateType)
    {
        this._type = value;
        this.setType();
    }

    @property
    private _N:number = 1;

    @property({ tooltip: "Натуральное число. Степень полинома Чебышёва", visible: function(this: LissajousShapeMovement) { return this._type === LissajousShateType.CHEBYSHEV_POLYNOMIAL; }, step: 1 })
    public get N():number
    {
        return this._N;
    }
    public set N(value:number)
    {
        this._N = value;
        this.setType();
    }

    private startTime:number = 0;
    private pausedTime:number = 0;
    private currentTime:number = 0;
    
    private t:number;
    private x:number;
    private y:number;
    private lastT:number = 0;

    private isPlaying:boolean = false;
    private isPaused:boolean = false;

    onLoad()
    {
        if (this._playOnLoad)
            this.play();

        this.restartInEditor();
    }

    onEnable()
    {
        if (this._playOnLoad)
            this.play();

        this.restartInEditor();
    }

    onDisable()
    {
        if (EDITOR)
            this.stopEditorUpdate();
    }

    update(deltaTime:number)
    {
        if (this.isPlaying && !this.isPaused)
            this.updatePosition();
    }

    private restartInEditor():void
    {
        if (EDITOR && this._enableInEditor)
            this.startEditorUpdate();
    }

    private startEditorUpdate():void
    {
        const updateInEditor = ():void =>
        {
            if (!this.node || !this._enableInEditor)
                return;

            if (EDITOR && this.node.isValid && this.isPlaying && !this.isPaused)
            {
                this.updatePosition();
                requestAnimationFrame(updateInEditor);
            }
        };
        
        requestAnimationFrame(updateInEditor);
    }
    
    private stopEditorUpdate():void
    {
        
    }

    private updatePosition():void
    {
        if (!this.node)
            return;

        this.currentTime = sys.now() / 1000;

        this.t = (this.currentTime - this.startTime) * this._speed;

        // Проверка завершения полного цикла
        if (this._stopOnCycleComplete && this.lastT > 0)
        {
            // Определяем, что полный цикл завершён, если t перешёл через значение 2*PI
            // (так как sin и cos имеют период 2*PI)
            const previousCycle = Math.floor(this.lastT / (2 * Math.PI));
            const currentCycle = Math.floor(this.t / (2 * Math.PI));
            
            if (currentCycle > previousCycle)
            {
                this.stop();
                return;
            }
        }

        if (this._rotateBy90Degrees)
        {
            this.x = this._B * Math.sin(this._b * this.t);
            this.y = this._A * Math.sin(this._a * this.t + this._delta);
        }
        else
        {
            this.x = this._A * Math.sin(this._a * this.t + this._delta);
            this.y = this._B * Math.sin(this._b * this.t);
        }

        this.node.setPosition(this.x, this.y, 0);
        
        this.lastT = this.t;
    }

    private setType():void
    {
        switch (this._type)
        {
            case LissajousShateType.LINE_LB_RT:
            {
                this._A = 100;
                this._B = 100;

                this._a = 1;
                this._b = 1;

                this._delta = 0;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.LINE_LT_RB:
            {
                this._A = 100;
                this._B = 100;

                this._a = -1;
                this._b = 1;

                this._delta = 0;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.LINE_UP_DOWN:
            {
                this._A = 100;
                this._B = 100;

                this._a = 0;
                this._b = 1;

                this._delta = 0;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.LINE_LEFT_RIGHT:
            {
                this._A = 100;
                this._B = 100;

                this._a = 1;
                this._b = 0;

                this._delta = 0;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.ELLIPSE:
            {
                this._A = 100;
                this._B = 100;

                this._a = 1;
                this._b = 1;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.PARABOLA_RIGHT:
            {
                this._A = 100;
                this._B = 100;

                this._a = 2;
                this._b = 1;

                this._delta = -Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.PARABOLA_LEFT:
            {
                this._A = 100;
                this._B = 100;

                this._a = 2;
                this._b = 1;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.PARABOLA_UP:
            {
                this._A = 100;
                this._B = 100;

                this._a = 2;
                this._b = 1;

                this._delta = -Math.PI / 2;
                this._rotateBy90Degrees = true;
                break;
            }
            case LissajousShateType.PARABOLA_DOWN:
            {
                this._A = 100;
                this._B = 100;

                this._a = 2;
                this._b = 1;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = true;
                break;
            }
            case LissajousShateType.SHAPE_1:
            {
                this._A = 100;
                this._B = 100;

                this._a = 1;
                this._b = 2;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.SHAPE_2:
            {
                this._A = 100;
                this._B = 100;

                this._a = 3;
                this._b = 2;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.SHAPE_3:
            {
                this._A = 100;
                this._B = 100;

                this._a = 3;
                this._b = 4;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.SHAPE_4:
            {
                this._A = 100;
                this._B = 100;

                this._a = 5;
                this._b = 4;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.SHAPE_5:
            {
                this._A = 100;
                this._B = 100;

                this._a = 5;
                this._b = 6;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.SHAPE_6:
            {
                this._A = 100;
                this._B = 100;

                this._a = 9;
                this._b = 8;

                this._delta = Math.PI / 2;
                this._rotateBy90Degrees = false;
                break;
            }
            case LissajousShateType.CHEBYSHEV_POLYNOMIAL:
            {
                this._A = 100;
                this._B = 100;

                this._a = 1;
                this._b = this._N;

                this._delta = ((this._N - 1) / this._N) * (Math.PI / 2);
                this._rotateBy90Degrees = false;
                break;
            }
            default:
            {
                break;
            }
        }
    }

    public resetTime():void
    {
        this.startTime = sys.now() / 1000;
        this.pausedTime = 0;
        this.lastT = 0;
    }

    public play():void
    {
        /* if (this._isPaused)
        {
            this.resume();
            return;
        } */
        
        this.resetTime();

        this.isPlaying = true;
        this.isPaused = false;
    }

    public stop():void
    {
        this.isPlaying = false;
        this.isPaused = false;
    }

    public pause():void
    {
        if (!this.isPlaying || this.isPaused)
            return;
        
        this.isPaused = true;
        this.pausedTime = (sys.now() / 1000) - this.startTime;
    }

    public resume():void
    {
        if (!this.isPlaying || !this.isPaused)
            return;
        
        this.isPaused = false;
        this.startTime = (sys.now() / 1000) - this.pausedTime;
    }
}