import nodemailer from "nodemailer";

export const sendEmail = async (to: string, text: string) => {
  try {
    // Create a test account from Ethereal (for testing purposes)
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    // Define email options
    let mailOptions = {
      from: '"Support" <support@example.com>', // Sender address
      to: to, // Receiver's email
      subject: "Reset Password",
      text: text, // Plain text body
    };

    // Send the email
    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error occurred while sending email: ", err);
    throw err; // Optionally, throw error to be handled by caller
  }
};
