import { createFileRoute } from "@tanstack/react-router";
import { convertToModelMessages, streamText, type UIMessage } from "ai";
import { createLovableAiGatewayProvider } from "@/lib/ai-gateway.server";

const SYSTEM_PROMPT = `Tu es Pulse, l'assistant de découverte de SwipeIt.

Ton rôle est d'aider les utilisateurs à découvrir leur prochaine obsession : musique, films, séries, restaurants, jeux vidéo, livres, activités, voyages. Tu es chaleureux, curieux, direct, un peu complice — comme un ami qui a très bon goût.

Règles :
- Réponds toujours en français, sauf si l'utilisateur écrit dans une autre langue.
- Sois concis : quelques phrases, listes courtes, jamais de blocs interminables.
- Quand tu recommandes, propose 2 à 4 pistes avec une phrase d'accroche pour chacune.
- Pose une question si l'humeur, le budget, la durée ou la personne à contenter ne sont pas clairs.
- Utilise des emojis avec parcimonie pour rythmer, jamais en excès.
- N'invente pas de fonctionnalités ; renvoie vers l'écran d'accueil pour swiper une catégorie.`;

type ChatRequestBody = { messages?: unknown };

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { messages } = (await request.json()) as ChatRequestBody;
        if (!Array.isArray(messages)) {
          return new Response("Messages are required", { status: 400 });
        }
        const key = process.env.LOVABLE_API_KEY;
        if (!key) {
          return new Response("Missing LOVABLE_API_KEY", { status: 500 });
        }
        const gateway = createLovableAiGatewayProvider(key);
        const result = streamText({
          model: gateway("google/gemini-3-flash-preview"),
          system: SYSTEM_PROMPT,
          messages: convertToModelMessages(messages as UIMessage[]),
        });
        return result.toUIMessageStreamResponse({
          originalMessages: messages as UIMessage[],
        });
      },
    },
  },
});