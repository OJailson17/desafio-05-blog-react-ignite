/* eslint-disable consistent-return */
import { useEffect } from 'react';

export const useUtterances = (commentNodeId: string): void => {
  useEffect(() => {
    const scriptParentNode = document.getElementById(commentNodeId);
    if (!scriptParentNode) return;

    const script = document.createElement('script');
    script.src = 'https://utteranc.es/client.js';
    script.async = true;
    script.setAttribute(
      'repo',
      'Ojailson17/utterance-comments-blog-ignews-ignite'
    );
    script.setAttribute('issue-term', 'pathname');
    script.setAttribute('label', 'comment :speech_balloon:');
    script.setAttribute('theme', 'photon-dark');
    script.setAttribute('crossorigin', 'anonymous');

    scriptParentNode.appendChild(script);

    return () => {
      // cleanup - remove the older script with previous theme
      scriptParentNode.removeChild(scriptParentNode.firstChild);
    };
  }, [commentNodeId]);
};

const commentNodeId = 'comments';

export const Comments = (): JSX.Element => {
  useUtterances(commentNodeId);
  return <div id={commentNodeId} />;
};
