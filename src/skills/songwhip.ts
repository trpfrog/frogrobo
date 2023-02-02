import { type AccountActivityListener } from '../bot'

export type SongwhipStreamingServices =
  | 'qobuz'
  | 'tidal'
  | 'amazon'
  | 'itunes'
  | 'youtube'
  | 'amazonMusic'
  | 'itunesStore'
  | 'youtubeMusic'

export interface SongwhipStreamingLink {
  link: string
  countries: string[] | null
}

export interface SongwhipArtist {
  type: string
  id: number
  path: string
  pagePath: string
  name: string
  image: string
  links: Record<SongwhipStreamingServices, SongwhipStreamingLink[]>
  linksCountries: string[]
  sourceCountry: string
  createdAtTimestamp: number
}

export interface SongwhipResult {
  type: string
  id: number
  path: string
  pagePath: string
  name: string
  image: string
  links: Record<SongwhipStreamingServices, boolean>
  linksCountries: string[]
  sourceCountry: string
  artists: SongwhipArtist[]
  createdAtTimestamp: number
  refreshedAtTimestamp: number
  url: string
}

const fetchSongLink = async (songLink: string): Promise<SongwhipResult> => {
  const url = 'https://songwhip.com/'
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({ url: songLink })
  })
  return await res.json()
}

const songwhipReply: AccountActivityListener = {
  onTweetCreated: async (tweet, social) => {
    const id = tweet.id_str
    const text = tweet.text
    const songLinkRegex = /https?:\/\/open\.spotify\.com\/track\/[a-zA-Z0-9]+/
    const songLink = text.match(songLinkRegex)

    if (songLink == null) {
      return false
    }

    const link = songLink[0]
    const songInfo = await fetchSongLink(link)
    await social.reply(id, songInfo.url)
    return true
  }
}

export default songwhipReply
