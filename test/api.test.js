let request = require("supertest");
let http = require("http");

let { app } = require("../index");
let { getAllStocks, getStockByTicker, addTrade } = require("../controller");

let server;

jest.mock("../controller", () => ({
  ...jest.requireActual("../controller"),
  getAllStocks: jest.fn(),
  getStockByTicker: jest.fn(),
  addTrade: jest.fn(),
}));

beforeAll((done) => {
  server = http.createServer(app);
  server.listen(3001, done);
});

afterAll((done) => {
  server.close(done);
});

describe("API Endpoints Testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("GET /stocks should return all stocks", async () => {
    let mockStocks = [
      {
        stockId: 1,
        ticker: "AAPL",
        companyName: "Apple Inc.",
        price: 150.75,
      },
      {
        stockId: 2,
        ticker: "GOOGL",
        companyName: "Alphabet Inc.",
        price: 2750.1,
      },
      {
        stockId: 3,
        ticker: "TSLA",
        companyName: "Tesla, Inc.",
        price: 695.5,
      },
    ];
    getAllStocks.mockReturnValue(mockStocks);
    let response = await request(server).get("/stocks");
    expect(response.status).toBe(200);
    expect(response.body).toEqual({ stocks: mockStocks });
    expect(response.body.stocks.length).toBe(3);
  });

  it("GET /stocks/:ticker should return stock by ticker", async () => {
    getStockByTicker.mockReturnValue({
      stockId: 1,
      ticker: "AAPL",
      companyName: "Apple Inc.",
      price: 150.75,
    });
    let response = await request(server).get("/stocks/AAPL");
    expect(response.status).toBe(200);
    expect(response.body.stock).toEqual({
      stockId: 1,
      ticker: "AAPL",
      companyName: "Apple Inc.",
      price: 150.75,
    });
  });

  it("POST /trades/new should add a new trade", async () => {
    let mockTrade = {
      tradeId: 4,
      stockId: 1,
      quantity: 4,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    };
    addTrade.mockResolvedValue(mockTrade);
    let response = await request(server).post("/trades/new").send({
      stockId: 1,
      quantity: 4,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    });
    expect(response.status).toBe(201);
    expect(response.body).toEqual({ trade: mockTrade });
  });
});

describe("Error Handling", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 404 for non-existing stock", async () => {
    getStockByTicker.mockReturnValue(null); // undefined
    let response = await request(server).get("/stocks/abcd");
    expect(response.status).toBe(404);
    expect(response.text).toEqual("No stock found with this ticker ABCD");
  });
});

describe("Validating inputs", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("should return 400 for invalid trade input", async () => {
    addTrade.mockResolvedValue(null);
    let response = await request(server).post("/trades/new").send({
      stockId: 1,
      quantity: 4,
      tradeDate: "2024-08-08",
    });

    expect(response.status).toEqual(400);
    expect(response.text).toEqual(
      "Trade type is required and should be a string"
    );
  });
});

describe("Function testing", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  it("getAllStocks() should return all stocks", async () => {
    let mockStocks = [
      {
        stockId: 1,
        ticker: "AAPL",
        companyName: "Apple Inc.",
        price: 150.75,
      },
      {
        stockId: 2,
        ticker: "GOOGL",
        companyName: "Alphabet Inc.",
        price: 2750.1,
      },
      {
        stockId: 3,
        ticker: "TSLA",
        companyName: "Tesla, Inc.",
        price: 695.5,
      },
    ];
    getAllStocks.mockReturnValue(mockStocks);
    let response = await getAllStocks();
    expect(response).toEqual(mockStocks);
    expect(response.length).toBe(3);
  });

  it("addTrade() should add trade successfully", async () => {
    let mockTrade = {
      tradeId: 4,
      stockId: 1,
      quantity: 4,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    };
    addTrade.mockResolvedValue(mockTrade);
    let response = await addTrade({
      stockId: 1,
      quantity: 4,
      tradeType: "buy",
      tradeDate: "2024-08-08",
    });
    expect(response).toEqual(mockTrade);
  });
});
