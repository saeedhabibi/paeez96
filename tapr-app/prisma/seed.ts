// prisma/seed.ts
import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create demo user
  const hashedPassword = await bcrypt.hash('password123', 10)
  const user = await prisma.user.upsert({
    where: { email: 'nessa@tapr.app' },
    update: {},
    create: {
      email: 'nessa@tapr.app',
      name: 'Nessa Verve',
      password: hashedPassword,
    },
  })
  console.log('✅ User created:', user.email)

  // Create Copper Head venue
  const venue = await prisma.venue.upsert({
    where: { slug: 'copper-head-beer-workshop' },
    update: {},
    create: {
      name: 'Copper Head. Beer Workshop',
      slug: 'copper-head-beer-workshop',
      category: ['Bar', 'Brewery', 'Gastropub'],
      phone: '+1 416-928-0018',
      address: '17 St Nicholas St',
      city: 'Toronto, ON M4Y 3G4, Canada',
      lat: 43.6665,
      lng: -79.3864,
      openTime: '12:00',
      closeTime: '00:00',
      bio: 'Relaxed, family-owned venue doling out pub grub & local brews plus brunch & open-mike nights. A beloved Toronto institution since 2009 with over 40 craft beers on tap.',
      logoText: 'CH',
    },
  })
  console.log('✅ Venue created:', venue.name)

  // Create menu items
  const menuItems = [
    {
      name: 'Bruschetta Feta',
      description: 'With tomatoes, basil and cottage feta',
      price: 11.0,
      category: 'Starter',
      weight: '100g',
    },
    {
      name: 'Mushroom Soup',
      description: 'Creamy wild mushroom with truffle oil and sourdough',
      price: 9.5,
      category: 'Starter',
      weight: '250ml',
    },
    {
      name: 'Fish & Chips',
      description: 'Beer-battered cod with thick-cut fries and tartar sauce',
      price: 18.0,
      category: 'Main',
      weight: '350g',
    },
    {
      name: 'Copper Burger',
      description: 'House-made patty, cheddar, pickles, house sauce, brioche bun',
      price: 16.5,
      category: 'Main',
      weight: '300g',
    },
    {
      name: 'Vice City',
      description: 'Pisco, Lemon, Melon syrup, Pear liquor, Sugar, Cardamon bitter',
      price: 12.99,
      category: 'Cocktail',
    },
    {
      name: 'Spiced Orange Cake',
      description: 'Gold Rum, Aperol, Cointreau, Orange, Lemon, Sugar, Cinnamon',
      price: 10.95,
      category: 'Cocktail',
    },
    {
      name: 'Copper Head IPA',
      description: 'House-brewed India Pale Ale, 6.2% ABV, citrus and pine notes',
      price: 8.0,
      category: 'Beer',
      weight: '473ml',
    },
    {
      name: 'Sparkling Ginger Lemonade',
      description: 'Fresh ginger, lemon, honey, sparkling water',
      price: 6.5,
      category: 'Non-alcoholic',
      weight: '350ml',
    },
  ]

  for (const item of menuItems) {
    await prisma.menuItem.upsert({
      where: {
        id: `${venue.id}-${item.name.toLowerCase().replace(/\s+/g, '-')}`,
      },
      update: {},
      create: { venueId: venue.id, ...item } as any,
    })
  }
  console.log('✅ Menu items created:', menuItems.length)

  // Create staff
  const staffMembers = [
    { name: 'Nessa Verve', role: 'Head Server', rating: 4.9 },
    { name: 'James Miller', role: 'Bartender', rating: 4.8 },
    { name: 'Sophie Chen', role: 'Server', rating: 4.7 },
  ]

  for (const member of staffMembers) {
    await prisma.staff.upsert({
      where: { id: `${venue.id}-${member.name.toLowerCase().replace(/\s+/g, '-')}` },
      update: {},
      create: { venueId: venue.id, ...member } as any,
    })
  }
  console.log('✅ Staff created:', staffMembers.length)

  // Create a visit for the demo user
  await prisma.visit.create({
    data: { userId: user.id, venueId: venue.id },
  })
  console.log('✅ Visit created')

  console.log('\n🎉 Seed complete!')
  console.log('📧 Login: nessa@tapr.app / password123')
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
