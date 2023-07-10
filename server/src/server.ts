import 'dotenv/config'
import { createApp } from "./app";

export async function createServer() {
    const app = await createApp()

    return app.listen(
        3000,
        () => {
            console.log(`Server listening on port 3000`)
        }
    )
}

createServer()