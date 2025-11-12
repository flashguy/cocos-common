import { _decorator, Component, EventKeyboard, Input, input, KeyCode, sys, Vec2 } from 'cc';
const { ccclass, property } = _decorator;

@ccclass('TestData')
export class TestData
{
    public name:string = "";
    public id:number = 0;

    constructor(name:string, id:number)
    {
        this.name = name;
        this.id = id;
    }
}

// INFO: Документация доступна в репозитории https://github.com/ze0nni/DirtyDOM
@ccclass('DebugPanel')
export class DebugPanel extends Component
{
    @property
    protected posOnPC:Vec2 = new Vec2();

    @property
    protected posOnMobile:Vec2 = new Vec2();
    
    @property
    private showAsStart:boolean = false;

    @property
    private showAsStartIfLocalhost:boolean = false;

    @property
    protected defaultTab:number = 0;

    @property
    protected openKeyKode:KeyCode = KeyCode.NONE;

    private _isDebugPanelOpened:boolean = false;

    protected _window;

    onLoad()
    {
        input.on(Input.EventType.KEY_DOWN, this.onKeyDown, this);

        if (this.showAsStart || (this.showAsStartIfLocalhost && this.isLocalhost()))
            this.tryOpenHideDebugPanel();
    }

    onDestroy()
    {
        input.off(Input.EventType.KEY_DOWN, this.onKeyDown, this);
    }

    private onKeyDown(event:EventKeyboard):void
    {
        if (this.openKeyKode == event.keyCode)
        {
            this.tryOpenHideDebugPanel();
        }
    }

    private tryOpenHideDebugPanel():void
    {
        if (this._isDebugPanelOpened)
            this.hideDebugPanel();
        else
            this.openDebugPanel();
    }

    private openDebugPanel():void
    {
        this._isDebugPanelOpened = true;

        const pages = this.getPages();

        this._window = DD.window("Отладочная панель", dd => {
                this.defaultTab = dd.switcher(this.defaultTab, pages, p => p.title);
                pages[this.defaultTab]?.body(dd);
        });
        this._window.show();

        if (sys.isMobile)
            this._window.move(this.posOnMobile.x, this.posOnMobile.y);
        else
            this._window.move(this.posOnPC.x, this.posOnPC.y);
    }

    protected hideDebugPanel():void
    {
        this._isDebugPanelOpened = false;
        this._window.close();
    }

    protected getPages()
    {
        return [this.examplePage1(), this.examplePage2(), this.examplePage3(), this.examplePage4()];
    }

    protected isLocalhost():boolean
    {
        return window.location.hostname.includes("localhost") || window.location.hostname.includes("http://192.168.1.85/");
    }

    public openFromOutside():void
    {
        this.openDebugPanel();
    }

    public dirty():void
    {
        this._window.dirty();
    }

    // =============
    // Example pages
    // =============

