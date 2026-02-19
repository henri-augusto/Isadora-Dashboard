import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  // Create admin user (senha: admin123)
  const passwordHash = await bcrypt.hash('admin123', 10);
  await prisma.user.upsert({
    where: { email: 'admin@isadora.com' },
    update: {},
    create: {
      email: 'admin@isadora.com',
      passwordHash,
    },
  });

  // Create braid styles
  const styleData = [
    {
      name: 'Box Braids',
      description: 'Tranças em caixa, estilo clássico',
      estimatedDuration: 240,
      basePrice: 150,
    },
    {
      name: 'Trança Nagô',
      description: 'Tranças tradicionais nagô',
      estimatedDuration: 180,
      basePrice: 120,
    },
    {
      name: 'Fulani Braids',
      description: 'Tranças fulani com detalhes',
      estimatedDuration: 200,
      basePrice: 140,
    },
    {
      name: 'Ghana Braids',
      description: 'Tranças gana com padrão único',
      estimatedDuration: 220,
      basePrice: 130,
    },
  ];
  for (const s of styleData) {
    await prisma.braidStyle.upsert({
      where: { name: s.name },
      update: {},
      create: s,
    });
  }

  // Create colors
  const colorData = [
    { name: 'Preto', hexCode: '#1a1a1a' },
    { name: 'Castanho', hexCode: '#6B4423' },
    { name: 'Louro', hexCode: '#D4AF37' },
    { name: 'Ruivo', hexCode: '#A0522D' },
    { name: 'Bordô', hexCode: '#722F37' },
    { name: 'Azul', hexCode: '#4169E1' },
    { name: 'Colorido (mistura)', hexCode: '#9370DB' },
  ];
  for (const c of colorData) {
    await prisma.color.upsert({
      where: { name: c.name },
      update: {},
      create: c,
    });
  }

  console.log('Seed concluído com sucesso');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
