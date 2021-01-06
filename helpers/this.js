const React = require('react');
const ReactDOMServer = require('react-dom/server');
const NotionRenderer = require('react-notion-x').NotionRenderer;
const NotionAPI = require('notion-client').NotionAPI;

const {readFileSync} = require('fs');
const notion = new NotionAPI();

exports.getPageContent = async (id) => {
    const recordMap = await notion.getPage(id);
    let cssModule = [
        "node_modules/react-notion-x/src/styles.css",
        "node_modules/prismjs/themes/prism-tomorrow.css",
        "node_modules/rc-dropdown/assets/index.css",
        //"node_modules/katex/dist/katex.min.css",
    ];
    let css = cssModule.map( cssModule => readFileSync(cssModule).toString()).join('\n\n');
    console.log(css)

    let props = { recordMap  }
    let notionHTML = ReactDOMServer.renderToStaticMarkup(
        React.createElement(NotionRenderer, props)
    )

    return (`
    <html lang="en">
      <head>
        <meta charset="utf-8">
      </head>
      <body>
      <script src="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.12.0/katex.min.js" integrity="sha512-/CMIhXiDA3m2c9kzRyd97MTb3MC6OVnx4TElQ7fkkoRghwDf6gi41gaT1PwF270W6+J60uTmwgeRpNpJdRV6sg==" crossorigin="anonymous"></script>
      <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/KaTeX/0.12.0/katex.min.css" integrity="sha512-h7nl+xz8wgDlNM4NqKEM4F1NkIRS17M9+uJwIGwuo8vGqIl4BhuCKdxjWEINm+xyrUjNCnK5dCrhM0sj+wTIXw==" crossorigin="anonymous" />
      <style>
      ${css}
      </style>
      ${notionHTML}
      <style>.notion-page {width: 80vw !important;}</style>
      </body>
    </html>
    `);
}