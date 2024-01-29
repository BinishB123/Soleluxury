const verify = async (req, res) => {
    try {

        const sendedOtp = 1;
        const verifyOtp = 1;
        console.log(sendedOtp)
        console.log(verifyOtp)
        console.log("started checking")

        return sendedOtp === verifyOtp;
        res.json({message: 'otp verified'})
    } catch (error) {
        console.log(error);
        return false;
    }
}

console.log(verify)