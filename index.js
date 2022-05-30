const express = require('express');
const { MongoClient } = require('mongodb');
const ObjectId = require('mongodb').ObjectId;

require('dotenv').config();
const cors = require('cors');

const app = express();
const port = process.env.PORT || 5000;

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.sqkcw.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

// middleware
app.use(cors());
app.use(express.json());

async function run() {
    try {
        await client.connect();
        const database = client.db('tourPlan');
        const servicesCollection = database.collection('services');
        const orderCollection = database.collection('orders');
        // console.log('connected to database');

        // GET API
        app.get('/services', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        })

        // GET SINGLE SERVICE 
        app.get('/services/:id', async (req, res) => {
            const id = req.params.id;
            console.log('getting specific service', id);
            const query = { _id: ObjectId(id) };
            const service = await servicesCollection.findOne(query);
            res.json(service);
        })

        // POST API
        app.post('/services', async (req, res) => {
            const service = req.body;
            console.log('hit the post api', service);
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result)
        });

        // Show Orders API In UI By GET
        app.get('/orders', async (req, res) => {
            const cursor = orderCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Post Orders API In Database By POST
        app.post('/orders', async (req, res) => {
            const newOrder = req.body;
            const result = await orderCollection.insertOne(newOrder);
            console.log('got new order', req.body);
            console.log('added order', result);
            res.json(result);
        });

        app.post('/myOrder', async (req, res) => {
            const email = []
            const getEmail = req.body.email;
            email.push(getEmail)
            console.log(email);
            const query = { userEmail: { $in: email } }
            const services = await orderCollection.find(query).toArray();
            res.json(services)
        })

        // Delete API for myOrder and manageOrder
        app.delete('/myOrder/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) }
            const result = await orderCollection.deleteOne(query)
            console.log(result);
            res.json(result)
        })

        // GET Order By Specific Email ID (working codes just didn't use here may be nextTime)
        // app.get('/myOrders', async (req, res) => {
        //     const email = req.query.email;
        //     const query = { userEmail: email }
        //     const cursor = orderCollection.find(query);
        //     console.log('cc', cursor)
        //     const myOrder = await cursor.toArray();
        //     console.log('myorder', myOrder)
        //     res.json(myOrder);
        // })

    }
    finally {

    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send('Tourism Server is Running');
});

app.listen(port, () => {
    console.log('Tourism Server running at port', port);
})