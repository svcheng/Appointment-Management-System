document.getElementById("logForm").addEventListener("submit", (e) => {
    e.preventDefault()
})

document.getElementById("loginBtn").addEventListener("click", async (e) => {
    const username = document.getElementById("l_username").value
    const password = document.getElementById("l_password").value
    const errorMsg = document.getElementById('l_error')

    let res = await fetch(`/login/${username}/${password}`, {
        method: "GET"
    })

    console.log(res)
    if (!res.ok) {
        errorMsg.hidden = false
        console.log("Incorrect login")
    } 
    else {
        window.location.href = "/admin/" + username
    }
})