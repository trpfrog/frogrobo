import { StatusCodes } from 'http-status-codes'

export interface InferencePayload {
  inputs: any
  parameters?: any
  options?: {
    use_cache?: boolean
    wait_for_model?: boolean
  }
}

export interface TextGenerationParameters {
  top_k?: number
  top_p?: number
  temperature?: number
  repetition_penalty?: number
  max_new_tokens?: number
  max_time?: number
  return_full_text?: boolean
  num_return_sequences?: number
  do_sample?: boolean
}

export type TextGenerationPayload = InferencePayload & {
  inputs: string
  parameters?: TextGenerationParameters
}

export type TextToImagePayload = InferencePayload & {
  inputs: string
  parameters?: TextGenerationParameters
}

export async function hfQuery (
  modelName: string,
  payload: InferencePayload,
  returnType: 'json' | 'blob' | 'arrayBuffer'
): Promise<any> {
  // always wait for model to be ready
  if (typeof payload.options?.wait_for_model === 'undefined') {
    payload = {
      ...payload,
      options: {
        wait_for_model: true,
        ...payload.options
      }
    }
  }

  const apiURL = `https://api-inference.huggingface.co/models/${modelName}`
  const hfToken = process.env.HF_TOKEN ?? ''

  const response = await fetch(apiURL, {
    headers: { Authorization: `Bearer ${hfToken}` },
    method: 'POST',
    body: JSON.stringify(payload)
  })

  if (response.status !== StatusCodes.OK) {
    throw new Error(
      `Unexpected status code ${response.status} for ${modelName}`
    )
  }

  if (returnType === 'json') {
    return await response.json()
  } else if (returnType === 'blob') {
    return await response.blob()
  } else if (returnType === 'arrayBuffer') {
    return await response.arrayBuffer()
  }
}

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
  const base64 = Buffer.from(result).toString('base64')

  return `<img src="data:image/png;base64,${base64}">`
}
