//data layer
const pg = require('pg');
const bcrypt = require('bcrypt');
const { v4: uuidv4 } = require('uuid');

const client = new pg.Client(
  process.env.DATABASE_URL || {
    user: 'jennifersimond',
    password: 'Pa$$w0rd',
    host: 'localhost',
    port: 5432,
    database: 'acme_store_db',
  }
);

const createTables = () => {
  const SQL = `
    DROP TABLE IF EXISTS favorite;
    DROP TABLE IF EXISTS product ;
    DROP TABLE IF EXISTS "user" ;

    CREATE TABLE product (
      id UUID PRIMARY KEY, 
      name VARCHAR(90) NOT NULL UNIQUE
    );

    CREATE TABLE "user" (
      id UUID PRIMARY KEY, 
      username VARCHAR(90) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    );

    CREATE TABLE favorite (
      id UUID PRIMARY KEY, 
      product_id UUID REFERENCES product(id) NOT NULL,
      user_id UUID REFERENCES "user"(id) NOT NULL,
      CONSTRAINT unique_user_product UNIQUE (user_id, product_id )
    );
  `;

  return client.query(SQL);
};

const createUser = async ({ username, password }) => {
  password = await bcrypt.hash(password, 10);
  console.log('Hashed Password -->', password);
  const SQL = `
  INSERT INTO "user" (id, userName, password) VALUES ($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [uuidv4(), username, password]);
  return response.rows[0];
};

const fetchUser = async () => {
  const SQL = `
  SELECT * FROM "user"
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createProduct = async ({ name }) => {
  const SQL = `
  INSERT INTO product (id, name) VALUES ($1, $2) RETURNING *
  `;
  const response = await client.query(SQL, [uuidv4(), name]);
  return response.rows[0];
};

const fetchProduct = async () => {
  const SQL = `
  SELECT * FROM product
  `;
  const response = await client.query(SQL);
  return response.rows;
};

const createFavorite = async ({ productId, userId }) => {
  const SQL = `
  INSERT INTO favorite(id, product_id, user_id) VALUES($1, $2, $3) RETURNING *
  `;
  const response = await client.query(SQL, [uuidv4(), productId, userId]);
  return response.rows[0];
};

const fetchFavorites = async (userId) => {
  const SQL = `
  SELECT * FROM favorite WHERE user_id = $1
  `;
  const response = await client.query(SQL, [userId]);
  return response.rows;
};

const deleteFavorite = async ({ id, userId }) => {
  const SQL = `
  DELETE FROM favorite WHERE id = $1 AND user_id = $2;
  `;
  await client.query(SQL, [id, userId]);
};

module.exports = {
  client,
  createTables,
  createUser,
  fetchUser,
  createProduct,
  fetchProduct,
  createFavorite,
  fetchFavorites,
  deleteFavorite,
};
