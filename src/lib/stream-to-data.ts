export interface Element {
  file: {
    type: "Buffer";
    data: number[];
  };
  elementSelector: string;
}

export async function streamToData(
  body: ReadableStream<Uint8Array>,
  cb: (element: Element) => void
) {
  const text = [];

  const reader = body.pipeThrough(new TextDecoderStream()).getReader();

  while (reader) {
    const stream = await reader.read();
    if (stream.done) break;

    const chunks = stream.value.replace(/\n/g, "");
    if (!chunks) continue;
    cb(JSON.parse(chunks));
    text.push(JSON.parse(chunks));
  }

  return text;
}
