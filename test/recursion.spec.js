const Tree = require('../src/tree');
const should = require('chai').should();

describe('Recursion: ', function () {
    it('Fail to create on recursion 1', async function () {
        let error;
        try {
            new Tree([{ _id: 2, parentId: 3 }, { _id: 3, parentId: 2 }]);
        } catch (ex) {
            error = ex;
        }
        should.exist(error);
        error.name.should.equal('TreeNodeRecursionError');
        error.message.should.equal('Recursive Node to Parent relationship found. Path: 2,3,2');

    });

    it('Fail to create on recursion 2', async function () {
        let error;
        try {
            new Tree([{ _id: 1 }, { _id: 2, parentId: 1 }, { _id: 3, parentId: 2 }, { _id: 4, parentId: 4 }]);
        } catch (ex) {
            error = ex;
        }
        should.exist(error);
        error.name.should.equal('TreeNodeRecursionError');
        error.message.should.equal('Recursive Node to Parent relationship found. Path: 4,4');
    });
});
