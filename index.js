const jwt = require('jsonwebtoken');
const AWS = require('aws-sdk');
AWS.config.update({region: 'us-east-1'});

exports.handler = async (event, context, callback) => {
  const user = event.request.userAttributes;
  const email = user.email;
  const url = 'http://localhost:5173'; // change this variable for production

  // logic to add 3 minutes of exp to the JWT token
  const oldDateObj = new Date();
  const newDateObj = new Date();
  const exp = (newDateObj.setTime(oldDateObj.getTime() + (3 * 60 * 1000))) / 1000;

  const userWithAuthExpiry = {
    ...user,
    exp
  }

  // Encode userAttributes as a JWT
  const token = jwt.sign(userWithAuthExpiry, 'mysecret');

  // Create a custom HTML email
  const emailParams = {
    Destination: {
      ToAddresses: [ email ]
    },
    Message: {
      Body: {
        Html: {
          Charset: 'UTF-8',
          Data: `
            <p>Hello, welcome to RockCat</p>
            <p>Click the link below to log in:</p>
            <a href="${url}/#access_token=${token}&token_type=bearer&type=magiclink" style="display: inline-block; background: rgb(255, 0, 115); color: white; padding: 12px 64px; border-radius: 4px; text-decoration: none; margin: 0px 0px 24px; --darkreader-inline-bgimage: initial; --darkreader-inline-bgcolor:#b52667; --darkreader-inline-color:#c9c7c5;" target="_blank" data-darkreader-inline-bgimage="" data-darkreader-inline-bgcolor="" data-darkreader-inline-color="">
              Click to log in
            </a>
          `
        }
      },
      Subject: {
        Charset: 'UTF-8',
        Data: 'Your Magic Link to RockCat!'
      }
    },
    Source: 'vineethkunnathsg@gmail.com'
  };

  // create new SES object and send email
  await new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(emailParams).promise();

  // Return the lambdaResponse object
  return event;
};
