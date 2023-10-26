const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Store = require('./models/Store.js')
const Appointment = require('./models/Appointment.js')


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


// HELPER FUNCTIONS
const prepend0 = (d) => {return Math.floor(d / 10) == 0 ? '0' + String(d) : d}

// converts date object into 'YYYY-MM-DDTHH:MM' format in local time
const localTimeString = (datetime) => {
    datetime = new Date(datetime)
    return `${datetime.getFullYear()}-${prepend0(datetime.getMonth() + 1)}-${prepend0(datetime.getDate())}T${prepend0(datetime.getHours())}:${prepend0(datetime.getMinutes())}`
}

// Given an appointment that starts at <dateTime> and lasts <duration> minutes, returns the string representation of the end date-time
// dateTime is a string representation of the start date-time
const computeEnd = (dateTime, duration) => {
    let end = new Date(dateTime)
    end.setMinutes(end.getMinutes() + duration)

    return end.toString()
}

// ROUTES
app.get('/', (req, res) => {
    res.redirect('/static/welcome')
})

// render pages
app.get('/static/:page', async (req, res) => {
    if (req.params.page === "appointment") {
        // get current local datetime 
        let datetime = new Date().toString()
        res.render('layouts/' + req.params.page, {curDate: localTimeString(datetime)})
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
    let appointments = await Appointment.find({"storeName": salonName})

    appointments = appointments.map((a) => {
        let start = localTimeString(a.startDatetime)
        let end = localTimeString(a.endDatetime)
        return {
           service: a.service,
           bookerName: a.bookerName,
           bookerPhoneNum: a.bookerPhoneNum,
           startDatetime: `${start.substring(0, 10)}, ${start.substring(11, 16)}`,
           endDatetime: `${end.substring(0, 10)}, ${end.substring(11, 16)}`
        }
    })

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
    const salon = await Store.findOne({'name': req.body.salon}, 'services serviceDurations')
    let duration
    for (let i=0; i < salon.services.length; i+=1) {
        if (salon.services[i] == req.body.service) {
            duration = salon.serviceDurations[i]
        }
    }

    const endDate = computeEnd(req.body.dateTime, duration) 

    const newAppointment = new Appointment({
        storeName: req.body.salon,
        bookerName: req.body.customerName,
        bookerPhoneNum: req.body.customerPhone,

        startDatetime: req.body.dateTime,
        endDatetime: endDate,
        service: req.body.service
    })
    await newAppointment.save()
})

app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})