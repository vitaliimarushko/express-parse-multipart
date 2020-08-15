# Description

Middleware parses request body with `multipart/form-data` content type and prepares an array of objects which represent every file which is sent in request. On the server side you will be able to get that array from `req.formData` property (see an example below). Every array item will contain `data` property which is a Buffer.

# Using

1. Make a simple Express.js server in `index.js` file:

   ```javascript
   const app = require('express')();
   const parseMp = require('express-parse-multipart');
   
   app.post('/upload', parseMp, (req, res) => {
     console.log(req.formData);  // here is the target array of objects
     return res.send('Yay!');
   });
   
   app.listen(3000, () => console.log('Started on: http://localhost:3000'));
   ```

2. Run it:

   ```shell script
   node index.js
   ```

3. Make a `POST` request using any tool you want and send any file (-s) on `http://localhost:3000/upload` route. Check console to see the parsed result.

# Example of `req.formData`

```json
[
  {
    "data": {
      "type": "Buffer",
      "data": [
        78,
        97,
        10
      ]
    },
    "name": "file1",
    "filename": "csv_test.csv",
    "type": "text/csv"
  },
  {
    "data": {
      "type": "Buffer",
      "data": [
        137,
        80,
        130
      ]
    },
    "filename": "img_test.png",
    "type": "image/png"
  },
  {
    "data": {
      "type": "Buffer",
      "data": [
        74,
        68,
        69
      ]
    },
    "name": "text1"
  }
]
```
