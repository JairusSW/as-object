import {
    ClassDeclaration,
    FieldDeclaration,
    Source,
    Parser
} from "assemblyscript/dist/assemblyscript.js";
import { toString, isStdlib } from "visitor-as/dist/utils.js";
import { BaseVisitor, SimpleParser } from "visitor-as/dist/index.js";
import { Transform } from "assemblyscript/dist/transform.js";

class ClassData {
    public keys: string[] = [];
    public values: string[] = [];
    public types: string[] = [];
    public name: string = "";
}

class ObjectTransform extends BaseVisitor {
    public currentClass!: ClassData;
    visitClassDeclaration(node: ClassDeclaration): void {
        const className = node.name.text;
        if (!node.decorators?.length) return;
        let foundDecorator = false;
        for (const decorator of node.decorators!) {
            // @ts-ignore
            if (decorator.name.text.toLowerCase() == "object") foundDecorator = true;
        }
        if (!foundDecorator) return;

        this.currentClass = {
            name: className,
            keys: [],
            values: [],
            types: []
        }

        for (const mem of node.members) {
            if (mem instanceof FieldDeclaration) {
                const member = <FieldDeclaration>mem;
                if (toString(member).startsWith("static ")) return;
                const lineText = toString(member);
                if (lineText.startsWith("private ")) return;

                this.currentClass.keys.push(member.name.text);
                // @ts-ignore
                this.currentClass.types.push(member.type.name.identifier.text);
            }
        }

        //console.log(`public __OBJECT_KEYS: string[] = [${this.currentClass.keys.map(v => `"${v}"`).join(",")}];`)
        const keysProp = SimpleParser.parseClassMember(
            `public __OBJECT_KEYS: string[] = [${this.currentClass.keys.map(v => `"${v}"`).join(",")}];`,
            node
        );
        node.members.push(keysProp);

        //console.log(`public __OBJECT_TYPES: string[] = [${this.currentClass.types.map(v => `"${v}"`).join(",")}];`)
        const typesProp = SimpleParser.parseClassMember(
            `public __OBJECT_TYPES: string[] = [${this.currentClass.types.map(v => `"${v}"`).join(",")}];`,
            node
        );
        node.members.push(typesProp);

        //console.log(`@inline __OBJECT_VALUES(): Variant[] { return [${this.currentClass.keys.map(v => `Variant.from(this.${v})`).join(",")}]; }`)
        const valuesMethod = SimpleParser.parseClassMember(
            `@inline __OBJECT_VALUES(): Variant[] { return [${this.currentClass.keys.map(v => `Variant.from(this.${v})`).join(",")}]; }`,
            node
        );
        node.members.push(valuesMethod);
    }
    visitSource(node: Source): void {
        super.visitSource(node);
    }
}

export default class Transformer extends Transform {
    // Trigger the transform after parse.
    afterParse(parser: Parser): void {
        // Create new transform
        const transformer = new ObjectTransform();

        // Sort the sources so that user scripts are visited last
        const sources = parser.sources.filter(source => !isStdlib(source)).sort((_a, _b) => {
            const a = _a.internalPath
            const b = _b.internalPath
            if (a[0] === "~" && b[0] !== "~") {
                return -1;
            } else if (a[0] !== "~" && b[0] === "~") {
                return 1;
            } else {
                return 0;
            }
        });

        // Loop over every source
        for (const source of sources) {
            // Ignore all lib and std. Visit everything else.
            if (!isStdlib(source)) {
                transformer.visit(source);
            }
        }
    }
};
