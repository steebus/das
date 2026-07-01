class Organism {
    constructor(col, row, type) {
        this.col = col;
        this.row = row;
        this.type = type;
        this.bornCycle = cycle;
        this.size = 1;
    }

    show() {
        let grassColor = color(0, 200, 0);
        fill(grassColor);

        push();

        rect(this.col * CELL_SIZE, this.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);

        pop();

    }

    update() {

    }

}

