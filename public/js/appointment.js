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
    const res = await fetch('/services/' + salon, {
        method: 'GET',
    })
    console.log(res.services)
    console.log(res.durations)

    // display servies
    // for (let i=0; i < res.services; i+=1) {

    // }
}