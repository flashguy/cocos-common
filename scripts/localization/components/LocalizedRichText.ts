import { _decorator, Component, RichText } from 'cc';
import { Globals } from '../../singletons/Globals';
import { Localization } from '../Localization';
import { LocalizationEvent } from '../LocalizationEvent';
import { LocalizationValue } from '../LocalizationValue';
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

// NOTE: Все настройки RichText можно найти на странице
// https://docs.cocos.com/creator/3.8/manual/en/ui-system/components/editor/richtext.html

@ccclass('LocalizedRichText')
@requireComponent(RichText)
export class LocalizedRichText extends Component
{
    @property
    private localizationKey:string = "";

    private localization:Localization;

    private _richText:RichText;

    onLoad()
    {
        this._richText = this.node.getComponent(RichText);

        this.localization = Globals.get(Localization);

        if (this.localization.isReady)
        {
            this.onLocalizationChanged();
        }

        this.localization.on(LocalizationEvent.CHANGED, this.onLocalizationChanged);
    }

    onDestroy()
    {
        this.localization.off(LocalizationEvent.CHANGED, this.onLocalizationChanged);
    }

    public setNewLocalizationKey(key:string):void
    {
        this.localizationKey = key;
        this.onLocalizationChanged();
    }

    private onLocalizationChanged = () =>
    {
        if (this._richText != null && this._richText != undefined)
        {
            let localizationValue:LocalizationValue = this.localization.get(this.localizationKey);
            this._richText.string = localizationValue.value;
        }
        else
        {
            console.error("В текущем Node необнаружен компонент RichText");
        }
    }
}