import { _decorator, Component, Label } from 'cc';
import { Globals } from '../../singletons/Globals';
import { Localization } from '../Localization';
import { LocalizationEvent } from '../LocalizationEvent';
import { LocalizationValue } from '../LocalizationValue';
const { ccclass, property, executeInEditMode, requireComponent } = _decorator;

// NOTE: Все настройки Label которые можно менять указаны ниже
// Правильный формат json в локали {"size":10}
// TODO: прописать и проверить все параметры label которые можно менять за основу можно брать их родные названия из компонента

@ccclass('LocalizedLabel')
@requireComponent(Label)
export class LocalizedLabel extends Component
{
    @property
    private localizationKey:string = "";

    private localization:Localization;

    private label:Label;

    onLoad()
    {
        this.label = this.node.getComponent(Label);
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
        if (this.label != null && this.label != undefined)
        {
            let localizationValue:LocalizationValue = this.localization.get(this.localizationKey);
            this.label.string = localizationValue.value;

            if (localizationValue.formatting)
            {
                if (localizationValue.formatting.size)
                    this.label.fontSize = localizationValue.formatting.size;
            }
        }
        else
        {
            console.error("В текущем Node необнаружен компонент Label");
        }
    }
}