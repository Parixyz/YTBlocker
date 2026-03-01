const quotes = [
  "The only way to do great work is to love what you do. - Steve Jobs",
  "Don't watch the clock; do what it does. Keep going. - Sam Levenson",
  "Success is not final, failure is not fatal. - Winston Churchill",
  "Your limitation—it's only your imagination.",
  "Great things never came from comfort zones.",
  "Dream it. Wish it. Do it.",
  "Success doesn't just find you. You have to go out and get it.",
  "The harder you work for something, the greater you'll feel when you achieve it.",
  "Dream bigger. Do bigger.",
  "Don't stop when you're tired. Stop when you're done.",
  "Wake up with determination. Go to bed with satisfaction.",
  "Do something today that your future self will thank you for.",
  "Little things make big days.",
  "It's going to be hard, but hard does not mean impossible.",
  "Don't wait for opportunity. Create it."
];

function getRandomQuote() {
  return quotes[Math.floor(Math.random() * quotes.length)];
}

function applyRandomQuote() {
  const quoteNode = document.getElementById('quote-text');
  if (quoteNode) {
    quoteNode.textContent = getRandomQuote();
  }
}

document.getElementById('new-quote-btn')?.addEventListener('click', applyRandomQuote);

document.getElementById('back-to-home-btn')?.addEventListener('click', () => {
  window.location.href = 'https://www.youtube.com';
});

applyRandomQuote();
