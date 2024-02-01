import { toast } from "react-toastify";

export interface IScript {
    name: string;
    scriptText: string;
    metricName: string;
}

export interface ICounters {
    counters: string[];
}

export interface IProvider {
    name: string;
    data: {
        id: number;
        counter: number;
        timestamp: number;
        [key: string]: number;
    }[];
    isCustom?: boolean;
}
export interface IProviders {
    nextUpdateTime: number;
    providers: IProvider[];
}

export type IMutableProvider = Record<string, {
    path: string;
    key: string;
    value: number;
    counter: number;
    timestamp: number;
    isCustom?: boolean;
}[]>;

export interface IProviderAggregate {
    data: {
        max: number;
        min: number;
        avg: number;
        total: number;
        count: number;
    };
}

export class Application {
    private static baseURL = `http://${process.env.NEXT_PUBLIC_ADDRESS}:8080`;

    /**
     * Given a `url`, this function will check for connectivity
     * to the address.
     *
     * @param url URL of server to check for connectivity.
     * @returns Boolean indicating success or failure.
     */
    private async checkHealth(url: string): Promise<boolean> {
        try {
            const resp = await fetch(`${url}/api/health`)

            if (!resp.ok) {
                return false;
            }

            return true;
        } catch (e: any) {
            console.log("Failed to check health!", e);
            return false;
        }
    }

    async initialize(): Promise<boolean> {
        try {
            // Get last known good configuration. If there is no saved configuration,
            // we will use the default port `8080`.
            const savedPort = global.localStorage.getItem('Application.port') || '8080';
            const appUrl = `http://${process.env.NEXT_PUBLIC_ADDRESS}:${savedPort}`;
            const isValid = await this.checkHealth(appUrl);
            if (!isValid) {
                return false;
            }

            // Port is valid, so we can continue with the port found.
            Application.baseURL = appUrl;
            return true;
        } catch (e: any) {
            return false;
        }
    }

    async setBaseURL(port: number): Promise<boolean> {
        try {
            // We will only edit the ports. The application is designed to work
            // only on the local machine.
            // First step is to test the port.
            const isValid = await this.checkHealth(`http://${process.env.NEXT_PUBLIC_ADDRESS}:${port}`);
            if (!isValid) {
                return false;
            }

            global.localStorage.setItem('Application.port', port.toString());
            return true;
        } catch (e: any) {
            return false;
        }
    }

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

    async UpdateScript(script: IScript): Promise<void> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/script/patch`, {
                method: 'PATCH',
                body: JSON.stringify(script),
                headers: { "Content-Type": "application/json" }
            })

            if (!resp.ok) {
                throw new Error(await resp.text())
            }
        } catch (e: any) {
            toast(e?.message || "Failed to update script", {
                type: 'error'
            })
            throw e;
        }
    }

    //#region Data information
    async getAvailableMetrics(): Promise<ICounters> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/counters`)

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return await resp.json();
        } catch (e: any) {
            toast(e?.message || "Failed to get providers", {
                type: 'error'
            })
            throw e;
        }
    }

    /**
     * This will retrieve all providers for the application, including the
     * custom providers created using JavaScript.
     */
    async getProviders(): Promise<IProviders> {
        try {
            const resp = await fetch(`${Application.baseURL}/api/providers/40`)

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return await resp.json();
        } catch (e: any) {
            toast(e?.message || "Failed to get providers", {
                type: 'error'
            })
            throw e;
        }
    }

    async getProviderAggregate(params: Record<string, any>): Promise<IProviderAggregate> {
        try {
            const url = new URL(`${Application.baseURL}/api/provider/aggregate?` + new URLSearchParams(params).toString());
            const resp = await fetch(url);

            if (!resp.ok) {
                throw new Error(await resp.text())
            }

            return await resp.json();
        } catch (e: any) {
            toast(e?.message || "Failed to get aggregate", {
                type: 'error'
            })
            throw e;
        }
    }
    //#endregion
}