import nodemailer from "nodemailer";

/**
 * Asynchronous function to send an email using nodemailer.
 *
 * @param {string} to - The email address to send the email to.
 * @param {string} text - The text content of the email.
 * @returns {Promise<void>} A Promise that resolves once the email is sent successfully.
 * @throws {Error} If an error occurs while sending the email.
 */
export const sendEmail = async (to: string, text: string): Promise<void> => {
  try {
    let transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
      },
    });

    let mailOptions = {
      from: '"Support" <support@example.com>', // Sender address
      to: to,
      subject: "Reset Password",
      text: text,
    };

    let info = await transporter.sendMail(mailOptions);

    console.log("Message sent: %s", info.messageId);
    console.log("Preview URL: %s", nodemailer.getTestMessageUrl(info));
  } catch (err) {
    console.error("Error occurred while sending email: ", err);
    throw err;
  }
};
