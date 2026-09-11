/* A deliberately small JSON Schema (2020-12 subset) validator.
   Zero dependencies, because the repo has none and the build must run anywhere
   node runs. Supports exactly the keywords our schemas use:
   type, const, enum, pattern, minLength, maxLength, minimum, maximum, required,
   properties, additionalProperties (boolean), items, minItems, uniqueItems,
   oneOf, allOf, not, if/then/else, $ref (local "#/$defs/x" and cross-file "other.schema.json#/$defs/x").
   Anything else is ignored — so if a schema starts using a new keyword, add it
   here or the build will silently accept what the schema meant to reject. */

export function createValidator(schemasById) {
  // schemasById: { "common.schema.json": {...}, "claim.schema.json": {...} }
  const resolveRef = (ref, currentFile) => {
    const [file, frag] = ref.split("#");
    const doc = schemasById[file || currentFile];
    if (!doc) throw new Error(`unknown schema file in $ref: ${ref}`);
    let node = doc;
    for (const part of (frag || "").split("/").filter(Boolean)) {
      node = node[part.replace(/~1/g, "/").replace(/~0/g, "~")];
      if (node === undefined) throw new Error(`bad $ref path: ${ref}`);
    }
    return { schema: node, file: file || currentFile };
  };

  const typeOf = (v) =>
    v === null ? "null" : Array.isArray(v) ? "array" : Number.isInteger(v) ? "integer" : typeof v;

  function check(schema, value, file, path, errors) {
    if (schema === true) return;
    if (schema === false) { errors.push(`${path}: not allowed`); return; }
    if (schema.$ref) {
      const r = resolveRef(schema.$ref, file);
      check(r.schema, value, r.file, path, errors);
      // siblings of $ref still apply in 2020-12
      const { $ref, ...rest } = schema;
      if (Object.keys(rest).length) check(rest, value, file, path, errors);
      return;
    }
    if (schema.type) {
      const types = Array.isArray(schema.type) ? schema.type : [schema.type];
      const t = typeOf(value);
      const ok = types.some((x) => x === t || (x === "number" && (t === "integer")) || (x === "integer" && t === "integer"));
      if (!ok) { errors.push(`${path}: expected ${types.join("|")}, got ${t}`); return; }
    }
    if (schema.const !== undefined && JSON.stringify(value) !== JSON.stringify(schema.const)) errors.push(`${path}: must equal ${JSON.stringify(schema.const)}`);
    if (schema.enum && !schema.enum.some((e) => JSON.stringify(e) === JSON.stringify(value))) errors.push(`${path}: "${value}" is not one of ${schema.enum.join(", ")}`);
    if (typeof value === "string") {
      if (schema.pattern && !new RegExp(schema.pattern).test(value)) errors.push(`${path}: "${value}" does not match ${schema.pattern}`);
      if (schema.minLength !== undefined && value.length < schema.minLength) errors.push(`${path}: shorter than ${schema.minLength} characters`);
      if (schema.maxLength !== undefined && value.length > schema.maxLength) errors.push(`${path}: longer than ${schema.maxLength} characters`);
    }
    if (typeof value === "number") {
      if (schema.minimum !== undefined && value < schema.minimum) errors.push(`${path}: ${value} < ${schema.minimum}`);
      if (schema.maximum !== undefined && value > schema.maximum) errors.push(`${path}: ${value} > ${schema.maximum}`);
    }
    if (Array.isArray(value)) {
      if (schema.minItems !== undefined && value.length < schema.minItems) errors.push(`${path}: needs at least ${schema.minItems} item(s)`);
      if (schema.uniqueItems && new Set(value.map((v) => JSON.stringify(v))).size !== value.length) errors.push(`${path}: contains duplicates`);
      if (schema.items) value.forEach((v, i) => check(schema.items, v, file, `${path}[${i}]`, errors));
    }
    if (value && typeof value === "object" && !Array.isArray(value)) {
      (schema.required || []).forEach((k) => { if (value[k] === undefined) errors.push(`${path}: missing required "${k}"`); });
      if (schema.properties) {
        for (const [k, sub] of Object.entries(schema.properties)) if (value[k] !== undefined) check(sub, value[k], file, `${path}.${k}`, errors);
      }
      if (schema.additionalProperties === false) {
        for (const k of Object.keys(value)) if (!schema.properties || !(k in schema.properties)) errors.push(`${path}: unexpected property "${k}"`);
      }
    }
    if (schema.allOf) schema.allOf.forEach((sub) => check(sub, value, file, path, errors));
    if (schema.not) { const e = []; check(schema.not, value, file, path, e); if (e.length === 0) errors.push(`${path}: must NOT match the excluded form`); }
    if (schema.oneOf) {
      const passes = schema.oneOf.filter((sub) => { const e = []; check(sub, value, file, path, e); return e.length === 0; }).length;
      if (passes !== 1) errors.push(`${path}: must match exactly one alternative (matched ${passes})`);
    }
    if (schema.if) {
      const e = []; check(schema.if, value, file, path, e);
      if (e.length === 0 && schema.then) check(schema.then, value, file, path, errors);
      if (e.length > 0 && schema.else) check(schema.else, value, file, path, errors);
    }
  }

  return function validate(schemaFile, value) {
    const errors = [];
    check(schemasById[schemaFile], value, schemaFile, "$", errors);
    return errors;
  };
}
