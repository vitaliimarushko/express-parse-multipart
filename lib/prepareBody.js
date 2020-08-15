const http = require('http');

module.exports = async req => {
  const emptyBuffer = Buffer.alloc(0);

  if (!(req instanceof http.IncomingMessage)) {
    console.error('"req" is not an instance of http.IncomingMessage');
    return emptyBuffer;
  }

  let body = emptyBuffer;

  if (Buffer.isBuffer(req.body)) {
    body = req.body;
  } else if (req.readable
    && req.socket
    && req.socket.readable
    && req.socket.hasOwnProperty('_events')
    && (typeof req.socket._events.data === 'function')
  ) {
    body = await new Promise(resolve => {
      const buffers = [];

      req.on('data', data => {
        buffers.push(data);
      });

      req.on('end', () => {
        resolve(Buffer.concat(buffers));
      });
    });
  } else if (req.body && (typeof req.body === 'object')) {
    try {
      body = Buffer.from(JSON.stringify(req.body));
    } catch (ex) {
      console.error(ex);
    }
  }

  return Buffer.isBuffer(body) ? body : Buffer.from(body);
};
