export type Room = {
  id: number;
  name: string;
  type: 'Diskusi' | 'Belajar' | 'Kelas';
  building: string;
  floor: string;
  capacity: number;
  amenities: string[];
  color: string;
  mark: string;
};

export const rooms: Room[] = [
  { id: 1, name: 'Ruang Diskusi 302', type: 'Diskusi', building: 'Gedung A', floor: 'Lantai 3', capacity: 8, amenities: ['Whiteboard', 'Wi-Fi', 'AC'], color: '#e9e4d6', mark: '▦' },
  { id: 2, name: 'Ruang Belajar Fokus', type: 'Belajar', building: 'Gedung B', floor: 'Lantai 2', capacity: 4, amenities: ['Monitor', 'Wi-Fi', 'AC'], color: '#dce9d9', mark: '▤' },
  { id: 3, name: 'Kelas Kolaborasi 105', type: 'Kelas', building: 'Gedung C', floor: 'Lantai 1', capacity: 24, amenities: ['Proyektor', 'Whiteboard', 'AC'], color: '#dce6ea', mark: '▥' },
  { id: 4, name: 'Ruang Kreatif', type: 'Diskusi', building: 'Gedung A', floor: 'Lantai 4', capacity: 6, amenities: ['Whiteboard', 'Wi-Fi', 'AC'], color: '#eee0e0', mark: '✳' },
];
