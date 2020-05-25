const _ = require('lodash');
const Tree = require('../src/tree');
const should = require('chai').should();

let tree;

describe('Tree should: ', function () {
    beforeEach(function () {
        tree = new Tree([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ]);
    });

    it('Get leaf-nodes from root', async function () {
        let leaves = tree.getLeafNodes();
        leaves.should.deep.equal([
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ])
    });

    it('Get leaf-nodes from node', async function () {
        let leaves = tree.getLeafNodes('B');
        leaves.should.deep.equal([
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ])
    });

    it('Filter children', async function () {
        let filteredTree = tree.filterLeaves(node => node.name.indexOf('leaf 1') > 1);
        (filteredTree instanceof Tree).should.equal(true);
        filteredTree.entities.should.deep.equal([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
        ])

    });

    it('Get top-level nodes regardless of whether or not tree has root nodes', async function () {
        // with root nodes
        let nodes = tree.getTopLevelNodes();
        nodes.should.deep.equal([
            { _id: 'A', name: 'A HQ' },
            { _id: 'B', name: 'B HQ' },
        ]);

        // no root nodes
        tree = new Tree([
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ]);

        nodes = tree.getTopLevelNodes();
        nodes.should.deep.equal([
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B2', parentId: 'B', name: 'B region 2' },
        ]);

        // only leaf nodes
        tree = new Tree([
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ]);
        nodes = tree.getTopLevelNodes();
        nodes.should.deep.equal([
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ])
    });

    it('Allow incomplete trees that do not fail when nodes are missing', async function () {
        tree = new Tree([{ _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' }], { validateNodes: false });
        should.not.throw(() => tree.getParent('A1a'));
        should.not.exist(tree.getParent('A1a'));

        should.not.throw(() => tree.children('Stam'));
        tree.children('Stam').should.deep.equal([]);

        should.not.throw(() => tree.selfAndDescendants('Stam'));
        tree.selfAndDescendants('Stam').should.deep.equal([]);

        should.not.throw(() => tree.ancestors('Stam'));
        tree.ancestors('Stam').should.deep.equal([]);

        should.not.throw(() => tree.selfAndAncestors('Stam'));
        tree.selfAndAncestors('Stam').should.deep.equal([]);

        should.not.throw(() => tree.getLeafNodes('Stam'));
        tree.getLeafNodes('Stam').should.deep.equal([]);
    });

    it('Fail when node does not exist in a complete tree', async function () {
        tree = new Tree([{ _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' }]);
        should.throw(() => tree.getParent('A1a'));
        should.throw(() => tree.selfAndDescendants('Stam'));
        should.throw(() => tree.ancestors('Stam'));
        should.throw(() => tree.selfAndAncestors('Stam'));
        should.throw(() => tree.getLeafNodes('Stam'));
    });

    it('Clone tree', async function () {
        let clone = tree.clone();
        clone.entities.should.deep.equal(tree.entities);
        clone.idKey.should.equal(tree.idKey);
        clone.parentKey.should.equal(tree.parentKey);
        clone.byId.should.equal(tree.byId);
        clone.validateNodes.should.equal(tree.validateNodes);
    });

    it('Embed node levels', async function () {
        tree = new Tree([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ], {
            embedLevels: true
        });

        let sortedResult = _.sortBy(tree.entities, '_id');
        sortedResult.should.deep.equal(_.sortBy([
            { _id: 'A', name: 'A HQ', level: 0 },
            { _id: 'A1', parentId: 'A', name: 'A region 1', level: 1 },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1', level: 2 },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2', level: 2 },

            { _id: 'A2', parentId: 'A', name: 'A region 2', level: 1 },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1', level: 2 },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2', level: 2 },

            { _id: 'B', name: 'B HQ', level: 0 },
            { _id: 'B1', parentId: 'B', name: 'B region 1', level: 1 },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1', level: 2 },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2', level: 2 },

            { _id: 'B2', parentId: 'B', name: 'B region 2', level: 1 },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1', level: 2 },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2', level: 2 },
        ], '_id'))
    });

    it('Add metadata', async function () {
        tree = new Tree([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
        ], {
            addMeta: {
                hasChildren: true,
                isLeaf: true,
                isRoot: true,
            }
        });

        let sortedResult = _.sortBy(tree.entities, '_id');
        sortedResult.should.deep.equal(_.sortBy([
            { _id: 'A', name: 'A HQ', meta: { hasChildren: true, isLeaf: false, isRoot: true, level: 0 } },
            {
                _id: 'A1',
                parentId: 'A',
                name: 'A region 1',
                meta: { hasChildren: true, isLeaf: false, isRoot: false, level: 1 }
            },
            {
                _id: 'A1a',
                parentId: 'A1',
                name: 'A1 leaf 1',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },
            {
                _id: 'A1b',
                parentId: 'A1',
                name: 'A1 leaf 2',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },

            {
                _id: 'A2',
                parentId: 'A',
                name: 'A region 2',
                meta: { hasChildren: true, isLeaf: false, isRoot: false, level: 1 }
            },
            {
                _id: 'A2a',
                parentId: 'A2',
                name: 'A2 leaf 1',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },
            {
                _id: 'A2b',
                parentId: 'A2',
                name: 'A2 leaf 2',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },

            { _id: 'B', name: 'B HQ', meta: { hasChildren: true, isLeaf: false, isRoot: true, level: 0 } },
            {
                _id: 'B1',
                parentId: 'B',
                name: 'B region 1',
                meta: { hasChildren: true, isLeaf: false, isRoot: false, level: 1 }
            },
            {
                _id: 'B1a',
                parentId: 'B1',
                name: 'B1 leaf 1',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },
            {
                _id: 'B1b',
                parentId: 'B1',
                name: 'B1 leaf 2',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },

            {
                _id: 'B2',
                parentId: 'B',
                name: 'B region 2',
                meta: { hasChildren: true, isLeaf: false, isRoot: false, level: 1 }
            },
            {
                _id: 'B2a',
                parentId: 'B2',
                name: 'B2 leaf 1',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },
            {
                _id: 'B2b',
                parentId: 'B2',
                name: 'B2 leaf 2',
                meta: { hasChildren: false, isLeaf: true, isRoot: false, level: 2 }
            },
        ], '_id'))
    });

    describe('filterPaths should: ', function () {
        it('Filter descendants-and-ancestor paths', async function () {
            let filteredTree = tree.filterPaths(node => node.name.indexOf('region 2') > 1);
            (filteredTree instanceof Tree).should.equal(true);
            let sortedResult = _.sortBy(filteredTree.entities, '_id');
            sortedResult.should.deep.equal(_.sortBy([
                { _id: 'A', name: 'A HQ' },
                { _id: 'A2', parentId: 'A', name: 'A region 2' },
                { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
                { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

                { _id: 'B', name: 'B HQ' },
                { _id: 'B2', parentId: 'B', name: 'B region 2' },
                { _id: 'B2a', parentId: 'B2', name: 'B2 leaf 1' },
                { _id: 'B2b', parentId: 'B2', name: 'B2 leaf 2' },
            ], '_id'))
        });

        it('Filter ancestor paths', async function () {
            let filteredTree = tree.filterPaths(node => node.name.indexOf('A2 leaf 2') > -1);
            (filteredTree instanceof Tree).should.equal(true);
            let sortedResult = _.sortBy(filteredTree.entities, '_id');
            sortedResult.should.deep.equal(_.sortBy([
                { _id: 'A', name: 'A HQ' },
                { _id: 'A2', parentId: 'A', name: 'A region 2' },
                { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },
            ], '_id'))
        });

        it('Correctly filter descendants paths when matched higher-level node is included via matched lower-level node', async function () {
            tree = new Tree([
                { _id: 'A1', parentId: 'A', name: 'A region 1' },
                { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
                { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

                { _id: 'A2', parentId: 'A', name: 'A region 2' },
                { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
                { _id: 'A2b', parentId: 'A2', name: 'A2 leaf Q' },

                { _id: 'A', name: 'A HQ' },
            ]);

            let filteredTree = tree.filterPaths(node => node.name.indexOf('Q') > 1);
            (filteredTree instanceof Tree).should.equal(true);
            let sortedResult = _.sortBy(filteredTree.entities, '_id');
            sortedResult.should.deep.equal(_.sortBy([
                { _id: 'A', name: 'A HQ' },
                { _id: 'A1', parentId: 'A', name: 'A region 1' },
                { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
                { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

                { _id: 'A2', parentId: 'A', name: 'A region 2' },
                { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
                { _id: 'A2b', parentId: 'A2', name: 'A2 leaf Q' },
            ], '_id'))
        });

        it('Filter descendants on incomplete trees', async function () {
            tree = new Tree([
                { _id: 'A1', parentId: 'A', name: 'A region 1' },
                { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },
                { _id: 'A1b', parentId: 'A1', name: 'A1 leaf 2' },

                { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },
                { _id: 'A2b', parentId: 'A2', name: 'A2 leaf 2' },

                { _id: 'B1', parentId: 'B', name: 'B region 1' },
                { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
                { _id: 'B1b', parentId: 'B1', name: 'B1 leaf 2' },
            ]);

            let filteredTree = tree.filterPaths(node => node.name.indexOf('leaf 1') > 1);
            let sortedResult = _.sortBy(filteredTree.entities, '_id');
            sortedResult.should.deep.equal(_.sortBy([
                { _id: 'A1', parentId: 'A', name: 'A region 1' },
                { _id: 'A1a', parentId: 'A1', name: 'A1 leaf 1' },

                { _id: 'A2a', parentId: 'A2', name: 'A2 leaf 1' },

                { _id: 'B1', parentId: 'B', name: 'B region 1' },
                { _id: 'B1a', parentId: 'B1', name: 'B1 leaf 1' },
            ], '_id'))
        });
    })
});
