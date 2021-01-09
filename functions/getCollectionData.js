const NotionAPI = require('notion-client').NotionAPI;
const notion = new NotionAPI();

const {extractProps, clean} = require('../helpers/notion-helpers');
let users = {}
const modificators = {
    'Autor': async (item) => {
        try{
            let authorID = item[1][0][1];
            if(users[authorID]) return users[authorID];
            notion.getUsers([authorID]).then(result => {
                let userData = result.results[0].value;
                let name = `${userData.given_name} ${userData.family_name}`
                users[authorID] = name;
                return name
            })
        }catch(e){
            return item
        }
    }
}

const getPageData = async (id) => {
    const output = await notion.getPage(id);
        
    let collection = extractProps(Object.values(output.collection)[0].value, [
        // 'cover',  'description', 
        // 'icon', 'id', 
        // 'name',  
        'schema'
    ])
    let schema = collection.schema
    let blocks = output.block;
    const processed =
    Object.keys(blocks).map( key => 
        blocks[key].value
    ).filter( block => (
        block.type == 'page'
    ))/* .map( block => && extractProps(block, [
        'id', 
        // 'created_time', 
        // 'last_edited_time', 
        // 'version', 
        // 'properties', 
        // 'created_by_id', 
        // 'last_edited_by_id'
    ])) */.map( async (block) => {
        let { id, properties: t } = block;
        let properties = {}
         Object.keys(schema).forEach( async (key) => {
            let propKey = collection.schema[key].name;
            let propValue = clean(block.properties[key]);

            if(modificators[propKey]) propValue = await modificators[propKey](propValue);

            properties[propKey] = clean(propValue)
        //     /*if(propValue && propValue.length && propValue.length == 1)
        //          properties[propKey] = propValue[0]
        //     else
        //         properties[propKey] = propValue */
        })
        return ({ id, ...properties })
    })

    // collection.blocks = processed
    return {schema, processed};
}

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