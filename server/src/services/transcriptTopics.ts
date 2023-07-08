import crypto from 'crypto'

export const hashTranscript = (transcript: string) => crypto.createHash('md5').update(transcript).digest("hex")
