import express from "express";
import { executeQuery, getClient } from "./dbAccess.js";

const orderRouter = express.Router();


orderRouter.get("/", async (req, res) => {
  try {
    const dbResults = await executeQuery("SELECT * FROM ORDERS");
    res.send(dbResults.rows);
  } catch (error) {
    console.error("Error fetching orders:", error);
    res.status(500).send({ error: "Failed to fetch orders" });
  }
});

orderRouter.get("/:id", async (req, res) => {
  const orderId = req.params.id;

  try {
    const dbResults = await executeQuery("SELECT * FROM ORDERS WHERE ID = $1", [
      orderId,
    ]);

    if (dbResults.rows.length < 1) {
      res.status(404).send({ error: `No order with id: ${orderId} was found` });
      return;
    }

    res.send(dbResults.rows[0]);
  } catch (error) {
    console.error("Error fetching order:", error);
    res.status(500).send({ error: "Failed to fetch order" });
  }
});

orderRouter.post("/", async (req, res) => {
  const { order_number, total_price, order_items } = req.body;

  if (
    !order_number ||
    !total_price ||
    !order_items.length ||
    order_items.length === 0
  ) {
    return res.status(400).send({ error: "Invalid input data" });
  }
  const client = getClient();
  client.connect();
  try {
    await client.query("BEGIN");
    const orderQuery = `
      INSERT INTO public.orders ("order_number", "total_price") 
      VALUES ($1, $2) 
      RETURNING *;`;
    const orderResult = await client.query(orderQuery, [
      order_number,
      total_price,
    ]);
    const orderId = orderResult.rows[0].id;
    orderResult.rows[0].order_items = [];

    const orderItemQuery = `INSERT INTO public.order_items ("order_id", "product_id", "quantity", "price") 
      VALUES ($1, $2, $3, $4) returning *;`;

    for (const item of order_items) {
      const orderItemResult = await client.query(orderItemQuery, [
        orderId,
        item.product_id,
        item.quantity,
        item.price,
      ]);
      orderResult.rows[0].order_items.push(orderItemResult.rows[0]);
    }

    await client.query("COMMIT");

    res.status(201).json(orderResult.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Error creating order:", error);
    res.status(500).send({ error: "Failed to create order" });
  } finally {
    client.end();
  }
});

orderRouter.put("/:id", async (req, res) => {
  const id = req.params.id;
  const { order_number, total_price } = req.body;

  if (!order_number || !total_price) {
    return res.status(400).send({ error: "Invalid input data" });
  }

  try {
    const query = `
      UPDATE public.orders 
      SET order_number = $1, total_price = $2 
      WHERE id = $3 
      RETURNING *;`;
    const dbResults = await executeQuery(query, [
      order_number,
      total_price,
      id,
    ]);

    if (dbResults.rowCount === 0) {
      res.status(404).send({ error: `No order with id: ${id} was found` });
      return;
    }

    res.status(200).json(dbResults.rows[0]);
  } catch (error) {
    console.error("Error updating order:", error);
    res.status(500).send({ error: "Failed to update order" });
  }
});

orderRouter.delete("/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const result = await executeQuery(
      "DELETE FROM public.orders WHERE id = $1 RETURNING *;",
      [id]
    );

    if (result.rowCount === 0) {
      res.status(404).send({ error: `No order with id: ${id} was found` });
      return;
    }

    res.status(200).send({ message: "Order deleted successfully" });
  } catch (error) {
    console.error("Error deleting order:", error);
    res.status(500).send({ error: "Failed to delete order" });
  }
});

export default orderRouter;
