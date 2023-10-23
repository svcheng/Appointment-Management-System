document.getElementById("regForm").addEventListener("submit", (e) => {
    e.preventDefault()
})

document.getElementById("regBtn").addEventListener("click", async (e) => {
    const errorMsg = document.getElementById("r_error")

    const storeName = document.getElementById("storeName").value
    const password = document.getElementById("password").value

    const res = await fetch(`/register/${storeName}/${password}`, {
        method: "POST"
    })

    console.log(res)

    if (!res.ok) {
        errorMsg.hidden = false
        console.log("Incorrect register")
    } 
    else {
        // request admin page from server
        
        // (placeholder) redirect to welcome
        window.location.href = '/static/welcome'
    }
})