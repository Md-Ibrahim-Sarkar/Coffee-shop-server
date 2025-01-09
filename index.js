import express from 'express';
import cors from 'cors';
import 'dotenv/config';
import { MongoClient, ObjectId, ServerApiVersion } from 'mongodb';

const app = express();
const port = process.env.PORT || 3000;
// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.SECRET_NAME}:${process.env.SECRET_KEY}@cluster0.kt5fy.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

async function run() {
  try {
    const database = client.db('coffee-table');
    const coffees = database.collection('coffees');
    const usersCatection = database.collection('users');
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();
    // Send a ping to confirm a successful connection

    // users

    // create a new user
    app.post('/users', async (req, res) => {
      const userData = req.body;
      const data = await usersCatection.insertOne(userData);
      res.send(data);
    });

    //  get all users

    app.get('/users', async (req, res) => {
      const usersData = usersCatection.find();
      const data = await usersData.toArray();
      res.send(data);
    });

    // delete user
    app.delete('/user/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await usersCatection.deleteOne(query);
      res.send(result);
    });

    // upDate user

    app.patch('/users', async (req, res) => {
      const user = req.body;
      const email = user.email;
      console.log(email);

      const query = { email };
      const updateData = {
        $set: {
          lastLogInAt: user.lastLogin,
        },
      };

      const result = await usersCatection.updateOne(query, updateData);
      res.send(result);
    });

    // Products

    // All product geting
    app.get('/coffees', async (req, res) => {
      const coffeesData = coffees.find();
      const data = await coffeesData.toArray();
      res.send(data);
    });

    // single product getting

    app.get('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const coffee = await coffees.findOne(query);
      res.send(coffee);
    });

    // update product
    app.put('/coffees/:id', async (req, res) => {
      const id = req.params.id;
      if (!ObjectId.isValid(id)) {
        return res.status(400).send({ error: 'Invalid ID format' });
      }
      const filter = { _id: new ObjectId(id) };
      const options = { upsert: true };
      const coffee = req.body;
      const updateData = {
        $set: {
          name: coffee.name,
          chef: coffee.chef,
          price: coffee.price,
          category: coffee.category,
          supplier: coffee.supplier,
          photoLink: coffee.photoLink,
          taste: coffee.taste,
        },
      };
      const result = await coffees.updateOne(filter, updateData, options);
      res.send(result);
    });

    // create new product
    app.post('/coffees', async (req, res) => {
      const coffee = req.body;
      const result = await coffees.insertOne(coffee);

      res.send(result);
    });

    // delete coffee

    app.delete('/coffee/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) };
      const result = await coffees.deleteOne(query);
      res.send(result);
    });

    // await client.db('admin').command({ ping: 1 });
    console.log(
      'Pinged your deployment. You successfully connected to MongoDB!'
    );
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

app.get('/', async (req, res) => {
  res.send('hollo');
});
app.listen(port, () => {
  console.log(`listening on port ${port}`);
});
