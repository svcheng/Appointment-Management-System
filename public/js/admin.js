document.getElementById('addService').addEventListener('click', async (e)=> {
    const newService = document.getElementById('newService').value
    const salon = document.getElementById('salonName').textContent
    const newServiceDuration = document.getElementById('newServiceDuration').value

    if (!newService || !newServiceDuration) {
        return
    }

    if (isNaN(Number(newServiceDuration)) || !Number.isInteger(Number(newServiceDuration)) || Number(newServiceDuration) <= 0) {
        window.alert("Invalid Input.")
        return
    }
    
    await fetch(`/addService/${salon}/${newService}/${newServiceDuration}`, {
        method: 'PUT'
    })

    // add to DOM
    const serviceNode = document.createElement('div')
    serviceNode.setAttribute('class', 'service')
    serviceNode.textContent = newService
    document.getElementById('services').appendChild(serviceNode)

    //updates the server list
    updateServiceDropdown()

    document.getElementById('newService').value = ""
    document.getElementById('newServiceDuration').value = ""
})

document.getElementById('pendingsDate').addEventListener('change', (e) => {
    const inputDate = e.target.value

    const pendings = document.getElementById('pendingAppointments').children

    for (let i=1; i <= pendings.length - 2; i+=1) {
        let start = pendings[i].children[3].textContent.split(": ")[1].substring(0, 10)

        // hide if appointment has different start date as calendar value and inputDate is not empty
        pendings[i].hidden = inputDate && (start !== inputDate) 
    }
})

document.getElementById('appointmentsDate').addEventListener('change', (e) => {
    const inputDate = e.target.value

    const appointments = document.getElementById('appointments').children

    for (let i=1; i < appointments.length; i+=1) {
        let start = appointments[i].children[0].children[3].textContent.split(": ")[1].substring(0, 10)
        
        // hide if appointment has different start date as calendar value and inputDate is not empty
        appointments[i].hidden = inputDate && (start !== inputDate) 
    }
})


//delete service 
document.getElementById('deleteService').addEventListener('click', async () => {
    const deleteServiceDropdown = document.getElementById('deleteServiceDropdown');
    const selectedService = deleteServiceDropdown.value;
    const salonName = document.getElementById('salonName').textContent;

    //if the selected service is not chosen returns
    if (!selectedService) {
        return;
    }

    //requests to fetch to find the selected service and delete
    const response = await fetch(`/deleteService/${salonName}/${encodeURIComponent(selectedService)}`, {
        method: 'DELETE',
    });

    if (response.ok) {
        // service is deleted
        const servicesContainer = document.getElementById('services');
        for (const service of servicesContainer.children) {
            if (service.textContent === selectedService) {
                servicesContainer.removeChild(service);
            }
        }

        // update delete service dropdown
        updateServiceDropdown();
    }
});

//edit service
document.getElementById('editSubmit').addEventListener('click', async () => {
    const editServiceDropdown = document.getElementById('editServiceDropdown');
    const selectedService = editServiceDropdown.value; //original service name, used to fetch the service from db
    const salonName = document.getElementById('salonName').textContent;
    let newServiceName = document.getElementById('editServiceName').value;
    let newServiceDuration = document.getElementById('editServiceDuration').value;
    const confirmMsg = document.getElementById('editConfirmMsg');
    const editDiv = document.getElementById('editInputs');
    //placeholder value when no new service name is entered
    if (!newServiceName) {
        newServiceName = selectedService;
    }
    //placeholder value when no new service duration is entered
    if (!newServiceDuration) {
        newServiceDuration = -1;
    }
    //if the selected service is not chosen returns
    if (!selectedService) {
        return;
    }
    
    const response = await fetch(`/editService/${salonName}/${encodeURIComponent(selectedService)}/${newServiceName}/${newServiceDuration}`, {
        method: 'PUT',
    
    });

    if (response.ok) {
        // service is edited
        const servicesContainer = document.getElementById('services');
        for (const service of servicesContainer.children) {
            if (service.textContent === selectedService) {
                service.textContent = newServiceName;
            }
        }

        confirmMsg.hidden = false;
        updateServiceDropdown();
        editDiv.style.display = 'none';
    }
    //reset the input fields
    document.getElementById('editServiceName').value = '';
    document.getElementById('editServiceDuration').value = '';
});

