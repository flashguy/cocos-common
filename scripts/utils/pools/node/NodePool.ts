import { _decorator, instantiate, Node, Prefab } from 'cc';
import { CommonPool } from '../CommonPool';
const { ccclass, property } = _decorator;

/**
 * Пул для Node, где объект один
 */
@ccclass('NodePool')
export class NodePool extends CommonPool<Node>
{
    @property({type:Prefab})
    protected prefab:Prefab = null;

    protected override createInstance():Node
    {
        return this.prefab ? instantiate(this.prefab) : null;
    }

    protected override cleanInstance(instance:Node):void
    {
        if (instance.parent)
            instance.removeFromParent();
    }
}