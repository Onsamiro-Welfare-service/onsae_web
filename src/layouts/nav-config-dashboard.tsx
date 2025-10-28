import { Label } from '@/components/label';
import { SvgColor } from '@/components/svg-color';

// ----------------------------------------------------------------------

const icon = (name: string) => <SvgColor src={`/assets/icons/navbar/${name}.svg`} />;

export type NavItem = {
  title: string;
  path: string;
  icon: React.ReactNode;
  info?: React.ReactNode;
};

export const navData = [
  {
    title: '대시보드',
    path: '/dashboard',
    icon: icon('ic-analytics'),
  },
  {
    title: '사용자 관리',
    path: '/user',
    icon: icon('ic-user'),
  },
  {
    title: '그룹 관리',
    path: '/groups',
    icon: icon('ic-group'),
  },
  {
    title: '질문 관리',
    path: '/question',
    icon: icon('ic-question'),
  },
  {
    title: '응답 관리',
    path: '/responses',
    icon: icon('ic-response'),
  },
  // {
  //   title: '업로드 관리',
  //   path: '/uploads',
  //   icon: icon('ic-upload'),
  // },
  // {
  //   title: '관리자 관리',
  //   path: '/admin',
  //   icon: icon('ic-admin'),
  // },
  // {
  //   title: 'Product',
  //   path: '/products',
  //   icon: icon('ic-cart'),
  //   info: (
  //     <Label color="error" variant="inverted">
  //       +3
  //     </Label>
  //   ),
  // },
  // {
  //   title: 'Blog',
  //   path: '/blog',
  //   icon: icon('ic-blog'),
  // },
  // {
  //   title: 'Sign in',
  //   path: '/sign-in',
  //   icon: icon('ic-lock'),
  // },
  // {
  //   title: 'Not found',
  //   path: '/404',
  //   icon: icon('ic-disabled'),
  // },
];
