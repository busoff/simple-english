export const WORDS = [
  { word: 'cat', emoji: '🐱', category: 'animals' },
  { word: 'dog', emoji: '🐶', category: 'animals' },
  { word: 'bird', emoji: '🐦', category: 'animals' },
  { word: 'fish', emoji: '🐟', category: 'animals' },
  { word: 'cow', emoji: '🐮', category: 'animals' },
  { word: 'pig', emoji: '🐷', category: 'animals' },
  { word: 'duck', emoji: '🦆', category: 'animals' },
  { word: 'lion', emoji: '🦁', category: 'animals' },
  { word: 'rabbit', emoji: '🐰', category: 'animals' },
  { word: 'bear', emoji: '🐻', category: 'animals' },

  { word: 'red', emoji: '🟥', category: 'colors' },
  { word: 'orange', emoji: '🟧', category: 'colors' },
  { word: 'yellow', emoji: '🟨', category: 'colors' },
  { word: 'green', emoji: '🟩', category: 'colors' },
  { word: 'blue', emoji: '🟦', category: 'colors' },
  { word: 'purple', emoji: '🟪', category: 'colors' },
  { word: 'brown', emoji: '🟫', category: 'colors' },
  { word: 'black', emoji: '⬛', category: 'colors' },
  { word: 'white', emoji: '⬜', category: 'colors' },
  { word: 'pink', emoji: '🌸', category: 'colors' },

  { word: 'apple', emoji: '🍎', category: 'food' },
  { word: 'banana', emoji: '🍌', category: 'food' },
  { word: 'bread', emoji: '🍞', category: 'food' },
  { word: 'milk', emoji: '🥛', category: 'food' },
  { word: 'egg', emoji: '🥚', category: 'food' },
  { word: 'rice', emoji: '🍚', category: 'food' },
  { word: 'cake', emoji: '🍰', category: 'food' },
  { word: 'cookie', emoji: '🍪', category: 'food' },
  { word: 'grape', emoji: '🍇', category: 'food' },
  { word: 'watermelon', emoji: '🍉', category: 'food' },
];

export function byCategory(category) {
  return WORDS.filter((entry) => entry.category === category);
}
