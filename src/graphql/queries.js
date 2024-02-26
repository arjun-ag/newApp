/* eslint-disable */
// this is an auto generated file. This will be overwritten

export const getEntry = /* GraphQL */ `
  query GetEntry($date: AWSDate!) {
    getEntry(date: $date) {
      date
      type
      contentType
      mediaLink {
        bucket
        region
        key
        __typename
      }
      text
      titleText
      songName
      artists
      albumLink
      songID
      createdAt
      updatedAt
      owner
      __typename
    }
  }
`;
export const listEntries = /* GraphQL */ `
  query ListEntries(
    $date: AWSDate
    $filter: ModelEntryFilterInput
    $limit: Int
    $nextToken: String
    $sortDirection: ModelSortDirection
  ) {
    listEntries(
      date: $date
      filter: $filter
      limit: $limit
      nextToken: $nextToken
      sortDirection: $sortDirection
    ) {
      items {
        date
        type
        contentType
        text
        titleText
        songName
        artists
        albumLink
        songID
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
export const entryByDate = /* GraphQL */ `
  query EntryByDate(
    $type: String!
    $date: ModelStringKeyConditionInput
    $sortDirection: ModelSortDirection
    $filter: ModelEntryFilterInput
    $limit: Int
    $nextToken: String
  ) {
    entryByDate(
      type: $type
      date: $date
      sortDirection: $sortDirection
      filter: $filter
      limit: $limit
      nextToken: $nextToken
    ) {
      items {
        date
        type
        contentType
        text
        titleText
        songName
        artists
        albumLink
        songID
        createdAt
        updatedAt
        owner
        __typename
      }
      nextToken
      __typename
    }
  }
`;
