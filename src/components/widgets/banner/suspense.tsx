import type { BannerProps } from ".";

export default function Banner({ data }: { data: BannerProps }) {
  return (
    <div data-name="Banner - suspense">
      <h2>{data?.title}</h2>
      <ul>
        {data?.banners.map((b) => (
          <li key={b}>{b}</li>
        ))}
      </ul>
    </div>
  );
}
