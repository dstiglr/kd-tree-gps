class KMeans {
    /**
     * Constructor of class
     * @param {array[array]} data input data
     * @param {int} k desired clusters (centroids)
     */
    constructor(data, k, maxIterations) {
        if (!Array.isArray(data) || data.length <= 0)
            throw "The given data must be an array and can't be empty ---";

        this.data = data;
        this.k =  k;
        this.DIM = 2; // dimension of input data
        this.MAX_ITERATIONS = maxIterations;

        this.iterations = 0;
        this.oldCentroids = null;
        this.centroids = null;
        this.kdTree = null;
        this.build();
    }

    build() {
        this.iterations = 0;
        this.centroids = this.getRandomCentroids();
        // build kdtree for clusters
        this.kdTree = new KDTree(this.centroids);
    }

    process() {
        if (!this.shouldStop()) {
            console.log('k-means, iteration...', this.iterations, this.MAX_ITERATIONS);
            this.oldCentroids = JSON.parse(JSON.stringify(this.centroids));
            this.iterations++;

            this.getLabels();
            this.getCentroids();
        }
        return this.centroids;
    }

    shouldStop() {

        if (this.oldCentroids == null)
            return;

        if (this.iterations > this.MAX_ITERATIONS)
            return true;

        var stop = true;

        for (var i = 0; i < this.centroids.length; i++) {
            if (!this.isEqual(this.centroids[i], this.oldCentroids[i])) {
                stop = false;
                break;
            }
        }
        return stop;
    }

    getLabels() {
        var self = this;
        this.data.forEach(function(item) {
            const cNearest = self.kdTree.nearest(item); // return nearest centroid for current item on data
            //if (cNearest == null)
            item.label = cNearest.label;
        });
    }

    getCentroids() {
        for (var i = 0; i < this.centroids.length; i++) {
            this.centroids[i].data = [];
        }

        for (var i = 0; i < this.data.length; i++) {
            const _data = JSON.parse(JSON.stringify(this.data[i]));
            this.centroids[_data.label].data.push(_data);
        }

        for (var i = 0; i < this.centroids.length; i++) {
            var sumX = 0;
            var sumY = 0;
            var sumZ = 0;
            var length = this.centroids[i].data.length;
            for (var j = 0; j < length; j++) {
                sumX += this.centroids[i].data[j].x;
                sumY += this.centroids[i].data[j].y;
                sumZ += this.centroids[i].data[j].z;
            }
            if (length > 0) {
                this.centroids[i].x = sumX / length;
                this.centroids[i].y = sumY / length;
                this.centroids[i].z = sumZ / length;
            }
        }
        this.kdTree = new KDTree(this.centroids); // rebuild kdtree with updated centroids
    }

    /**
     * Compare two NVector vectors
     * @param {array} point data to compare
     * @param {float} k dimension of tree 
     */
    isEqual(a, v) {
        if (a.x != v.x || a.y != v.y || a.z != v.z)
            return false;
        return true;
    }

    getRandomCentroids() {
        var centroids = [];
        for (var i = 0; i < this.k; i++) {
            const rand = Math.floor(Math.random() * this.data.length);
            const _centroid = this.data[rand];
            const _cVector = new NVector(_centroid._lat, _centroid._lng);
            _cVector.label = i;
            centroids.push(_cVector);
        }
        return centroids;
    }

    log(message) {
        console.log(new Date(), message);
    }
}