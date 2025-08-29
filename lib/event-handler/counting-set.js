module.exports = countingSet;

function countingSet() {
  const set = Object.create(null);

  function inc(item) {
    if (!set[item]) {
      set[item] = 1;
      return true;
    }
    set[item] += 1;
  }

  function dec(item) {
    if (0 === --set[item]) {
      delete set[item];
      return true;
    }
  }

  return {
    inc,
    dec
  };
}
