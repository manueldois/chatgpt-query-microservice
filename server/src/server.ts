import 'dotenv/config'
import { createApp } from "./app";
import { DependenciesContainer } from './container';

export async function createServer(injectedContainer?: DependenciesContainer) {
    const app = await createApp(injectedContainer)

    return app.listen(
        3000,
        () => {
            console.log(`Server listening on port 3000`)
        }
    )
}

createServer()