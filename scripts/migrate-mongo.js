#!/usr/bin/env node
/**
 * One-time migration script: copies all collections from the source MongoDB
 * (old Atlas cluster) to the target MongoDB (new cluster).
 *
 * Usage:
 *   SRC_MONGO_URL="<direct mongodb:// uri to source>" \
 *   TARGET_MONGO_URL="<direct mongodb:// uri to target>" \
 *   node scripts/migrate-mongo.js
 *
 * Safe by default: never drops data on the target. Pass --drop to wipe
 * target collections before copying.
 */
require("dotenv").config();
const { MongoClient } = require("mongodb");

const SRC_URL = process.env.SRC_MONGO_URL || "";
const TARGET_URL = process.env.TARGET_MONGO_URL || "";
const DB_NAME = process.env.MIGRATE_DB || "truelegacy_prod";
const DROP_FIRST = process.argv.includes("--drop");
const BATCH_SIZE = 500;

if (!SRC_URL || !TARGET_URL) {
  console.error(
    "❌ Set SRC_MONGO_URL and TARGET_MONGO_URL (env vars) before running."
  );
  process.exit(1);
}

const SRC = new MongoClient(SRC_URL, {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
});
const TARGET = new MongoClient(TARGET_URL, {
  serverSelectionTimeoutMS: 60000,
  connectTimeoutMS: 60000,
});

async function collectIndexes(db) {
  const result = {};
  const cols = await db.listCollections().toArray();
  for (const col of cols) {
    const indexes = await db.collection(col.name).indexes();
    result[col.name] = indexes.filter((i) => i.name !== "_id_");
  }
  return result;
}

async function copyCollection(srcDb, targetDb, name) {
  const srcCount = await srcDb.collection(name).countDocuments();
  console.log(`→ ${name}: reading ${srcCount} docs`);

  if (srcCount === 0) {
    console.log(`  ${name}: 0 docs, nothing to copy`);
    return { name, src: srcCount, dst: 0 };
  }

  if (DROP_FIRST) {
    await targetDb.collection(name).deleteMany({});
  }

  const cursor = srcDb.collection(name).find({}).batchSize(BATCH_SIZE);
  let copied = 0;
  let buffer = [];

  for await (const doc of cursor) {
    buffer.push(doc);
    if (buffer.length >= BATCH_SIZE) {
      await targetDb.collection(name).insertMany(buffer, { ordered: false });
      copied += buffer.length;
      buffer = [];
    }
  }
  if (buffer.length) {
    await targetDb.collection(name).insertMany(buffer, { ordered: false });
    copied += buffer.length;
  }

  const dstCount = await targetDb.collection(name).countDocuments();
  console.log(`  ${name}: copied ${copied}, target now has ${dstCount}`);
  return { name, src: srcCount, dst: dstCount };
}

async function main() {
  console.log(`Source DB:  ${DB_NAME}  @ ${SRC_URL.split("@")[1] || "(uri)"}`);
  console.log(`Target DB:  ${DB_NAME}  @ ${(TARGET_URL.split("@")[1] || TARGET_URL).replace(/\/.*$/, "")}`);
  console.log(`Drop first: ${DROP_FIRST}`);

  await SRC.connect();
  await TARGET.connect();

  const srcDb = SRC.db(DB_NAME);
  const targetDb = TARGET.db(DB_NAME);

  console.log("Collecting source indexes...");
  const srcIndexes = await collectIndexes(srcDb);

  const summaries = [];
  for (const name of Object.keys(srcIndexes)) {
    summaries.push(await copyCollection(srcDb, targetDb, name));
  }

  console.log("\nRecreating non-default indexes on target...");
  for (const [name, indexes] of Object.entries(srcIndexes)) {
    for (const idx of indexes) {
      try {
        const isText = Object.keys(idx.key).some((k) => k === "_fts");
        if (isText) {
          await targetDb.collection(name).createIndex(
            { $**: "text" },
            { name: idx.name }
          );
        } else {
          await targetDb.collection(name).createIndex(idx.key, {
            name: idx.name,
            unique: Boolean(idx.unique),
            sparse: Boolean(idx.sparse),
          });
        }
        console.log(`  ✓ ${name}.${idx.name}`);
      } catch (err) {
        console.error(`  ✗ ${name}.${idx.name}: ${err.message}`);
      }
    }
  }

  console.log("\nSummary:");
  for (const s of summaries) {
    const ok = s.src === s.dst;
    console.log(`  ${ok ? "✅" : "⚠️ "} ${s.name}: ${s.src} → ${s.dst}`);
  }

  await SRC.close();
  await TARGET.close();
  console.log("\nDone.");
}

main().catch((err) => {
  console.error("Migration failed:", err);
  process.exit(1);
});