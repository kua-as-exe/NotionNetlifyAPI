const NotionAPI = require('notion-client').NotionAPI;
const notion = new NotionAPI();

const extractProps = require('../helpers/notion-helpers').extractProps;

const getPageData = async (id) => {
    const output = await notion.getPage(id);
        
    let collection = extractProps(Object.values(output.collection)[0].value, [
        'cover',  'description', 
        'icon', 'id', 
        'name',  'schema'
    ])

    let blocks = output.block;
    const processed = Object.keys(blocks).map( key => 
        blocks[key].value
    ).filter( block => (
        block.type == 'page'
    )).map( block => extractProps(block, [
        'id', 
        'created_time', 
        'last_edited_time', 
        'version', 
        'properties', 
        'created_by_id', 
        'last_edited_by_id'
    ])).map( block => {
        let { id, properties: p, ...metadata } = block;
        let properties = {}
        Object.keys(collection.schema).forEach( key => {
            let propKey = collection.schema[key].name;
            let prop = block.properties[key];

            let propValue = !!prop? prop[0] : null;
            if(propValue && propValue.length && propValue.length == 1)
                properties[propKey] = propValue[0]
            else
                properties[propKey] = propValue
        })
        return ({ id, ...properties, metadata })
    })

    collection.blocks = processed
    return collection;
}

exports.handler = async (event) => {
    const id = event.queryStringParameters.id ;
    if(!id) return {statusCode: 400, body: `No id provided`};

    return {
        statusCode: 200,
        body: JSON.stringify(await getPageData(id), null, 2),
      }
}