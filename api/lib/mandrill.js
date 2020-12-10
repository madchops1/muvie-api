'strict'

// ENV VARS
const dotenv = require('dotenv');
dotenv.config();

// Mandrill
let mandrill = require('mandrill-api/mandrill');
let mandrill_client = new mandrill.Mandrill(process.env.MAILCHIMP_MANDRILL_API_KEY);

let sendEmail = (htmlContent, fromEmail, fromName, toEmail, toName, subject) => {
    return new Promise((resolve, reject) => {

        let message = {
            "html": "<p>Example HTML content</p>",
            "subject": "example subject",
            "from_email": fromEmail,
            "from_name": fromName,
            "to": [{
                "email": toEmail,
                "name": toName,
                "type": "to"
            }],
            "headers": {
                "Reply-To": "no-reply@visualzstudio.com"
            }
        };

        let async = false;
        let ip_pool = "Main Pool";
        let send_at = "example send_at";
        mandrill_client.messages.send({ "message": message, "async": async, "ip_pool": ip_pool, "send_at": send_at }, function (result) {
            console.log(result);
            resolve(result);
        }, function (e) {
            console.log('A mandrill error occurred: ' + e.name + ' - ' + e.message);
            reject(err);
        });
    });
}

// Mailchimp Unsubscribe From list
// todo...
//

module.exports = {
    sendEmail: sendEmail
};