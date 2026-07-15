import { createTransport } from "nodemailer";

const sendOTP = async (email , otp) =>{
    const transport = createTransport({
        service : "gmail",
        auth : {
            user : process.env.EMAIL_USER,
            pass : process.env.EMAIL_PASS
        }
    });

    await transport.sendMail({
        from : process.env.EMAIL_USER,
        to: email,
        subject: "your otp code",
        html: `<h2>your otp is ${otp}</h2>`
    });

}

export default sendOTP;