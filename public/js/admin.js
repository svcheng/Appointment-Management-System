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