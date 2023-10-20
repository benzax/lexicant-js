/*
 * Compute the edit distance between two words
 */
function edit_distance(letters, word) {
  // distance[i][j] will contain the edit distance between the first i
  // characters of letters and the first j characters of word
  const distance = [];
  for (let i = 0; i <= letters.length; i++) {
    distance[i] = [i];
  }
  for (let j = 1; j <= word.length; j++) {
    distance[0][j] = j;
  }

  for (let i = 0; i < letters.length; i++) {
    for (let j = 0; j < word.length; j++) {
      if (letters[i] === word[j]) {
        distance[i + 1][j + 1] = distance[i][j];
      } else {
        distance[i + 1][j + 1] = Math.min(
          1 + distance[i][j],
          1 + distance[i + 1][j],
          1 + distance[i][j + 1],
        );
      }
    }
  }
  return distance[letters.length][word.length];
}

/*
 *
 * keys are substrings of dictionary words
 * entries are 3-tuples
 *   [0] is integer bitset marking valid prepends
 *   [1] is integer bitset marking valid appends
 *   [2] is +1 if the player who just played wins, else -1
 *
 * unplayable strings either aren't in the table, or map to [0, 0, 0]
 *
 * example: suppose the dictionary is ["abc", "abba"] (and length 3 words count)
 * map = {
 *   a   : [b], [b], win
 *   b   : [a, b], [a, b, c], loss
 *   c   : [b], [], loss
 *   ab  : [], [b, c], loss
 *   ba  : [b], [], loss
 *   bb  : [a], [a], loss
 *   bc  : [a], [], win
 *   abb : [], [a], win
 *   bba : [a], [], win
 */
class BKTree {
  constructor(words) {
    this.words = words;
    this.bk_tree_root = { 0: "dictionary" }; // arbitrary root node choice
    for (const word of words) {
      this.insert(this.bk_tree_root, word);
    }
    console.log(this);
    window.bk_tree = this;
  }

  insert(root, word) {
    const distance = edit_distance(root[0], word);
    if (distance === 0) {
      return; // word is already in the bk tree
    }
    if (!(distance in root)) {
      root[distance] = { 0: word };
    } else {
      this.insert(root[distance], word);
    }
  }

  lookup(word, slack) {
    return this.lookup_recursive(this.bk_tree_root, word, slack);
  }

  lookup_recursive(root, word, slack) {
    if (typeof root === "string") {
      if (edit_distance(root, word) <= slack) {
        return [root];
      } else {
        return [];
      }
    } else {
      const distance = edit_distance(root[0], word);
      const matches = [];
      for (let i = distance - slack; i <= distance + slack; i++) {
        if (i in root) {
          matches.push(...this.lookup_recursive(root[i], word, slack));
        }
      }
      return matches;
    }
  }
}
