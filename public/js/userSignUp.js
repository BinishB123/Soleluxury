const emailid = document.getElementById('typeEmailX');
const mobileid = document.getElementById('typeMobileX');
const passid = document.getElementById('typePasswordX');
const nameid = document.getElementById('typeNamex');
const error1 = document.getElementById('error1');
const error2 = document.getElementById('error2');
const error3 = document.getElementById('error3');
const error4 = document.getElementById('error4');
const referalcodeX = document.getElementById('referalcodeX')
const refferalCodeWarning = document.getElementById("refferalCodeWarning")
const regform = document.getElementById('logform');
function emailvalidate() {
  const emailval = emailid.value;
  const emailpattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/;

  if (!emailpattern.test(emailval)) {
    error2.style.display = 'block';
    error2.innerHTML = 'Invalid email';
    error2.style.color = 'red';
  } else {
    error2.style.display = 'none';
    error2.innerHTML = '';
  }
}

function mobvalidate() {
  const mobval = mobileid.value;
  const startsWithGreater = /^[7-9]/; 
  const notAllSameDigits = /^(?!(\d)\1{9})/; 
  if (mobval.trim() === '') {
      error3.style.display = 'block';
      error3.innerHTML = 'Please Enter a valid Mobile Number.';
  } else if (mobval.length !== 10) {
      error3.style.display = 'block';
      error3.innerHTML = 'Please Enter exactly 10 digits.';
  } else if (!startsWithGreater.test(mobval)) {
      error3.style.display = 'block';
      error3.innerHTML = 'Mobile number must start with a digit greater than 6.';
  } else if (!notAllSameDigits.test(mobval)) {
      error3.style.display = 'block';
      error3.innerHTML = 'Mobile number cannot consist of the same digit repeated 10 times.';
  } else {
      error3.style.display = 'none';
      error3.innerHTML = '';
  }
}


function passvalidate() {
  const passval = passid.value;
  const alpha = /[a-zA-Z]/;
  const digit = /\d/;

  if (passval.length < 8) {
    error4.style.display = 'block';
    error4.innerHTML = 'Must have at least 8 characters';
  } else if (!alpha.test(passval) || !digit.test(passval)) {
    error4.innerHTML = 'Should contain Numbers and Alphabets!!';
    error4.style.display = 'block';
  } else {
    error4.style.display = 'none';
    error4.innerHTML = '';
  }
}

function namevalidate() {
  const nameval = nameid.value.trim();
  if (nameval.trim() === '') {
    error1.style.display = 'block';
    error1.innerHTML = 'Please Enter a valid Name.';
  } else {
    error1.style.display = 'none';
    error1.innerHTML = '';
  }
}


function referalcode(){
  const referalcodeXval = referalcodeX.value.trim()
  // console.log(referalcodeXval)
  // console.log(refferalCodeWarning)
  if (referalcodeXval!=undefined && referalcodeXval!=null&&referalcodeXval!="") {
    // console.log(referalcodeXval.length)
     if (referalcodeXval.length!=15) {
      refferalCodeWarning.style.display ="none"
      refferalCodeWarning.style.display ="block"
      refferalCodeWarning.style.color ="red"
      refferalCodeWarning.innerHTML = "referral only have 15 characters"
     }else{
      refferalCodeWarning.style.display="none"
      refferalCodeWarning.innerHTML=""
     }
  }
}
emailid.addEventListener('blur', emailvalidate);
passid.addEventListener('blur', passvalidate);
mobileid.addEventListener('blur', mobvalidate);
nameid.addEventListener('blur', namevalidate);
referalcodeX.addEventListener("blur",referalcode)

regform.addEventListener('submit', function (e) {
 

  emailvalidate();
  mobvalidate();
  passvalidate();
  namevalidate();
  referalcode();

  // console.log('After validation');

  if (error1.innerHTML || error2.innerHTML || error3.innerHTML || error4.innerHTML||refferalCodeWarning.innerHTML) {
    // console.log('Validation failed');
   return e.preventDefault();
  }
});
