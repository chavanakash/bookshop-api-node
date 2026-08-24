const request = require("supertest");

jest.mock("../../src/services/BookService");

const BookService = require("../../src/services/BookService");
const app = require("../../src/app");

describe("Book routes", () => {
  afterEach(() => jest.clearAllMocks());

  it("GET /api/book/list returns the books", async () => {
    BookService.list.mockResolvedValue([{ title: "A" }]);

    const res = await request(app).get("/api/book/list");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([{ title: "A" }]);
  });

  it("POST /api/book/add creates a book", async () => {
    BookService.add.mockResolvedValue({ title: "New" });

    const res = await request(app)
      .post("/api/book/add")
      .send({ title: "New" });

    expect(res.status).toBe(200);
    expect(BookService.add).toHaveBeenCalledWith(
      expect.objectContaining({ title: "New" })
    );
  });

  it("DELETE /api/book/delete/:id deletes a book", async () => {
    BookService.delete.mockResolvedValue({ _id: "123" });

    const res = await request(app).delete("/api/book/delete/123");

    expect(res.status).toBe(200);
    expect(BookService.delete).toHaveBeenCalledWith("123");
  });
});
