export const normalizeImageSrc = (src) => {
    if (!src) return '/images/sample.jpg';

    const normalizedSrc = src.replaceAll('\\', '/');

    if (normalizedSrc.startsWith('http')) {
        return normalizedSrc;
    }

    return normalizedSrc;
  };