import { _decorator, Constructor } from 'cc';
import { Provider, Token } from './Types';
const { ccclass } = _decorator;

// Хранилища для декораторов (должны быть доступны в container.ts)
export const propertyDependencies = new Map<Function, Map<string | symbol, Token>>();
export const constructorParamDependencies = new Map<Function, Map<number, Token>>();
export const constructorDependencies = new Map<Function, Token[]>();

@ccclass('Container')
export class Container
{
    private providers = new Map<Token, Provider>();
    private instances = new Map<Token, any>();

    register<T>(token:Token<T>, provider:Provider<T>):void
    {
        this.providers.set(token, provider);
    }

    resolve<T>(token:Token<T>):T
    {
        if (this.instances.has(token))
            return this.instances.get(token);

        const provider = this.providers.get(token);
        
        if (!provider)
            throw new Error(`No provider found for ${token.toString()}`);

        let instance:T;

        if ('useClass' in provider)
            instance = this.instantiateClass(provider.useClass);
        else if ('useValue' in provider)
            instance = provider.useValue;
        else if ('useFactory' in provider)
            instance = provider.useFactory(this);
        else
            throw new Error('Invalid provider');

        this.instances.set(token, instance);

        return instance;
    }

    private instantiateClass<T>(ctor:Constructor<T>):T
    {
        const explicitDeps = constructorDependencies.get(ctor);
        const paramDeps = constructorParamDependencies.get(ctor);
        
        let dependencies:any[] = [];
        
        if (explicitDeps)
        {
            dependencies = explicitDeps.map(dep => this.resolve(dep));
        }
        else if (paramDeps && paramDeps.size > 0)
        {
            for (let i = 0; i < paramDeps.size; i++)
            {
                const depToken = paramDeps.get(i);

                if (depToken)
                    dependencies.push(this.resolve(depToken));
                else
                    throw new Error(`No dependency provided for parameter ${i} of ${ctor.name}`);
            }
        }
        
        const instance = dependencies.length > 0 ? new ctor(...dependencies) : new ctor();
        const propDeps = propertyDependencies.get(ctor);
        
        if (propDeps)
        {
            for (const [propName, depToken] of propDeps)
            {
                instance[propName] = this.resolve(depToken);
            }
        }
        
        return instance;
    }
}

export const container = new Container();