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
