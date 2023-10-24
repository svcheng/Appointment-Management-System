const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const Store = require('./models/Store.js')
const mongoose = require('mongoose');

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))

// Connect to database
const password = "cssweng_5"
const uri = `mongodb+srv://CSSWENG_5:${password}@salon.ievwh4s.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to database.\n')
  })
  .catch(err => console.log(err))

app.get('/', (req, res) => {
    //res.send("Foo")
    res.redirect('/static/welcome')
})

app.get('/static/:page', async (req, res) => {
    const all = await Store.find({});
    console.log(all)

    res.render('layouts/' + req.params.page)
})

app.get('/login/:username/:password', async (req, res) => {
    // check if username already exists in the database
    const exists = await Store.findOne({ 'name': req.params.username, 'password': req.params.password });
    console.log(exists)

    if (exists) {
        res.status(200)
    }
    else {
        res.status(300)
    }
    res.end()
})

app.post('/register/:storeName/:password', async (req, res) => {    
    // check if storeName already exists in the database
    const exists = await Store.findOne({ 'name': req.params.storeName });
    console.log(exists)

    if (!exists) {
        // add store to database

        //console.log(mongoose.connection.readyState)
        const newStore = new Store({name: req.params.storeName, password: req.params.password})
        await newStore.save()
        res.status(200)
    }
    else {
        res.status(300)
    }
    res.end()
})

app.get('/admin/:storeName', (req, res) => {
    res.render('layouts/admin')
})

app.get('/search/:searchInput', async (req, res) => {
    // query database for all store names containing search input
    const results = await Store.find({
        "name": { $regex: req.params.searchInput, $options: "i"}
    }, 'name') 

    res.send({stores: results})
})


app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})