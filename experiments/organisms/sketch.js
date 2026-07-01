const SEED = 1234;
const COLS = 160;
const ROWS = COLS;
const CELL_SIZE = 4;

const FRAMES_PER_CYCLE = 10;

const INITIAL_GRASS = 80;
const GROWTH_AGE = 3;
const SPAWN_CHANCE = .5;

const INITIAL_ALPHAS = 20;
const ALPHA_SPEED = 5;
const STARVE_INTERVAL = 10;
const STARVE_AMOUNT = 1;

population = [];
grid = [];
traffic = [];
cycle = 0;
let grassLayer;
let pendingGrass = [];

function birth(organism) { // adds an organism to the population and grid
  population.push(organism);
  grid[organism.col][organism.row] = organism;
  if (organism.type === 'grass') {
    pendingGrass.push(organism);
  }
}

function randomEmptyCell() { // returns a random empty cell in the grid
  let col, row;
  do {
    col = floor(random(COLS));
    row = floor(random(ROWS));
  } while (grid[col][row] !== null);
  return { col, row };
}

function emptyNeighbours(col, row) {
  const result = [];
  for (const dc of [-1, 0, 1]) {
    for (const dr of [-1, 0, 1]) {
      if (dc === 0 && dr === 0) continue;
      const c = col + dc;
      const r = row + dr;
      if (c >= 0 && c < COLS && r >= 0 && r < ROWS && grid[c][r] === null) {
        result.push({ col: c, row: r });

      }
    }
  }
  return result;
}

function randomNeighbour(col, row) {
  const result = [];
  for (const dc of [-1, 0, 1]) {
    for (const dr of [-1, 0, 1]) {
      if (dc === 0 && dr === 0) continue;
      const c = col + dc;
      const r = row + dr;
      if (c >= 0 && c < COLS && r >= 0 && r < ROWS) {
        result.push({ col: c, row: r });

      }
    }
  }
  const pick = random(result);

  return pick;
}

function randomNewGrass() {
  if (random() < SPAWN_CHANCE) {
    const { col, row } = randomEmptyCell();
    birth(new Organism(col, row, 'grass'));
  }
}

function seedGrass() {
  for (let i = 0; i < INITIAL_GRASS; i++) {
    const { col, row } = randomEmptyCell();
    birth(new Organism(col, row, 'grass'));
  }
}

function seedAlphas() {
  for (let i = 0; i < INITIAL_ALPHAS; i++) {
    const { col, row } = randomEmptyCell();
    birth(new Organism(col, row, 'alpha'));
  }
}

function move(o, newCol, newRow) {
  grid[o.col][o.row] = null;
  o.col = newCol;
  o.row = newRow;
  grid[o.col][o.row] = o;
}

function death(o) {
  grid[o.col][o.row] = null;
  const index = population.indexOf(o);
  if (index >= 0) population.splice(index, 1);
  if (o.type === 'grass') {
    grassLayer.fill(51); grassLayer.noStroke();
    grassLayer.rect(o.col * CELL_SIZE, o.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
  }
}

function setup() {
  createCanvas(COLS * CELL_SIZE, ROWS * CELL_SIZE);
  grassLayer = createGraphics(COLS * CELL_SIZE, ROWS * CELL_SIZE);
  grassLayer.background(51);

  randomSeed(SEED);

  traffic = Array(COLS).fill().map(() => Array(ROWS).fill(0)); // fill traffic with 0
  grid = Array(COLS).fill().map(() => Array(ROWS).fill(null)); // fill grid with null

  seedGrass();
  seedAlphas();
}

function draw() {
  background(51);

  if (frameCount % FRAMES_PER_CYCLE === 0) {
    cycle++;
    for (const o of [...population])
      if (o.type === 'grass') o.update();

    randomNewGrass();

    // draw grass to buffer
    if (pendingGrass.length > 0) {
      grassLayer.fill(0, 200, 0);
      grassLayer.noStroke();
      for (const o of pendingGrass) {
        grassLayer.rect(o.col * CELL_SIZE, o.row * CELL_SIZE, CELL_SIZE, CELL_SIZE);
      }
      pendingGrass.length = 0;
    }

    image(grassLayer, 0, 0);
  }





  // update moving organisms
  for (const o of population) {
    if (o.type !== 'grass') {
      o.update();
      o.show();
    }
  }

  fill(255);
  noStroke();
  text(`cycle: ${cycle}`, 5, 15);
  text(`tick: ${frameCount}`, 5, 30);
}
