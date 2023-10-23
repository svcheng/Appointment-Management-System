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
mongoose.connect(uri, {
    useNewUrlParser: true,
    useUnifiedTopology: true
  })
  .then(() => {
    console.log('Successfully connected to database.\n')
  })
  .catch(err => console.log(err))

app.get('/', (req, res) => {
    //res.send("Foo")
    res.redirect('/static/welcome')
})

app.get('/static/:page', (req, res) => {
    res.render('layouts/' + req.params.page)
})

app.get('/admin', (req, res) => {
    res.render('layouts/admin')
})

app.get('/login/:username/:password', (req, res) => {
    // query database

    // send response
})

app.get('/search/:searchInput', (req, res) => {
    // query database

    // send response
})

app.post('/register/:storeName/:password', async (req, res) => {    
    // check if storeName already exists in the database
    const exists = await Store.findOne({ 'storeName': req.params.storeName });
    console.log(exists)

    if (!exists) {
        // add store to database

        console.log(mongoose.connection.readyState)
        // const newStore = new Store({name: req.params.storeName, password: req.params.password})
        // await newStore.save()

        await Store.create({name: req.params.storeName, password: req.params.password})

        //console.log("Added " + String(newStore))
        res.status(200)
    }
    else {
        res.status(300)
    }
    res.end()
    return
})


app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})