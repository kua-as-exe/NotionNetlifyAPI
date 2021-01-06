const NotionAPI = require('notion-client').NotionAPI;
const notion = new NotionAPI();

// functions/hello.js
exports.handler = async event => {
  const id = event.queryStringParameters.id ;
  if(!id) return {statusCode: 400, body: `No id provided`};

  try {
      let data = await  notion.getPage(id)
      return {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true
        },
        body: JSON.stringify(data),
      }
      
  } catch (error) {
    return { statusCode: 400, body: JSON.stringify({error}) }
  }
}