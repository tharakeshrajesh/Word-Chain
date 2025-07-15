const express = require('express');
const bodyParser = require('body-parser');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/', (req, res) => {
  if (req.body.type === 'url_verification') {
    return res.status(200).send(req.body.challenge);
  }

  console.log('📩 Event received:', JSON.stringify(req.body, null, 2));
  res.status(200).send();
});

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
});
