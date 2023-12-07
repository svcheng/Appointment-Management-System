// send request to server when user inputs types into search bar
document.getElementById("searchBar").addEventListener("keyup", async (e) => {
    const searchInput = e.target.value
    
    if (!searchInput) {
        return 
    }

    // send request to server to get search results
    const res = await fetch('/search/' + searchInput,  {
        method: "GET"
    })
    const data = await res.json()

    // remove children of search result container
    const searchResults = document.getElementById("searchResults")
    while (searchResults.firstChild) {
        searchResults.firstChild.remove()
    } 

    // add search suggestions
    let elem
    data.stores.forEach(store => {
        elem = document.createElement("div")
        elem.setAttribute("class", 'searchResult')
        elem.setAttribute("value", store.name)
        elem.textContent = store.name
        elem.addEventListener('click', salonSelection)
        searchResults.appendChild(elem)
    });
})  

const salonSelection = async (e) => {
    const salon = e.target.textContent
    document.getElementById('selectedSalon').value = salon

    // remove children of search result container
    const searchResults = document.getElementById("searchResults")
    while (searchResults.firstChild) {
        searchResults.firstChild.remove()
    }

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

    // empty schedule container
    const scheduleContainer = document.getElementById('schedule-container')

    while (scheduleContainer.children.length > 1) {
        scheduleContainer.lastChild.remove()
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

const computeEnd = (dateTime, duration) => {
    let end = new Date(dateTime)
    end.setMinutes(end.getMinutes() + duration)

    return end.toString()
}

const withinWorkingHours = async (salonName, service, startDate) => {
    let data = await fetch(`/workSchedule/${salonName}`, {
        method: "GET"
    })

    data = await data.json()
    let workingDays = data.workingDays  
    let workingHoursStart = data.workingHoursStart 
    let workingHoursEnd = data.workingHoursEnd 
    let services = data.services 
    let serviceDurations = data.serviceDurations 

    let day = startDate.substring(0,3);
    
    //checks if day is in workingDays
    if(!workingDays.includes(day)){
        return 301
    }

    let duration
    for (let i=0; i < services.length; i+=1) {
        if (services[i] == service) {
            duration = serviceDurations[i]
        }
    }

    const endDate = new Date(computeEnd(startDate, duration))

    let appointmentStartHour = new Date(startDate).getHours()
    let appointmentEndHour = endDate.getHours()

    if (endDate.getMinutes() > 0) {
        appointmentEndHour = (appointmentEndHour + 1) % 24
    }

    // returns whether each hour in hours is within the interval [start, end] 
    const within = (hours, interval) => {
        for (let i=0; i < hours.length; i+=1) {
            if (hours[i] > interval[1] || hours[i] < interval[0]) {
                return false
            }
        }

        return true
    }

    workingHoursEnd = workingHoursEnd === 0 ? 24 : workingHoursEnd
    const appointmentRange = [appointmentStartHour, appointmentEndHour]
    if (workingHoursStart < workingHoursEnd) {
        appointmentEndHour = appointmentEndHour === 0 ? 24 : appointmentEndHour
        if (within([appointmentStartHour, appointmentEndHour], [workingHoursStart, workingHoursEnd])) {
            return true
        }
    } else {
        if (appointmentStartHour > appointmentEndHour) {
            if (within([appointmentStartHour], [workingHoursStart, 24]) && within([appointmentEndHour], [0, workingHoursEnd])) {
                return true
            }
        } else {
            if (within(appointmentRange, [workingHoursStart, 24]) || within(appointmentRange, [0, workingHoursEnd])) {
                return true
            }
        }
    } 

    return 300
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
    errorMsg.hidden = true
    confirmMsg.hidden = true

    if (!salon || !customerName || !customerPhone || !dateTime || !service) {
        errorMsg.hidden = false
        errorMsg.textContent = "All required fields must be filled out." 
        return
    }

    // check if time falls within salon working hours
    let res = await withinWorkingHours(salon, service, new Date(dateTime).toString())

    if (res === 300) {
        errorMsg.hidden = false
        errorMsg.textContent = "Not within salon working hours." 
        return 
    } else if (res === 301) {
        errorMsg.hidden = false
        errorMsg.textContent = "Not within salon working days." 
        return
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

    confirmMsg.hidden = false

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
