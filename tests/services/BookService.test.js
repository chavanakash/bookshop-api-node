jest.mock("../../src/models/Book");

const Book = require("../../src/models/Book");
const BookService = require("../../src/services/BookService");

describe("BookService", () => {
  afterEach(() => jest.clearAllMocks());

  it("list returns all books", async () => {
    Book.find.mockResolvedValue([{ title: "A" }]);

    const result = await BookService.list();

    expect(Book.find).toHaveBeenCalled();
    expect(result).toEqual([{ title: "A" }]);
  });

  it("add saves a new book", async () => {
    const saveMock = jest.fn().mockResolvedValue({ title: "New" });
    Book.mockImplementation(() => ({ save: saveMock }));

    const result = await BookService.add({ title: "New" });

    expect(saveMock).toHaveBeenCalled();
    expect(result).toEqual({ title: "New" });
  });

  it("delete removes a book by id", async () => {
    Book.findByIdAndRemove.mockResolvedValue({ _id: "123" });

    const result = await BookService.delete("123");

    expect(Book.findByIdAndRemove).toHaveBeenCalledWith("123");
    expect(result).toEqual({ _id: "123" });
  });
});
