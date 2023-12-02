// send request to server when user inputs types into search bar
document.getElementById("searchBar").addEventListener("keyup", async (e) => {
    const searchInput = e.target.value
    
    // remake search result container
    document.getElementById("searchResults").remove()
    const searchResults = document.createElement("div")
    searchResults.setAttribute("id", 'searchResults')

    if (!searchInput) {
        console.log("empty search")
        document.getElementById('search').appendChild(searchResults)
        return 
    }

    // send request to server to get search results
    const res = await fetch('/search/' + searchInput,  {
        method: "GET"
    })
    const data = await res.json()

    // add search suggestions
    data.stores.forEach(store => {
        let elem = document.createElement("div")
        elem.setAttribute("class", 'searchResult')
        elem.setAttribute("value", store.name)
        elem.textContent = store.name
        elem.addEventListener('click', salonSelection)
        searchResults.appendChild(elem)
    });

    // add to DOM
    document.getElementById('search').appendChild(searchResults)
})  

const salonSelection = async (e) => {
    const salon = e.target.textContent
    document.getElementById('selectedSalon').value = salon

    // empty search results
    document.getElementById("searchResults").remove() 
    const searchResults = document.createElement("div")
    searchResults.setAttribute("id", 'searchResults')
    document.getElementById('search').appendChild(searchResults)

    // empty services options if any
    let parent = document.getElementById('customer-service')
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }

    // retrieve and add services of selected salon
    let data = await fetch('/services/' + salon, {
        method: 'GET',
    })

    data = await data.json()


    // display services
    for (let i=0; i < data.services.length; i+=1) {
        addServiceOption(data.services[i], data.durations[i])
    }

    // show header
    let email = String(data.email);
    let appointmentHeader = document.getElementById('appointment-header')
    appointmentHeader.innerHTML = ""
    appointmentHeader.appendChild(document.createTextNode("Schedule for"))
    appointmentHeader.appendChild(document.createTextNode(" " + salon))
    appointmentHeader.appendChild(document.createTextNode(" (" + email + ")"))
    appointmentHeader.appendChild(document.createElement("br"))
    if (data.phone != "") {
        appointmentHeader.appendChild(document.createTextNode(`Phone: ${data.phone}`))
        appointmentHeader.appendChild(document.createElement("br"))
    }
    appointmentHeader.appendChild(document.createTextNode(`Working Days: ${data.workingDays}`))
    appointmentHeader.appendChild(document.createElement("br"))
    if (data.workingHoursStart != -1 && data.workingHoursEnd) {
        appointmentHeader.appendChild(document.createTextNode(`Working Hours: ${data.workingHoursStart} - ${data.workingHoursEnd}`))
    }
    appointmentHeader.style.display = 'block'

    // display salon schedule
    let sched = await fetch('/schedules/' + salon, {
        method: 'GET',
    })

    sched = await sched.json()

    //Sorts chronologically before displaying
    sched.sort((a, b) => new Date(a.start) - new Date(b.start));
    sched.forEach(sched => {
        addScheduleOption(sched.start, sched.end)
    })
}

