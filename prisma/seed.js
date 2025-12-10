const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Seeding database...');

  // Hapus data existing
  await prisma.photo.deleteMany();
  await prisma.post.deleteMany();
  await prisma.user.deleteMany();

  // Buat 10 users
  const users = [];
  for (let i = 1; i <= 10; i++) {
    const user = await prisma.user.create({
      data: {
        name: `User ${i}`,
        email: `user${i}@example.com`,
        age: 20 + i,
        bio: `Ini adalah bio dari user ${i}. User ini sangat bersemangat dalam mengembangkan aplikasi.`
      }
    });
    users.push(user);
    console.log(`✅ User created: ${user.name}`);
  }

  // Buat 20 posts (2 per user)
  const posts = [];
  for (let i = 1; i <= 20; i++) {
    const userId = users[Math.floor(Math.random() * users.length)].id;
    const post = await prisma.post.create({
      data: {
        title: `Post Title ${i}`,
        content: `This is the content of post ${i}. Lorem ipsum dolor sit amet, consectetur adipiscing elit.`,
        published: i % 2 === 0,
        userId: userId
      }
    });
    posts.push(post);
    console.log(`✅ Post created: ${post.title}`);
  }

  // Buat 30 photos (dummy path untuk seed)
  for (let i = 1; i <= 30; i++) {
    const userId = i <= 20 ? users[Math.floor(Math.random() * users.length)].id : null;
    const postId = i <= 15 ? posts[Math.floor(Math.random() * posts.length)].id : null;
    
    await prisma.photo.create({
      data: {
        filename: `photo-${i}.jpg`,
        path: `uploads/seed-photo-${i}.jpg`,
        url: `http://localhost:3000/uploads/seed-photo-${i}.jpg`,
        size: 1024 * (100 + i),
        mimeType: 'image/jpeg',
        userId: userId,
        postId: postId
      }
    });
    console.log(`✅ Photo ${i} created`);
  }

  console.log('🎉 Seeding completed!');
  console.log(`📊 Created: ${users.length} users, ${posts.length} posts, 30 photos`);
}

main()
  .catch((e) => {
    console.error('❌ Error seeding:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });