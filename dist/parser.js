'use strict';

Object.defineProperty(exports, "__esModule", {
  value: true
});

var _fs = require('fs');

var _fs2 = _interopRequireDefault(_fs);

var _xml2jsParser = require('xml2js-parser');

var _xml2jsParser2 = _interopRequireDefault(_xml2jsParser);

var _hexConverter = require('./hexConverter');

var _hexConverter2 = _interopRequireDefault(_hexConverter);

var _specials = require('./specials');

var _specials2 = _interopRequireDefault(_specials);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

function parseTextDocument(document) {
  return document;
}

function parseMaskParade(parade) {
  return parade;
}

function parseEffectParade(parade) {
  return parade;
}

function parseProperty(property) {
  var result = {
    tdsb: property.tdsb ? property.tdsb[0].$.bdata : undefined
  };
  if (property.tdsn) {
    result.tdsn = property.tdsn[0].string ? property.tdsn[0].string[0] : _hexConverter2.default.hexToAsciiString(property.tdsn[0].$.bdata);
  }

  if (property.tdmn) {
    var index = {
      OvG2: 0,
      otst: 0,
      tdgp: 0,
      tdbs: 0
    };

    property.tdmn.forEach(function (tdmn) {
      var tdmnString = _hexConverter2.default.hexToAsciiString(tdmn.$.bdata.replace(/00/gi, ''));

      switch (tdmnString) {
        case 'ADBE Text Properties':
          result[tdmnString] = parseTextDocument(property.tdgp[index.tdgp]);
          index.tdgp += 1;
          break;
        case 'ADBE Mask Parade':
          result[tdmnString] = parseMaskParade(property.tdgp[index.tdgp]);
          index.tdgp += 1;
          break;
        case 'ADBE Effect Parade':
          result[tdmnString] = parseEffectParade(property.tdgp[index.tdgp]);
          index.tdgp += 1;
          break;
        case 'ADBE Group End':
          break;
        case _specials2.default.OvG2:
          result[tdmnString] = property.OvG2[index.OvG2];
          index.OvG2 += 1;
          break;
        case _specials2.default.otst:
          result[tdmnString] = property.otst[index.otst];
          index.otst += 1;
          break;
        default:
          if (_specials2.default.tdgp.includes(tdmnString)) {
            result[tdmnString] = parseProperty(property.tdgp[index.tdgp]);
            index.tdgp += 1;
          } else {
            result[tdmnString] = parseProperty(property.tdbs[index.tdbs]);
            index.tdbs += 1;
          }
          break;
      }
    });
  }

  if (property.tdum) {
    result.tdum = _hexConverter2.default.hexToDouble(property.tdum[0].$.bdata);
  }

  if (property.tduM) {
    result.tduM = _hexConverter2.default.hexToDouble(property.tduM[0].$.bdata);
  }

  if (property.cdat) {
    result.cdat = property.cdat[0].$.bdata.match(/.{1,16}/g).map(function (x) {
      return _hexConverter2.default.hexToDouble(x);
    });
  }

  return result;
}

function parseLayer(layer) {
  var result = {
    // parse string
    string: layer.string[0]
  };

  if (layer.ldta) {
    var ldta = layer.ldta[0].$.bdata;

    result.ldta = {
      layer_id: _hexConverter2.default.hexToDecimal(ldta.slice(0, 8)),
      startTimeline: _hexConverter2.default.hexTo32Int(ldta.slice(24, 32)) / _hexConverter2.default.hexTo32Int(ldta.slice(32, 40)),
      startFrame: _hexConverter2.default.hexTo32Int(ldta.slice(40, 48)) / _hexConverter2.default.hexTo32Int(ldta.slice(48, 56)),
      duration: _hexConverter2.default.hexTo32Int(ldta.slice(56, 64)) / _hexConverter2.default.hexTo32Int(ldta.slice(64, 72)),
      reference_id: _hexConverter2.default.hexToDecimal(ldta.slice(80, 88)),
      type: _hexConverter2.default.hexToDecimal(ldta.slice(122, 124)),
      name: _hexConverter2.default.hexToAsciiString(ldta.slice(128, 192).replace(/00/gi, '')),
      asset_type: _hexConverter2.default.hexToDecimal(ldta.slice(262, 264)),
      link_layer_id: _hexConverter2.default.hexToDecimal(ldta.slice(264, 272))
    };
  }

  /*
  if (layer.tdgp) {
    result.tdgp = parseProperty(layer.tdgp[0]);
  }
  */

  return result;
}

