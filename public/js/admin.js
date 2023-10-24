document.getElementById('addService').addEventListener('click', async (e)=> {
    const newService = document.getElementById('newService').value
    const salon = document.getElementById('salonName').textContent

    if (!newService) {
        return
    }
    
    await fetch(`/addService/${salon}/${newService}`, {
        method: 'PUT'
    })

    document.getElementById('newService').value = ""
})