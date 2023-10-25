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

    // retrieve and add services of selected salon
    let data = await fetch('/services/' + salon, {
        method: 'GET',
    })

    data = await data.json()

    console.log(data.services)
    console.log(data.durations)

    // display services
    for (let i=0; i < data.services.length; i+=1) {
        addServiceOption(data.services[i], data.durations[i])
    }
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