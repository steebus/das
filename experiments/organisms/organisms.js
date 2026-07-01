class Organism {
    constructor(col, row, type) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.bornCycle = cycle;
        this.size = 1;
        this.lastMove = frameCount;
    }


    show() {

        fill(220, 60, 60);
        rect(this.col * CELL_SIZE, this.row * CELL_SIZE, CELL_SIZE * this.size, CELL_SIZE * this.size);

    }

    resolveCollisions() {
        const reach = ceil(this.size / 2);
        for (let dc = -reach; dc <= reach; dc++) {
            for (let dr = -reach; dr <= reach; dr++) {
                const c = this.col + dc, r = this.row + dr;
                if (c < 0 || c >= COLS || r < 0 || r >= ROWS) continue;
                const other = grid[c][r];
                if (!other || other === this) continue;

                const d = dist(this.col, this.row, other.col, other.row);
                if (d * 2 >= this.size + other.size) continue;   // radii don't overlap

                if (other.type === 'grass') {
                    this.size++;
                    death(other);
                } else if (other.type === 'alpha') {
                    this.size--; other.size--;
                    if (other.size <= 0) death(other);
                    if (this.size <= 0) { death(this); return; }   // we died — stop
                }
            }
        }
    }

    growGrass() {
        if (frameCount % FRAMES_PER_CYCLE !== 0) return;
        if (cycle - this.bornCycle < GROWTH_AGE) return;
        const options = emptyNeighbours(this.col, this.row);
        if (options.length === 0) return;
        const pick = random(options);
        birth(new Organism(pick.col, pick.row, 'grass'));
    }

    moveAlpha() {
        if (frameCount - this.lastMove < ALPHA_SPEED) return;
        this.lastMove = frameCount;

        // move into a random empty neighbour (movement no longer resolves collisions)
        const target = randomNeighbour(this.col, this.row);
        if (target && grid[target.col][target.row] === null) {
            move(this, target.col, target.row);
        }

        // resolve reach-based collisions from wherever we now are
        this.resolveCollisions();
    }

    update() {
        //alpha
        if (this.type === 'alpha') this.moveAlpha();

        //grass
        if (this.type === 'grass') this.growGrass();
    }
}
