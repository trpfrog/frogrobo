import {
  asyncFilter,
  cleaning,
  extractFirstBracketContents,
  mesugakinize,
  softmax,
  stringNumberCompareFn,
  weightedRandom
} from '../src/utils'

describe('Text Cleaning', () => {
  const hearts = ['❤️', '🧡', '💛', '💚', '💙', '💜', '💗', '💖', '💓', '💕', '💝']

  const generalizeHeart = (s: string): string => {
    for (const heart of hearts) {
      s = s.replaceAll(heart, '❤')
    }
    return s
  }

  test.each([
    { input: 'ふわふわ', output: 'ふわふわ' },
    { input: 'バカがよ……', output: 'バカ❤がよ……' },
    { input: 'ボケカス', output: 'ボケカス❤' },
    { input: '', output: '' }
  ])('mesugakinize', ({ input, output }) => {
    const s = mesugakinize(input)
    expect(generalizeHeart(s)).toBe(output)
  })

  test.each([
    { input: 'ふわふわ', output: 'ふわふわ' },
    { input: 'バカがよ……', output: 'バカ❤がよ……' },
    { input: '', output: '' },
    { input: '必殺技', output: '必❤技' },
    { input: '死んでいます', output: '❤んでいます' },
    { input: '濃厚豚骨豚野郎', output: '濃厚豚骨❤❤' }
  ])('cleaning', ({ input, output }) => {
    const s = cleaning(input)
    expect(generalizeHeart(s)).toBe(output)
  })
})

describe('Softmax', () => {
  test('softmax', () => {
    const x = [1, 2, 3, 4, 5]
    const y = [0.01165623, 0.03168492, 0.08612854, 0.23412166, 0.63640865]
    const z = softmax(x)
    for (let i = 0; i < x.length; i++) {
      expect(z[i]).toBeCloseTo(y[i])
    }
  })

  test('large softmax', () => {
    const x = [12345, 23456, 34567, 45678, 56789, 67890]
    const y = [0, 0, 0, 0, 0, 1]
    const z = softmax(x)
    for (let i = 0; i < x.length; i++) {
      expect(z[i]).toBeCloseTo(y[i])
    }
  })

  test('large softmax with temperature', () => {
    const x = [12345, 23456, 34567, 45678, 56789, 67890]
    const y = [0.0026, 0.0079, 0.0240, 0.0728, 0.2213, 0.6714]
    const z = softmax(x, 10000)
    for (let i = 0; i < x.length; i++) {
      expect(z[i]).toBeCloseTo(y[i])
    }
  })

  test('equal', () => {
    const x = [10, 10, 10, 10, 10]
    const y = [0.2, 0.2, 0.2, 0.2, 0.2]
    const z = softmax(x)
    for (let i = 0; i < x.length; i++) {
      expect(z[i]).toBeCloseTo(y[i])
    }
  })
})

test.each([
  { weight: [1, 2, 3, 4, 5] },
  { weight: [3, 3, 4] },
  { weight: [0.1, 0.3, 0.6] }
])('weightedRandom', ({ weight }) => {
  const x = weight
  const res = new Array(weight.length).fill(0)
  const idxArr = Array.from(Array(weight.length).keys())

  const weightSum = x.reduce((a, b) => a + b)
  const nTries = 10000
  for (let i = 0; i < nTries; i++) {
    const idx = weightedRandom(idxArr, x)
    res[idx]++
  }

  for (let i = 0; i < weight.length; i++) {
    const y = res[i] / nTries
    expect(y).toBeCloseTo(x[i] / weightSum, 1)
  }
})

test.each([
  { input: 'あうあう「うお〜ウオ！」ウオ', output: 'うお〜ウオ！' },
  { input: 'あ「鉤括弧の「中に」鉤括弧」が', output: '鉤括弧の「中に」鉤括弧' },
  { input: '鉤括弧なし', output: '' },
  { input: '「「鉤括弧が閉じない', output: '「鉤括弧が閉じない' }
])('extractFirstBracketContents', ({ input, output }) => {
  const s = extractFirstBracketContents(input)
  expect(s).toBe(output)
})

// test for asyncFilter
test('asyncFilter', async () => {
  const arr = [1, 2, 3, 4, 5]
  const res = await asyncFilter(arr, async (x) => x % 2 === 0)
  expect(res).toEqual([2, 4])
})

// test for stringNumberCompareFn
test.each([
  { a: '1', b: '2', output: -1 },
  { a: '2', b: '1', output: 1 },
  { a: '1', b: '1', output: 0 },
  { a: '1', b: '10', output: -1 },
  { a: '10', b: '1', output: 1 },
  { a: '123546456346', b: '34523462464', output: 1 },
  { a: '34523462464', b: '123546456346', output: -1 },
  { a: '123546456346', b: '123546456346', output: 0 }
])('stringNumberCompareFn', ({ a, b, output }) => {
  const res = stringNumberCompareFn(a, b)
  expect(res).toBe(output)
})
