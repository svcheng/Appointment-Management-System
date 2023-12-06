// Controller for managing services

const Store = require('../models/Store');

const ServiceController = {
  addService: async (req, res) => {
    try {
      const store = await Store.findOne({ 'name': req.params.storeName });

      if (!store.services.includes(req.params.service)) {
        store.services.push(req.params.service);
        store.serviceDurations.push(req.params.duration);
      }
      await store.save();
      res.status(200).end();
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  deleteService: async (req, res) => {
    try {
      const store = await Store.findOne({ 'name': req.params.storeName });
      const serviceIndex = store.services.indexOf(req.params.service);

      if (serviceIndex !== -1) {
        store.services.splice(serviceIndex, 1);
        store.serviceDurations.splice(serviceIndex, 1);
        await store.save();
        res.status(200).end();
      } else {
        res.status(404).json({ error: 'Service not found' });
      }
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  getServices: async (req, res) => {
    try {
      const salon = await Store.findOne({ 'name': req.params.salon });

      const response = {
        services: salon.services,
        durations: salon.serviceDurations,
        email: salon.email,
        phone: salon.phone,
        workingHoursStart: salon.workingHoursStart,
        workingHoursEnd: salon.workingHoursEnd,
        workingDays: salon.workingDays
      };

      res.send(response);
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  editService: async (req, res) => {
    try {
      const store = await Store.findOne({ 'name': req.params.storeName });
      const serviceIndex = store.services.indexOf(req.params.service);

      if (serviceIndex !== -1) {
        store.services[serviceIndex] = req.params.newService;
        if (req.params.newDuration !== '-1') {
          store.serviceDurations[serviceIndex] = req.params.newDuration;
        }
        await store.save();
        res.status(200).end();
      } else {
        res.status(404).json({ error: 'Service not found' });
      }
    } catch (error) {
      // Handle errors
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};



module.exports = ServiceController;
