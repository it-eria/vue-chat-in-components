const functions = require('firebase-functions');
const cors = require('cors')({
  origin: true
});

exports.exampleFunction = functions.https.onRequest((request, response) => {
  cors(request, response, () => {});
  return response.send("Hello from Firebase!");
});