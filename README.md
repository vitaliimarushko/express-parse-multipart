# Description

This middleware parses request body with `multipart/form-data` specified content type and prepares an array of objects which represent every file which is sent in request. On the server side you will be able to get everything from `req.formData` array property (see an example below). Every array item will contain `data` property which is a Buffer.

# Using

1. Make a simple Express.js server in `index.js` file:

   ```javascript
   const app = require('express')();
   const parseMp = require('express-parse-multipart');
   
   app.post('/upload', parseMp, (req, res) => {
     // an array of files is inside "req.formData" property
     return res.json(req.formData);
   });
   
   app.listen(3000, () => console.log('Started on: http://localhost:3000'));
   ```

2. Run it:

   ```shell script
   node index.js
   ```

3. Make a POST request using any tool you want and send any file (-s) on `http://localhost:3000/upload` route.

You will get as response:

```json
[
  {
    "data": {  // it's stringified Buffer
      "type": "Buffer",
      "data": [
          78,
          97,
          109,
          // ... lots values here
          57,
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
        78,
        // ...
        96,
        130
      ]
    },
    "name": "file2",
    "filename": "img_test.png",
    "type": "image/png"
  }
]
```
