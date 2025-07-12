import { StringBuilder } from './string-builder';
import { NumberBuilder } from './number-builder';
import { BooleanBuilder } from './boolean-builder';
import { DateBuilder } from './date-builder';
import { FileBuilder } from './file-builder';
import { ArrayBuilder } from './array-builder';
import { ObjectBuilder } from './object-builder';
import { UnionBuilder } from './union-builder';
import { NetworkBuilder } from './network-builder';

export class CoreBuilder {
    static string(): StringBuilder {
        return new StringBuilder();
    }

    static number(): NumberBuilder {
        return new NumberBuilder();
    }

    static boolean(): BooleanBuilder {
        return new BooleanBuilder();
    }

    static date(): DateBuilder {
        return new DateBuilder();
    }

    static file(): FileBuilder {
        return new FileBuilder();
    }

    static array(): ArrayBuilder {
        return new ArrayBuilder();
    }

    static object(): ObjectBuilder {
        return new ObjectBuilder();
    }

    static union(): UnionBuilder {
        return new UnionBuilder();
    }

    static network(): NetworkBuilder {
        return new NetworkBuilder();
    }
}