//displays edit service form
document.getElementById('editServiceDropdown').addEventListener('change', async () => {
    var style = this.value == 0 ? 'none' : 'block';
    document.getElementById('editInputs').style.display = style;
    document.getElementById('editConfirmMsg').hidden = true;
});


async function updateServiceDropdown() {
    const deleteServiceDropdown = document.getElementById('deleteServiceDropdown');
    const editServiceDropdown = document.getElementById('editServiceDropdown');
    const services = document.querySelectorAll('.service');

    // clears the option in dropdown
    deleteServiceDropdown.innerHTML = '';
    editServiceDropdown.innerHTML = '';

    // populate dropdown with other services
    services.forEach(service => {
        const serviceName = service.textContent;
        const option = document.createElement('option');
        option.value = serviceName;
        option.textContent = serviceName;
        deleteServiceDropdown.appendChild(option);
    });

    services.forEach(service => {
        const serviceName = service.textContent;
        const option = document.createElement('option');
        option.value = serviceName;
        option.textContent = serviceName;
        editServiceDropdown.appendChild(option);
    });
}

  

document.getElementById('approveButton').addEventListener('click', async () => {
    const pendingAppointments = document.querySelectorAll('#pendingAppointments .appointmentContainer');

    if (pendingAppointments.length > 0) {
        const pendingAppointment = pendingAppointments[pendingAppointments.length - 1]; // Get the last pending appointment

        const salon = document.getElementById('salonName').textContent;
        const customerName = pendingAppointment.querySelector('div:nth-child(2)').textContent.split(': ')[1];
        const customerPhone = pendingAppointment.querySelector('div:nth-child(3)').textContent.split(': ')[1];
        const dateTime = pendingAppointment.querySelector('div:nth-child(4)').textContent.split(': ')[1];
        const service = pendingAppointment.querySelector('div:nth-child(1)').textContent.split(': ')[1];

        const res = await fetch('/approveAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salon: salon,
                customerName: customerName,
                customerPhone: customerPhone,
                dateTime: new Date(dateTime).toString(),
                service: service,
            }),
        });

        if (res.ok) {
            // Remove the pending appointment from the DOM
            pendingAppointment.remove();

            // Create a new appointment element for the approved appointment
            const newAppointment = document.createElement('div');
            newAppointment.classList.add('appointmentContainer');
            newAppointment.innerHTML = `
                <div>Service: ${service}</div>
                <div>Booker: ${customerName}</div>
                <div>Phone Number: ${customerPhone}</div>
                <div>Start Date and Time: ${dateTime}</div>
                <div>End Date and Time: ${new Date(dateTime).toString()}</div>
                <div class="deleteAptmntBtn">Cancel Appointment</div>  
            `;
            let result = 'Approved';
            sendEmailResponse(salon, customerName, customerPhone, dateTime, service, result);

            // Append the new appointment to the appointments container
            document.getElementById('appointments').appendChild(newAppointment);

            displayNoAppointments()
        }
    }
});


