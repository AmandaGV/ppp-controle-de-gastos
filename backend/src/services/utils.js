function parseValue(value) {
  if (value === null || value === undefined || value === '') {
    return 0;
  }
  if (typeof value === 'number') {
    return value;
  }
  const parsed = Number(String(value).replace(/[^0-9,-]/g, '').replace(',', '.'));
  return Number.isNaN(parsed) ? 0 : parsed;
}

module.exports = {
  parseValue,
};
