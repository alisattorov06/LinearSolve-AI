import React from 'react';
import Markdown from 'react-markdown';
import remarkMath from 'remark-math';
import rehypeKatex from 'rehype-katex';

interface MathRendererProps {
  content: string;
}

export const MathRenderer: React.FC<MathRendererProps> = ({ content }) => {
  return (
    <div className="markdown-body">
      <Markdown
        remarkPlugins={[remarkMath]}
        rehypePlugins={[rehypeKatex]}
      >
        {content}
      </Markdown>
    </div>
  );
};
