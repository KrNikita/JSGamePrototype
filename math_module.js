/* 
 * To change this license header, choose License Headers in Project Properties.
 * To change this template file, choose Tools | Templates
 * and open the template in the editor.
 */
module.exports = function(){
    
    /** Get intersection points line and cicrle
     * 
     * @param {array} a - array of coords form first point of line [x,y]
     * @param {array} b - array of coords form second point of line [x,y]
     * @param {array} c - array of circle params [x,y,radius]
     * @returns {bool} - return true of false
     * 
     */
    this.isIntersect = function(a, b, c){
        // Calculate the euclidean distance between a & b
		eDistAtoB = Math.sqrt( Math.pow(b[0]-a[0], 2) + Math.pow(b[1]-a[1], 2) );
		// compute the direction vector d from a to b
		d = [ (b[0]-a[0])/eDistAtoB, (b[1]-a[1])/eDistAtoB ];
		// Now the line equation is x = dx*t + ax, y = dy*t + ay with 0 <= t <= 1.
		// compute the value t of the closest point to the circle center (cx, cy)
		t = (d[0] * (c[0]-a[0])) + (d[1] * (c[1]-a[1]));
		// compute the coordinates of the point e on line and closest to c
			var e = {coords:[], onLine:false};
		e.coords[0] = (t * d[0]) + a[0];
		e.coords[1] = (t * d[1]) + a[1];

		// Calculate the euclidean distance between c & e
		eDistCtoE = Math.sqrt( Math.pow(e.coords[0]-c[0], 2) + Math.pow(e.coords[1]-c[1], 2) );

		// test if the line intersects the circle
		if( eDistCtoE < c[2] ) {
				return true;
			}
        return false;  
    };
    /** Get intersection points line and cicrle
     * 
     * @param {array} a - array of coords form first point of line [x,y]
     * @param {array} b - array of coords form second point of line [x,y]
     * @param {array} c - array of circle params [x,y,radius]
     * @returns {object} - return object with data about intersection. points can be false if no intersection, and {intersection1:[x,y], intersection2:[x,y]} if have intersection
     * 
     */
    this.getIntersections = function(a, b, c) {
	// test if the line intersects the circle
	if( this.isIntersect(a,b,c)) {
		// compute distance from t to circle intersection point
	    dt = Math.sqrt( Math.pow(c[2], 2) - Math.pow(eDistCtoE, 2));

	    // compute first intersection point
	    var f = {coords:[], onLine:false};
	    f.coords[0] = ((t-dt) * d[0]) + a[0];
	    f.coords[1] = ((t-dt) * d[1]) + a[1];
	    // check if f lies on the line
	    f.onLine = is_on(a,b,f.coords);

	    // compute second intersection point
	    var g = {coords:[], onLine:false};
	    g.coords[0] = ((t+dt) * d[0]) + a[0];
	    g.coords[1] = ((t+dt) * d[1]) + a[1];
	    // check if g lies on the line
	    g.onLine = is_on(a,b,g.coords);

            return {points: {intersection1:f, intersection2:g}, pointOnLine: e};

	} else if (parseInt(eDistCtoE) === parseInt(c[2])) {
		// console.log("Only one intersection");
		return {points: false, pointOnLine: e};
	} else {
		// console.log("No intersection");
		return {points: false, pointOnLine: e};
	}
    }

    /** get distanse between 2 points
     * 
     * @param {array} a - array of coords form first point of line [x,y]
     * @param {array} b - array of coords form second point of line [x,y]
     * @returns {Number} - distance between 2 points
     */
    this.distance = function(a,b) {
	return Math.sqrt( Math.pow(a[0]-b[0], 2) + Math.pow(a[1]-b[1], 2) )
    }
    
    this.is_on = function(a, b, c) {
	return distance(a,c) + distance(c,b) == distance(a,b);
    }

    this.getAngles = function(a, b, c) {
	// calculate the angle between ab and ac
	angleAB = Math.atan2( b[1] - a[1], b[0] - a[0] );
	angleAC = Math.atan2( c[1] - a[1], c[0] - a[0] );
	angleBC = Math.atan2( b[1] - c[1], b[0] - c[0] );
	angleA = Math.abs((angleAB - angleAC) * (180/Math.PI));
	angleB = Math.abs((angleAB - angleBC) * (180/Math.PI));
	return [angleA, angleB];
}
};


