import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Hash della password "admin123"
  const hashedPassword = await bcrypt.hash('admin123', 10)

  // Crea utente admin di default
  const admin = await prisma.user.upsert({
    where: { email: 'admin@mdf.local' },
    update: {},
    create: {
      email: 'admin@mdf.local',
      name: 'Admin',
      password: hashedPassword,
    },
  })

  console.log('✅ Database seeded successfully!')
  console.log(`   Admin user: ${admin.email}`)
  console.log(`   Password: admin123`)
  console.log(`   User ID: ${admin.id}`)
  console.log('')
  console.log('🎉 Puoi ora usare l\'applicazione e creare i tuoi dati!')
}

main()
  .then(async () => {
    await prisma.$disconnect()
  })
  .catch(async (e) => {
    console.error('❌ Error seeding database:', e)
    await prisma.$disconnect()
    process.exit(1)
  })
