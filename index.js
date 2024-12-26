import express from "express";
import cors from 'cors';

import productRouter from "./products.js";
import orderRouter from "./orders.js";

const app = express();
app.use(express.json());
app.use(cors());

const port = 3000;

app.use("/api/products", productRouter);
app.use("/api/orders", orderRouter);

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
