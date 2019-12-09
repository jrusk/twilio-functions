const request = require('request');

exports.handler = function(context, event, callback) {
  const faxUrl = event.MediaUrl;

  request.get({ uri: faxUrl, encoding: null }, (error, response, body) => {
    const email = {
      personalizations: [{ to: [{ email: context.TO_EMAIL_ADDRESS }] }],
      from: { email: context.FROM_EMAIL_ADDRESS },
      subject: `New fax from ${event.From}`,
      content: [
        {
          type: 'text/plain',
          value: 'Your fax is attached.',
        },
      ],
      attachments: [],
    };
    if (!error && response.statusCode === 200) {
      email.attachments.push({
        content: body.toString('base64'),
        filename: `${event.FaxSid}.pdf`,
        type: response.headers['content-type'],
      });
    }
    request.post(
      {
        uri: 'https://api.sendgrid.com/v3/mail/send',
        body: email,
        auth: {
          bearer: context.SENDGRID_API_KEY,
        },
        json: true,
      },
      (error, response, body) => {
        if (error) {
          return callback(error, null);
        } else {
          if (response.statusCode === 202) {
            return callback(null, new Twilio.twiml.VoiceResponse());
          } else {
            return callback(null, body);
          }
        }
      },
    );
  });
};
