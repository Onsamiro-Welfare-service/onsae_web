'use client';

import { BlogView } from '@/sections/blog/view';
import { _posts } from '@/_mock';

export default function BlogPage() {
  return <BlogView posts={_posts} />;
}
