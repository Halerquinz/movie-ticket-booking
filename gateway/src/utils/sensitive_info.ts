import { recurseExtract, scrub } from "@zapier/secret-scrubber";

const SENSITIVE_FIELDS_SET = new Set<string>(["password"]);

export function maskSensitiveFields(obj: any): any {
    const secretValues = recurseExtract(obj, (key) => SENSITIVE_FIELDS_SET.has(key));
    if (secretValues.length === 0) {
        return obj;
    }
    return scrub(obj, secretValues);
}
