import { PrismaClient, Role, FacilityType } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('password123', 10);

  const pengelola = await prisma.user.upsert({
    where: { Email: 'pengelola@kampus.ac.id' },
    update: {},
    create: {
      Name: 'Admin Pengelola',
      Email: 'pengelola@kampus.ac.id',
      Password: passwordHash,
      Role: Role.PENGELOLA,
    },
  });

  const mahasiswa = await prisma.user.upsert({
    where: { Email: 'mahasiswa@kampus.ac.id' },
    update: {},
    create: {
      Name: 'Budi Santoso',
      Email: 'mahasiswa@kampus.ac.id',
      Password: passwordHash,
      Role: Role.MAHASISWA,
    },
  });

  const buildingsData = [
    { Name: 'Gedung A', Code: 'GD-A', Description: 'Gedung utama fakultas' },
    { Name: 'Gedung B', Code: 'GD-B', Description: 'Gedung laboratorium' },
    { Name: 'Gedung C', Code: 'GD-C', Description: 'Gedung serbaguna' },
  ];

  const buildings = [];
  for (const b of buildingsData) {
    const building = await prisma.building.upsert({
      where: { Code: b.Code },
      update: {},
      create: b,
    });
    buildings.push(building);
  }

  const amenitiesData = [
    { Name: 'Whiteboard', Icon: '📝' },
    { Name: 'AC', Icon: '❄️' },
    { Name: 'Wi-Fi', Icon: '📶' },
    { Name: 'Proyektor', Icon: '📽️' },
    { Name: 'Sound System', Icon: '🔊' },
    { Name: 'Komputer', Icon: '💻' },
    { Name: 'Stop Kontak', Icon: '🔌' },
  ];

  const amenities = [];
  for (const a of amenitiesData) {
    const amenity = await prisma.amenity.upsert({
      where: { Name: a.Name },
      update: {},
      create: a,
    });
    amenities.push(amenity);
  }

  const amenityMap: Record<string, number> = {};
  for (const a of amenities) {
    amenityMap[a.Name] = a.Id;
  }

  const facilitiesData = [
    {
      Name: 'Ruang Diskusi 301',
      BuildingId: buildings[0].Id,
      Type: FacilityType.RUANG_DISKUSI,
      Capacity: 8,
      Floor: 3,
      Description: 'Ruang diskusi kecil dengan whiteboard',
      amenities: ['Whiteboard', 'AC', 'Wi-Fi', 'Stop Kontak'],
    },
    {
      Name: 'Ruang Diskusi 302',
      BuildingId: buildings[0].Id,
      Type: FacilityType.RUANG_DISKUSI,
      Capacity: 6,
      Floor: 3,
      Description: 'Ruang diskusi kecil nyaman',
      amenities: ['Whiteboard', 'AC', 'Wi-Fi'],
    },
    {
      Name: 'Kelas 101',
      BuildingId: buildings[1].Id,
      Type: FacilityType.RUANG_KELAS,
      Capacity: 40,
      Floor: 1,
      Description: 'Ruang kelas besar dengan proyektor',
      amenities: ['Proyektor', 'AC', 'Wi-Fi', 'Sound System'],
    },
    {
      Name: 'Lab Komputer 201',
      BuildingId: buildings[2].Id,
      Type: FacilityType.LABORATORIUM,
      Capacity: 30,
      Floor: 2,
      Description: 'Laboratorium komputer lengkap',
      amenities: ['Komputer', 'AC', 'Wi-Fi', 'Proyektor'],
    },
    {
      Name: 'Aula Utama',
      BuildingId: buildings[0].Id,
      Type: FacilityType.AULA,
      Capacity: 200,
      Floor: 1,
      Description: 'Aula besar untuk acara kampus',
      amenities: ['Proyektor', 'Sound System', 'AC', 'Wi-Fi'],
    },
    {
      Name: 'Ruang Rapat 401',
      BuildingId: buildings[1].Id,
      Type: FacilityType.RUANG_RAPAT,
      Capacity: 12,
      Floor: 4,
      Description: 'Ruang rapat formal',
      amenities: ['Whiteboard', 'Proyektor', 'AC', 'Wi-Fi'],
    },
  ];

  for (const f of facilitiesData) {
    const { amenities: amenityNames, ...facilityData } = f;
    const facility = await prisma.facility.create({ data: facilityData });

    for (const amenityName of amenityNames) {
      await prisma.facilityAmenity.create({
        data: {
          FacilityId: facility.Id,
          AmenityId: amenityMap[amenityName],
        },
      });
    }
  }

  console.log('Seed selesai!');
  console.log(`  Users: ${pengelola.Name}, ${mahasiswa.Name}`);
  console.log(`  Buildings: ${buildings.length}`);
  console.log(`  Amenities: ${amenities.length}`);
  console.log(`  Facilities: ${facilitiesData.length}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
