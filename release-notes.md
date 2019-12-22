# release notes

## 1.7.0
* protect against non-existant nodes when validatesNodes is false; added clone method

### 1.6.1
* support incomplete trees in filterPaths

## 1.6.0
* allow incomplete tree that doesn't throw lookup-errors by creating tree with validatesNodes=false

## 1.5.0
* getTopLevelNodes: returns all nodes in the tree with no parent or with parents that do not exist in the current tree

### 1.4.1
* cleanup, documentation

## 1.4.0
* filterPaths: fixed issue with the order in which nodes were matched which could cause some nodes to not be matched

## 1.3.0
* filterPaths: returns a new tree that contains full paths (ancestors and descendants) of matched nodes

## 1.2.0
* filterLeaves: returns a new tree with only non-matching leaf-nodes filtered out

## 1.1.0
* remove @tabit/utils dependency

### 1.0.1
* index.js for browser

## 1.0.0
initial
