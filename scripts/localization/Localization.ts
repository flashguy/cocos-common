import { _decorator, EventTarget, TextAsset } from 'cc';
import { LocalizationValue } from './LocalizationValue';
import { LocalizationEvent } from './LocalizationEvent';
const { ccclass } = _decorator;

// File Localization.ts created am_empty
// Date of creation Mon Aug 17 2026 20:42:11 GMT+0300 (Москва, стандартное время)

@ccclass('Localization')
export class Localization extends EventTarget
{
    private _languagesCodes:string[] = [];

    public get languagesCodes():string[]
    {
        return this._languagesCodes;
    }

    private _languagesNames:string[] = [];

    public get languagesNames():string[]
    {
        return this._languagesNames;
    }

    private _defaultLocale:string = "";

    public set defaultLocale(value:string)
    {
        this._defaultLocale = value;
    }
    
    public get defaultLocale():string
    {
        return this._defaultLocale;
    }

    private _isReady:boolean = false;

    public get isReady():boolean
    {
        return this._isReady;
    }

    private localeDataRows:string[] = [];
    private currentLocale:Map<string, LocalizationValue> = null;
    private currentLocaleIndex:number = -1;

    private parseLocale(data:TextAsset):void
    {
        if (data.text.indexOf("\r\n") > 0)
            this.localeDataRows = data.text.split("\r\n");
        else
            this.localeDataRows = data.text.split("\n");

        for (let i = 0; i < this.localeDataRows.length; i++)
        {
            let columns:string[] = this.localeDataRows[i].split("\t");
            
            if (columns[0] == "locale_code")
            {
                columns.splice(0, 1);
                this._languagesCodes = columns;
            }

            if (columns[0] == "locale_name")
            {
                columns.splice(0, 1);
                this._languagesNames = columns;
            }

            if (this._languagesCodes.length > 0 && this._languagesNames.length > 0)
            {
                break;
            }
        }

        this._isReady = true;
    }

    private getColumnByName(name:string):number
    {
        for (let i = 0; i < this._languagesNames.length; i++)
        {
            if (this._languagesNames[i] == name)
            {
                return (i + 1);
            }
        }

        return -1;
    }

    private getColumnByCode(code:string):number
    {
        for (let i = 0; i < this._languagesCodes.length; i++)
        {
            if (this._languagesCodes[i] == code)
            {
                return (i + 1);
            }
        }

        return -1;
    }

    private setLocale(columnIndex:number):void
    {
        this.currentLocaleIndex = columnIndex - 1;
        this.currentLocale = new Map<string, LocalizationValue>();

        for (let i = 0; i < this.localeDataRows.length; i++)
        {
            let columns:string[] = this.localeDataRows[i].split("\t");

            if (columns[0] != "locale_code" && columns[0] != "locale_name")
            {
                const jsonRegex:RegExp = /(\{.*?\}|\[.*?\])/g;
                let column:string = columns[columnIndex];
                let inlineJson:RegExpMatchArray = column.match(jsonRegex);
                let formatting:any;

                // NOTE: для Label можно менять параметры из локали через json
                if (inlineJson && inlineJson.length == 1)
                {
                    // NOTE: правильный формат json в локали {"size":10}
                    formatting = JSON.parse(inlineJson[0]);
                    column = column.replace(inlineJson[0], "");
                }

                // INFO: из google документов \n-пернос строки приходит экранированный \\n
                // и его нужно заменять если нужен перевод на строку
                // TODO: сделать вставку переменных внутрь текста {a}
                // let value:string = column.replace("\\n", "\n");
                this.currentLocale.set(columns[0], {
                    formatting: formatting,
                    value: column.replace(/\\n+/g, "\n")
                });
            }
        }

        this.emit(LocalizationEvent.CHANGED);
    }

    public init(data:TextAsset, localeCode?:string)
    {
        this.parseLocale(data);
        this.setLocaleByCode(localeCode ? localeCode : this.defaultLocale);
    }

    public getLocaleCodeByName(name:string):string
    {
        for (let i = 0; i < this._languagesNames.length; i++)
        {
            if (this._languagesNames[i] == name)
            {
                return this._languagesCodes[i];
            }
        }

        return "";
    }

    public getLocaleNameByCode(code:string):string
    {
        for (let i = 0; i < this._languagesCodes.length; i++)
        {
            if (this._languagesCodes[i] == code)
            {
                return this._languagesNames[i];
            }
        }

        return "";
    }

    public setLocaleByCode(code:string):void
    {
        let columnIndex:number = this.getColumnByCode(code);

        if (columnIndex == -1)
        {
            console.warn("В системе не обнаружена локаль с кодом '" + code + "'");

            this.setDefaultLocale();
        }

        this.setLocale(columnIndex);
    }

    public setLocaleByName(name:string):void
    {
        let columnIndex:number = this.getColumnByName(name);

        if (columnIndex == -1)
        {
            console.warn("В системе не обнаружена локаль с именем '" + name + "'");

            this.setDefaultLocale();
        }

        this.setLocale(columnIndex);
    }

    public setDefaultLocale():void
    {
        let columnIndex:number = this.getColumnByCode(this._defaultLocale);

        if (columnIndex == -1)
        {
            console.error("В системе не обнаружена локаль по умолчанию с кодом '" + this._defaultLocale + "'");
            return;
        }

        this.setLocale(columnIndex);
    }

    public getCurrentLocaleCode():string
    {
        return this._languagesCodes[this.currentLocaleIndex];
    }

    public getCurrentLocaleName():string
    {
        return this._languagesNames[this.currentLocaleIndex];
    }

    public get(key:string):LocalizationValue
    {
        if (!this.currentLocale)
        {
            return {formatting: null, value: "null"};
        }

        if (this.currentLocale.has(key))
        {
            return this.currentLocale.get(key);
        }
        else
        {
            return {formatting: null, value: "> " + key + " <"};
        }
    }
}