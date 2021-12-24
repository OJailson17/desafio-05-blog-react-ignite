import { useUtterances } from '../../hooks/useUtterances';

export const Comments = (): JSX.Element => {
  const commentNodeId = 'comments';
  useUtterances(commentNodeId);
  return <div id={commentNodeId} />;
};
