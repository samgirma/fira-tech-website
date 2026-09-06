import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Search } from "lucide-react";
import { site } from "@/lib/api";

const fadeUp = {
  initial: { opacity: 0, y: 30 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.6 },
};

export default function InsightsPage() {
  const [posts, setPosts] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("all");

  useEffect(() => {
    site.getBlogPosts().then(setPosts).catch(() => {});
  }, []);

  const categories = ["all", ...Array.from(new Set(posts.map((p) => p.category).filter(Boolean)))];

  const filtered = posts.filter((post) => {
    const matchesSearch = !search || post.title?.toLowerCase().includes(search.toLowerCase()) || post.excerpt?.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = activeCategory === "all" || post.category === activeCategory;
    return matchesSearch && matchesCategory;
  });

  return (
    <>
      <section className="relative min-h-[60vh] flex items-end pt-20 pb-12">
        <div className="container-fira px-6">
          <motion.div {...fadeUp} className="max-w-3xl">
            <span className="inline-block px-4 py-1.5 rounded-full bg-forest/20 border border-forest/30 text-sm text-forest-light mb-6">
              Insights
            </span>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-display font-bold text-foreground mb-6">
              Thoughts & <span className="text-gradient-gold">Perspectives</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl">
              Ideas on technology, business, and innovation from the Fira Tech team.
            </p>
          </motion.div>
        </div>
      </section>

      <section className="py-12 px-6">
        <div className="container-fira">
          <div className="flex flex-col md:flex-row gap-6 mb-12">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <input
                type="text"
                placeholder="Search articles..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full pl-11 pr-4 py-3 rounded-xl bg-muted/30 border border-border/50 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-accent/50"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto pb-2">
              {categories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActiveCategory(cat)}
                  className={`px-4 py-2 text-sm font-medium rounded-full whitespace-nowrap transition-all ${
                    activeCategory === cat
                      ? "bg-accent text-obsidian"
                      : "bg-muted/30 text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {cat === "all" ? "All Posts" : cat}
                </button>
              ))}
            </div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filtered.map((post) => (
              <motion.div key={post.id} variants={fadeUp} initial="initial" whileInView="animate" viewport={{ once: true }}>
                <Link to={`/insights/${post.slug}`} className="glass-card overflow-hidden group block h-full">
                  {post.cover_image && (
                    <div className="aspect-video overflow-hidden">
                      <img src={post.cover_image} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
                    </div>
                  )}
                  <div className="p-6">
                    {post.category && (
                      <span className="px-3 py-1 text-xs font-medium bg-forest/20 text-forest-light rounded-full">{post.category}</span>
                    )}
                    <h3 className="text-lg font-display font-bold text-foreground mt-3 mb-2 group-hover:text-accent transition-colors">{post.title}</h3>
                    <p className="text-sm text-muted-foreground line-clamp-2 mb-4">{post.excerpt}</p>
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{post.author_name || "Fira Tech"}</span>
                      {post.published_at && (
                        <span>{new Date(post.published_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}</span>
                      )}
                    </div>
                  </div>
                </Link>
              </motion.div>
            ))}
          </div>

          {filtered.length === 0 && (
            <div className="text-center py-20">
              <p className="text-muted-foreground text-lg">No articles found.</p>
            </div>
          )}
        </div>
      </section>
    </>
  );
}
