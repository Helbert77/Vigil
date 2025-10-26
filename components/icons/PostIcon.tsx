import React from 'react';
import { Icon } from './Icon';

export const PostIcon: React.FC<React.SVGProps<SVGSVGElement>> = (props) => (
  <Icon {...props}>
    <path d="M20 12V8l-6-6H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12" />
    <path d="M14 2v4a2 2 0 0 0 2 2h4" />
    <path d="M12 18v-8" />
    <path d="M15 15H9" />
  </Icon>
);