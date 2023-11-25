const express = require('express')
const hbs = require('hbs')
const app = express()
const path = require('path')
const mongoose = require('mongoose');
const Store = require('./models/Store.js')
const Appointment = require('./models/Appointment.js')
const Pending = require('./models/Pending.js')
const nodemailer = require('nodemailer');
const crypto = require('crypto');
const bcrypt = require('bcrypt');

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
    const exists = await Store.findOne({ 'name': req.params.username});

    if (exists) {
        const userPassword = req.params.password;
        const hashedPassword = exists.password;
        const passwordMatch = await bcrypt.compare(userPassword, hashedPassword);
        if(passwordMatch){
            res.status(200)
        } 
        else {
            res.status(300)
        }
    }
    else {
        res.status(300)
    }
    res.end()
})

// register salon
app.post('/register/:storeName/:password/:receivedEmail', async (req, res) => {    
    // check if storeName already exists in the database

    const exists = await Store.findOne({ 'name': req.params.storeName });
   
    if (!exists) {
        // add store to database
        const newStore = new Store({name: req.params.storeName, password: req.params.password, email: req.params.receivedEmail})
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
    
    // Delete finished appointments
    await Appointment.deleteMany({'endDatetime': {$lt: new Date()}})

    let [appointments, pending] = await Promise.all([
        Appointment.find({"storeName": salonName}),
        Pending.find({"storeName": salonName})
    ])
    
    // Sort appointments by start dates
    appointments = appointments.sort((a, b) => {
        return a.startDatetime - b.startDatetime
    })

    pendingAppointments = pending.sort((a, b) => {
        return a.startDatetime - b.startDatetime
    })

    appointments = appointments.map((a) => {
        let start = localTimeString(a.startDatetime)
        let end = localTimeString(a.endDatetime)
        return {
            service: a.service,
            bookerName: a.bookerName,
            bookerPhoneNum: a.bookerPhoneNum,
            startDatetime: `${start.substring(0, 10)}, ${start.substring(11, 16)}`,
            endDatetime: `${end.substring(0, 10)}, ${end.substring(11, 16)}`,
            clientEmail: a.clientEmail
        }
    })

    pending = pending.map((a) => {
        let start = localTimeString(a.startDatetime)
        let end = localTimeString(a.endDatetime)
        return {
            service: a.service,
            bookerName: a.bookerName,
            bookerPhoneNum: a.bookerPhoneNum,
            startDatetime: `${start.substring(0, 10)}, ${start.substring(11, 16)}`,
            endDatetime: `${end.substring(0, 10)}, ${end.substring(11, 16)}`,
            clientEmail: a.clientEmail
        }
    })
    
    let workingHours
    if (store.workingHoursStart === -1 || store.workingHoursEnd === -1) {
        workingHours = "Not Set"
    } else {
        workingHours = `${store.workingHoursStart}-${store.workingHoursEnd}`
    }
    
    res.render('layouts/admin', {salonName: salonName, services: services, appointments: appointments, pending: pending, workingHours: workingHours})
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

//delete service 
app.delete('/deleteService/:storeName/:service', async (req, res) => {
    try {
        const store = await Store.findOne({ 'name': req.params.storeName });

        if (store.services.includes(req.params.service)) {
            const serviceIndex = store.services.indexOf(req.params.service);
            store.services.splice(serviceIndex, 1);
            store.serviceDurations.splice(serviceIndex, 1);

            await store.save();

            res.status(200).end();
        } else {
            res.status(404).json({ error: 'Service not found in the store' });
        }
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: 'Internal server error' });
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
app.get('/services/:salon', async (req, res) => {
   
    const salon = await Store.findOne({'name': req.params.salon})
    
    const response = {
        services: salon.services, 
        durations: salon.serviceDurations,
        email: salon.email
    }

    res.send(response)
});

app.get('/schedules/:salon', async (req, res) => {
    try {
        const appointments = await Appointment.find({'storeName': req.params.salon});
        
        if (!appointments) {
            console.log("No appointment found");
            return res.status(404).send("No appointment found");
        }

        const response = appointments.map(appointment => ({
            service: appointment.service, 
            start: appointment.startDatetime,
            end: appointment.endDatetime,
            bookerName: appointment.bookerName,
            bookerPhoneNum: appointment.bookerPhoneNum
        }));

        // console.log("Response: ", response)
        res.send(response)
    } catch (error) {
        console.error("Error:", error);
        res.status(500).send("Internal Server Error");
    }
});


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

//puts appointment into the pending collection to await to be accepted or rejected
app.post('/pendingAppointment', async (req, res) => {
    const salon = await Store.findOne({'name': req.body.salon}, 'services serviceDurations')
    let duration
    for (let i=0; i < salon.services.length; i+=1) {
        if (salon.services[i] == req.body.service) {
            duration = salon.serviceDurations[i]
        }
    }

    const endDate = computeEnd(req.body.dateTime, duration) 

    const newPendingAppointment = new Pending({
        storeName: req.body.salon,
        bookerName: req.body.customerName,
        bookerPhoneNum: req.body.customerPhone,

        startDatetime: req.body.dateTime,
        endDatetime: endDate,
        service: req.body.service,

        clientEmail: req.body.clientEmail
    })
    await newPendingAppointment.save()

    

    res.send('Appointment request sent to pending collection.');
})

app.post('/approveAppointment', async (req, res) => {
    const { salon, customerName, customerPhone, dateTime, service } = req.body;

    // Add the approved appointment to the appointments collection
    const salonInfo = await Store.findOne({ name: salon }, 'services serviceDurations');
    let duration;
    for (let i = 0; i < salonInfo.services.length; i += 1) {
        if (salonInfo.services[i] == service) {
            duration = salonInfo.serviceDurations[i];
        }
    }
    const endDate = computeEnd(dateTime, duration);

    //find email if it exists
    let email = await Pending.findOne({
        storeName: salon, bookerName: customerName,
        bookerPhoneNum: customerPhone,
        startDatetime: dateTime,
        endDatetime: endDate,
        service: service}, 
        'clientEmail')
    if(email){
        const newAppointment = new Appointment({
            storeName: salon,
            bookerName: customerName,
            bookerPhoneNum: customerPhone,
            startDatetime: dateTime,
            endDatetime: endDate,
            service: service,
            clientEmail: email.clientEmail
        });
        await newAppointment.save();
    }else{
        const newAppointment = new Appointment({
            storeName: salon,
            bookerName: customerName,
            bookerPhoneNum: customerPhone,
            startDatetime: dateTime,
            endDatetime: endDate,
            service: service
            
        });
        await newAppointment.save();
    }
    

    

    // Delete the pending appointment from the pendings collection
    await Pending.findOneAndDelete({
        storeName: salon,
        bookerName: customerName,
        bookerPhoneNum: customerPhone,
        startDatetime: dateTime,
        service: service
    });

    res.send('Appointment approved and moved to appointments collection.');
});

app.post('/deletePendingAppointment', async (req, res) => {
    const { salon, customerName, customerPhone, dateTime, service, clientEmail } = req.body;

    const deleted = await Pending.findOneAndDelete({
        storeName: salon,
        bookerName: customerName,
        bookerPhoneNum: customerPhone,
        startDatetime: dateTime,
        service: service,
        clientEmail: clientEmail === "" ? null : clientEmail
    });

    console.log(deleted)
    res.end();
});

app.delete('/deleteAppointment', async (req, res) => {
    const deletedAppointment = await Appointment.findOneAndDelete({
        storeName: req.body.salon,
        bookerName: req.body.customerName,
        bookerPhoneNum: req.body.customerPhone,
        startDatetime: req.body.dateTime,
        service: req.body.service,
        clientEmail: req.body.clientEmail === "" ? null : req.body.clientEmail
    });

    // console.log(deletedAppointment)
    res.end()
})

//Details for Email
const transporter = nodemailer.createTransport({
    service:'gmail',
    host: "smtp.gmail.com",
    port: 465,
    secure: false,
    auth: {
      user: 'appointmentsserver@gmail.com',
      pass: 'vflm pnvr dkbs xxmh'
    },
    tls: {
      rejectUnauthorized: false
    }
  });

//Sending an Email
const sendMail = async (transporter, mailOptions) =>{
    try{
      await transporter.sendMail(mailOptions);
      console.log('Email has been sent!');
    } catch (error){
      console.error(error);
    }
  }

//Coalesces and send Email + gets randomString from register.js
app.post('/sendData/:receivedEmail/:codeVerify', async (req) =>{
    const receivedEmail = req.params.receivedEmail;
    let codeConfirm = req.params.codeVerify;
    const mailOptions = {
        from: {
          name: "Server Appointments",
          address: 'appointmentsserver@gmail.com'
        }, // sender address
        to: receivedEmail, // list of receivers
        subject: "Account Authentication", // Subject line
        html: "<p>Your code is: " + codeConfirm, 
      }
    sendMail(transporter, mailOptions);
})

//Email Notification: send to the StoreOwner about a sent appointment
app.post('/appointmentEmail/:salon/:customerName/:customerPhone/:dateTime/:service', async (req) =>{
    const exists = await Store.findOne({ 'name': req.params.salon });

    if(exists){
        const mailOptions = {
            from: {
              name: "Appointment Notification to" + req.params.salon,
              address: 'appointmentsserver@gmail.com'
            }, // sender address
            to: exists.email, // list of receivers
            subject: "New Appointment", // Subject line
            //Content of Letter; coded directly here to prevent error messages if we were to instead read from an external HTML file
            html: `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td>
                    <p>Greetings!</p>
                    <p>You have a pending appointment to approve/decline:</p>
                    </td></tr><tr><td>
                    <table width="100%" cellpadding="5" cellspacing="0" border="1">
                        <tr>
                        <td><strong>Customer's Name:</strong></td>
                        <td>${req.params.customerName}</td>
                        </tr>
                        <tr>
                        <td><strong>Customer's Phone:</strong></td>
                        <td>${req.params.customerPhone}</td>
                        </tr>
                        <tr>
                        <td><strong>Time:</strong></td>
                        <td>${req.params.dateTime}</td>
                        </tr>
                        <tr>
                        <td><strong>Service:</strong></td>
                        <td>${req.params.service}</td>
                        </tr>
                    </table>
                    </td></tr><tr><td>
                    <p>Please head to your respective admin page to respond!</p>
                </td></tr>
            </table>
            `, 
          }
        sendMail(transporter, mailOptions);
    } else {
        console.error(error);
    }
});

//This Email is sent to pending.customerEmail (if NOT null) upon being approved or declined. Just make it so this is only called if customerEmail != null
app.post('/emailApproveOrDecline/:salon/:customerName/:customerPhone/:dateTime/:service/:result', async (req, res) =>{
    console.log("Trying to send email to appointment peep");
    //req.params.result is just "Approved" or "Declined" as a string to include in the email ^
    const existsStore = await Store.findOne({ 'name': req.params.salon });
    const salonOwnerEmail = existsStore.email;

    console.log("Trying to find appointment in pendings")
    let existsPending = await Pending.findOne({ 'storeName': req.params.salon, 'bookerName': req.params.customerName})
    if(!existsPending){
        console.log("Not found in pendings, trying to find it in appointments");
        existsPending = await Appointment.findOne({ 'storeName': req.params.salon, 'bookerName': req.params.customerName})
        if(existsPending){
            console.log("Appointment Found!\n Appointment: "+existsPending);
        }else{
            console.log("Appointment not found");
        }
    }else{
        console.log("Appointment Found!\n Appointment: " + existsPending);
    }
    // console.log("Check before email check\n ClientEmail:" )
    if(existsPending.clientEmail){
        const mailOptions = {
            from: {
                name: "Appointment Notification to " + req.params.salon,
                address: 'appointmentsserver@gmail.com'
            }, // sender address
            to: existsPending.clientEmail, // list of receivers
            subject: `Your Appointment to ${req.params.salon} has been ${req.params.result}`, // Subject line
            //Content of Letter; coded directly here to prevent error messages if we were to instead read from an external HTML file
            html: `
            <table width="100%" cellpadding="0" cellspacing="0" border="0">
                <tr><td>
                    <p>${req.params.salon} has responded to your pending appointment: ${req.params.result}!</p>
                    <p>Here were the details of your appointment:</p>
                    </td></tr><tr><td>
                    <table width="100%" cellpadding="5" cellspacing="0" border="1">
                        <tr>
                        <td><strong>Customer's Name:</strong></td>
                        <td>${req.params.customerName}</td>
                        </tr>
                        <tr>
                        <td><strong>Customer's Phone:</strong></td>
                        <td>${req.params.customerPhone}</td>
                        </tr>
                        <tr>
                        <td><strong>Time:</strong></td>
                        <td>${req.params.dateTime}</td>
                        </tr>
                        <tr>
                        <td><strong>Service:</strong></td>
                        <td>${req.params.service}</td>
                        </tr>
                    </table>
                    </td></tr><tr><td>
                    <p>If you have any further questions, please contact the salon owner at ${salonOwnerEmail}.</p>
                </td></tr>
            </table>
            `, 
            }
        sendMail(transporter, mailOptions);
    }else{
        console.log("Email not sent to appointment peep");
    }
    res.end()
});

// edit working hours
app.put('/editWorkingHours/:salonName/:start/:end', async (req, res) => {
    const store = await Store.findOne({ 'name': req.params.salonName });

    store.workingHoursStart = req.params.start
    store.workingHoursEnd = req.params.end
    store.save()
    res.status(200)
    res.end()
})

// checks if appointment is withing working hours 
app.get('/withinWorkingHours/:salonName/:service/:startDate', async (req, res) => {
    const salon = await Store.findOne({ 'name': req.params.salonName })
    let workingHoursStart = salon.workingHoursStart
    let workingHoursEnd = salon.workingHoursEnd 

    if (workingHoursStart === -1 || workingHoursEnd === -1) {
        res.status(300)
        res.end()
    }

    let duration
    for (let i=0; i < salon.services.length; i+=1) {
        if (salon.services[i] == req.body.service) {
            duration = salon.serviceDurations[i]
        }
    }

    const endDate = new Date(computeEnd(req.params.startDate, duration))
    let appointmentStartHour = new Date(req.params.startDate).getHours()
    let appointmentEndHour = endDate.getHours()
    if (endDate.getMinutes() > 0) {
        appointmentEndHour = (appointmentEndHour + 1) % 24
    }

    // returns whether each hour in hours is within the interval [start, end] 
    const within = (hours, interval) => {
        for (let i=0; i < hours.length; i+=1) {
            if (hours[i] > interval[1] || hours[i] < interval[0]) {
                return false
            }
        }

        return true
    }

    workingHoursEnd = workingHoursEnd === 0 ? 24 : workingHoursEnd
    const appointmentRange = [appointmentStartHour, appointmentEndHour]
    if (workingHoursStart < workingHoursEnd) {
        appointmentEndHour = appointmentEndHour === 0 ? 24 : appointmentEndHour
        if (within([appointmentStartHour, appointmentEndHour], [workingHoursStart, workingHoursEnd])) {
            res.status(200)
            res.end()
        }
    } else {
        if (appointmentStartHour > appointmentEndHour) {
            if (within([appointmentStartHour], [workingHoursStart, 24]) && within([appointmentEndHour], [0, workingHoursEnd])) {
                res.status(200)
                res.end()
            }
        } else {
            if (within(appointmentRange, [workingHoursStart, 24]) || within(appointmentRange, [0, workingHoursEnd])) {
                res.status(200)
                res.end()
            }
        }
    } 

    res.status(300)
    res.end()
})

app.listen(3000, () =>{
    console.log('Hello! Listening at http://localhost:3000')
})
