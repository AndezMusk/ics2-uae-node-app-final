import express from "express"
import bodyParser from "body-parser"
import mongoose from "mongoose"
import { configDotenv } from "dotenv"
import nodemailer from "nodemailer"
configDotenv()



const app = express()
const PORT = 3000



app.use(express.static("public"))
app.use(bodyParser.urlencoded({extended:true}))
app.set("view engine","ejs")


app.route("/").get((req,res)=>{
res.render("home")
})
app.route("/contact").get((req,res)=>{
res.render("contact")
}).post(async (req,res)=>{
    console.log("sending email",req.body)
    const {name,email,subject,message} = req.body
    if(!name || !email || !subject || !message){
        return res.status(400).send("All Fields Are Required")
    }
    const transporter = nodemailer.createTransport({
        service :"gmail",
        auth :{
            user : process.env.EMAIL,
            pass :  process.env.EMAIL_PASSWORD
        }
    })


    const receipientEmail = "webigeeksofficial@gmail.com"


    const mailOptions = {
        from : process.env.EMAIL,
        to:receipientEmail,
        subject : "New Form Submission",
        html :    `<div style="max-width: 600px; margin: 0 auto; font-family: Arial, sans-serif; color: #333; border: 1px solid #ddd; border-radius: 8px; overflow: hidden; box-shadow: 0 4px 8px rgba(0,0,0,0.1);">
        <div style="background-color: #4CAF50; padding: 20px; text-align: center; color: white;">
            <img src=${"https://isc2chapter-uae.org/test/logo.png"} alt="Logo" style="width: 120px; margin-bottom: 10px;">
            <h1 style="margin: 0; font-size: 24px;">New Form Submission</h1>
        </div>
        <div style="padding: 20px;">
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>Email:</strong> ${email}</p>
            <p><strong>Message:</strong></p>
            <div style="background-color: #f9f9f9; border-left: 4px solid #4CAF50; padding: 15px; margin-top: 10px; border-radius: 4px;">
                ${message}
            </div>
        </div>
        <div style="background-color: #f1f1f1; padding: 10px; text-align: center; font-size: 12px; color: #666;">
            <p style="margin: 0;">Thank you for reaching out to us. We'll get back to you soon!</p>
            <p style="margin: 5px 0;">&copy; ${new Date().getFullYear()} ISC2</p>
        </div>
    </div>`
    }

    try{
        await transporter.sendMail(mailOptions);
        res.status(200).send("Email Sent Successfully")
    }catch(error){

        console.error(error)
        res.status(500).send("Failed to send email")
    }
})




app.listen(PORT,()=>{
    console.log("Server started on port :",PORT)
})