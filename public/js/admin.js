document.getElementById('addService').addEventListener('click', async (e)=> {
    const newService = document.getElementById('newService').value
    const salon = document.getElementById('salonName').textContent
    const newServiceDuration = document.getElementById('newServiceDuration').value

    if (!newService || !newServiceDuration) {
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

    document.getElementById('newService').value = ""
    document.getElementById('newServiceDuration').value = ""
})

document.getElementById('date').addEventListener('change', (e) => {
    const inputDate = document.getElementById('date').value

    const appointments = document.getElementById('appointments').children
    for (let i=0; i < appointments.length; i+=1) {
        let start = appointments[i].children[3].textContent.substring(21, 31)

        // hide if appointment has different start data as calendar value and inputDate is not empty
        appointments[i].hidden = (start !== inputDate) && inputDate
    }
})


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
            `;

            // Append the new appointment to the appointments container
            document.getElementById('appointments').appendChild(newAppointment);
        }
    }
});


document.getElementById('declineButton').addEventListener('click', async () => {
    const pendingAppointments = document.querySelectorAll('#pendingAppointments .appointmentContainer');

    if (pendingAppointments.length > 0) {
        const pendingAppointment = pendingAppointments[pendingAppointments.length - 1]; // Get the last pending appointment
        pendingAppointment.remove(); // Remove the pending appointment from the DOM

        // Get appointment details for deletion
        const salon = document.getElementById('salonName').textContent;
        const customerName = pendingAppointment.querySelector('div:nth-child(2)').textContent.split(': ')[1];
        const customerPhone = pendingAppointment.querySelector('div:nth-child(3)').textContent.split(': ')[1];
        const dateTime = pendingAppointment.querySelector('div:nth-child(4)').textContent.split(': ')[1];
        const service = pendingAppointment.querySelector('div:nth-child(1)').textContent.split(': ')[1];

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
            }),
        });
    }
});


// delete appointment (ignore)
function deleteAppointmentEvent(e) {
    // Get appointment details for deletion
    // const salon = document.getElementById('salonName').textContent;
    // const customerName = pendingAppointment.querySelector('div:nth-child(2)').textContent.split(': ')[1];
    // const customerPhone = pendingAppointment.querySelector('div:nth-child(3)').textContent.split(': ')[1];
    // const dateTime = pendingAppointment.querySelector('div:nth-child(4)').textContent.split(': ')[1];
    // const service = pendingAppointment.querySelector('div:nth-child(1)').textContent.split(': ')[1];
}

let btns = document.querySelectorAll(".deleteAptmntBtn")

for (let i=0; i <btns.length; i+=1) {
    btns[i].addEventListener("click", deleteAppointmentEvent)
}

