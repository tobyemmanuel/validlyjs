import { FileFluentRule, FileSizeFluentRule, FileDimensionsFluentRule } from '../types';
import { BaseFluentBuilder } from './base-builder';

export class FileBuilder extends BaseFluentBuilder implements FileFluentRule {
    constructor() {
        super('file');
    }

    mimeTypes(types: string[]): this {
        this.addRegistryRule('file.mimes', types);
        return this;
    }

    extensions(extensions: string[]): this {
        this.addRegistryRule('file.extensions', extensions);
        return this;
    }

    size(): FileSizeBuilder {
        return new FileSizeBuilder(this);
    }

    image(): this {
        this.addRegistryRule('file.image');
        return this;
    }

    dimensions(): FileDimensionsBuilder {
        return new FileDimensionsBuilder(this);
    }

    min(size: string | number): this {
        this.addRegistryRule('file.min', [size]);
        return this;
    }

    max(size: string | number): this {
        this.addRegistryRule('file.max', [size]);
        return this;
    }

    between(min: string | number, max: string | number): this {
        this.addRegistryRule('file.between', [min, max]);
        return this;
    }
}

class FileSizeBuilder extends FileBuilder implements FileSizeFluentRule {
    // private parentBuilder: FileBuilder;

    constructor(parentBuilder: FileBuilder) {
        super();
        // this.parentBuilder = parentBuilder;
        this._rules = parentBuilder._rules;
        this._modifiers = parentBuilder._modifiers;
    }

    override min(size: string | number): this {
        this.addRegistryRule('file.min', [size]);
        return this;
    }

    override max(size: string | number): this {
        this.addRegistryRule('file.max', [size]);
        return this;
    }
}

class FileDimensionsBuilder extends FileBuilder implements FileDimensionsFluentRule {
    // private parentBuilder: FileBuilder;

    constructor(parentBuilder: FileBuilder) {
        super();
        // this.parentBuilder = parentBuilder;
        this._rules = parentBuilder._rules;
        this._modifiers = parentBuilder._modifiers;
    }

    width(width: number): this {
        this.addRegistryRule('file.dimensions.width', [width]);
        return this;
    }

    height(height: number): this {
        this.addRegistryRule('file.dimensions.height', [height]);
        return this;
    }

    minWidth(width: number): this {
        this.addRegistryRule('file.dimensions.min_width', [width]);
        return this;
    }

    maxWidth(width: number): this {
        this.addRegistryRule('file.dimensions.max_width', [width]);
        return this;
    }

    minHeight(height: number): this {
        this.addRegistryRule('file.dimensions.min_height', [height]);
        return this;
    }

    maxHeight(height: number): this {
        this.addRegistryRule('file.dimensions.max_height', [height]);
        return this;
    }
}