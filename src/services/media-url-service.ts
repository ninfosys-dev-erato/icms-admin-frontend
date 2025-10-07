import { Slider } from '@/domains/sliders/types/slider';
import { HeaderConfig } from '@/domains/header/types/header';

/**
 * MediaUrlService: central helpers to derive safe media URLs/IDs and proxying.
 */
export class MediaUrlService {
  /** Wrap a remote URL with the local proxy to avoid CORS and leverage caching */
  static toProxyUrl(url: string): string {
    if (!url) return url;
    // Avoid double-wrapping
    if (url.startsWith('/api/image-proxy')) return url;
    return `/api/image-proxy?url=${encodeURIComponent(url)}`;
  }

  /**
   * Extract the best available image source from a slider object, accounting for
   * both flattened media fields and nested media objects.
   */
  static getImageSourceFromSlider(slider: Partial<Slider>): {
    mediaId?: string;
    directUrl?: string;
    alt?: string;
  } {
    // Debug logging removed for performance

    // Prefer nested media object if present
    const nestedId = (slider as Partial<Slider & { media?: { id?: string; presignedUrl?: string; url?: string; altText?: string } }>)?.media?.id;
    const nestedUrl = (slider as Partial<Slider & { media?: { presignedUrl?: string; url?: string } }>)?.media?.presignedUrl || (slider as Partial<Slider & { media?: { url?: string } }>)?.media?.url;

    // Fallbacks to flattened fields we set in services
    const flatFileId = (slider as Partial<Slider & { mediaId?: string; fileId?: string }>)?.mediaId || (slider as Partial<Slider & { fileId?: string }>)?.fileId;
    const flatUrl = (slider as Partial<Slider & { presignedUrl?: string; imageUrl?: string }>)?.presignedUrl || (slider as Partial<Slider & { imageUrl?: string }>)?.imageUrl;

    const mediaId = nestedId || flatFileId;
    const directUrl = nestedUrl || flatUrl;
    const alt = (slider as Partial<Slider & { media?: { altText?: string }; altText?: string; title?: { en?: string } }>)?.media?.altText || (slider as Partial<Slider & { altText?: string }>)?.altText || (slider as Partial<Slider & { title?: { en?: string } }>)?.title?.en;

    const result = { mediaId, directUrl, alt };
    return result;
  }

  /**
   * Extract the best available image source from a header logo object, accounting for
   * both flattened media fields and nested media objects.
   */
  static getImageSourceFromHeaderLogo(logoItem: {
    media?: { id?: string; presignedUrl?: string; url?: string } | null;
    mediaId?: string;
    presignedUrl?: string;
    imageUrl?: string;
    altText?: { en?: string; ne?: string };
  }): {
    mediaId?: string;
    directUrl?: string;
    alt?: string;
  } {
    // Prefer nested media object if present
    const nestedId = logoItem?.media?.id;
    const nestedUrl = logoItem?.media?.presignedUrl || logoItem?.media?.url;

    // Fallbacks to flattened fields
    const flatMediaId = logoItem?.mediaId;
    const flatUrl = logoItem?.presignedUrl || logoItem?.imageUrl;

    const mediaId = nestedId || flatMediaId;
    const directUrl = nestedUrl || flatUrl;
    const alt = logoItem?.altText?.en || logoItem?.altText?.ne || 'Header logo';

    return { mediaId, directUrl, alt };
  }
}

export default MediaUrlService;

