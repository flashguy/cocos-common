import { _decorator, Component, Enum, Quat, Vec3 } from 'cc';
import { EDITOR } from 'cc/env';
const { ccclass, property, executeInEditMode } = _decorator;

export enum FunctionType
{
    SIN,            // Синусоида - плавные колебания
    COS,            // Косинусоида - плавные колебания со сдвигом фазы
    
    // Дополнительные функции
    TAN,            // Тангенс - резкие пики
    SQUARE,         // Прямоугольная волна - резкие переключения
    SAWTOOTH,       // Пилообразная волна - плавный подъем и резкий сброс
    TRIANGLE,       // Треугольная волна - линейные подъемы и спады
    
    // Экспоненциальные и логарифмические
    EXPONENTIAL,    // Экспоненциальный рост/спад
    LOGARITHMIC,    // Логарифмическая функция
    
    // Специальные эффекты
    RANDOM,         // Случайные колебания (шум)
    PULSE,          // Импульсы (кратковременные всплески)
    BEAT,           // Биения (наложение двух частот)
    DAMPED,         // Затухающие колебания
    ACCELERATING    // Ускоряющиеся колебания
}
Enum(FunctionType);

export enum OscillationProperty
{
    X,
    Y,
    Z,
    XY,
    XZ,
    YZ,
    SCALE_X,
    SCALE_Y,
    SCALE_Z,
    SCALE_XY,
    SCALE_XZ,
    SCALE_YZ,
    SCALE_XYZ,
    ROTATION_X,
    ROTATION_Y,
    ROTATION_Z,
    ROTATION_XY,
    ROTATION_XZ,
    ROTATION_YZ,
}
Enum(OscillationProperty);

@ccclass('OscillationMovement')
@executeInEditMode(true)
export class OscillationMovement extends Component
{
    @property
    private startPosition:Vec3 = new Vec3();

    @property
    private startScale:Vec3 = new Vec3(1, 1, 1);

    @property
    private startRotationEuler:Vec3 = new Vec3();

    @property
    private startRotationQuat:Quat = new Quat();

    @property
    private _amplitude:number = 100;

    @property({ displayName: "amplitude (амплитуда)", tooltip: "Амплитуда колебаний (расстояние от средней точки до максимума/минимума)" })
    public get amplitude():number
    {
        return this._amplitude;
    }
    public set amplitude(value:number)
    {
        this._amplitude = value;
        this.resetValuesToStart();
        this.adjustAnimation();
    }

    @property
    private _frequency:number = 1;

    @property({ displayName: "frequency (Частота)", tooltip: "Частота колебаний (сколько раз в секунду происходит полный цикл)" })
    public get frequency():number
    {
        return this._frequency;
    }
    public set frequency(value:number)
    {
        this._frequency = value;
        this.resetValuesToStart();
        this.adjustAnimation();
    }

    @property({ type:FunctionType })
    private _functionType:FunctionType = FunctionType.COS;

    @property({ type:FunctionType, displayName: "functionType Функция колебания", tooltip: "Функция колебания" })
    public get functionType():FunctionType
    {
        return this._functionType;
    }
    public set functionType(value:FunctionType)
    {
        this._functionType = value;
        this.resetValuesToStart();
        this.adjustAnimation();
    }

    @property({ type:OscillationProperty })
    private _oscillationProperty:OscillationProperty = OscillationProperty.X;

    @property({ type:OscillationProperty, displayName: "oscillationProperty Анимируемое свойство", tooltip: "Анимируемое свойство" })
    public get oscillationProperty():OscillationProperty
    {
        return this._oscillationProperty;
    }
    public set oscillationProperty(value:OscillationProperty)
    {
        this._oscillationProperty = value;
        this.resetValuesToStart();
        this.adjustAnimation();
    }

    @property({ tooltip: "Время, прошедшее с начала движения" })
    private timePassed:number = 0;

