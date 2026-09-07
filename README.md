# KNN Explorer — Peanut Butter

A beginner-friendly K-nearest neighbors classifier, built as one standalone `index.html` with embedded CSS and JavaScript. No build step, libraries, or external assets are needed.

Live application: https://ttithipan.github.io/KNN-visualization/

## Explore

1. Generate one of three dataset patterns, or add/delete labeled points on the canvas.
2. Move the diamond-shaped query; arrow keys also move it when the canvas has focus.
3. Choose k, Euclidean or Manhattan distance, and equal or inverse-distance voting.
4. Use **Next step** to measure distances, rank neighbors, add votes, and predict. **Play to completion** runs these stages automatically; it can be paused.
5. Watch the decision regions, neighbor table, vote totals, and validation error update together.

The two desktop columns scroll independently. Small screens use a stacked layout.

## Mathematical interpretation

KNN is a lazy learner: there are no weights to train, epochs, or convergence loss. The assignment's convergence control is represented by playback until the prediction is complete. The loss chart shows leave-one-out classification error as the number of considered neighbors increases. Error is not necessarily monotonic. Each held-out point is excluded from its own neighbors; validation caps k at N − 1.

Ties use the nearest selected neighbor, with point IDs breaking equal-distance ties. Under distance weighting, exact matches take priority. Coordinates share the same 0–10 scale. The canvas is a rectangular view of that coordinate space; distances are computed in coordinate units.

## Theme and references

Warm neutral and terracotta styling is adapted to a dark background from https://advanced-theming-anthropic.streamlit.app/.
The interaction reference is https://llm-ce-kmitl.github.io/learning/ml-viz/linear.html.

## Run and verify

Open `index.html` directly, or serve this directory with any static web server.
Run mathematical unit/integration tests with `node --test tests/knn.test.cjs`.
Browser verification covers stepping, playback completion, disabled empty-data controls, point creation/deletion, and regeneration.

## Group — Peanut Butter · CEi KMITL

- 67011214 Nuttawee Wachiratienchai
- 67011220 Pacharapol Padungkarn
- 67011246 Pavikan Boonnaum
- 67011594 Chuthathip Termchaikul
- 67011671 Tithipan Thepsuthin
