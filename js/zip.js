const encoder = new TextEncoder();

const crcTable = new Uint32Array(256);
for (let i = 0; i < 256; i++) {
  let value = i;
  for (let bit = 0; bit < 8; bit++) value = (value >>> 1) ^ (value & 1 ? 0xedb88320 : 0);
  crcTable[i] = value >>> 0;
}

function crc32(bytes) {
  let value = 0xffffffff;
  for (const byte of bytes) value = crcTable[(value ^ byte) & 255] ^ (value >>> 8);
  return (value ^ 0xffffffff) >>> 0;
}

function dosDateTime(date) {
  const year = Math.max(1980, date.getFullYear());
  return {
    date: ((year - 1980) << 9) | ((date.getMonth() + 1) << 5) | date.getDate(),
    time: (date.getHours() << 11) | (date.getMinutes() << 5) | (date.getSeconds() >>> 1),
  };
}

export async function createZip(items, load, onProgress = () => {}) {
  if (items.length > 65535) throw Error('Too many images for one ZIP file');
  const parts = [];
  const central = [];
  let offset = 0;

  for (let index = 0; index < items.length; index++) {
    const item = items[index];
    const name = encoder.encode(item.key);
    const bytes = new Uint8Array(await load(item));
    const checksum = crc32(bytes);
    const { date, time } = dosDateTime(new Date(item.uploadedAt || Date.now()));
    const local = new Uint8Array(30);
    const l = new DataView(local.buffer);
    l.setUint32(0, 0x04034b50, true);
    l.setUint16(4, 20, true);
    l.setUint16(6, 0x0800, true);
    l.setUint16(10, time, true);
    l.setUint16(12, date, true);
    l.setUint32(14, checksum, true);
    l.setUint32(18, bytes.length, true);
    l.setUint32(22, bytes.length, true);
    l.setUint16(26, name.length, true);
    parts.push(local, name, bytes);

    const header = new Uint8Array(46);
    const c = new DataView(header.buffer);
    c.setUint32(0, 0x02014b50, true);
    c.setUint16(4, 20, true);
    c.setUint16(6, 20, true);
    c.setUint16(8, 0x0800, true);
    c.setUint16(12, time, true);
    c.setUint16(14, date, true);
    c.setUint32(16, checksum, true);
    c.setUint32(20, bytes.length, true);
    c.setUint32(24, bytes.length, true);
    c.setUint16(28, name.length, true);
    c.setUint32(42, offset, true);
    central.push(header, name);
    offset += local.length + name.length + bytes.length;
    if (offset > 0xffffffff) throw Error('ZIP file exceeds the 4 GB limit');
    onProgress(index + 1, items.length);
  }

  const centralSize = central.reduce((sum, part) => sum + part.length, 0);
  const end = new Uint8Array(22);
  const view = new DataView(end.buffer);
  view.setUint32(0, 0x06054b50, true);
  view.setUint16(8, items.length, true);
  view.setUint16(10, items.length, true);
  view.setUint32(12, centralSize, true);
  view.setUint32(16, offset, true);
  return new Blob([...parts, ...central, end], { type: 'application/zip' });
}
