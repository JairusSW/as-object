import { Object } from ".";
// Must import Variant or it will not work
import { Variant } from "as-variant/assembly";
@object
class Vec3 {
    x!: f32;
    y!: f32;
    z!: f32;
}

const vec: Vec3 = {
    x: 3.4,
    y: 1.2,
    z: 8.3
}

console.log("[" + Object.keys(vec).map<string>(v => `"${v}"`).join(", ") + "]");
console.log(Object.types(vec).join(", "));
console.log(Object.name(vec));
console.log("[" + Object.values(vec).map<f32>(v => v.get<f32>()).join(",") + "]");