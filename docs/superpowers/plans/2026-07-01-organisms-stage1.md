# Organisms Stage One — Lesson Plan

> **Format note:** This is a *guided lesson*, not a paste-the-code plan. Each task
> tells you what to build, the exact names/signatures so the pieces fit together,
> and a way to check it works. **You write the code.** I guide at each step and
> answer questions. Where the boids experiment already shows a pattern, I point
> at it (`experiments/boids-bird-flock/`) rather than repeat it.

**Goal:** A p5.js grid sim where grass seeds, spreads into neighbours over
cycles, and randomly appears — with the architecture ready for roaming
organisms later.

**Architecture:** One `Organism` class in a flat `population[]` list; a
`grid[col][row]` spatial index pointing into that list; a `traffic[col][row]`
counter (zeros for now). Behaviour fires on cycle boundaries; rendering every
frame.

**Tech Stack:** p5.js 1.11.13 (CDN, already in `index.html`), plain JS, no build
step. Open `index.html` in a browser to run.

## Global Constraints

- Grid is the source of layout; `grid` indexes into `population`, it does not own
  organisms. Keep them in sync only in `birth`/`move`/`death`.
- Reproducible: call `randomSeed(SEED)` in `setup()` before any placement.
- 8-neighbour adjacency (includes diagonals).
- Cycle = every `FRAMES_PER_CYCLE` frames. Behaviour on cycle boundary; render
  every frame.
- Stage one constructs `type === 'grass'` only, and uses `birth` only.
- No new dependencies. Stdlib / p5 built-ins only.

---

### Task 1: Grid scaffold — canvas, constants, empty grid, one drawn cell

**Goal:** Get a window on screen with the grid data structures in place. Nothing
grows yet — this is the skeleton everything hangs off.

**Files:**
- Modify: `experiments/organisms/index.html` (already loads `organisms.js` then
  `sketch.js` — verify, no change likely needed)
