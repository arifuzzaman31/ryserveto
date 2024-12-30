const prisma = require("../../lib/db/prisma");
const faker = require("./dataFaker");
const helper = require("../../helper/helper");

async function seedDatabase() {
  try {
    const readyHome = faker.homeDataFaker.map((dt) => ({
      ...dt,
      slug: helper.slugify(dt.title),
    }));
    const readyBranch = faker.brachFaker.map((dt) => ({
      ...dt,
      slug: helper.slugify(dt.branchName),
    }));
    const readyProperty = faker.listingsFaker.map((dt) => ({
      ...dt,
      slug: helper.slugify(dt.listingName),
    }));
    const readyFood = readyProperty.map((element, Index) => {
      return faker.foodFaker.map((dt) => ({ ...dt, propertyId: Index + 1 }));
    });
    const readyTable = readyBranch.map((element, Index) => {
      return faker.tableFaker.map((dt) => ({ ...dt, propertyId:element.propertyId,branchId: Index + 1}));
    });
    const readyEvent = faker.eventFaker.map((dt) => ({
      ...dt,
      slug: helper.slugify(dt.evtName),
    }));
    
    const result = await prisma.$transaction([
      // prisma.owner.createMany({ data: faker.ownerFaker }),
      // prisma.amenities.createMany({ data: faker.amenityFaker }),
      // prisma.cuisine.createMany({ data: faker.cuisineFaker }),
      // prisma.Section.createMany({ data: readyHome }),
      // prisma.property.createMany({ data: readyProperty }),
      // prisma.FoodCategory.createMany({ data: faker.categoryFaker }),
      // prisma.branch.createMany({ data: readyBranch }),
      // ...readyFood.map((v) => prisma.Food.createMany({ data: v })),
      // ...readyTable.map((v) => prisma.Table.createMany({ data: v })),
      prisma.Events.createMany({ data: readyEvent }),
    ]);
    return result;
  } catch (error) {
    console.error("Error database seeding:", error);
    return error.message;
  } finally {
    await prisma.$disconnect();
  }
}

seedDatabase();
