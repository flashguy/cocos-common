import { _decorator, Component, Enum, Node, tween, Tween, v3, Vec3 } from 'cc';
import { MoveMethodType } from './MoveMethodType';
import { IMoveMethod } from './IMoveMethod';
import { LinearMove } from './LinearMove';
import { SinusoidalMove } from './SinusoidalMove';
import { CosineMove } from './CosineMove';
import { ParabolicMove } from './ParabolicMove';
import { ArchimedeanSpiralMove } from './ArchimedeanSpiralMove';
import { LogarithmicSpiralMove } from './LogarithmicSpiralMove';
const { ccclass, property } = _decorator;

@ccclass('NodeMover')
export class NodeMover extends Component
{
    @property({ tooltip: 'Начальная точка перемещения' })
    private startPoint:Vec3 = v3(0, 0, 0);
    
    @property({ tooltip: 'Конечная точка перемещения' })
    private endPoint:Vec3 = v3(0, 0, 0);
    
    @property({ tooltip: 'Длительность анимации в секундах' })
    private duration:number = 1.0;
    
    @property({ type: Enum(MoveMethodType), tooltip: 'Метод перемещения' })
    private moveMethodType:MoveMethodType = MoveMethodType.LINEAR;
    
    // Параметры для синусоидального перемещения
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.SINUSOIDAL; } })
    private sinAmplitude:number = 100;
    
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.SINUSOIDAL; } })
    private sinFrequency:number = Math.PI * 2;
    
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.SINUSOIDAL; } })
    private sinEnableDecay:boolean = true;
    
    // Параметры для косинусоидального перемещения
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.COSINE; } })
    private cosAmplitude:number = 100;
    
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.COSINE; } })
    private cosFrequency:number = Math.PI * 2;
    
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.COSINE; } })
    private cosEnableDecay:boolean = true;
    
    // Параметры для параболического перемещения
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.PARABOLIC; } })
    private parabolaHeight:number = 100;
    
    // Параметры для Архимедовой спирали
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.ARCHIMEDEAN_SPIRAL; } })
    private archimedeanTurns:number = 2;
    
    // Параметры для Логарифмической спирали
    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.LOGARITHMIC_SPIRAL; } })
    private logarithmicTurns:number = 2;

    @property({ visible: function(this: NodeMover) { return this.moveMethodType === MoveMethodType.LOGARITHMIC_SPIRAL; } })
    private logarithmicGrowthFactor:number = 0.5; // фактор роста (чем больше, тем быстрее раскручивается)
    
    // Общие параметры для всех способов движения
    @property({ tooltip: 'Поворачивать объект в сторону движения' })
    private enableRotation:boolean = false;
    
    private _currentTween:Tween<Node> | null = null;
    private _moveMethod:IMoveMethod | null = null;
    private _isMoving:boolean = false;
    private _animationStartTime:number = 0;
    private _animationDuration:number = 0;
    private _lastPosition:Vec3 = v3(0, 0, 0);
    private _onMoveCompleteCallback:Function = null;
    
    onLoad()
    {
        this.initMoveMethod();
        this.initializeAtStartPosition();
    }
    
    onDestroy()
    {
        this.stopMove();
    }

    update(deltaTime:number)
    {
        if (!this._isMoving || !this._moveMethod) return;
        
        const currentTime:number = (Date.now() / 1000) - this._animationStartTime;
        
        if (currentTime >= this._animationDuration)
        {
            this.node.setPosition(this.endPoint);
            this.onMoveComplete();
            return;
        }
        
        const newPos = this._moveMethod.calculate(
            currentTime,
            this._animationDuration,
            this.startPoint,
            this.endPoint
        );
        
        this.node.setPosition(newPos);
        
        if (this.enableRotation && this._moveMethod && (this._moveMethod as any).shouldRotate?.())
        {
            const shouldRotate = (this._moveMethod as any).shouldRotate();
            if (shouldRotate)
            {
                const direction = new Vec3();
                Vec3.subtract(direction, newPos, this._lastPosition);
                
                if (direction.length() > 0.001)
                {
                    const angle = Math.atan2(direction.y, direction.x);
                    this.node.setRotationFromEuler(0, 0, angle * 180 / Math.PI);
                }
                
                this._lastPosition = newPos.clone();
            }
        }
    }
    
    private initializeAtStartPosition():void
    {
        this.node.setPosition(this.startPoint);
        this._lastPosition = this.startPoint.clone();
        
        if (this.enableRotation && this._moveMethod && (this._moveMethod as any).shouldRotate?.())
        {
            const direction = new Vec3();
            Vec3.subtract(direction, this.endPoint, this.startPoint);
            
            if (direction.length() > 0.001)
            {
                const angle = Math.atan2(direction.y, direction.x);
                this.node.setRotationFromEuler(0, 0, angle * 180 / Math.PI);
            }
        }
    }
    
    private initMoveMethod():void
    {
        switch (this.moveMethodType)
        {
            case MoveMethodType.LINEAR:
            {
                this._moveMethod = new LinearMove(this.enableRotation);
                break;
            }
            case MoveMethodType.SINUSOIDAL:
            {
                this._moveMethod = new SinusoidalMove(this.sinAmplitude, this.sinFrequency, this.sinEnableDecay, this.enableRotation);
                break;
            }
            case MoveMethodType.COSINE:
            {
                this._moveMethod = new CosineMove(this.cosAmplitude, this.cosFrequency, this.cosEnableDecay, this.enableRotation);
                break;
            }
            case MoveMethodType.PARABOLIC:
            {
                this._moveMethod = new ParabolicMove(this.parabolaHeight, this.enableRotation);
                break;
            }
            case MoveMethodType.ARCHIMEDEAN_SPIRAL:
            {
                this._moveMethod = new ArchimedeanSpiralMove(this.archimedeanTurns, this.enableRotation);
                break;
            }
            case MoveMethodType.LOGARITHMIC_SPIRAL:
            {
                this._moveMethod = new LogarithmicSpiralMove(this.logarithmicTurns, this.logarithmicGrowthFactor, this.enableRotation);
                break;
            }
            default:
            {
                this._moveMethod = new LinearMove(this.enableRotation);
            }
        }
    }
    
    public setMovePoints(start:Vec3, end:Vec3):void
    {
        this.startPoint = start.clone();
        this.endPoint = end.clone();

        if (!this._isMoving)
        {
            this.node.setPosition(start);
            this._lastPosition = start.clone();
            
            if (this.enableRotation && this._moveMethod && (this._moveMethod as any).shouldRotate?.())
            {
                const direction = new Vec3();
                Vec3.subtract(direction, this.endPoint, this.startPoint);
                
                if (direction.length() > 0.001)
                {
                    const angle = Math.atan2(direction.y, direction.x);
                    this.node.setRotationFromEuler(0, 0, angle * 180 / Math.PI);
                }
            }
        }
    }
    
    public setMoveMethod(methodType:MoveMethodType, params?:{ 
        sinAmplitude?:number, 
        sinFrequency?:number, 
        sinEnableDecay?:boolean,
        cosAmplitude?:number,
        cosFrequency?:number,
        cosEnableDecay?:boolean,
        parabolaHeight?:number,
        archimedeanTurns?:number,
        logarithmicTurns?:number,
        logarithmicGrowthFactor?:number,
        enableRotation?:boolean,
        duration?:number 
    }):void
    {
        this.moveMethodType = methodType;
        
        if (params)
        {
            if (params.sinAmplitude !== undefined)
                this.sinAmplitude = params.sinAmplitude;
            if (params.sinFrequency !== undefined)
                this.sinFrequency = params.sinFrequency;
            if (params.sinEnableDecay !== undefined)
                this.sinEnableDecay = params.sinEnableDecay;
            if (params.cosAmplitude !== undefined)
                this.cosAmplitude = params.cosAmplitude;
            if (params.cosFrequency !== undefined)
                this.cosFrequency = params.cosFrequency;
            if (params.cosEnableDecay !== undefined)
                this.cosEnableDecay = params.cosEnableDecay;
            if (params.parabolaHeight !== undefined)
                this.parabolaHeight = params.parabolaHeight;
            if (params.archimedeanTurns !== undefined)
                this.archimedeanTurns = params.archimedeanTurns;
            if (params.logarithmicTurns !== undefined)
                this.logarithmicTurns = params.logarithmicTurns;
            if (params.logarithmicGrowthFactor !== undefined)
                this.logarithmicGrowthFactor = params.logarithmicGrowthFactor;
            if (params.enableRotation !== undefined)
                this.enableRotation = params.enableRotation;
            if (params.duration !== undefined)
                this.duration = params.duration;
        }
        
        this.initMoveMethod();
        
        if (!this._isMoving)
        {
            this.initializeAtStartPosition();
        }
    }
    
    public updateSinusoidalParams(amplitude:number, frequency:number, enableDecay?:boolean):void
    {
        this.sinAmplitude = amplitude;
        this.sinFrequency = frequency;
        if (enableDecay !== undefined)
            this.sinEnableDecay = enableDecay;
        if (this.moveMethodType === MoveMethodType.SINUSOIDAL)
            this.initMoveMethod();
    }
    
    public updateCosineParams(amplitude:number, frequency:number, enableDecay?:boolean):void
    {
        this.cosAmplitude = amplitude;
        this.cosFrequency = frequency;
        if (enableDecay !== undefined)
            this.cosEnableDecay = enableDecay;
        if (this.moveMethodType === MoveMethodType.COSINE)
            this.initMoveMethod();
    }
    
    public updateParabolicParams(height:number):void
    {
        this.parabolaHeight = height;
        if (this.moveMethodType === MoveMethodType.PARABOLIC)
            this.initMoveMethod();
    }
    
    public updateArchimedeanSpiralParams(turns:number):void
    {
        this.archimedeanTurns = turns;
        if (this.moveMethodType === MoveMethodType.ARCHIMEDEAN_SPIRAL)
            this.initMoveMethod();
    }
    
    public updateLogarithmicSpiralParams(turns:number, logarithmicGrowthFactor:number):void
    {
        this.logarithmicTurns = turns;
        this.logarithmicGrowthFactor = logarithmicGrowthFactor;
        if (this.moveMethodType === MoveMethodType.LOGARITHMIC_SPIRAL)
            this.initMoveMethod();
    }
    
    public setEnableRotation(enable:boolean):void
    {
        this.enableRotation = enable;
        this.initMoveMethod();
        if (!this._isMoving)
        {
            this.initializeAtStartPosition();
        }
    }
    
    public setDuration(duration:number):void
    {
        if (duration > 0)
        {
            this.duration = duration;
        }
        else
        {
            console.warn('Длительность должна быть больше 0');
        }
    }
    
    public getDuration():number
    {
        return this.duration;
    }
    
    public move(time?:number, onMoveCompleteCallback?:Function):void
    {
        this._onMoveCompleteCallback = onMoveCompleteCallback;

        let animationTime:number;
        
        if (time !== undefined && time > 0)
        {
            animationTime = time;
        }
        else if (time !== undefined && time <= 0)
        {
            console.warn('Время перемещения должно быть больше 0. Используется значение из компонента.');
            animationTime = this.duration;
        }
        else
        {
            animationTime = this.duration;
        }
        
        if (animationTime <= 0)
        {
            console.warn('Длительность анимации должна быть больше 0');
            return;
        }
        
        this.stopMove();
        
        this._animationDuration = animationTime;
        this._animationStartTime = Date.now() / 1000;
        this._isMoving = true;
        this._lastPosition = this.node.position.clone();
        
        this._currentTween = tween(this.node)
            .delay(animationTime)
            .call(() => {
                this.onMoveComplete();
            })
            .start();
    }
    
    private onMoveComplete():void
    {
        if (!this._isMoving) return;
        
        this._isMoving = false;
        this._currentTween = null;
        this.node.setPosition(this.endPoint);
        
        if (this.enableRotation && this._moveMethod && (this._moveMethod as any).shouldRotate?.())
        {
            const direction = new Vec3();
            Vec3.subtract(direction, this.endPoint, this.startPoint);
            
            if (direction.length() > 0.001)
            {
                const angle = Math.atan2(direction.y, direction.x);
                this.node.setRotationFromEuler(0, 0, angle * 180 / Math.PI);
            }
        }

        if (this._onMoveCompleteCallback)
            this._onMoveCompleteCallback();
    }
    
    public stopMove():void
    {
        if (this._currentTween)
        {
            this._currentTween.stop();
            this._currentTween = null;
        }
        this._isMoving = false;
    }
    
    public isMovingNow():boolean
    {
        return this._isMoving;
    }
}