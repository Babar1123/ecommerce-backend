import express from "express";
import productRouter from "./products.js";
import orderRouter from "./orders.js";

const app = express();
app.use(express.json());
const port = 3000;

app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
