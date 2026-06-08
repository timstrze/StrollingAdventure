# Word Search Web Page — Agent Instructions

Build a self-contained, single HTML file for an interactive word search puzzle. Everything (HTML, CSS, JavaScript) must live in one file with no external dependencies.

---

## Puzzle Details

**Title:** Strolling Adventure Word Search

**Words to hide (13 total):**
- tigerswallowtail
- coneflowers
- strolling
- squirrels
- adventure
- pinecone
- cardinal
- honeybee
- yorktown
- friends
- leaves
- sun

**Footer:** www.strollingadventure.com (centered at the bottom of the page)

---

## Grid Generation (JavaScript)

Generate the grid programmatically in JavaScript on page load using a seeded random number generator so the puzzle is consistent every visit.

1. Use a **24×24 grid**.
2. Place words in random positions and directions. Allow all 8 directions: horizontal (left→right, right→left), vertical (top→bottom, bottom→top), and all 4 diagonals.
3. Sort words longest-first before placing to reduce placement failures.
4. For each word, attempt up to 5,000 random position/direction combinations. A placement is valid only if every letter either lands on an empty cell or on a cell already containing the same letter (overlap is allowed).
5. After all words are placed, fill every remaining empty cell with a random uppercase letter (A–Z).
6. Store each placed word's starting row, starting column, and direction vector (dr, dc) so the answer overlay can highlight them later.

---

## Visual Design

- **Color scheme:** Black and white only. White background (`#ffffff`), black text and borders, light gray (`#aaaaaa`) grid lines.
- **Font:** System sans-serif stack — `"Helvetica Neue", Arial, sans-serif`.
- **Title:** Bold, ~28px, centered at top.
- **Decorative rule:** A thin black horizontal line beneath the title.
- **Grid:** Rendered as an HTML `<table>` or CSS grid. Each cell is a fixed square (approx 32–36px). Outer border is 2px solid black; inner lines are 1px solid `#aaaaaa`. Letters are bold, centered in each cell.
- **Word list:** Displayed below the grid under a "Find these words:" label. Arrange words in 4–5 columns, lowercase, plain font.
- **Footer URL:** `www.strollingadventure.com`, centered, below the word list.

---

## Interactive Features

### Show Answer Button
- Label: **"Show Answer"**
- When clicked, highlight every cell that belongs to a hidden word by changing that cell's background to light gray (`#cccccc`) and the letter color to black. This visually traces each word in the grid.
- Clicking again (toggle) removes the highlights and resets the grid to its default appearance.
- Button label toggles between "Show Answer" and "Hide Answer".

### Print Button
- Label: **"Print"**
- Calls `window.print()`.
- Use a `@media print` CSS rule to hide **both** buttons (Show Answer and Print) so they do not appear on the printed page.
- Also ensure any answer highlights are hidden during printing — the printed version should always show the clean puzzle without highlights, regardless of the current toggle state. Accomplish this by adding a `.no-print` class to the button container and using `@media print { .no-print { display: none; } }`, and separately ensuring highlighted cells print as white background.

### Button Placement
- Place both buttons centered, above the grid (between the title rule and the grid).
- Style them consistently: rectangular, black border, white background, black text, slight padding. No rounded corners or color fills — keep it black and white.

---

## Page Layout (top to bottom)

1. Title — "Strolling Adventure Word Search"
2. Thin horizontal rule
3. Buttons row — [Show Answer] [Print] (hidden on print)
4. Word search grid (24×24)
5. "Find these words:" label + word list in columns
6. Footer — www.strollingadventure.com

---

## Additional Notes

- The page should work with no internet connection (no CDN imports, no external fonts).
- Mobile-friendly: on narrow screens, scale the grid down so it fits without horizontal scrolling (use `transform: scale()` or `vw`-based sizing).
- No frameworks, no build tools — vanilla HTML/CSS/JS only.
- Do not use `localStorage` or any browser storage APIs.
