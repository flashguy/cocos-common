import { constructorDependencies, constructorParamDependencies, container, propertyDependencies } from './Container';
import { Token } from './Types';

export function Injectable(token?:Token):ClassDecorator
{
    return function (target:any)
    {
        const actualToken = token || target;
        container.register(actualToken, { useClass:target });
    };
}

export function Inject(token:Token):ParameterDecorator & PropertyDecorator
{
    return function (target:any, propertyKey:string | symbol | undefined, parameterIndex?:number)
    {
        if (parameterIndex !== undefined && propertyKey === undefined)
        {
            if (!constructorParamDependencies.has(target))
                constructorParamDependencies.set(target, new Map());
            
            const paramDeps = constructorParamDependencies.get(target)!;
            paramDeps.set(parameterIndex, token);
        }
        else if (propertyKey !== undefined && parameterIndex === undefined)
        {
            if (!propertyDependencies.has(target.constructor))
                propertyDependencies.set(target.constructor, new Map());
            
            const propDeps = propertyDependencies.get(target.constructor)!;
            propDeps.set(propertyKey, token);
        }
    };
}

export function Dependencies(...tokens:Token[]):ClassDecorator
{
    return function (target:any)
    {
        constructorDependencies.set(target, tokens);
    };
}