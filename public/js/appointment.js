// send request to server when user inputs types into search bar
document.getElementById("search").addEventListener("keyup", async (e) => {
    const searchInput = e.target.value

    // send request to server to get search results
    const res = await fetch('search/' + searchInput)

    // add droop down options
    // res.body.stores.forEach(store => {
    //     let elem = document.createElement("option")
    //     elem.setAttribute("value", store.id)
    //     elem.textContent = store.name
    // });
    
    // add drop down options

    e.target.hidden = false
})  