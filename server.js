const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Store = require('./models/Store.js')
const Appointment = require('./models/Store.js')


app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

// Connect to database
const password = "cssweng_5"
const uri = `mongodb+srv://CSSWENG_5:${password}@salon.ievwh4s.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to database.\n')
  })
  .catch(err => console.log(err))

app.get('/', (req, res) => {
    res.redirect('/static/welcome')
})

// render pages
app.get('/static/:page', async (req, res) => {
    const all = await Store.find({});
    console.log(all)

    const prepend0 = (d) => {return Math.floor(d / 10) == 0 ? '0' + String(d) : d}

    if (req.params.page === "appointment") {
        // get current local datetime 
        let datetime = new Date()
        let date = `${datetime.getFullYear()}-${prepend0(datetime.getMonth() + 1)}-${prepend0(datetime.getDate())}`
        let time = `${prepend0(datetime.getHours())}:${prepend0(datetime.getMinutes())}`
        console.log(`Current Datetime: ${date}T${time}`)
        res.render('layouts/' + req.params.page, {curDate: date + 'T' + time})
    }
    else {
        res.render('layouts/' + req.params.page)
    }
})

// admin log in 
app.get('/login/:username/:password', async (req, res) => {
    // check if username already exists in the database
    const exists = await Store.findOne({ 'name': req.params.username, 'password': req.params.password });

    if (exists) {
        res.status(200)
    }
    else {
        res.status(300)
    }
    res.end()
})

// register salon
app.post('/register/:storeName/:password', async (req, res) => {    
    // check if storeName already exists in the database
    const exists = await Store.findOne({ 'name': req.params.storeName });

    if (!exists) {
        // add store to database
        const newStore = new Store({name: req.params.storeName, password: req.params.password})
        await newStore.save()
        res.status(200)
        res.end()
    }
    else {
        res.status(300)
        res.end()
    }
})

// send admin page
app.get('/admin/:storeName', async(req, res) => {
    const salonName = req.params.storeName
    const store = await Store.findOne({name: salonName})
    const services = store.services
    const appointments = ['Appointment1', 'Appointment2', 'Appointment3'] // placeholder for now

    res.render('layouts/admin', {salonName: salonName, services: services, appointments: appointments})
})

// add service 
app.put('/addService/:storeName/:service/:duration', async (req, res) => {
    const store = await Store.findOne({ 'name': req.params.storeName });

    if (!store.services.includes(req.params.service)) {
        store.services.push(req.params.service)
        store.serviceDurations.push(req.params.duration)
    }
    await store.save()
    res.status(200)
    res.end()
})

// search salon
app.get('/search/:searchInput', async (req, res) => {
    // query database for all store names containing search input
    const results = await Store.find({
        "name": { $regex: req.params.searchInput, $options: "i"}
    }, 'name') 

    res.send({stores: results})
})

// returns all services and service durations of a salon
app.get('/services/:salon', async (req, res) => {
    const salon = await Store.findOne({'name': req.params.salon})

    const response = {
        services: salon.services, 
        durations: salon.serviceDurations
    }

    res.send(response)
})

// books an appointment if not conflicting
app.post('/bookAppointment', async (req, res) => {
    console.log(req.body)

    const salon = await Store.findOne({'name': req.body.salon}, 'services serviceDurations')
    let duration
    for (let i=0; i < salon.services.length; i+=1) {
        if (salon.services[i] == req.body.service) {
            duration = salon.serviceDurations[i]
        }
    }

    let endDate = req.body.dateTime
    if (duration) { // compute end time
        let newYear = Number(req.body.dateTime.substring(0, 4))
        let newMonth = Number(req.body.dateTime.substring(5, 7))
        let newDay = Number(req.body.dateTime.substring(8, 10))
        let newHour = Number(req.body.dateTime.substring(11, 13))
        let newMin = Number(req.body.dateTime.substring(14, 16))
        
        const xtraHours = Math.floor(duration / 60)
        const xtraMins = duration - (hours * 60)

        // add hours
        newHour = (newHour + xtraHours) % 24
        if (origHours + xtraHours >= 24) {

        }
    }
    console.log(req.body.dateTime, endDate)
    const newAppointment = new Appointment({
        storeName: req.body.salon,
        bookerName: req.body.customerName,
        bookerPhoneNum: req.body.customerPhone,

        startDatetime: req.body.dateTime,
        endDatetime: endDate,
        service: req.body.service
    })
    //console.log(newAppointment)
    await newAppointment.save()

    let data = await Appointment.find({})
    console.log(data)
})

app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})