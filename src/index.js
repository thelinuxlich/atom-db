import RedisStreamHelper from "redis-stream-helper"

const { listenForMessages, createStreamGroup, addStreamData, addListener } =
  RedisStreamHelper(process.env.REDIS_PORT, process.env.REDIS_HOST)

await createStreamGroup("atom:db:trigger")
await createStreamGroup("atom:db:complete")
addListener("atom:db:trigger")

const run = async () => {
  await listenForMessages(async (key, streamId, data) => {
    data.generatedValue =
      typeof data.generatedValue === "number" ? ++data.generatedValue : 1
    console.log("db executed with data", key, streamId, data)
    addStreamData("atom:db:complete", data)
    // treating only WS for now
    if (data.transport && data.transport === "ws") {
      data.origin = "atom:db:trigger"
      addStreamData("transport:ws:trigger", data)
    }
    if (data.execution && data.process) {
      addStreamData("execution:trigger", {
        process: data.process,
        id: data.execution,
        payload: data.payload + " - " + data.generatedValue,
      })
    }
  })
  run()
}

run()
