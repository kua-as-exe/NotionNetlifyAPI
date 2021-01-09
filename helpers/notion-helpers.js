const clean = (value) => {
    if(!!value) null;
    if(typeof(value) == 'object' && value.length && value.length == 1)
        value = clean(value[0])
    return value;
}

exports.extractProps = (data, props = ['']) => {
    let t = {};
    props.forEach( prop => {
        if(prop) t[prop] = clean(data[prop])
    })
    return t;
}
exports.clean = clean