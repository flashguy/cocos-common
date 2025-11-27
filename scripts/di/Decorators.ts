import { _decorator } from 'cc';
import { Token } from './Types';
import { container } from './Container';

const propertyDependencies = new Map<Function, Map<string | symbol, Token>>();
const constructorParamDependencies = new Map<Function, Map<number, Token>>();
const constructorDependencies = new Map<Function, Token[]>();

export function Injectable(token?:Token):ClassDecorator
{
    return function (target:any)
    {
        const actualToken = token || target;
        
        container.register(actualToken, () =>
        {
            let dependencies:any[] = [];
            
            const explicitDeps = constructorDependencies.get(target);
            const paramDeps = constructorParamDependencies.get(target);
            
            if (explicitDeps)
            {
                dependencies = explicitDeps.map(dep => container.resolve(dep));
            }
            else if (paramDeps && paramDeps.size > 0)
            {
                for (let i = 0; i < paramDeps.size; i++)
                {
                    const depToken = paramDeps.get(i);

                    if (depToken)
                    {
                        dependencies.push(container.resolve(depToken));
                    }
                    else
                    {
                        throw new Error(`No dependency provided for parameter ${i} of ${target.name}`);
                    }
                }
            }
            
            const instance = dependencies.length > 0 ? new target(...dependencies) :new target();
            const propDeps = propertyDependencies.get(target);

            if (propDeps)
            {
                for (const [propName, depToken] of propDeps)
                {
                    instance[propName] = container.resolve(depToken);
                }
            }
            
            return instance;
        });
    };
}

export function Inject(token:Token):ParameterDecorator & PropertyDecorator
{
    return function (target:any, propertyKey:string | symbol | undefined, parameterIndex?:number)
    {
        if (parameterIndex !== undefined && propertyKey === undefined)
        {
            if (!constructorParamDependencies.has(target))
            {
                constructorParamDependencies.set(target, new Map());
            }
            
            const paramDeps = constructorParamDependencies.get(target)!;
            paramDeps.set(parameterIndex, token);
        }
        else if (propertyKey !== undefined && parameterIndex === undefined)
        {
            if (!propertyDependencies.has(target.constructor))
            {
                propertyDependencies.set(target.constructor, new Map());
            }
            
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