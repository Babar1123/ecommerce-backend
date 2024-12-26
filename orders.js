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
  const { order_number, total_price } = req.body;
  const items = req.body.order_items;

  try {
    await client.query('BEGIN')
    const queryText = `INSERT INTO public.orders ( "order_number", "total_price") 
               VALUES($1, $2) returning *;`;
    const res = await client.query(queryText, ['brianc'])
   
    const insertPhotoText = `INSERT INTO public.order_items ("order_id","product_id", "quantity", "price") 
  VALUES ($1, $2, $3, $4) returning *;`;
    const insertPhotoValues = [res.rows[0].id, 's3.bucket.foo']
    await client.query(insertPhotoText, insertPhotoValues)
    await client.query('COMMIT')
  } catch (e) {
    await client.query('ROLLBACK')
    throw e
  } finally {
    client.release()
  }

  const query1 = `INSERT INTO public.orders ( "order_number", "total_price") 
               VALUES($1, $2) returning *;`;

  const dbResults1 = await executeQuery(query1, [order_number, total_price]);

  if (dbResults1.rowCount === 0) {
    res.sendStatus(500);
    return;
  }

  const orderId = dbResults1.rows[0].id;

  for (let x = 0; x < items.length; x++) {
    const query2 = `INSERT INTO public.order_items ("order_id","product_id", "quantity", "price") 
  VALUES ($1, $2, $3, $4) returning *;`;

    const dbResults2 = executeQuery(query2, [
      orderId,
      items[x].product_id,
      items[x].quantity,
      items[x].price,
    ]);
    if (dbResults2.rowCount === 0) {
      res.sendStatus(500);
      return;
    }
 
  }
  res.status(200).json(dbResults1.rows[0]);
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
