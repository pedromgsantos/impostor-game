export type Lang = "pt" | "en";

// Portuguese is the source of truth; English must mirror its keys exactly.
const pt = {
  // App / brand
  "app.tagline": "Descobre o impostor entre os teus amigos",

  // Generic
  "common.cancel": "Cancelar",
  "common.playerFallback": "Jogador {n}",

  // Setup
  "setup.players": "Jogadores",
  "setup.clear": "Limpar",
  "setup.playerPlaceholder": "Jogador {n}",
  "setup.removePlayer": "Remover jogador {n}",
  "setup.addPlayer": "+ Adicionar jogador",
  "setup.theme": "Tema",
  "setup.theme.classic": "Clássico",
  "setup.theme.celebrities": "Celebridades",
  "setup.theme.food": "Comida",
  "setup.theme.royale": "Royale",
  "setup.royaleNote": "⚔️ Royale funciona apenas em modo Cego.",
  "setup.mode": "Modo",
  "setup.mode.normal": "Normal",
  "setup.mode.cego": "Cego",
  "setup.mode.cegoDesc": "O impostor não vê nenhuma palavra.",
  "setup.mode.normalDesc": "O impostor recebe uma palavra diferente.",
  "setup.extras": "Extras",
  "setup.lastChance": "Última Chance",
  "setup.lastChanceDesc": "Se apanhado, o impostor tenta adivinhar a palavra",
  "setup.twoImpostors": "Dois Impostores",
  "setup.twoImpostorsDesc": "Dois jogadores são impostores",
  "setup.twoImpostorsNeed": "Precisas de pelo menos 5 jogadores",
  "setup.timer": "Temporizador",
  "setup.start": "Começar jogo",
  "setup.needPlayers": "Adiciona pelo menos 3 jogadores",
  "setup.language": "Idioma",

  // Assign
  "assign.wordFallback": "PALAVRA",
  "assign.goodLuck": "Boa sorte",
  "assign.roleImpostor": "És o impostor",
  "assign.roleBlind": "Jogas no escuro",
  "assign.roleGroup": "És do grupo",
  "assign.surfaceAria": "Arrasta para cima e mantém para ver o teu papel",
  "assign.onlySees": "Só {name} deve ver",
  "assign.dragUp": "Arrasta para cima e mantém",
  "assign.to": "Para",
  "assign.fairPlay": "⚠️ Jogo justo — sem espreitar nem screenshots",
  "assign.holdButtonAria": "Tocar e manter para ver o teu papel",
  "assign.holdButton": "👆 Tocar & Manter",
  "assign.continue": "Continuar →",
  "assign.startRound": "Começar ronda",
  "assign.hiddenOnRelease": "Nada fica visível quando largas o ecrã.",
  "assign.counter": "{n} de {total}",

  // Round
  "round.title": "Discussão",
  "round.subtitle": "Descubram o impostor sem revelar a palavra",
  "round.startsSpeaking": "Começa a falar",
  "round.pauseAria": "Pausar temporizador",
  "round.resumeAria": "Retomar temporizador",
  "round.tapToPause": "Toca para pausar",
  "round.tapToResume": "Toca para retomar",
  "round.timeUp": "⏰ Tempo esgotado!",
  "round.timeToVote": "Está na hora de votar",
  "round.vote": "Votar",

  // Vote
  "vote.secondTitle": "Segundo voto",
  "vote.title": "Votação",
  "vote.secondSubtitle": "Encontra o segundo impostor!",
  "vote.subtitle": "Quem é o impostor?",
  "vote.caughtBanner": "{name} apanhado — falta um!",
  "vote.suspectsAria": "Lista de suspeitos",
  "vote.caught": "Apanhado ✓",
  "vote.selected": "Selecionado",
  "vote.confirm": "⚖️  Confirmar suspeito",
  "vote.selectSuspect": "Seleciona um suspeito",
  "vote.confirmQuestion": "Têm a certeza que querem acusar esta pessoa?",
  "vote.accuse": "Acusar 🔍",
  "vote.revealing": "A revelar...",

  // Last chance
  "lastchance.title": "Última Chance",
  "lastchance.warning": "Outros jogadores, não espreitem! O impostor vai tentar adivinhar a palavra secreta.",
  "lastchance.caughtNote": "Apanhado em flagrante — mas ainda há esperança 😈",
  "lastchance.ready": "Estou pronto",
  "lastchance.question": "Qual era a palavra?",
  "lastchance.inputHint": "Escreve a tua resposta sem que ninguém veja.",
  "lastchance.inputPlaceholder": "a tua resposta...",
  "lastchance.revealAnswer": "Revelar resposta",
  "lastchance.correct": "Correto!",
  "lastchance.wrong": "Errado!",
  "lastchance.correctDesc": "O impostor adivinhou a palavra. Impostor vence!",
  "lastchance.wrongDesc": "A resposta estava errada. O grupo vence!",
  "lastchance.realWord": "Palavra real",
  "lastchance.revealingResult": "A revelar resultado...",

  // Result
  "result.groupWon": "Grupo venceu!",
  "result.impostorWon": "Impostor venceu!",
  "result.groupWonDesc": "Encontraram o impostor! Bom trabalho de equipa. 🔍",
  "result.impostorWonDesc": "O impostor enganou toda a gente. Boa sorte da próxima!",
  "result.impostorsWere": "Os impostores eram",
  "result.impostorWas": "O impostor era",
  "result.realWord": "Palavra real",
  "result.impostorClue": "Pista do impostor",
  "result.blindMode": "Modo cego",
  "result.playedBlind": "Impostor jogou no escuro",
  "result.playAgain": "Jogar novamente",
  "result.newRoom": "Nova sala",
  "result.resetHistory": "Repor histórico",
  "result.resetTitle": "Repor histórico",
  "result.resetQuestion": "As palavras já usadas no tema \"{theme}\" voltam a estar disponíveis.",
  "result.reset": "Repor",
  "result.resetDone": "Histórico reposto com sucesso.",

  // Store toasts
  "toast.themeExhausted": "Tema esgotado — repõe o histórico ou muda de tema.",
} as const;