    @property({ tooltip: "Считать время если анимация не запущена" })
    private keepIimeCountingIfAnimationStopped:boolean = false;

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
            this.resetValuesToStart();
            this.restartInEditor();
            this.play();
        }
    }
    
    private isPlaying:boolean = false;

    onLoad()
    {
        if (this._playOnLoad)
            this.play();

        this.restartInEditor();
    }

    onEnable()
    {
        this.updateStartValues();

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
        if (this.isPlaying || this.keepIimeCountingIfAnimationStopped)
            this.timePassed += deltaTime;

        if (this.isPlaying)
            this.adjustAnimation();
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

            if (EDITOR && this.node.isValid && this.isPlaying)
            {
                this.adjustAnimation();
                requestAnimationFrame(updateInEditor);
            }
        };
        
        requestAnimationFrame(updateInEditor);
    }

    private stopEditorUpdate():void
    {
        
    }

    private adjustAnimation():void
    {
        // Анимация позиции
        if (this._oscillationProperty == OscillationProperty.X
            || this._oscillationProperty == OscillationProperty.Y
            || this._oscillationProperty == OscillationProperty.Z
            || this._oscillationProperty == OscillationProperty.XY
            || this._oscillationProperty == OscillationProperty.XZ
            || this._oscillationProperty == OscillationProperty.YZ)
        {
            const newPos:Vec3 = this.startPosition.clone();
            
            if (this._oscillationProperty == OscillationProperty.X
                || this._oscillationProperty == OscillationProperty.XY
                || this._oscillationProperty == OscillationProperty.XZ)
            {
                newPos.x = this.getOscillationValue(OscillationProperty.X);
            }
            
            if (this._oscillationProperty == OscillationProperty.Y
                || this._oscillationProperty == OscillationProperty.XY
                || this._oscillationProperty == OscillationProperty.YZ)
            {
                newPos.y = this.getOscillationValue(OscillationProperty.Y);
            }
            
            if (this._oscillationProperty == OscillationProperty.Z
                || this._oscillationProperty == OscillationProperty.XZ
                || this._oscillationProperty == OscillationProperty.YZ)
            {
                newPos.z = this.getOscillationValue(OscillationProperty.Z);
            }
                
            this.node.setPosition(newPos);
        }
        
        // Анимация масштаба
        else if (this._oscillationProperty == OscillationProperty.SCALE_X
            || this._oscillationProperty == OscillationProperty.SCALE_Y
            || this._oscillationProperty == OscillationProperty.SCALE_Z
            || this._oscillationProperty == OscillationProperty.SCALE_XY
            || this._oscillationProperty == OscillationProperty.SCALE_XZ
            || this._oscillationProperty == OscillationProperty.SCALE_YZ
            || this._oscillationProperty == OscillationProperty.SCALE_XYZ)
        {
            const newScale:Vec3 = this.startScale.clone();
            
            if (this._oscillationProperty == OscillationProperty.SCALE_X 
                || this._oscillationProperty == OscillationProperty.SCALE_XY 
                || this._oscillationProperty == OscillationProperty.SCALE_XZ
                || this._oscillationProperty == OscillationProperty.SCALE_XYZ)
                {
                    newScale.x = this.getOscillationValue(OscillationProperty.SCALE_X);
                }
                
            if (this._oscillationProperty == OscillationProperty.SCALE_Y 
                || this._oscillationProperty == OscillationProperty.SCALE_XY 
                || this._oscillationProperty == OscillationProperty.SCALE_YZ
                || this._oscillationProperty == OscillationProperty.SCALE_XYZ)
                {
                    newScale.y = this.getOscillationValue(OscillationProperty.SCALE_Y);
                }
                
            if (this._oscillationProperty == OscillationProperty.SCALE_Z 
                || this._oscillationProperty == OscillationProperty.SCALE_XZ 
                || this._oscillationProperty == OscillationProperty.SCALE_YZ
                || this._oscillationProperty == OscillationProperty.SCALE_XYZ)
                {
                    newScale.z = this.getOscillationValue(OscillationProperty.SCALE_Z);
                }
                
            this.node.setScale(newScale);
        }
        
        // Анимация вращения
        else if (this._oscillationProperty == OscillationProperty.ROTATION_X
            || this._oscillationProperty == OscillationProperty.ROTATION_Y
            || this._oscillationProperty == OscillationProperty.ROTATION_Z
            || this._oscillationProperty == OscillationProperty.ROTATION_XY
            || this._oscillationProperty == OscillationProperty.ROTATION_XZ
            || this._oscillationProperty == OscillationProperty.ROTATION_YZ)
        {
            const newEuler:Vec3 = this.startRotationEuler.clone();
            
            if (this._oscillationProperty == OscillationProperty.ROTATION_X
                || this._oscillationProperty == OscillationProperty.ROTATION_XY
                || this._oscillationProperty == OscillationProperty.ROTATION_XZ)
                {
                    newEuler.x = this.getOscillationValue(OscillationProperty.ROTATION_X);
                }
            if (this._oscillationProperty == OscillationProperty.ROTATION_Y
                || this._oscillationProperty == OscillationProperty.ROTATION_XY
                || this._oscillationProperty == OscillationProperty.ROTATION_YZ)
                {
                    newEuler.y = this.getOscillationValue(OscillationProperty.ROTATION_Y);
                }
            if (this._oscillationProperty == OscillationProperty.ROTATION_Z
                || this._oscillationProperty == OscillationProperty.ROTATION_XZ
                || this._oscillationProperty == OscillationProperty.ROTATION_YZ)
                {
                    newEuler.z = this.getOscillationValue(OscillationProperty.ROTATION_Z);
                }
                
            this.node.setRotationFromEuler(newEuler);
        }
    }

    private getOscillationValue(property:OscillationProperty):number
    {
        let startValue:number;
        
        // Определяем конкретное свойство
        switch (property)
        {
            case OscillationProperty.X: startValue = this.startPosition.x; break;
            case OscillationProperty.Y: startValue = this.startPosition.y; break;
            case OscillationProperty.Z: startValue = this.startPosition.z; break;
            case OscillationProperty.SCALE_X: startValue = this.startScale.x; break;
            case OscillationProperty.SCALE_Y: startValue = this.startScale.y; break;
            case OscillationProperty.SCALE_Z: startValue = this.startScale.z; break;
            case OscillationProperty.ROTATION_X: startValue = this.startRotationEuler.x; break;
            case OscillationProperty.ROTATION_Y: startValue = this.startRotationEuler.y; break;
            case OscillationProperty.ROTATION_Z: startValue = this.startRotationEuler.z; break;
            default: return 0;
        }
        
        // Базовое время в радианах
        const t = this.timePassed * this._frequency * 2 * Math.PI;

        // Вычисляем колебание
        switch (this._functionType)
        {
            case FunctionType.SIN:
            {
                // Плавные колебания
                return startValue + Math.sin(t) * this._amplitude;
            }
            case FunctionType.COS:
            {
                // Плавные колебания со сдвигом фазы
                return startValue + Math.cos(t) * this._amplitude;
            }
            case FunctionType.TAN:
            {
                // Тангенс с ограничением, чтобы избежать бесконечности
                const tanVal = Math.tan(t);
                const clampedTan = Math.max(-5, Math.min(5, tanVal)); // Ограничиваем значение
                return startValue + clampedTan * this._amplitude;
            }
            case FunctionType.SQUARE:
            {
                // Прямоугольная волна: +1 когда sin > 0, -1 когда sin < 0
                return startValue + (Math.sin(t) > 0 ? 1 : -1) * this._amplitude;
            }
            case FunctionType.SAWTOOTH:
            {
                // Пилообразная волна: линейный рост от -1 до 1
                const sawtooth = 2 * (t / (2 * Math.PI) - Math.floor(0.5 + t / (2 * Math.PI)));
                return startValue + sawtooth * this._amplitude;
            }
            case FunctionType.TRIANGLE:
            {
                // Треугольная волна: линейные подъемы и спады
                const tri = 2 * Math.abs(2 * (t / (2 * Math.PI) - Math.floor(0.5 + t / (2 * Math.PI)))) - 1;
                return startValue + tri * this._amplitude;
            }
            case FunctionType.EXPONENTIAL:
            {
                // Экспоненциальный рост/спад
                return startValue + (Math.exp(Math.sin(t)) - 1.718) * this._amplitude; // Корректировка для симметрии
            }
            case FunctionType.LOGARITHMIC:
            {
                // Логарифмическая функция
                return startValue + Math.log(1 + Math.abs(Math.sin(t))) * Math.sign(Math.sin(t)) * this._amplitude;
            }
            case FunctionType.RANDOM:
            {
                // Случайные колебания (шум Перлина)
                // Обновляем случайное значение каждые 0.1 секунды для плавности
                const randomPhase = Math.floor(this.timePassed * 10);
                const randomVal = (Math.sin(randomPhase * 12.9898 + 43758.5453) * 43758.5453) % 1;
                return startValue + (randomVal * 2 - 1) * this._amplitude;
            }
            case FunctionType.PULSE:
            {
                // Импульсы (кратковременные всплески)
                const pulseTime = this.timePassed % (1 / this._frequency);
                const pulseWidth = 0.1; // 10% от периода
                const pulseVal = pulseTime < pulseWidth ? 1 : 0;
                return startValue + pulseVal * this._amplitude;
            }
            case FunctionType.BEAT:
            {
                // Биения (наложение двух частот)
                const beatFreq = this._frequency * 0.1; // Вторая частота в 10 раз меньше
                return startValue + Math.sin(t) * Math.cos(t * beatFreq) * this._amplitude;
            }
            case FunctionType.DAMPED:
            {
                // Затухающие колебания
                // const damping = Math.exp(-this.timePassed * 0.5); // Коэффициент затухания
                // return startValue + Math.sin(t) * this.amplitude * damping;

                // Затухающие колебания
                const damping = Math.exp(-this.timePassed * 0.5); // Коэффициент затухания
                // Убедимся, что амплитуда затухает от полного значения к нулю
                const currentAmplitude = this._amplitude * damping;
                return startValue + Math.sin(t) * currentAmplitude;
            }
            case FunctionType.ACCELERATING:
            {
                // Ускоряющиеся колебания (частота увеличивается со временем)
                const accelT = this.timePassed * this._frequency * 2 * Math.PI * (1 + this.timePassed * 0.1);
                return startValue + Math.sin(accelT) * this._amplitude;
            }
            default:
                return startValue;
        }
    }

    public setTimeShift(startTime:number):void
    {
        this.timePassed = startTime;
    }
    
    public resetTime():void
    {
        this.timePassed = 0;
    }
    
    public updateStartValues():void
    {
        // Обновляем все начальные значения текущими
        // this.startPosition.set(this.node.position);
        // this.startScale.set(this.node.scale);
        // this.startRotationQuat.set(this.node.rotation);
        // this.startRotationEuler.set(this.node.eulerAngles);
    }

    public play():void
    {
        // Сохраняем начальные значения всех свойств
        this.updateStartValues();

        this.isPlaying = true;
    }

    public stop():void
    {
        this.isPlaying = false;
    }

    public resetPositionToStart():void
    {
        this.node.position = this.startPosition.clone();
    }

    public resetScaleToStart():void
    {
        this.node.scale = this.startScale.clone(); 
    }

    public resetRotationToStart():void
    {
        this.node.rotation = this.startRotationQuat.clone();
    }

    public resetValuesToStart():void
    {
        this.resetPositionToStart();
        this.resetScaleToStart();
        this.resetRotationToStart();
    }
}