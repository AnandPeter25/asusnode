let express = require('express');
let app = express();
/// for reading value form .env 
let dotenv = require('dotenv');
dotenv.config()
// for logging purposes
let morgan = require('morgan');
let fs = require('fs');
let port = process.env.PORT || 9800;
let cors = require('cors');
let mongo = require('mongodb');
let MongoClient = mongo.MongoClient;
let mongoUrl = "mongodb+srv://admin:admin123@cluster0.kb068wp.mongodb.net/?retryWrites=true&w=majority";
let bodyParser = require('body-parser')
let db;


// middleware
app.use(morgan('short',{stream:fs.createWriteStream('./app.logs')}))
app.use(cors());
app.use(bodyParser.urlencoded({extended:true}))
app.use(bodyParser.json())

app.get('/',(req,res) => {
    res.send('the message that i send in express app')
})

// list of quicksearch
app.get('/qsearch',(req,res) => {
    db.collection('quicksearch').find().toArray((err,result)=>{
        if(err) throw err ;
        res.send(result)
    })
})

// list of product
// app.get('/product',(req,res) => {
//     db.collection('data').find().toArray((err,result)=>{
//         if(err) throw err;
//         res.send(result)
//     })
// })

// list of quick search
app.get('/quick',(req,res) => {
    db.collection('asusquick').find().toArray((err,result)=>{
        if(err) throw err;
        res.send(result)
    })
})

// https://asusnode.onrender.com/product?quickid=1
// list of products
app.get('/product',(req,res) => {
    let query = {};
    let quickid = Number(req.query.quickid);
    if(quickid){
        query={quicktype_id:quickid}
    }
    db.collection('originallist').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

// list of productslist 
app.get('/productlist',(req,res) => {
    let query = {};
    let quickid = Number(req.query.quickid);
    if(quickid){
        query={quicktype_id:quickid}
    }
    db.collection('prodlist').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//product details
app.get('/details/:id',(req,res) => {
    //let id = mongo.ObjectId(req.params.id)
    let id = Number(req.params.id)
    db.collection('fulldetails').find({type_id:id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

// //sub product details
// app.get('/sub/:id',(req,res) => {
//     let id = Number(req.params.id)
//     db.collection('data').find({sub_product_id:id}).toArray((err,result) =>{
//         if(err) throw err;
//         res.send(result)
//     })
// })


// //menu details
app.post('/menuItem',(req,res) => {
    if(Array.isArray(req.body.id)){
        db.collection('menu').find({type_id:{$in:req.body.id}}).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Inavlid Input')
    }
})

//product place order
app.get('/menu/:id',(req,res) => {
    let id = Number(req.params.id)
    db.collection('menu').find({type_id:id}).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

app.post('/placeOrder',(req,res) => {
    console.log(req.body);
    db.collection('orders').insert(req.body,(err,result) => {
        if(err) throw err;
        res.send('Order Placed')
    })
})


// //oderItem details
app.post('/oderItem',(req,res) => {
    if(Array.isArray(req.body.id)){
        db.collection('data').find({product_id:{$in:req.body.id}}).toArray((err,result) =>{
            if(err) throw err;
            res.send(result)
        })
    }else{
        res.send('Inavlid Input')
    }
})

//list of order
app.get('/orders',(req,res) => {
    let email = req.query.email
    let query = {};
    if(email){
       // query={email:email}
        query={email}
    }
    db.collection('orders').find(query).toArray((err,result) =>{
        if(err) throw err;
        res.send(result)
    })
})

//update order
app.put('/updateOrder/:id',(req,res) => {
    let oid = Number(req.params.id);
    db.collection('orders').updateOne(
        {orderid:oid},
        {
            $set:{
                "status":req.body.status,
                "bank_name":req.body.bank_name,
                "date":req.body.date
            }
        },(err,result) => {
            if(err) throw err;
            res.send('Order Updated')
        }
    )
})

//deleteOrder
app.delete('/deleteOrder/:id',(req,res) => {
    let _id = mongo.ObjectId(req.params.id);
    db.collection('orders').deleteOne({_id},(err,result) => {
        if(err) throw err;
        res.send('Order Deleted')
    })
})

//connection with mongo
MongoClient.connect(mongoUrl,(err,client)=>{
    if(err) console.log(`Error while connecting`);
    db = client.db('asusdata')
    app.listen(port,() => {
        console.log(`Listing to port ${port}`)
    })
})