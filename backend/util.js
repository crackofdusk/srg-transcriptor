exports.queryRegex = function(query) {
    return new RegExp(
        query.replace(/[\-\[\]\/\{\}\(\)\*\+\?\.\\\^\$\|]/g, "\\$&"),
        'gi'
    );
};
