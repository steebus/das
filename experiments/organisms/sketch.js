const SEED = 1234;
const COLS = 160;
const ROWS = COLS;
const CELL_SIZE = 4;

const FRAMES_PER_CYCLE = 100;

const INITIAL_GRASS = 80;
const GROWTH_AGE = 3;
const SPAWN_CHANCE = 0.01;

population = [];
grid = [];
traffic = [];
cycle = 0;

function birth(organism) { // adds an organism to the population and grid
  population.push(organism);
  grid[organism.col][organism.row] = organism;
}

function randomEmptyCell() { // returns a random empty cell in the grid
  let col, row;
  do {
    col = floor(random(COLS));
    row = floor(random(ROWS));
  } while (grid[col][row] !== null);
  return { col, row };
}

function seedGrass() {
  for (let i = 0; i < INITIAL_GRASS; i++) {
    const { col, row } = randomEmptyCell();
    birth(new Organism(col, row, 'grass'));
  }
}

function setup() {
  createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE);

  randomSeed(SEED);

  traffic = Array(COLS).fill().map(() => Array(ROWS).fill(0)); // fill traffic with 0
  grid = Array(COLS).fill().map(() => Array(ROWS).fill(null)); // fill grid with null

  seedGrass();
}



function draw() {
  background(51);

  for (const o of population) {
    o.show();
  }

}

