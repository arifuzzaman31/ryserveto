const prisma = require("../../lib/db/prisma");
const faker = require("./dataFaker");
const helper = require("../../helper/helper");

seedDatabase()
async function seedDatabase() {
    try {
        const result = await prisma.$transaction(async (prisma) => {

            const amenity = await prisma.amenities.createMany({
                data: faker.amenityFaker
              });
            console.log('total amenity created-'+amenity.count)

            const cuisine = await prisma.cuisine.createMany({
                data: faker.cuisineFaker
              });
              console.log('total Cuisine created-'+cuisine.count)

            const readyHome = await faker.homeDataFaker.map(dt => ({...dt,...{slug:helper.slugify(dt.title)}}));
            const homeData = await prisma.Section.createMany({
                data: readyHome
              });
            console.log('total home Data created-'+homeData.count)

            const ownerData = await prisma.owner.createMany({
                data: faker.ownerFaker
            });
            console.log('total owner created-'+ownerData.count)

            const readyProperty = await faker.listingsFaker.map(dt => ({...dt,...{slug:helper.slugify(dt.listingName)}}));
            const propertyData = await prisma.property.createMany({
                data: readyProperty
            });
            console.log('total property created-'+propertyData.count)

            const readyBranch = await faker.brachFaker.map(dt => ({...dt,...{slug:helper.slugify(dt.branchName)}}));
            const branchData = await prisma.branch.createMany({
                data: readyBranch
            });
            console.log('total branch created-'+branchData.count)

              return {
                amenity,
                cuisine,
                homeData,
                ownerData,
                propertyData,
                branchData
            };
        });
    return result;
  } catch (error) {
    return error.message;
  } finally {
    await prisma.$disconnect();
  }
}