import 'dotenv/config'
const NG_WORDS = JSON.parse(process.env.NG_WORDS ?? '{}') as Record<string, string[]>

function getRandomHeart (): string {
  const hearts = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💗', '💖', '💓', '💕', '💝']
  return hearts[Math.floor(Math.random() * hearts.length)]
}

export function mesugakinize (s: string): string {
  const abusiveWords = [
    'うるせえ', '馬鹿', '糞',
    'バカ', 'アホ', 'ドジ', 'マヌケ', 'カス', 'クソ', 'クズ',
    'ばか', 'あほ', 'どじ', 'まぬけ', 'かす', 'くそ', 'くず'
  ]
  for (const word of abusiveWords) {
    if (s.includes(word)) {
      s = s.replaceAll(word, word + getRandomHeart())
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

  s = mesugakinize(s)

  for (const wordList of Object.values(NG_WORDS)) {
    for (const word of wordList) {
      const heart = getRandomHeart()
      s = s.replaceAll(word, heart + heart)
    }
  }

  return s
}

export function softmax (x: number[], temperature?: number): number[] {
  if (temperature == null || temperature <= 0 || isNaN(temperature)) {
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

export function extractFirstBracketContents (s: string): string {
  const start = s.indexOf('「') + 1
  if (start === 0) {
    return ''
  }
  let brackets = 1
  let idx = start
  for (const c of s.slice(start)) {
    if (c === '「') {
      brackets++
    } else if (c === '」') {
      brackets--
    }
    if (brackets === 0) {
      break
    }
    idx++
  }
  return s.slice(start, idx)
}

export async function asyncFilter<T> (arr: T[], predicate: (t: T) => Promise<boolean>): Promise<T[]> {
  const results = await Promise.all(arr.map(predicate))
  return arr.filter((_v, index) => results[index])
}

export function stringNumberCompareFn (a: string, b: string): -1 | 0 | 1 {
  const aNum = BigInt(a)
  const bNum = BigInt(b)
  if (aNum < bNum) {
    return -1
  } else if (aNum > bNum) {
    return 1
  } else {
    return 0
  }
}
