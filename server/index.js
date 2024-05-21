const express = require('express');
const app = express();
app.use(express.json());

const {
  client,
  createTables,
  createUser,
  fetchUser,
  createProduct,
  fetchProduct,
  createFavorite,
  fetchFavorites,
  deleteFavorite,
} = require('./db');

app.get('/api/user', async (req, res, next) => {
  try {
    res.send(await fetchUser());
  } catch (error) {
    next(error);
  }
});

app.get('/api/product', async (req, res, next) => {
  try {
    res.send(await fetchProduct());
  } catch (error) {
    next(error);
  }
});

app.get('/api/user/:id/favorite', async (req, res, next) => {
  try {
    res.send(await fetchFavorites(req.params.id));
  } catch (error) {
    next(error);
  }
});

app.post('/api/user/:id/favorite', async (req, res, next) => {
  try {
    res.status(201).send(
      await createFavorite({
        userId: req.params.id,
        productId: req.body.productId,
      })
    );
  } catch (error) {
    next(error);
  }
});

app.delete('/api/user/:id/favorite/:id', async (req, res, next) => {
  try {
    await deleteFavorite({
      id: req.params.id,
      userId: req.params.userId,
    });
    res.sendStatus(204);
  } catch (error) {
    next(error);
  }
});

const init = async () => {
  await client.connect();
  console.log('connected to database');
  await createTables();
  console.log('tables created');

  const users = await Promise.all([
    createUser({ username: 'Lauren', password: 'PinkD0g3' }),
    createUser({ username: 'Kim', password: 'Yell0WC@t4' }),
    createUser({ username: 'Jim', password: 'Blu3F!sh5' }),
  ]);

  const products = await Promise.all([
    createProduct({ name: 'macbook Pro' }),
    createProduct({ name: 'ipad pro' }),
    createProduct({ name: 'Apple tv' }),
  ]);

  console.log('data seeded');
  console.log('Users -->', await fetchUser());
  console.log('Products -->', await fetchProduct());

  const [fav1, fav2, fav3] = await Promise.all([
    createFavorite({ userId: users[0].id, productId: products[0].id }),
    createFavorite({ userId: users[0].id, productId: products[1].id }),
    createFavorite({ userId: users[2].id, productId: products[2].id }),
  ]);
  console.log('user favorite seeded');
  const userFavorites = await fetchFavorites(users[0].id);
  console.log('favorites for Lauren -->', userFavorites);

  await deleteFavorite({ id: fav1.id, userId: fav1.user_id });
  console.log('Lauren fav after delete -->', await fetchFavorites(users[0].id));

  const port = process.env.PORT || 3000;
  app.listen(port, () => {
    console.log(`listening on port ${port}`);
    console.log(`curl localhost:${port}/api/user`);
    console.log(`curl localhost:${port}/api/product`);
    console.log(`curl localhost:${port}/api/user/${users[0].id}/favorite`);

    console.log(
      `CURL -X POST localhost:${port}/api/user/${users[0].id}/favorite -d '{"productId":"${products[2].id}"}' -H 'Content-Type:application/json'`
    );
    console.log(
      `CURL -X DELETE localhost:${port}/api/user/${users[2].id}/favorite/${products[2].id}`
    );
  });
};

init();
