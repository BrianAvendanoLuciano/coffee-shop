interface Props {
  text: string;
}

export default function HeaderText({ text }: Props) {
  return (
    <h1 className="text-stone-900 text-2xl font-bold sm:text-3xl">{text}</h1>
  );
}
