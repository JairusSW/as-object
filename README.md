# AS-OBJECT
![AssemblyScript](https://img.shields.io/badge/AssemblyScript-blue)
![WebAssembly](https://img.shields.io/badge/WebAssemby-purple)

Object API implementation for AssemblyScript with additional features.

## Setup

```
npm install as-object
npm install visitor-as
```

Add the transform to your `asc` command

```bash
--transform json-as/transform
```

Alternatively, add it to your `asconfig.json` (e.g. in package.json)

```
{
  "options": {
    "transform": ["json-as/transform"]
  }
}
```

## Usage

```js
import { Object } from "as-object/assembly";
// Must import as-variant or it will not work
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
// ["x", "y", "z"]
console.log(Object.types(vec).join(", "));
// f32, f32, f32
console.log(Object.name(vec));
// Vec3
console.log("[" + Object.values(vec).map<f32>(v => v.get<f32>()).join(",") + "]");
// [3.4000000953674318,1.2000000476837159,8.300000190734864]
```