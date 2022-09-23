export const serialize = <T>(value: T) => {
  const stringified = JSON.stringify(value);
  const parsed = JSON.parse(stringified);
  return parsed;
};
