/* eslint-disable react/no-danger */
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDate } from '../../utils/formateDate';

import styles from './post.module.scss';

interface Post {
  first_publication_date: string | null;
  data: {
    title: string;
    banner: {
      url: string;
    };
    author: string;
    content: {
      heading: string;
      body: {
        text: string;
      };
    }[];
  };
}

interface PostProps {
  post: Post;
  readingTime: number;
}

export default function Post({ post, readingTime }: PostProps): JSX.Element {
  const router = useRouter();

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  return (
    <>
      <header className={styles.header}>
        <Image src={post.data.banner?.url} layout="fill" objectFit="cover" />
      </header>

      <article className={styles.container}>
        <h1>{post.data.title}</h1>

        <div className={commonStyles.postInfo}>
          <span>
            <FiCalendar /> {post.first_publication_date}
          </span>
          <span>
            <FiUser /> {post.data.author}
          </span>
          <span>
            <FiClock /> {readingTime} min
          </span>
        </div>

        <div>
          {post.data.content.map(section => (
            <section key={section.heading}>
              <h2>{section.heading}</h2>

              <div dangerouslySetInnerHTML={{ __html: section.body.text }} />
            </section>
          ))}
        </div>
      </article>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  const prismic = getPrismicClient();
  const posts = await prismic.query([
    Prismic.Predicates.at('document.type', 'posts'),
    Prismic.Predicates.month('document.first_publication_date', 'Dec'),
  ]);

  const postSlugs = posts.results.map(el => {
    return {
      params: { slug: el.uid },
    };
  });

  return {
    paths: postSlugs,
    fallback: true,
  };
};

export const getStaticProps: GetStaticProps = async context => {
  const { slug } = context.params;
  const prismic = getPrismicClient();
  const response = await prismic.getByUID('posts', String(slug), {});

  const post = {
    first_publication_date: formatDate(response.first_publication_date),
    data: {
      title: response.data?.title,
      banner: {
        url: response.data?.banner?.url,
      },
      author: response.data?.author,
      content: response.data.content.map(data => {
        return {
          heading: RichText.asText(data.heading),
          body: {
            text: RichText.asHtml(data.body),
          },
        };
      }),
    },
  };

  // Pega todo o texto e separa cada palavra colocando-as em um array
  const getTexts = response.data.content.map(text => {
    const texto = RichText.asText(text.body);
    const newArr = texto.split(' ');
    return newArr;
  });

  const wordsCountArr = getTexts.map(el => el.length); // retorna a quantidade de palavras em cada array
  const qtdWords = wordsCountArr.reduce((total, current) => total + current); // retorna a soma de todas as palavras
  const readingTime = Math.ceil(qtdWords / 200); // 200 é a média de palavras por minuto de uma pessoa

  return {
    props: {
      post,
      readingTime,
    },
  };
};
