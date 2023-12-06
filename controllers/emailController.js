// Controller for managing email-related actions

const Store = require('../models/Store');
const Pending = require('../models/Pending');
const Appointment = require('../models/Appointment');
const { sendMail } = require('../middleware/emailMiddleware');



const EmailController = {
  sendDataEmail: async (req, res) => {
    try {
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
        };
        sendMail(mailOptions);
        res.status(200).send('Data sent via email.');
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  },

  appointmentNotificationEmail: async (req, res) => {
    try {
        const exists = await Store.findOne({ 'name': req.params.salon });
        const appointmentSchedule = req.params.dateTime.replace('T', ' at ');
    
        if(exists){
            const mailOptions = {
                from: {
                  name: "Appointment Notification to " + req.params.salon,
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
                            <td>${appointmentSchedule}</td>
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
            sendMail(mailOptions);
        }
        res.status(200).send('Appointment notification email sent.');
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  },

  approveOrDeclineEmail: async (req, res) => {
    try {
        console.log("Trying to send email to appointment peep");
        //req.params.result is just "Approved" or "Declined" as a string to include in the email ^
        const existsStore = await Store.findOne({ 'name': req.params.salon });
        const salonOwnerEmail = existsStore.email;
    
        const appointmentSchedule = req.params.dateTime.replace('T', ' at ');
    
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
                            <td>${appointmentSchedule}</td>
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
            sendMail(mailOptions);
            res.status(200).send('Approval/Decline email sent.');
        }else{
            console.log("Email not sent to appointment peep");
        }
        res.end()
    } catch (error) {
        console.error(error);
        res.status(500).send('Internal Server Error');
    }
  },

  deletedAppointmentEmail: async (req, res) => {
    try {
        const existsStore = await Store.findOne({ 'name': req.params.salon });
        const salonOwnerEmail = existsStore.email;
        const clientEmail = req.params.clientEmail
    
        const appointmentSchedule = req.params.dateTime.replace('T', ' at ');
    
        if(clientEmail){
            const mailOptions = {
                from: {
                    name: `Your appointment to ${req.params.salon} has been canceled.`,
                    address: 'appointmentsserver@gmail.com'
                }, // sender address
                to: clientEmail, // list of receivers
                subject: `Your Appointment to ${req.params.salon} has been canceled.`, // Subject line
                //Content of Letter; coded directly here to prevent error messages if we were to instead read from an external HTML file
                html: `
                <table width="100%" cellpadding="0" cellspacing="0" border="0">
                    <tr><td>
                        <p>${req.params.salon} has deleted your appointment.</p>
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
                            <td>${appointmentSchedule}</td>
                            </tr>
                            <tr>
                            <td><strong>Service:</strong></td>
                            <td>${req.params.service}</td>
                            </tr>
                        </table>
                        </td></tr><tr><td>
                        <p>If you have any further questions or wish to inquire why, please contact the salon owner at ${salonOwnerEmail}.</p>
                    </td></tr>
                </table>
                `, 
                }
            sendMail(mailOptions);
            res.status(200).send('Deleted appointment email sent.');
        }else{
            console.log("Deleted appointment Email not sent");
        }
        res.end()
    } catch (error) {
      console.error(error);
      res.status(500).send('Internal Server Error');
    }
  }
};

module.exports = EmailController;
