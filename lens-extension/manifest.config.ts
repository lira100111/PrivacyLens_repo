import { defineManifest } from '@crxjs/vite-plugin';

export default defineManifest({
  manifest_version: 3,
  name: 'Privacylens — Auditoria LGPD & Privacidade',
  description: 'Auditoria técnica de privacidade, cookies, rede e segurança com evidências criptográficas.',
  version: '0.1.0',
  icons: {
    '16': 'public/icon16.png',
    '48': 'public/icon48.png',
    '128': 'public/icon128.png'
  },
  action: {
    default_title: 'Abrir Privacylens Side Panel'
  },
  side_panel: {
    default_path: 'src/sidepanel/index.html'
  },
  background: {
    service_worker: 'src/background/index.ts',
    type: 'module'
  },
  content_scripts: [
    {
      matches: ['<all_urls>'],
      js: ['src/content/index.ts'],
      run_at: 'document_idle'
    }
  ],
  permissions: [
    'storage',
    'activeTab',
    'scripting',
    'cookies',
    'sidePanel',
    'webRequest'
  ],
  host_permissions: ['<all_urls>']
});
