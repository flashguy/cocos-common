import { _decorator, instantiate, Node, Prefab } from 'cc';
import { CommonPool } from '../CommonPool';
import { RandomUtil } from '../../RandomUtil';
const { ccclass, property } = _decorator;

/**
 * Пул для Node, где объектов может быть несколько разных
 */
@ccclass('SeveralNodesPool')
export class SeveralNodesPool extends CommonPool<Node>
{
    @property({type:Prefab})
    protected prefabs:Prefab[] = [];

    protected override createInstance():Node
    {
        return this.prefabs.length > 0 ? instantiate(RandomUtil.randArrayValue(this.prefabs)) : null;
    }

    protected override cleanInstance(instance:Node):void
    {
        if (instance.parent)
            instance.removeFromParent();
    }
}