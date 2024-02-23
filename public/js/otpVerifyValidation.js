function validateEmail(email) {
    console.log("email validating")
    const emailPattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/;
    return emailPattern.test(email);
}

function otpSend() {
    console.log("clicked send otp")
    const emailInput = document.getElementById("newemail");

    let email = emailInput.value;

    const emailError = document.getElementById('emailError');
    const sendOtpButton = document.getElementById('sendOtp');

    
    const isValidEmail = validateEmail(emailInput.value);
    console.log(isValidEmail)


    if (!isValidEmail && emailInput.value !== '') {
        emailError.style.display = 'block'; 
        sendOtpButton.disabled = true;
        setTimeout(function(){
            sendOtpButton.disabled = false;
            emailError.style.display = 'none'
        },4000)
      
    } else {
        emailError.style.display = 'none'; // Hide error message
       
    }




    if (isValidEmail) {
        console.log("otp sending")
        
        $.ajax({
            url: `/sendotp`,
            type: 'POST',
            data: JSON.stringify({ email: email }),
            contentType: 'application/json',
            success: function(response) {
              Toastify({
                text: response.message,
                 backgroundColor: "green",
             duration: 6000,
             position: "center" 
         }).showToast();
              const verifyButton = document.getElementById("verify");
                verifyButton.innerHTML = "Verify";
                startTimer();
                const messageDisplay = document.getElementById("emailError");
                messageDisplay.innerHTML = response.message;
                messageDisplay.style.color = 'green';
                setTimeout(function() {
                    messageDisplay.innerHTML = '';
                     // Clear the email input field after success
                }, 6000);
                document.querySelector(".otp").disabled = true;
                
            },
            error: function(error) {
                console.error('Error sending OTP:', error.responseJSON.error);
            }
        });
    } else {
        console.error('Invalid email');
    }
}




function startTimer() {
  let timer = 30;
  const timerDisplay = document.getElementById('timerDisplay');

  intervalId = setInterval(function() {
    timerDisplay.textContent = timer + " Sec Left";
    timer--;

    if (timer < 0) {
      clearInterval(intervalId);
      resetTimer();
      document.querySelector(".otp").disabled=false;
    }
  }, 1000);
}




function resetTimer() {
  const timerDisplay = document.getElementById('timerDisplay');
  document.querySelector(".otp").disabled= false;
  timerDisplay.textContent = '';
}


function verifyOTP() {
    $('#verify').click(function() {
      const otpverify = document.getElementById("otpverify");
      const otpnumber = otpverify.value;
      const emailInput = document.getElementById("newemail");

      let email = emailInput.value;
      console.log(email)
  
      $.ajax({
        url: "/verify",
        type: "POST",
        data: JSON.stringify({ otp: otpnumber }),
        contentType: "application/json",
        success: function(response) {
          const verifyButton = document.getElementById("verify");
          if (response.status) {
            verifyButton.innerHTML = "Verified";
            clearInterval(intervalId);
            document.getElementById('timerDisplay').style.display = 'none';
            document.querySelector(".otp").disabled = false;
          } else {
            verifyButton.innerHTML = "Failed";
            clearInterval(intervalId);
            resetTimer();
          }
        },
        error: function(error) {
          console.error('Error verifying OTP:', error.responseJSON.error);
        }
      });
    });
  }
  
  $(document).ready(function() {
    verifyOTP();
  });

  

 