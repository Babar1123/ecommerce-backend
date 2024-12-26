import pg from "pg";

async function executeQuery(query, params = []) {
  const { Client } = pg;
  const client = new Client({
    user: "postgres",
    password: "123456",
    host: "localhost",
    port: 5432,
    database: "E-Commers",
  });

  await client.connect();
  console.log(query);
  console.log(params);
  const result = await client.query(query, params);
  await client.end();

  return result;
}

export { executeQuery };
