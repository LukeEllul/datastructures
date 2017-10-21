const { Map, List, fromJS } = require('immutable');

const checkIfObj = v => typeof v === 'object' && !Map.isMap(v) && !List.isList(v) && v !== null;
//const checkIfObjOrMap = (v1, v2) => (checkIfObj(v1) && !Array.isArray(v1) && checkIfObj(v2) && !Array.isArray(v2)) || (Map.isMap(v1) && Map.isMap(v2));
const checkIfObjOrMap = v => (checkIfObj(v) && !Array.isArray(v)) || Map.isMap(v);
const checkIfObjOrMaporList = v => Array.isArray(v) || List.isList(v) || checkIfObjOrMap(v);

const toMap = obj => Map.isMap(obj) ? obj : fromJS(obj);
const toList = array => List.isList(array) ? array : fromJS(array);

function depthOf(obj) {
    const object = Map.isMap(obj) ? obj.toJS() : obj;
    let level = 1;
    let key;
    for (key in object) {
        if (!object.hasOwnProperty(key)) continue;

        if (typeof object[key] == 'object') {
            let depth = depthOf(object[key]) + 1;
            level = Math.max(depth, level);
        }
    }
    return level;
}

const get = name => function check(obj) {
    const thisObj = toMap(obj);
    const v = thisObj.get(name);
    if (v) return v;
    const map = thisObj.filter(Map.isMap);
    return map.size > 0 ? map.map(v => check(v)).find(v => v ? true : false) : undefined;
}

const traverse = fn => (obj, key) => {
    const val = fn(obj, key);
    return Map.isMap(val) ? val.map((v, k) => traverse(fn)(v, k)) : val;
}

const nest = (body = Map({}), del, merge) => (key, value = Map({})) => {
    const thisBody = toMap(body);
    const thisValue = toMap(value);
    const prevValue = thisBody.get(key);
    return del ? thisBody.delete(key) : merge ? thisBody.set(key, List.isList(prevValue) ? prevValue.push(thisValue) : prevValue.merge(toMap(thisValue))) :
        thisBody.set(key, thisValue);
}

const obj = {
    body: {
        query: {
            match: 'hey',
            bool: true
        },
        hello: {
            hey: 'hey',
            match: {
                nuccu: 'duccu'
            }
        }
    }
}

const removeFromObj = key => obj =>
    traverse(v => Map.isMap(v) && v.has(key) ? v.delete(key) : v)(toMap(obj));

const changeKey = (key, value) => obj =>
    traverse((v, k) => k === key ? value : v)(toMap(obj));

module.exports = {
    checkIfObj,
    checkIfObjOrMap,
    checkIfObjOrMaporList,
    toMap,
    toList,
    depthOf,
    get,
    traverse,
    nest,
    removeFromObj,
    changeKey
}