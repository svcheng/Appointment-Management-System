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