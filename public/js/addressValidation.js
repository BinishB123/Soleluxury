const addresNameInput = document.getElementById("addresName");
const addressMobileInput = document.getElementById("addressmobile");
const housenameInput = document.getElementById("housename");
const pincodeInput = document.getElementById("pincode");
const townOrCityInput = document.getElementById("townOrCity");
const districtInput = document.getElementById("district");
const stateInput = document.getElementById("state");
const countryInput = document.getElementById("country");

const addresNameError = document.getElementById("addresName-error");
const addressMobileError = document.getElementById("addressmobile-error");
const housenameError = document.getElementById("housename-error");
const pincodeError = document.getElementById("pincode-error");
const townOrCityError = document.getElementById("townOrCity-error");
const districtError = document.getElementById("district-error");
const stateError = document.getElementById("state-error");
const countryError = document.getElementById("country-error");

function valName() {
  const addresName = addresNameInput.value;

  const nameRegex = /^[a-zA-Z\s]+$/;
  if (addresName.trim() === "") {
    addresNameError.style.display = "block";
    addresNameError.innerHTML = "Name is required";
    addresNameError.style.color = "red"; // Update this line
  } else if (!addresName.match(nameRegex)) {
    addresNameError.style.display = "block";
    addresNameError.innerHTML = "Invalid name";
    addresNameError.style.color = "red"; // Update this line
  } else {
    addresNameError.style.display = "none";
    addresNameError.innerHTML = ""; // Reset error message
  }
}

function valMobile() {
  const addressMobile = addressMobileInput.value;
  const startsWithGreater = /^[7-9]/;
  const notAllSameDigits = /^(?!(\d)\1{9})/;
  if (addressMobile.trim() === "") {
    addressMobileError.style.display = "block";
    addressMobileError.innerHTML = "Mobile number is required";
    addressMobileError.style.color = "red";
  } else if (!startsWithGreater.test(addressMobile)) {
    addressMobileError.style.display = "block";
    addressMobileError.innerHTML = "Mobile number is not valid";
    addressMobileError.style.color = "red";
  } else if (!notAllSameDigits.test(addressMobile)) {
    addressMobileError.style.display = "block";
    addressMobileError.innerHTML = "Enter a valid mobile number";
    addressMobileError.style.color = "red";
  } else if (addressMobile.length > 10 || addressMobile.length < 10) {
    addressMobileError.style.display = "block";
    addressMobileError.innerHTML = "Enter a valid mobile number";
    addressMobileError.style.color = "red";
  } else {
    addressMobileError.style.display = "none";
    addressMobileError.innerHTML = "";
  }
}

function valhousename() {
  const housename = document.getElementById("housename").value;

  if (housename.trim() === "") {
    housenameError.style.display = "block";
    housenameError.innerHTML = "House name is required";
    housenameError.style.color = "red";
  } else {
    housenameError.style.display = "none";
    housenameError.innerHTML = "";
  }
}

function valpincode() {
  const pincode = document.getElementById("pincode").value;

  if (pincode.trim() === "") {
    pincodeError.style.display = "block";
    pincodeError.innerHTML = "PIN code is required";
    pincodeError.style.color = "red";
  } else if (pincode.length !== 6) {
    pincodeError.style.display = "block";
    pincodeError.innerHTML = "PIN code must be 6 digits";
    pincodeError.style.color = "red";
  } else {
    pincodeError.style.display = "none";
    pincodeError.innerHTML = "";
  }
}

function valTownOrCity() {
  const townOrCity = document.getElementById("townOrCity").value;
  const townOrCityError = document.getElementById("townOrCity-error");
  const hasNumbers = /\d/.test(townOrCity);

  if (townOrCity.trim() === "") {
    townOrCityError.style.display = "block";
    townOrCityError.innerHTML = "Town/City is required";
    townOrCityError.style.color = "red";
  }
  // Check if townOrCity contains any numbers
  else if (hasNumbers) {
    townOrCityError.style.display = "block";
    townOrCityError.innerHTML = "Town/City should not contain numbers";
    townOrCityError.style.color = "red";
  } else {
    townOrCityError.style.display = "none";
    townOrCityError.innerHTML = "";
  }
}

function valDistrict() {
  const district = document.getElementById("district").value;
  const districtError = document.getElementById("district-error");
  const hasNumbers = /\d/.test(district);

  if (district.trim() === "") {
    districtError.style.display = "block";
    districtError.innerHTML = "District is required";
    districtError.style.color = "red";
  } else if (hasNumbers) {
    districtError.style.display = "block";
    districtError.innerHTML = "District should not contain numbers";
    districtError.style.color = "red";
  } else {
    districtError.innerHTML = "";
    districtError.style.display = "none";
  }
}

