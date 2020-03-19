import mailgun from "mailgun-js"
import { isProduction } from "./environment"

const APP_DOMAIN = process.env.APP_DOMAIN
const MAILGUN_SERVICE = mailgun({apiKey: process.env.MAILGUN_API_KEY, domain: APP_DOMAIN })

const shouldSendEmail = isProduction && APP_DOMAIN && MAILGUN_SERVICE

const generatePayload = ({ toEmail, subject, template, data }) => ({
  from: "Team Invoy <team@invoy.com.au>",
  to: toEmail,
  subject,
  template,
  "h:X-Mailgun-Variables": JSON.stringify(data)
})

export const TransactionalEmail = {
  sendWelcomeEmail: ({ toEmail, toFirstName }) => {
    if (!shouldSendEmail){ return }

    const emailPayload = generatePayload({
      toEmail,
      toFirstName,
      subject: "Welcome to Invoy!",
      template: "welcome-email",
      data: { firstName: toFirstName }
    })

    MAILGUN_SERVICE.messages().send(emailPayload, (error, body) => {
      if (error){
        // TODO: Send error to exception handling service
        console.log("WELCOME_USER_EMAIL_ERROR: Error occured when trying to send email", { error })
      }
      else {
        console.log("Successfully sent Welcome User Email", body.id)
      }
    })
  },
  sendVerifyEmailAddressEmail: ({ toEmail, verificationCode }) => {
    if (!shouldSendEmail){ return }

    const emailPayload = generatePayload({
      toEmail,
      subject: "Verify email address!",
      template: "verify-email-address",
      // to format nicely in the email, will split verification code
      // for example , verificationCode = 10921 --> "1 0 9 2 1"
      data: { verificationCode: verificationCode.toString().split("").join(" ") }
    })

    MAILGUN_SERVICE.messages().send(emailPayload, (error, body) => {
      if (error){
        // TODO: Send error to exception handling service
        console.log("VERIFY_EMAIL_ADDRESS_EMAIL_ERROR: Error occured when trying to send email", { error })
      }
      else {
        console.log("Successfully sent Verify Email Address Email", body.id)
      }
    })
  },
  sentResetPasswordEmail: ({ toEmail, resetCode }) => {
    if (!shouldSendEmail){ return }

    const emailPayload = generatePayload({
      toEmail,
      subject: "Reset your password!",
      template: "reset-password",
      data: { resetCode }
    })

    MAILGUN_SERVICE.messages().send(emailPayload, (error, body) => {
      if (error){
        // TODO: Send error to exception handling service
        console.log("RESET_PASSWORD_EMAIL_ERROR: Error occured when trying to send email", { error })
      }
      else {
        console.log("Successfully sent Reset Password Email", body.id)
      }
    })
  }
}

export default TransactionalEmail