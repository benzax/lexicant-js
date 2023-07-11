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
class LetterBitMapTrie {
  constructor(dictionary) {
    this.map = Object.create(null)
    this.dictionary = dictionary
    this.letters = 'abcdefghijklmnopqrstuvwxyz'
    this.addAll('')
    this.removePrefix = this.remove.bind(this, 0)
    this.removeSuffix = this.remove.bind(this, 1)
    this.computePlays()
  }

  computePlays() {
    this.computePrepends()
    this.computeAppends()
    this.computePerfectPlay('')
  }

  computePrepends() {
    let prepend = this.prepend()
    for (var word of this.dictionary) {
      for (let i = 0; i < word.length; ++i) {
        for (let j = i+1; j < word.length; ++j) {
          let slice = word.slice(i+1, j+1)
          prepend.add(slice, word[i])
        }
      }
    }
  }

  computeAppends() {
    let append = this.append()
    for (var word of this.dictionary) {
      for (let i = 0; i < word.length; ++i) {
        for (let j = i+1; j < word.length; ++j) {
          let slice = word.slice(i, j)
          append.add(slice, word[j])
        }
      }
    }
  }

  prepend() {
    let prepend = Object.create(null)
    prepend.add = this.add.bind(this, 0)
    prepend.get = this.get.bind(this, 0)
    return prepend
  }

  append() { 
    let append = Object.create(null)
    append.add = this.add.bind(this, 1)
    append.get = this.get.bind(this, 1)
    return append
  }

  remove(view, key, value) {
    this.map[key][view] &= ~(1 << (value.charCodeAt(0) - 97))
    this.map[key][2] = 0
  }

  hasExtensions(key) {
    if (!this.map[key]) {
      return false
    }
    return (this.map[key][0] != 0) || (this.map[key][1] != 0)
  }

  // value is lowercase letter
  add(view, key, value) {
    if (!this.map[key]) {
      this.map[key] = [0, 0, 0]
    }
    this.map[key][view] |= (1 << (value.charCodeAt(0) - 97))
  }

  get(view, key) {
    let arr = []
    if (!this.map[key]) {
      return arr
    }
    for (let i = 0; i < 26; i++) {
      if (this.map[key][view] & 1 << i) {
        arr.push(this.letters[i])
      }
    }
    return arr
  }
  
  addAll(key) {
    this.map[key] = [(1 << 26) - 1, (1 << 26) - 1, 0]
  }

  perfectPlay(letters) {
    if (!this.map[letters]) {
      return -1
    }
    if (this.map[letters][2] === 0) {
      this.map[letters][2] = this.computePerfectPlay(letters)
    }
    return this.map[letters][2]
  }

  // lazily compute perfect play
  computePerfectPlay(letters) {
    if (this.dictionary.has(letters)) {
      return -1
    }

    let prepends = this.get(0, letters)
    for (var p of prepends) {
      if (this.perfectPlay(p + letters) === 1) {
        return -1
      }
    }
    let appends = this.get(1, letters)
    for (var a of appends) {
      if (this.perfectPlay(letters + a) === 1) {
        return -1
      }
    }

    return 1
  }

  recomputeWinner(letters) {
    let previous = this.map[letters][2]
    this.map[letters][2] = 0
    let updated = this.computePerfectPlay(letters)
    if (previous !== updated && letters !== "") {
      this.recomputeWinner(letters.slice(1))
      this.recomputeWinner(letters.slice(0, -1))
    }
  }

  winningStarts() {
    let letters = this.letters.split("")
    let wins = letters.filter(letter => this.perfectPlay(letter) == 1)
    return (wins.length > 0) ? wins : letters
  }
}