function valCountry() {
  const country = document.getElementById("country").value;
  const countryError = document.getElementById("country-error");
  const hasNumbers = /\d/.test(country);

  if (country.trim() === "") {
    countryError.style.display = "block";
    countryError.innerHTML = "Country is required";
    countryError.style.color = "red";
  } else if (hasNumbers) {
    countryError.style.display = "block";
    countryError.innerHTML = "Country should not contain numbers";
    countryError.style.color = "red";
  } else {
    countryError.style.display = "none";
    countryError.innerHTML = "";
  }
}

function valState() {
  const state = document.getElementById("state").value;
  const stateError = document.getElementById("state-error");
  const hasNumbers = /\d/.test(state);

  if (state.trim() === "") {
    stateError.style.display = "block";
    stateError.innerHTML = "State is required";
    stateError.style.color = "red";
  } else if (hasNumbers) {
    stateError.style.display = "block";
    stateError.innerHTML = "State should not contain numbers";
    stateError.style.color = "red";
  } else {
    stateError.style.display = "none";
    stateError.innerHTML = "";
  }
}

addresNameInput.addEventListener("blur", valName);
addressMobileInput.addEventListener("blur", valMobile);
housenameInput.addEventListener("blur", valhousename);
pincodeInput.addEventListener("blur", valpincode);
townOrCityInput.addEventListener("blur", valTownOrCity);
districtInput.addEventListener("blur", valDistrict);
stateInput.addEventListener("blur", valState);
countryInput.addEventListener("blur", valCountry);

const addAddressForm = document.getElementById("addaddressForm");

addAddressForm.addEventListener("submit", function (e) {
  console.log("Form submitted");

  valName();
  valMobile();
  valhousename();
  valpincode();
  valTownOrCity();
  valDistrict();
  valState();
  valCountry();

  if (
    addresNameError.innerHTML ||
    addressMobileError.innerHTML ||
    housenameError.innerHTML ||
    pincodeError.innerHTML ||
    townOrCityError.innerHTML ||
    districtError.innerHTML ||
    stateError.innerHTML ||
    countryError.innerHTML
  ) {
    console.log("Validation failed");
    e.preventDefault();
  } else {
    console.log("Validation passed");

    this.submit(); //
    console.log("Validation passed");
  }
});

const newpass = document.getElementById("newpassword");
const cnfpass = document.getElementById("confrmpass");
console.log(newpass);

const error2 = document.getElementById("error2");
const error3 = document.getElementById("error3");
const passform = document.getElementById("passform");

function passvalidate() {
  const alpha = /[a-zA-Z]/;
  const digit = /\d/;

  const newpassValue = newpass.value;
  const cnfpassValue = cnfpass.value;

  if (newpassValue.length < 8 || cnfpassValue.length < 8) {
    error2.style.display = "block";
    error2.innerHTML = "Must have at least 8 characters";
    error3.style.display = "block";
    error3.innerHTML = "Must have at least 8 characters";
    error2.style.color = "red";
    error3.style.color = "red";
  } else if (!alpha.test(newpassValue) || !digit.test(newpassValue)) {
    error2.innerHTML = "Should contain Numbers and Alphabets!!";
    error2.style.display = "block";
    error3.style.display = "block";
    error3.innerHTML = "Should contain Numbers and Alphabets!!";
    error2.style.color = "red";
    error3.style.color = "red";
  } else {
    error2.style.display = "none";
    error2.innerHTML = "";
    error3.style.display = "none";
    error3.innerHTML = "";
    error2.style.color = "red";
    error3.style.color = "red";
  }

  if (newpassValue !== cnfpassValue) {
    error3.style.display = "block";
    error3.innerHTML = "Confirm password is not matching with new password";
  } else {
    error3.style.display = "none";
    error3.innerHTML = "";
  }
}

newpass.addEventListener("blur", passvalidate);
cnfpass.addEventListener("blur", passvalidate);

passform.addEventListener("submit", function (e) {
  console.log("Form submitted");
  passvalidate();
  console.log("After validation");
  if (error2.innerHTML || error3.innerHTML) {
    console.log("Validation failed");
    e.preventDefault();
  } else {
    console.log("Validation passed");
  }
});
