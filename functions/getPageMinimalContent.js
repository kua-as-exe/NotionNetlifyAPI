
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const NotionRenderer = require('react-notion-x').NotionRenderer;
const NotionAPI = require('notion-client').NotionAPI;

const notion = new NotionAPI();
//const notionStyles = require('../helpers/styles.css')

const getPageContentXD = async (id) => {
    const recordMap = await notion.getPage(id);
    //  console.log(notionStyles)
    /* let cssModule = [
        "../node_modules/react-notion-x/src/styles.css",
        "../node_modules/prismjs/themes/prism-tomorrow.css",
        "../node_modules/rc-dropdown/assets/index.css",
        //"node_modules/katex/dist/katex.min.css",
    ]; */
    //let css = cssModule.map( cssModule => readFileSync(cssModule).toString()).join('\n\n');
    //console.log(css)

    let props = { recordMap  }
    let notionHTML = ReactDOMServer.renderToStaticMarkup(
        React.createElement(NotionRenderer, props)
    )

    return notionHTML;
}
//const getPageContent = require('../helpers/that.min.js');
exports.handler = async (event) => {
    const id = event.queryStringParameters.id ;
    if(!id) return {statusCode: 400, body: `No id provided`};

    let html = await getPageContentXD(id);
    return {
        statusCode: 200,
        'headers': {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true,
            'Cache-Control': 'no-cache',
            'Content-Type': 'text/html',
        },
        body: html,
    }
}