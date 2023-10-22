const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')


app.set('view engine', 'hbs')

app.use(express.static(path.join(__dirname, 'public')))

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

app.get('search/:searchInput', (req, res) => {
    // query database

    // send response
})

app.post('register:username/:password/:storeName', (req, res) => {
    // check if username or storeName already exists in the database

        // add store to database
    
    // send response
})


app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})