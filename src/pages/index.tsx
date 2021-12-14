import { GetStaticProps } from 'next';
import Head from 'next/head';
import { FiCalendar, FiUser } from 'react-icons/fi';
import Prismic from '@prismicio/client';

import { getPrismicClient } from '../services/prismic';

import commonStyles from '../styles/common.module.scss';
import styles from './home.module.scss';
import { formatDate } from '../utils/formateDate';

interface Post {
  uid?: string;
  first_publication_date: string | null;
  data: {
    title: string;
    subtitle: string;
    author: string;
  };
}

interface PostPagination {
  next_page: string;
  results: Post[];
}

interface HomeProps {
  postsPagination: PostPagination;
}

export default function Home({
  results,
  next_page,
}: PostPagination): JSX.Element {
  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>
      <main className={styles.container}>
        {results.map(post => (
          <div key={post.uid}>
            <h2>{post.data?.title}</h2>
            <p>{post.data?.subtitle}</p>
            <div className={commonStyles.postInfo}>
              <span>
                <FiCalendar /> {formatDate(post.first_publication_date)}
              </span>
              <span>
                <FiUser /> {post.data?.author}
              </span>
            </div>
          </div>
        ))}
      </main>
    </>
  );
}

export const getStaticProps: GetStaticProps = async () => {
  const prismic = getPrismicClient();
  const postsResponse = await prismic.query(
    [Prismic.predicates.at('document.type', 'posts')],
    {
      fetch: ['posts.title', 'posts.subtitle', 'posts.author'],
      pageSize: 10,
    }
  );

  // Formatação dos posts
  const posts = postsResponse.results.map(post => {
    return {
      uid: post.uid,
      first_publication_date: post.first_publication_date,
      data: {
        title: post.data?.title,
        subtitle: post.data.subtitle,
        author: post.data.author,
      },
    };
  });

  return {
    props: {
      results: posts,
      next_page: postsResponse.next_page,
    },
    revalidate: 60 * 60,
  };
};
