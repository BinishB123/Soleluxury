const emailid = document.getElementById('typeEmailX')
const error2 = document.getElementById('error2')

const regform = document.getElementById('logform')





function emailvalidate(e){
    const emailval = emailid.value
    const emailpattern = /^([a-zA-Z0-9._-]+)@([a-zA-Z.-]+).([a-zA-z]{2,4})$/

    if(!emailpattern.test(emailval)){
        error2.style.display = "block";     
        error2.innerHTML = "Invalid email";
        error2.style.color = red ; 
    }else{
        error2.style.display= "none"
        error2.innerHTML = ""
    }

}






1


emailid.addEventListener('blur',emailvalidate)



regform.addEventListener('submit', function (e) {

    // console.log('Form submitted'); 

    emailvalidate();
    
    // console.log('After validation'); 

    if ( error2.innerHTML) {
        // console.log('Validation failed'); 
       return e.preventDefault();
    } 
});
                     