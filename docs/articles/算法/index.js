
var hasPathSum = function (root, sum) {
    if (!root) return false;
    const queueNode = [root];
    const queueVal = [root.val];
    let tempNode, tempVal;
    while (queueNode.length) {
        tempNode = queueNode.shift();
        tempVal = queueVal.shift();
        console.log(tempNode.val, tempVal)
        if (!tempNode.left && !tempNode.right) {
            if (tempVal === sum) return true;
        }
        if (tempNode.left) {
            queueNode.push(tempNode.left);
            queueVal.push(tempVal + tempNode.left.val);
        }
        if (tempNode.right) {
            queueNode.push(tempNode.right);
            queueVal.push(tempVal + tempNode.right.val);
        }

    }
    return false;
};
function TreeNode (val) {
    this.val = val;
    this.left = this.right = null;
}
function createTree (arr) {
    let level = 0;
    const root = new TreeNode(arr.shift());
    let tempNode = root;
    let res = [];
    while (arr.length) {
        if (tempNode.val) {
            tempNode.left = new TreeNode(arr.shift());
            res.push(tempNode.left);
            tempNode.right = new TreeNode(arr.shift());
            res.push(tempNode.right);
        }
        tempNode = res.shift();

    }
    return root;
}
const root = createTree([5, 4, 8, 11, null, 13, 4, 7, 2, null, null, null, 1])
console.log(hasPathSum(root, 22));