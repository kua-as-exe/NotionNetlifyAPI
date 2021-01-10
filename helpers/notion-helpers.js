const clean = (value) => {
    if(!!value) null;
    if(typeof(value) == 'object' && value.length && value.length == 1)
        value = clean(value[0])
    return value;
}
const removeAccents = (str) =>  str.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
const toTileCase = (phrase) => 
    phrase
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
    
const uniqueName = (name) => removeAccents(toTileCase(name).replace(/ /g, ''))
const extractProps = (data, props = ['']) => {
    let t = {};
    props.forEach( prop => {
        if(prop) t[prop] = clean(data[prop])
    })
    return t;
}

exports.clean = clean;
exports.uniqueName = uniqueName;
exports.extractProps = extractProps;