function parseItem(item) {
  var result = {
    // parse string
    string: item.string[0]
  };

  // parse idta
  if (item.idta) {
    var idta = item.idta[0].$.bdata;
    result.idta = {
      entry_type: _hexConverter2.default.hexToDecimal(idta.slice(0, 4)),
      id: _hexConverter2.default.hexToDecimal(idta.slice(32, 40)),
      asset_type: _hexConverter2.default.hexToDecimal(idta.slice(116, 118))
    };
  }

  // parse PRin
  if (item.PRin) {
    var prin = item.PRin[0];

    result.prin = {
      prin: [_hexConverter2.default.hexToDecimal(prin.prin[0].$.bdata.slice(0, 8)), _hexConverter2.default.hexToAsciiString(prin.prin[0].$.bdata.slice(8, 104).replace(/00/gi, '')), _hexConverter2.default.hexToAsciiString(prin.prin[0].$.bdata.slice(104, 200).replace(/00/gi, '')), _hexConverter2.default.hexToDecimal(prin.prin[0].$.bdata.slice(200, 208))],
      prda: [_hexConverter2.default.hexToDecimal(prin.prda[0].$.bdata.slice(0, 8)), _hexConverter2.default.hexToDecimal(prin.prda[0].$.bdata.slice(8, 16)), _hexConverter2.default.hexToDecimal(prin.prda[0].$.bdata.slice(16, 24))]
    };
  }

  // parse cdta
  if (item.cdta) {
    var cdta = item.cdta[0].$.bdata;

    var frameRatio = _hexConverter2.default.hexToDecimal(cdta.slice(8, 16));
    result.cdta = {
      frameRatio: frameRatio,
      currentFrame: _hexConverter2.default.hexTo32Int(cdta.slice(40, 48)) / frameRatio,
      duration: _hexConverter2.default.hexToDecimal(cdta.slice(88, 96)) / frameRatio,
      backgroundColor: cdta.slice(104, 110),
      width: _hexConverter2.default.hexToDecimal(cdta.slice(280, 284)),
      height: _hexConverter2.default.hexToDecimal(cdta.slice(284, 288)),
      frameRate: _hexConverter2.default.hexToDecimal(cdta.slice(312, 320)) / Math.pow(2, 16),
      startFrame: _hexConverter2.default.hexTo32Int(cdta.slice(328, 336)) / _hexConverter2.default.hexTo32Int(cdta.slice(336, 344))
    };
  }

  // parse Pin
  if (item.Pin) {
    var pin = item.Pin[0];
    result.pin = {};

    // parse sspc
    if (pin.sspc) {
      var sspc = pin.sspc[0].$.bdata;

      result.pin.sspc = {
        file_type: _hexConverter2.default.hexToAsciiString(sspc.slice(44, 52)),
        width: _hexConverter2.default.hexToDecimal(sspc.slice(60, 68)),
        height: _hexConverter2.default.hexToDecimal(sspc.slice(68, 76)),
        duration: _hexConverter2.default.hexToDecimal(sspc.slice(76, 84)) / _hexConverter2.default.hexToDecimal(sspc.slice(84, 92)),
        frameRate: _hexConverter2.default.hexToDecimal(sspc.slice(116, 124)) / Math.pow(2, 16),
        audioQuality: _hexConverter2.default.hexToDouble(sspc.slice(320, 336))
      };
    }

    // parse fileReference
    if (pin.Als2) {
      var fileReference = pin.Als2[0].fileReference[0].$.fullpath;

      result.filename = fileReference.replace(/^.*[\\/]/, '');
      result.file_reference = fileReference;
    }

    // parse opti
    if (pin.opti) {
      var opti = pin.opti[0].$.bdata;
      var optiType = _hexConverter2.default.hexToDecimal(opti.slice(8, 12));
      if (optiType === 1) {
        result.pin.opti = {
          file_type: _hexConverter2.default.hexToAsciiString(opti.slice(0, 8)),
          type: _hexConverter2.default.hexToDecimal(opti.slice(8, 12)),
          byte_length: _hexConverter2.default.hexToDecimal(opti.slice(12, 20)),
          width: _hexConverter2.default.hexToDecimal(opti.slice(36, 44)),
          height: _hexConverter2.default.hexToDecimal(opti.slice(44, 52)),
          name: _hexConverter2.default.hexToAsciiString(opti.substr(116).replace(/00/gi, ''))
        };
      }
      if (optiType === 5) {
        result.pin.opti = {
          file_type: _hexConverter2.default.hexToAsciiString(opti.slice(0, 8)),
          type: _hexConverter2.default.hexToDecimal(opti.slice(8, 12)),
          byte_length: _hexConverter2.default.hexToDecimal(opti.slice(12, 20)),
          name: _hexConverter2.default.hexToAsciiString(opti.slice(60, 68)),
          codec: _hexConverter2.default.hexToAsciiString(opti.slice(76, 84))
        };
      }
      if (optiType === 9) {
        result.pin.opti = {
          file_type: _hexConverter2.default.hexToAsciiString(opti.slice(0, 8)),
          type: _hexConverter2.default.hexToDecimal(opti.slice(8, 12)),
          byte_length: _hexConverter2.default.hexToDecimal(opti.slice(12, 20)),
          argb: '(' + _hexConverter2.default.hexToFloat(opti.slice(20, 28)) + ', ' + _hexConverter2.default.hexToFloat(opti.slice(28, 36)) + ', ' + _hexConverter2.default.hexToFloat(opti.slice(36, 44)) + ', ' + _hexConverter2.default.hexToFloat(opti.slice(44, 52)) + ')',
          name: _hexConverter2.default.hexToAsciiString(opti.substr(52).replace(/00/gi, ''))
        };
      }
    }
  }

  // parse Sfdr
  if (item.Sfdr) {
    result.sfdr = parseFold(item.Sfdr[0]); // eslint-disable-line no-use-before-define
  }

  // parse layr
  if (item.Layr) {
    result.layr = item.Layr.map(function (layr) {
      return parseLayer(layr);
    });
  }
  // parse SLay
  if (item.SLay) {
    result.slay = item.SLay.map(function (slay) {
      return parseLayer(slay);
    });
  }
  // parse CLay
  if (item.CLay) {
    result.clay = item.CLay.map(function (clay) {
      return parseLayer(clay);
    });
  }
  // parse SecL
  if (item.SecL) {
    result.secl = item.SecL.map(function (secl) {
      return parseLayer(secl);
    });
  }

  return result;
}

function parseFold(fold) {
  return {
    items: fold.Item ? fold.Item.map(function (item) {
      return parseItem(item);
    }) : []
  };
}

function parseProject(project) {
  return {
    // parse folds
    fold: project.Fold ? parseFold(project.Fold[0]) : undefined
  };
}

exports.default = {
  parseFileSync: function parseFileSync(filePath) {
    var data = _fs2.default.readFileSync(filePath);
    var target = _xml2jsParser2.default.parseStringSync(data);
    return parseProject(target.AfterEffectsProject);
  }
};