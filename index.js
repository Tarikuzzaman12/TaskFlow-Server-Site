const express = require("express");
const cors = require("cors");
const { MongoClient, ObjectId } = require("mongodb");
require("dotenv").config();

const app = express();
const port = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// MongoDB connection
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.uuqn6.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0`;
const client = new MongoClient(uri);

async function run() {
    try {
        await client.connect();
        console.log(" Connected to MongoDB");

        const db = client.db("TaskFlow");
        const tasksCollection = db.collection("tasks");

        // 👉 Get all tasks
        app.get("/tasks", async (req, res) => {
            const tasks = await tasksCollection.find().toArray();
            res.send(tasks);
        });

        // 👉 Add a new task
        app.post("/tasks", async (req, res) => {
            const task = req.body;
            const result = await tasksCollection.insertOne(task);
            res.send({ ...task, _id: result.insertedId });
        });

        // 👉 Update task (Full Update - for Edit Form & DnD both)
        app.put("/tasks/:id", async (req, res) => {
            const { id } = req.params;
            const updatedData = req.body;
            const result = await tasksCollection.findOneAndUpdate(
                { _id: new ObjectId(id) },
                { $set: updatedData },
                { returnDocument: "after" }  // Return the updated document
            );
            res.json(result.value);  // Send back updated task
        });

        // 👉 Delete a task
        app.delete("/tasks/:id", async (req, res) => {
            const id = req.params.id;
            await tasksCollection.deleteOne({ _id: new ObjectId(id) });
            res.send({ message: "Task deleted successfully" });
        });

        // Start server
        app.listen(port, () => {
            console.log(`Server running on port ${port}`);
        });
    } catch (error) {
        console.error(" MongoDB connection failed", error);
    }
}

run();
