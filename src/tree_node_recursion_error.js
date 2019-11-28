module.exports = class TreeNodeRecursionError extends Error {
    constructor() {
        super(...arguments);
        this.name = this.constructor.name;
        Error.captureStackTrace(this, TreeNodeRecursionError)
    }
};