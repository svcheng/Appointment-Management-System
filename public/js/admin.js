document.addEventListener('DOMContentLoaded', () => {
    let starts = document.getElementsByName('appointmentDateStart')
    let ends = document.getElementsByName('appointmentDateEnd')

    const prepend0 = (d) => {return Math.floor(d / 10) == 0 ? '0' + String(d) : d}

    // converts date object into 'YYYY-MM-DDTHH:MM' format in local time
    const localTimeString = (datetime) => {
        datetime = new Date(datetime)
        return `${datetime.getFullYear()}-${prepend0(datetime.getMonth() + 1)}-${prepend0(datetime.getDate())}T${prepend0(datetime.getHours())}:${prepend0(datetime.getMinutes())}`
    }

    for (let i=0; i<starts.length; i+=1) {
        let str = localTimeString(starts[i].textContent)
        starts[i].textContent = `Start Date and Time: ${str.substring(0, 10)}, ${str.substring(11, 16)}`
    }
    for (let i=0; i<ends.length; i+=1) {
        let str = localTimeString(ends[i].textContent)
        ends[i].textContent = `End Date and Time: ${str.substring(0, 10)}, ${str.substring(11, 16)}`
    }
})

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
    // refresh the page
    location.reload()



    document.getElementById('newService').value = ""
    document.getElementById('newServiceDuration').value = ""
})

document.getElementById('pendingsDate').addEventListener('change', (e) => {
    const inputDate = e.target.value

    const pendings = document.getElementById('pendingAppointments').children

    for (let i=1; i < pendings.length; i+=1) {
        let start = pendings[i].children[0].children[3].textContent.split(": ")[1].substring(0, 10)

        // hide if appointment has different start date as calendar value and inputDate is not empty
        pendings[i].hidden = inputDate && (start !== inputDate) 
    }

    displayNoAppointments()
})

document.getElementById('appointmentsDate').addEventListener('change', (e) => {
    const inputDate = e.target.value

    const appointments = document.getElementById('appointments').children

    for (let i=1; i < appointments.length; i+=1) {
        let start = appointments[i].children[0].children[3].textContent.split(": ")[1].substring(0, 10)
        
        // hide if appointment has different start date as calendar value and inputDate is not empty
        appointments[i].hidden = inputDate && (start !== inputDate) 
    }

    displayNoAppointments()
})

//displays delete service btn
document.getElementById('deleteServiceDropdown').addEventListener('change', async () => {
    var style = this.value == 0 ? 'none' : 'block';
    document.getElementById('deleteService').style.display = style;
});

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
        // // service is deleted
        // console.log("Selected Service: "+selectedService);
        // const servicesContainer = document.getElementById('services');
        // for (const service of servicesContainer.children) {
        //     console.log("Service: "+service.textContent);
        //     if (service.textContent === selectedService) {
        //         servicesContainer.removeChild(service);
        //     }
        // }

        // Service is deleted
        const servicesContainer = document.getElementById('services');
        for (const service of servicesContainer.children) {
            const serviceText = service.textContent.trim();
            const serviceIndex = serviceText.indexOf('(');
            const serviceWithoutDuration = serviceIndex !== -1 ? serviceText.substring(0, serviceIndex).trim() : serviceText;
            if (serviceWithoutDuration === selectedService) {
                servicesContainer.removeChild(service);
            }
        }
        // update delete service dropdown
        updateServiceDropdown();
        location.reload()
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
            const serviceText = service.textContent.trim();
            const serviceIndex = serviceText.indexOf('(');
            const serviceWithoutDuration = serviceIndex !== -1 ? serviceText.substring(0, serviceIndex).trim() : serviceText;
            if (serviceWithoutDuration === selectedService) {
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
    // refresh page
    location.reload();
});

//displays edit service form
document.getElementById('editServiceDropdown').addEventListener('change', async () => {
    var style = this.value == 0 ? 'none' : 'block';
    document.getElementById('editInputs').style.display = style;
    document.getElementById('editConfirmMsg').hidden = true;
});

