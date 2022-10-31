import { MongoClient } from "mongodb";

(async () => {
  const mongoUrl = process.env.MONGO_URL;
  if (!mongoUrl) {
    throw new Error("MONGO_URL not set");
  }
  const mongoClient = new MongoClient(mongoUrl);
  await mongoClient.connect();
  const db = mongoClient.db("rym-data");
  await db.dropCollection("artists");
  await db.createCollection("artists", {
    viewOn: "albums",
    pipeline: [
      {
        $unwind: {
          path: "$artists",
        },
      },
      {
        $group: {
          _id: "$artists.fileName",
          name: {
            $last: "$artists.name",
          },
          primaryGenres: {
            $push: "$primaryGenres",
          },
          secondaryGenres: {
            $push: "$secondaryGenres",
          },
          descriptors: {
            $push: "$descriptors",
          },
          albumFileNames: {
            $push: "$fileName",
          },
        },
      },
      {
        $project: {
          _id: 1,
          name: 1,
          fileName: "$_id",
          albumFileNames: 1,
          primaryGenres: {
            $reduce: {
              input: "$primaryGenres",
              initialValue: [],
              in: {
                $setUnion: ["$$value", "$$this"],
              },
            },
          },
          secondaryGenres: {
            $reduce: {
              input: "$secondaryGenres",
              initialValue: [],
              in: {
                $setUnion: ["$$value", "$$this"],
              },
            },
          },
          descriptors: {
            $reduce: {
              input: "$descriptors",
              initialValue: [],
              in: {
                $setUnion: ["$$value", "$$this"],
              },
            },
          },
        },
      },
    ],
  });
  await mongoClient.close();
})();
