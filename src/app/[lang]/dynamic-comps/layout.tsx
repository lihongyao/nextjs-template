type Props = {
  children: React.ReactNode;
};

export default async function RootLayout({ children }: Props) {
  return <div>{children}</div>;
}
