import {
  MK_NATIVE_FN,
  MK_NULL,
  MK_NUMBER,
  type BooleanVal,
  type NullVal,
  type NumberVal,
  type StringVal,
  type ObjectVal,
} from "./values";

export const print = MK_NATIVE_FN((args, scope) => {
  console.log(
    ...args.map((arg) => {
      switch (arg.type) {
        case "boolean":
        case "null":
        case "number":
        case "string": {
          return (arg as NumberVal | NullVal | BooleanVal | StringVal).value;
        }

        case "object": {
          return Object.fromEntries((arg as ObjectVal).properties);
        }
      }
    })
  );
  return MK_NULL();
});

export const time = MK_NATIVE_FN((args, scope) => {
  return MK_NUMBER(Date.now());
});
