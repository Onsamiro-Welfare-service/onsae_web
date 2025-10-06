import type { LinkProps } from 'next/link';

import Link from 'next/link';
import { forwardRef } from 'react';

// ----------------------------------------------------------------------

interface RouterLinkProps extends Omit<LinkProps, 'href'> {
  href: string;
}

export const RouterLink = forwardRef<HTMLAnchorElement, RouterLinkProps>(
  ({ href, ...other }, ref) => {
    return <Link ref={ref} href={href} {...other} />;
  }
);

RouterLink.displayName = 'RouterLink';
