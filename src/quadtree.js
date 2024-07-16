/**
 *  Quadtrees is a hierarchical data structure to quickly look up boids in flocking models to speed up the simulation
 */

export class QuadTree {
    constructor(boundary, capacity) {
        this.boundary = boundary    // Object with x, y coordinates and a width (w) and height (h)
        this.capacity = capacity    // How many boids fit in this Quadrant until it divides in 4 more quadrants
        this.points = []            // Points contain the boids (object with x and y position)
        this.divided = false        // Boolean to check if this Quadrant is futher divided
    }

    // Method to subdivide the current Quadtree into four equal quadrants
    subdivide() {
        let {x,y,w,h} = this.boundary;
        let nw = { x: x-w/4, y: y-h/4, w: w/2, h: h/2 }
        let ne = { x: x+w/4, y: y-h/4, w: w/2, h: h/2 }
        let sw = { x: x-w/4, y: y+h/4, w: w/2, h: h/2 }
        let se = { x: x+w/4, y: y+h/4, w: w/2, h: h/2 }

        this.northwest = new QuadTree(nw, this.capacity)
        this.northeast = new QuadTree(ne, this.capacity)
        this.southwest = new QuadTree(sw, this.capacity)
        this.southeast = new QuadTree(se, this.capacity)

        this.divided = true // Subdivisions are not divided when spawned, but this one is.
    }

    // Insert a point into the quadtree to query it later (! recursive)
    insert(point) {
        // If this point doesn't belong here, return false
        if (!this.contains(this.boundary, point.position)) {
            return false
        }

        // If the capacity is not yet reached, add the point and return true
        if (this.points.length < this.capacity) {
            this.points.push(point)
            return true;
        }

        // Capacity is reached, divide the quadrant
        if (!this.divided) {
            this.subdivide()
        }

        // Try and insert in one of the subquadrants, and return true if one is succesful (here is the recursion)
        if (this.northwest.insert(point) || this.northeast.insert(point) ||
            this.southwest.insert(point) || this.southeast.insert(point)) {
            return true
        }

        return false
    }

    // Test if a point is within a rectangle
    contains(rect, point) {
        return !(point.x < rect.x - rect.w/2 || point.x > rect.x + rect.w/2 ||
                 point.y < rect.y - rect.h/2 || point.y > rect.y + rect.h/2)
    }

    // Query, another recursive function
    query(range, found) {
        // If there are no points yet, make a list of points
        if (!found) found = []  

        // If it doesn't intersect, return whatever was found so far and move on
        if (!this.intersects(this.boundary, range)) {
            return found
        }

        // Check for all points if it is in this quadtree (could also be in one of the children QTs!)
        for (let p of this.points) {
            if (this.contains(range, p.position)) {
                found.push(p)
            }
        }

        // Test the children QTs too (here is the recursion!)
        if (this.divided) {
            this.northwest.query(range, found)
            this.northeast.query(range, found)
            this.southwest.query(range, found)
            this.southeast.query(range, found)
        }
        // Done, return everything that was found. 
        return found;
    }

    // Check if two rectangles are intersecting (usually query rectangle vs quadtree boundary)
    intersects(rect1, rect2) {
        return !(rect2.x - rect2.w / 2 > rect1.x + rect1.w / 2 ||
                 rect2.x + rect2.w / 2 < rect1.x - rect1.w / 2 ||
                 rect2.y - rect2.h / 2 > rect1.y + rect1.h / 2 ||
                 rect2.y + rect2.h / 2 < rect1.y - rect1.h / 2);
    }

    // Draw the qt on the provided ctx
    draw(ctx,scale,col) {
        ctx.strokeStyle = col
        ctx.lineWidth = 1;
        ctx.strokeRect(this.boundary.x*scale - this.boundary.w*scale / 2, this.boundary.y*scale - this.boundary.h*scale / 2, this.boundary.w*scale, this.boundary.h*scale);

        if (this.divided) {
            this.northwest.draw(ctx,scale);
            this.northeast.draw(ctx,scale);
            this.southwest.draw(ctx,scale);
            this.southeast.draw(ctx,scale);
        }
    }
}

export default QuadTree