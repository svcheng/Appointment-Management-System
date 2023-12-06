// Controller for managing appointments

const Store = require('../models/Store');
const Appointment = require('../models/Appointment');
const Pending = require('../models/Pending');
const { computeEnd } = require('../middleware/dateMiddleware');

const AppointmentController = {
  bookAppointment: async (req, res) => {
    try {
      const salon = await Store.findOne({ 'name': req.body.salon }, 'services serviceDurations');
      let duration;
      for (let i = 0; i < salon.services.length; i += 1) {
        if (salon.services[i] == req.body.service) {
          duration = salon.serviceDurations[i];
        }
      }

      const endDate = computeEnd(req.body.dateTime, duration);

      const newAppointment = new Appointment({
        storeName: req.body.salon,
        bookerName: req.body.customerName,
        bookerPhoneNum: req.body.customerPhone,
        startDatetime: req.body.dateTime,
        endDatetime: endDate,
        service: req.body.service
      });

      await newAppointment.save();
      res.status(200).send('Appointment booked successfully.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  pendingAppointment: async (req, res) => {
    try {
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
        });

        await newPendingAppointment.save();
        res.status(200).send('Appointment request sent to pending collection.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  },

  approveAppointment: async (req, res) => {
    try {
        const { salon, customerName, customerPhone, dateTime, service, clientEmail } = req.body;

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
        let email = clientEmail
        if(email){
            const newAppointment = new Appointment({
                storeName: salon,
                bookerName: customerName,
                bookerPhoneNum: customerPhone,
                startDatetime: dateTime,
                endDatetime: endDate,
                service: service,
                clientEmail: email
            });
            await newAppointment.save();
        } else {
            const newAppointment = new Appointment({
                storeName: salon,
                bookerName: customerName,
                bookerPhoneNum: customerPhone,
                startDatetime: dateTime,
                endDatetime: endDate,
                service: service,
                clientEmail: email
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
        res.status(200).send('Appointment approved and moved to appointments collection.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  },

  deletePendingAppointment: async (req, res) => {
    try {
        const { salon, customerName, customerPhone, dateTime, service, clientEmail } = req.body;

        const deleted = await Pending.findOneAndDelete({
            storeName: salon,
            bookerName: customerName,
            bookerPhoneNum: customerPhone,
            startDatetime: dateTime,
            service: service,
            clientEmail: clientEmail === "" ? null : clientEmail
        });
    
        res.end();

        res.status(200).send('Pending appointment deleted.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  },

  deleteAppointment: async (req, res) => {
    try {
        const deletedAppointment = await Appointment.findOneAndDelete({
            storeName: req.body.salon,
            bookerName: req.body.customerName,
            bookerPhoneNum: req.body.customerPhone,
            startDatetime: req.body.dateTime,
            service: req.body.service,
            clientEmail: req.body.clientEmail === "" ? null : req.body.clientEmail
        });
    
        res.end()
        res.status(200).send('Appointment deleted.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  }
};

module.exports = AppointmentController;
