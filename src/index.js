import RedisStreamHelper from "redis-stream-helper"
import { enrichStandardFields } from "atom-helper"

const { listenForMessages, createStreamGroup, addStreamData, addListener } =
  RedisStreamHelper(process.env.REDIS_PORT, process.env.REDIS_HOST)

await createStreamGroup("atom:db:trigger")
await createStreamGroup("atom:db:complete")
addListener("atom:db:trigger")

const run = async () => {
  await listenForMessages(async (key, streamId, data) => {
    enrichStandardFields("db", data, addStreamData)
    console.log("db executed with data", key, streamId, data)
  })
  run()
}

run()
