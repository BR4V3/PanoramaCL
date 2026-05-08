export function getEmbeddedVideoUrl(videoUrl) {
  if (typeof videoUrl !== 'string' || videoUrl.trim().length === 0) {
    return '';
  }

  try {
    const parsedUrl = new URL(videoUrl.trim());
    const host = parsedUrl.hostname.replace(/^www\./, '');
    const path = parsedUrl.pathname;

    if (host === 'youtube.com' || host === 'm.youtube.com') {
      const videoId = parsedUrl.searchParams.get('v');
      const shortsMatch = path.match(/^\/shorts\/([^/?]+)/);
      const embedMatch = path.match(/^\/embed\/([^/?]+)/);
      const resolvedVideoId = videoId || shortsMatch?.[1] || embedMatch?.[1];

      return resolvedVideoId ? `https://www.youtube.com/embed/${resolvedVideoId}` : '';
    }

    if (host === 'youtu.be') {
      const videoId = path.split('/').filter(Boolean)[0];
      return videoId ? `https://www.youtube.com/embed/${videoId}` : '';
    }

    if (host === 'vimeo.com') {
      const videoId = path.split('/').filter(Boolean)[0];
      return videoId ? `https://player.vimeo.com/video/${videoId}` : '';
    }

    if (host === 'player.vimeo.com' && path.startsWith('/video/')) {
      return parsedUrl.toString();
    }

    return '';
  } catch {
    return '';
  }
}