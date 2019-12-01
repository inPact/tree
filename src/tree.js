const _ = require('lodash');
const TreeNodeLookupError = require('./tree_node_lookup_error');
const RecursionGuard = require('./recursion_guard');

/**
 * Provides tree-like query methods for a collection of entities with hierarchical relationships.
 * @type {TreeHelper}
 */
module.exports = class Tree {
    constructor(entities, { idKey = '_id', parentKey = 'parentId' } = {}) {
        this.entities = entities;
        this.idKey = idKey;
        this.parentKey = parentKey;
        this.byId = toHashtable(entities, this.idKey);
        let recursionGuard = new RecursionGuard(idKey, parentKey, entities, this.byId);
        recursionGuard.validateTree();
    }

    /**
     * Returns an array containing the ids of the specified node and its ancestor nodes.
     * @param node
     * @returns {*[]}
     */
    getAncestors(node) {
        node = this.getNode(node);
        let result = [];

        while (node && node[this.parentKey]) {
            node = this.byId[node[this.parentKey]];
            result.push(node);
        }

        return _.compact(result);
    }

    /**
     * Returns an array containing the ids of the specified node and its ancestor nodes.
     * @param node
     * @returns {*[]}
     */
    selfAndAncestors(node) {
        node = this.getNode(node);
        let result = this.getAncestors(node);
        result.unshift(node);
        return result;
    }

    getDescendants(node) {
        node = this.getNode(node);
        let result = [];
        let children = this.children(node);

        while (children.length) {
            Array.prototype.push.apply(result, children);
            children = _(children).map(child => this.children(child)).flatten().value();
        }

        return result;
    }

    /**
     * Returns an array containing the ids of the specified node and its descendant nodes.
     * @param node
     * @returns {*[]}
     */
    selfAndDescendants(node) {
        node = this.getNode(node);
        let result = this.getDescendants(node);
        result.unshift(node);
        return result;
    }

    /**
     * Returns the node's top-level ancestor, i.e., the root node relative to the specified node.
     */
    ancestor(node) {
        return _.last(this.selfAndAncestors(node));
    }

    get root() {
        return this.entities.find(entity => !entity[this.parentKey]);
    }

    get roots() {
        return this.entities.filter(entity => !entity[this.parentKey]);
    }

    get _byParent() {
        return this.byParent || (this.byParent = _.groupBy(this.entities, x => x[this.parentKey]));
    }

    children(node) {
        return this._byParent[node[this.idKey] || node] || [];
    }

    hasChildren(node) {
        return this.children(node).length > 0;
    }

    getNode(node) {
        let original = node;
        if (!node)
            throw new TreeNodeLookupError('Tree: no node specified or node is null or undefined');

        if (!node[this.idKey])
            node = this.byId[node];

        if (!node)
            throw new TreeNodeLookupError(`Tree: node ${original} does not exist in the current tree`);

        return node;
    }

    getById(id) {
        return this.byId[id];
    }

    isLeaf(node) {
        return !this.children(node).length;
    }

    isRoot(node) {
        node = this.getNode(node);
        return !this.byId[node[this.idKey]][this.parentKey];
    }

    getParent(node) {
        node = this.getNode(node);
        if (node[this.parentKey])
            return this.getNode(node[this.parentKey]);
    }

    getLeafNodes(node) {
        const nodes = node ? this.selfAndDescendants(node) : this.entities;
        return this.filterNodes(node => this.isLeaf(node), nodes);
    }

    /**
     * Returns a new Tree that contains only leaf nodes in this tree that match {@param filter}, as well as
     * all non-leaf nodes in this tree.
     * @param filter
     */
    filterLeaves(filter) {
        let nodes = this.filterNodes(node => {
            let isLeaf = this.isLeaf(node);
            return !isLeaf || (isLeaf && !!filter(node));
        }, this.entities);

        return new Tree(nodes);
    }

    /**
     *
     * @param filter
     * @param [nodes] - the node from which to start searching
     * @returns {Array}
     */
    filterNodes(filter, nodes) {
        nodes = nodes || this.entities;
        const matches = [];
        _.each(nodes, node => {
            if (!!filter(node))
                matches.push(node);
        });

        return matches;
    }

    filterPaths(filter) {
        let matched = {};
        _.each(this.entities, node => {
            let id = node[this.idKey];
            if (matched[id])
                return;

            if (filter(node)) {
                let matches = this.selfAndDescendants(node).concat(this.getAncestors(node));
                _.assign(matched, toHashtable(matches, this.idKey));
            }
        });

        return new Tree(_.values(matched));
    }
};


function toHashtable(array, key, projection) {
    return _.reduce(array, (table, item) => {
        table[item[key]] = projection ? projection(item) : item;
        return table;
    }, {});
}
