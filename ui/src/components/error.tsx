import { Button } from "./ui/button";

interface ErrorProps {
  error: string;
  onAction?: () => void;
}

export function Error(props: ErrorProps) {
  const { error, onAction } = props;

  return (
    <>
      <p>{error}</p>
      <Button onClick={onAction}>Go back</Button>
    </>
  );
}
