class OptimalRoute {

     /**
     * Constructor of class
     * @param {array[array]} data input data
     * @param {NVector} location company location
     */
    constructor(data, location){
        this.data = data;
        this.cLocation = location;
        this.build();
        this.auxData = data;
    }

    build() {
        if (!Array.isArray(this.data) || this.data.length <= 0)
            throw "The given data must be an array and can't be empty ...";
        if (!(this.cLocation instanceof NVector)) throw new TypeError('Company location must be a NVector object');
        this.calculateDistances();
    }
   
    calculateDistances() {
        //this.log("start calculateDistances");
        for(let item of this.data) {
            const _dist = this.cLocation.distanceTo(item);
            item.distance = _dist;
        }
        this.data = this.data.sort((a,b) => a.distance - b.distance);
        //this.log("end calculateDistances");
    }

    getfurther() {
        this.log(this.data.length);
        return this.data.pop();
    }

    log(...args){
        console.log(new Date().toISOString(), ...args);
    }

    /**
     * Constructor of class
     * @param {OSMR} polyline OSMR result object. https://project-osrm.org/docs/v5.24.0/api/#result-objects
     */
    analizePolyline(route, further, maxPassengers) {
        const coordinates = route.geometry.coordinates;
        var line = turf.lineString(coordinates);
        for(let item of this.data) {

            const pt = turf.point([item._lng, item._lat]);
            const pDistance = turf.pointToLineDistance(pt, line) * 1000; // distance to polyline
            const fDist = further.distanceTo(item); // distance to further point
            item.polyline_dist = pDistance + fDist;
            item.further_dist = fDist;
        }
        this.auxData = this.data.sort((a,b) => a.polyline_dist > b.polyline_dist);
        if(this.auxData.length > maxPassengers - 1) {
            let nearItemsToPolyline = this.auxData.slice(0, maxPassengers - 1);
            nearItemsToPolyline = nearItemsToPolyline.sort((a,b) => a.further_dist > b.further_dist);
            // delete items near from polyline to data
            for (let _item of nearItemsToPolyline) {
                this.data = this.data.filter((item) => _item?.data?.id != item.data.id);
            }
            this.calculateDistances();
            return nearItemsToPolyline;
        } else { 
            for (let _item of this.auxData) {
                this.data = this.data.filter((item) => !item.isEqual(_item));
            }
            this.auxData = this.auxData.sort((a,b) => a.further_dist > b.further_dist);
          return this.auxData;
        } 
        
    }
}