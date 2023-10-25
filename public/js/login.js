document.getElementById("logForm").addEventListener("submit", (e) => {e.preventDefault()})

document.getElementById("loginBtn").addEventListener("click", async (e) => {
    const username = document.getElementById("l_username").value
    const password = document.getElementById("l_password").value
    const errorMsg = document.getElementById('l_error')

    const url = `/login/${username}/${password}`
    const res = await fetch(url, {
        method: "GET"
    })

    if (!res.ok) {
        errorMsg.hidden = false
        console.log("Incorrect login:", username, password)
    } 
    else {
        window.location.href = "/admin/" + username
    }
})