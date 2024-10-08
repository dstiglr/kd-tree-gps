class NVector {

    /**
     * Crate new n-vector from given lat, lng
     * @param {decial} lat 
     * @param {decimal} lng 
     * @example
     *  var _vector = new NVector(22.154311, -100.997803);
     * https://www.movable-type.co.uk/scripts/latlong-vectors.html
     */
    constructor(lat, lng, data = null) {
        var vector = this.toNvector(parseFloat(lat), parseFloat(lng));
        this.x = vector.x;
        this.y = vector.y;
        this.z = vector.z;
        this.R = 6371e3;
        this.data = data;
    }

    static build(x, y, z) {
        this.x = x;
        this.y = y;
        this.z = z;
        const vector = new NVector(0, 0);
        vector.x = x;
        vector.y = y;
        vector.z = z;
        return vector;
    }

    toNvector(lat, lng) {
        this._lat = lat;
        this._lng = lng;
        const fi = Number(lat).toRadians();
        const lambda = Number(lng).toRadians();

        const cosFi = Math.cos(fi);
        const sinFi = Math.sin(fi);
        const cosLamb = Math.cos(lambda);
        const sinLamb = Math.sin(lambda);

        var _x = cosFi * cosLamb;
        var _y = cosFi * sinLamb;
        var _z = sinFi;
        return { x: _x, y: _y, z: _z };
    }

    isEqual(v) {
        if (!(v instanceof NVector)) throw new TypeError('isEqual(v) => v is not NVector object');
        if (this.x != v.x)
            return false;
        if (this.y != v.y)
            return false;
        if (this.z != v.z)
            return false;

        return true;
    }

    distanceTo(v) {
        if (!(v instanceof NVector)) throw new TypeError('distanceTo(v) => v is not NVector object');
        const aXb = this.cross(v);
        return this.R * Math.atan2(aXb.length(), this.dot(v));
    }

    distance(v) {
        if (!(v instanceof NVector)) throw new TypeError('distance(v) => v is not NVector object');
        const aXb = this.cross(v);
        return Math.abs(Math.atan2(aXb.length(), this.dot(v)));
    }

    toLatLng() {
        const fi = Math.atan2(this.z, Math.sqrt((this.x * this.x) + (this.y * this.y)));
        const lambda = Math.atan2(this.y, this.x);
        return { lat: fi.toDegrees(), lng: lambda.toDegrees() };
    }

    destinationPoint(distance, bearing) {
        const n1 = this;
        var lambda = distance / this.R;
        const theta = Number(bearing).toRadians();


        const N = NVector.build(0, 0, 1);
        const de = N.cross(n1).unit(); // east direction vector @ n1 (Gade's k_e_E)
        const dn = n1.cross(de); // north direction vector @ n1 (Gade's (k_n_E)
        const deSinθ = de.times(Math.sin(theta));
        const dnCosθ = dn.times(Math.cos(theta));

        const d = dnCosθ.plus(deSinθ); // direction vector @ n1 (≡ C×n1; C = great circle)

        const x = n1.times(Math.cos(lambda)); // component of n2 parallel to n1
        const y = d.times(Math.sin(lambda)); // component of n2 perpendicular to n1

        const n2 = x.plus(y); // Gade's n_EB_E

        return NVector.build(n2.x, n2.y, n2.z).toLatLng();

    }

    destinationVector(distance, bearing) {
        const n1 = this;
        var lambda = distance / this.R;
        const theta = Number(bearing).toRadians();


        const N = NVector.build(0, 0, 1);
        const de = N.cross(n1).unit(); // east direction vector @ n1 (Gade's k_e_E)
        const dn = n1.cross(de); // north direction vector @ n1 (Gade's (k_n_E)
        const deSinθ = de.times(Math.sin(theta));
        const dnCosθ = dn.times(Math.cos(theta));

        const d = dnCosθ.plus(deSinθ); // direction vector @ n1 (≡ C×n1; C = great circle)

        const x = n1.times(Math.cos(lambda)); // component of n2 parallel to n1
        const y = d.times(Math.sin(lambda)); // component of n2 perpendicular to n1

        const n2 = x.plus(y); // Gade's n_EB_E

        return n2;

    }

    getData() {
        return this.data;
    }

    /**
     * Multiplies ‘this’ vector by a scalar value.
     *
     * @param   {number}   x - Factor to multiply this vector by.
     * @returns {NVector} Vector scaled by x.
     */
    times(x) {
        x = Number(x);
        return NVector.build(this.x * x, this.y * x, this.z * x);
    }

    /**
     * Adds supplied vector to ‘this’ vector.
     *
     * @param   {NVector} v - Vector to be added to this vector.
     * @returns {NVector} Vector representing sum of this and v.
     */
    plus(v) {
        if (!(v instanceof NVector)) throw new TypeError('plus(v) => v is not NVector object');

        return NVector.build(this.x + v.x, this.y + v.y, this.z + v.z);
    }

    /**
     * Length (magnitude or norm) of ‘this’ vector.
     *
     * @returns {number} Magnitude of this vector.
     */
    length() {
        return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
    }

    /**
     * Multiplies ‘this’ vector by the supplied vector using dot (scalar) product.
     *
     * @param   {Vector3d} v - Vector to be dotted with this vector.
     * @returns {number}   Dot product of ‘this’ and v.
     */
    dot(v) {
        if (!(v instanceof NVector)) throw new TypeError('dot(v) => v is not NVector object');

        return this.x * v.x + this.y * v.y + this.z * v.z;
    }

    /**
     * Multiplies ‘this’ vector by the supplied vector using cross (vector) product.
     *
     * @param   {NVector} v - Vector to be crossed with this vector.
     * @returns {NVector}} Cross product of ‘this’ and v.
     */
    cross(v) {
        if (!(v instanceof NVector)) throw new TypeError('cross(v) => v is not Vector3d object');
        const x = this.y * v.z - this.z * v.y;
        const y = this.z * v.x - this.x * v.z;
        const z = this.x * v.y - this.y * v.x;

        return NVector.build(x, y, z);
    }

    /**
     * Normalizes a vector to its unit vector
     * – if the vector is already unit or is zero magnitude, this is a no-op.
     *
     * @returns {NVector} Normalised version of this vector.
     */
    unit() {
        const norm = this.length();
        if (norm == 1) return this;
        if (norm == 0) return this;

        const x = this.x / norm;
        const y = this.y / norm;
        const z = this.z / norm;

        return NVector.build(x, y, z);
    }

    toString() {
        return "[" + this.x + "," + this.y + "," + this.z + "]";
    }

}

// Extend Number object with methods to convert between degrees & radians
Number.prototype.toRadians = function() { return this * Math.PI / 180; };
Number.prototype.toDegrees = function() { return this * 180 / Math.PI; };