- Create: `experiments/organisms/organisms.js` (empty `Organism` class stub)
- Replace: `experiments/organisms/sketch.js` (currently a leftover copy of the
  flock — you'll overwrite it)

**What to build in `sketch.js`:**
- Constants at the top: `SEED`, `COLS`, `ROWS`, `CELL_SIZE`, `FRAMES_PER_CYCLE`,
  `INITIAL_GRASS`, `GROWTH_AGE`, `SPAWN_CHANCE`. Start small so you can *see*
  cells — e.g. `COLS = ROWS = 80`, `CELL_SIZE = 8` → a 640×640 canvas (same size
  as the boids canvas, so it feels familiar).
- Globals: `population = []`, `grid`, `traffic`, `cycle = 0`.
- `setup()`: `createCanvas(COLS*CELL_SIZE, ROWS*CELL_SIZE)`, `randomSeed(SEED)`,
  then build `grid` and `traffic` as 2D arrays (`grid[col][row]`), grid filled
  with `null`, traffic filled with `0`.
- `draw()`: `background(51)` (matches boids). Leave the rest for later tasks.

**Interfaces produced (later tasks rely on these names):**
- `grid` — 2D array `[COLS][ROWS]`, cell = `Organism | null`
- `traffic` — 2D array `[COLS][ROWS]`, cell = integer
- `population` — array of `Organism`
- `cycle` — integer, current cycle number

- [ ] **Step 1:** Overwrite `sketch.js` with constants + globals + `setup()`
      building the two 2D arrays + `draw()` with just `background(51)`.
- [ ] **Step 2:** Create `organisms.js` with an empty `class Organism {}` (so
      `index.html`'s script tag resolves).
- [ ] **Step 3:** Open `index.html` in a browser. Expect: a dark 640×640 canvas,
      no errors in the console. (Open devtools console — a typo in the 2D-array
      construction shows up here.)
- [ ] **Step 4 (check):** In the browser console, type `grid.length` (→ 80) and
      `grid[0].length` (→ 80) and `grid[0][0]` (→ null). Confirms the grid is
      shaped right. This is your test for this task.
- [ ] **Step 5:** Commit. `git add experiments/organisms && git commit`.

**Guidance notes:** Building a 2D array in JS trips people up — `new
Array(COLS).fill([])` gives every column the *same* inner array (a classic bug).
Ask me how to build it correctly when you get here.

---

### Task 2: The Organism class + birth() — one grass cell on screen

**Goal:** Define the organism, and the single helper that keeps `population` and
`grid` in sync. Then place one grass and see it.

**Files:**
- Modify: `experiments/organisms/organisms.js`
- Modify: `experiments/organisms/sketch.js`

**What to build:**

In `organisms.js`, flesh out `Organism`:
- `constructor(col, row, type)` → sets `this.col`, `this.row`, `this.type`,
  `this.bornCycle = cycle` (reads the global), `this.size = 1`.
- `show()` → draw a filled rect at `this.col*CELL_SIZE, this.row*CELL_SIZE`,
  `CELL_SIZE × CELL_SIZE`. Grass = green (`fill(0, 200, 0)`). Look at
  `boid.js:135-158` `show()` for the p5 `push/pop`/`fill`/shape pattern — yours
  is simpler (no rotation, just a rect).
- `update()` → empty for now (stub; Task 4 fills grass behaviour).

In `sketch.js`, add the helper:
- `birth(organism)` → `population.push(organism)` **and**
  `grid[organism.col][organism.row] = organism`. This is the *only* place both
  get written together.
- In `draw()`, after `background(51)`, loop `for (const o of population)
  o.show()`. (Mirrors the boids' `for (let boid of flock) boid.show()`.)
- Temporarily, at the end of `setup()`: `birth(new Organism(40, 40, 'grass'))`
  to prove it draws.

**Interfaces produced:**
- `class Organism { col, row, type, bornCycle, size; update(); show() }`
- `birth(organism)` — adds to `population` and sets `grid[col][row]`

- [ ] **Step 1:** Write `Organism` constructor + `show()` + empty `update()`.
- [ ] **Step 2:** Write `birth()` in `sketch.js` and the `show()` loop in `draw()`.
- [ ] **Step 3:** Add the temporary `birth(new Organism(40,40,'grass'))` in `setup()`.
- [ ] **Step 4 (check):** Reload. Expect: one green 8×8 square dead centre of the
      canvas. In console: `population.length` → 1, `grid[40][40]` → the Organism,
      `grid[0][0]` → null.
- [ ] **Step 5:** Remove the temporary single `birth` line (Task 3 replaces it
      with seeding). Commit.

---

### Task 3: Reproducible seeding — INITIAL_GRASS cells from the seed

**Goal:** Scatter the starting grass, reproducibly.

**Files:**
- Modify: `experiments/organisms/sketch.js`

**What to build:**
- `randomEmptyCell()` → returns `{col, row}` of a random cell where
  `grid[col][row]` is `null`. Simplest correct approach: pick random
  `col`/`row`, retry if occupied. On a mostly-empty grid this is fine. (`//
  ponytail: reject-sample; fine while grid is sparse`.) Use p5's `random()` /
  `floor()` so it respects `randomSeed`.
- `seedGrass()` → loop `INITIAL_GRASS` times: get a `randomEmptyCell()`,
  `birth(new Organism(col, row, 'grass'))`.
- Call `seedGrass()` at the end of `setup()` (after `randomSeed(SEED)`).

**Interfaces produced:**
- `randomEmptyCell()` → `{col, row}` over an empty cell
- `seedGrass()` — places `INITIAL_GRASS` grass via `birth`

- [ ] **Step 1:** Write `randomEmptyCell()`.
- [ ] **Step 2:** Write `seedGrass()`, call it in `setup()`.
- [ ] **Step 3 (check — reproducibility):** Reload twice. The green cells appear
      in the *same* positions every reload (that's `randomSeed` working). In
      console: `population.length` → `INITIAL_GRASS`. Then change `SEED`, reload:
      a *different* but again-stable layout.
- [ ] **Step 4:** Commit.

**Guidance note:** If the layout changes every reload, something called
`random()` before `randomSeed()`, or you seeded with a value that varies. We'll
debug via the console.

---

### Task 4: The cycle clock + grass spreading (the heart of stage one)

**Goal:** Time advances in cycles; old-enough grass spreads into a random empty
8-neighbour.

**Files:**
- Modify: `experiments/organisms/sketch.js` (cycle clock, neighbour helper)
- Modify: `experiments/organisms/organisms.js` (`update()` for grass)

**What to build:**

Cycle clock in `draw()`:
- Every frame, check `if (frameCount % FRAMES_PER_CYCLE === 0)`. When true, it's
  a new cycle: increment `cycle`, then run the behaviour pass —
  `for (const o of [...population]) o.update()`. **Copy the array** (`[...]`)
  before iterating, because `update()` will `birth` new organisms into
  `population` mid-loop, and you don't want newborns to also act on the same
  cycle they were born.
- Keep `show()` running every frame (outside the cycle check) for smoothness.

Neighbour helper in `sketch.js`:
- `emptyNeighbours(col, row)` → array of `{col, row}` for the up-to-8 surrounding
  cells that are **in bounds** and **empty** (`grid` slot null). Loop `dc` in
  `-1..1`, `dr` in `-1..1`, skip `dc===0 && dr===0` (that's self), skip
  out-of-bounds, skip occupied.

Grass `update()` in `organisms.js`:
- Guard: `if (this.type !== 'grass') return;`
- Age gate: `if (cycle - this.bornCycle < GROWTH_AGE) return;` (too young).
- Get `emptyNeighbours(this.col, this.row)`. If empty array → return (boxed in,
  skip). Otherwise `random(list)` picks one, and `birth(new Organism(pick.col,
  pick.row, 'grass'))`.

**Interfaces produced:**
- `emptyNeighbours(col, row)` → array of `{col, row}`, in-bounds & empty
- `Organism.update()` — grass spreads per the rules above
- `cycle` now advances

- [ ] **Step 1:** Write `emptyNeighbours()` in `sketch.js`.
- [ ] **Step 2 (check the helper first — it's the bug-prone part):** In the
      browser console after load, call `emptyNeighbours(0,0)` — a corner cell —
      and confirm you get at most 3 cells, all in-bounds (no negative indices).
      Call it on an interior empty cell → up to 8. This is your neighbour test.
- [ ] **Step 3:** Add the cycle clock to `draw()` (increment + copied-array
      update loop).
- [ ] **Step 4:** Write grass `update()` with the age gate + spread.
- [ ] **Step 5 (check — spreading):** Reload and watch. Grass blobs should grow
      outward over seconds, 8-directionally, and stop where they run into each
      other. Tune `FRAMES_PER_CYCLE` and `GROWTH_AGE` until the pace feels right
      (that's the hand-tuning the design calls for).
- [ ] **Step 6:** Commit.

**Guidance note — the copied-array subtlety** is the one genuinely tricky idea in
stage one. If grass seems to fill the screen almost instantly, you're likely
iterating the live array and newborns spread on their birth cycle. Ask me and
we'll trace it.

---

### Task 5: Random grass appearance (traffic-biased, uniform for now)

**Goal:** New grass occasionally pops up in empty space, biased toward
low-traffic cells — machinery that's ready for movers even though traffic is all
zero now.

**Files:**
- Modify: `experiments/organisms/sketch.js`

**What to build:**
- `maybeSpawnRandomGrass()`:
  - `if (random() > SPAWN_CHANCE) return;` (most cycles, nothing happens).
  - Otherwise pick a low-traffic empty cell. Cheap weighted pick: sample ~5
    `randomEmptyCell()` candidates, keep the one with the lowest
    `traffic[col][row]`. In stage one all traffic is 0 so it's effectively
    uniform — but the bias is wired and engages the moment movers write traffic.
  - `birth(new Organism(cell.col, cell.row, 'grass'))`.
- Call `maybeSpawnRandomGrass()` once per **cycle** in `draw()` (inside the
  `frameCount % FRAMES_PER_CYCLE` block, after the update loop).

**Interfaces produced:**
- `maybeSpawnRandomGrass()` — per-cycle chance to birth grass on a low-traffic
  empty cell

- [ ] **Step 1:** Write `maybeSpawnRandomGrass()`.
- [ ] **Step 2:** Call it once per cycle in `draw()`.
- [ ] **Step 3 (check):** Set `INITIAL_GRASS` low (say 3) and `SPAWN_CHANCE`
      high (say 0.5) temporarily. Reload: new isolated grass specks should appear
      in open areas over time, independent of the spreading blobs. Then restore
      sane values.
- [ ] **Step 4 (check — bias sanity):** In console, manually set some
      `traffic[col][row]` high across a region, then watch — new spawns should
      avoid that region. (Optional but proves the bias before movers exist.)
- [ ] **Step 5:** Commit.

---

### Task 6 (optional): Node self-check for the pure logic

**Goal:** One runnable assert test for the two functions that break *silently*
(no visual tell): `emptyNeighbours` bounds/occupancy, and `birth` keeping
`grid`+`population` in sync.

**Files:**
- Create: `experiments/organisms/test-logic.js`

**What to build:** A tiny node script that stubs the handful of globals the
functions read (`grid`, `population`, `COLS`, `ROWS`) — no p5 needed for these
two — and asserts:
- `emptyNeighbours(0,0)` returns exactly the 3 in-bounds corner neighbours, none
  out of bounds.
- `emptyNeighbours` on a cell surrounded by occupied slots returns `[]`.
- After `birth(o)`, `population` includes `o` **and** `grid[o.col][o.row] === o`.

Run: `node experiments/organisms/test-logic.js` → prints "ok" / throws on failure.

- [ ] **Step 1:** Factor `emptyNeighbours` + `birth` so they can be required by
      node (or copy them into the test with the stubbed globals — ask me which is
      cleaner for this setup).
- [ ] **Step 2:** Write the asserts.
- [ ] **Step 3 (check):** `node experiments/organisms/test-logic.js` → `ok`.
      Break a bound deliberately (e.g. allow negative col) → it throws. Restore.
- [ ] **Step 4:** Commit.

**Note:** This task is optional for a training exercise — the visual checks in
Tasks 1–5 already catch most breakage. Do it if you want to see how to test
p5-adjacent logic without a browser. Skip it and nothing downstream breaks.

---

## What you'll have at the end

A running grid where seeded grass spreads outward over cycles and new grass
occasionally appears, all reproducible from `SEED`. The `Organism` class,
`population[]`, `grid` index, `traffic` counter, and `birth`/`move`/`death` seam
are exactly the shape the next stage (roaming organisms, hunt/flee, collisions)
plugs into — you add `move`/`death` and a mover `type`, nothing gets
restructured.
