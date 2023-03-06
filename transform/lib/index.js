import { toString, isStdlib } from "visitor-as/dist/utils.js";
import { BaseVisitor, SimpleParser } from "visitor-as/dist/index.js";
import { Transform } from "assemblyscript/dist/transform.js";
class ClassData {
    constructor() {
        this.keys = [];
        this.values = [];
        this.types = [];
        this.name = "";
    }
}
class ObjectTransform extends BaseVisitor {
    visitClassDeclaration(node) {
        var _c;
        const className = node.name.text;
        if (!((_c = node.decorators) === null || _c === void 0 ? void 0 : _c.length))
            return;
        let foundDecorator = false;
        for (const decorator of node.decorators) {
            // @ts-ignore
            if (decorator.name.text.toLowerCase() == "object")
                foundDecorator = true;
        }
        if (!foundDecorator)
            return;
        this.currentClass = {
            name: className,
            keys: [],
            values: [],
            types: []
        };
        for (const mem of node.members) {
            const member = mem;
            if (toString(member).startsWith("static"))
                return;
            const lineText = toString(member);
            if (lineText.startsWith("private"))
                return;
            this.currentClass.keys.push(member.name.text);
            // @ts-ignore
            this.currentClass.types.push(member.type.name.identifier.text);
        }
        //console.log(`public __Object_Keys: string[] = [${this.currentClass.keys.map(v => `"${v}"`).join(",")}];`)
        const keysProp = SimpleParser.parseClassMember(`public __Object_Keys: string[] = [${this.currentClass.keys.map(v => `"${v}"`).join(",")}];`, node);
        node.members.push(keysProp);
        //console.log(`public __Object_Types: string[] = [${this.currentClass.types.map(v => `"${v}"`).join(",")}];`)
        const typesProp = SimpleParser.parseClassMember(`public __Object_Types: string[] = [${this.currentClass.types.map(v => `"${v}"`).join(",")}];`, node);
        node.members.push(typesProp);
        //console.log(`@inline __Object_Values(): Variant[] { return [${this.currentClass.keys.map(v => `Variant.from(this.${v})`).join(",")}]; }`)
        const valuesMethod = SimpleParser.parseClassMember(`@inline __Object_Values(): Variant[] { return [${this.currentClass.keys.map(v => `Variant.from(this.${v})`).join(",")}]; }`, node);
        node.members.push(valuesMethod);
    }
    visitSource(node) {
        super.visitSource(node);
    }
}
export default class Transformer extends Transform {
    // Trigger the transform after parse.
    afterParse(parser) {
        // Create new transform
        const transformer = new ObjectTransform();
        // Sort the sources so that user scripts are visited last
        const sources = parser.sources.filter(source => !isStdlib(source)).sort((_a, _b) => {
            const a = _a.internalPath;
            const b = _b.internalPath;
            if (a[0] === "~" && b[0] !== "~") {
                return -1;
            }
            else if (a[0] !== "~" && b[0] === "~") {
                return 1;
            }
            else {
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
}
;
