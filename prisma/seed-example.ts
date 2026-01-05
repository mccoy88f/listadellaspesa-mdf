import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database with example data...')

  // Crea utenti di esempio
  const user1 = await prisma.user.create({
    data: {
      email: 'mario.rossi@example.com',
      name: 'Mario Rossi',
      posts: {
        create: [
          {
            title: 'Il mio primo post',
            content: 'Questo è il contenuto del mio primo post su questo blog!',
            published: true,
          },
          {
            title: 'Post in bozza',
            content: 'Questo post è ancora in fase di scrittura...',
            published: false,
          },
        ],
      },
    },
  })

  const user2 = await prisma.user.create({
    data: {
      email: 'lucia.verdi@example.com',
      name: 'Lucia Verdi',
      posts: {
        create: [
          {
            title: 'Benvenuti nel mio blog',
            content: 'Ciao a tutti! Sono felice di iniziare questa avventura.',
            published: true,
          },
        ],
      },
    },
  })

  const user3 = await prisma.user.create({
    data: {
      email: 'paolo.bianchi@example.com',
      name: 'Paolo Bianchi',
    },
  })

  console.log('✅ Database seeded with example data!')
  console.log(`   Created users: ${user1.name}, ${user2.name}, ${user3.name}`)
  console.log(`   Created 3 posts`)
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
