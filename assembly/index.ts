import { Variant } from "as-variant/assembly";

export namespace Object {
    @inline export function name<T>(o: T | null = null): string {
        return nameof<nonnull<T>>();
    }
    @inline export function keys<T>(o: T | null = null): string[] {
        // @ts-ignore
        if (!isDefined(o.__Object_Keys)) ERROR("Cannot retrieve keys of supplied input. Make sure to add the @object decorator above the class definition.");
        if (!o) {
            // @ts-ignore
            return changetype<T>(0).__Object_Keys;
        } else {
            // @ts-ignore
            return o.__Object_Keys;
        }
    }
    @inline export function types<T>(o: T | null = null): string[] {
        // @ts-ignore
        if (!isDefined(o.__Object_Types)) ERROR("Cannot retrieve types of supplied input. Make sure to add the @object decorator above the class definition.");
        if (!o) {
            // @ts-ignore
            return changetype<T>(0).__Object_Types;
        } else {
            // @ts-ignore
            return o.__Object_Types;
        }
    }
    @inline export function values<T>(o: T): Variant[] {
        // @ts-ignore
        if (!isDefined(o.__Object_Values)) ERROR("Cannot retrieve values of supplied input. Make sure to add the @object decorator above the class definition.");
        // @ts-ignore
        return o.__Object_Values();
    }/*
    @inline export function get<T>(key: string, o: T | null = null): Variant {
        // @ts-ignore
        if (!isDefined(o.__Object_Get_Key)) ERROR("Cannot retrieve value of supplied key. Make sure to add the @object decorator above the class definition.");
        // @ts-ignore
        return o.__Object_Get_Key(key);
    }*/
}