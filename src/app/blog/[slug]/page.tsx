import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import BlogPostContent from "@/components/blog/BlogPostContent";
import { getAllBlogSlugs, getBlogPost } from "@/data/blog-posts";

type Props = { params: Promise<{ slug: string }> };

export async function generateStaticParams() {
  return getAllBlogSlugs().map((slug) => ({ slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) return { title: "Blog | Nexscape" };
  return {
    title: `${post.title} | Nexscape Blog`,
    description: post.excerpt,
  };
}

export default async function BlogPostPage({ params }: Props) {
  const { slug } = await params;
  const post = getBlogPost(slug);
  if (!post) notFound();

  return (
    <main>
      <Navbar />
      <BlogPostContent post={post} />
      <Footer />
    </main>
  );
}
