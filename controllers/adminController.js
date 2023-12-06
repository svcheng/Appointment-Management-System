// adminController.js

const Store = require('../models/Store'); // Import your Store model
const Appointment = require('../models/Appointment'); // Import your Appointment model
const bcrypt = require('bcrypt'); // Import bcrypt for password comparison

const login = async (req, res) => {
    const exists = await Store.findOne({ 'name': req.params.username });

    if (exists) {
      const userPassword = req.params.password;
      const hashedPassword = exists.password;
      const passwordMatch = await bcrypt.compare(userPassword, hashedPassword);
      
      if (passwordMatch) {
        res.status(200).end();
      } else {
        res.status(301).end();
      }
    } else {
      res.status(300).end();
    }
};

const registerSalon = async (req, res) => {
    console.log("In register Salon");
    const exists = await Store.findOne({ 'name': req.params.storeName });
    console.log("Finding one");
    console.log("Exists: " + exists);
    
    if (!exists) {
        console.log("Doesn't Exist");  
        const newStore = new Store({
            name: req.params.storeName,
            password: req.params.password,
            email: req.params.receivedEmail,
            phone: req.params.phone
        });
        await newStore.save();
        console.log("Creating new salon");
        res.status(200)
        res.end();
    } else {
        console.log("Failed creating new salon");
        res.status(300)
        res.end();
    }
};

const displaySalonSchedule = async (req, res) => {
    const appointments = await Appointment.find({ 'storeName': req.params.salon });

    if (!appointments) {
      return res.status(404).send("No appointment found");
    }

    const response = appointments.map(appointment => ({
      service: appointment.service,
      start: appointment.startDatetime,
      end: appointment.endDatetime,
      bookerName: appointment.bookerName,
      bookerPhoneNum: appointment.bookerPhoneNum
    }));

    res.send(response);
};

const editWorkingHours = async (req, res) => {
    const store = await Store.findOne({ 'name': req.params.salonName });

    store.workingHoursStart = req.params.start;
    store.workingHoursEnd = req.params.end;
    await store.save();

    res.status(200).end();
};

const editWorkingDays = async (req, res) => {
    const store = await Store.findOne({ 'name': req.params.salonName });

    if (req.params.days === "None") {
      store.workingDays = [];
    } else {
      const dayArray = req.params.days.split(',');
      store.workingDays = dayArray;
    }

    await store.save();

    res.status(200).end();
};

const getWorkSchedule = async (req, res) => {
    const salon = await Store.findOne({ 'name': req.params.salonName });
    const data = {
      workingDays: salon.workingDays,
      workingHoursStart: salon.workingHoursStart,
      workingHoursEnd: salon.workingHoursEnd,
      services: salon.services,
      serviceDurations: salon.serviceDurations
    };

    res.json(data);
};

module.exports = {
  login,
  registerSalon,
  displaySalonSchedule,
  editWorkingHours,
  editWorkingDays,
  getWorkSchedule
};
