const http = require('http');

const process = part => {
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

const getBoundary = (headers = {}) => {
  for (const header in headers) {
    if (header.toLowerCase() !== 'content-type') {
      continue;
    }

    const splitHeaderContent = headers[header].split(';');

    for (const item of splitHeaderContent) {
      if (!item.toLowerCase().includes('boundary')) {
        continue;
      }

      return (item.split('=')[1]).trim();
    }
  }

  return null;
};

const prepareBody = async req => {
  let body = [];

  if (req.body instanceof Buffer) {
    body = req.body;
  } else if (req.readable
    && req.socket
    && req.socket.readable
    && req.socket._events
    && (typeof req.socket._events.data === 'function')
  ) {
    body = await new Promise(resolve => {
      let buffers = [];

      req.on('data', data => {
        buffers.push(data);
      });

      req.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  } else if (req.body && (typeof req.body === 'object')) {
    body = Buffer.from(JSON.stringify(req.body));
  }

  return body;
};

const parse = async req => {
  if (!(req instanceof http.IncomingMessage)) {
    return null;
  }

  const boundary = getBoundary(req.headers);

  if (!boundary) {
    return null;
  }

  const multipartBodyBuffer = await prepareBody(req);
  const allParts = [];
  let lastLine = '';
  let header = '';
  let info = '';
  let state = 0;
  let buffer = [];

  for (let i = 0; i < multipartBodyBuffer.length; i++) {
    const oneByte = multipartBodyBuffer[i];
    const prevByte = i > 0 ? multipartBodyBuffer[i - 1] : null;
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

        allParts.push(process(p));
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

module.exports = async (req, res, next) => {
  req.formData = await parse(req) || [];
  return next();
};
