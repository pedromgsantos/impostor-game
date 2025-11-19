import React from "react";
import { slugifyCard } from "@/utils/slugifyCard";

type RoyaleCardDisplayProps = {
  name: string; // Nome da carta tal como vem do royale.json
};

export function RoyaleCardDisplay({ name }: RoyaleCardDisplayProps) {
  const slug = slugifyCard(name);
  const src = `${import.meta.env.BASE_URL}cards/${slug}.png`;

  const [imgError, setImgError] = React.useState(false);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="w-40 h-40 flex items-center justify-center rounded-xl bg-slate-900/40 border border-slate-700/60 overflow-hidden">
        {!imgError ? (
          <img
            src={src}
            alt={name}
            className="max-w-full max-h-full object-contain"
            onError={() => setImgError(true)}
          />
        ) : (
          <span className="text-xs text-slate-400 px-3 text-center">
            Imagem não encontrada para <br />
            <strong>{name}</strong>
          </span>
        )}
      </div>

      <div className="text-center">
        <p className="text-base font-semibold text-slate-50">
          {name}
        </p>
        <p className="text-xs text-slate-400 mt-1">
          Tema: <span className="font-mono">royale</span>
        </p>
      </div>
    </div>
  );
}
