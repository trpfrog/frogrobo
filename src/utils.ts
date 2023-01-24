const NG_WORDS = JSON.parse(process.env.NG_WORDS ?? '{}') as Record<string, string[]>

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

export function softmax (x: number[], temperature?: number): number[] {
  if (typeof temperature === 'undefined' || temperature <= 0 || isNaN(temperature)) {
    temperature = 1
  }
  const maximum = Math.max(...x)
  const exp = x.map((v) => Math.exp((v - maximum) / (temperature ?? 1)))
  const sum = exp.reduce((a, b) => a + b)
  return exp.map((v) => v / sum)
}

export function weightedRandom<T> (elements: T[], weights: number[]): T {
  const sum = weights.reduce((a, b) => a + b, 0)
  const r = Math.random() * sum
  let i = 0
  let weight = weights[i]
  while (r > weight) {
    i++
    weight += weights[i]
  }
  return elements[i]
}
