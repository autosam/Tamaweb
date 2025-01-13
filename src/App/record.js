export function addRecord(name, newValue, shouldReplaceValue) {
  if (newValue === undefined) newValue = 1;
  const currentValue = this.getRecord(name) || 0;
  this.records[name] = shouldReplaceValue ? newValue : currentValue + newValue;
  return this.records[name];
}
export function getRecord(name) {
  return this.records[name];
}
