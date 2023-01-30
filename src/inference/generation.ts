import { cleaning, extractFirstBracketContents, softmax, weightedRandom } from '../utils'
import { gptQuery } from './queries'

export class TextGenerator {
  constructor (private readonly prompt: string) {}

  private static softmaxWithFilter (arr: number[], temperature?: number): number[] {
    for (let i = 0; i < arr.length; i++) {
      if (arr[i] <= 0) {
        arr[i] = -1e9
      }
    }
    return softmax(arr, temperature)
  }

  protected static selectFromSample (generated: string[], temperature?: number): string {
    const scores = generated.map((s) => s.length)
    const probs = this.softmaxWithFilter(scores, temperature)
    return weightedRandom(generated, probs)
  }

  public async generate (): Promise<string> {
    const result = await gptQuery(this.prompt)
    const selected = TextGenerator.selectFromSample(result)
    return cleaning(selected)
  }
}

export class ReplyGenerator extends TextGenerator {
  constructor (...conversation: string[]) {
    const prompt = conversation.map(s => `「${s}」`).join('') + 'わし「'
    super(prompt)
  }

  private static parseGenerated (generated: string): string {
    return extractFirstBracketContents('「' + generated)
  }

  public async generate (): Promise<string> {
    const result = await super.generate()
    return ReplyGenerator.parseGenerated(result)
  }
}
