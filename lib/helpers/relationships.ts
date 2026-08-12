import { RelationshipType } from '@/types';

export function inferInverseRelationship(type: RelationshipType, gender?: 'male' | 'female' | 'other' | 'prefer_not_to_say'): RelationshipType {
  type IntermediateInverse = RelationshipType | 'son/daughter' | 'brother/sister' | 'grandson/granddaughter' | 'nephew/niece';
  const inverseMap: Record<RelationshipType, IntermediateInverse> = {
    father: 'son/daughter' as any,
    mother: 'son/daughter' as any,
    son: 'father',
    daughter: 'father',
    spouse: 'spouse',
    brother: 'brother/sister' as any,
    sister: 'brother/sister' as any,
    grandfather: 'grandson/granddaughter' as any,
    grandmother: 'grandson/granddaughter' as any,
    grandson: 'grandfather',
    granddaughter: 'grandfather',
    uncle: 'nephew/niece' as any,
    aunt: 'nephew/niece' as any,
    nephew: 'uncle',
    niece: 'uncle',
    cousin: 'cousin',
  };

  const inverse = inverseMap[type];

  // Handle gender-dependent relationships
  if (inverse === 'son/daughter') {
    return gender === 'male' ? 'son' : 'daughter';
  }
  if (inverse === 'brother/sister') {
    return gender === 'male' ? 'brother' : 'sister';
  }
  if (inverse === 'grandson/granddaughter') {
    return gender === 'male' ? 'grandson' : 'granddaughter';
  }
  if (inverse === 'nephew/niece') {
    return gender === 'male' ? 'nephew' : 'niece';
  }

  return inverse as RelationshipType;
}

export function resolveRelationshipLabel(type: RelationshipType): string {
  const labels: Record<RelationshipType, string> = {
    father: 'Father',
    mother: 'Mother',
    son: 'Son',
    daughter: 'Daughter',
    spouse: 'Spouse',
    brother: 'Brother',
    sister: 'Sister',
    grandfather: 'Grandfather',
    grandmother: 'Grandmother',
    grandson: 'Grandson',
    granddaughter: 'Granddaughter',
    uncle: 'Uncle',
    aunt: 'Aunt',
    nephew: 'Nephew',
    niece: 'Niece',
    cousin: 'Cousin',
  };

  return labels[type] || type;
}

export function getRelationshipColor(type: RelationshipType): string {
  const colorMap: Record<RelationshipType, string> = {
    father: '#3b82f6',
    mother: '#ec4899',
    son: '#8b5cf6',
    daughter: '#f472b6',
    spouse: '#ef4444',
    brother: '#06b6d4',
    sister: '#06b6d4',
    grandfather: '#3b82f6',
    grandmother: '#ec4899',
    grandson: '#8b5cf6',
    granddaughter: '#f472b6',
    uncle: '#06b6d4',
    aunt: '#06b6d4',
    nephew: '#8b5cf6',
    niece: '#f472b6',
    cousin: '#10b981',
  };

  return colorMap[type] || '#6b7280';
}
