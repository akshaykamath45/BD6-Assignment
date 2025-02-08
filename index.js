let express = require("express");
let cors = require("cors");
let { getAllStocks, getStockByTicker, addTrade } = require("./controller");

let app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("BD6 Assignment");
});

// retrieve all stocks
app.get("/stocks", async (req, res) => {
  try {
    let stocks = await getAllStocks();
    if (stocks.length == 0) {
      return res.status(404).send("No stocks found");
    }
    return res.json({ stocks });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// retrieve stock by ticker
app.get("/stocks/:ticker", async (req, res) => {
  try {
    let ticker = req.params.ticker;
    ticker = ticker.toUpperCase();
    let stock = await getStockByTicker(ticker);
    if (!stock) {
      return res.status(404).send(`No stock found with this ticker ${ticker}`);
    }
    return res.json({ stock });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

// add a new trade
function validateTrade(trade) {
  if (!trade.stockId || typeof trade.stockId !== "number") {
    return "Stock id is required and should be a number";
  }

  if (!trade.quantity || typeof trade.quantity !== "number") {
    return "Quantity is required and should be a number";
  }

  if (!trade.tradeType || typeof trade.tradeType !== "string") {
    return "Trade type is required and should be a string";
  }

  if (!trade.tradeDate || typeof trade.tradeDate !== "string") {
    return "Trade date is required and should be a string";
  }
  return null;
}
app.post("/trades/new", async (req, res) => {
  try {
    let error = validateTrade(req.body);
    if (error) {
      return res.status(400).send(error);
    }
    let trade = await addTrade(req.body);
    return res.status(201).json({ trade });
  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
});

module.exports = { app };
