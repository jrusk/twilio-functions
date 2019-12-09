const xml = require('xml');

/* Compares query param `patterns` to param `cid_name` and returns XML with true or false.
 *
 * https://your-twilio-function-url?patterns=foo,bar&cid_name=foo will return XML with result = true
 *
 * https://your-twilio-function-url?patterns=foo,bar&cid_name=baz will return XML with result = false
 *
 */

exports.handler = function(context, event, callback) {
  let patterns = event.patterns.split(',');
  patterns = patterns.map(p => {
    return new RegExp(p, 'i');
  });

  let result = false;

  patterns.forEach(p => {
    if (p.test(event.cid_name)) {
      result = true;
    }
  });

  const xmlResponse = {
    response: [
      {
        result: [
          {
            ivr_info: [
              {
                variables: [
                  {
                    variable: [{ name: 'result' }, { value: result }],
                  },
                ],
              },
            ],
          },
        ],
      },
    ],
  };

  declaration = { encoding: 'ISO-8859-1' };

  let response = new Twilio.Response();
  response.setBody(xml(xmlResponse, { declaration: declaration }));

  callback(null, response);
};
