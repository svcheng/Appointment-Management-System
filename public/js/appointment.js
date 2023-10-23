// send request to server when user inputs types into search bar
document.getElementById("searchBar").addEventListener("keyup", async (e) => {
    const searchInput = e.target.value

    // send request to server to get search results
    
    const res = await fetch('/search/' + searchInput,  {
        method: "GET"
    })
    console.log(res)
    // add search suggestions
    // res.body.stores.forEach(store => {
    //     let elem = document.createElement("div")
//            elem.setAttribute("class", 'searchResult')
    //     elem.setAttribute("value", store)
    //     elem.textContent = store
    // });
})  