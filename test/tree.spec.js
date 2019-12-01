const Tree = require('../src/tree');
const should = require('chai').should();

let tree;

describe('Tree should: ', function () {
    beforeEach(function () {
        tree = new Tree([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A region 1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A region 1 leaf 2' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A region 2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A region 2 leaf 2' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B region 1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B region 1 leaf 2' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B region 2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B region 2 leaf 2' },
        ]);
    });

    it('Get leaf-nodes from root', async function () {
        let leaves = tree.getLeafNodes();
        leaves.should.deep.equal([
            { _id: 'A1a', parentId: 'A1', name: 'A region 1 leaf 1' },
            { _id: 'A1b', parentId: 'A1', name: 'A region 1 leaf 2' },

            { _id: 'A2a', parentId: 'A2', name: 'A region 2 leaf 1' },
            { _id: 'A2b', parentId: 'A2', name: 'A region 2 leaf 2' },

            { _id: 'B1a', parentId: 'B1', name: 'B region 1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B region 1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B region 2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B region 2 leaf 2' },
        ])
    });

    it('Get leaf-nodes from node', async function () {
        let leaves = tree.getLeafNodes('B');
        leaves.should.deep.equal([
            { _id: 'B1a', parentId: 'B1', name: 'B region 1 leaf 1' },
            { _id: 'B1b', parentId: 'B1', name: 'B region 1 leaf 2' },

            { _id: 'B2a', parentId: 'B2', name: 'B region 2 leaf 1' },
            { _id: 'B2b', parentId: 'B2', name: 'B region 2 leaf 2' },
        ])
    });

    it('Filter children', async function () {
        let filteredTree = tree.filterLeaves(node => node.name.indexOf('leaf 1') > 1);
        (filteredTree instanceof Tree).should.equal(true);
        filteredTree.entities.should.deep.equal([
            { _id: 'A', name: 'A HQ' },
            { _id: 'A1', parentId: 'A', name: 'A region 1' },
            { _id: 'A1a', parentId: 'A1', name: 'A region 1 leaf 1' },

            { _id: 'A2', parentId: 'A', name: 'A region 2' },
            { _id: 'A2a', parentId: 'A2', name: 'A region 2 leaf 1' },

            { _id: 'B', name: 'B HQ' },
            { _id: 'B1', parentId: 'B', name: 'B region 1' },
            { _id: 'B1a', parentId: 'B1', name: 'B region 1 leaf 1' },

            { _id: 'B2', parentId: 'B', name: 'B region 2' },
            { _id: 'B2a', parentId: 'B2', name: 'B region 2 leaf 1' },
        ])

    });
});
