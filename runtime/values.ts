export type ValueType = "null" | "number" | "boolean" | "object" | "string";

export interface RuntimeVal {
  type: ValueType;
}

export interface NumberVal extends RuntimeVal {
  type: "number";
  value: number;
}

export interface NullVal extends RuntimeVal {
  type: "null";
  value: null;
}

export interface BooleanVal extends RuntimeVal {
  type: "boolean";
  value: boolean;
}

export interface ObjectVal extends RuntimeVal {
  type: "object";
  properties: Map<string, RuntimeVal>;
}

export interface StringVal extends RuntimeVal {
  type: "string";
  value: string;
}

export function MK_NUMBER(n: number = 0): NumberVal {
  return { type: "number", value: n };
}

export function MK_NULL(): NullVal {
  return { type: "null", value: null };
}

export function MK_BOOL(bool: boolean = true): BooleanVal {
  return { type: "boolean", value: bool };
}
