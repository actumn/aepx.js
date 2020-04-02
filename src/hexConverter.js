module.exports = {
  hexToDecimal(hex) {
    return parseInt(hex, 16);
  },
  hexTo32Int(hex) {
    const decimal = parseInt(hex, 16);

    return decimal >>> 31 ? decimal - 0xFFFFFFFF - 1 : decimal; // eslint-disable-line no-bitwise
  },
  hexToFloat(hex) {
    if (hex === '00000000') {
      return 0;
    }

    const decimal = parseInt(hex, 16);
    let float = 0;

    let exp = ((decimal >>> 23) & 0xff) - (0x80 - 1); // eslint-disable-line no-bitwise
    const frac = (0x800000 + (decimal & 0x7fffff)).toString(2); // eslint-disable-line no-bitwise
    for (let i = 0; i < frac.length; i += 1) {
      float += parseInt(frac[i], 10) ? 2 ** exp : 0;
      exp -= 1;
    }
    return float * (decimal >>> 31 ? -1 : 1); // eslint-disable-line no-bitwise
  },
  hexToDouble(hex) {
    if (hex === '0000000000000000') {
      return 0;
    }

    let double = 0;
    const hexHead = parseInt(hex.slice(0, 3), 16);
    const hexTail = parseInt(hex.slice(3, 16), 16);

    let exp = (hexHead & 0x7ff) - (0x400 - 1); // eslint-disable-line no-bitwise
    const frac = (hexTail + 0x10000000000000).toString(2);
    for (let i = 0; i < frac.length; i += 1) {
      double += parseInt(frac[i], 10) ? 2 ** exp : 0;
      exp -= 1;
    }
    return double * ((hexHead >>> 11) ? -1 : 1); // eslint-disable-line no-bitwise
  },
  hexToAsciiString(hex) {
    let asciiString = '';
    for (let i = 0; i < hex.length; i += 2) {
      asciiString += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return asciiString;
  },
};