//edit working days
document.getElementById('editWorkingDays').addEventListener('click', async () => {
    const salonName = document.getElementById('salonName').textContent;
    //get the checked working days from the checkboxes
    const days = document.getElementById('dayCheckBox');
    const workingDays = days.querySelectorAll('input');
    let newWorkingDays = [];
    const confirmDays = document.getElementById('confirmDaysMsg');

    for (const day of workingDays) {
        if (day.checked) {
            newWorkingDays.push(day.value);
        }
    }
    newWorkingDays = newWorkingDays.length === 0 ? "None" : newWorkingDays.join(',')
    
    const response = await fetch(`/editWorkingDays/${salonName}/${newWorkingDays}`, {
        method: 'PUT',
    });

    if (response.ok) {
        // working days are edited
        document.getElementById('workingDaysHeader').textContent = `Working Days: ${newWorkingDays}`;
        confirmDays.hidden = false;
        //reset checkboxes
        for (const day of workingDays) {
            day.checked = false;
        }
    }

});

async function updateServiceDropdown() {
    const deleteServiceDropdown = document.getElementById('deleteServiceDropdown');
    const editServiceDropdown = document.getElementById('editServiceDropdown');
    const services = document.querySelectorAll('.service');

    // clears the option in dropdown
    deleteServiceDropdown.innerHTML = '';
    editServiceDropdown.innerHTML = '';

    let option = document.createElement('option');
    option.value = "0"
    option.textContent = "Select a service"
    option.disabled = true
    option.selected = true
    deleteServiceDropdown.appendChild(option);
    editServiceDropdown.appendChild(option.cloneNode(true));

    // populate dropdown with other services
    services.forEach(service => {
        const serviceName = service.textContent;
        option = document.createElement('option');
        option.value = serviceName;
        option.textContent = serviceName;
        deleteServiceDropdown.appendChild(option);
        editServiceDropdown.appendChild(option.cloneNode(true));
    });


    deleteServiceDropdown.value = "0"
    editServiceDropdown.value = "0"
}

const approveAppointment = async (e) => {
        const pendingAppointment = e.target.parentNode.firstElementChild; // Get the last pending appointment

        // Get appointment details for deletion
        const appointment = e.target.parentNode.firstElementChild
        const children = appointment.children 

        const salon = document.getElementById('salonName').textContent
        const customerName = children[1].textContent.split(': ')[1]
        const customerPhone = children[2].textContent.split(': ')[1]
        const startTime = children[3].textContent.split(': ')[1]
        const endTime = children[4].textContent.split(': ')[1]
        const service = children[0].textContent.split(': ')[1]
        const clientEmail = appointment.children.length >= 6 ? appointment.children[5].textContent.split(': ')[1] : null

        const res = await fetch('/approveAppointment', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                salon: salon,
                customerName: customerName,
                customerPhone: customerPhone,
                dateTime: new Date(startTime).toString(),
                service: service,
                clientEmail: clientEmail
            }),
        });

        if (res.ok) {
            // Remove the pending appointment from the DOM
            pendingAppointment.parentNode.remove();

            // Create a new appointment element for the approved appointment
            const newAppointment = document.createElement('div');
            // newAppointment.classList.add('appointmentContainer');
            newAppointment.innerHTML = `
                <div>
                    <div class="appointmentContainer border-black border-solid border-thin p-2">
                        <div>Service: ${service}</div>
                        <div>Booker: ${customerName}</div>
                        <div>Phone Number: ${customerPhone}</div>
                        <div>Start Date and Time: ${startTime}</div>
                        <div>End Date and Time: ${endTime}</div>
                        <div>Email: ${clientEmail}</div>
                    </div>
                    <div class="deleteAptmntBtn" onclick=deleteAppointmentEvent()>Cancel Appointment</div> 
                </div>
            `;

            // Append the new appointment to the appointments container
            document.getElementById('appointments').appendChild(newAppointment);

            let result = 'Approved';
            sendEmailResponse(salon, customerName, customerPhone, startTime, service, result);

            displayNoAppointments()
        }
}

const declineAppointment = async (e) => {
        const pendingAppointment = e.target.parentNode.firstElementChild; // Get the last pending appointment

        // Get appointment details for deletion
        const appointment = e.target.parentNode.firstElementChild
        const children = appointment.children 

        const salon = document.getElementById('salonName').textContent
        const customerName = children[1].textContent.split(': ')[1]
        const customerPhone = children[2].textContent.split(': ')[1]
        const startTime = children[3].textContent.split(': ')[1]
        const service = children[0].textContent.split(': ')[1]
        const clientEmail = appointment.children.length >= 6 ? appointment.children[5].textContent.split(': ')[1] : null

        let result = 'Declined';
        await sendEmailResponse(salon, customerName, customerPhone, startTime, service, result);

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
                dateTime: new Date(startTime).toString(),
                service: service,
                clientEmail: clientEmail
            }),
        });

        pendingAppointment.parentNode.remove(); // Remove the pending appointment from the DOM
        displayNoAppointments()
}

