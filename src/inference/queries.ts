import {hfQuery, type TextGenerationParameters, type TextGenerationPayload, type TextToImagePayload} from './fetcher'

export async function gptQuery (text: string, parameters?: TextGenerationParameters): Promise<string[]> {
  const payload: TextGenerationPayload = {
    inputs: text,
    parameters: {
      top_k: 50,
      top_p: 0.95,
      return_full_text: false, // exclude prompt
      num_return_sequences: 4,
      repetition_penalty: 1.2,
      max_new_tokens: 20,
      temperature: 1,
      ...parameters
    },
    options: {
      use_cache: false
    }
  }
  const modelName = 'TrpFrog/trpfrog-tweet-gpt2-medium'
  const result = await hfQuery(modelName, payload, 'json') as Array<{ generated_text: string }>

  return result.map(e => e.generated_text)
}

export async function diffusionQuery (text: string): Promise<any> {
  const payload: TextToImagePayload = {
    inputs: text,
    options: {
      use_cache: true
    }
  }
  const modelName = 'headmaking/trpfrog-icons'
  const result = await hfQuery(modelName, payload, 'arrayBuffer') as ArrayBuffer

  return Buffer.from(result).toString('base64')
}
