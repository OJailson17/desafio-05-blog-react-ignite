import { GetStaticProps } from 'next';
import { useEffect, useState } from 'react';
import Link from 'next/link';
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

export default function Home({ postsPagination }: HomeProps): JSX.Element {
  const { results, next_page } = postsPagination;

  const [posts, setPosts] = useState<Post[]>(results);
  const [hasNextPage, setHasNextPage] = useState(false);

  const handleFetchData = async (): Promise<void> => {
    const response = await fetch(next_page);
    const data = await response.json();

    // Formatação dos posts
    const postsData = data.results.map(post => {
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

    const allPosts = posts.concat(postsData);
    setPosts(allPosts);
    setHasNextPage(false);
  };

  useEffect(() => {
    if (next_page) setHasNextPage(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <>
      <Head>
        <title>Home | Blog</title>
      </Head>

      <main className={styles.container}>
        {posts.map(post => (
          <Link href={`/post/${post.uid}`} key={post.uid}>
            <div>
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
          </Link>
        ))}

        {hasNextPage ? (
          <div className={styles.paginationContent}>
            <button type="button" onClick={handleFetchData}>
              Carregar mais posts
            </button>
          </div>
        ) : (
          ''
        )}
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
      pageSize: 2,
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
      postsPagination: {
        results: posts,
        next_page: postsResponse.next_page,
      },
    },
    revalidate: 60 * 60,
  };
};
