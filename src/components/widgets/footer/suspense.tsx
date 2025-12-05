import type { FooterProps } from ".";

export default function Footer({ data }: { data: FooterProps }) {
  return <footer data-name="Footer - suspense">{data?.text}</footer>;
}
