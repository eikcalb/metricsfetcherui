import { toast } from "react-toastify";

export interface IScript {
    name: string;
    scriptText: string;
    metricName: string;
}

export class Application {
    private static baseURL = process.env.NEXT_PUBLIC_URL;

    async deleteScript(script: IScript): Promise<void> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/script/delete/${script.name}`, {
                method: 'DELETE',
            })

            if (!resp.ok) {
                throw new Error(await resp.text())
            }
        } catch (e: any) {
            toast(e?.message || "Failed to delete script", {
                type: 'error'
            })
            throw e;
        }
    }

    async getConfig(): Promise<string> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/config`)

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return await resp.text();
        } catch (e: any) {
            toast(e?.message || "Failed to get configuration", {
                type: 'error'
            })
            throw e;
        }
    }

    async getScripts(): Promise<IScript[]> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/script`)

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return (await resp.json())['scripts'];
        } catch (e: any) {
            toast(e?.message || "Failed to get scripts", {
                type: 'error'
            })
            throw e;
        }
    }

    async saveConfig(config: string): Promise<string> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/config/save`, {
                method: 'PUT',
                body: config,
                headers: { "Content-Type": "application/json" }
            })

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return await resp.text();
        } catch (e: any) {
            toast(e?.message || "Failed to save configuration", {
                type: 'error'
            })
            throw e;
        }
    }

   async saveScript(script: IScript): Promise<void> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/script/save`, {
                method: 'POST',
                body: JSON.stringify(script),
                headers: { "Content-Type": "application/json" }
            })

            if (!resp.ok) {
                throw new Error(await resp.text())
            }
        } catch (e: any) {
            toast(e?.message || "Failed to save script", {
                type: 'error'
            })
            throw e;
        }
    }
}