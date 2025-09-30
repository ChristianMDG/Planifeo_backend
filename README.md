npm install @prisma/client bcryptjs cors dotenv express jsonwebtoken multer uuid
npm install -D nodemon prisma


generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}

model User {
  id        String   @id @default(uuid())
  email     String   @unique
  password  String
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
  expenses  Expense[]
  incomes   Income[]
  categories Category[]
  Profile   Profile?
}

model Profile {
  id        String   @id @default(uuid())
  userId    String   @unique
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Category {
  id          String   @id @default(uuid())
  name        String
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  expenses    Expense[]
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Expense {
  id          String   @id @default(uuid())
  amount      Float
  date        DateTime?
  description String?
  type        String   // "one-time" or "recurring"
  startDate   DateTime? // for recurring
  endDate     DateTime? // for recurring
  receipt     String?
  categoryId  String
  category    Category @relation(fields: [categoryId], references: [id], onDelete: Cascade)
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Income {
  id          String   @id @default(uuid())
  amount      Float
  date        DateTime
  source      String?
  description String?
  userId      String
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}