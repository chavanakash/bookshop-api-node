const Book = require("./../services/BookService");
function BookController() {
  const listBooks = function(req, res) {
    return Book.list()
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ error: err.message }));
  };

  const addBooks = function(req, res) {
    return Book.add(req.body)
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ error: err.message }));
  };

  const deleteBooks = function(req, res) {
    return Book.delete(req.params.id)
      .then(data => res.json(data))
      .catch(err => res.status(500).json({ error: err.message }));
  };

  return {
    list: listBooks,
    add: addBooks,
    delete: deleteBooks
  };
}

module.exports = BookController();
