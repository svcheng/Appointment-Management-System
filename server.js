const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Store = require('./models/Store.js')
const Appointment = require('./models/Appointment.js')
const Pending = require('./models/Pending.js')
const crypto = require('crypto');
const bcrypt = require('bcrypt');

app.set('view engine', 'hbs')
app.use(express.static(path.join(__dirname, 'public')))
app.use(express.json())

const StaticController = require('./controllers/staticController');
const ServiceController = require('./controllers/serviceController');
const AppointmentController = require('./controllers/appointmentController');
const EmailController = require('./controllers/emailController');
const SearchController = require('./controllers/searchController');
const AdminController = require('./controllers/adminController');


hbs.registerHelper('timePresentable', (string) => {
    // let str = localTimeString(string)
    // return `${str.substring(0, 10)}, ${str.substring(11, 16)}`
    return string
})

// Connect to database
const password = "cssweng_5"
const uri = `mongodb+srv://CSSWENG_5:${password}@salon.ievwh4s.mongodb.net/?retryWrites=true&w=majority`
mongoose.connect(uri)
  .then(() => {
    console.log('Successfully connected to database.\n')
  })
  .catch(err => console.log(err))

// ROUTES
app.get('/', StaticController.welcomePage);

// render pages
app.get('/static/:page', StaticController.renderPage);

// admin log in 
app.get('/login/:username/:password', AdminController.login)

// register salon
app.post('/register/:storeName/:password/:receivedEmail/:phone', async (req, res) => {    
    // check if storeName already exists in the database
    const exists = await Store.findOne({ 'name': req.params.storeName });
   
    if (!exists) {
        // add store to database
        const newStore = new Store({name: req.params.storeName, password: req.params.password, email: req.params.receivedEmail, phone: req.params.phone})
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
app.get('/admin/:storeName', StaticController.adminPage)


// add service 
app.put('/addService/:storeName/:service/:duration', ServiceController.addService)

//delete service 
app.delete('/deleteService/:storeName/:service', async (req, res) => {
    try {
       
        const store = await Store.findOne({ 'name': req.params.storeName });

        // Find the index of the service in the array
        const serviceIndex = store.services.indexOf(req.params.service);

        if (serviceIndex !== -1) {
            // Remove the service and its duration
            store.services.splice(serviceIndex, 1);
            store.serviceDurations.splice(serviceIndex, 1);

            // Save the updated store
            await store.save();

            res.status(200).end();
        } else {
            // Service not found
            res.status(404).json({ error: 'Service not found' });
        }
    } catch (error) {
        // Handle errors
        res.status(500).json({ error: 'Internal Server Error' });
    }
});



// search salon
app.get('/search/:searchInput', async (req, res) => {
    // query database for all store names containing search input
    const results = await Store.find({
        "name": { $regex: req.params.searchInput, $options: "i"}
    }, 'name') 

    res.send({stores: results})
})

// returns all services and service durations of a salon
app.get('/services/:salon', ServiceController.getServices);

// display salon schedule
app.get('/schedules/:salon', AdminController.displaySalonSchedule);

//edits service details in db
app.put('/editService/:storeName/:service/:newService/:newDuration', ServiceController.editService);

// books an appointment if not conflicting
app.post('/bookAppointment', AppointmentController.bookAppointment)

//puts appointment into the pending collection to await to be accepted or rejected
app.post('/pendingAppointment', AppointmentController.pendingAppointment)

app.post('/approveAppointment', AppointmentController.approveAppointment);

app.post('/deletePendingAppointment', AppointmentController.deletePendingAppointment);

app.delete('/deleteAppointment', AppointmentController.deleteAppointment);

//Coalesces and send Email + gets randomString from register.js
app.post('/sendData/:receivedEmail/:codeVerify', EmailController.sendDataEmail)

//Email Notification: send to the StoreOwner about a sent appointment
app.post('/appointmentEmail/:salon/:customerName/:customerPhone/:dateTime/:service', EmailController.appointmentNotificationEmail);

//This Email is sent to pending.customerEmail (if NOT null) upon being approved or declined. Just make it so this is only called if customerEmail != null
app.post('/emailApproveOrDecline/:salon/:customerName/:customerPhone/:dateTime/:service/:result', EmailController.approveOrDeclineEmail);

// edit working hours
app.put('/editWorkingHours/:salonName/:start/:end', AdminController.editWorkingHours)

// edit working days
app.put('/editWorkingDays/:salonName/:days', AdminController.editWorkingDays)

//Get salon work schedule
app.get('/workSchedule/:salonName', AdminController.getWorkSchedule)

//Email Notification: sent to client (if they have an email) upon an approved appointment being deleted
app.post('/emailDeleted/:salon/:customerName/:customerPhone/:dateTime/:service/:clientEmail', EmailController.deletedAppointmentEmail)

let port = process.env.PORT || 3000
app.listen(port, () =>{
    console.log(`Hello! Listening at port: ${port}`)
})
