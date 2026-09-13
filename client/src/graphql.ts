import { gql } from "@apollo/client";

const LOCKER_FIELDS = gql`
  fragment LockerFields on Locker {
    id
    code
    size
    status
    package {
      id
      trackingNumber
      customerName
      size
      pickupCode
      storedAt
      daysStored
      estimatedCharge
    }
  }
`;

export const LOGIN = gql`
  mutation Login($email: String!, $password: String!) {
    login(email: $email, password: $password) {
      token
      user { id email name role }
    }
  }
`;

export const LOCKERS = gql`
  ${LOCKER_FIELDS}
  query Lockers {
    stationStats {
      total
      available
      occupied
      smallAvailable
      mediumAvailable
      largeAvailable
    }
    lockers { ...LockerFields }
  }
`;

export const PACKAGES = gql`
  query Packages {
    packages {
      id
      trackingNumber
      customerName
      size
      pickupCode
      storedAt
      retrievedAt
      daysStored
      estimatedCharge
      storageCharge
      status
      locker { code size }
    }
  }
`;

export const STORE = gql`
  mutation Store($customerName: String!, $size: Size!) {
    storePackage(customerName: $customerName, size: $size) {
      pickupCode
      locker { code size }
      package { trackingNumber customerName }
    }
  }
`;

export const CREATE_LOCKER = gql`
  mutation CreateLocker($size: Size!) {
    createLocker(size: $size) { id code size status }
  }
`;

export const RETRIEVE = gql`
  mutation Retrieve($lockerCode: String!, $pickupCode: String!) {
    retrievePackage(lockerCode: $lockerCode, pickupCode: $pickupCode) {
      daysStored
      storageCharge
      locker { code }
      package { trackingNumber customerName }
      breakdown { label days rate amount }
    }
  }
`;
