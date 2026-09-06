import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, User } from "lucide-react";
import { site } from "@/lib/api";

export default function InsightDetailPage() {
  const { slug } = useParams();
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!slug) return;
    setLoading(true);
    site.getBlogPost(slug)
      .then(setPost)
      .catch(() => setPost(null))
      .finally(() => setLoading(false));
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center pt-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!post) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center pt-20 gap-4">
        <h1 className="text-2xl font-display font-bold">Article not found</h1>
        <Link to="/insights" className="text-accent hover:underline">Back to Insights</Link>
      </div>
    );
  }

  return (
    <>
      <section className="relative pt-20 pb-12">
        <div className="container-fira px-6 max-w-4xl">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <Link to="/insights" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-6">
              <ArrowLeft className="w-4 h-4" /> All Articles
            </Link>

            {post.category && (
              <span className="inline-block px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full mb-4">
                {post.category}
              </span>
            )}

            <h1 className="text-3xl md:text-4xl lg:text-5xl font-display font-bold text-foreground mb-6">{post.title}</h1>

            <div className="flex items-center gap-6 text-sm text-muted-foreground">
              {post.author_name && (
                <div className="flex items-center gap-2">
                  <User className="w-4 h-4" /> {post.author_name}
                </div>
              )}
              {post.published_at && (
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  {new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "long", day: "numeric" })}
                </div>
              )}
            </div>
          </motion.div>
        </div>
      </section>

      {post.cover_image && (
        <section className="px-6 pb-12">
          <div className="container-fira max-w-4xl">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              className="rounded-2xl overflow-hidden"
            >
              <img src={post.cover_image} alt={post.title} className="w-full aspect-video object-cover" />
            </motion.div>
          </div>
        </section>
      )}

      <section className="px-6 pb-20">
        <div className="container-fira max-w-4xl">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="prose prose-invert prose-lg max-w-none"
          >
            {post.content ? (
              <div className="text-muted-foreground leading-relaxed whitespace-pre-wrap">{post.content}</div>
            ) : post.excerpt ? (
              <p className="text-muted-foreground leading-relaxed">{post.excerpt}</p>
            ) : (
              <p className="text-muted-foreground">Article content is being updated.</p>
            )}
          </motion.div>

          {post.tags?.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-12 pt-8 border-t border-border/50">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1.5 text-sm bg-muted/50 text-muted-foreground rounded-lg">#{tag}</span>
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  );
}
