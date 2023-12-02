document.getElementById("regForm").addEventListener("submit", (e) => {
    e.preventDefault()
})

//Code Verification saved on Client Side
let verify = '';

//Generates a Random String for Email Verification
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
    const errorCode = document.getElementById("r_code")

    const storeName = document.getElementById("storeName").value
    const password = document.getElementById("password").value
    const codeVerify = document.getElementById("codeVerify").value
    const receivedEmail = document.getElementById("email").value
    const phone = document.getElementById("phone").value

    //Confirms if the code matches
    if(codeVerify === verify){
        errorCode.hidden = true
        //Sends data OR Checks if name already exists
        const res = await fetch(`/register/${storeName}/${password}/${receivedEmail}/${phone}`, {
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

    } 
    else {
        errorMsg.hidden = true
        errorCode.hidden = false
        console.log("Incorrect code")
    }
})

document.getElementById("sendCode").addEventListener("click", async (e) =>{

    const emailError = document.getElementById("r_email")
    const receivedEmail = document.getElementById("email").value
    const sendCodeButton = document.getElementById("sendCode");
   

    if(document.getElementById("email").checkValidity()){
        const codeVerify = generateRandomString(6);
        verify = codeVerify;
        emailError.hidden = true;
        sendCodeButton.style.opacity = 0.5;
        sendCodeButton.style.cursor = "auto";
        sendCodeButton.classList.remove("Enabled");
        sendCodeButton.classList.add("Disabled");
        sendCodeButton.disabled = true;
        const res = await fetch(`/sendData/${receivedEmail}/${codeVerify}`, {
            method: 'POST', 
        });
    } else {
        emailError.hidden = false;
    }
})

// document.getElementById("testingMatch").addEventListener("click", async (e) =>{
//     const codeVerify = document.getElementById("codeVerify").value
//     if(codeVerify === verify){
//         alert('CORRECT!');
//     } else {
//         alert('WRONG!');
//     }
// })
// Testing Button - if trying to immediately check if captcha matching is correct or not
