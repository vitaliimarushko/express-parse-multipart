const parseRequest = require('./lib/parseRequest');

module.exports = async (req, res, next) => {
  let formData = [];

  try {
    formData = await parseRequest(req);
  } catch (ex) {
    console.error(ex);
  }

  req.formData = formData;

  return next();
};
