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
    })
});
