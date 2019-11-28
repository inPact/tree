const _ = require('lodash');
const TreeNodeRecursionError = require('./tree_node_recursion_error');

module.exports = class RecursionGuard {
    constructor(key = '_id', parentKey = 'parentId', nodes, nodesById) {
        this._key = key;
        this._parentKey = parentKey;
        this._nodes = nodes;
        this._nodesById = nodesById;
    }

    validateTree() {
        let validSet = {};
        this._nodes.forEach(node => {
            if(!validSet[node[this._key]]){
                _.assign(validSet, this._validateNode(node));
            }
        })
    }

    _validateNode(node){
        let validating = {};
        let pathLiteral = `${node[this._key]},`;
        validating[node[this._key]] = true;
        while(node && node[this._parentKey]){
            node = this._nodesById[node[this._parentKey]];
            if(node) {
                pathLiteral += `${node[this._key]},`;
                if (validating[node[this._key]])
                    throw new TreeNodeRecursionError(`Recursive Node to Parent relationship found. Path: ${_.trim(pathLiteral, ',')}`);
                validating[node[this._key]] = true;
            }
        }
        return validating;
    }


};