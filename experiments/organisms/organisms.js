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
        rect(this.col * CELL_SIZE, this.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

    }

    growGrass() {
        if (cycle - this.bornCycle < GROWTH_AGE) return;
        const options = emptyNeighbours(this.col, this.row);
        if (options.length === 0) return;
        const pick = random(options);
        birth(new Organism(pick.col, pick.row, 'grass'));
    }

    moveAlpha() {
        if (frameCount - this.lastMove < ALPHA_SPEED) return;
        this.lastMove = frameCount;

        const target = randomNeighbour(this.col, this.row);
        if (!target) return;
        const occupant = grid[target.col][target.row];

        if (occupant === null) { move(this, target.col, target.row); }
        else if (occupant.type === 'grass') { this.size++; death(occupant); move(this, target.col, target.row); }
        else { // another alpha
            this.size--; occupant.size--;
            if (occupant.size <= 0) { death(occupant); move(this, target.col, target.row); }
            if (this.size <= 0) death(this);   // lost the bump; stays put if it survives               
        }
    }

    update() {

        //alpha
        if (this.type === 'alpha') this.moveAlpha();

        //grass
        else if (this.type === 'grass') this.growGrass();
    }
}