document.getElementById('declineButton').addEventListener('click', async () => {
    const pendingAppointments = document.querySelectorAll('#pendingAppointments .appointmentContainer');

    if (pendingAppointments.length > 0) {
        const pendingAppointment = pendingAppointments[pendingAppointments.length - 1]; // Get the last pending appointment
        

        // Get appointment details for deletion
        const salon = document.getElementById('salonName').textContent;
        const customerName = pendingAppointment.querySelector('div:nth-child(2)').textContent.split(': ')[1];
        const customerPhone = pendingAppointment.querySelector('div:nth-child(3)').textContent.split(': ')[1];
        const dateTime = pendingAppointment.querySelector('div:nth-child(4)').textContent.split(': ')[1];
        const service = pendingAppointment.querySelector('div:nth-child(1)').textContent.split(': ')[1];
        const clientEmail = pendingAppointment.children[5].textContent.split(': ')[1]

        let result = 'Declined';
        await sendEmailResponse(salon, customerName, customerPhone, dateTime, service, result);
        console.log(clientEmail)
        // Send request to delete from the pendings collection
        await fetch('/deletePendingAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salon: salon,
                customerName: customerName,
                customerPhone: customerPhone,
                dateTime: new Date(dateTime).toString(),
                service: service,
                clientEmail: clientEmail
            }),
        });

        pendingAppointment.remove(); // Remove the pending appointment from the DOM
        displayNoAppointments()
    }
});
const sendEmailResponse = async (salon, customerName, customerPhone, dateTime, service, result) => {
    const res2 = await fetch(`/emailApproveOrDecline/${salon}/${customerName}/${customerPhone}/${dateTime}/${service}/${result}`, {
        method: 'POST',
    })
}

// delete appointment 
async function deleteAppointmentEvent(e) {
    // Get appointment details for deletion
    const appointment = e.target.parentNode.firstElementChild
    const children = appointment.children 

    const salon = document.getElementById('salonName').textContent
    const customerName = children[1].textContent.split(': ')[1]
    const customerPhone = children[2].textContent.split(': ')[1]
    const dateTime = children[3].textContent.split(': ')[1]
    const service = children[0].textContent.split(': ')[1]
    const clientEmail = children[5].textContent.split(': ')[1]

    //Calls Function to send Email Notification to client if email exists
    sendEmailDeleted(salon, customerName, customerPhone, dateTime, service, clientEmail);
    
    const res = await fetch('/deleteAppointment', {
        method: 'DELETE',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            salon: salon,
            customerName: customerName,
            customerPhone: customerPhone,
            dateTime: new Date(dateTime).toString(),
            service: service,
            clientEmail: clientEmail
        })
    })

    appointment.parentNode.remove()

    // display msg if no appointments/ no pendings
    displayNoAppointments()
}

//Sends an email when an approved appointment is Deleted
const sendEmailDeleted = async (salon, customerName, customerPhone, dateTime, service, clientEmail) => {
    const res2 = await fetch(`/emailDeleted/${salon}/${customerName}/${customerPhone}/${dateTime}/${service}/${clientEmail}/`, {
        method: 'POST',
    })
}

let btns = document.querySelectorAll(".deleteAptmntBtn")
for (let i=0; i <btns.length; i+=1) {
    btns[i].addEventListener("click", deleteAppointmentEvent)
}

document.getElementById("editWorkingHours").addEventListener("click", async () => {
    let confirmMsg = document.getElementById("confirmMsg")
    let start = document.getElementById("start")
    let end = document.getElementById("end")
    const salon = document.getElementById('salonName').textContent;

    confirmMsg.hidden = true
    if (start.value < 0 || start.value > 23 || end.value < 0 || end.value > 23 || start.value === end.value) {
        window.alert("Invalid Working Hours.")
        return
    }
    
    const res = await fetch(`/editWorkingHours/${salon}/${start.value}/${end.value}`, {
        method: "PUT"
    }) 

    if (res.ok) {
        document.getElementById("workingHoursHeader").textContent = `Working Hours: ${start.value}-${end.value}`
        confirmMsg.hidden = false
    } else {
        window.alert("Invalid Working Hours.")
    }
})

// display message when there are no pendings/ no appointments
const displayNoAppointments = () => {
    let noPendings = document.getElementById("noAppointmentsPending")
    let noAppointments = document.getElementById("noAppointmentsNonPending")
    
    noPendings.hidden = document.getElementById("pendingAppointments").children.length !== 2 
    noAppointments.hidden = document.getElementById("appointments").children.length !== 1
    document.getElementById("approveDeclineButtons").hidden = !noPendings.hidden
}

document.addEventListener("DOMContentLoaded", () => {
    displayNoAppointments()
})