const sendEmailResponse = async (salon, customerName, customerPhone, dateTime, service, result) => {
    const res2 = await fetch(`/emailApproveOrDecline/${salon}/${customerName}/${customerPhone}/${dateTime}/${service}/${result}`, {
        method: 'POST',
    })
}

// delete appointment 
async function deleteAppointmentEvent(e) {
    if(!window.confirm("Are you sure you wan't to cancel this appointment?")) {
        return
    }

    // Get appointment details for deletion
    const appointment = e.target.parentNode.firstElementChild
    const children = appointment.children 

    const salon = document.getElementById('salonName').textContent
    const customerName = children[1].textContent.split(': ')[1]
    const customerPhone = children[2].textContent.split(': ')[1]
    const dateTime = children[3].textContent.split(': ')[1]
    const service = children[0].textContent.split(': ')[1]
    const clientEmail = appointment.children.length >= 6 ? appointment.children[5].textContent.split(': ')[1] : null
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

let btns = document.querySelectorAll(".approvePending")
for (let i=0; i <btns.length; i+=1) {
    btns[i].addEventListener("click", approveAppointment)
}

btns = document.querySelectorAll(".declinePending")
for (let i=0; i <btns.length; i+=1) {
    btns[i].addEventListener("click", declineAppointment)
}

btns = document.querySelectorAll(".deleteAptmntBtn")
for (let i=0; i <btns.length; i+=1) {
    btns[i].addEventListener("click", deleteAppointmentEvent)
}

document.getElementById("editWorkingHours").addEventListener("click", async () => {
    let confirmMsg = document.getElementById("confirmMsg")
    let errorWorkingHours = document.getElementById("errorWorkingHours")
    let start = document.getElementById("start").value
    let end = document.getElementById("end").value
    const salon = document.getElementById('salonName').textContent;

    confirmMsg.hidden = true
    errorWorkingHours.hidden = true

    if (start === "" && end === "") {
        start = -1
        end = -1
    } else if (start === "" || end === "") {
        errorWorkingHours.hidden = false
        errorWorkingHours.textContent = "Enter both start and end date. To unset working hours, leave both blank."
        return
    } else {
        start = Number(start)
        end = Number(end)

        if (!Number.isInteger(start) || !Number.isInteger(end)) {
            errorWorkingHours.hidden = false
            errorWorkingHours.textContent = "Enter positive integers as working hours."
            return
        } else if (start < 0 || start > 23 || end < 0 || end > 23 || start === end) {
            errorWorkingHours.hidden = false
            errorWorkingHours.textContent = "Invalid Working Hours."
            return
        }
    } 
    
    const res = await fetch(`/editWorkingHours/${salon}/${start}/${end}`, {
        method: "PUT"
    }) 

    if (res.ok) {
        let text = `Working Hours: ${start}-${end}`
        if (start === -1 && end === -1) {
            text = "Working Hours: Not Set"
        } 

        document.getElementById("workingHoursHeader").textContent = text
        confirmMsg.hidden = false
    }
})

// display message when there are no pendings/ no appointments
const displayNoAppointments = () => {
    const noPendings = document.getElementById("noAppointmentsPending")
    const noAppointments = document.getElementById("noAppointmentsNonPending")
    const pendings = document.getElementById('pendingAppointments').children
    const appointments = document.getElementById('appointments').children
    
    let notHiddenPendings = 0
    for (let i=1; i < pendings.length; i+=1) {
        if (!pendings[i].hidden) {
            notHiddenPendings += 1
        }
    }

    let notHiddenAppointments = 0
    for (let i=1; i < appointments.length; i+=1) {
        if (!appointments[i].hidden) {
            notHiddenAppointments += 1
        }
    }

    noPendings.hidden = notHiddenPendings > 0
    noAppointments.hidden = notHiddenAppointments > 0
}

document.addEventListener("DOMContentLoaded", () => {
    displayNoAppointments()
})
