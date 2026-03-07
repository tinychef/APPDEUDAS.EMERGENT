// Niveles aspiracionales — parametrizables para personalización futura
// Cada nivel se desbloquea cuando el ahorro acumulado supera `minAhorro`

export interface AspirationLevel {
  id: number;
  minAhorro: number;
  title: string;
  description: string;
  icon: string;  // Ionicons glyph name
}

export const ASPIRATION_LEVELS: AspirationLevel[] = [
  {
    id: 1,
    minAhorro: 100_000,
    title: 'Primer café gratis',
    description: 'Con lo que ahorraste podrías tomar café por un mes entero.',
    icon: 'cafe-outline',
  },
  {
    id: 2,
    minAhorro: 500_000,
    title: 'Fin de semana',
    description: 'Ya alcanza para un fin de semana en otra ciudad.',
    icon: 'map-outline',
  },
  {
    id: 3,
    minAhorro: 1_000_000,
    title: 'Tecnología nueva',
    description: 'Puedes comprarte un celular mid-range o tablet.',
    icon: 'phone-portrait-outline',
  },
  {
    id: 4,
    minAhorro: 2_000_000,
    title: 'iPhone básico',
    description: 'Con lo que has ahorrado podrías comprarte un iPhone SE.',
    icon: 'logo-apple',
  },
  {
    id: 5,
    minAhorro: 5_000_000,
    title: 'Vacaciones familiares',
    description: 'Alcanza para una semana de vacaciones en familia.',
    icon: 'umbrella-outline',
  },
  {
    id: 6,
    minAhorro: 10_000_000,
    title: 'Cuota inicial carro',
    description: 'Podrías pagar la cuota inicial de un carro usado.',
    icon: 'car-outline',
  },
  {
    id: 7,
    minAhorro: 20_000_000,
    title: 'iPhone Pro',
    description: 'Ya tienes para el último iPhone Pro Max.',
    icon: 'phone-landscape-outline',
  },
  {
    id: 8,
    minAhorro: 50_000_000,
    title: 'Carro 0km',
    description: 'Tienes la cuota inicial de un carro nuevo.',
    icon: 'car-sport-outline',
  },
  {
    id: 9,
    minAhorro: 80_000_000,
    title: 'Camino al apartamento',
    description: 'Estás cerca de la cuota inicial de un apartamento.',
    icon: 'home-outline',
  },
  {
    id: 10,
    minAhorro: 100_000_000,
    title: '¡Libertad financiera!',
    description: 'Tu ahorro cubre más de un año de vida libre de deuda.',
    icon: 'trophy-outline',
  },
];

/** Retorna el nivel más alto desbloqueado, o el primero si nada desbloqueado. */
export function getCurrentAspiration(ahorro: number): AspirationLevel {
  const unlocked = ASPIRATION_LEVELS.filter((l) => ahorro >= l.minAhorro);
  return unlocked[unlocked.length - 1] ?? ASPIRATION_LEVELS[0];
}

/** Retorna el próximo nivel a alcanzar, o null si ya está en el máximo. */
export function getNextAspiration(ahorro: number): AspirationLevel | null {
  return ASPIRATION_LEVELS.find((l) => l.minAhorro > ahorro) ?? null;
}

/** Progreso hacia el próximo nivel (0–100). */
export function getProgressToNext(ahorro: number): number {
  const current = getCurrentAspiration(ahorro);
  const next = getNextAspiration(ahorro);
  if (!next) return 100;
  const from = current.minAhorro;
  const to = next.minAhorro;
  return Math.min(100, Math.round(((ahorro - from) / (to - from)) * 100));
}