const en: Record<keyof typeof pt, string> = {
  "app.tagline": "Find the impostor among your friends",

  "common.cancel": "Cancel",
  "common.playerFallback": "Player {n}",

  "setup.players": "Players",
  "setup.clear": "Clear",
  "setup.playerPlaceholder": "Player {n}",
  "setup.removePlayer": "Remove player {n}",
  "setup.addPlayer": "+ Add player",
  "setup.theme": "Theme",
  "setup.theme.classic": "Classic",
  "setup.theme.celebrities": "Celebrities",
  "setup.theme.food": "Food",
  "setup.theme.royale": "Royale",
  "setup.royaleNote": "⚔️ Royale only works in Blind mode.",
  "setup.mode": "Mode",
  "setup.mode.normal": "Normal",
  "setup.mode.cego": "Blind",
  "setup.mode.cegoDesc": "The impostor sees no word at all.",
  "setup.mode.normalDesc": "The impostor gets a different word.",
  "setup.extras": "Extras",
  "setup.lastChance": "Last Chance",
  "setup.lastChanceDesc": "If caught, the impostor tries to guess the word",
  "setup.twoImpostors": "Two Impostors",
  "setup.twoImpostorsDesc": "Two players are impostors",
  "setup.twoImpostorsNeed": "You need at least 5 players",
  "setup.timer": "Timer",
  "setup.start": "Start game",
  "setup.needPlayers": "Add at least 3 players",
  "setup.language": "Language",

  "assign.wordFallback": "WORD",
  "assign.goodLuck": "Good luck",
  "assign.roleImpostor": "You're the impostor",
  "assign.roleBlind": "You play blind",
  "assign.roleGroup": "You're in the group",
  "assign.surfaceAria": "Drag up and hold to see your role",
  "assign.onlySees": "Only {name} should look",
  "assign.dragUp": "Drag up and hold",
  "assign.to": "To",
  "assign.fairPlay": "⚠️ Fair play — no peeking or screenshots",
  "assign.holdButtonAria": "Tap and hold to see your role",
  "assign.holdButton": "👆 Tap & Hold",
  "assign.continue": "Continue →",
  "assign.startRound": "Start round",
  "assign.hiddenOnRelease": "Nothing stays visible once you let go.",
  "assign.counter": "{n} of {total}",

  "round.title": "Discussion",
  "round.subtitle": "Find the impostor without revealing the word",
  "round.startsSpeaking": "Starts speaking",
  "round.pauseAria": "Pause timer",
  "round.resumeAria": "Resume timer",
  "round.tapToPause": "Tap to pause",
  "round.tapToResume": "Tap to resume",
  "round.timeUp": "⏰ Time's up!",
  "round.timeToVote": "Time to vote",
  "round.vote": "Vote",

  "vote.secondTitle": "Second vote",
  "vote.title": "Voting",
  "vote.secondSubtitle": "Find the second impostor!",
  "vote.subtitle": "Who is the impostor?",
  "vote.caughtBanner": "{name} caught — one to go!",
  "vote.suspectsAria": "List of suspects",
  "vote.caught": "Caught ✓",
  "vote.selected": "Selected",
  "vote.confirm": "⚖️  Confirm suspect",
  "vote.selectSuspect": "Select a suspect",
  "vote.confirmQuestion": "Are you sure you want to accuse this person?",
  "vote.accuse": "Accuse 🔍",
  "vote.revealing": "Revealing...",

  "lastchance.title": "Last Chance",
  "lastchance.warning": "Everyone else, no peeking! The impostor will try to guess the secret word.",
  "lastchance.caughtNote": "Caught red-handed — but there's still hope 😈",
  "lastchance.ready": "I'm ready",
  "lastchance.question": "What was the word?",
  "lastchance.inputHint": "Type your answer without anyone seeing.",
  "lastchance.inputPlaceholder": "your answer...",
  "lastchance.revealAnswer": "Reveal answer",
  "lastchance.correct": "Correct!",
  "lastchance.wrong": "Wrong!",
  "lastchance.correctDesc": "The impostor guessed the word. Impostor wins!",
  "lastchance.wrongDesc": "The answer was wrong. The group wins!",
  "lastchance.realWord": "Real word",
  "lastchance.revealingResult": "Revealing result...",

  "result.groupWon": "Group won!",
  "result.impostorWon": "Impostor won!",
  "result.groupWonDesc": "You found the impostor! Great teamwork. 🔍",
  "result.impostorWonDesc": "The impostor fooled everyone. Better luck next time!",
  "result.impostorsWere": "The impostors were",
  "result.impostorWas": "The impostor was",
  "result.realWord": "Real word",
  "result.impostorClue": "Impostor's clue",
  "result.blindMode": "Blind mode",
  "result.playedBlind": "Impostor played blind",
  "result.playAgain": "Play again",
  "result.newRoom": "New room",
  "result.resetHistory": "Reset history",
  "result.resetTitle": "Reset history",
  "result.resetQuestion": "Words already used in the \"{theme}\" theme become available again.",
  "result.reset": "Reset",
  "result.resetDone": "History reset successfully.",

  "toast.themeExhausted": "Theme exhausted — reset the history or switch themes.",
};

export type TranslationKey = keyof typeof pt;

export const translations: Record<Lang, Record<TranslationKey, string>> = {
  pt,
  en,
};

export type TVars = Record<string, string | number>;

function interpolate(template: string, vars?: TVars): string {
  if (!vars) return template;
  return template.replace(/\{(\w+)\}/g, (match, key) =>
    key in vars ? String(vars[key]) : match
  );
}

// Framework-agnostic translator — usable inside the store and other non-React code.
export function translate(lang: Lang, key: TranslationKey, vars?: TVars): string {
  const table = translations[lang] ?? translations.pt;
  const template = table[key] ?? translations.pt[key] ?? key;
  return interpolate(template, vars);
}
