const http = require('http');
const getBoundary = require('./getBoundary');
const prepareBody = require('./prepareBody');
const processBody = require('./processBody');

module.exports = async req => {
  if (!(req instanceof http.IncomingMessage)) {
    console.error('"req" is not an instance of http.IncomingMessage');
    return [];
  }

  let boundary = null;

  try {
    boundary = getBoundary(req.headers);
  } catch (ex) {
    console.error(ex);
    return [];
  }

  if (!boundary) {
    console.error('"boundary" is not specified in headers');
    return [];
  }

  let bodyBuffer = [];

  try {
    bodyBuffer = await prepareBody(req);
  } catch (ex) {
    console.error(ex);
    return [];
  }

  if (!Buffer.isBuffer(bodyBuffer)) {
    console.error(`"req" has wrong content which can't be extracted as buffer`);
    return [];
  }

  let allParts = [];

  try {
    allParts = processBody(bodyBuffer, boundary);
  } catch (ex) {
    console.error(ex);
    return [];
  }

  return allParts;
};
