const productnameid = document.getElementById("productnameX");
const descriptionid = document.getElementById("descriptionX");
const regularPriceid = document.getElementById("regularPriceX");
const salePriceid = document.getElementById("salePriceX");
const smallsize_quantityid = document.getElementById("ssizeq");
const mediumsize_quantityid = document.getElementById("msizeq");
const largesize_quantityid = document.getElementById("lsizeq");
const colorid = document.getElementById("colorX");
const imageid = document.getElementById("imageInput");
const productNameError = document.getElementById("productName-error");
const descriptionError = document.getElementById("description-error");
const regularPriceError = document.getElementById("regularPrice-error");
const salePriceError = document.getElementById("salePrice-error");
const smallError = document.getElementById("s-error");
const mediumError = document.getElementById("m-error");
const largeError = document.getElementById("l-error");
const colorError = document.getElementById("color-error");
const imageError = document.getElementById("image-error");
const editproductForm = document.getElementById("editproductForm");

function validateProductName() {
  const productName = productnameid.value.trim();
  if (productName === "") {
    productNameError.style.display = "block";
    productNameError.innerHTML = "Product Name cannot be empty";
    productNameError.style.color = "red";
  } else if (!/^[a-zA-Z\s]+$/.test(productName)) {
    productNameError.style.display = "block";
    productNameError.innerHTML = "Product Name should contain only alphabets";
    productNameError.style.color = "red";
  } else {
    productNameError.style.display = "none";
    productNameError.innerHTML = "";
  }
}

function validateDescription() {
  const description = descriptionid.value.trim();
  if (description === "") {
    descriptionError.style.display = "block";
    descriptionError.innerHTML = "Description cannot be empty";
    descriptionError.style.color = "red";
  } else {
    descriptionError.style.display = "none";
    descriptionError.innerHTML = "";
  }
}

function validateRegularPrice() {
  const regularPrice = parseFloat(regularPriceid.value);
  if (isNaN(regularPrice) || regularPrice <= 0) {
    regularPriceError.style.display = "block";
    regularPriceError.innerHTML =
      "Regular price must be a valid positive number";
    regularPriceError.style.color = "red";
  } else {
    regularPriceError.style.display = "none";
    regularPriceError.innerHTML = "";
  }
}

function validateSalePrice() {
  const regularPrice = parseFloat(regularPriceid.value);
  const salePrice = parseFloat(salePriceid.value);
  if (isNaN(salePrice) || salePrice <= 0 || regularPrice < salePrice) {
    salePriceError.style.display = "block";
    salePriceError.innerHTML =
      "Sale price must be a valid positive number less than Regular price";
    salePriceError.style.color = "red";
  } else {
    salePriceError.style.display = "none";
    salePriceError.innerHTML = "";
  }
}

function validateSmallSizeQuantity() {
  const smallSizeQuantity = parseInt(smallsize_quantityid.value);
  if (isNaN(smallSizeQuantity) || smallSizeQuantity < 0) {
    smallError.style.display = "block";
    smallError.innerHTML =
      "Small Size Quantity must be a valid non-negative number";
    smallError.style.color = "red";
  } else {
    smallError.style.display = "none";
    smallError.innerHTML = "";
  }
}

function validateMediumSizeQuantity() {
  const mediumSizeQuantity = parseInt(mediumsize_quantityid.value);
  if (isNaN(mediumSizeQuantity) || mediumSizeQuantity < 0) {
    mediumError.style.display = "block";
    mediumError.innerHTML =
      "Medium Size Quantity must be a valid non-negative number";
    mediumError.style.color = "red";
  } else {
    mediumError.style.display = "none";
    mediumError.innerHTML = "";
  }
}

function validateLargeSizeQuantity() {
  const largeSizeQuantity = parseInt(largesize_quantityid.value);
  if (isNaN(largeSizeQuantity) || largeSizeQuantity < 0) {
    largeError.style.display = "block";
    largeError.innerHTML =
      "Large Size Quantity must be a valid non-negative number";
    largeError.style.color = "red";
  } else {
    largeError.style.display = "none";
    largeError.innerHTML = "";
  }
}

function validateColor() {
  const color = colorid.value.trim();
  if (color === "") {
    colorError.style.display = "block";
    colorError.innerHTML = "Color is required";
    colorError.style.color = "red";
  } else if (!/^[a-zA-Z\s]*$/.test(color)) {
    colorError.style.display = "block";
    colorError.innerHTML = "Color should contain only alphabets and spaces";
    colorError.style.color = "red";
  } else {
    colorError.style.display = "none";
    colorError.innerHTML = "";
  }
}

function validateImageCount() {
  const imgCount = imageid.files.length;
  if (imgCount > 5) {
    imageError.style.display = "block";
    imageError.innerHTML = "Only 5 images can be uploaded";
    imageError.style.color = "red";
  } else {
    imageError.style.display = "none";
    imageError.innerHTML = "";
  }
}

productnameid.addEventListener("blur", validateProductName);
descriptionid.addEventListener("blur", validateDescription);
regularPriceid.addEventListener("blur", validateRegularPrice);
salePriceid.addEventListener("blur", validateSalePrice);
smallsize_quantityid.addEventListener("blur", validateSmallSizeQuantity);
mediumsize_quantityid.addEventListener("blur", validateMediumSizeQuantity);
largesize_quantityid.addEventListener("blur", validateLargeSizeQuantity);
colorid.addEventListener("blur", validateColor);
imageid.addEventListener("blur", validateImageCount);

editproductForm.addEventListener("submit", function (event) {
  validateProductName();
  validateDescription();
  validateRegularPrice();
  validateSalePrice();
  validateSmallSizeQuantity();
  validateMediumSizeQuantity();
  validateLargeSizeQuantity();
  validateColor();
  validateImageCount();

  if (
    productNameError.innerHTML !== "" ||
    descriptionError.innerHTML !== "" ||
    regularPriceError.innerHTML !== "" ||
    salePriceError.innerHTML !== "" ||
    smallError.innerHTML !== "" ||
    mediumError.innerHTML !== "" ||
    largeError.innerHTML !== "" ||
    colorError.innerHTML !== "" ||
    imageError.innerHTML !== ""
  ) {
    event.preventDefault();
    console.log("Validation failed");
  } else {
    console.log("Validation passed");
  }
});