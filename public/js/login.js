document.getElementById("logForm").addEventListener("submit", (e) => {e.preventDefault()})

document.getElementById("loginBtn").addEventListener("click", async (e) => {
    const username = document.getElementById("l_username").value
    const password = document.getElementById("l_password").value
    const errorMsg = document.getElementById('l_error')
    
    if (username === "" || password === "") {
        errorMsg.hidden = false
        errorMsg.textContent = "Enter complete log-in credentials!"
        return
    }
    
    const url = `/login/${username}/${password}`
    const res = await fetch(url, {
        method: "GET"
    })

    if (res.status === 300) {
        errorMsg.hidden = false
        errorMsg.textContent = "Store does not exist, create an account to log in with this username."
    } else if (res.status === 301) {
        errorMsg.hidden = false
        errorMsg.textContent = "Incorrect password."
    } else {
        window.location.href = "/admin/" + username
    }
})