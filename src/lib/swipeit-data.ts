import musicImage from "@/assets/swipeit-music.jpg";
import moviesImage from "@/assets/swipeit-movies.jpg";
import foodImage from "@/assets/swipeit-food.jpg";
import activitiesImage from "@/assets/swipeit-activities.jpg";
import booksImage from "@/assets/swipeit-books.jpg";
import gamesImage from "@/assets/swipeit-games.jpg";
import travelImage from "@/assets/swipeit-travel.jpg";

export type CategoryKey = "music" | "movies" | "food" | "activities" | "books" | "games" | "travel";

export interface DiscoverItem {
  id: string;
  title: string;
  description: string;
  image: string;
  rating: number;
  tags: string[];
  category: CategoryKey;
  sponsored?: boolean;
}

export const categories: Array<{ key: CategoryKey; label: string; eyebrow: string; emoji: string; image: string }> = [
  { key: "music", label: "Musique", eyebrow: "Écouter", emoji: "♫", image: musicImage },
  { key: "movies", label: "Films", eyebrow: "Regarder", emoji: "▶", image: moviesImage },
  { key: "food", label: "Restaurants", eyebrow: "Déguster", emoji: "✦", image: foodImage },
  { key: "activities", label: "Activités", eyebrow: "Vivre", emoji: "⌁", image: activitiesImage },
  { key: "books", label: "Livres", eyebrow: "Lire", emoji: "▤", image: booksImage },
  { key: "games", label: "Jeux", eyebrow: "Jouer", emoji: "⌘", image: gamesImage },
  { key: "travel", label: "Voyages", eyebrow: "Explorer", emoji: "↗", image: travelImage },
];

const names: Record<CategoryKey, string[]> = {
  music: ["Midnight City", "Nights", "Electric Feel", "After Dark", "Borderline", "Innerbloom", "Intro", "Sunset Lover", "The Less I Know", "Space Song", "Genesis", "Open Eye Signal", "Retrograde", "Eventually", "Kerala", "Time Moves Slow", "Loud Places", "Weightless", "On Hold", "Ocean Drive"],
  movies: ["Dune: Part Two", "Past Lives", "Anatomy of a Fall", "Perfect Days", "The Holdovers", "Civil War", "Oppenheimer", "Poor Things", "The Zone of Interest", "All of Us Strangers", "Decision to Leave", "Aftersun", "The Menu", "Nope", "Everything Everywhere", "Drive My Car", "The Worst Person", "Sound of Metal", "Another Round", "The Green Knight"],
  food: ["Septime", "Clamato", "Frenchie", "Mokonuts", "Early June", "Le Servan", "Double Dragon", "Bistrot Paul Bert", "Kubri", "Dersou", "Parcelles", "Tekés", "Le Rigmarole", "Shabour", "Carboni's", "Fulgurances", "Eels", "ChoCho", "Datsha", "L'Arpège"],
  activities: ["Kayak au lever du jour", "Atelier céramique", "Nuit au musée", "Escalade urbaine", "Cinéma en plein air", "Cours de mixologie", "Balade photo", "Yoga sur rooftop", "Escape game immersif", "Concert secret", "Initiation au surf", "Atelier parfum", "Randonnée nocturne", "Cours de cuisine", "Vol en montgolfière", "Plongée découverte", "Jam session", "Observation des étoiles", "Visite street art", "Sauna nordique"],
  books: ["Le Mage du Kremlin", "L'Anomalie", "Veiller sur elle", "La Carte postale", "S'adapter", "Les Impatientes", "Changer l'eau des fleurs", "L'Art de perdre", "La plus secrète mémoire", "Blizzard", "Trois", "Civilizations", "Leurs enfants après eux", "Une bête au paradis", "La Panthère des neiges", "Connemara", "Les Gratitudes", "Yoga", "La décision", "Petit pays"],
  games: ["Hades II", "Baldur's Gate 3", "Cocoon", "Dave the Diver", "Sea of Stars", "Tunic", "Sifu", "Stray", "Disco Elysium", "Outer Wilds", "Celeste", "Hollow Knight", "Inscryption", "Hi-Fi Rush", "Dredge", "Jusant", "Chants of Sennaar", "Neon White", "Death's Door", "Citizen Sleeper"],
  travel: ["Kyoto, Japon", "Lofoten, Norvège", "Lisbonne, Portugal", "Dolomites, Italie", "Milos, Grèce", "Marrakech, Maroc", "Reykjavík, Islande", "Séoul, Corée", "Patagonie, Chili", "Copenhague, Danemark", "Oaxaca, Mexique", "Édimbourg, Écosse", "Bali, Indonésie", "Amalfi, Italie", "Montréal, Canada", "Madeira, Portugal", "Tallinn, Estonie", "New York, USA", "Minorque, Espagne", "Cape Town, Afrique du Sud"],
};

const descriptions: Record<CategoryKey, string> = {
  music: "Une production magnétique, entre pulsations nocturnes et mélodies qui restent en tête.",
  movies: "Une expérience de cinéma saisissante, portée par une mise en scène précise et une émotion durable.",
  food: "Une adresse singulière où produits de saison, gestes précis et ambiance feutrée se rencontrent.",
  activities: "Une expérience mémorable à partager, pensée pour sortir du quotidien et réveiller la curiosité.",
  books: "Un récit élégant et habité, à dévorer lentement puis à garder longtemps en mémoire.",
  games: "Une aventure généreuse au gameplay ciselé, dans un univers qui récompense chaque détour.",
  travel: "Une destination vibrante entre paysages iconiques, adresses confidentielles et culture locale.",
};

const tags: Record<CategoryKey, string[]> = {
  music: ["Indie", "Électro", "Chill"], movies: ["Cinéma", "Drame", "Culte"], food: ["Paris", "Créatif", "€€"],
  activities: ["Expérience", "Local", "À deux"], books: ["Roman", "Contemporain", "Primé"],
  games: ["Indé", "Aventure", "Immersif"], travel: ["Escapade", "Culture", "Nature"],
};

export const items: DiscoverItem[] = categories.flatMap((category) =>
  names[category.key].map((title, index) => ({
    id: `${category.key}-${index + 1}`,
    title,
    description: descriptions[category.key],
    image: category.image,
    rating: Number((8.2 + ((index * 7) % 16) / 10).toFixed(1)),
    tags: [tags[category.key][index % 3], tags[category.key][(index + 1) % 3], index % 2 ? "Tendance" : "Pour vous"],
    category: category.key,
  })),
);

export const sponsoredItem: DiscoverItem = {
  id: "sponsor-apple-music", title: "Le son, sans limites.",
  description: "Trois mois offerts pour découvrir plus de 100 millions de titres en audio spatial.",
  image: musicImage, rating: 9.7, tags: ["Offre exclusive", "Audio spatial"], category: "music", sponsored: true,
};

export const categoryByKey = (key: string) => categories.find((category) => category.key === key) ?? categories[0];