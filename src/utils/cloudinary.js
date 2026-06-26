/**
 * Automatically inserts f_auto,q_auto optimization parameters into Cloudinary URLs
 * while preserving existing image transformations.
 * 
 * @param {string} url - The original Cloudinary image URL
 * @returns {string} The optimized Cloudinary URL
 */
export function optimizeCloudinaryUrl(url) {
  if (!url || typeof url !== 'string' || !url.includes('res.cloudinary.com')) {
    return url;
  }

  // Avoid duplicating optimization parameters if they are already present
  if (url.includes('f_auto') || url.includes('q_auto')) {
    return url;
  }

  const parts = url.split('/upload/');
  if (parts.length !== 2) {
    return url;
  }

  const pathAfterUpload = parts[1];
  const firstPathSegment = pathAfterUpload.split('/')[0];
  
  // Cloudinary version segments start with 'v' followed by digits (e.g. v1781690578)
  const isVersionSegment = /^v\d+$/.test(firstPathSegment);

  if (isVersionSegment) {
    // No existing transformations; insert f_auto,q_auto as a new segment
    return `${parts[0]}/upload/f_auto,q_auto/${pathAfterUpload}`;
  } else {
    // Prepend f_auto,q_auto to the existing transformation segment
    return `${parts[0]}/upload/f_auto,q_auto,${pathAfterUpload}`;
  }
}
