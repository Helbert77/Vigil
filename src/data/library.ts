export type LibraryItemType = 'ebook' | 'article' | 'magazine' | 'document';

export interface LibraryItem {
  id: string;
  type: LibraryItemType;
  title: string;
  author: string;
  description: string;
  coverUrl: string;

  date: string; // ISO date string
  publishedDate?: string; // Data de publicação
  category?: string; // Categoria do item
  tags?: string[];
  readUrl?: string;
  downloadUrl?: string;
  downloads: number;
  views: number;
}

export const libraryItems: LibraryItem[] = [
  {
    id: 'ebook-001',
    type: 'ebook',
    title: 'Design Moderno com Tailwind',
    author: 'Ana Silva',
    description: 'Guia prático para criar interfaces elegantes com Tailwind CSS.',
    coverUrl: '/public/logo.png',
    date: '2024-08-10',
    tags: ['novo', 'destaque'],
    readUrl: 'https://example.com/read/ebook-001',
    downloadUrl: 'https://example.com/download/ebook-001.pdf',
    downloads: 1247,
    views: 3891
  },
  {
    id: 'article-001',
    type: 'article',
    title: 'Arquiteturas de Front-End Escaláveis',
    author: 'João Pereira',
    description: 'Padrões e práticas para projetos React de grande porte.',
    coverUrl: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?w=300&h=400&fit=crop&crop=center',
    date: '2024-09-02',
    tags: ['popular'],
    downloads: 892,
    views: 2156
  },
  {
    id: 'mag-001',
    type: 'magazine',
    title: 'Revista Web Trends - Edição 23',
    author: 'Equipe Web Trends',
    description: 'Tendências modernas de UI/UX e performance na web.',
    coverUrl: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=300&h=400&fit=crop&crop=center',
    date: '2024-07-28',
    tags: ['destaque'],
    downloads: 567,
    views: 1834
  },
  {
    id: 'doc-001',
    type: 'document',
    title: 'Guia de Acessibilidade',
    author: 'Time de Produto',
    description: 'Boas práticas para acessibilidade em aplicações web.',
    coverUrl: 'https://images.unsplash.com/photo-1568667256549-094345857637?w=300&h=400&fit=crop&crop=center',
    date: '2024-06-15',
    tags: ['popular'],
    downloadUrl: 'https://example.com/download/doc-001.pdf',
    downloads: 2341,
    views: 5672
  },
  {
    id: 'ebook-002',
    type: 'ebook',
    title: 'React com TypeScript: do Zero ao Avançado',
    author: 'Bruno Costa',
    description: 'Tudo o que você precisa para dominar React+TS.',
    coverUrl: 'https://images.unsplash.com/photo-1481627834876-b7833e8f5570?w=300&h=400&fit=crop&crop=center',
    date: '2024-05-20',
    tags: ['novo'],
    downloads: 1789,
    views: 4123
  },
  {
    id: 'article-002',
    type: 'article',
    title: 'Virtualização de Listas: Performance na Prática',
    author: 'Marina Lopes',
    description: 'Como renderizar grandes listas com eficiência.',
    coverUrl: 'https://images.unsplash.com/photo-1559757148-5c350d0d3c56?w=300&h=400&fit=crop&crop=center',
    date: '2024-10-01',
    downloads: 1456,
    views: 3287
  },
  {
    id: 'mag-002',
    type: 'magazine',
    title: 'Revista Tech Insights - Edição 12',
    author: 'Tech Insights',
    description: 'Novidades do ecossistema JavaScript e ferramentas modernas.',
    coverUrl: '/public/logo.png',
    date: '2024-03-05',
    downloads: 734,
    views: 1923
  },
  {
    id: 'doc-002',
    type: 'document',
    title: 'Política de Privacidade (Atualizada)',
    author: 'Jurídico',
    description: 'Versão atualizada da política de privacidade.',
    coverUrl: '/public/logo.png',
    date: '2024-02-18',
    downloadUrl: 'https://example.com/download/doc-002.pdf',
    downloads: 456,
    views: 1234
  },
  {
    id: 'ebook-003',
    type: 'ebook',
    title: 'UX Essencial: Princípios e Padrões',
    author: 'Carla Mendes',
    description: 'Fundamentos de UX aplicados em produtos digitais.',
    coverUrl: '/public/logo.png',
    date: '2023-12-22',
    downloads: 2156,
    views: 4789
  },
  {
    id: 'article-003',
    type: 'article',
    title: 'Dark Mode: Design e Acessibilidade',
    author: 'Rafael Lima',
    description: 'Melhores práticas para implementar modo escuro.',
    coverUrl: '/public/logo.png',
    date: '2024-01-10',
    tags: ['destaque'],
    downloads: 987,
    views: 2345
  },
  {
    id: 'mag-003',
    type: 'magazine',
    title: 'Frontend Digest - Edição Especial',
    author: 'Frontend Digest',
    description: 'Edição com foco em performance e otimizações.',
    coverUrl: '/public/logo.png',
    date: '2024-09-15',
    downloads: 1123,
    views: 2876
  },
  {
    id: 'doc-003',
    type: 'document',
    title: 'Guia de Contribuição (Projeto)',
    author: 'Engenharia',
    description: 'Como contribuir de forma organizada e segura.',
    coverUrl: '/public/logo.png',
    date: '2024-04-30',
    downloads: 678,
    views: 1567
  }
];