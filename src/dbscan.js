class DBScan {

     /**
     * Constructor of class
     * @param {array[array]} data input data
     * @param {NVector} location company location
     */
     constructor(data, epsilon, minPoints) {
        this.data = data;
        this.epsilon = epsilon;
        this.minPoints = minPoints;
        this.build();
    }

    build() {
        if (!Array.isArray(this.data) || this.data.length <= 0)
            throw Error("The given data must be an array and can't be empty ...");

        this.label = new Array(this.data.length);
        this.clusters = [];

        // add index to items
        for(let i = 0; i < this.data.length; i++) {
            this.data[i].index = i;
        }

        // build kdtree for clusters
        this.kdTree = new KDTree(this.data);
    }

    run() {
        // cluster counter
        let C = 0;
        let clusters = [];
        for(let P of this.data) {

            if(this.label[P.index] != undefined) {continue};

            // get nearest neighbors
            let neighbors = this.kdTree.nearestNeighbors(P, this.epsilon);
            if(neighbors.length < this.minPoints) {
                this.label[P.index] = 'NOISE';
                continue;
            }
            
            C = C + 1;
            this.label[P.index] = C;
            let seedSet = neighbors;
            for(let i = 0; i < neighbors.length; i++) {

                let Q = neighbors[i];                
                
                if(this.label[Q.index] == 'NOISE') {
                    this.label[Q.index] = C;
                } else if(this.label[Q.index] != undefined) {continue};

                this.label[Q.index] = C;
                // get neighbors to expand
                const expNeighbors = this.kdTree.nearestNeighbors(Q, this.epsilon);                
                //if(expNeighbors.length >= this.minPoints) {
                    // delete duplicated items
                    seedSet = [...new Set([...seedSet, ...expNeighbors])];
                    neighbors = neighbors.concat(expNeighbors);
                //}   
            }
            
            clusters.push(seedSet);
            
            let filterData = this.data.filter(a => !seedSet.find((b) => a.isEqual(b)));
            // re-build kdtree for clusters
            this.kdTree = new KDTree(filterData);
        }   
        
        const noiseCluster = [];
        for(let item of this.data) {
            if(this.label[item.index] == 'NOISE') {
                noiseCluster.push(item);  
            };
        }

        // end dbscan clustering
        console.log("end dbscan clustering");
        return [ clusters, noiseCluster, this.label ];
    }
}