export const APP_VERSION = '1.2.5';

export const CHANGELOG = [
  {
    version: '1.2.5',
    date: '18/04/2026',
    features: [
      'Histórico em Configurações: O histórico de partidas foi movido para uma aba dedicada nas configurações para um placar mais limpo',
      'Visualização Detalhada: O novo histórico em configurações permite ver data, hora e placar de cada set de jogos passados',
      'Placar Minimalista: O rodapé do placar agora mostra apenas os sets da partida atual se necessário'
    ]
  },
  {
    version: '1.2.4',
    date: '18/04/2026',
    features: [
      'Nova opção de Reset: Agora você pode escolher entre "Zerar e Salvar" ou "Apenas Reiniciar" sem sujar o histórico',
      'Controle de Histórico: Adicionado botão de lixeira diretamente no rodapé para limpar partidas passadas',
      'Interface Clara: Rótulos melhorados no histórico inferior para diferenciar "Sets Atuais" de "Partidas Passadas"'
    ]
  },
  {
    version: '1.2.3',
    date: '18/04/2026',
    features: [
      'Revisão visual: Cores e gradients revertidos para o estilo clássico a pedido do usuário',
      'Manutençao: Efeitos de animação e transições suaves preservados'
    ]
  },
  {
    version: '1.2.2',
    date: '09/04/2026',
    features: [
      'Redesign completo do placar: novos cards de pontuação com profundidade visual',
      'Indicador de Saque: agora é possível marcar qual time está sacando',
      'Animações suaves nas mudanças de pontuação',
      'Gradients dinâmicos nos fundos dos times para maior contraste e modernidade',
      'Botão de "Definir Saque" acessível ao passar o mouse/tocar no nome do time'
    ]
  },
  {
    version: '1.2.1',
    date: '09/04/2026',
    features: [
      'Redesign completo do menu de configurações com navegação por abas (Partida, Times, Regras, Sistema)',
      'Melhoria visual em todos os componentes de interface (inputs, botões, cards)',
      'Otimização do layout para tablets e dispositivos móveis',
      'Novas animações de transição entre seções de configuração'
    ]
  },
  {
    version: '1.2.0',
    date: '08/04/2026',
    features: [
      'Adicionado Cronômetro (Progressivo e Regressivo) com controle de pausa e reset',
      'Novo layout do topo: Cronômetro integrado entre os placares de sets',
      'Correção de centralização: Linha divisória e botões agora ficam perfeitamente no centro da tela',
      'Opção de configurar duração do tempo nas regras da partida'
    ]
  },
  {
    version: '1.1.9',
    date: '06/04/2026',
    features: [
      'Correção do bug de fechamento duplo de set (debounce no botão)',
      'Nova opção "Vantagem (2 pontos)" nas configurações',
      'Melhoria na lógica de "Travar Placar no Set" para respeitar a vantagem',
      'Correção da persistência offline e limpeza total do torneio',
      'Atualização do ambiente de deploy para Node.js 24'
    ]
  },
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
