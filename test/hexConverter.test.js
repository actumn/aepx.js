import { assert } from 'chai';
import hexConverter from '../src/hexConverter';

describe('hexConverter test', () => {
  describe('hex to ascii when normal condition', () => {
    it('Adjustment Layer 1', () => {
      assert.equal(hexConverter.hexToAsciiString('41646a7573746d656e74204c617965722031'), 'Adjustment Layer 1');
    });
  });

  describe('hex to float when normal condition', () => {
    it('float 1', () => {
      assert.equal(hexConverter.hexToFloat('3f800000'), 1);
    });
  });

  describe('hex to 32int', () => {
    it('negative -1', () => {
      assert.equal(hexConverter.hexTo32Int('FFFFFFFF'), -1);
    });

    it('poisitive 1', () => {
      assert.equal(hexConverter.hexTo32Int('00000001'), 1);
    });
  });

  describe('hex to double when normal condition', () => {
    it('double 48000', () => {
      assert.equal(hexConverter.hexToDouble('40e7700000000000'), 48000);
      assert.equal(hexConverter.hexToDouble('0000000000000000'), 0);
    });
  });
});
