const fs = require('fs');
const xml2jsparser = require('xml2js-parser');
const hexConverter = require('./hexConverter');
const specials = require('./specials');

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
  const result = {
    tdsb: property.tdsb ? property.tdsb[0].$.bdata : undefined,
  };
  if (property.tdsn) {
    result.tdsn = property.tdsn[0].string
      ? property.tdsn[0].string[0] : hexConverter.hexToAsciiString(property.tdsn[0].$.bdata);
  }

  if (property.tdmn) {
    const index = {
      OvG2: 0,
      otst: 0,
      tdgp: 0,
      tdbs: 0,
    };

    property.tdmn.forEach((tdmn) => {
      const tdmnString = hexConverter.hexToAsciiString(tdmn.$.bdata.replace(/00/gi, ''));

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
        case specials.OvG2:
          result[tdmnString] = property.OvG2[index.OvG2];
          index.OvG2 += 1;
          break;
        case specials.otst:
          result[tdmnString] = property.otst[index.otst];
          index.otst += 1;
          break;
        default:
          if (specials.tdgp.includes(tdmnString)) {
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
    result.tdum = hexConverter.hexToDouble(property.tdum[0].$.bdata);
  }

  if (property.tduM) {
    result.tduM = hexConverter.hexToDouble(property.tduM[0].$.bdata);
  }

  if (property.cdat) {
    result.cdat = property.cdat[0].$.bdata
      .match(/.{1,16}/g)
      .map(x => hexConverter.hexToDouble(x));
  }

  return result;
}

function parseLayer(layer) {
  const result = {
    // parse string
    string: layer.string[0],
  };

  if (layer.ldta) {
    const ldta = layer.ldta[0].$.bdata;

    result.ldta = {
      layer_id: hexConverter.hexToDecimal(ldta.slice(0, 8)),
      startTimeline: hexConverter.hexTo32Int(ldta.slice(24, 32))
        / hexConverter.hexTo32Int(ldta.slice(32, 40)),
      startFrame: hexConverter.hexTo32Int(ldta.slice(40, 48))
        / hexConverter.hexTo32Int(ldta.slice(48, 56)),
      duration: hexConverter.hexTo32Int(ldta.slice(56, 64))
        / hexConverter.hexTo32Int(ldta.slice(64, 72)),
      reference_id: hexConverter.hexToDecimal(ldta.slice(80, 88)),
      type: hexConverter.hexToDecimal(ldta.slice(122, 124)),
      name: hexConverter.hexToAsciiString(ldta.slice(128, 192).replace(/00/gi, '')),
      asset_type: hexConverter.hexToDecimal(ldta.slice(262, 264)),
      link_layer_id: hexConverter.hexToDecimal(ldta.slice(264, 272)),
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
  const result = {
    // parse string
    string: item.string[0],
  };

  // parse idta
  if (item.idta) {
    const idta = item.idta[0].$.bdata;
    result.idta = {
      entry_type: hexConverter.hexToDecimal(idta.slice(0, 4)),
      id: hexConverter.hexToDecimal(idta.slice(32, 40)),
      asset_type: hexConverter.hexToDecimal(idta.slice(116, 118)),
    };
  }

  // parse PRin
  if (item.PRin) {
    const prin = item.PRin[0];

    result.prin = {
      prin: [
        hexConverter.hexToDecimal(prin.prin[0].$.bdata.slice(0, 8)),
        hexConverter.hexToAsciiString(prin.prin[0].$.bdata.slice(8, 104).replace(/00/gi, '')),
        hexConverter.hexToAsciiString(prin.prin[0].$.bdata.slice(104, 200).replace(/00/gi, '')),
        hexConverter.hexToDecimal(prin.prin[0].$.bdata.slice(200, 208)),
      ],
      prda: [
        hexConverter.hexToDecimal(prin.prda[0].$.bdata.slice(0, 8)),
        hexConverter.hexToDecimal(prin.prda[0].$.bdata.slice(8, 16)),
        hexConverter.hexToDecimal(prin.prda[0].$.bdata.slice(16, 24)),
      ],
    };
  }

  // parse cdta
  if (item.cdta) {
    const cdta = item.cdta[0].$.bdata;

    const frameRatio = hexConverter.hexToDecimal(cdta.slice(8, 16));
    result.cdta = {
      frameRatio,
      currentFrame: hexConverter.hexTo32Int(cdta.slice(40, 48)) / frameRatio,
      duration: hexConverter.hexToDecimal(cdta.slice(88, 96)) / frameRatio,
      backgroundColor: cdta.slice(104, 110),
      width: hexConverter.hexToDecimal(cdta.slice(280, 284)),
      height: hexConverter.hexToDecimal(cdta.slice(284, 288)),
      frameRate: hexConverter.hexToDecimal(cdta.slice(312, 320)) / (2 ** 16),
      startFrame: hexConverter.hexTo32Int(cdta.slice(328, 336))
        / hexConverter.hexTo32Int(cdta.slice(336, 344)),
    };
  }

  // parse Pin
  if (item.Pin) {
    const pin = item.Pin[0];
    result.pin = {};

    // parse sspc
    if (pin.sspc) {
      const sspc = pin.sspc[0].$.bdata;

      result.pin.sspc = {
        file_type: hexConverter.hexToAsciiString(sspc.slice(44, 52)),
        width: hexConverter.hexToDecimal(sspc.slice(60, 68)),
        height: hexConverter.hexToDecimal(sspc.slice(68, 76)),
        duration: hexConverter.hexToDecimal(sspc.slice(76, 84))
          / hexConverter.hexToDecimal(sspc.slice(84, 92)),
        frameRate: hexConverter.hexToDecimal(sspc.slice(116, 124)) / (2 ** 16),
        audioQuality: hexConverter.hexToDouble(sspc.slice(320, 336)),
      };
    }

    // parse fileReference
    if (pin.Als2) {
      const fileReference = pin.Als2[0].fileReference[0].$.fullpath;

      result.filename = fileReference.replace(/^.*[\\/]/, '');
      result.file_reference = fileReference;
    }

    // parse opti
    if (pin.opti) {
      const opti = pin.opti[0].$.bdata;
      const optiType = hexConverter.hexToDecimal(opti.slice(8, 12));
      if (optiType === 1) {
        result.pin.opti = {
          file_type: hexConverter.hexToAsciiString(opti.slice(0, 8)),
          type: hexConverter.hexToDecimal(opti.slice(8, 12)),
          byte_length: hexConverter.hexToDecimal(opti.slice(12, 20)),
          width: hexConverter.hexToDecimal(opti.slice(36, 44)),
          height: hexConverter.hexToDecimal(opti.slice(44, 52)),
          name: hexConverter.hexToAsciiString(opti.substr(116).replace(/00/gi, '')),
        };
      }
      if (optiType === 5) {
        result.pin.opti = {
          file_type: hexConverter.hexToAsciiString(opti.slice(0, 8)),
          type: hexConverter.hexToDecimal(opti.slice(8, 12)),
          byte_length: hexConverter.hexToDecimal(opti.slice(12, 20)),
          name: hexConverter.hexToAsciiString(opti.slice(60, 68)),
          codec: hexConverter.hexToAsciiString(opti.slice(76, 84)),
        };
      }
      if (optiType === 9) {
        result.pin.opti = {
          file_type: hexConverter.hexToAsciiString(opti.slice(0, 8)),
          type: hexConverter.hexToDecimal(opti.slice(8, 12)),
          byte_length: hexConverter.hexToDecimal(opti.slice(12, 20)),
          argb: `(${hexConverter.hexToFloat(opti.slice(20, 28))}, ${hexConverter.hexToFloat(opti.slice(28, 36))}, ${hexConverter.hexToFloat(opti.slice(36, 44))}, ${hexConverter.hexToFloat(opti.slice(44, 52))})`,
          name: hexConverter.hexToAsciiString(opti.substr(52).replace(/00/gi, '')),
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
    result.layr = item.Layr.map(layr => parseLayer(layr));
  }
  // parse SLay
  if (item.SLay) {
    result.slay = item.SLay.map(slay => parseLayer(slay));
  }
  // parse CLay
  if (item.CLay) {
    result.clay = item.CLay.map(clay => parseLayer(clay));
  }
  // parse SecL
  if (item.SecL) {
    result.secl = item.SecL.map(secl => parseLayer(secl));
  }

  return result;
}

function parseFold(fold) {
  return {
    items: fold.Item ? fold.Item.map(item => parseItem(item)) : [],
  };
}

function parseProject(project) {
  return {
    // parse folds
    fold: project.Fold ? parseFold(project.Fold[0]) : undefined,
  };
}

module.exports = {
  parse(data, handler) {
    switch (arguments.length) {
      case 1: // callback api
        xml2jsparser.parseString(data, (err, target) => {
          if (err) {
            handler(err, null);
          }
          const result = parseProject(target.AfterEffectsProject);
          handler(null, result);
        });
        return null;
      case 2:
      default:
        return new Promise((resolve, reject) => {
          xml2jsparser.parseString(data, (err, target) => {
            if (err) {
              reject(err);
            }
            return parseProject(target.AfterEffectsProject);
          });
        });
    }
  },
  parseSync(data) {
    const target = xml2jsparser.parseStringSync(data);
    return parseProject(target.AfterEffectsProject);
  },
  parseFile(filePath) {
    return new Promise((resolve) => {
      const data = fs.readFileSync(filePath);
      const target = xml2jsparser.parseStringSync(data);
      return resolve(parseProject(target.AfterEffectsProject));
    });
  },
  parseFileSync(filePath) {
    const data = fs.readFileSync(filePath);
    const target = xml2jsparser.parseStringSync(data);
    return parseProject(target.AfterEffectsProject);
  },
};
