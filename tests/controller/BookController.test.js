jest.mock("../../src/services/BookService");

const BookService = require("../../src/services/BookService");
const BookController = require("../../src/controller/BookController");

function mockRes() {
  const res = { json: jest.fn() };
  res.status = jest.fn().mockReturnValue(res);
  return res;
}

describe("BookController", () => {
  afterEach(() => jest.clearAllMocks());

  it("list responds with the books from the service", async () => {
    BookService.list.mockResolvedValue([{ title: "A" }]);
    const res = mockRes();

    await BookController.list({}, res);

    expect(res.json).toHaveBeenCalledWith([{ title: "A" }]);
  });

  it("add responds with the saved book", async () => {
    BookService.add.mockResolvedValue({ title: "New" });
    const req = { body: { title: "New" } };
    const res = mockRes();

    await BookController.add(req, res);

    expect(BookService.add).toHaveBeenCalledWith(req.body);
    expect(res.json).toHaveBeenCalledWith({ title: "New" });
  });

  it("delete responds with the removed book", async () => {
    BookService.delete.mockResolvedValue({ _id: "123" });
    const req = { params: { id: "123" } };
    const res = mockRes();

    await BookController.delete(req, res);

    expect(BookService.delete).toHaveBeenCalledWith("123");
    expect(res.json).toHaveBeenCalledWith({ _id: "123" });
  });

  it("list responds with a 500 when the service rejects", async () => {
    BookService.list.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await BookController.list({}, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "db down" });
  });

  it("add responds with a 500 when the service rejects", async () => {
    BookService.add.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await BookController.add({ body: {} }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "db down" });
  });

  it("delete responds with a 500 when the service rejects", async () => {
    BookService.delete.mockRejectedValue(new Error("db down"));
    const res = mockRes();

    await BookController.delete({ params: { id: "123" } }, res);

    expect(res.status).toHaveBeenCalledWith(500);
    expect(res.json).toHaveBeenCalledWith({ error: "db down" });
  });
});
