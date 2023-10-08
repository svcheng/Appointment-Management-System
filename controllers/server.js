const express = require('express')
const hbs = require('hbs')
const app = express()



app.set('view engine', 'hbs')

app.use(express.static('public'))


app.get('/', (req, res) => {
    res.send("Foo")
})



// CONNECT TO DATABASE
app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})