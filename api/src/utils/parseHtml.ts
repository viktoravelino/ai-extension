interface HtmlNode {
  type: "document" | "element" | "text";
  children?: HtmlNode[];
  tag?: string;
  attributes?: { [key: string]: string };
  content?: string;
}

export function parseHTMLToObject(rawHTML: string) {
  const stack = [];
  const rootNode: HtmlNode = { type: "document", children: [] as HtmlNode[] };
  let currentNode: HtmlNode = rootNode;

  const regexTag = /<(\/)?([a-zA-Z]+)([^<]*)?>/g;
  const regexAttributes = /([a-zA-Z\-]+)="([^"]*)"/g;

  let match;
  let lastIndex = 0;

  while ((match = regexTag.exec(rawHTML)) !== null) {
    const [tag, isClosing, tagName, attributesStr] = match;
    const index = match.index;

    const text = rawHTML.slice(lastIndex, index);
    if (text.trim().length > 0) {
      currentNode.children?.push({ type: "text", content: text.trim() });
    }

    lastIndex = regexTag.lastIndex;

    if (!isClosing) {
      const node: any = {
        type: "element",
        tag: tagName,
        attributes: {},
        children: [],
      };

      let attrMatch;
      while ((attrMatch = regexAttributes.exec(attributesStr)) !== null) {
        const [, attrName, attrValue] = attrMatch;
        node.attributes[attrName] = attrValue;
      }

      currentNode.children?.push(node);

      if (!/\/>$/.test(tag)) {
        stack.push(currentNode);
        currentNode = node;
      }
    } else {
      currentNode = stack.pop()!;
    }
  }

  const remainingText = rawHTML.slice(lastIndex);
  if (remainingText.trim().length > 0) {
    currentNode.children?.push({ type: "text", content: remainingText.trim() });
  }

  return rootNode;
}
