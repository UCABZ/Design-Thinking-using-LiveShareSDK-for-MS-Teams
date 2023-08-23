/**
 * Copyright (c) Microsoft Corporation. All rights reserved.
 * Licensed under the Microsoft Live Share SDK License.
 */

import * as Utils from "./utils";
import { View } from "./view";
import { app, pages } from "@microsoft/teams-js";

export class ConfigView extends View {

    constructor() {
        super();

        this.onSavePagesConfig = this.onSavePagesConfig.bind(this);

        const template = `
            <div style="background-color: white; text-align: center; padding: 20px;">
                <h1>Welcome to Storyboarding and Experience-based Roadmap!</h1>
                <h2>Please click the 'save' button to continue</h2>
            </div>
            `;
        Utils.loadTemplate(template, document.body);
    }

    onSavePagesConfig(saveEvent) {
        const host = "https://" + window.location.host;

        return pages.config.setConfig({
            contentUrl: window.location.origin + "?inTeams=1&view=sideBar",
            websiteUrl: window.location.origin,
            suggestedDisplayName: "Storyboarding and Experience-based Roadmap"
        })
        .then(() => {
            saveEvent.notifySuccess();
        });
    }

    async start() {
        if (Utils.runningInTeams()) {
            console.log("Loaded in Teams");
            await app.initialize();
            pages.config.registerOnSaveHandler(this.onSavePagesConfig);
            pages.config.setValidityState(true);
            app.notifySuccess();
        }
    }
}