//
const addScheduleOption = (startTime, endTime) => {
    let startTimeDate = new Date(startTime)
    let endTimeDate = new Date(endTime)
    let elem = document.createElement('div')
    elem.setAttribute('id', 'sched-desc')

    let startMonth = startTimeDate.getMonth() + 1
    let startDay = startTimeDate.getDate()
    let startYear = startTimeDate.getFullYear()
    let startHour = startTimeDate.getHours()
    let startMin = startTimeDate.getMinutes()

    if (startMin < 10) {
        startMin = "0" + startMin
        
    }
    if (startHour == 0) {
        startHour = "00"
    }
    
    let newStartTime = startHour + ":" + startMin

    let endHour = endTimeDate.getHours()
    let endMin = endTimeDate.getMinutes()

    if (endMin < 10) {
        endMin = "0" + endMin
    }
    if (endHour == 0) {
        endHour = "00"
    }

    let newEndTime = endHour + ":" + endMin

    switch(startMonth) {
        case 1:
            startMonth = "January"
            break;
        case 2:
            startMonth = "February"
            break;
        case 3:
            startMonth = "March"
            break;
        case 4:
            startMonth = "April"
            break;
        case 5:
            startMonth = "May"
            break;
        case 6:
            startMonth = "June"
            break;
        case 7:
            startMonth = "July"
            break;
        case 8:
            startMonth = "August"
            break;
        case 9:
            startMonth = "September"
            break;
        case 10:
            startMonth = "October"
            break;
        case 11:
            startMonth = "November"
            break;
        case 12:
            startMonth = "December"
            break;
    }

    elem.innerHTML = 
    `
        <div>${startMonth} ${startDay}, ${startYear} | ${newStartTime} to ${newEndTime}</div>

        
    `
    let br = document.createElement('br')

    document.getElementById('schedule-container').appendChild(elem)
    document.getElementById('schedule-container').appendChild(br)
}
// adds dropdown option for a service to the DOM
const addServiceOption = (serviceName, duration) => {
    let elem = document.createElement('option')
    elem.value = serviceName

    let hours = Math.floor(duration / 60)
    let mins = duration - (hours * 60)

    let hoursText
    let minsText
    switch (hours) {
        case 0:
            hoursText = '';
            break;
        case 1:
            hoursText = `${hours} hour`;
            break;
        default:
            hoursText = `${hours} hours`;
    }

    switch (mins) {
        case 0:
            minsText = '';
            break;
        case 1:
            minsText = `${mins} minute`;
            break;
        default:
            minsText = `${mins} minutes`;
    }

    elem.textContent = `${serviceName} (${hoursText} ${minsText})`
    document.getElementById('customer-service').appendChild(elem)
}

// prevent page reload upon submit 
document.getElementById('submitBtn').addEventListener('click', (e) => {e.preventDefault()})

// attempt to book appointment
document.getElementById('submitBtn').addEventListener('click', async (e) => {
    // form data
    const salon = document.getElementById('selectedSalon').value
    const customerName = document.getElementById('name').value
    const customerPhone = document.getElementById('tel').value
    const customerEmail = document.getElementById('email').value
    const dateTime = document.getElementById('dateTime').value
    const service = document.getElementById('customer-service').value

    const errorMsg = document.getElementById('errorMsg')
    const confirmMsg = document.getElementById('confirmMsg')
    errorMsg.hidden = salon && customerName && customerPhone && dateTime && service
    if (!errorMsg.hidden) {
        confirmMsg.hidden = true
        return
    }

    // check if time falls within salon working hours
    let res = await fetch(`/withinWorkingHours/${salon}/${service}/${new Date(dateTime).toString()}`, {
        method: "GET"
    })

    let workingHoursError = document.getElementById("workingHoursError")
    if (!res.ok) {
        workingHoursError.hidden = false
        return 
    } else {
        workingHoursError.hidden = true
    }
    
    confirmMsg.hidden = false

    res = await fetch('/pendingAppointment', {
        method: 'POST',
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            salon: salon,
            customerName: customerName,
            customerPhone: customerPhone,
            clientEmail: customerEmail || null,
            dateTime: new Date(dateTime).toString(),
            service: service
        })
    })

    //Sends Email Notification to Admin
    sendEmail(salon, customerName, customerPhone, dateTime, service)

    document.getElementById('selectedSalon').value = ""
    document.getElementById('name').value = ""
    document.getElementById('tel').value = ""
    document.getElementById('email').value = ""
    document.getElementById('dateTime').value = null
    document.getElementById('customer-service').value = null

    // empty services options if any
    let parent = document.getElementById('customer-service')
    while (parent.firstChild) {
        parent.removeChild(parent.firstChild);
    }
})

const sendEmail = async (salon, customerName, customerPhone, dateTime, service) => { 
    const res2 = await fetch(`/appointmentEmail/${salon}/${customerName}/${customerPhone}/${dateTime}/${service}`, {
        method: 'POST',
    })

}
