document.getElementById("regForm").addEventListener("submit", (e) => {
    e.preventDefault()
})

let verify = '';

const generateRandomString = (length) => {
    const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let randomString = '';
    for (let i = 0; i < length; i++) {
      const randomIndex = Math.floor(Math.random() * charset.length);
      randomString += charset[randomIndex];
    }
    return randomString;
  }

document.getElementById("regBtn").addEventListener("click", async (e) => {
    const errorMsg = document.getElementById("r_error")

    const storeName = document.getElementById("storeName").value
    const password = document.getElementById("password").value
    const captcha = document.getElementById("captcha").value

    const res = await fetch(`/register/${storeName}/${password}/${captcha}`, {
        method: "POST"
    })

    if (!res.ok) {
        errorMsg.hidden = false
        console.log("Incorrect register")
    } 
    else {
        // request admin page from server
        window.location.href = '/admin/' + storeName
    }
})

document.getElementById("sendCode").addEventListener("click", async (e) =>{

    const receivedEmail = document.getElementById("email").value

    if(document.getElementById("email").checkValidity()){
    const captcha = generateRandomString(6);
    verify = captcha;
    const res = await fetch(`/sendData/${receivedEmail}/${captcha}`, {
        method: 'POST', 
    });
    } else {
        alert('Please enter proper email');
    }
})

document.getElementById("testingCaptcha").addEventListener("click", async (e) =>{
    const captcha = document.getElementById("captcha").value
    if(captcha === verify){
        alert('CORRECT!');
    } else {
        alert('WRONG!');
    }
})
