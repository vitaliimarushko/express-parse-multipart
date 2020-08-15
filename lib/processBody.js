const processData = require('./processData');

module.exports = (bodyBuffer, boundary) => {
  if (!Buffer.isBuffer(bodyBuffer)
    || !bodyBuffer.length
    || (typeof boundary !== 'string')
    || !boundary.length
  ) {
    console.error('Parsed body or header boundary is empty');
    return [];
  }

  const allParts = [];
  let lastLine = '';
  let header = '';
  let info = '';
  let state = 0;
  let buffer = [];

  for (let i = 0; i < bodyBuffer.length; i++) {
    const oneByte = bodyBuffer[i];
    const prevByte = i > 0 ? bodyBuffer[i - 1] : null;
    const newLineDetected = (oneByte === 0x0a) && (prevByte === 0x0d);
    const newLineChar = (oneByte === 0x0a) || (oneByte === 0x0d);

    if (!newLineChar) {
      lastLine += String.fromCharCode(oneByte);
    }

    if ((state === 0) && newLineDetected) {
      if ('--' + boundary === lastLine) {
        state = 1;
      }

      lastLine = '';
    } else if ((state === 1) && newLineDetected) {
      header = lastLine;
      state = 2;

      if (!header.toLowerCase().includes('filename')) {
        state = 3;
      }

      lastLine = '';
    } else if ((state === 2) && newLineDetected) {
      info = lastLine;
      state = 3;
      lastLine = '';
    } else if ((state === 3) && newLineDetected) {
      state = 4;
      buffer = [];
      lastLine = '';
    } else if (state === 4) {
      if (lastLine.length > boundary.length + 4) {
        lastLine = '';
      }

      if (`--${boundary}` === lastLine) {
        const j = buffer.length - lastLine.length;
        const p = {
          header,
          info,
          part: buffer.slice(0, j - 1),
        };

        let data = null;

        try {
          data = processData(p);
        } catch (ex) {
          console.error(ex);
          return [];
        }

        allParts.push(data);
        buffer = [];
        lastLine = '';
        state = 5;
        header = '';
        info = '';
      } else {
        buffer.push(oneByte);
      }

      if (newLineDetected) {
        lastLine = '';
      }
    } else if (state === 5) {
      if (newLineDetected) {
        state = 1;
      }
    }
  }

  return allParts;
};