    private examplePage1()
    {
        let text1:string = "text";
        let text2:string = "textarea";

        return {
            title: "Текст",
            body: dd => {
                // dd.label("<img src='...'>");
                // dd.header("hello <b>world</b>!");

                dd.pushStyle('text-align', 'left');
                dd.header("Заголовок текст слева");

                dd.pushStyle('text-align', 'right');
                dd.pushStyle('color', '#000000');
                dd.header("Заголовок текст справа");

                dd.pushStyle('text-align', 'center');
                dd.pushStyle('color', '#FF0000');
                dd.header("Заголовок текст по центру");

                dd.pushStyle('text-align', 'justify');
                dd.pushStyle('color', '#00FF00');
                dd.header("Заголовок текст по ширине");

                dd.hr(); // разделитель и горизонтальный и вертикальный
                
                // Жирность текста
                // font-weight: bold;     /* жирный */
                // font-weight: 700;      /* эквивалент bold (числовое значение) */
                // font-weight: normal;   /* обычный (по умолчанию) */
                // font-weight: 400;      /* эквивалент normal */

                // font-weight: lighter;  /* светлее */
                // font-weight: bolder;   /* жирнее */
                // font-weight: 100;      /* тонкий */
                // font-weight: 900;      /* очень жирный */
                dd.pushStyle('text-align', 'left');
                dd.pushStyle('font-weight', 'bold');
                dd.label("Label текст слева жирный");

                // font-style: italic;    /* курсив */
                // font-style: oblique;   /* наклонный (похож на курсив) */
                // font-style: normal;    /* обычный (по умолчанию) */
                dd.pushStyle('text-align', 'right');
                dd.pushStyle('color', '#0000ff');
                dd.pushStyle('font-style', 'italic');
                dd.label("Label текст справа курсив");

                dd.pushStyle('text-align', 'center');
                dd.pushStyle('color', '#FF0000');
                dd.pushStyle('font-style', 'oblique');
                dd.label("Label текст по центру");

                dd.pushStyle('text-align', 'justify');
                dd.pushStyle('color', '#ea00ffff');
                dd.label("Label текст по ширине");

                dd.hr(); // разделитель и горизонтальный и вертикальный
                text1 = dd.text(text1);

                dd.hr(); // разделитель и горизонтальный и вертикальный
                text2 = dd.textarea(text2, 5); // параметры текст по умолчанию и количество строчек

                // font-size: small;    /* маленький */
                // font-size: medium;   /* средний (по умолчанию) */
                // font-size: large;    /* большой */
                // font-size: larger;   /* больше чем у родителя */
                // font-size: smaller;  /* меньше чем у родителя */
                dd.space(20);
                dd.pushStyle('color', '#ff0000ff');
                dd.pushStyle('font-weight', 'bold');
                dd.pushStyle('font-size', '16px');
                if (dd.button("Закрыть панель"))
                    this.hideDebugPanel();
            }
        }
    }

    private examplePage2()
    {
        const strings:string[] = ["Элемент 0", "Элемент 1", "Элемент 2"];
        const datas1 = [
            ["test data 0", new TestData("data0", 0)], 
            ["test data 1", new TestData("data1", 1)], 
            ["test data 2", new TestData("data2", 2)]
        ];
        const datas2 = [
            new TestData("data0", 0),
            new TestData("data1", 1),
            new TestData("data2", 2)
        ];

        let selectedIndex0:number = 0;
        let selectedIndex1:number = 1;
        let selectedIndex2:number = 2;
        let selectedIndex3:number = 0;
        let selectedIndex4:number = 1;
        let selectedIndex5:number = 2;
        
        let toggle1:boolean = false;
        let toggle2:boolean = true;
        
        let counter1:number = 0;

        return {
            title: "Кнопки / переключатели",
            body: dd => {
                if (dd.button("Кнопка 1 на всю область")) { console.log("Нажали кнопку 1"); }

                dd.hBox(dd => {
                        if (dd.button("Кнопка в hBox 2")) { console.log("Нажали кнопку 2"); }
                        if (dd.button("Кнопка в hBox 3")) { console.log("Нажали кнопку 3"); }
                    });

                dd.hr(); // разделитель и горизонтальный и вертикальный
                dd.hBox(dd => {
                        dd.expand(); // прижимает слева справа
                        dd.label(`Инкремент ${counter1}`);
                        if (dd.button("-")) { counter1 -= 1; }
                        if (dd.button("+")) { counter1 += 1; }
                    });
                
                dd.hr(); // разделитель и горизонтальный и вертикальный
                selectedIndex0 = dd.switcher(selectedIndex0, strings);
                selectedIndex1 = dd.switcher(selectedIndex1, datas1);
                selectedIndex2 = dd.switcher(selectedIndex2, datas2, o => o.name);
                
                dd.hr(); // разделитель и горизонтальный и вертикальный
                selectedIndex3 = dd.combo(selectedIndex3, strings);
                selectedIndex4 = dd.combo(selectedIndex4, datas1);
                selectedIndex5 = dd.combo(selectedIndex5, datas2, o => o.name);

                dd.hr(); // разделитель и горизонтальный и вертикальный
                toggle1 = dd.toggle(toggle1, "Переключатель 1")
                toggle2 = dd.toggle(toggle2, "Переключатель 2")

                dd.space(20);  // отступ и горизонтальный и вертикальный в пикселях
                dd.pushStyle('color', '#ff0000ff');
                dd.pushStyle('font-weight', 'bold');
                dd.pushStyle('font-size', '16px');
                if (dd.button("Закрыть панель"))
                    this.hideDebugPanel();
            }
        }
    }
    
