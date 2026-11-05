export type BannerHighlight = {
  label: string;
  value: string;
  accentColor: string;
};

export type AuthBannerProps = {
  badge?: string;
  statusTag?: string;
  title?: string;
  subtitle?: string;
  imageSrc?: string;
  imageAlt?: string;
  highlights?: BannerHighlight[];
};
