interface RenderDangerouslyProps {
  html: string;
  css?: string;
}

export function RenderDangerously({ html, css }: RenderDangerouslyProps) {
  return (
    <div>
      {css && <style>{css}</style>}

      <div dangerouslySetInnerHTML={{ __html: html }} />
    </div>
  );
}
