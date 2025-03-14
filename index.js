const express = require("express");
const cors = require("cors");
require("dotenv").config();
const app = express();
const port = process.env.PORT || 3000;
const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");

//middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ygrer.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});
let eventCollection;
async function run() {
  try {
    await client.connect();
    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log(
      "Pinged your deployment. You successfully connected to MongoDB!"
    );
    const database = client.db("EzyTicket");
    eventCollection = database.collection("Events");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);

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
  const { id } = req.params;

  if (!ObjectId.isValid(id)) {
    return res.status(400).send({ message: "Invalid Event ID" });
  }

  try {
    const eventData = await eventCollection.findOne({ _id: new ObjectId(id) });

    if (!eventData) {
      return res.status(404).send({ message: "Event not found" });
    }
    res.send(eventData);
  } catch (error) {
    console.error("Error fetching event details:", error);
    res.status(500).send({ message: "Failed to fetch Event details", error });
  }
});

app.listen(port, () => {
  console.log(`EzyTicket is running on ${port}`);
});
