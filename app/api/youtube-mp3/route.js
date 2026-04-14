import ytdl from '@distube/ytdl-core';

export async function GET(req) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return Response.json({ error: 'URL requerida.' }, { status: 400 });
  }

  if (!ytdl.validateURL(url)) {
    return Response.json({ error: 'URL de YouTube no válida.' }, { status: 400 });
  }

  try {
    const info    = await ytdl.getInfo(url);
    const details = info.videoDetails;

    const seconds  = parseInt(details.lengthSeconds, 10);
    const duration = `${Math.floor(seconds / 60)}:${String(seconds % 60).padStart(2, '0')}`;

    const thumbnail = details.thumbnails
      .sort((a, b) => b.width - a.width)[0]?.url ?? '';

    return Response.json({
      title:     details.title,
      author:    details.author?.name ?? '',
      duration,
      thumbnail,
    });
  } catch (err) {
    return Response.json({ error: `No se pudo obtener info: ${err.message}` }, { status: 500 });
  }
}
