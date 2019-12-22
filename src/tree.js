const _ = require('lodash');
const TreeNodeLookupError = require('./tree_node_lookup_error');
const RecursionGuard = require('./recursion_guard');

/**
 * Provides tree-like query methods for a collection of entities with hierarchical relationships.
 * @type {Tree}
 */
module.exports = class Tree {
    /**
     *
     * @param entities
     * @param idKey
     * @param parentKey
     * @param validateNodes {Boolean} - when false, the tree will return undefined when a node is not found;
     * defaults to true: throw errors if a requested node does not exist.
     */
    constructor(entities, { idKey = '_id', parentKey = 'parentId', validateNodes = true } = {}) {
        this.entities = entities;
        this.idKey = idKey;
        this.parentKey = parentKey;
        this.byId = toHashtable(entities, this.idKey);
        this.validateNodes = validateNodes;

        new RecursionGuard(idKey, parentKey, entities, this.byId).validateTree();
    }

    /** @private */
    get _byParent() {
        return this.byParent || (this.byParent = _.groupBy(this.entities, x => x[this.parentKey]));
    }

    /**
     * Returns an array containing the ancestors of {@param node}.
     * @param node
     * @returns {*[]}
     */
    ancestors(node) {
        node = this.getNode(node);
        let result = [];

        while (node && node[this.parentKey]) {
            node = this.byId[node[this.parentKey]];
            result.push(node);
        }

        return _.compact(result);
    }

    /**
     * Returns an array containing the {@param node} and its ancestor nodes.
     * @param node
     * @returns {*[]}
     */
    selfAndAncestors(node) {
        node = this.getNode(node);
        if (!node)
            return this._nodeNotFound({ defaultValue: [] });

        let result = this.ancestors(node);
        result.unshift(node);
        return result;
    }

    /**
     * Returns an array containing the descendants of {@param node}.
     * @param node
     * @returns {Array}
     */
    descendants(node) {
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
     * Returns an array containing {@param node} and its descendant nodes.
     * @param node
     * @returns {*[]}
     */
    selfAndDescendants(node) {
        node = this.getNode(node);
        if (!node)
            return this._nodeNotFound({ defaultValue: [] });

        let result = this.descendants(node);
        result.unshift(node);
        return result;
    }

    /**
     * Returns the node's top-level ancestor, i.e., the root node relative to the specified node.
     */
    ancestor(node) {
        return _.last(this.selfAndAncestors(node));
    }

    /**
     * Returns the first root-level node found in the tree.
     */
    get root() {
        return this.entities.find(entity => !entity[this.parentKey]);
    }

    /**
     * Returns all root-level nodes found in the tree.
     */
    get roots() {
        return this.entities.filter(entity => !entity[this.parentKey]);
    }

    /**
     * Returns all children of {@param node}.
     * @param node
     * @returns {*|Array}
     */
    children(node) {
        if (!node)
            return this._nodeNotFound({ defaultValue: [] });

        return this._byParent[node[this.idKey] || node] || [];
    }

    /**
     * Returns true if {@param node} has any children, otherwise false.
     * @param node
     * @returns {boolean}
     */
    hasChildren(node) {
        return this.children(node).length > 0;
    }

    /**
     * If {@param node} is not a node, looks up and returns the node in the tree whose idKey matches {@param node},
     * otherwise returns {@param node}.
     * @param node
     * @returns {*}
     */
    getNode(node) {
        let original = node;
        if (!node)
            return this._nodeNotFound();

        if (!node[this.idKey])
            node = this.byId[node];

        if (!node)
            return this._nodeNotFound({ node: original });

        return node;
    }

    /** @private */
    _nodeNotFound({ defaultValue, node } = {}) {
        if (this.validateNodes)
            throw new TreeNodeLookupError(`Tree: no node specified or node is null or undefined ${node ? `(node: ${node})` : ''}`);

        return defaultValue;
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
     * Returns all top-level nodes in the current tree structure. Top-level nodes will always be root nodes
     * given a fully populated tree. In a tree that is missing some nodes, top-level nodes might not be
     * root nodes. I.e., a node is considered top-level if there it has no parent **in the current tree**
     * (even if it references a parent by ID).
     */
    getTopLevelNodes() {
        return this.entities.filter(entity => !entity[this.parentKey] || !this.byId[entity[this.parentKey]]);
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

    /**
     * Returns a new Tree that contains all nodes matching {@param filter},
     * along with both the ancestors and the descendants of those matches,
     * thereby maintaining the current structure of the tree but filtering out irrelevant sections.
     * @param filter {Function} - a predicate that receives the node currently being iterated and returns
     * a truthy value if that node (and its ancestor- and descendant-paths) should be included
     * in the resulting tree.
     * @returns {module.Tree}
     */
    filterPaths(filter) {
        return this._filterPaths(filter);
    }

    /** @private */
    _filterPaths(filter, nodes, matched = {}, matching = {}) {
        nodes = nodes || this.getTopLevelNodes();
        _.each(nodes, node => {
            let id = node[this.idKey];
            if (matched[id])
                return;

            if (matching[id])
                throw new Error('cyclic graph detected');

            matching[id] = true;
            if (filter(node)) {
                let matches = this.selfAndDescendants(node).concat(this.ancestors(node));
                _.assign(matched, toHashtable(matches, this.idKey));
            } else
                this._filterPaths(filter, this.children(node), matched, matching);

            delete matching[id];
        });

        return new Tree(_.values(matched));
    }

    /**
     * Creates a new, identical tree from this tree, skipping recursion checks and other processing.
     * @returns {module.Tree}
     */
    clone() {
        const tree = new Tree();
        tree.entities = this.entities;
        tree.idKey = this.idKey;
        tree.parentKey = this.parentKey;
        tree.byId = this.byId;
        tree.validateNodes = this.validateNodes;

        return tree;
    }
};

function toHashtable(array, key) {
    return _.reduce(array, (table, item) => {
        table[item[key]] = item;
        return table;
    }, {});
}
