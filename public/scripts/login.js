document.getElementById("loginBtn").addEventListener("click", async (e) => {
    let username = document.getElementById("l_username")
    let password = document.getElementById("l_password")

    let res = await fetch(`/login/${username}/${password}`, {
        method: "GET"
    }).json()

    if (res.status == 400) {
        document.getElementById("errorMsg").hidden = false
    } else if (res.status == 200) {
        // request admin page from server
        
    }
})