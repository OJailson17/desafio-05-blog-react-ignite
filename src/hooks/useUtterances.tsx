/* eslint-disable consistent-return */

import { useRouter } from 'next/router';
import { useEffect } from 'react';

export const useUtterances = (commentNodeId: string): void => {
  const routes = useRouter();
  const { slug } = routes.query;

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
  }, [slug, commentNodeId]);
};
