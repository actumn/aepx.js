'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.default = {
  hexToDecimal: function hexToDecimal(hex) {
    return parseInt(hex, 16);
  },
  hexTo32Int: function hexTo32Int(hex) {
    var decimal = parseInt(hex, 16);

    return decimal >>> 31 ? decimal - 0xFFFFFFFF - 1 : decimal; // eslint-disable-line no-bitwise
  },
  hexToFloat: function hexToFloat(hex) {
    if (hex === '00000000') {
      return 0;
    }

    var decimal = parseInt(hex, 16);
    var float = 0;

    var exp = (decimal >>> 23 & 0xff) - (0x80 - 1); // eslint-disable-line no-bitwise
    var frac = (0x800000 + (decimal & 0x7fffff)).toString(2); // eslint-disable-line no-bitwise
    for (var i = 0; i < frac.length; i += 1) {
      float += parseInt(frac[i], 10) ? Math.pow(2, exp) : 0;
      exp -= 1;
    }
    return float * (decimal >>> 31 ? -1 : 1); // eslint-disable-line no-bitwise
  },
  hexToDouble: function hexToDouble(hex) {
    if (hex === '0000000000000000') {
      return 0;
    }

    var double = 0;
    var hexHead = parseInt(hex.slice(0, 3), 16);
    var hexTail = parseInt(hex.slice(3, 16), 16);

    var exp = (hexHead & 0x7ff) - (0x400 - 1); // eslint-disable-line no-bitwise
    var frac = (hexTail + 0x10000000000000).toString(2);
    for (var i = 0; i < frac.length; i += 1) {
      double += parseInt(frac[i], 10) ? Math.pow(2, exp) : 0;
      exp -= 1;
    }
    return double * (hexHead >>> 11 ? -1 : 1); // eslint-disable-line no-bitwise
  },
  hexToAsciiString: function hexToAsciiString(hex) {
    var asciiString = '';
    for (var i = 0; i < hex.length; i += 2) {
      asciiString += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    }
    return asciiString;
  }
};