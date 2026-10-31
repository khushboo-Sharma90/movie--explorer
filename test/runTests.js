import assert from "node:assert";
import {
  FALLBACK_GENRES,
  MOODS,
  API_KEY,
  BASE_URL,
} from "../src/services/apiService.js";
import {
  getFav,
  addToFav,
  removeFromFav,
  isFav,
  getWatchlist,
  addToWatchlist,
  removeFromWatchlist,
  isInWatchlist,
} from "../src/components/fav.js";

// Mock localStorage for Node environment testing
const storage = {};
globalThis.localStorage = {
  getItem: (key) => storage[key] || null,
  setItem: (key, val) => {
    storage[key] = String(val);
  },
  removeItem: (key) => {
    delete storage[key];
  },
  clear: () => {
    for (const k in storage) delete storage[k];
  },
};

globalThis.window = {
  dispatchEvent: () => {},
};

console.log("🧪 Running Unit Verification Tests...\n");

// 1. Verify Configuration & Fallback data
console.log("1. Verifying API Configuration & Constants...");
assert.ok(API_KEY, "API_KEY should be present");
assert.ok(BASE_URL.startsWith("https://"), "BASE_URL should start with https://");
assert.strictEqual(BASE_URL.endsWith(" "), false, "BASE_URL must not have trailing whitespace");
assert.ok(FALLBACK_GENRES.length >= 19, "Fallback genres should have at least 19 genres");
assert.ok(MOODS.length >= 4, "Should have at least 4 predefined moods");

const moodIds = MOODS.map((m) => m.id);
assert.ok(moodIds.includes("happy"), "Must include 'happy' mood");
assert.ok(moodIds.includes("romantic"), "Must include 'romantic' mood");
assert.ok(moodIds.includes("thrilling"), "Must include 'thrilling' mood");
assert.ok(moodIds.includes("mind-bending"), "Must include 'mind-bending' mood");
console.log("   ✅ API Configuration & Constants valid.");

// 2. Verify Favourites Storage & Duplicate Prevention
console.log("\n2. Verifying Favourites Persistence & Duplicate Prevention...");
localStorage.clear();
assert.deepStrictEqual(getFav(), [], "Initial favourites should be empty array");

const movie1 = { id: 101, title: "Inception", vote_average: 8.8 };
const movie2 = { id: 202, title: "Interstellar", vote_average: 8.6 };

addToFav(movie1);
assert.strictEqual(getFav().length, 1, "Should have 1 favourite movie");
assert.strictEqual(isFav(101), true, "Movie 101 should be marked as favourite");
assert.strictEqual(isFav("101"), true, "isFav should handle string IDs");
assert.strictEqual(isFav(999), false, "Non-existent movie should return false");

// Attempt duplicate add
addToFav(movie1);
assert.strictEqual(getFav().length, 1, "Duplicate add should not increase count");

// Add second movie
addToFav(movie2);
assert.strictEqual(getFav().length, 2, "Should now have 2 favourites");

// Remove movie1
removeFromFav(101);
assert.strictEqual(getFav().length, 1, "Should have 1 favourite after removal");
assert.strictEqual(isFav(101), false, "Movie 101 should no longer be favourite");
assert.strictEqual(isFav(202), true, "Movie 202 should still be favourite");
console.log("   ✅ Favourites persistence & duplicate prevention passed.");

// 3. Verify Watchlist Storage & Duplicate Prevention
console.log("\n3. Verifying Watchlist Persistence & Duplicate Prevention...");
assert.deepStrictEqual(getWatchlist(), [], "Initial watchlist should be empty array");

const movie3 = { id: 303, title: "The Dark Knight", vote_average: 9.0 };
addToWatchlist(movie3);
assert.strictEqual(getWatchlist().length, 1, "Should have 1 movie in watchlist");
assert.strictEqual(isInWatchlist(303), true, "Movie 303 should be in watchlist");

// Duplicate add to watchlist
addToWatchlist(movie3);
assert.strictEqual(getWatchlist().length, 1, "Duplicate add should be prevented in watchlist");

// Remove from watchlist
removeFromWatchlist(303);
assert.strictEqual(getWatchlist().length, 0, "Watchlist should be empty after removal");
assert.strictEqual(isInWatchlist(303), false, "Movie 303 should no longer be in watchlist");
console.log("   ✅ Watchlist persistence & duplicate prevention passed.");

// 4. Verify Corrupted JSON handling in Storage
console.log("\n4. Verifying Corrupted JSON resilience in Storage...");
storage["favMovie"] = "INVALID_JSON{";
assert.deepStrictEqual(getFav(), [], "Corrupted JSON should fallback to empty array safely");
storage["watchlistMovies"] = "{not: an array}";
assert.deepStrictEqual(getWatchlist(), [], "Non-array JSON should fallback to empty array safely");
console.log("   ✅ Storage error handling passed.");

console.log("\n🎉 ALL UNIT VERIFICATION TESTS PASSED SUCCESSFULLY!");
