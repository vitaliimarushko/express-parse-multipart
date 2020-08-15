module.exports = part => {
  const header = part.header.split(';');
  const filenameData = header[2];
  const name = header[1].split('=')[1].replace(/"/g, '');
  const input = {
    data: Buffer.from(part.part),
  };

  if (name) {
    Object.assign(input, {
      name,
    });
  }

  if (filenameData) {
    const k = filenameData.split('=');

    Object.assign(input, {
      [k[0].trim()]: JSON.parse(k[1].trim()),
      type: part.info.split(':')[1].trim(),
    });
  }

  return input;
};
