# Organisms Simulation — Stage One Design

A p5.js grid-based life simulation, built as a training exercise alongside the
existing `boids-bird-flock` experiment. Stage one delivers grass: stationary
organisms that seed, spread, and randomly appear. Roaming organisms (hunt/flee,
collisions) come in later stages — this design leaves the seams for them.

## Goals (Stage One)

- A small grid world, seeded reproducibly from a seed value.
- Grass organisms placed at random cells on startup.
- Grass spreads into an adjoining empty cell every N cycles (8-neighbour).
- Grass randomly appears in empty cells, biased toward less-trafficked areas.
- A cycle counter driven by animation frames.

## Non-Goals (Stage One)

- No moving organisms, no hunting/fleeing, no collisions. The architecture must
  *accommodate* them, not implement them.
- No death/decay of grass.
- No UI sliders yet (the boids' slider pattern is available when wanted).

## World Model

**Cycle:** a cycle = a fixed number of animation frames (`FRAMES_PER_CYCLE`).
A global `cycle` counter increments in `draw()` every `FRAMES_PER_CYCLE` frames.
This matches how the boids run everything inside `draw()`, and lets a slider
control speed later.

**Grid:** the world is `COLS × ROWS` cells, each cell `CELL_SIZE` pixels square,
small enough that individual cells read as pixels. Canvas = `COLS*CELL_SIZE` ×
`ROWS*CELL_SIZE`.

Two parallel structures:

1. `population` — a flat array of `Organism` objects. **The source of truth for
   each organism's own state.** Every organism (grass now, movers later) lives
   here and goes through the same update/show functions.
2. `grid[col][row]` — a **spatial index**: holds a reference to the `Organism`
   occupying that cell, or `null`. Lets any organism answer "who is adjacent to
   me?" in O(1) instead of scanning the whole population. Kept in sync with
   `population` at the three moments state changes: **birth, move, death.**
3. `traffic[col][row]` — an integer per cell, how often the cell has been
   travelled through. Zero everywhere in stage one (nothing moves yet); wired in
   now because retrofitting a per-cell counter later touches the same grid code.

Grid as index (not owner) is deliberate: it gives us *both* a uniform organism
list *and* cheap neighbour lookups, which is what makes future collision/hunt/
flee logic fast.

## Organism

A single class for all organisms. Stage one only constructs grass, but the shape
anticipates movers.

```
class Organism {
  col, row        // grid position (integers)
  type            // 'grass' for now; drives behaviour + colour
  bornCycle       // cycle it was created — used for "grown enough yet?"
  size            // 1 cell for grass; larger sizes matter for movers later

  update()        // per-cycle behaviour; grass -> maybeGrow()
  show()          // draw self at col*CELL_SIZE, row*CELL_SIZE
}
```

`type` is the branch point. `update()` dispatches on it (`if type === 'grass'`).
When movers arrive they're new `type` values with movement in `update()` — same
function, same list, same grid index.

## Data Flow (one frame)

```
draw():
  advance cycle counter if FRAMES_PER_CYCLE frames elapsed
  if new cycle:
     for each organism in population: organism.update()   // grass may spread
     maybeSpawnRandomGrass()                                // traffic-biased
  clear canvas
  for each organism in population: organism.show()
```

Rendering every frame keeps it smooth; *behaviour* only fires on cycle
boundaries, so growth speed is decoupled from framerate.

## Grass Behaviour

**Seeding (startup):** with a fixed seed (`randomSeed(SEED)`, `noiseSeed(SEED)`),
place `INITIAL_GRASS` grass organisms at random empty cells. Same seed →
same starting layout.

**Spreading (`maybeGrow`):** a grass organism spreads only if
`cycle - bornCycle >= GROWTH_AGE` (old enough) and it's a growth cycle. It looks
at its 8 neighbours, filters to the empty ones (`grid` slot null and in-bounds),
picks one at random, and births a new grass organism there. If no neighbour is
empty, it skips this cycle. New grass gets `bornCycle = cycle`, so spread
ripples outward over time rather than exploding instantly.

**Random appearance (`maybeSpawnRandomGrass`):** each cycle, with probability
`SPAWN_CHANCE`, pick an empty cell biased toward **low traffic**. In stage one
all traffic is 0, so this is effectively uniform-random; once movers exist the
bias engages automatically. Bias mechanism: sample a few random empty cells and
keep the lowest-traffic one (cheap weighted pick, no full sort).

## Birth / Move / Death helpers

The only places `grid` and `population` must stay in sync. Centralised so the
sync is impossible to forget:

```
birth(organism):  population.push(organism); grid[col][row] = organism
move(organism, newCol, newRow):  grid[old]=null; update pos; grid[new]=organism
death(organism):  grid[col][row]=null; remove from population
```

Stage one uses `birth` only. `move`/`death` exist as the seams for movers — write
`birth` now, add the others when first needed (YAGNI, but named here so the
structure is clear).

## Files

Mirrors the boids layout (`index.html` + a class file + `sketch.js`):

- `index.html` — loads p5 from CDN, then `organisms.js`, then `sketch.js`.
  (Stub already references `organisms.js` — correct as-is.)
- `organisms.js` — the `Organism` class.
- `sketch.js` — grid/traffic globals, constants, `setup()`, `draw()`, the
  `birth`/spawn/neighbour helpers, `randomSeed`.

The current `organisms/sketch.js` is a leftover copy of the flock's and will be
replaced.

## Constants (tunable, top of sketch.js)

```
SEED             // reproducibility
COLS, ROWS       // grid dimensions
CELL_SIZE        // pixels per cell (small)
FRAMES_PER_CYCLE // frames between cycles
INITIAL_GRASS    // seed count
GROWTH_AGE       // cycles before grass can spread
GROWTH_CHANCE    // per-cycle chance an eligible grass spreads (optional)
SPAWN_CHANCE     // per-cycle chance of a random new grass
```

Real-world tuning knobs, left exposed rather than magic numbers.

## Testing

p5 sketches are visual, but the pure logic is testable without a browser:

- Neighbour-finding returns correct in-bounds empty cells (edges/corners).
- `birth` keeps `population` and `grid` consistent.
- With a fixed seed, seeding produces the same cell layout twice.

One small assert-based self-check on the neighbour + birth logic (the parts that
break silently), runnable in node by stubbing the couple of p5 calls used.
Visual behaviour (does it *look* like spreading grass) verified by running it.

## Later Stages (context, not built now)

- Roaming organisms: new `type`s with movement in `update()`, using
  `move`/`death`; `size` starts driving behaviour and interaction.
- Traffic bias activates as movers increment `traffic` on the cells they cross.
- Collisions / hunt / flee: O(1) neighbour lookups via `grid` make same-cell and
  adjacent-cell interaction cheap.
