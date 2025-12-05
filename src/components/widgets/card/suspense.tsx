interface CardProps {
  name: string;
  list: string[];
}
export default function Card({ data }: { data: CardProps }) {
  return (
    <div data-name="Card - suspense">
      <h3>{data?.name}</h3>
      <ul>
        {data?.list.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}
