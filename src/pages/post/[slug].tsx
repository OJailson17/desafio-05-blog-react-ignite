/* eslint-disable react/no-danger */
import { useContext, useEffect } from 'react';
import { GetStaticPaths, GetStaticProps } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import Head from 'next/head';
import { useRouter } from 'next/router';
import Prismic from '@prismicio/client';
import { RichText } from 'prismic-dom';
import { FiCalendar, FiClock, FiUser } from 'react-icons/fi';

import { getPrismicClient } from '../../services/prismic';

import commonStyles from '../../styles/common.module.scss';
import { formatDate } from '../../utils/formateDate';

import styles from './post.module.scss';
import { Comments } from '../../components/Comments';
import { CommentsContext } from '../../context';

interface Post {
  uid: string;
  first_publication_date: string | null;
  last_publication_date: string | null;
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

interface SmallPost {
  title: string;
  uid: string;
}

interface PostProps {
  post: Post;
  readingTime: number;
  preview: boolean;
  prevPost: SmallPost;
  nextPost: SmallPost;
}

export default function Post({
  post,
  readingTime,
  preview,
  prevPost,
  nextPost,
}: PostProps): JSX.Element {
  const router = useRouter();
  const { comment, setComment } = useContext(CommentsContext);

  useEffect(() => {
    setComment('comments');

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [post.uid]);

  if (router.isFallback) {
    return (
      <div className={styles.container}>
        <h1>Carregando...</h1>
      </div>
    );
  }

  const postDate = post.first_publication_date;
  const editDate = post.last_publication_date;

  // Verifica se o post foi editado
  const isEdit = editDate.split(',')[0] !== postDate;

  return (
    <>
      <Head>
        <title>{post.data?.title} | Blog</title>
      </Head>

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
          {/* <p>* editado em 19 mar 2021, às 15:49</p> */}
          {isEdit && <p>* editado em {post.last_publication_date}</p>}
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

      <div className={styles.separator} />

      <section className={styles.paginationContainer}>
        <div className={styles.left}>
          {prevPost && (
            <>
              {prevPost?.title}
              <Link href={`/post/${prevPost?.uid}`}>
                <p>Post anterior</p>
              </Link>
            </>
          )}
        </div>
        <div>
          {nextPost && (
            <>
              <span>{nextPost?.title}</span>
              <Link href={`/post/${nextPost?.uid}`}>
                <p>Próximo post</p>
              </Link>
            </>
          )}
        </div>
      </section>

      <section className={styles.commentSection}>
        <Comments comment={comment} />
      </section>

      {preview && (
        <Link href="/api/exit-preview">
          <aside className={commonStyles.exitPreviewContainer}>
            <a>Sair do modo Preview</a>
          </aside>
        </Link>
      )}
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

export const getStaticProps: GetStaticProps = async ({
  params,
  preview = false,
  previewData,
}) => {
  const { slug } = params;
  const prismic = getPrismicClient();

  // Recupera o post pelo slug
  const response = await prismic.getByUID('posts', String(slug), {
    ref: previewData?.ref ?? null,
  });

  // Formatação do post
  const post = {
    uid: response?.uid,
    first_publication_date: formatDate(response.first_publication_date),
    last_publication_date: formatDate(response.last_publication_date, true),
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

  // Recupera todos os 10 primeiros posts
  const allPosts = await prismic.query(
    Prismic.Predicates.at('document.type', 'posts'),
    {
      pageSize: 10,
      fetch: ['posts.title', 'posts.uid'],
    }
  );

  // Realiza a formatação desses posts
  const posts = allPosts.results.map(p => {
    return {
      title: p.data?.title,
      uid: p.uid,
    };
  });

  // Retorna em qual index está o post atual dentro do array allPosts
  const postIndex = posts.findIndex(el => el.uid === slug);

  // Pega o index do post e diminui por um para obter o post anterior
  const prevPost = posts[postIndex - 1] ?? null;

  // Pega o index do post e soma por um para obter o próximo post
  const nextPost = posts[postIndex + 1] ?? null;

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
      preview,
      prevPost,
      nextPost,
    },
  };
};
