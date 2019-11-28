module.exports = class TreeNodeLookupError extends Error {
    constructor() {
        super(...arguments);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, TreeNodeLookupError)
    }
};