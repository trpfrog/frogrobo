import { hfQuery } from './fetcher'
import { gptQuery } from './queries'
import * as queries from './queries'
import * as utils from '../utils'
import { ReplyGenerator, TextGenerator } from './generation'
import * as fs from 'fs/promises'

describe('fetcher', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockReturnValue(Promise.resolve({
      status: 200,
      json: async () => ([
        { generated_text: 'hello' },
        { generated_text: 'how are you?' }
      ]),
      blob: async () => new Blob(),
      arrayBuffer: async () => new ArrayBuffer(0)
    } as Response))
  })
  afterEach(() => { jest.restoreAllMocks() })

  it('fetches text generation', async () => {
    const result = await gptQuery('test')
    expect(result).toEqual(['hello', 'how are you?'])
  })

  it('crashes on non-200 status code', async () => {
    global.fetch = jest.fn().mockReturnValue(Promise.resolve({
      status: 500
    } as const as Partial<Response>))
    const promise = hfQuery('gpt2', { inputs: '' }, 'json')
    await expect(promise).rejects.toThrow()
  })

  test('hfQuery returns blob', async () => {
    const result = await hfQuery('gpt2', { inputs: '' }, 'blob')
    expect(result).toBeInstanceOf(Blob)
  })

  test('hfQuery returns arrayBuffer', async () => {
    const result = await hfQuery('gpt2', { inputs: '' }, 'arrayBuffer')
    expect(result).toBeInstanceOf(ArrayBuffer)
  })
})

describe('Text generators', () => {
  // returns the value which has maximum probability
  beforeEach(() => {
    jest.spyOn(utils, 'weightedRandom').mockImplementation((arr, p) => {
      const maxIdx = p.indexOf(Math.max(...p))
      return arr[maxIdx]
    })
    jest.spyOn(utils, 'cleaning').mockImplementation((text) => text)
  })
  afterEach(() => { jest.restoreAllMocks() })

  it('generates text', async () => {
    jest.spyOn(queries, 'gptQuery').mockReturnValue(Promise.resolve([
      'hello',
      'dummy text',
      'how are you?',
      'dummy text'
    ]))
    const generator = new TextGenerator('prompt')
    const result = await generator.generate()
    expect(result).toBe('how are you?')
  })

  test.each([
    { generated: 'Great」', expected: 'Great' },
    { generated: 'Wonderful!', expected: 'Wonderful!' },
    { generated: 'Amazing!」America」', expected: 'Amazing!' }
  ])('generates reply', async ({ generated, expected }) => {
    jest.spyOn(queries, 'gptQuery').mockReturnValue(Promise.resolve([
      generated
    ]))
    const generator = new ReplyGenerator('prompt')
    const result = await generator.generate()
    expect(result).toBe(expected)
  })

  test('TextGenerator should mask the invalid output', async () => {
    jest.spyOn(queries, 'gptQuery').mockReturnValue(Promise.resolve([
      '', '', 'valid', '', 'valid'
    ]))
    const expected = [true, true, false, true, false]

    const copyOfSoftmax = utils.softmax
    jest.spyOn(utils, 'softmax').mockImplementation((x, t) => {
      expect(x.map(e => e < -1e9 + 1)).toEqual(expected)
      return copyOfSoftmax(x, t)
    })

    const generator = new TextGenerator('prompt')
    await generator.generate()
  })
})

describe('Diffusion models', () => {
  beforeEach(() => {
    jest.spyOn(global, 'fetch').mockReturnValue(Promise.resolve({
      status: 200,
      arrayBuffer: async () => await fs.readFile('./fixtures/diffusion.jpg')
    } as unknown as Response))
  })
  afterEach(() => { jest.restoreAllMocks() })

  it('generates image', async () => {
    const result = await queries.diffusionQuery('test')
    expect(result).toBeTruthy()
  })
})
