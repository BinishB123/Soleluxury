$('#formsubmit').click(function(event) {
    event.preventDefault();
    if (validateAndSubmit()) {
        submitFormData(); 
    }
});

function submitFormData() {
  
    var formData = new FormData($('#productform')[0]);

   
    $.ajax({
        url: '/admin/addproducts',
        method: 'POST', 
        data: formData,
        contentType: false,
        processData: false,
        success: function(response) {
            if (response.errormessage && response.success === false) {
                document.getElementById("errormessage").innerHTML = response.errormessage;
                // console.log(response.errormessage);
                Toastify({
                    text: response.errormessage,
                    backgroundColor: "red",
                    duration: 5000,
                    position: "center" 
                }).showToast();
                
                // Hide the error message after 5 seconds
                setTimeout(function() {
                    document.getElementById("errormessage").innerHTML = "";
                }, 5000);
            }
            
            if (response.fileerrormessage && response.success === false) {
                document.getElementById("fileerrormessage").innerHTML = response.fileerrormessage;
                // console.log(response.fileerrormessage);
                
                // Hide the error message after 5 seconds
                setTimeout(function() {
                    document.getElementById("fileerrormessage").innerHTML = "";
                }, 5000);
            }
            
            if (response.success === true && response.message) {
                                     Toastify({
                                           text: response.message,
                                            backgroundColor: "green",
                                        duration: 5000,
                                        position: "center" 
                                    }).showToast();
                             
                                    // Redirect the user to the products page after a short delay
                                    setTimeout(function() {
                                       location.reload()
                                    }, 2000);
            }
                   if (response.status===false) {
                    Toastify({
                        text: response.message,
                         backgroundColor: "red",
                     duration: 5000,
                     position: "center" 
                 }).showToast();
                    
                   }

            
            
        },
        error: function(error) {
            // Handle error response
            console.error(error.responseText);
            // Display error message or handle the error accordingly
        }
    });
}
    





function validateAndSubmit() {
    if (validateForm()) {
        return true;
    } else {
        return false;
    }
}


    
function validateForm() {
    resetErrorMessages();

    let isValid = true;
    const productname = document.getElementById("productnameX").value.trim();
    const description = document.getElementById("descriptionX").value.trim();
    const color = document.getElementById("colorX").value.trim();
    const regularPrice = parseFloat(document.getElementById("regularPriceX").value);
    const discount = parseFloat(document.getElementById("discountX").value);
    const ssizeq = document.getElementById("ssizeq").value.trim();
    const msizeq = document.getElementById("msizeq").value.trim();
    const lsizeq = document.getElementById("lsizeq").value.trim();
    const fileerrormessage= document.getElementById('fileerrormessage')







    

    

    if (productname === "" ) {
        displayErrorMessage("productName-error", "Product Name is required");
        isValid = false;
    }

    if (description === "") {
        displayErrorMessage("description-error", "Description is required");
        isValid = false;
    }

    if ( regularPrice <= 0) {
        displayErrorMessage("regularPrice-error", "Regular price must be a valid positive number");
        isValid = false;
    }else if (isNaN(regularPrice)) {
        displayErrorMessage("regularPrice-error", "Regular price must be in number");
        isValid = false;
    }

     if (isNaN(discount) ) {
        displayErrorMessage("discount-error", "discount must be in numbers");
        isValid = false;
    }else if (discount <= 0 ) {
        displayErrorMessage("discount-error", "discount must be a valid positive number");
        isValid = false;
    }else if(discount >=100){
        displayErrorMessage("discount-error", "discount must be lessthan 100 ");
        isValid = false;
    }

    if (ssizeq === "" || isNaN(parseInt(ssizeq)) || parseInt(ssizeq) < 0) {
        displayErrorMessage("s-error", "Small Size Quantity must be a positive number");
        isValid = false;
    }

    if (msizeq === "" || isNaN(parseInt(msizeq)) || parseInt(msizeq) < 0) {
        displayErrorMessage("m-error", "Medium Size Quantity must be a positive number");
        isValid = false;
    }

    if (lsizeq === "" || isNaN(parseInt(lsizeq)) || parseInt(lsizeq) < 0) {
        displayErrorMessage("l-error", "Large Size Quantity must be a positive number");
        isValid = false;
    }

    if (color === "") {
        displayErrorMessage("color-error", "Color is required");
        isValid = false;
    } 
    if (fileerrormessage.innerHTML) {
        isValid = false
        console.log("from here",isValid,fileerrormessage)
    }

    return isValid;
}



    
        function displayErrorMessage(elementId, message) {
            var errorElement = document.getElementById(elementId);
            console.log(message)
            errorElement.innerText = message;
            errorElement.style.display = "block";
            errorElement.style.color = "red";
        }
    
        function resetErrorMessages() {
            var errorElements = document.querySelectorAll(".error-message");
            errorElements.forEach(function (element) {
                element.innerText = "";
                element.style.display = "none";
            });
        }
    