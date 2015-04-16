
export function load(url) {
	return new Promise((resolve, reject) => {
        var request = new XMLHttpRequest();
        request.onload = e => {
            if ( e.target.status !== 200) {
                reject(e.target.statusText);
            } else {
                resolve(JSON.parse(e.target.response));
            }
        };

        request.onerror = e => {
            reject(e.target.statusText);
        };
        request.open('GET', url);
        request.send();
    });
}

export function parseDataAttrFloats (data, keys) {
    var _ = require('underscore');

    _.each(data, (v,k) => {
        if ( _.contains(keys, k) ) data[k] = parseFloat(v);
    });

    return data;
}
