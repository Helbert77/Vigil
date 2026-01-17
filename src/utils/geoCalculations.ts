/**
 * Utilitários para cálculos geográficos
 * Todas as funções operam apenas em memória, sem persistência no banco de dados
 */

export interface Coordinates {
  latitude: number;
  longitude: number;
}

export interface UserWithLocation {
  id: string;
  name: string;
  username?: string;
  avatarUrl?: string;
  coordinates: Coordinates;
  accuracy?: number;
  timestamp?: number;
  interests?: string[];
  age?: number;
  location?: string;
  plan?: string;
  role?: string;
}

export interface NearbyUser extends UserWithLocation {
  distance: number; // em quilômetros
  similarityScore: number; // 0-1, baseado na distância
}

/**
 * Calcula a distância entre duas coordenadas usando a fórmula de Haversine
 * @param coord1 Primeira coordenada (lat, lon)
 * @param coord2 Segunda coordenada (lat, lon)
 * @returns Distância em quilômetros
 */
export const calculateDistance = (
  coord1: Coordinates,
  coord2: Coordinates
): number => {
  const EARTH_RADIUS_KM = 6371;

  const toRadians = (degrees: number) => degrees * (Math.PI / 180);

  const lat1Rad = toRadians(coord1.latitude);
  const lat2Rad = toRadians(coord2.latitude);
  const deltaLat = toRadians(coord2.latitude - coord1.latitude);
  const deltaLon = toRadians(coord2.longitude - coord1.longitude);

  const a =
    Math.sin(deltaLat / 2) * Math.sin(deltaLat / 2) +
    Math.cos(lat1Rad) *
      Math.cos(lat2Rad) *
      Math.sin(deltaLon / 2) *
      Math.sin(deltaLon / 2);

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return EARTH_RADIUS_KM * c;
};

/**
 * Calcula o similarity score baseado na distância
 * Quanto mais próximo, maior o score (0-1)
 * @param distance Distância em km
 * @param maxDistance Distância máxima considerada (padrão: 50km)
 * @returns Score de 0 a 1
 */
export const calculateSimilarityScore = (
  distance: number,
  maxDistance: number = 50
): number => {
  if (distance >= maxDistance) return 0;
  return Math.max(0, 1 - distance / maxDistance);
};

/**
 * Filtra e ordena usuários por proximidade
 * @param currentUserCoords Coordenadas do usuário atual
 * @param users Lista de usuários com localização
 * @param maxDistance Distância máxima em km (padrão: 50km)
 * @returns Lista de usuários próximos ordenados por distância
 */
export const findNearbyUsers = (
  currentUserCoords: Coordinates,
  users: UserWithLocation[],
  maxDistance: number = 50
): NearbyUser[] => {
  const nearbyUsers: NearbyUser[] = [];

  for (const user of users) {
    const distance = calculateDistance(currentUserCoords, user.coordinates);

    if (distance <= maxDistance) {
      nearbyUsers.push({
        ...user,
        distance,
        similarityScore: calculateSimilarityScore(distance, maxDistance)
      });
    }
  }

  // Ordenar por distância (mais próximo primeiro)
  return nearbyUsers.sort((a, b) => a.distance - b.distance);
};

/**
 * Formata a distância para exibição
 * @param distanceKm Distância em quilômetros
 * @returns String formatada (ex: "1.5 km" ou "500 m")
 */
export const formatDistance = (distanceKm: number): string => {
  if (distanceKm < 1) {
    const meters = Math.round(distanceKm * 1000);
    return `${meters} m`;
  }
  return `${distanceKm.toFixed(1)} km`;
};

/**
 * Verifica se as coordenadas são válidas
 * @param coords Coordenadas a verificar
 * @returns true se válidas
 */
export const isValidCoordinates = (coords: Coordinates): boolean => {
  return (
    coords.latitude >= -90 &&
    coords.latitude <= 90 &&
    coords.longitude >= -180 &&
    coords.longitude <= 180
  );
};

/**
 * Calcula o bearing (direção) entre duas coordenadas
 * @param from Coordenada de origem
 * @param to Coordenada de destino
 * @returns Ângulo em graus (0-360)
 */
export const calculateBearing = (
  from: Coordinates,
  to: Coordinates
): number => {
  const toRadians = (degrees: number) => degrees * (Math.PI / 180);
  const toDegrees = (radians: number) => radians * (180 / Math.PI);

  const lat1 = toRadians(from.latitude);
  const lat2 = toRadians(to.latitude);
  const deltaLon = toRadians(to.longitude - from.longitude);

  const y = Math.sin(deltaLon) * Math.cos(lat2);
  const x =
    Math.cos(lat1) * Math.sin(lat2) -
    Math.sin(lat1) * Math.cos(lat2) * Math.cos(deltaLon);

  const bearing = toDegrees(Math.atan2(y, x));

  return (bearing + 360) % 360;
};

/**
 * Agrupa usuários por faixas de distância
 * @param nearbyUsers Lista de usuários próximos
 * @returns Objeto com usuários agrupados por faixa
 */
export const groupUsersByDistance = (nearbyUsers: NearbyUser[]) => {
  return {
    veryClose: nearbyUsers.filter(u => u.distance < 1), // < 1km
    close: nearbyUsers.filter(u => u.distance >= 1 && u.distance < 5), // 1-5km
    nearby: nearbyUsers.filter(u => u.distance >= 5 && u.distance < 15), // 5-15km
    far: nearbyUsers.filter(u => u.distance >= 15) // > 15km
  };
};
