document.getElementById("loginBtn").addEventListener("click", async (e) => {
    let username = document.getElementById("username")
    let password = document.getElementById("password")
    let storeName = document.getElementById("storeName")

    let res = await fetch(`/register/${username}/${password}/${storeName}`, {
        method: "POST"
    }).json()

    if (res.status == 400) {
        document.getElementById("errorMsg").hidden = false
    } else if (res.status == 200) {
        // request admin page from server
        
    }
})