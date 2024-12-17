import express from "express";
import { executeQuery } from "./dbAccess.js";
const orderRouter = express.Router();

orderRouter.get("/", async (req, res) => {
  const dbResults = await executeQuery("SELECT * FROM ORDERS");
  res.send(dbResults.rows);
});

orderRouter.get("/:id", async (req, res) => {
  const orderId = req.params.id;
  const dbResults = await executeQuery("SELECT * FROM ORDERS WHERE ID = $1", [
    orderId,
  ]);

  if (dbResults.rows.length < 1) {
    res.status(404).send(`No order with id: ${orderId} was found`);
    return;
  }
  res.send(dbResults.rows[0]);
});

orderRouter.post("/", async (req, res) => {
  const { id, order_number, total_price } = req.body;

  const query = `INSERT INTO public.orders ("id", "order_number", "total_price") 
               VALUES($1, $2, $3) returning *;`;

  const dbResults = await executeQuery(query, [id, order_number, total_price]);

  if (dbResults.rowCount === 0) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(dbResults.rows[0]);
});

orderRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { order_number, total_price } = req.body;

  const query = `UPDATE public.orders 
               SET order_number = $1, total_price = $2 
               WHERE id = $3 returning *;`;

  const dbResults = await executeQuery(query, [order_number, total_price, id]);
  res.status(200).json(dbResults.rows[0]);
});

orderRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;

  await executeQuery("DELETE FROM public.orders WHERE id = $1;", [id]);
  res.status(200).send();
});

export default orderRouter;
