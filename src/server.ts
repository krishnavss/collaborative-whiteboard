import express from 'express';

const app = express();
const port = 3001;

app.get('/', (req, res) => {
  res.send('Hello, Whiteboard Backend!');
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});

