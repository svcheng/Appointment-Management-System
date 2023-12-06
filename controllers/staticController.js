// Controller for rendering static pages
const Store = require('../models/Store');
const Appointment = require('../models/Appointment');
const Pending = require('../models/Pending');
const { localTimeString } = require('../middleware/dateMiddleware');

const StaticController = {
  welcomePage: (req, res) => {
    res.redirect('/static/welcome');
  },

  renderPage: async (req, res) => {
    try {
      if (req.params.page === "appointment") {
        // get current local datetime 
        let datetime = new Date().toString()
        res.render('layouts/' + req.params.page, { curDate: localTimeString(datetime) });
      } else {
        res.render('layouts/' + req.params.page);
      }
    } catch (error) {
      // Handle errors appropriately
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  adminPage: async (req, res) => {
    try {
      const salonName = req.params.storeName;
      const store = await Store.findOne({ name: salonName });
      const email = store.email;
      const phone = store.phone;
      let services = store.services;
      const durations = store.serviceDurations;
      const workDays = store.workingDays;

      // zip services and durations
      services = services.map(function (serviceName, i) {
        return {
          serviceName: serviceName,
          serviceDuration: durations[i]
        };
      });

      // Delete finished appointments
      await Appointment.deleteMany({ 'endDatetime': { $lt: new Date() } });

      let [appointments, pending] = await Promise.all([
        Appointment.find({ "storeName": salonName }),
        Pending.find({ "storeName": salonName })
      ]);

      // Sort appointments by start dates
      appointments = appointments.sort((a, b) => {
        return a.startDatetime - b.startDatetime;
      });

      pendingAppointments = pending.sort((a, b) => {
        return a.startDatetime - b.startDatetime;
      });

      appointments = appointments.map((a) => {
        return {
          service: a.service,
          bookerName: a.bookerName,
          bookerPhoneNum: a.bookerPhoneNum,
          startDatetime: a.startDatetime,
          endDatetime: a.endDatetime,
          clientEmail: a.clientEmail
        };
      });

      pending = pending.map((a) => {
        return {
          service: a.service,
          bookerName: a.bookerName,
          bookerPhoneNum: a.bookerPhoneNum,
          startDatetime: a.startDatetime,
          endDatetime: a.endDatetime,
          clientEmail: a.clientEmail
        };
      });

      let workingHours;
      if (store.workingHoursStart === -1 || store.workingHoursEnd === -1) {
        workingHours = "Not Set";
      } else {
        workingHours = `${store.workingHoursStart}-${store.workingHoursEnd}`;
      }

      res.render('layouts/admin', {
        salonName: salonName,
        email: email,
        phone: phone,
        services: services,
        appointments: appointments,
        pending: pending,
        workingHours: workingHours,
        workingDays: workDays
      });
    } catch (error) {
      // Handle errors appropriately
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};

module.exports = StaticController;

  
  module.exports = StaticController;