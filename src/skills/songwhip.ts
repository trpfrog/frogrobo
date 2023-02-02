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
  | 'spotify'
  | 'lineMusic'

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
  if (!res.ok) {
    throw new Error(`HTTP error! status: ${res.status}`)
  }
  return await res.json()
}

const songwhipReply: AccountActivityListener = {
  onTweetCreated: async (tweet, social) => {
    if (!tweet.text.toLowerCase().includes('#nowplaying')) {
      return false
    }

    // eslint-disable-next-line no-irregular-whitespace
    const probablySongLink = tweet.text.match(/https?:\/\/[^\s　]+/g)
    if (probablySongLink == null) {
      return false
    }

    const link = probablySongLink[0]
    try {
      const songInfo = await fetchSongLink(link)
      const msg = `🎵 ${songInfo.artists[0].name} - ${songInfo.name}\n${songInfo.url}`
      await social.reply(tweet.id_str, msg)
    } catch (e) {
      return false
    }
    return true
  }
}

export default songwhipReply
