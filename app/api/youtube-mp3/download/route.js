import ytdl from '@distube/ytdl-core';
import { spawn } from 'child_process';
import { Readable } from 'stream';

export const dynamic = 'force-dynamic';
export const maxDuration = 120;

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url || !ytdl.validateURL(url)) {
    return Response.json({ error: 'URL no válida.' }, { status: 400 });
  }

  try {
    const info    = await ytdl.getInfo(url);
    const details = info.videoDetails;
    const seconds = parseInt(details.lengthSeconds, 10);

    if (seconds > 60 * 20) {
      return Response.json({ error: 'Vídeo demasiado largo (máx. 20 min).' }, { status: 400 });
    }

    const title     = details.title.replace(/[^\w\s\-áéíóúüñÁÉÍÓÚÜÑ]/g, '').trim();
    const safeTitle = encodeURIComponent(title);

    // Audio stream from YouTube
    const audioStream = ytdl(url, { quality: 'highestaudio', filter: 'audioonly' });

    // Convert to MP3 via ffmpeg
    const ffmpeg = spawn('ffmpeg', [
      '-i', 'pipe:0',
      '-vn',
      '-ar', '44100',
      '-ac', '2',
      '-b:a', '192k',
      '-f', 'mp3',
      'pipe:1',
    ]);

    audioStream.pipe(ffmpeg.stdin);
    ffmpeg.stderr.on('data', () => {}); // suppress ffmpeg logs

    const webStream = Readable.toWeb(ffmpeg.stdout);

    return new Response(webStream, {
      headers: {
        'Content-Type':        'audio/mpeg',
        'Content-Disposition': `attachment; filename="${safeTitle}.mp3"`,
        'Transfer-Encoding':   'chunked',
      },
    });
  } catch (err) {
    return Response.json({ error: `Error: ${err.message}` }, { status: 500 });
  }
}
