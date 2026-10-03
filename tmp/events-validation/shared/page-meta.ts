const pages: Record<string, { title: string; description: string }> = {
  '/': { title: 'Nucleus SJEC — A connection worth making', description: 'The student innovation community at St. Joseph Engineering College, Mangaluru. Explore AI, build for the web, and master algorithms with Nucleus.' },
  '/about': { title: 'Our domains — Nucleus SJEC', description: 'Explore AI and machine learning, web development, and data structures and algorithms. Learn and build with the Nucleus student community at SJEC.' },
  '/events': { title: 'Events — Nucleus SJEC', description: 'Discover Nucleus SJEC workshops and community events. Open our photo books and explore seven stations on the Nucleus Ride.' },
  '/projects': { title: 'Our work — Nucleus SJEC', description: 'Explore projects built by the Nucleus student community at SJEC, from useful web applications to AI experiments and collaborative ideas.' },
  '/team': { title: 'The people — Nucleus SJEC', description: 'Meet the students behind Nucleus at St. Joseph Engineering College, Mangaluru. Get to know our team, their roles, and the community they build.' },
  '/recruitment': { title: 'Join the community — Nucleus SJEC', description: 'Connect with Nucleus SJEC and discover opportunities to learn, build projects, and grow with students interested in AI, web development, and algorithms.' },
};

/** One source for SSR, sharing previews, and client navigation. Never include query strings. */
export function pageMeta(path: string) {
  const pathname = path.split(/[?#]/, 1)[0].replace(/\/+$/, '') || '/';
  const page = Object.hasOwn(pages, pathname) ? pages[pathname] : undefined;
  const admin = /^\/admin(?:\/|$)/.test(pathname);
  return {
    title: page?.title ?? (admin ? 'Control room | Nucleus' : 'Page not found — Nucleus SJEC'),
    description: page?.description ?? 'Explore the Nucleus student community at St. Joseph Engineering College, Mangaluru.',
    canonical: `https://nucleussjec.in${page ? pathname : '/'}`,
    robots: page ? 'index,follow' : 'noindex,nofollow',
  };
}
