import { _decorator, Asset, assetManager, AssetManager, JsonAsset, Prefab, TextAsset } from 'cc';
const { ccclass } = _decorator;

@ccclass('AssetProvider')
export abstract class AssetProvider
{
    protected bundleCache:Map<string, AssetManager.Bundle> = new Map<string, AssetManager.Bundle>();
    protected prefabCache:Map<string, Prefab> = new Map<string, Prefab>();
    protected tableCache:Map<string, TextAsset> = new Map<string, TextAsset>();
    protected jsonCache:Map<string, JsonAsset> = new Map<string, JsonAsset>();

    // bundle
    public async getOrLoadBundle(bundleID:string):Promise<AssetManager.Bundle>
    {
        if (this.bundleCache.has(bundleID))
        {
            return Promise.resolve(this.bundleCache.get(bundleID));
        }
        else
        {
            return new Promise((resolve, reject) => {
                assetManager.loadBundle(bundleID, (err:Error | null, bundle:AssetManager.Bundle) => {
                    if (err)
                    {
                        console.log(`rejected getOrLoadBundle(${bundleID})`);
                        reject(err);
                        return;
                    }
                    
                    this.bundleCache.set(bundleID, bundle);
                    resolve(bundle);
                });
            });
        }
    }

    // *.prefab
    public async getOrLoadPrefab(bundleID:string, prefabID:string):Promise<Prefab>
    {
        if (this.prefabCache.has(prefabID))
        {
            return Promise.resolve(this.prefabCache.get(prefabID));
        }
        else
        {
            const bundle:AssetManager.Bundle = await this.getOrLoadBundle(bundleID);

            return new Promise((resolve, reject) => {
                bundle.load(prefabID, (err:Error | null, prefab:Prefab) => {
                    if (err)
                    {
                        console.log(`rejected getOrLoadPrefab(${bundleID}, ${prefabID})`);
                        reject(err);
                        return;
                    }
    
                    this.prefabCache.set(prefabID, prefab);
                    resolve(prefab);
                });
            });
        }
    }

    // *.tsv
    public async getOrLoadTable(bundleID:string, tableID:string):Promise<TextAsset>
    {
        if (this.tableCache.has(tableID))
        {
            return Promise.resolve(this.tableCache.get(tableID));
        }
        else
        {
            const bundle:AssetManager.Bundle = await this.getOrLoadBundle(bundleID);
            
            return new Promise((resolve, reject) => {
                bundle.load(tableID, (err:Error | null, data:Asset) => {
                    if (err)
                    {
                        console.log(`rejected getOrLoadTable(${bundleID}, ${tableID})`);
                        reject(err);
                        return;
                    }
                    
                    const textAsset:TextAsset = new TextAsset(tableID);
                    textAsset.text = data.nativeAsset;
                    
                    this.tableCache.set(tableID, textAsset);
                    resolve(textAsset);
                });
            });
        }
    }

    // *.json
    public async getOrLoadJson(bundleID:string, jsonID:string):Promise<JsonAsset>
    {
        if (this.jsonCache.has(jsonID))
        {
            return Promise.resolve(this.jsonCache.get(jsonID));
        }
        else
        {
            const bundle:AssetManager.Bundle = await this.getOrLoadBundle(bundleID);

            return new Promise((resolve, reject) => {
                bundle.load(jsonID, (err:Error | null, data:JsonAsset) => {
                    if (err)
                    {
                        console.log(`rejected getOrLoadJson(${bundleID}, ${jsonID})`);
                        reject(err);
                        return;
                    }
    
                    this.jsonCache.set(jsonID, data);
                    resolve(data);
                });
            });
        }
    }
}