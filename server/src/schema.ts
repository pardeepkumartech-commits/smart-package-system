export const typeDefs = `#graphql
  enum Role { AGENT CUSTOMER }
  enum Size { SMALL MEDIUM LARGE }
  enum LockerStatus { AVAILABLE OCCUPIED }
  enum PackageStatus { STORED RETRIEVED }

  type User {
    id: ID!
    email: String!
    name: String!
    role: Role!
  }

  type Session {
    token: String!
    user: User!
  }

  type Package {
    id: ID!
    trackingNumber: String!
    customerName: String!
    size: Size!
    pickupCode: String
    locker: Locker!
    storedAt: String!
    retrievedAt: String
    daysStored: Int!
    estimatedCharge: Int!
    storageCharge: Int
    status: PackageStatus!
  }

  type Locker {
    id: ID!
    code: String!
    size: Size!
    status: LockerStatus!
    package: Package
  }

  type ChargeTier {
    label: String!
    days: Int!
    rate: Int!
    amount: Int!
  }

  type StoreResult {
    package: Package!
    locker: Locker!
    pickupCode: String!
  }

  type RetrieveResult {
    package: Package!
    locker: Locker!
    daysStored: Int!
    storageCharge: Int!
    breakdown: [ChargeTier!]!
  }

  type StationStats {
    total: Int!
    available: Int!
    occupied: Int!
    smallAvailable: Int!
    mediumAvailable: Int!
    largeAvailable: Int!
  }

  type Query {
    me: User
    lockers: [Locker!]!
    packages: [Package!]!
    stationStats: StationStats!
  }

  type Mutation {
    login(email: String!, password: String!): Session!
    createLocker(size: Size!): Locker!
    storePackage(customerName: String!, size: Size!): StoreResult!
    retrievePackage(lockerCode: String!, pickupCode: String!): RetrieveResult!
  }
`;
