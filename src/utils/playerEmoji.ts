const EMOJIS = [
  '🐶', '🐱', '🐭', '🐹', '🐰', '🦊', '🐻', '🐼',
  '🐨', '🐯', '🦁', '🐸', '🐵', '🐔', '🐧', '🦆',
  '🦉', '🐺', '🦄', '🐝', '🦋', '🐢', '🦈', '🐬',
  '👦', '👧', '🧙', '🧝', '🦸', '🤴', '👸', '🎅',
];

export function playerEmoji(index: number): string {
  return EMOJIS[index % EMOJIS.length];
}