    private examplePage3()
    {
        return {
            title: "Макеты",
            body: dd => {
                dd.hBox(dd => {
                    dd.button("hBox");
                    dd.button("hBox");
                    dd.button("hBox");
                });

                dd.hr(); // разделитель и горизонтальный и вертикальный
                dd.hBox(dd => {
                    dd.vBox(dd => {
                        dd.button("vBox");
                        dd.button("vBox");
                    });
                    dd.vBox(dd => {
                        dd.button("vBox");
                        dd.button("vBox");
                    });
                    dd.hr(); // разделитель и горизонтальный и вертикальный
                    dd.vBox(dd => {
                        dd.button("vBox");
                        dd.button("vBox");
                    });
                });

                dd.hr(); // разделитель и горизонтальный и вертикальный
                dd.hBox(dd => {
                    dd.expand(); // прижимает слева справа
                    dd.button("Прижать вправо");
                });
                dd.hBox(dd => {
                    dd.button("Прижать влево");
                    dd.expand(); // прижимает слева справа
                });
                dd.hBox(dd => {
                    dd.expand(); // прижимает слева справа
                    dd.button("Прижать к центру");
                    dd.expand(); // прижимает слева справа
                });

                dd.hr(); // разделитель и горизонтальный и вертикальный
                dd.pushStyle('max-height', '200');
                dd.pushStyle('overflow-y', 'auto');
                dd.pushStyle('background', '#bdbdbdff');
                dd.pushStyle('padding', '10px');
                dd.vBox(dd => {
                        for (let i = 0; i < 100; i++)
                        {
                            dd.label(`Элемент ${i}`);
                        }
                    });

                dd.space(20);  // отступ и горизонтальный и вертикальный в пикселях
                dd.pushStyle('color', '#ff0000ff');
                dd.pushStyle('font-weight', 'bold');
                dd.pushStyle('font-size', '16px');
                if (dd.button("Закрыть панель"))
                    this.hideDebugPanel();
            }
        }
    }
    
    private examplePage4()
    {
        return {
            title: "Картинки",
            body: dd => {
                // dd.pushStyle('background-image', 'debug-panel/icons/rotate_90_degrees_ccw_16dp.svg');
                // dd.pushStyle('background-position', 'center');
                // dd.pushStyle('background-repeat', 'no-repeat');
                dd.hBox(dd => {
                    dd.button("<img src='debug-panel/icons/rotate_auto_16dp.svg'><br/>Кнопка с картинкой");

                    dd.pushStyle('display', 'flex');
                    dd.pushStyle('justify-content', 'center'); // горизонтальное выравнивание
                    dd.pushStyle('align-items', 'center'); // вертикальное выравнивание
                    dd.button("<img src='debug-panel/icons/rotate_auto_16dp.svg'> Кнопка с картинкой");

                    dd.pushStyle('display', 'flex');
                    dd.pushStyle('justify-content', 'center'); // горизонтальное выравнивание
                    dd.pushStyle('align-items', 'center'); // вертикальное выравнивание
                    dd.button("Кнопка с картинкой <img src='debug-panel/icons/rotate_auto_16dp.svg'>");
                });
                dd.hBox(dd => {
                    dd.expand(); // прижимает слева справа
                    dd.button("<img src='debug-panel/icons/rotate_90_degrees_ccw_16dp.svg'>");
                    dd.button("<img src='debug-panel/icons/rotate_90_degrees_cw_16dp.svg'>");
                    dd.expand(); // прижимает слева справа
                });

                dd.pushStyle('display', 'flex');
                dd.pushStyle('justify-content', 'center'); // горизонтальное выравнивание
                dd.pushStyle('align-items', 'center'); // вертикальное выравнивание
                // dd.pushStyle('filter', 'invert(16%) sepia(89%) saturate(6054%) hue-rotate(230deg) brightness(100%) contrast(100%)');
                dd.label("<img src='debug-panel/icons/rotate_90_degrees_ccw_16dp.svg'> Label с картинкой <img src='debug-panel/icons/rotate_90_degrees_ccw_16dp.svg'>");

                dd.space(20);  // отступ и горизонтальный и вертикальный в пикселях
                dd.pushStyle('color', '#ff0000ff');
                dd.pushStyle('font-weight', 'bold');
                dd.pushStyle('font-size', '16px');
                if (dd.button("Закрыть панель"))
                    this.hideDebugPanel();
            }
        }
    }
}