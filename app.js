const express = require('express');
const fs = require('fs/promises');

const app = express();
const PORT = 3000;

app.use(express.json());

let booksData;
const readBooksData = async () => {
  try {
    const data = await fs.readFile('books.json', 'utf8');
    booksData = JSON.parse(data);
  } catch (error) {
    console.error('Error reading books data:', error.message);
  }
};

readBooksData();

app.get('/books', (req, res) => {
  res.json(booksData);
});

app.get('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const book = booksData.find(book => book.id === bookId);

  if (book) {
    res.json(book);
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});

app.post('/books', (req, res) => {
  const newBook = req.body;
  newBook.id = booksData.length + 1;
  booksData.push(newBook);
  
  fs.writeFile('books.json', JSON.stringify(booksData, null, 2))
    .then(() => {
      res.status(201).json(newBook);
    })
    .catch(error => {
      res.status(500).json({ error: 'Internal Server Error' });
      console.error('Error writing books data:', error.message);
    });
});

app.put('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const updatedBook = req.body;
  const index = booksData.findIndex(book => book.id === bookId);

  if (index !== -1) {
    booksData[index] = { ...booksData[index], ...updatedBook };

    fs.writeFile('books.json', JSON.stringify(booksData, null, 2))
      .then(() => {
        res.json(booksData[index]);
      })
      .catch(error => {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error writing books data:', error.message);
      });
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});
app.delete('/books/:id', (req, res) => {
  const bookId = parseInt(req.params.id);
  const index = booksData.findIndex(book => book.id === bookId);

  if (index !== -1) {
    const deletedBook = booksData.splice(index, 1)[0];
    fs.writeFile('books.json', JSON.stringify(booksData, null, 2))
      .then(() => {
        res.json(deletedBook);
      })
      .catch(error => {
        res.status(500).json({ error: 'Internal Server Error' });
        console.error('Error writing books data:', error.message);
      });
  } else {
    res.status(404).json({ error: 'Book not found' });
  }
});
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
