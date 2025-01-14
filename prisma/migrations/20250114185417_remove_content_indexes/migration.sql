/*
  https://www.prisma.io/docs/orm/prisma-client/queries/full-text-search

  Removing content indexes due to PostgreSQL B-tree index size limitations.

  PostgreSQL has a limitation on the size of index rows in B-tree indexes (maximum 2,704 bytes in version 4).
  When storing large text content, indexing the entire content column can cause the error:
  "index row size exceeds btree version 4 maximum 2704 for index"
  
  Since we're storing large text content in these models, and full-text search isn't a primary use case,
  we're removing these indexes to prevent the size limitation issues.

  Possible Solutions:
  1. Use Full-Text Indexing Instead of B-tree Indexing - PRISMA DOESN'T SUPPORT FULL-TEXT INDEXING YET
  2. Change the Index to Use Hashing:

  model Text {
    ...
    content       String   @db.Text
    contentHash   String   @db.VarChar(32) @default("")

    @@index([contentHash])  // Index the hashed version of the content
  }

  3. Increase the PostgreSQL Page Size (Not Recommended for Large Datasets)

  If you're running into index size limits with large content, you could also consider
  increasing the page_size parameter in PostgreSQL. However, this is a system-level
  change and typically not recommended unless you have a specific reason.

*/

-- DropIndex
DROP INDEX "Game_content_idx";

-- DropIndex
DROP INDEX "Song_content_idx";

-- DropIndex
DROP INDEX "Text_content_idx";
