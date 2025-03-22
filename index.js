const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

// const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ome3u.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const uri = `${process.env.DB_uri}`


const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    const userCollection = client.db('ezyTicket').collection('users')
    const eventCollection = client.db('ezyTicket').collection('events')
    const travelCollection = client.db('ezyTicket').collection('travels')

    //  -------------User API-------------
    app.post('/api/user', async (req, res) => {
      const user = res.body;
      const query = { email: user.email }
      const existingUser = await userCollection.findOne(query);
      if (existingUser) {
        return res.send({ message: 'User already exists', insertedId: null })
      }
      const result = await userCollection.post(user);

      res.send(result)

    })

    // ------------Events API-------------
    app.get("/", (req, res) => {
      res.send("EzyTicket server is Running");
    });

    app.get("/events", async (req, res) => {
      if (!eventCollection) {
        return res.status(500).send({ message: "Database not initialized" });
      }
      try {
        const events = await eventCollection.find({}).toArray();
        res.send(events);
      } catch (error) {
        console.error("Error fetching events:", error);
        res.status(500).send({ message: "Failed to fetch events", error });
      }
    });

    app.get("/events/:id", async (req, res) => {
      const id = req.params.id;
      console.log(id);
      const query = { _id: new ObjectId(id) }
      const result = await eventCollection.findOne(query);
      res.send(result)
    });


    // -------------Tavel API----------------

    app.get("/api/bus", async (req, res) => {
      const result = await travelCollection.find().toArray()
      res.send(result)
    })

    // search api 
    app.get("/api/stand", async (req, res) => {
      const { stand1, stand2 } = req.query; 
        if (!stand1 || !stand2) {
            return res.status(400).json({ message: "Both stand1 and stand2 are required" });
        }
        const allBus = await travelCollection.find().toArray();
        const result = allBus.filter(bus =>
          bus.busStands.includes(stand1) && bus.busStands.includes(stand2)
        );
        res.send(result); 
    })
    // -------------Tavel API End----------------

    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
  } finally {
    // Ensures that the client will close when you finish/error.
    // await client.close();
  }
}
run().catch(console.dir);



app.listen(port, () => {
  console.log(`EzyTicket is running on ${port}`);
});
