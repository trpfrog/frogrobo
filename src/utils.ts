function getRandomHeart (): string {
  const hearts = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💗', '💖', '💓', '💕', '💝']
  return hearts[Math.floor(Math.random() * hearts.length)]
}

function mesugakinize (s: string): string {
  const abusiveWords = [
    'うるせえ', '馬鹿', '糞',
    'バカ', 'アホ', 'ドジ', 'マヌケ', 'カス', 'クソ', 'クズ',
    'ばか', 'あほ', 'どじ', 'まぬけ', 'かす', 'くそ', 'くず'
  ]
  for (const word of abusiveWords) {
    if (s.includes(word)) {
      s = s.replaceAll(word, getRandomHeart())
    }
  }
  return s
}

export function cleaning (s: string): string {
  // remove spaces between (kanji, hiragana, katakana)
  s = s.replace(/([一-龠ぁ-んァ-ヶー])\s+([一-龠ぁ-んァ-ヶー])/g, '$1$2')
  // remove url
  s = s.replace(/https?:\/\/[\w/:%#$&?()~.=+-]+/g, '')
  // dangerous characters
  s = s.replace(/[殺死]/g, '💗')
  // remove @
  s = s.replace(/[@＠]/g, '')

  for (const wordList of Object.values(NG_WORDS)) {
    for (const word of wordList) {
      const heart = getRandomHeart()
      s = s.replaceAll(word, heart + heart)
    }
  }

  return mesugakinize(s)
}

