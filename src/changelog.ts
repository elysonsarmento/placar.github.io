export const APP_VERSION = '1.1.8';

export const CHANGELOG = [
  {
    version: '1.1.8',
    date: '05/04/2026',
    features: [
      'Visual revertido para o layout clássico com os sets no topo e histórico embaixo',
      'Adicionado Histórico de Torneio: agora o aplicativo salva o histórico de partidas anteriores',
      'Nova opção nas configurações para alternar entre "Sets da Partida Atual" e "Partidas Anteriores" no histórico inferior',
      'O histórico de partidas mostra as cores e pontuações dos times que jogaram'
    ]
  },
  {
    version: '1.1.7',
    date: '05/04/2026',
    features: [
      'Novo layout do placar: Nomes dos times agora ficam sempre visíveis no topo',
      'Novo layout do placar: Contagem de sets movida para a parte inferior para maior clareza',
      'Removido o histórico de sets que causava confusão visual'
    ]
  },
  {
    version: '1.1.6',
    date: '05/04/2026',
    features: [
      'Atualização do Vite para a versão mais recente (v8)',
      'Resolução de conflitos de dependências do PWA utilizando overrides no package.json'
    ]
  },
  {
    version: '1.1.5',
    date: '05/04/2026',
    features: [
      'Adicionado botão para buscar e instalar atualizações manualmente na tela de configurações',
      'Correção de conflitos de dependências que causavam erro no GitHub Actions'
    ]
  },
  {
    version: '1.1.4',
    date: '05/04/2026',
    features: [
      'Atualização de todos os pacotes e dependências do sistema para as versões mais recentes',
      'Melhorias de performance e segurança'
    ]
  },
  {
    version: '1.1.3',
    date: '04/04/2026',
    features: [
      'Correção: Botões de editar e excluir times agora estão sempre visíveis (melhoria para telas touch/iPad)'
    ]
  },
  {
    version: '1.1.2',
    date: '04/04/2026',
    features: [
      'Forçado modo tela cheia (fullscreen) no PWA para remover barras do sistema',
      'Ajuste agressivo de altura (100vh) para cobrir a safe area inferior'
    ]
  },
  {
    version: '1.1.1',
    date: '04/04/2026',
    features: [
      'Ajuste na altura da tela para preencher a área segura (safe area) em dispositivos iOS',
      'Correção da barra de rolagem (scrollbar) no tema escuro',
      'Reorganização do layout da tela de configurações em duas colunas'
    ]
  },
  {
    version: '1.1.0',
    date: '04/04/2026',
    features: [
      'Atualização automática do PWA ativada',
      'Nova tela de "Novidades" para ver as atualizações',
      'Opção de manter a tela sempre ligada (Wake Lock)',
      'Botão central para troca rápida de lados da quadra',
      'Inversão automática dos times ao girar o iPad'
    ]
  },
  {
    version: '1.0.0',
    date: '03/04/2026',
    features: [
      'Lançamento inicial do Placar Pro',
      'Controle de pontos e sets',
      'Cores personalizadas para os times',
      'Suporte a tela cheia (PWA)'
    ]
  }
];
