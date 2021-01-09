const NotionAPI = require('notion-client').NotionAPI;
const notion = new NotionAPI();

const {extractProps, clean} = require('../helpers/notion-helpers');
// const {extractProps, clean} = require('./helpers/notion-helpers');

getPageData = async (id) => {
    let users = {}
    const modificators = {
        'Autor': async (item) => {
            try{
                let authorID = item[1][0][1];
                if(users[authorID]) return users[authorID];

                let result = await notion.getUsers([authorID])
                // console.log(result)
                let userData = result.results[0].value;
                let name = `${userData.given_name} ${userData.family_name}`
                users[authorID] = name;
                return name
            }catch(e){
                // console.log(e);
                return item
            }
        },
        'Tags': async (item = '') => {
            return item.split(',');
        }
    }
    const filters = [
        (item = {properties: {Lito: ''}}) => item.properties.Lito == "Yes"
    ]

    const output = await notion.getPage(id);
        
    let collection = extractProps(Object.values(output.collection)[0].value, [
        // 'cover',  'description', 'icon', 'id', 'name',  
        'schema'
    ])
    let schema = collection.schema
    let blocks = output.block;
    let processed = Object.keys(blocks).map( key => 
        blocks[key].value
    ).filter( block => (
        block.type == 'page'
    )).map( (block) => {
        let { id, properties: prevProps } = block;
        let properties = {}
        Object.keys(schema).forEach( (key) => {
            let propKey = schema[key].name;
            let propValue = block.properties[key];            
            properties[propKey] = clean(propValue)
        })
        return ({ id, properties })
    })
    for (let block of processed) {
        if(!block || !block.properties) continue;
        for(let [key, value] of Object.entries(block.properties)){
            if(modificators[key]){
                console.log("Modificator: ", key);
                block.properties[key] = await modificators[key](value);
            }
        }
    }
    processed = processed.filter( filters[0] )
    processed = processed.map( ({id, properties}) => ({id, ...properties}))
    // return {users, processed};
    return processed;
}
// ( async() => {
//     xd = await getPageData("1b489ba4bc6b4c4b963c7bca626dc497");
//     console.log(xd)
// })()

exports.handler = async (event) => {
    const id = event.queryStringParameters.id ;
    if(!id) return {statusCode: 400, body: `No id provided`};

    return {
        statusCode: 200,
        headers: {
            /* Required for CORS support to work */
            'Access-Control-Allow-Origin': '*',
            /* Required for cookies, authorization headers with HTTPS */
            'Access-Control-Allow-Credentials': true
          },
        body: JSON.stringify(await getPageData(id), null, 2),
      }
}