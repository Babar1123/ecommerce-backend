import express from "express";
import { executeQuery } from "./dbAccess.js";
const productRouter = express.Router();

productRouter.get("/", async (req, res) => {
  const dbResults = await executeQuery("SELECT * FROM PRODUCTS ORDER BY ID");
  res.send(dbResults.rows);
});

productRouter.get("/:id", async (req, res) => {
  const productId = req.params.id;
  const dbResults = await executeQuery("SELECT * FROM PRODUCTS WHERE ID = $1", [
    productId,
  ]);

  if (dbResults.rows.length < 1) {
    res.status(404).send(`No product with id: ${productId} was found`);
    return;
  }
  res.send(dbResults.rows[0]);
});

productRouter.post("/", async (req, res) => {
  const { name, description, price } = req.body;
  const query = `INSERT INTO public.products ("name", description, price) 
               VALUES($1, $2, $3) returning *;`;

  const dbResults = await executeQuery(query, [name, description, price]);

  if ((dbResults.rowCount = 0)) {
    res.sendStatus(500);
    return;
  }
  res.status(200).json(dbResults.rows[0]);
});

productRouter.put("/:id", async (req, res) => {
  const { id } = req.params;
  const { name, description, price } = req.body;

  const query = `UPDATE public.products 
               SET name = $1, description = $2, price = $3 
               WHERE id = $4 returning *;`;

  const dbResults = await executeQuery(query, [name, description, price, id]);
  res.status(200).json(dbResults.rows[0]);
});

productRouter.delete("/:id", async (req, res) => {
  const { id } = req.params;

  await executeQuery("DELETE FROM public.products WHERE id = $1;", [id]);
  res.status(200).send();
});

export default productRouter;
