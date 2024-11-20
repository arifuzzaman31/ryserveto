const prisma = require("../../lib/db/prisma");
const faker = require("./dataFaker");
const helper = require("../../helper/helper");

async function seedDatabase() {
    try {
      const readyHome = faker.homeDataFaker.map(dt => ({ ...dt, slug: helper.slugify(dt.title) }));
      const readyBranch = faker.brachFaker.map(dt => ({ ...dt, slug: helper.slugify(dt.branchName) }));
      const readyProperty = faker.listingsFaker.map(dt => ({ ...dt, slug: helper.slugify(dt.listingName) }));
      const result = await prisma.$transaction([
        prisma.amenities.createMany({data: faker.amenityFaker}),
        prisma.cuisine.createMany({data: faker.cuisineFaker}),
        prisma.Section.createMany({data: readyHome}),
        prisma.owner.createMany({data: faker.ownerFaker}),
        prisma.property.createMany({data: readyProperty}),
        prisma.branch.createMany({data: readyBranch})
      ]);
      return result;  
    } catch (error) {
        console.error('Error database seeding:', error);
        return error.message;
    } finally {
        await prisma.$disconnect();
    }
}

seedDatabase();