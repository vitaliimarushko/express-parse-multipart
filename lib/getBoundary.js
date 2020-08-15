module.exports = (headers = {}) => {
  if (!headers || typeof headers !== 'object') {
    console.error('"headers" parameter must be an object');
    return null;
  }

  for (const header in headers) {
    if (header.toLowerCase() !== 'content-type') {
      continue;
    }

    const splitHeaderContent = headers[header].split(';');

    for (const item of splitHeaderContent) {
      if (!item.toLowerCase().includes('boundary')) {
        continue;
      }

      return (item.split('=')[1]).trim() || null;
    }
  }

  return null;
};
