/* 
 * The MIT License
 *
 * Copyright 2019 rdesantiago.
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

class KDTree {

    /**
     * Initialize kd-tree structure
     * @param {array[{vector: NVector}]} data Array of data to build kd-tree
     * @param {float} k dimension of three
     */
    constructor(data) {

        this.k = 2;
        this.data = data;
        this.root = null;
        this._nearest = null; // manages nearest point to input data
        this._nearestK = []; // storage nearest points for given distance
        this._distance = Infinity; // manages distance on query search


        // debug porpouse only
        this.debug = false;
        this._visited = [];

        // build kd-tree
        this.build();
    }

    /**
     * Build the tree
     */
    build() {
        if (!Array.isArray(this.data) || this.data.length <= 0)
            throw "The given data must be an array and can't be empty ...";

        this.log('build started...');

        // start building
        for (var i = 0; i < this.data.length; i++) {
            this.root = this.insert(this.root, this.data[i]);
        }
        this.log('build finished...');
    }

    /**
     * Recurrent function to inser data on the tree
     * @param {KDNode} node 
     * @param {array} point 
     * @param {int} depth 
     */
    _insertRec(node, point, depth) {

        var axis = depth % this.k == 0 ? 'x' : 'y';

        // Tree is empty? 
        if (node == null) {
            return new KDNode(point, axis);
        }


        // building  the kd-tree
        if (point[axis] <= node.point[axis])
            node.left = this._insertRec(node.left, point, depth + 1);
        else
            node.rigth = this._insertRec(node.rigth, point, depth + 1);

        return node;

    }

    /**
     * Insert new point on the tree
     * @param {KDNode} root 
     * @param {NVector} point 
     */
    insert(root, point) {
        if (!(point instanceof NVector)) throw new TypeError('insert(root, point) => point is not NVector object');

        return this._insertRec(root, point, 0);
    }

    /**
     * Search nearest neighboors recursively from input point
     * @param {KDNode} node current node
     * @param {array} point input point
     * @param {float} dist distance constraint
     */
    _nearestNeighborsRec(node, point, dist) {
        if (node == null) {
            return;
        }

        var _dist = node.point.distanceTo(point); // distance, in meters, between current node and input point

        if (this.debug)
            this._visited.push(node.point);

        if (_dist <= dist) {
            node.point['dist'] = _dist;
            this._nearestK.push(node.point);
        }


        if (point[node.axis] <= node.getValue()) {
            if (point[node.axis] - this._distance <= node.getValue())
                this._nearestNeighborsRec(node.left, point, dist);
            if (point[node.axis] + this._distance > node.getValue())
                this._nearestNeighborsRec(node.rigth, point, dist);
        } else {
            if (point[node.axis] + this._distance > node.getValue())
                this._nearestNeighborsRec(node.rigth, point, dist);
            if (point[node.axis] - this._distance <= node.getValue())
                this._nearestNeighborsRec(node.left, point, dist);
        }
    }

    /**
     * Search nearest neghboors for given point
     * @param {array} point input point
     * @param {float} distance distance constraint
     */
    nearestNeighbors(point, distance) {
        if (!(point instanceof NVector)) throw new TypeError('Input point is not NVector object');

        this._nearestK = [];

        if (this.debug)
            this._visited = [];


        var vector = point.destinationVector(distance, 0); // generare new vector on nort (0 degrees) with an separation of - distance -
        this._distance = point.distance(vector); // get distance in cartesian ref, i.e. convert real distance on cartesian distance
        this._nearestNeighborsRec(this.root, point, distance);

        this._nearestK.sort(function(a, b) {
            return a.dist > b.dist;
        });
        return this._nearestK;
    }

    /**
     * Search k nearest neghboors for given point
     * @param {array} point input point
     * @param {float} distance distance constraint
     * @param {floar} k k number of required neighboors 
     */
    nearestNeighborsK(point, distance, k) {
        var nearest = this.nearestNeighbors(point, distance);
        if (nearest.length > k) {
            return nearest.splice(0, k);
        }
        return nearest;
    }


    /**
     * Search nearest neighboor recursively
     * @param {*} node 
     * @param {NVector} point 
     */
    _searchNearestRec(node, point) {
        if (node == null) {
            return;
        }

        var _dist = node.point.distance(point); // distance in cartesian ref

        if (this.debug)
            this._visited.push(node.point);

        if (_dist <= this._distance) {
            node.point['dist'] = node.point.distanceTo(point);
            this._distance = _dist;
            this._nearest = node.point;
        }

        if (point[node.axis] <= node.getValue()) {
            if (point[node.axis] - this._distance <= node.getValue())
                this._searchNearestRec(node.left, point);
            if (point[node.axis] + this._distance > node.getValue())
                this._searchNearestRec(node.rigth, point);
        } else {
            if (point[node.axis] + this._distance > node.getValue())
                this._searchNearestRec(node.rigth, point);
            if (point[node.axis] - this._distance <= node.getValue())
                this._searchNearestRec(node.left, point);
        }
    }

    /**
     * Search nearest point from given input
     * @param {array} point 
     */
    nearest(point) {
        if (!(point instanceof NVector)) throw new TypeError('Input point is not NVector object');

        this._nearest = null;

        if (this.debug)
            this._visited = [];

        this._distance = Infinity;
        this._searchNearestRec(this.root, point);
        return this._nearest;
    }

    /**
     * Return visited nodes for anyone search
     */
    getVisitedPoints() {
        if (this.debug)
            return this._visited;

        return [];
    }

    /**
     * Compute the euclidian distance
     * @param {array} pointA
     * @param {array} pointB 
     */
    euclideanDist(a, b) {
        if (!(a instanceof NVector) || !(b instanceof NVector)) throw new TypeError('Input point is not NVector object');
        var dist = Math.pow((a.x - b.x), 2) + Math.pow((a.y - b.y), 2);
        return Math.sqrt(dist);
    }

    log(message) {
        if (this.debug)
            console.log(new Date(), ': ' + message);
    }

}

class KDNode {

    /**
     * Initialize new node
     * @param {array} point 
     * @param {int} axis 
     */
    constructor(point, axis) {
        this.point = point;
        this.axis = axis;
        this.left = null;
        this.rigth = null;
    }

    /**
     * Return true if actual node are equal to the input point
     * @param {array} point data to compare
     * @param {float} k dimension of tree 
     */
    isEqual(point, k) {
        for (var i = 0; i < k; i++)
            if (this.point[i] != point[i])
                return false;
        return true;
    }

    /**
     * Return true when left and rigth nodes are null
     */
    isLeaft() {
        return !this.left && !this.rigth;
    }

    /**
     * Return the value of current axis (depth)
     */
    getValue() {
        return this.point[this.axis];
    }

    /**
     * Print the point data, only for debug porpouse
     */
    print() {
        console.log("(" + this.point.join(',') + "),")
    }
}