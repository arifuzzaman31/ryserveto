const { PrismaClient } = require("../../prisma/generated/prisma-client-js");

let prisma;

if (!global.prisma) {
  global.prisma = new PrismaClient();
}
prisma = global.prisma;
module.exports = prisma;